# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**CheevosRoms** (`https://cheevosroms.vercel.app`; the old `retroachievements.vercel.app` 308-redirects there): finds download URLs on archive.org for ROMs whose hash RetroAchievements recognizes. Three surfaces:

- **Console app** (`console/main.py`, `console/Console_mode.py`, `console/want_to_play.py`) — layered OOP app under `src/`.
- **Web backend** (`api/index.py`) — Flask, deployed to Vercel as the `api` service. JSON endpoints only (`/api/*`, `/get_game_versions`, `/dl`, `/search`), no server-rendered pages.
- **Web frontend** (`web/`) — Next.js (App Router) + TypeScript, deployed as the `web` service. Owns every page.

`scripts/` holds maintenance tools (`sync_*.py`, `check_sources_health.py`), run by hand or by CI — never imported by `src/`, `api/` or `web/`.

## Commands

```bash
pip install -r requirements.txt
npm install              # root devDependencies (concurrently)
cd web && npm install     # Next.js deps

python console/main.py            # unified console entry point, prompts for mode
python console/Console_mode.py    # direct hash search only (no credentials needed)
python console/want_to_play.py    # "want to play" list mode (needs .env)

npm run dev:api           # Flask alone, 127.0.0.1:5000
npm run dev:web           # Next.js alone, localhost:3000 (proxies the API routes to Flask, see web/next.config.ts)
npm run dev                # both together — the real local dev loop for the web app
```

CI (`.github/workflows/ci.yml`):
- **Python**: `ruff check .`, `ruff format --check .` (`ruff.toml`: py312, line-length 120, `E`/`F`/`I`), smoke-import of `api.index`, `pytest` (`tests/`; coverage gate of 90% scoped to `src.factories.url_factory` + `src.core.rom_info` in `pytest.ini`).
- **Web** (in `web/`): `npm run lint`, `typecheck`, `test` (vitest), `build`.

`.env` (copy from `ejemplo.env`) is only needed for "want to play" and the RA sync scripts: `API_KEY`, `RETROACHIEVEMENTS_USERNAME`. Direct hash search needs no credentials.

## Workflow

- Integration branch: `dev`. Work branches come off `dev` and PR into `dev`, never `main`. `main` only moves when a release PR `dev → main` is cut.
- Release PRs get squash-merged into `main`, so `main` ends up with a commit `dev` doesn't have and the *next* release PR conflicts. Fix: on a branch from `dev`, merge `origin/main` keeping `dev`'s side, and PR it to `dev` **as a merge commit** (not squash).
- Commits: Conventional Commits, `tipo(scope): descripción` (`fix`, `feat`, `refactor`, `docs`, …).

## Architecture — console app (`src/`)

Strategy / Factory / Command / Singleton split:

- `src/app.py` — `RetroAchievementsDownloader`, picks a `HashSearchStrategy` by `AppMode` (`DIRECT_HASH` / `WANT_TO_PLAY`) and drives the run loop.
- `src/core/data_manager.py` — `RetroAchievementsDataManager`, **singleton** that lazily loads `Data/TamperMonkeyRetroachievements.json` once per process. `find_hash(hash) -> rom_path`, `find_hash_entry(hash) -> (game_id, rom_path)`.
- `src/strategies/search_strategies.py`:
  - `DirectHashSearchStrategy` — looks up a hash directly.
  - `WantToPlaySearchStrategy` — reads `game_hashes.json` (gitignored, user-generated), picks the best hash per game by region priority (`config.PREFERRED_REGIONS`), resolves it through the same data manager.
- `src/factories/url_factory.py` — `URLGeneratorFactory` holds an ordered list of `URLGenerator`s and picks the first whose `can_handle(rom_path)` matches. **Order matters**: matching is substring-based, so specific generators (PSP, PS2) must precede broad ones (PS1, Default). PS2 splits into A-M / N-Z collections by the first letter of the filename. SNES reads `Data/snes_source_override.json` (see Data).
- `src/core/rom_info.py` — console / game-name parsing from `rom_path`, shared by console app and web backend.
- `src/commands/download_commands.py` — `OpenInBrowserCommand`, `BatchDownloadCommand` (writes unresolved names to `missing_games.txt`), `DisplayURLCommand`.
- `config.py` — file paths, region priority, per-console base URLs, validation constants. Imported with `try/except ImportError` fallbacks in `src/core` and `src/strategies`.

## Architecture — web backend (`api/index.py`)

Imports straight from `src/` — no duplicated hash/URL logic:

- `RetroAchievementsDataManager` (same singleton), `URLGeneratorFactory`, `rom_info`, `link_checker` (`is_download_url_reachable`, `is_hash_recognized_by_ra`).
- `build_games_index()` builds the per-`game_id` catalog for `/api/games`; `load_ra_metadata()` / `load_console_icons()` read `Data/retroachievements_metadata.json` (covers, titles, achievement counts).
- Routes: `/api/games` (paginated/filterable catalog), `/get_game_versions`, `/dl?hash=` (redirect to the download URL), `/search` (hash lookup + link reachability + RA recognition + cover/achievements), `/api/ra/*` and `/api/want_to_play` (RA account via a signed HttpOnly session cookie — the API key never reaches the browser).

## Architecture — web frontend (`web/`)

