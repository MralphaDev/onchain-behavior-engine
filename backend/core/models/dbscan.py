import numpy as np
from sklearn.cluster import DBSCAN


# ============================================================
# Convert similarity list → full matrix
# ============================================================
def build_matrix(nodes, similarity_list):
    """
    nodes: [addr1, addr2, ...]
    similarity_list: [(a, b, sim), ...]
    """

    n = len(nodes)
    idx = {node: i for i, node in enumerate(nodes)}

    # init with 0
    sim_matrix = np.zeros((n, n))

    # fill diagonal
    for i in range(n):
        sim_matrix[i][i] = 1.0

    # fill from list
    for a, b, sim in similarity_list:
        if a in idx and b in idx:
            i, j = idx[a], idx[b]
            sim_matrix[i][j] = sim
            sim_matrix[j][i] = sim  # symmetric

    return sim_matrix


# ============================================================
# similarity → distance
# ============================================================
def similarity_to_distance(sim_matrix):
    return 1 - sim_matrix


# ============================================================
# MAIN
# ============================================================
def run_icc_dbscan(icc_components, icc_similarity, eps=0.3, min_samples=2):

    results = []

    for cluster in icc_components:
        cluster_id = cluster["cluster_id"]
        nodes = cluster["nodes"]

        # edge case
        if len(nodes) <= 1:
            results.append({
                "cluster_id": cluster_id,
                "labels": {nodes[0]: 0} if nodes else {},
                "size": len(nodes),
                "n_clusters": 1 if nodes else 0
            })
            continue

        # ✅ THIS is the correct format (list, not dict)
        sim_list = icc_similarity.get(cluster_id, [])

        # build matrix
        sim_matrix = build_matrix(nodes, sim_list)

        # convert
        dist_matrix = similarity_to_distance(sim_matrix)

        # DBSCAN
        model = DBSCAN(
            eps=eps,
            min_samples=min_samples,
            metric="precomputed"
        )

        labels = model.fit_predict(dist_matrix)

        results.append({
            "cluster_id": cluster_id,
            "labels": {
                nodes[i]: int(labels[i]) for i in range(len(nodes))
            },
            "size": len(nodes),
            "n_clusters": len(set(labels)) - (1 if -1 in labels else 0)
        })

    return results