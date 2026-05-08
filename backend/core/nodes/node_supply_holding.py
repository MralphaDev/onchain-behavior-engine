import os
import csv
from collections import defaultdict


NATIVE_ASSETS = {"ETH", "BNB"}


def normalize_asset(asset):
    if not asset:
        return ""
    return asset.strip().upper()


def build_supply_holding(node_set, total_supply):

    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    event_log_path = os.path.join(BASE_DIR, "event_log.csv")

    result = {}

    # =========================
    # init fallback
    # =========================
    for wallet in node_set:
        result[wallet] = {
            "net_non_native_flow": 0.0,
            "in_amount": 0.0,
            "out_amount": 0.0,
            "holding_percentage": 0.0   # ✅ NEW
        }

    if not os.path.exists(event_log_path):
        return result

    # =========================
    # scan CSV
    # =========================
    with open(event_log_path, "r", newline="") as f:
        reader = csv.reader(f)

        for row in reader:
            if not row or len(row) < 11:
                continue

            wallet = row[0].lower()

            if wallet not in node_set:
                continue

            direction = row[8]
            asset = normalize_asset(row[9])

            # filter native
            if asset in NATIVE_ASSETS:
                continue

            try:
                amount = float(row[10]) if row[10] else 0.0
            except:
                amount = 0.0

            if direction == "in":
                result[wallet]["in_amount"] += amount
                result[wallet]["net_non_native_flow"] += amount

            elif direction == "out":
                result[wallet]["out_amount"] += amount
                result[wallet]["net_non_native_flow"] -= amount

    # =========================
    # COMPUTE PERCENTAGE (NEW)
    # =========================
    if total_supply and total_supply > 0:
        for wallet in result:
            net = result[wallet]["net_non_native_flow"]
            result[wallet]["holding_percentage"] = net / total_supply
    else:
        # fallback already 0
        pass

    return result