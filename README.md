# Genshin Strongbox Helper (Genshin Artifact Triage)

Bilingual (ES/EN) artifact keep-vs-discard guide for Genshin Impact. The app is powered by an offline, cached data pipeline that cross-references community theorycrafting recommendations from **Genshin-Builds (Genshin Impact Helper Team)** and **KeqingMains (KQM)**, resolving discrepancies based on guide version freshness and other criteria.

## Current scope

The tool currently covers 17 artifact sets, ordered chronologically by release patch (oldest to newest):

1. Marechaussee Hunter / Cazador Fantasmal
2. Song of Days Past / Son de Antaño
3. Nighttime Whispers in the Echoing Woods / Murmullo del Bosque Reverberante
4. Fragment of Harmonic Whimsy / Fragmento de la Armonía Fantasiosa
5. Unfinished Reverie / Ensoñación Inacabada
6. Obsidian Codex / Códice de Obsidiana
7. Scroll of the Hero of Cinder City / Pergamino del Héroe de la Ciudad de las Cenizas
8. Long Night's Oath / Juramento de la Noche
9. Finale of the Deep Galleries / Réquiem del Corredor
10. Night of the Sky's Unveiling / Noche de la Revelación del Cielo
11. Silken Moon's Serenade / Serenata de la Luna Tejida
12. Aubade of Morningstar and Moon / Alborada de la Estrella del Alba y la Luna
13. A Day Carved From Rising Winds / Día de los Vientos Alzantes
14. Celestial Gift / Dádiva Celestial
15. Disenchantment in Deep Shadow / Desilusión Congelada en las Sombras
16. Heart of the Furnace / Corazón Forjado
17. Scarlet Proof / Testimonio Escarlata

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

npm run scrape           # all configured target sets (17)
npm run scrape -- celestial-gift
npm run scrape -- heart-of-the-furnace
npm run scrape -- scarlet-proof
npm run scrape -- disenchantment-in-deep-shadow
npm run scrape -- a-day-carved-from-rising-winds
npm run scrape -- night-of-the-skys-unveiling
npm run scrape -- silken-moons-serenade
npm run scrape -- obsidian-codex
npm run scrape -- scroll-of-the-hero-of-cinder-city
npm run scrape -- fragment-of-harmonic-whimsy
npm run scrape -- unfinished-reverie
npm run scrape -- song-of-days-past
npm run scrape -- nighttime-whispers-in-the-echoing-woods
npm run scrape:images    # download 256x256 set artwork into public/images/artifacts/
npm run scrape:images -- --force
npm run scrape:test-gb   # inspect Genshin-Builds extraction
npm run scrape:test-kqm  # inspect KQM extraction
npm run scrape:all       # remove the target-set filter and process every indexed set
```

## Pipeline

- `scripts/scraper/config.ts` — target-set filter (`TARGET_SETS`), locales, cache and concurrency settings. When adding a new set, add its entry in chronological patch order (oldest to newest), update the `Current scope` list in `README.md` in that same patch order, fetch its assets (`npm run scrape:images`), and execute `npm run scrape`.
- `scripts/scraper/http.ts` — cached fetch with retries and concurrency helper.
- `scripts/scraper/genshin-builds.ts` — artifact index + character build parser (EN/ES).
- `scripts/scraper/kqm-parser.ts` — KQM slug normalization, version parsing, main stats and substats.
- `scripts/scraper/build-dataset.ts` — source resolution, triage rules and JSON generation.
- `scripts/scraper/download-artifact-images.ts` — resolves set artwork through the Project Amber catalog and caches 256x256 PNGs from Enka.Network under `public/images/artifacts/`.
- `scripts/scraper/download-character-images.ts` — resolves character portraits through Project Amber and Enka.Network, caching 256x256 PNGs locally under `public/images/characters/` to eliminate hotlinking.

Run `npm run scrape:all` (or `npm run scrape -- --all`) to remove the target-set filter and process every set returned by the Genshin-Builds index. No scraper rewrite is needed.

## Data & Triage Methodology

To keep artifact triage fast, reliable, and clean, recommendations adhere to the following criteria:

- **No Hallucinated Stats:** All main stat and substat priorities are sourced directly from the established community guides credited in this file.
- **Standard Builds Only:** Focuses on primary roles, linking characters to sets where they rank as **Best-in-Slot (BiS)** or **Alternative** (most of the time meaning 2nd best, such as Wriothesley with Marechaussee Hunter). Highly niche, or non-standard builds are omitted.
- **Preserved Stat Ties:** Combined stat labels (such as `CRIT Rate / CRIT DMG`) are treated as equal priorities (`≈`) rather than assuming an arbitrary ranking.

## Data Sources & Community Attribution (Fuentes y Atribución Comunitaria)

Statistical priorities and build recommendations are factual compilations derived from the theorycrafting created and maintained by:

- **[Genshin Impact Helper Team (Genshin-Builds)](https://genshin-impact-helper-team.github.io/genshin-builds/en)**
- **[KeqingMains (KQM)](https://keqingmains.com/)**

Sincere thanks to both teams for their continuous dedication and invaluable contributions to the Genshin Impact community.

---

Las prioridades de estadísticas y recomendaciones de builds son compilaciones fácticas derivadas del trabajo de theorycrafting mantenido por:

- **[Genshin Impact Helper Team (Genshin-Builds)](https://genshin-impact-helper-team.github.io/genshin-builds/en)**
- **[KeqingMains (KQM)](https://keqingmains.com/)**

Agradecemos sinceramente a ambos colectivos por su constante dedicación e inestimable aporte a la comunidad de jugadores.

> [!NOTE]
> **Independence & Data Curation:** This project is strictly independent and is neither affiliated with nor endorsed by the Genshin Impact Helper Team or KeqingMains. 
> 
> Recommendations shown here are condensed for the purposes of this tool. Any discrepancies, omissions, or loss of guide-specific nuance belong solely to this tool, not to the original research teams. For in-depth explanations and full contextual builds, please consult the original source guides directly.

### Community Opt-out & Attribution Requests
If you are a maintainer, author, or representative of the **Genshin Impact Helper Team** or **KeqingMains**, and you wish to update how your team is credited, request changes to how your data is linked, or ask for the exclusion of specific guides, please open a GitHub issue or reach out to me directly.

---

## Authorship & AI Development Transparency (Transparencia de Autoría y Desarrollo)

In the interest of full intellectual honesty and modern open-source transparency:

- Human Direction & Domain QA: Product conception, cross-validation heuristics between data sources, scope definition, UI/UX direction, auditing of artifact rules and general QA.
- AI-Assisted Engineering: Technical architecture specification, scraping pipeline implementation, and React/TypeScript/Tailwind CSS code generation orchestrated via AI coding agents.
---

## Legal Disclaimer & Intellectual Property

- **Genshin Impact** is a registered trademark of **Cognosphere Pte. Ltd. / HoYoverse**.
- Game content, artwork, item icons, character illustrations, and in-game terminology are copyright and intellectual property of **HoYoverse / Cognosphere Pte. Ltd.**
- This project is a non-commercial, open-source, fan-created utility produced in compliance with fair-use and community fan content guidelines. No monetization, advertising, or paid access exists in this project.
- The **MIT License** accompanying this repository governs exclusively the programmatic source code, custom scripts, and architectural templates written for this application. It does not license or confer rights over third-party trademarks, game assets, or community-authored guide texts.
