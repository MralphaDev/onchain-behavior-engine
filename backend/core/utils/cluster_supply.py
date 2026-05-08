def compute_icc_supply_concentration(enriched_nodes: dict, icc_components: list):
    """
    Compute total holding percentage per ICC cluster.

    Output:
    {
        cluster_id: {
            "cluster_supply_percentage": float,
            "node_count": int
        }
    }
    """

    results = {}

    for cluster in icc_components:
        cluster_id = cluster["cluster_id"]
        nodes = cluster["nodes"]

        total_holding = 0.0
        valid_nodes = 0

        for node in nodes:
            node_data = enriched_nodes.get(node)

            if not node_data:
                continue

            holding = node_data.get("supply_holding", {}).get("holding_percentage", 0.0)

            total_holding += holding
            valid_nodes += 1

        results[cluster_id] = {
            "cluster_supply_percentage": round(total_holding, 6),
            "node_count": valid_nodes
        }

    return results