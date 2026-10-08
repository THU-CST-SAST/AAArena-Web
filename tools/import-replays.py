#!/usr/bin/env python3
"""Import completed exhibition games; verify raw hashes and referee terminal states.

Usage: python tools/import-replays.py BUNDLE_JSON AA_ARENA_CHECKOUT
The bundle contains sanitized match records and gzip/base64 raw replays, not policies.
SnakeGo is reconstructed with the pinned backend; every processed event is checked.
Other formats already contain authoritative snapshots/deltas. No moves are simulated.
"""
import base64
import dataclasses
import gzip
import hashlib
import io
import json
from pathlib import Path
import random
import re
import subprocess
import sys
import zipfile


def normalized(value):
    return json.loads(json.dumps(value, default=dataclasses.asdict))


def snakego(raw, source):
    sys.path.insert(0, str(source / 'games/snakego/backend/logic/gamecode_logic'))
    from logic.infrastructure import Context, Operation, Snake
    from logic.spawn import GameConfig, Item
    from logic.operate import Controller
    from logic.result import settle_round
    from logic.constants import ITEM_EXPIRE_TIME
    data = json.loads(raw)
    cfg = GameConfig(**{k: v for k, v in data['game_config'].items() if k != 'random_seed'})
    cfg.random_seed = data['game_config']['random_seed']
    random.seed(cfg.random_seed)
    Snake.snake_num = Item.item_num = 0
    ctx = Context(cfg)
    assert [{k: getattr(i, k) for k in ('x', 'y', 'time', 'type', 'param')}
            for i in ctx.game_map.item_list] == data['item_list'], 'Item generation differs'
    ctl = Controller(ctx)
    ctx.turn = 1

    def snapshot(round_no):
        m = ctx.game_map
        return dict(round=round_no, scores=settle_round(ctx)[1],
                    board=[''.join(str(m.wall_map[x][y]) if m.wall_map[x][y] >= 0 else '.'
                                   for x in range(cfg.length)) for y in range(cfg.width)],
                    units=[dict(id=s.id, owner=s.camp, body=list(s.coor_list),
                                x=s.coor_list[0][0], y=s.coor_list[0][1], kind='snake')
                           for s in ctx.snake_list],
                    items=[dict(x=i.x, y=i.y, kind='fire' if i.type == 2 else 'food')
                           for i in m.item_list if i.time <= ctx.turn and m.item_map[i.x][i.y] == i.id])

    frames = [snapshot(0)]
    assert len(data['operations']) == 2 * len(data['round_info'])
    for turn, ri in enumerate(data['round_info']):
        assert normalized(ctl.round_preprocess(ITEM_EXPIRE_TIME)) == ri
        for seat in range(2):
            ctl.round_init()
            for event in data['operations'][2 * turn + seat]:
                basic = dict(event['basic'])
                # History stores the processed type; apply expects wire types 1..6.
                basic['type'] = basic['direction'] + 1 if basic['type'] == 1 else basic['type'] + 3
                assert normalized(ctl.apply(Operation(**basic))) == event, (turn, seat)
            frames.append(snapshot(turn + 1))
            ctl.next_player()
    end = data['end_info']
    assert end['type'] == 'NORMAL' and end['err'] is None
    assert settle_round(ctx)[1] == end['score'] == frames[-1]['scores']
    assert end['winner'] == (0 if end['score'][0] >= end['score'][1] else 1)
    return dict(width=cfg.length, height=cfg.width, frames=frames, winner=end['winner'], fps=20)


