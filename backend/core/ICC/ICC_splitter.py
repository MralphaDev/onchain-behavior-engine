from collections import defaultdict


"""
PURPOSE:
    Find all Independent Connected Components (ICC)

METHOD:
    DFS / stack-based graph traversal
    on an UNDIRECTED graph

INPUT:
    adj = adjacency list

OUTPUT:
    list of components:
    [
        {
            "cluster_id": "cluster_0",
            "nodes": [...],
            "size": int
        }
    ]


-------------------------------------------------------
BUG PREVENTED #1: STRING SPLIT BUG
-------------------------------------------------------
❌ WRONG:
    for nei in adj[node]:

    if adj[node] is accidentally string:
        '0xabc...' -> becomes ['0','x','a','b']

✔ FIX:
    Always ensure neighbors is list


-------------------------------------------------------
BUG PREVENTED #2: DIRECTED GRAPH FRAGMENTATION
-------------------------------------------------------
❌ WRONG:
    A -> B
    B -> C

    DFS traversal order can incorrectly create:
        [A]
        [B, C]

✔ FIX:
    Convert graph into UNDIRECTED graph:
        A <-> B
        B <-> C

    so transitive connectivity is preserved.


-------------------------------------------------------
BUG PREVENTED #3: MISSING NEIGHBOR-ONLY NODES
-------------------------------------------------------
❌ WRONG:
    Iterating only:
        for node in adj:

    misses nodes that appear ONLY as neighbors.

✔ FIX:
    Explicitly collect ALL nodes from:
        - adjacency keys
        - adjacency values
"""


def normalize_undirected_graph(adj):

    graph = defaultdict(set)

    all_nodes = set()

    for src, neighbors in adj.items():

        # Prevent accidental string iteration bug
        if isinstance(neighbors, str):
            neighbors = [neighbors]

        # Handle None safely
        if neighbors is None:
            neighbors = []

        all_nodes.add(src)

        for dst in neighbors:

            if dst is None:
                continue

            # Convert directed edge into undirected edge
            graph[src].add(dst)
            graph[dst].add(src)

            all_nodes.add(dst)

    # Ensure isolated nodes exist in graph
    for node in all_nodes:
        graph[node]

    return graph


def find_icc_components(adj):

    graph = normalize_undirected_graph(adj)

    visited = set()
    components = []

    cluster_i = 0

    for node in graph:

        if node in visited:
            continue

        stack = [node]
        component = set()

        while stack:

            cur = stack.pop()

            if cur in visited:
                continue

            visited.add(cur)
            component.add(cur)

            neighbors = graph.get(cur, [])

            # Extra protection against malformed data
            if isinstance(neighbors, str):
                neighbors = [neighbors]

            for nei in neighbors:

                if nei not in visited:
                    stack.append(nei)

        components.append({
            "cluster_id": f"cluster_{cluster_i}",
            "nodes": list(component),
            "size": len(component)
        })

        cluster_i += 1

    return components