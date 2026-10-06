# Public market snapshot contract

Source: [HM Land Registry 2025 yearly Price Paid CSV](https://price-paid-data.publicdata.landregistry.gov.uk/pp-2025.csv), retrieved 2026-09-05. The immutable-in-this-checkout projection is `data/price-paid-source.json`; its metadata contains the download checksum and URL. Data is governed by the [HMLR publishing conditions](https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads) and Open Government Licence v3.0, with separate address-data conditions.

Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.

## Reconciliation

- Download: 954,145 rows. Geography projection excludes 953,099 rows.
- Retain: district exactly `WINCHESTER`; outward postcode exactly `SO21`, `SO22` or `SO23`: 1,046 rows.
- Include: category `A`; record-status `A`; property type detached, semi-detached, terraced or flat/maisonette; finite price £50,000–£3,000,000 inclusive: 931 rows. Other filters exclude 115 rows.
- Group: outward postcode + property type; 12 groups, sales counts total 931.
- Quantiles: sorted prices with linear interpolation at `(n−1)×p`, rounded to the nearest pound. Bands are observed 25th/75th percentiles, not confidence intervals or valuations.
- Coverage dates describe the geographically retained source rows. The yearly file is historical 2025 data and can receive later corrections; `A` is the source record-status code, not a live verification of an active listing.

Retained columns: transaction ID (for traceability), sale price, sale date, outward postcode, property type, category, record status. No owner names, full postcodes, house numbers or streets are retained. The nine fictional homes are separate UI fixtures, never purported matches to HMLR records.

## Reproduction and checks

`node scripts/build-market-summary.mjs` regenerates both browser/JSON aggregates solely from the retained source. `node --test tests/*.test.cjs` checks SHA-256, independent count/group/price reconciliation, allowed columns and the favicon. `python3 -m unittest discover -s tests -p 'test_*.py'` checks the public CSV column mapping and rejects invalid or non-2025 retained sale dates using explicitly synthetic rows.

The projection script reads an already downloaded file; it does not fetch or authenticate that file. Its legacy `source.fetchedAt` field records projection time, not a timestamp supplied by HMLR or the downloader. For this checked-in snapshot, download and projection both occurred on 5 September 2026. The whole-file checksum supports later comparison; refreshed snapshots require a separately verified download from the stated URL.

The full upstream CSV is not committed. Its checksum supports checking a byte-identical saved download; HMLR's mutable yearly URL does not guarantee historic-download availability. Do not claim this snapshot is a complete or current market census, a live feed, property valuation, financial recommendation or proof of listing facts.
