# Genshin Strongbox Helper (Genshin Artifact Triage)

Bilingual (ES/EN) artifact keep-vs-discard guide for Genshin Impact. The tool aims to help players quickly determine which artifact pieces are safe to recycle in the Strongbox and which ones should be kept for current characters.

Recommendations are powered by an offline, cached data pipeline that cross-references community theorycrafting from **Genshin-Builds (Genshin Impact Helper Team)** and **KeqingMains (KQM)**, resolving priorities based on guide version freshness.

### Features

- **Keep vs. Discard Matrix:** Fast visual triage for Sands, Goblet, Circlet, and viable Flower & Plume combinations.
- **Artifact Sidebar:** Quick-search drawer indexing all sets with bilingual name search and character-based filtering.
- **Customizable Triage:** Collapsible settings drawer with options to exclude alternative/situational builds, reverse matrix sorting, and switch to a compact matrix view.
- **Character Breakdown:** Compact summary of the characters that use the set and direct links to the source guides.

---

## Stack

- **Frontend:** React 19, Vite 8, TypeScript, Tailwind CSS, Lucide React
- **Scraping & Pipeline:** Cheerio, `tsx`
- **Quality & Linting:** `oxlint` (fast static analysis) and `tsc`
- **Data & Assets:** On-disk HTML cache (`.cache/`), generated dataset (`public/data/artifacts-triage.json`), and local 256×256 PNG assets (`public/images/`)

---

## Commands

```bash
# Frontend
npm install
npm run dev              # local dev server
npm run build            # typecheck (tsc -b) + production build
npm run preview          # preview production build
npm run lint             # static code analysis (oxlint)
npm run typecheck        # validate app TypeScript types
npm run typecheck:scripts # validate scraper scripts TypeScript types

# Data Scraping & Pipeline
npm run scrape           # process all 48 configured target sets
npm run scrape -- <set>  # process a single set
npm run scrape:all       # remove filter and process every indexed set

# Asset Management (Assets extracted from Project Amber (https://gi.yatta.moe) and Enka.Network (https://enka.network))
npm run scrape:images    # download both artifact and character local images
npm run scrape:images:artifacts   # download artifact set artwork only
npm run scrape:images:characters  # download character portraits only

# Diagnostic Tests
npm run scrape:test-gb   # inspect Genshin-Builds parser output
npm run scrape:test-kqm  # inspect KQM parser output
```

---

## Pipeline Architecture

The scraping pipeline (`scripts/scraper/`) uses a character-centric inversion model to build the triage dataset. Rather than scraping sets in isolation, the pipeline evaluates each playable character first, resolves build discrepancies, and then groups assignments into the target artifact sets:

- `scripts/scraper/config.ts` — Target sets catalog (`TARGET_SETS`), throttling limits (`NETWORK_DELAY_MS`), concurrency settings, and asset paths.
- `scripts/scraper/http.ts` — Cached HTTP client with polite request delays, jitter, 404 caching (`.404`), and automatic retries.
- `scripts/scraper/genshin-builds.ts` — Extracts artifact metadata and character builds from Genshin-Builds.
- `scripts/scraper/kqm-parser.ts` — Resolves KQM Quickguides, parsing guide versions, multi-archetype section DOM scoping, standard recommendations, main stats, and substats.
- `scripts/scraper/manual-inclusions.ts` — Two-phase audited override pipeline: Phase 1 pre-inversion (`CHARACTER_BUILD_OVERRIDES` for deep archetype restructuring) and Phase 2 post-inversion (`SET_REMOVALS`, `SET_TIER_OVERRIDES`, `SET_ADDITIONS`, and `SET_STAT_PATCHES` for isolated slot-level stat fixes).
- `scripts/scraper/build-dataset.ts` — Evaluates patch version freshness (`kqmVersion vs gbVersion`), branches multi-archetype builds, executes the two-phase manual override pipeline, inverts character assignments into target sets, and generates `public/data/artifacts-triage.json`.
- `scripts/scraper/download-artifact-images.ts` & `download-character-images.ts` — Downloads 256×256 PNGs for sets and characters via Project Amber and Enka.Network.

---