def pacman(raw, source):
    d = json.loads(raw)
    board = [list(row) for row in d['initial_map'].splitlines()]
    frames, mines = [], set()
    for turn, f in enumerate(d['breadcrumbs']):
        for x, y, tile in f['map']:
            board[y][x] = tile
        for xy in f['mines']:
            pair = tuple(xy)
            mines.symmetric_difference_update([pair])
        units = [dict(id=u[0], owner=u[0], x=u[1], y=u[2], kind='player' if u[0] >= 0 else 'ghost')
                 for u in f['creatures'] if u[0] >= 0 or u[3] == 1]
        frames.append(dict(round=turn, scores=f['scores'], board=[''.join(row) for row in board],
                           units=units, items=[dict(x=x, y=y, kind='trap') for x, y in sorted(mines)]))
    winner = {1: 0, -1: 1, 0: None}[d['result']]
    assert winner == (0 if frames[-1]['scores'][0] > frames[-1]['scores'][1] else 1
                      if frames[-1]['scores'][1] > frames[-1]['scores'][0] else None)
    return dict(width=len(board[0]), height=len(board), frames=frames, winner=winner, fps=12)


def monecraft(raw, source):
    d = json.loads(raw)
    w, h, terrain = (d['map'][k] for k in ('width', 'height', 'terrain'))
    board = [''.join(terrain[x*h+y] for x in range(w)) for y in range(h)]
    mines = {m['id']: m for m in d['init-mines']}

    def snapshot(r, players, state, golds, observers=()):
        units = [dict(id=p['id'], x=p['x'], y=p['y'], owner=p['id'], kind='player') for p in players]
        units += [dict(id=p['id'], x=p['x'], y=p['y'], owner=p['owner'], kind='observer') for p in observers]
        return dict(round=r, scores=golds, units=units,
                    items=[dict(x=mines[m['id']]['x'], y=mines[m['id']]['y'], owner=m['owner'], kind='mine') for m in state])
    frames = [snapshot(0, d['init-players'], d['init-mines'], [0, 0])]
    for f in d['rounds-info']:
        golds = [0, 0]
        for p in f['ginfo']:
            golds[p['id']] = p['golds']
        frames.append(snapshot(f['rounds']+1, f['players'], f['mines'], golds, f['OB']))
    assert d['result']['type'] == 'normal'
    winner = d['result']['winner']
    assert frames[-1]['scores'][winner] >= frames[-1]['scores'][1-winner]
    return dict(width=w, height=h, board=board, frames=frames, winner=winner, fps=20)


def dorado(raw, source):
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        s = z.read('replay.txt').decode()
    heights = list(map(int, (source / 'games/dorado/backend/map.txt').read_text().split()))
    assert len(heights) == 150 * 150
    # Preserve exact elevation values; characters are compact integer encoding.
    board = [''.join(chr(65+heights[x*150+y]) for x in range(150)) for y in range(150)]
    chunks = re.split(r'^Round:(\d+)\s*$', s, flags=re.M)
    frames = []
    for round_no, chunk in zip(chunks[1::2], chunks[2::2]):
        units, items, scores = [], [], [None, None]
        for line in chunk.splitlines():
            if not line.startswith('{type:Unit;'):
                continue
            ident = re.search(r'id:(\d+);camp:(\d+);player:\d+;name:(\w+);', line)
            position = re.search(r';pos:\{(-?[\d.]+);(-?[\d.]+)\}', line)
            assert ident and position
            uid, owner, name = ident.groups()
            args = line.split(';args:{', 1)[1].split(';skills:', 1)[0]
            def number(key, default=0):
                found = re.search(r'(?:^|[;{])'+key+r':(-?[\d.]+)', args)
                return float(found[1]) if found else default
            u = dict(id=int(uid), owner=int(owner), x=float(position[1]), y=float(position[2]),
                     kind='base' if name == 'MilitaryBase' else 'hero', name=name,
                     hp=number('hp'), maxHp=number('maxHp'))
            if name == 'Mine':
                if number('existTime') > 0:
                    items.append(dict(x=u['x'], y=u['y'], kind='mine'))
            elif name == 'MilitaryBase':
                units.append(u)
                scores[u['owner']] = max(0, int(u['hp']))
            elif re.search(r';finalStatus:(\d+)', line)[1] == '0':
                if name == 'Observer':
                    u['kind'] = 'observer'
                units.append(u)
        assert None not in scores
        frames.append(dict(round=int(round_no), scores=scores, units=units, items=items))
    winner = int(re.search(r'^winner:(\d+)', s, re.M)[1])
    assert frames[-1]['scores'][1-winner] == 0 and frames[-1]['scores'][winner] > 0
    return dict(width=150, height=150, board=board, frames=frames, winner=winner, fps=10)


