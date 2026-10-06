"""Synthetic format checks; these rows are not presented as observed sales."""
import csv
import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("retain", Path(__file__).parents[1] / "scripts/retain-price-paid.py")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class SourceProjectionTests(unittest.TestCase):
    def test_rejects_wrong_year_and_invalid_retained_dates(self):
        for sale_date in ("2024-12-31 00:00", "2026-01-01 00:00", "2025-02-30 00:00", "not-a-date"):
            with self.subTest(sale_date=sale_date), tempfile.TemporaryDirectory() as folder:
                path = Path(folder) / "synthetic.csv"
                with path.open("w", newline="") as stream:
                    csv.writer(stream).writerow(["{synthetic-1}", "300000", sale_date, "SO23 1AA", "T", "N", "F", "1", "", "EXAMPLE STREET", "", "WINCHESTER", "WINCHESTER", "HAMPSHIRE", "A", "A"])
                with self.assertRaisesRegex(ValueError, "2025 sale date"):
                    module.retain(path)

    def test_standard_hmlr_columns_and_address_minimisation(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "synthetic.csv"
            with path.open("w", newline="") as stream:
                writer = csv.writer(stream)
                writer.writerow(["{synthetic-1}", "300000", "2025-01-01 00:00", "SO23 1AA", "T", "N", "F", "1", "", "EXAMPLE STREET", "", "WINCHESTER", "WINCHESTER", "HAMPSHIRE", "A", "A"])
            result = module.retain(path)
            self.assertEqual(result["coverage"]["downloadRecords"], 1)
            self.assertEqual(result["records"][0]["postcode"], "SO23")
            self.assertEqual(result["records"][0]["propertyType"], "terraced")
            self.assertNotIn("EXAMPLE STREET", str(result))


if __name__ == "__main__":
    unittest.main()
