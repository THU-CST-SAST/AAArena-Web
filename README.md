# AAArena

Research website for AAArena (Agents for Agents Arena).

Website: [thu-cst-sast.github.io/AAArena-Web](https://thu-cst-sast.github.io/AAArena-Web/)

This is a public, static website. Pages, manuscript and downloads are accessible
without an access code. It does not depend on the former server's authentication
service, AgentBench, AHL-Arena, an API, or a database.

## Pages

- Home: clickable real-match replay overview, visual abstract, main results, and animated ablation comparisons.
- Leaderboard: twelve games × seven models, with human-pool rank and Elo; individual
  game tables and CSV export.
- Games: twelve games, each with a leaderboard, detailed gameplay guide, and measured records.
  `game-rules.js` contains the guides: setup, round flow, actions, economy, scoring
  and end conditions, summarized from competition documents and Arena backend
  implementations. Each guide lists its source files. They are explanatory
  summaries, not verbatim historical manuals or exhaustive protocol specifications.
- Contact: SAST and project leads in one compact contact section.

## Local preview

The header offers English / Chinese switching. First visits default to English;
an explicit selection is saved locally when browser storage is available.
`i18n.js` translates interface copy, while `game-rules.zh.js` contains the Chinese
game guides. Routes, filters and experimental values do not change with language.
The manuscript, CSV data fields and existing downloadable animations remain in
their original language; live canvas labels switch with the interface.

From the repository root:

```sh
python3 -m http.server 8092 --bind 127.0.0.1
```

Open [localhost:8092](http://localhost:8092/). No build or dependency installation
is needed to serve the website. All asset paths are relative, and hash routes such
as `#/games/dorado/records` also work under the GitHub Pages project subdirectory.

## GitHub Pages deployment

In the repository's **Settings → Pages**, select **Deploy from a branch**, `main`,
and `/ (root)`. Pushes to `main` automatically publish the website. `.nojekyll`
keeps the files as plain static assets. There is no custom domain configured here;
the previous site's DNS and server settings are separate and unchanged.

Do not upload server credentials, authentication configs, or private backups. They
are not necessary for this deployment. No password service is included in this repo.

## Tests

Node.js 20 or newer and Playwright are needed only for development checks:

```sh
npm ci
npx playwright install chromium
```

Serve the repository over HTTP, then run:

```sh
ARENA_TEST_URL=http://127.0.0.1:8092/ npm test
```

The media-download suite requires HTTP rather than `file://`. To exercise Pages:

```sh
ARENA_TEST_URL=https://thu-cst-sast.github.io/AAArena-Web/ npm test
```

Optional environment settings: `ARENA_BROWSER_PATH` selects an existing Chromium
executable; `ARENA_NO_SANDBOX=1` is for environments that cannot use its sandbox.
Screenshots are written to `/tmp`, not into the deployed website.

Coverage includes four tabs, all 36 game detail views, main results and ablations,
rank ties, CSV export, filtering, direct links, refresh/back, keyboard navigation,
PDF access, animation controls/downloads, reduced motion, and desktop/mobile layouts.
The manuscript fixture was extracted directly from PDF Tables 1, 2 and 9; tests
independently check all 84 result cells and 84 token entries against it.

## Files and editing

- `index.html`: application shell and navigation.
- `app.js`: routes, research panels, leaderboards, game details, CSV export.
- `data.js`: manuscript measurements; `details.js`: game summaries.
- `styles.css`: black/white/blue theme and responsive layout.
- `layout.css`: shared typography and component alignment; loaded last. Captions
  use 12 px, controls 14 px, body 15 px, section titles 24 px, page titles 36 px
  (22/30 px for titles on mobile). Rank identity and value stay in one centered
  group. Budget groups share metric-column widths; ablation SVGs share equal
  padding and scale. Change these component rules instead of isolated offsets.
- `replays.js` / `replays.css`: replay gallery and full-match viewer.
- `assets/replays/`: verified state sequences, original match files and provenance.
- `motion.js`: legacy media exporter only; no longer loaded by the website.
- `assets/`: manuscript PDF, downloadable GIF/MP4 animations, and posters.
- `tests/`: browser interaction tests; `tools/`: animation exporters.

Edit measurements in `data.js`, rather than embedding a second copy in the UI.
When scripts or styles change, update the query-string version in `index.html`
to invalidate browser caches.

`tests/browser-check-layout.cjs` checks English and Chinese at 1440, 1024, 768,
390 and 320 px: card boundaries, rank centers, budget widths, chart baselines and
header size. These geometry checks supplement, not replace, visual inspection.

To regenerate media (also requires `ffmpeg`):

```sh
npm run export:motion
npm run export:ablations
```

## Interpretation

Data are transcribed from the supplied manuscript, not a live tournament feed:

- Table 1: twelve games and 1,920 archived programs, not 1,920 unique people.
- Table 2: 84 measured cells across seven models; median results of three runs.
- Table 3: selected Dorado milestones, not a full submission history.
- Table 4: GLM-5.3 continuation endpoints, 128/16 vs 384/48.
- Tables 6–8: separate ablation settings, not main-table cells.
- Section 4.5 / Figure 13: on-policy vs off-policy GLM-5.3 retained champions.
- Table 9: per-game and total token use (input + output, cached input counted once).
- Appendix E / Table 10: approximate automatic classification of the 84 champions;
  the detailed figure is rendered directly from the supplied PDF, not estimated.

Current manuscript: `Can_AI_Agent_Build_Game_Agent.pdf` (supplied 2026-10-07),
served unchanged at `assets/aa-arena.pdf`. Its title is “Can AI Agents Build Game
Agents for Real-World Adversarial Games?” The new version names Hongning Wang as
the corresponding author. His contact email and profile are verified against
[Tsinghua's faculty page](https://www.cs.tsinghua.edu.cn/csen/info/1313/4406.htm).

Opus5.5 uses Claude Code; the other six models use Codex. All use max reasoning
effort. These are model–harness configurations, not a harness-controlled comparison.
Gold medals in paper order: 6, 4, 4, 2, 2, 3, 1. No configuration tops the other
six frozen ladders. Feedback ceilings do not impose token or wall-clock limits.
The paper's code link points to `THU-CST-SAST/AAArena`, which is currently private;
this website update does not change that repository's visibility.

Elo is not comparable across games; the website has no averaged Elo or overall
model rank. The leaderboard emphasizes rank in each frozen human-program pool.
The model columns stay in paper order; the footer counts rank-1 games.
The records views do not fabricate human
player rows, timestamps, complete match histories, or replay files.

The homepage gallery plays real referee states; the ablation animations are
visualizations of measured data, not gameplay. Ablation panels preserve exact measurements and display within-game
differences from fixed references. The same charts are exported as GIF/MP4.

## Real-match showcase

Four games currently have replays: SnakeGo, Pacman, MoneCraft and Dorado. Click any
preview to open a full match, seek, change playback speed, switch seats, or download
the original replay and its provenance. English/Chinese, keyboard controls, small
screens and reduced-motion preferences are supported. Offscreen/background
previews pause; frames are not redrawn until the recorded state changes.

These are **new exhibition matches**, not the original paper evaluation matches.
For each game, the highest-Elo AI policy in the main table faces the rank-1 program
in the frozen human pool. “Human champion” refers to that pool rank, not a claimed
historical competition title. A seed of 42 and both seat assignments were used;
all eight games completed normally. Both AI wins and human wins are included.
Results do not change the manuscript's Elo tables and do not estimate win rates.

| Game | AI model | AI P0: P0–P1 | AI P1: P0–P1 | Score unit |
| --- | --- | --- | --- | --- |
| SnakeGo | Opus5.5 | 238–25 | 59–150 | Territory points |
| Pacman | Opus5.5 | 1556–519 | 454–1539 | Points |
| MoneCraft | GPT6-sol | 20880–32410 | 24040–22810 | Gold |
| Dorado | GPT6-sol | 0–3000 | 3000–0 | Remaining base HP |

AI exports: `agentlab:/home/qingle/agentbench/exports/main-table-champions-84-20261006/`.
Match runner and records: `agentlab:/home/qingle/agentbench/AA-Arena-Web-Replays/`,
under `runs/web-showcase-20261008/`. Strategies were not edited; hashes were checked
before and after play. Runtime/game packs came from `SAST-agent/AA-Arena` at
`fcb87bea85c82260969d558e7b340bce95a68db8`. No server connection is needed for viewing.

`tools/import-replays.py` accepts a sanitized export bundle (match records plus
gzip/base64 raw replays and their SHA-256 values) and an installed runtime checkout:

```sh
python3 tools/import-replays.py /path/to/bundle.json /path/to/AA-Arena
```

It verifies each original replay hash, all SnakeGo processed operations and round
events against the pinned backend, and all eight terminal outcomes against referee
records. Pacman map/mine deltas are applied in order. MoneCraft and Dorado maps are
transposed from their x-major backend storage. Static terrain is cached in the viewer.
Dorado records negative terminal HP; the display clamps it to zero, not gold/property.
The public per-game provenance files retain source commit, frozen-policy hash,
human-pool identity, both results and original replay hashes.

Rendering is a simplified, full-information 2D view of recorded states, not the
original competition client or a video, and not either player's limited observation.
No moves or match outcomes are generated in the browser. Unit art is schematic;
the current viewer does not reproduce every original particle/effect animation.
The compressed state payload is about 225 KB over gzip (both seats, all four games).
