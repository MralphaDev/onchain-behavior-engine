from collections import defaultdict

# =========================================================
# STEP 1: BUILD EDGES (single source of truth)
# =========================================================
def build_edges(wallet_funder_map):
    """
    PURPOSE:
        Convert wallet_funder_map -> edge list

    STRUCTURE:
        (funder -> wallet)

    WHY THIS STEP EXISTS:
        - Ensures graph has ONE canonical representation
        - Avoids mixing adjacency construction logic with raw data

    BUGS PREVENTED:
        ❌ prevents accidental string iteration bugs
        ❌ prevents malformed adjacency lists
        ❌ avoids mixing dict/list structures upstream
    """

    edges = []

    for wallet, funder in wallet_funder_map.items():
        if wallet and funder and wallet != funder: # prevent self-loop and empty values
            edges.append((funder, wallet))

    return edges


# =========================================================
# STEP 2: BUILD NODE SET (derived from edges ONLY)
# =========================================================
def build_nodes(edges):
    """
    PURPOSE:
        Extract unique nodes from edges

    WHY THIS STEP EXISTS:
        - nodes MUST be derived, not manually tracked
        - ensures consistency between graph layers

    BUGS PREVENTED:
        ❌ prevents fake nodes like 'a', 'b', '4', 'x'
        ❌ prevents contamination from string iteration
    """

    nodes = set()

    for u, v in edges:
        nodes.add(u)
        nodes.add(v)

    return list(nodes)


# =========================================================
# STEP 3: BUILD ADJACENCY LIST (for graph algorithms)
# =========================================================
def build_adj(edges):
    """
    PURPOSE:
        Convert edges -> adjacency list

    WHY THIS STEP EXISTS:
        - adjacency list = optimal structure for DFS / ICC / BFS

    BUGS PREVENTED:
        ❌ prevents O(n^2) neighbor lookup
        ❌ avoids scanning full edge list repeatedly
        ❌ avoids incorrect graph traversal logic
    """

    adj = defaultdict(list)

    for u, v in edges:
        adj[u].append(v)
        #adj[v].append(u)  # undirected graph

    return dict(adj)


# =========================================================
# STEP 4: FULL GRAPH BUILDER (single entry point)
# =========================================================
def build_graph(wallet_funder_map):
    """
    PURPOSE:
        Build full graph object in correct order

    FLOW:
        wallet_funder_map
            -> edges (truth layer)
            -> nodes (derived)
            -> adj (algorithm layer)

    BUGS PREVENTED:
        ❌ prevents inconsistent graph states
        ❌ prevents mixing raw + derived structures
        ❌ enforces deterministic pipeline
    """

    edges = build_edges(wallet_funder_map)
    nodes = build_nodes(edges)
    adj = build_adj(edges)

    return {
        "nodes": nodes,
        "edges": edges,
        "adj": adj
    }