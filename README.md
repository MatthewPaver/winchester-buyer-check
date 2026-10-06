# Winchester House Hunter — public demo

A browser-only demonstration of the fuller Winchester property decision workspace.

**Live demo:** https://matthewpaver.github.io/winchester-buyer-check/

**Try first:** choose **Under £425k**, open a home and inspect its evidence checklist. Then change the affordability inputs to see how the example responds. No sign-up or installation is required. The shortlist is seeded: you cannot use this edition to search live property listings or add a new listing feed.

The demo includes:

- a searchable nine-home shortlist;
- a generated, traceable HM Land Registry market view;
- a LISA-aware affordability plan;
- property review, agent verdict and negotiation views;
- an evidence checklist and source register.

All examples are seeded. Inputs and checklist changes remain in the browser. The demo does not create an account, scrape live property portals, make a mortgage decision or submit an offer.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/.

## Verify

```bash
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
```

For the optional browser check, keep the local server running in one terminal. In another terminal, install the browser-test dependency and run:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install playwright
.venv/bin/python -m playwright install chromium
.venv/bin/python tests/smoke.py
```

The browser check exercises desktop/mobile navigation, market filters, visible source counts and affordability inputs. Screenshots go to `/tmp` by default so verification does not overwrite artwork. Set `WINCHESTER_SHOWCASE_PATH=assets/showcase.png` only when deliberately refreshing that image. `WINCHESTER_BASE_URL` optionally overrides the default localhost port.

## Rebuild the market summary

The retained, address-minimized public source is [`data/price-paid-source.json`](data/price-paid-source.json). A public clone can rebuild the exact aggregates without network access or a private repository:

```bash
node scripts/build-market-summary.mjs
```

That command deterministically rewrites `data/market-summary.json` and `market-data.js`, recording the retained-source SHA-256, counts, date coverage, filters and quantile method. The timestamp identifies the retained snapshot, not the time the command ran. Tests independently reconcile the retained records with every group and verify no full postcode or street address is retained.

To refresh from the official public source (approximately 159 MiB; optional, never needed to run the demo):

```bash
curl --fail --location https://price-paid-data.publicdata.landregistry.gov.uk/pp-2025.csv -o /tmp/pp-2025.csv
python3 scripts/retain-price-paid.py /tmp/pp-2025.csv
node scripts/build-market-summary.mjs
node --test tests/*.test.cjs
```

The [HMLR yearly download](https://www.gov.uk/government/statistical-data-sets/price-paid-data-yearly-file) is revised monthly. The retained snapshot was retrieved on **5 September 2026**; the source JSON records the download URL and whole-download SHA-256. A future download may produce different records and must be reviewed as a new snapshot. The projection retains only transaction ID, price, date, outward postcode, property type, category and record-status code. It reads no private inputs. See [the data contract](docs/MARKET_DATA_CONTRACT.md) for exact filters and counts.

The private commercial product adds authenticated accounts, persistent workspaces, source ingestion, background jobs and administrative controls. Those services are deliberately not exposed by this static GitHub Pages edition.

## Data and rights

The market view uses a retained 2025 HM Land Registry snapshot under the Open Government Licence v3.0: **954,145 downloaded rows → 1,046 Winchester-district / SO21–SO23 rows → 931 included sales across 12 groups**. The nine shortlisted homes are fictional and are not linked to these historical transactions. This is completed-sale context, not a live listing feed or a valuation.

Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

Copyright © 2026 Matthew Paver. Source code is available under the [MIT License](LICENSE); the project name and artwork are excluded — see [NOTICE.md](NOTICE.md).
