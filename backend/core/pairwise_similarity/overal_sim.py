from core.pairwise_similarity.behavior_vector_sim import behavior_vector_sim
from core.pairwise_similarity.action_sequence_sim import action_sequence_sim


ALPHA = 0.3  # thesis: equal weight


def overall_sim(node_i: dict, node_j: dict) -> float:
    """
    Final similarity:
    S = α * S_var + (1-α) * S_beh
    """

    s_beh = behavior_vector_sim(node_i, node_j)
    s_var = action_sequence_sim(node_i, node_j)

    s = ALPHA * s_var + (1 - ALPHA) * s_beh

    return round(min(1.0, max(0.0, s)), 3)


# =========================
# ICC-level computation
# =========================
def compute_icc_pairwise_similarity(enriched_nodes: dict, icc_components: list):
    """
    Compute similarity ONLY within ICC clusters.

    Output:
    {
        cluster_id: [
            (node_i, node_j, sim),
            ...
        ]
    }
    """

    results = {}

    for cluster in icc_components:
        cluster_id = cluster["cluster_id"]
        nodes = cluster["nodes"]

        results[cluster_id] = []

        n = len(nodes)

        for i in range(n):
            for j in range(i + 1, n):

                ni = nodes[i]
                nj = nodes[j]

                sim = overall_sim(
                    enriched_nodes[ni],
                    enriched_nodes[nj]
                )

                results[cluster_id].append((ni, nj, sim))

    return results