## Data & Triage Criteria

To keep artifact triage fast, reliable, and clean:

- **Authoritative Sources:** All stat priorities are compiled directly from the community research teams credited below.
- **Focus on most relevant builds:** The tool covers sets where they are ranked as **Best-in-Slot (BiS)** or top **Alternative** options. Niche variants and builds are omitted. These criteria follow the explicit ranking shown in Genshin-Builds (Genshin Impact Helper Team) and derive a positional ranking from KeqingMains tables.
- **Multi-Archetype Isolation:** Characters with distinct competitive playstyles are segregated into independent archetypes. This prevents cross-contamination of stats across incompatible roles.
- ** Manual Corrections:** A few targeted tweaks for specific characters, stats, or archetypes that the automated parsing may not have inferred correctly.

---

## Data Sources & Community Attribution (Fuentes y Atribución Comunitaria)

Statistical priorities and build recommendations are factual compilations derived from the theorycrafting created and maintained by:

- **[Genshin Impact Helper Team (Genshin-Builds)](https://genshin-impact-helper-team.github.io/genshin-builds/en)**
- **[KeqingMains (KQM)](https://keqingmains.com/)**

Sincere thanks to both teams for their continuous dedication and invaluable contributions to the Genshin Impact community. Additionally, metadata catalogs, character portraits, and artifact asset icons utilized during offline processing are sourced from **[Project Amber](https://gi.yatta.moe/)** and **[Enka.Network](https://enka.network/)**.

---

Las prioridades de estadísticas y recomendaciones de builds son compilaciones fácticas derivadas del trabajo de theorycrafting mantenido por:

- **[Genshin Impact Helper Team (Genshin-Builds)](https://genshin-impact-helper-team.github.io/genshin-builds/en)**
- **[KeqingMains (KQM)](https://keqingmains.com/)**

Agradecemos sinceramente a ambos colectivos por su constante dedicación e inestimable aporte a la comunidad de jugadores. Asimismo, los catálogos de metadatos, retratos de personajes e iconos de artefactos utilizados durante el procesamiento offline provienen de **[Project Amber](https://gi.yatta.moe/)** y **[Enka.Network](https://enka.network/)**.

> [!NOTE]
> **Independence & Data Curation:** This project is strictly independent and is neither affiliated with nor endorsed by the Genshin Impact Helper Team or KeqingMains.
> 
> Since this tool is not and doesn't intend to work as a build guide, the compiled build data shown is extremely condensed. Any discrepancies, omissions, or loss of guide-specific nuance stem solely from this tool's aggregation logic, not from the original research teams. For in-depth explanations and full contextual builds, please consult the original source guides directly.

### Community Opt-out & Attribution Requests

If you are a maintainer, author, or representative of the **Genshin Impact Helper Team**, **KeqingMains**, **Project Amber**, or **Enka.Network**, and you wish to update how your team is credited, request changes to how your data is linked, or ask for the exclusion of specific guides or assets, please open a GitHub issue or reach out to me directly.

---

## Authorship & AI Development Transparency (Transparencia de Autoría y Desarrollo)

In the interest of full intellectual honesty and modern open-source transparency:

- **Human Direction & Domain QA:** Product conception, cross-validation heuristics between data sources, scope definition, UI/UX direction, auditing of artifact rules and general QA.
- **AI-Assisted Engineering:** Technical architecture specification, scraping pipeline implementation, and React/TypeScript/Tailwind CSS code generation orchestrated via AI coding agents.

---

## Legal Disclaimer & Intellectual Property

- **Genshin Impact** is a registered trademark of **Cognosphere Pte. Ltd. / HoYoverse**.
- Game content, artwork, item icons, character illustrations, and in-game terminology are copyright and intellectual property of **HoYoverse / Cognosphere Pte. Ltd.**
- This project is a non-commercial, open-source, fan-created utility produced in compliance with fair-use and community fan content guidelines. No monetization, advertising, or paid access exists in this project.
- The **MIT License** accompanying this repository governs exclusively the programmatic source code, custom scripts, and architectural templates written for this application. It does not license or confer rights over third-party trademarks, game assets, or community-authored guide texts.
