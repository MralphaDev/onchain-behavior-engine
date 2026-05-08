"""
PURPOSE:
    Build wallet -> cluster_id mapping

INPUT:
    node_set:
        iterable of wallet addresses

    icc_components:
        [
            {
                "cluster_id": "cluster_0",
                "nodes": [...],
                "size": int
            }
        ]

OUTPUT:
    {
        "0xabc...": "cluster_0",
        "0xdef...": "cluster_0",
        "0xghi...": None
    }

NOTES:
    - isolated nodes remain None
    - only ICCs with size >= 2 should exist
"""


def build_node_cluster(node_set, icc_components):

    node_cluster_map = {}

    # =========================
    # default all nodes -> None
    # =========================
    for wallet in node_set:
        node_cluster_map[wallet] = None

    # =========================
    # assign cluster ids
    # =========================
    for component in icc_components:

        cluster_id = component.get("cluster_id")
        nodes = component.get("nodes", [])

        # extra safety
        if not cluster_id:
            continue

        if not isinstance(nodes, list):
            continue

        for wallet in nodes:

            # only map known wallets
            if wallet in node_cluster_map:
                node_cluster_map[wallet] = cluster_id

    return node_cluster_map