- Pages: `/` (`app/(app)/page.tsx` → `GamesView`, catalog + hash search via `/?q=`) and `/faq`. Shared shell in `app/(app)/layout.tsx` (topbar, cart, hasher modal, RA account modal).
- Same origin as Flask in production (Vercel Services), so components `fetch` the JSON endpoints directly — no CORS, no env vars.
- i18n: `app/(app)/i18n.ts` (es/en/pt/fr, every key in all four). Pre-rendered HTML is always Spanish; `useLocale` (`useSyncExternalStore`, server snapshot `"es"`) switches to the stored locale right after hydration.
- Anything read from `localStorage`/`sessionStorage` must not change the first render, or hydration breaks (see `CartContext`, `useLocale`).
- `localStorage` keys keep the old `ra-downloader-*` prefix on purpose: renaming them would wipe every user's cart/locale.
- "Verificar ROM" (`app/(app)/raHash.ts`) computes the RA hash in the browser and only sends the hash to `/search`. Rules are checked against rcheevos source, not the docs (the docs get PC Engine wrong: it's `size & 512`, not `% 131072`). Cartridge systems only — CD/disc would need `RAHasher` server-side and uploads bigger than Vercel's fixed 4.5 MB body limit.
- SEO: `app/robots.ts`, `app/sitemap.ts`, `public/llms.txt`, JSON-LD `WebSite` in `app/layout.tsx`, canonical per page (`/?q=` canonicalizes to `/`). `public/BingSiteAuth.xml` and `public/google7d9e58b51851e461.html` are Bing/Google Search Console verification files — don't delete them.

## Data

See `Data/README.md` for every file. Key points:

- `Data/TamperMonkeyRetroachievements.json` is the canonical dataset: `{ game_id: [ { HASH: rom_path } ] }`. The `rom_path` root folder encodes the console (`SNES-Super Famicom/...`, `PlayStation 2/...`) — `src/` and `api/` parse that instead of a console field. The parent folder is the game name the web shows.
- When a console's archive.org source dies, `scripts/sync_source.py` matches our hashes against a replacement item by **hash** and writes `Data/<label>_source_override.json` (`rom_path → file in the new item`) plus `Data/<label>_missing_sources.txt`. The generator for that console reads the override; `rom_path`s in the dataset stay untouched. SNES works this way.
- `Data/retroachievements_metadata.json` does **not** update itself: rerun `scripts/sync_games_metadata.py` after changing the dataset, or new games show up without covers.
- Adding games or a new console: `docs/agregar-fuente-de-juegos.md`.

## RetroAchievements API and archive.org

- `src/core/retroachievements_api.py`: `RetroAchievementsClient`, thin `requests` wrapper. Retries network errors (3 attempts, 1 s apart), not HTTP status codes — the API sometimes hangs without a clean 429.
- `scripts/sync_want_to_play.py` → `game_hashes.json` (personal, gitignored) from your "Want to Play" list.
- `scripts/sync_games_metadata.py` → `Data/retroachievements_metadata.json` (committed), via `GetGameList(consoleId, h=1)` (all hashes of a console in one call).
- `scripts/sync_gamecube.py` / `scripts/sync_wii.py` → add GameCube / Wii to the dataset by matching a RetroAchievements `.dat` (UGA_RA_DATs) against archive.org file listings by MD5, without downloading games. Thin wrappers over `src/core/dat_archive_sync.py::DatArchiveSync`.
- There is **no public hash → GameID endpoint** in the RA Web API. `sync_games_metadata.py` matches consoles by normalized name (small manual alias table for NES/SNES/PS1/PS2/PSP/N64/…) and, within a console, by exact hash.
- Rate limiting: no published number, but after heavy use the API returns read timeouts (not 429). Repeated `ReadTimeoutError` in `sync_games_metadata.py` means wait and retry, not a bug.
- archive.org answers **401** (not 404) for files that exist but need a browser login — `link_checker` only treats 404/410 as broken.
- `.github/workflows/check-sources.yml` runs `scripts/check_sources_health.py` every Monday: samples ROMs per console, checks their real URLs, and opens/updates/closes an issue labeled `fuente-rota`.

## Vercel

- Deploy model is **`services`** (`vercel.json`), not legacy `builds`/`routes` nor `experimentalServices`. Top-level `rewrites` are evaluated in order: explicit entries send the API routes to `api`, the catch-all `/(.*)` goes last to `web`. A new Flask route needs its own rewrite entry.
- Python `entrypoint` uses dotted module notation: `"api.index:app"` (not `api/index:app` nor `api/index.py:app`).
- With `root: "."` the Python service ships the whole repo (`src/`, `config.py`, `Data/`) — no `includeFiles` needed.
- Root `requirements.txt` is the only dependency list. Don't add `api/requirements.txt`: the Python builder prefers it over the root one.
- Project Node version must stay on a supported line (currently `24.x`, set in project settings).
- **`vercel dev` doesn't work** with this setup (`No dev server available for service "api" (framework: flask)`). That's why the root `package.json` + the rewrite proxy in `web/next.config.ts` exist. The proxy targets `127.0.0.1:5000`, not `localhost:5000`: on macOS, AirPlay Receiver holds `localhost:5000` and answers 403.
- Debugging deploys: `gh pr checks <n>`; `vercel deploy --scope pipetboys-projects --yes` reproduces build/schema errors locally; runtime errors (`FUNCTION_INVOCATION_FAILED`) via `vercel logs <deployment-url> --scope pipetboys-projects` (not `vercel inspect --logs`, which only has build logs).
- Preview deployments have Vercel Authentication on — plain `curl` gets 401. Use `vercel curl <url> --scope pipetboys-projects`.
