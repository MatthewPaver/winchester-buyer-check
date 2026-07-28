# Winchester House Hunter — public demo

A browser-only demonstration of the fuller Winchester property decision workspace.

**Live demo:** https://matthewpaver.github.io/winchester-buyer-check/

The demo includes:

- a searchable nine-home shortlist;
- a bundled HM Land Registry market view;
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
python3 tests/smoke.py
```

The private commercial product adds authenticated accounts, persistent workspaces, source ingestion, background jobs and administrative controls. Those services are deliberately not exposed by this static GitHub Pages edition.

## Data and rights

The market view uses a small aggregated demonstration derived from HM Land Registry Price Paid Data under the Open Government Licence v3.0. It is not a live listing feed.

Copyright © 2026 Matthew Paver. This repository is publicly viewable, but no open-source licence is granted. See [NOTICE.md](NOTICE.md).
