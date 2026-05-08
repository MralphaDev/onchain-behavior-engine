def clean_rows(rows, supply_threshold=0.000):
    cleaned = []
    seen_addresses = set()
    seen_tx_hashes = set()   # 🔥 NEW DEDUP LAYER

    drop_fields = {
        "cluster_id",
        "historic_transfers_in",
        "historic_transfers_out",
        "historic_tranfers_in",
        "historic_tranfers_out",
        "is_visible",
        "name",
        "token_amount",
        "type",
        "supply_percentage",
        "is_contract",
        "is_exchange"
    }

    for row in rows:

        # -------------------------
        # 1. address normalize
        # -------------------------
        address = row.get("address", "").strip().lower()

        # -------------------------
        # 2. tx-level dedup (NEW IMPORTANT)
        # -------------------------
        tx_hash = row.get("hash") or row.get("tx_hash") or ""
        if tx_hash:
            tx_hash = tx_hash.strip().lower()
            if tx_hash in seen_tx_hashes:
                continue

        # -------------------------
        # 3. basic filters
        # -------------------------
        if not address or address in seen_addresses:
            continue

        is_exchange = str(row.get("is_exchange", "")).strip().lower() == "true"
        if is_exchange:
            continue

        try:
            supply_percentage = float(row.get("supply_percentage", 0))
        except:
            supply_percentage = 0

        if supply_percentage < supply_threshold:
            continue

        is_contract = str(row.get("is_contract", "")).strip().lower() == "true"
        if is_contract:
            continue

        # -------------------------
        # 4. clean schema
        # -------------------------
        new_row = {
            k: v for k, v in row.items()
            if k not in drop_fields
        }

        new_row["address"] = address

        # -------------------------
        # 5. commit
        # -------------------------
        cleaned.append(new_row)
        seen_addresses.add(address)

        if tx_hash:
            seen_tx_hashes.add(tx_hash)

    return cleaned

'''def clean_rows(rows, supply_threshold=0.001):
    cleaned = []
    seen = set()

    # 需要移除的字段（降噪）
    drop_fields = {
        "cluster_id",
        # 两种拼写都删，bubblemap里有的 csv 里是 "transfers"，有的 csv 里是 "tranfers"
        "historic_transfers_in",
        "historic_transfers_out",
        "historic_tranfers_in",
        "historic_tranfers_out",
        "is_visible",
        "name",
        "token_amount",
        "type",
        "supply_percentage",
        "is_contract",
        "is_exchange"   # 👈 still removed from output
    }

    for row in rows:

        # -------------------------
        # 1. 提取并标准化 address
        # -------------------------
        address = row.get("address", "").strip().lower()

        # -------------------------
        # 2. 基础过滤
        # -------------------------
        if not address or address in seen:
            continue

        # -------------------------
        # 🚨 NEW: exchange wallet filter (IMPORTANT)
        # -------------------------
        is_exchange = str(row.get("is_exchange", "")).strip().lower() == "true"
        if is_exchange:
            continue   # 👈 THIS is the missing logic

        # -------------------------
        # 3. supply 过滤
        # -------------------------
        try:
            supply_percentage = float(row.get("supply_percentage", 0))
        except:
            supply_percentage = 0

        if supply_percentage < supply_threshold:
            continue

        # -------------------------
        # 4. contract 过滤
        # -------------------------
        is_contract = str(row.get("is_contract", "")).strip().lower() == "true"
        if is_contract:
            continue

        # -------------------------
        # 5. schema 清理
        # -------------------------
        new_row = {
            k: v for k, v in row.items()
            if k not in drop_fields
        }

        # -------------------------
        # 6. normalize address
        # -------------------------
        new_row["address"] = address

        # -------------------------
        # 7. collect
        # -------------------------
        cleaned.append(new_row)
        seen.add(address)

    return cleaned '''