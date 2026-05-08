def extract_exchange_wallets(rows):
    """
    提取 exchange wallets（用于 graph traversal control）
    """

    exchanges = set()

    for row in rows:
        address = row.get("address", "").strip().lower()
        
        if str(row.get("type", "")).strip().lower() == "time":
            continue
        
        if not address:
            continue

        is_exchange = str(row.get("is_exchange", "")).strip().lower() == "true"

        if is_exchange:
            exchanges.add(address)

    return list(exchanges)