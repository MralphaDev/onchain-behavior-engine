import os
import csv


def build_node_funder(node_set):

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    event_log_path = os.path.join(BASE_DIR, "event_log.csv")

    result = {}

    # =========================
    # fallback init
    # =========================
    for wallet in node_set:
        result[wallet] = "unknown"

    if not os.path.exists(event_log_path):
        return result

    # =========================
    # scan CSV
    # =========================
    with open(event_log_path, "r", newline="") as f:
        reader = csv.DictReader(f)
        next(reader, None)  # ✅ skip header

        seen = set()

        for row in reader:

            wallet = (row.get("wallet") or "").lower()

            if not wallet:
                continue

            if wallet not in node_set:
                continue

            # 已经拿过 first fund 就跳过
            if wallet in seen:
                continue

            from_addr = (row.get("from_address") or "").lower()

            if from_addr:
                result[wallet] = from_addr

            seen.add(wallet)

    return result