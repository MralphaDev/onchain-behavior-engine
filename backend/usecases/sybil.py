import csv
import io

def run_sybil(csv_bytes, token_contract):
    print("\n=== SYBIL DEBUG ===")
    print("token_contract:", token_contract)

    text = csv_bytes.decode("utf-8-sig").splitlines()
    reader = csv.DictReader(text)

    rows = list(reader)

    print("columns:", reader.fieldnames)
    print("row_count:", len(rows))

    if rows:
        print("sample_row:", rows[0])

    return {
        "status": "sybil parsed",
        "row_count": len(rows)
    }