# AA-Arena

Research website for AA-Arena (Agents for Agents Arena).

Website: [thu-cst-sast.github.io/AAArena-Web](https://thu-cst-sast.github.io/AAArena-Web/)

This is a public, static website. Pages, manuscript and downloads are accessible
without an access code. It does not depend on the former server's authentication
service, AgentBench, AHL-Arena, an API, or a database.

## Pages

- Home: visual abstract, main results, animated ablation comparisons, Dorado case
  study, and extended-budget results.
- Leaderboard: twelve games × five models, with human-pool rank and Elo; individual
  game tables and CSV export.
- Games: twelve games, each with a leaderboard, overview, and measured records.
- Contact: SAST, corresponding authors, project leads, and author list.

## Local preview

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

## Files and editing

- `index.html`: application shell and navigation.
- `app.js`: routes, research panels, leaderboards, game details, CSV export.
- `data.js`: manuscript measurements; `details.js`: game summaries.
- `styles.css`: black/white/blue theme and responsive layout.
- `motion.js`: workflow and Dorado canvas animations.
- `assets/`: manuscript PDF, downloadable GIF/MP4 animations, and posters.
- `tests/`: browser interaction tests; `tools/`: animation exporters.

Edit measurements in `data.js`, rather than embedding a second copy in the UI.
When scripts or styles change, update the query-string version in `index.html`
to invalidate browser caches.

To regenerate media (also requires `ffmpeg`):

```sh
npm run export:motion
npm run export:ablations
```

## Interpretation

Data are transcribed from the supplied manuscript, not a live tournament feed:

- Table 1: twelve games and 1,920 archived programs, not 1,920 unique people.
- Table 2: sixty measured cells across five models.
- Table 3: selected Dorado milestones, not a full submission history.
- Table 4: GLM-5.3 continuation endpoints, 128/16 vs 384/48.
- Tables 6–8: separate ablation runs, not main-table cells or multi-seed averages.

Elo is not comparable across games; the website has no averaged Elo or overall
model rank. The leaderboard emphasizes rank in each frozen human-program pool.
The model columns stay in paper order; the footer counts rank-1 games.
Pending models have no invented results. The records views do not fabricate human
player rows, timestamps, complete match histories, or replay files.

Animations are illustrations or visualizations of measured data, not executable
game replays. Ablation panels preserve exact measurements and display within-game
differences from fixed references. The same charts are exported as GIF/MP4.
