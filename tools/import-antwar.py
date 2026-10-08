#!/usr/bin/env python3
"""Import two AntWar exhibitions from a sanitized remote export, not simulated play.

Usage: python tools/import-antwar.py /tmp/antwar-bundle.json
The bundle includes raw replays and the exact backend map.cpp used for these games.
Tower records are deltas: retain unchanged towers and remove type -1 demolitions.
"""
import base64
import gzip
import hashlib
import json
from pathlib import Path
import re
import sys


def terrain(source):
    board = [[' ']*19 for _ in range(19)]
    for y in range(19):
        distance = abs(y-9)
        for x in range(distance//2, distance//2+19-distance):
            board[y][x] = '.'
    blocks = re.findall(r'(?:valid_blocks|tower_blocks)\s*=\s*\{(.*?)\};', source, re.S)
    assert len(blocks) == 3
    for cells, tile in zip(blocks, ['#', '0', '1']):
        for x, y in re.findall(r'\{\s*(\d+)\s*,\s*(\d+)\s*\}', cells):
            board[int(y)][int(x)] = tile
    return [''.join(row) for row in board]


def decode(raw):
    records = json.loads(raw)
    # This evaluator uses a fixed backend seed; request seed 42 names artifacts only.
    assert records[0]['seed'] == 20240117
    towers, frames = {}, []
    for turn, record in enumerate(records, 1):
        state = record['round_state']
        assert not state.get('error'), state.get('error')
        attacks = []
        ants = {a['id']: a for a in state['ants']}
        for tower in state['towers']:
            if tower['type'] == -1:
                towers.pop(tower['id'], None)
                continue
            towers[tower['id']] = tower
            for ident in tower.get('attack', []):
                assert ident in ants, ('Missing recorded attack target', turn, ident)
                attacks.append(dict(owner=tower['player'], start=tower['pos'], end=ants[ident]['pos']))
        units = [dict(id=a['id'], owner=a['player'], x=a['pos']['x'], y=a['pos']['y'],
                      kind='ant', hp=a['hp'], status=a['status']) for a in ants.values() if a['status'] in (0, 4)]
        units += [dict(id=t['id'], owner=t['player'], x=t['pos']['x'], y=t['pos']['y'],
                       kind='tower', type=t['type']) for t in towers.values()]
        units += [dict(id=-1-seat, owner=seat, x=x, y=9, kind='base', hp=state['camps'][seat], maxHp=50)
                  for seat, x in enumerate([2, 16])]
        frames.append(dict(round=turn, scores=state['camps'], units=units, attacks=attacks))
    terminal = records[-1]['round_state']
    assert terminal['winner'] in (0, 1)
    assert json.loads(terminal['message']) == ['OK', 'OK']
    return frames, terminal['winner']


def main():
    bundle = json.loads(Path(sys.argv[1]).read_text())
    record = bundle['record']
    assert record['game'] == 'antwar' and record['model'] == 'glm-5.3'
    assert record['human']['rank'] == 1 and len(record['matches']) == 2
    assert hashlib.sha256(bundle['map_source'].encode()).hexdigest() == bundle['map_sha256']
    out = Path(__file__).resolve().parents[1]/'assets/replays'
    proof = dict(record, purpose='New exhibition matches, not original paper evaluation matches',
                 selection='Highest main-table AI Elo versus rank 1 of the frozen human pool; both seats, backend seed 20240117',
                 requested_seed=record['seed'], seed=20240117,
                 visualization='Recorded ants and tower deltas; attack lines only for recorded targets. Simplified full-information hex map.',
                 map_source_sha256=bundle['map_sha256'], matches=[])
    variants = []
    for seat, (m, data) in enumerate(zip(record['matches'], bundle['raw'])):
        assert m['status'] == 'complete' and m['diagnostic'] is None and m['ai_seat'] == seat
        raw = gzip.decompress(base64.b64decode(data['gzip_base64']))
        assert hashlib.sha256(raw).hexdigest() == data['sha256']
        frames, winner = decode(raw)
        assert m['winner'] == f'P{winner}'
        assert frames[-1]['scores'] == [m['scores']['P0'], m['scores']['P1']]
        assert len(frames) == m['rounds']
        path = out/f'antwar-ai-p{seat}.json'
        path.write_bytes(raw)
        variants.append(dict(width=19, height=19, frames=frames, winner=winner, aiSeat=seat,
                             fps=10, finalScores=frames[-1]['scores'], rawReplay='assets/replays/'+path.name))
        proof['matches'].append(dict(m, raw_sha256=data['sha256'], raw_file=path.name,
                                     display_final_scores=frames[-1]['scores'], state_count=len(frames), terminal_verified=True))
        print('AntWar', seat, len(frames), winner, frames[-1]['scores'])
    (out/'antwar-provenance.json').write_text(json.dumps(proof, indent=2)+'\n')
    replay = dict(game='antwar', title='AntWar', model='GLM-5.3', human=record['human'], ai=record['ai'],
                  sourceCommit=record['source_commit'], seed=20240117, board=terrain(bundle['map_source']),
                  scoreLabel=dict(en='Base HP · ties use the official tiebreakers', zh='基地生命值 · 同分时按官方规则判胜'),
                  provenance='assets/replays/antwar-provenance.json', variants=variants)
    (out/'antwar-data.js').write_text('/* Generated by tools/import-antwar.py from verified referee records. */\nwindow.ARENA_REPLAYS.antwar='+json.dumps(replay, separators=(',', ':'))+';\nObject.assign(window.ARENA_REPLAYS.antwar,window.ARENA_REPLAYS.antwar.variants[0]);\n')


if __name__ == '__main__':
    main()
