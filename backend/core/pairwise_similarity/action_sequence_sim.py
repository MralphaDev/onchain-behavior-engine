def levenshtein(a, b):
    if a == b:
        return 1.0

    if len(a) == 0:
        return 0.0 if len(b) > 0 else 1.0
    if len(b) == 0:
        return 0.0

    dp = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]

    for i in range(len(a) + 1):
        dp[i][0] = i
    for j in range(len(b) + 1):
        dp[0][j] = j

    for i in range(1, len(a) + 1):
        for j in range(1, len(b) + 1):
            cost = 0 if a[i - 1] == b[j - 1] else 1

            dp[i][j] = min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            )

    dist = dp[-1][-1]
    max_len = max(len(a), len(b))

    return 1 - (dist / max_len)


# =========================================================
# ACTION SEQUENCE SIMILARITY
# =========================================================
def action_sequence_sim(node_i, node_j):
    a = node_i.get("action_sequence", [])
    b = node_j.get("action_sequence", [])

    return round(levenshtein(a, b), 3)