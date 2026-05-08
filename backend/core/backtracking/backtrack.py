from collections import defaultdict


# =========================
# build reverse graph
# =========================
def build_reverse_adj(graph):
    reverse_adj = defaultdict(list)

    for u, neighbors in graph["adj"].items():
        for v in neighbors:
            reverse_adj[v].append(u)

    return dict(reverse_adj)


# =========================
# DFS backtracking (correct)
# =========================
def backtrack_node(node, reverse_adj, exchange_set, visited):
    """
    Return ALL top-most funders for a node
    stopping at exchange wallets
    """

    stack = [node]
    roots = set()

    while stack:
        cur = stack.pop()

        if cur in visited:
            continue
        visited.add(cur)

        # 🚨 STOP CONDITION: exchange wallet
        if cur in exchange_set:
            roots.add(cur)
            continue

        parents = reverse_adj.get(cur)

        # 🚨 TRUE ROOT (no incoming edges)
        if not parents:
            roots.add(cur)
            continue

        for p in parents:
            stack.append(p)

    return roots


# =========================
# MAIN
# =========================
def cluster_backtracking(graph, icc_clusters, exchange_wallets):

    reverse_adj = build_reverse_adj(graph)
    exchange_set = set(exchange_wallets)

    result = {}

    for cluster in icc_clusters:

        cluster_id = cluster["cluster_id"]
        labels = cluster["labels"]

        label_groups = defaultdict(list)

        for wallet, label in labels.items():
            if label == -1:
                continue
            label_groups[label].append(wallet)

        cluster_output = {}

        for label, wallets in label_groups.items():

            visited = set()
            roots_set = set()

            for wallet in wallets:
                roots_set.update(
                    backtrack_node(
                        wallet,
                        reverse_adj,
                        exchange_set,
                        visited
                    )
                )

            # 🔥 IMPORTANT: ALWAYS INCLUDE EVEN IF EMPTY
            cluster_output[f"subg{label}"] = list(roots_set)

        result[cluster_id] = cluster_output

    return result