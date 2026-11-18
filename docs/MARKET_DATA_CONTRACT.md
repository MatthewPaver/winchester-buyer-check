# Public market snapshot contract

Source: HM Land Registry yearly Price Paid CSV (`https://price-paid-data.publicdata.landregistry.gov.uk/pp-YYYY.csv`); the year, URL and retrieval time are in `source.years`, `source.downloadUrl` and `source.fetchedAt`. `.github/workflows/refresh-price-paid.yml` refreshes it monthly and commits only when the retained Winchester rows change. The immutable-in-this-checkout projection is `data/price-paid-source.json`; its metadata contains the download checksum and URL. Data is governed by the [HMLR publishing conditions](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) and Open Government Licence v3.0, with separate address-data conditions.

Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

## Reconciliation (2026 file, retrieved 18 November 2026)

- Download: 457,963 rows. Geography projection excludes 457,402 rows.
- Retain: district exactly `WINCHESTER`; outward postcode exactly `SO21`, `SO22` or `SO23`: 561 rows.
- Include: category `A`; record-status `A`; property type detached, semi-detached, terraced or flat/maisonette; finite price £50,000–£3,000,000 inclusive: 512 rows. Other filters exclude 49 rows.
- Group: outward postcode + property type; 12 groups, sales counts total 512.
- Quantiles: sorted prices with linear interpolation at `(n−1)×p`, rounded to the nearest pound. Bands are observed 25th/75th percentiles, not confidence intervals or valuations.
- Coverage dates describe the geographically retained source rows. The yearly file covers one sale year and can receive later registrations and corrections; `A` is the source record-status code, not a live verification of an active listing.

Retained columns: transaction ID (for traceability), sale price, sale date, outward postcode, property type, category, record status. No owner names, full postcodes, house numbers or streets are retained. The nine fictional homes are separate UI fixtures, never purported matches to HMLR records.

## Reproduction and checks

`node scripts/build-market-summary.mjs` regenerates both browser/JSON aggregates solely from the retained source. `node --test tests/*.test.cjs` checks SHA-256, independent count/group/price reconciliation, allowed columns and the favicon. `python3 -m unittest discover -s tests -p 'test_*.py'` checks the public CSV column mapping and rejects invalid retained sale dates or dates outside the requested year (`--year`, default 2025) using explicitly synthetic rows.

The projection script reads an already downloaded file; it does not fetch or authenticate that file. Its legacy `source.fetchedAt` field records projection time, not a timestamp supplied by HMLR or the downloader. For this checked-in snapshot, download and projection both occurred on 18 November 2026. The whole-file checksum supports later comparison; refreshed snapshots require a separately verified download from the stated URL.

The full upstream CSV is not committed. Its checksum supports checking a byte-identical saved download; HMLR's mutable yearly URL does not guarantee historic-download availability. Do not claim this snapshot is a complete or current market census, a live feed, property valuation, financial recommendation or proof of listing facts.
