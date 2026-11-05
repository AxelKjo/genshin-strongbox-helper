# Genshin Artifact Triage

Bilingual (ES/EN) artifact keep-vs-discard guide for Genshin Impact. The app is powered by a cached scraping pipeline that cross-checks **Genshin-Builds (EN/ES)** with **KeqingMains quickguides** and resolves disagreements using the most recently updated source.

## Current scope

The dataset currently covers nine artifact sets:

1. Aubade of Morningstar and Moon / Alborada de la Estrella del Alba y la Luna
2. Marechaussee Hunter / Cazador Fantasmal
3. Celestial Gift / Dádiva Celestial
4. Heart of the Furnace / Corazón Forjado
5. Scarlet Proof / Testimonio Escarlata
6. Disenchantment in Deep Shadow / Desilusión Congelada en las Sombras
7. A Day Carved From Rising Winds / Día de los Vientos Alzantes
8. Night of the Sky's Unveiling / Noche de la Revelación del Cielo
9. Silken Moon's Serenade / Serenata de la Luna Tejida

The scraper is modular and accepts an optional target-set filter, so the same code can be run for every set later without rewriting it.

## Stack

- Vite + React + TypeScript + Tailwind CSS
- `cheerio` + `tsx` scraping scripts
- On-disk HTML cache in `.cache/` (re-runs do not repeat HTTP requests)
- Generated dataset at `public/data/artifacts-triage.json`

## Commands

```bash
npm install
npm run dev              # local frontend
npm run build            # typecheck + production build
npm run lint
npm run typecheck:scripts

npm run scrape           # all configured target sets (9)
npm run scrape -- celestial-gift
npm run scrape -- heart-of-the-furnace
npm run scrape -- scarlet-proof
npm run scrape -- disenchantment-in-deep-shadow
npm run scrape -- a-day-carved-from-rising-winds
npm run scrape -- night-of-the-skys-unveiling
npm run scrape -- silken-moons-serenade
npm run scrape:images    # download 256x256 set artwork into public/images/artifacts/
npm run scrape:images -- --force
npm run scrape:test-gb   # inspect Genshin-Builds extraction
npm run scrape:test-kqm  # inspect KQM extraction
npm run scrape:all       # remove the target-set filter and process every indexed set
```

## Pipeline

- `scripts/scraper/config.ts` — target-set filter, locales, cache and concurrency settings.
- `scripts/scraper/http.ts` — cached fetch with retries and concurrency helper.
- `scripts/scraper/genshin-builds.ts` — artifact index + character build parser (EN/ES).
- `scripts/scraper/kqm-parser.ts` — KQM slug normalization, version parsing, main stats and substats.
- `scripts/scraper/build-dataset.ts` — source resolution, triage rules and JSON generation.
- `scripts/scraper/download-artifact-images.ts` — resolves set artwork through the Project Amber catalog and caches 256x256 PNGs from Enka.Network under `public/images/artifacts/`.

Run `npm run scrape:all` (or `npm run scrape -- --all`) to remove the target-set filter and process every set returned by the Genshin-Builds index. No scraper rewrite is needed.

## Data rules

- No invented stat recommendations: every main stat and substat comes from Genshin-Builds or KQM.
- Genshin-Builds can combine several recommendations in one label, e.g. `CRIT Rate / CRIT DMG`. Split and normalize each part instead of treating the whole label as one stat. If a selected build ends with an empty Sands, Goblet or Circlet, treat it as a parser regression and inspect the raw Genshin-Builds row before regenerating the dataset.
- Preserve unordered substat recommendations. A combined Genshin-Builds label (`CRIT Rate / CRIT DMG`) or a generic KQM `CRIT` means CRIT Rate and CRIT DMG are tied and must be displayed with `≈`, not with an invented priority. Only use `>` when the source explicitly ranks one above the other.
- Energy Recharge is often a temporary top priority. When Genshin-Builds or KQM marks it as `until requirement(s)`, annotate the substat as `Until Req` / `Hasta lo requerido` instead of presenting it as a permanent first priority.
- Each set stores `releaseVersion` from Genshin-Builds' `data-version-released` attribute as `raw`, `major` and `minor`. The sidebar is sorted newest patch first using `major` and `minor`; do not use `gbVersion`, `kqmVersion` or the dataset version for this ordering.
- Characters are linked to a set only through the main artifact ranking of their best role. Rank 1 entries are tagged `tier: "BiS"` and Rank 2 entries `tier: "Alternative"`; Rank 3+ and conditional/situational labels are excluded.
- Notes and body-text mentions never create a character-set link. A set must appear as a main recommendation in the corresponding build or guide.
- KQM evidence is taken only from the main artifact-set table. Niche sections and rows that depend on a specific enabler, constellation or team condition are ignored.
- `primarySource` is chosen by comparing the build/guide version. KQM wins only when it is newer **and** its main artifact table lists the set as a standard recommendation; otherwise Genshin-Builds is used.

## Data Sources & Attribution (Fuentes y Atribución)

Stat priorities and artifact recommendations are derived from the theorycrafting work of these community teams. Thank you to:

- **[Genshin-Builds (Genshin Impact Helper Team)](https://genshin-impact-helper-team.github.io/genshin-builds/)** — builds, artifact rankings, main stats, and substat priorities in English and Spanish.
- **[KeqingMains (KQM)](https://keqingmains.com/)** — character guides, artifact recommendations, and substat priorities.

Las prioridades de estadísticas y las recomendaciones de artefactos provienen del trabajo de theorycrafting de estos equipos de la comunidad. Gracias a **Genshin-Builds (Genshin Impact Helper Team)** y **KeqingMains (KQM)** por hacer públicos sus análisis y guías.

This project is not affiliated with either team. Any mistakes in interpretation or presentation belong to this project, not to the source teams.

## Legal & Disclaimer

This is an unofficial, non-commercial fan-made tool. Genshin Impact, game content, and materials are trademarks and copyrights of HoYoverse / Cognosphere Pte. Ltd. Not affiliated with or endorsed by HoYoverse.

The MIT License in this repository covers only the software source code and user interface. Game trademarks, icons, artwork, names, and game data remain the property of their respective owners.
