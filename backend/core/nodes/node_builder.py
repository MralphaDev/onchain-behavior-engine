from .node_action_sequence import build_action_sequences
from .node_behavior_vector import build_behavior_vector
from .node_supply_holding import build_supply_holding
from .node_funder import build_node_funder
from .node_cluster_map import build_node_cluster

def build_enriched_nodes(node_set, total_supply,icc_components):

    # =========================
    # action sequence
    # =========================
    action_sequences = build_action_sequences(node_set)

    # =========================
    # behavior vector
    # =========================
    behavior_vectors = build_behavior_vector(node_set)

    # =========================
    # supply holding
    # =========================
    supply_holdings = build_supply_holding(node_set,total_supply)
    
    # =========================
    # funder info    
    # # =========================
    direct_funder = build_node_funder(node_set)
    
    # =========================
    # cluster mapping
    # =========================
    node_clusters = build_node_cluster(node_set, icc_components)

    enriched = {}

    for wallet in node_set:

        enriched[wallet] = {
            "action_sequence": action_sequences.get(wallet, []),

            # =========================
            # behavior features
            # =========================
            "behavior_vector": behavior_vectors.get(wallet, {
                "first_fund_timestamp": 0,
                "first_fund_amount": 0.0,
                "total_tx": 0
            }),

            # =========================
            # supply features
            # =========================
            "supply_holding": supply_holdings.get(wallet, {}),
            "direct_funder": direct_funder.get(wallet, "unknown"),
            
            # =========================
            # cluster id
            "cluster_id": node_clusters.get(wallet, "unknown")
        }

    return enriched