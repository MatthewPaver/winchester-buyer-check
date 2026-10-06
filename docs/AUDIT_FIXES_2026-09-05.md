# Audit fixes — 5 September 2026

Preserved existing local UI/generator/test changes, completed the public-data contract and verified without private inputs, commits, pushes or deployment.

## Completed

- Replaced the generator's private sibling-repository dependency with `data/price-paid-source.json`, a 236 KiB address-minimized projection downloaded from the official public 2025 HMLR yearly CSV. No private Winchester project was read. Public transaction IDs provide traceability; no names, full postcodes or street addresses are retained.
- Published download URL, retrieval date, upstream SHA-256, retained-source SHA-256, filters, data rights and regeneration command. A public clone regenerates the browser and JSON aggregates deterministically without network access.
- Reconciliation: **954,145 downloaded → 1,046 retained geography rows → 931 included sales → 12 groups**. Geographic exclusions: 953,099; analysis-filter exclusions: 115. Date range: **2025-01-02 to 2025-12-24**.
- Coverage deliberately changed from the earlier privately sourced 2024–26 snapshot: public reproducibility now takes precedence over preserving the old 2,389/2,122 counts. UI and README explicitly describe historical 2025 data, separately from nine fictional homes.
- Added local SVG favicon and first-use/browser installation instructions. Browser smoke checks visible counts, desktop/mobile navigation, affordability and evidence routes; captures console and request failures. Screenshots default to `/tmp` rather than overwriting showcase artwork.
- CI now checks public-source projection contracts and deterministic regeneration before browser verification.

## Exact verification

- `node --test tests/*.test.cjs`: **9 passed, 0 skipped**. Includes independent retained-source SHA/count/group quantile checks, allowed-column checks, favicon and byte-identical regeneration.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: **2 passed**, synthetic HMLR column mapping/address-minimization and wrong-year/invalid-date rejection contracts.
- `python3 scripts/retain-price-paid.py /tmp/winchester-audit-pp-2025.csv && node scripts/build-market-summary.mjs`: passed using the actual public CSV downloaded on 2026-09-05. Source URL: `https://price-paid-data.publicdata.landregistry.gov.uk/pp-2025.csv`; SHA-256: `00031f353d91cec625ad2212dd2f436eb77fc31e0776d5bf17fe4587fc4e0c24`.
- `WINCHESTER_BASE_URL=http://127.0.0.1:8766 python3 /Users/mattpaver/.agents/skills/webapp-testing/scripts/with_server.py --server 'python3 -m http.server 8766 --bind 127.0.0.1' --port 8766 -- ../ProjectLens/.venv/bin/python tests/smoke.py`: **passed**, no console/page/request errors. Reused local Playwright, no fresh dependency install. Screenshots: `/tmp/winchester-showcase.png`, `/tmp/winchester-house-hunter.png`. Showcase visually inspected.
- `git diff --check`: passed.
- RED/GREEN: public-source and favicon tests first failed for missing retained source/favicon, then passed. The standard CSV mapping test caught and corrected a county/district index mistake before data generation succeeded.
- Reciprocal review found that an accidentally supplied different yearly file could be labelled 2025. Four wrong-year/invalid-date subcases first failed, then passed after an explicit retained-date guard. The committed snapshot and all counts are unchanged.

## Boundaries

HMLR revises its yearly URL; the retained source permits exact aggregate reproduction but a future download may differ. The whole upstream CSV is not committed. Historical price summaries do not establish listing accuracy, valuation, mortgage eligibility or current market completeness. No publication/deployment performed; public-readiness claims still need release verification.
