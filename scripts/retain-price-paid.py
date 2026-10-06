#!/usr/bin/env python3
"""Project an explicitly supplied public HMLR yearly CSV into address-minimized data."""
import argparse
import csv
from datetime import date, datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
URL = "https://price-paid-data.publicdata.landregistry.gov.uk/pp-2025.csv"
PREFIXES = ["SO21", "SO22", "SO23"]
TYPES = {"D": "detached", "S": "semi-detached", "T": "terraced", "F": "flat-maisonette", "O": "other"}


def retain(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    records, total = [], 0
    with path.open(encoding="utf-8-sig", newline="") as source:
        for row in csv.reader(source):
            total += 1
            if len(row) != 16:
                raise ValueError(f"Expected 16 HMLR columns at row {total}; got {len(row)}")
            area = row[3].split()[0] if row[3].split() else ""
            if row[12] != "WINCHESTER" or area not in PREFIXES:
                continue
            try:
                sale_date = date.fromisoformat(row[2][:10])
            except ValueError as error:
                raise ValueError(f"Expected a valid 2025 sale date at row {total}") from error
            if sale_date.year != 2025:
                raise ValueError(f"Expected a 2025 sale date at row {total}; got {sale_date}")
            records.append({"id": row[0], "price": int(row[1]), "date": sale_date.isoformat(),
                            "postcode": area, "propertyType": TYPES[row[4]],
                            "category": row[14], "recordStatus": row[15]})
    if not records or len({row["id"] for row in records}) != len(records):
        raise ValueError("No matching records or duplicate transaction IDs in yearly snapshot")
    records.sort(key=lambda row: row["id"])
    dates = [row["date"] for row in records]
    return {
        "source": {
            "name": "HM Land Registry Price Paid Data", "downloadUrl": URL,
            "landingPage": "https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads",
            "licence": "Open Government Licence v3.0",
            "attribution": "Contains HM Land Registry data © Crown copyright and database right 2021. This data is licensed under the Open Government Licence v3.0.",
            "fetchedAt": datetime.now(timezone.utc).isoformat(), "years": [2025],
            "downloadSha256": digest.hexdigest(),
            "projection": "WINCHESTER district and SO21/SO22/SO23 outward postcodes; retain transaction ID, price, sale date, outward postcode, type, category and record status only.",
        },
        "coverage": {"district": "WINCHESTER", "postcodePrefixes": PREFIXES,
                     "downloadRecords": total, "excludedByGeography": total - len(records),
                     "records": len(records), "earliestSale": min(dates), "latestSale": max(dates)},
        "caveats": ["Historical 2025 completed sales, not current listings or a valuation.",
                    "Registration delays and subsequent corrections can change the source yearly file.",
                    "These records are unrelated to the nine fictional shortlisted homes.",
                    "Outward postcode areas are retained for residential price comparison; full addresses are omitted."],
        "records": records,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv", type=Path, help=f"Public CSV downloaded from {URL}")
    args = parser.parse_args()
    output = retain(args.csv)
    (ROOT / "data" / "price-paid-source.json").write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(f"Retained {len(output['records'])}/{output['coverage']['downloadRecords']} public records")
