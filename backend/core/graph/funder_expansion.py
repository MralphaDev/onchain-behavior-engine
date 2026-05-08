# core/graph/funder_expansion.py

def build_node_set(wallet_funder_map: dict) -> set:
    """
    Create a deduplicated node set from wallet_funder_map.

    Input:
        {wallet: funder}

    Output:
        set of all unique addresses (wallets + funders)
    """

    node_set = set()

    for wallet, funder in wallet_funder_map.items():
        if wallet:
            node_set.add(wallet.lower())

        if funder:
            node_set.add(funder.lower())

    return node_set