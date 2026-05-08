# backend/utils/wallet_funder_map.py

import csv
from collections import OrderedDict


def build_wallet_funder_map(event_log_path: str) -> dict:
    """
    Build mapping:
        wallet_address -> direct_funder (first observed funder only)

    Assumption:
        event_log.csv is already time-sorted ascending
        (if not, we rely on first occurrence in file)
    """

    wallet_map = OrderedDict()

    with open(event_log_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)

        for row in reader:
            wallet = row.get("wallet")
            funder = row.get("from_address")

            if not wallet or not funder:
                continue

            # only keep FIRST occurrence
            if wallet not in wallet_map:
                wallet_map[wallet] = funder

    return dict(wallet_map)