def main():
    bundle = json.loads(Path(sys.argv[1]).read_text())
    source = Path(sys.argv[2]).resolve()
    output = Path(__file__).resolve().parents[1] / 'assets/replays'
    output.mkdir(parents=True, exist_ok=True)
    replay_data = {}
    titles = dict(snakego='SnakeGo', pacman='Pacman', monecraft='MoneCraft', dorado='Dorado')
    assert set(bundle) == set(titles), 'Expected the four exhibition games'
    source_commit = subprocess.check_output(['git', '-C', str(source), 'rev-parse', 'HEAD'], text=True).strip()
    labels = dict(snakego=dict(en='Territory points', zh='占地得分'),
                  pacman=dict(en='Collected points', zh='得分'),
                  monecraft=dict(en='Gold', zh='金币'),
                  dorado=dict(en='Base HP · destroy the enemy base to win', zh='基地生命值 · 摧毁对方基地获胜'))
    for game, entry in bundle.items():
        record = entry['record']
        assert source_commit == record['source_commit'], 'Use the pinned runtime checkout'
        assert len(entry['raw']) == len(record['matches']) == 2, 'Both seat assignments are required'
        proof = {**record, 'purpose': 'New exhibition matches, not original paper evaluation matches',
                 'selection': 'Highest main-table AI Elo versus rank 1 of the frozen human pool; both seats, seed 42',
                 'visualization': 'Recorded full-information states, simplified 2D rendering; no generated moves',
                 'matches': []}
        variants = []
        for seat, (raw_entry, match) in enumerate(zip(entry['raw'], record['matches'])):
            assert match['status'] == 'complete' and match['diagnostic'] is None and match['ai_seat'] == seat
            raw = gzip.decompress(base64.b64decode(raw_entry['gzip_base64']))
            assert hashlib.sha256(raw).hexdigest() == raw_entry['sha256']
            r = globals()[game](raw, source)
            assert match['winner'] == f"P{r['winner']}", (game, seat, r['winner'], match['winner'])
            path = output / f"{game}-ai-p{seat}{raw_entry['suffix']}"
            path.write_bytes(raw)
            variants.append(dict(**r, aiSeat=seat, finalScores=r['frames'][-1]['scores'], rawReplay='assets/replays/'+path.name))
            proof['matches'].append(dict(**match, raw_sha256=raw_entry['sha256'], raw_file=path.name,
                                         display_final_scores=r['frames'][-1]['scores'], state_count=len(r['frames']),
                                         terminal_verified=True))
            print(game, 'AI P'+str(seat), 'frames', len(r['frames']), 'scores', r['frames'][-1]['scores'], 'winner', r['winner'])
        provenance = output / f'{game}-provenance.json'
        provenance.write_text(json.dumps(proof, indent=2)+'\n')
        replay_data[game] = dict(game=game, title=titles[game], model={'opus-5.5':'Opus5.5','gpt-6-sol':'GPT6-sol'}[record['model']],
                                 human=record['human'], ai=record['ai'], sourceCommit=record['source_commit'], seed=record['seed'],
                                 scoreLabel=labels[game], provenance='assets/replays/'+provenance.name,
                                 variants=variants)
    target = output / 'replay-data.js'
    target.write_text('/* Generated from verified referee replays; see tools/import-replays.py. */\nwindow.ARENA_REPLAYS='+json.dumps(replay_data, separators=(',', ':'))+';\nObject.values(window.ARENA_REPLAYS).forEach(r=>Object.assign(r,r.variants[0]));\n')
    print('Wrote', target, target.stat().st_size, 'bytes')


if __name__ == '__main__':
    main()
