import math

# =========================================================
# FEATURE 1: TRANSACTION COUNT SIMILARITY
# s_tx(i, j) = min(tx_i, tx_j) / max(tx_i, tx_j)
# =========================================================
def tx_similarity(tx_i, tx_j):
    if tx_i == 0 and tx_j == 0:
        return 1.0
    if tx_i == 0 or tx_j == 0:
        return 0.0

    return min(tx_i, tx_j) / max(tx_i, tx_j)


# =========================================================
# FEATURE 2: FIRST FUND AMOUNT SIMILARITY
# s_amt(i, j)
# =========================================================
def amount_similarity(amt_i, amt_j, delta=0.002):
    # treat negligible values as identical
    if max(amt_i, amt_j) <= delta:
        return 1.0

    if amt_i == 0 or amt_j == 0:
        return 0.0

    return min(amt_i, amt_j) / max(amt_i, amt_j)


# =========================================================
# FEATURE 3: FIRST FUND TIME SIMILARITY
# NOTE:
# timestamps are already in MINUTES in your system
# =========================================================
def time_similarity(t_i, t_j, lambda_=2.2):
    diff = abs(t_i - t_j)

    if diff <= 5:
        return 1.0

    return math.exp(-(diff - 5) / lambda_)


# =========================================================
# MAIN: BEHAVIOR VECTOR SIMILARITY
# S_beh = w1*tx + w2*amt + w3*time
# =========================================================
def behavior_vector_sim(node_i, node_j, weights=(1/3, 1/3, 1/3)):
    w1, w2, w3 = weights

    b1 = node_i.get("behavior_vector", {})
    b2 = node_j.get("behavior_vector", {})

    tx_i, tx_j = b1.get("total_tx", 0), b2.get("total_tx", 0)
    amt_i, amt_j = b1.get("first_fund_amount", 0), b2.get("first_fund_amount", 0)

    # IMPORTANT: already MINUTES in my design
    t_i, t_j = b1.get("first_fund_timestamp", 0), b2.get("first_fund_timestamp", 0)

    s_tx = tx_similarity(tx_i, tx_j)
    s_amt = amount_similarity(amt_i, amt_j)
    s_time = time_similarity(t_i, t_j)

    score = (w1 * s_tx) + (w2 * s_amt) + (w3 * s_time)

    return round(min(max(score, 0.0), 1.0), 3)