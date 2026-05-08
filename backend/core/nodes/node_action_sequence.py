import os
import csv
from collections import defaultdict


def build_action_sequences(node_set):
    """
    返回：
    {
        wallet: [method_id1, method_id2, ...]
    }
    """

    # =========================
    # 定位 event_log.csv
    # =========================
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    event_log_path = os.path.join(BASE_DIR, "event_log.csv")

    if not os.path.exists(event_log_path):
        return {}

    wallet_txs = defaultdict(list)

    # =========================
    # 读取 CSV
    # =========================
    with open(event_log_path, "r", newline="") as f:
        reader = csv.reader(f)
        
        next(reader, None)  # ✅ skip header


        for row in reader:
            if not row or len(row) < 8:
                continue

            wallet = row[0].lower()
            timestamp = int(row[5]) if row[5] else 0
            method_id = row[7]

            # 只处理 node_set 内的钱包
            if wallet in node_set:
                wallet_txs[wallet].append((timestamp, method_id))

    # =========================
    # 排序 + 提取 sequence
    # =========================
    action_sequences = {}

    for wallet, txs in wallet_txs.items():
        # 按时间排序
        txs_sorted = sorted(txs, key=lambda x: x[0])

        # 只取 method_id
        sequence = [m for _, m in txs_sorted]

        action_sequences[wallet] = sequence

    return action_sequences