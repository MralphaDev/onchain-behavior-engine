import os
import csv


def build_behavior_vector(node_set):

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    event_log_path = os.path.join(BASE_DIR, "event_log.csv")

    result = {}

    # =========================================================
    # INIT: minimal feature set ONLY
    # ---------------------------------------------------------
    # We keep ONLY what you requested:
    # - total_tx
    # - first_fund_timestamp (in MINUTES)
    # - first_fund_amount
    # =========================================================
    for wallet in node_set:
        result[wallet] = {
            "first_fund_timestamp": 0,  # in MINUTES (for clustering)
            "first_fund_amount": 0.0,
            "total_tx": 0
        }

    if not os.path.exists(event_log_path):
        return result

    # =========================================================
    # STREAM CSV (no change in logic)
    # =========================================================
    with open(event_log_path, "r", newline="") as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header

        for row in reader:
            if not row or len(row) < 11:
                continue

            wallet = row[0].lower()

            if wallet not in node_set:
                continue

            # ---------------------------------------------------------
            # RAW TIMESTAMP (SECONDS from blockchain)
            # ---------------------------------------------------------
            try:
                timestamp = int(row[5]) if row[5] else 0
            except:
                timestamp = 0

            # ---------------------------------------------------------
            # AMOUNT (native value)
            # ---------------------------------------------------------
            try:
                amount = float(row[10]) if row[10] else 0.0
            except:
                amount = 0.0

            # =========================================================
            # CONVERT TO MINUTES (FOR CLUSTERING ONLY)
            # ---------------------------------------------------------
            # Why:
            # - removes second-level noise
            # - preserves launch wave structure
            # =========================================================
            minute_timestamp = timestamp // 60 if timestamp else 0

            # =========================================================
            # FIRST FUND LOGIC (UNCHANGED BEHAVIOR)
            # ---------------------------------------------------------
            # We only capture the FIRST observed transaction
            # per wallet (important for cohort analysis)
            # =========================================================
            if result[wallet]["total_tx"] == 0:
                result[wallet]["first_fund_timestamp"] = minute_timestamp
                result[wallet]["first_fund_amount"] = amount

            # =========================================================
            # TOTAL TRANSACTION COUNT
            # =========================================================
            result[wallet]["total_tx"] += 1

    return result