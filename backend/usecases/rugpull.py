import csv
import io
import os
from core.utils.cluster_supply import compute_icc_supply_concentration
from core.utils.wallet_funder_map import build_wallet_funder_map
from core.preprocessing.input_csv_cleaner import clean_rows
from core.preprocessing.exchange_wallet_extractor import extract_exchange_wallets
from core.data_source.alchemy_client import process_wallets
from core.data_source.alchemy_client import get_token_total_supply
from core.graph.funder_expansion import build_node_set
from core.graph.funder_graph_builder import build_graph
from core.ICC.ICC_splitter import find_icc_components
from core.nodes.node_builder import build_enriched_nodes
from core.pairwise_similarity.overal_sim import compute_icc_pairwise_similarity
from core.models.dbscan import run_icc_dbscan
from core.backtracking.backtrack import cluster_backtracking

#brett
#0x532f27101965dd16442E59d40670FaF5eBB142E4

#myx
#0xD82544bf0dfe8385eF8FA34D67e6e4940CC63e16

def rows_to_csv_string(rows):
    if not rows:
        return ""

    output = io.StringIO()

    fieldnames = rows[0].keys()

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

    return output.getvalue()



# =========================
# MAIN ORCHESTRATOR
# =========================
def run_rugpull(csv_bytes, token_contract, start_date=None, end_date=None):

    # -------------------------
    # 1. 解析 CSV bytes → rows
    # -------------------------
    text = csv_bytes.decode("utf-8-sig").splitlines()
    reader = csv.DictReader(text)
    rows = list(reader)

    # -------------------------
    # 2. 提取 exchange wallets (NEW ADDITION)
    # -------------------------
    exchange_wallets = extract_exchange_wallets(rows)

    # -------------------------
    # 3. 清洗数据（过滤无效钱包）
    # -------------------------
    cleaned_rows = clean_rows(rows)

    # ============================================================
    #  ALCHEMY CALL （pass cleaned addresses in, we get a event_log at root folder. 
    # ============================================================
    
    process_wallets(cleaned_rows, token_contract, start_date, end_date)
    total_supply = get_token_total_supply(token_contract)
    
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    event_log_path = os.path.join(BASE_DIR, "event_log.csv")
    
    # ============================================================
    # 构建 funder map
    # ============================================================

    wallet_funder_map = build_wallet_funder_map(event_log_path)
    
    # ============================================================
    # node set（input wallet + funder wallet set, the node here does not contain any behavioral features, 
    # it's just a set of unique wallet addresses for downstream graph construction and clustering）
    # ============================================================
        
    node_set = build_node_set(wallet_funder_map)
    
    # ============================================================
    #  graph
    # ============================================================
    graph = build_graph(wallet_funder_map)
    

     # =====================================================
    # ICC clustering
    # =====================================================
    icc_components = find_icc_components(graph["adj"])
    
    # ============================================================
    # Build enriched Node set with behavioral features 
    # ============================================================
    enriched_nodes = build_enriched_nodes(node_set, total_supply,icc_components)
    
    # ============================================================
    # ICC-level Pairwise Similarity Computation
    # ============================================================


    icc_similarity = compute_icc_pairwise_similarity(
        enriched_nodes,
        icc_components
    )
    
    # ============================================================
    # ICC-level Supply Concentration Computation 
    # ============================================================
    
    icc_supply_stats = compute_icc_supply_concentration(
        enriched_nodes,
        icc_components
    )
    # ============================================================
    # 4. ICC DBSCAN Clustering (基于行为相似度 + 供给集中度的综合相似度矩阵，进行 DBSCAN 聚类，得到最终的 ICC clusters)
    # ============================================================
    
    icc_dbscan_clusters = run_icc_dbscan(
        icc_components,
        icc_similarity,
        eps=0.2,
        min_samples=2
    )
    
    # ============================================================
    # 5. Backtracking to find root funders for each wallet in ICC clusters
    # ============================================================
    funder_backtrack = cluster_backtracking(
        graph=graph,
        icc_clusters=icc_dbscan_clusters,
        exchange_wallets=exchange_wallets
    )
    

    # -------------------------
    # 4. 转回 CSV（方便调试 / 下载）
    # -------------------------
    cleaned_csv = rows_to_csv_string(cleaned_rows)
    
    # -------------------------
    # 5. 返回结果（用于 API）
    # -------------------------
    return {
        "status": "rugpull parsed",
        "start_date": start_date,
        "end_date": end_date,
        
        "total_supply": total_supply,
        #"cleaned_csv": cleaned_csv,
        "exchange_wallets": exchange_wallets,
        
        #"wallet_funder_map": wallet_funder_map,
        "node_set": node_set,
        "node_count": len(node_set),
        "graph": graph,
        "icc_components": icc_components,
        "enriched_nodes": enriched_nodes,
        
        "icc_similarity": icc_similarity,
        "icc_supply_stats": icc_supply_stats,
        
        "icc_dbscan_clusters": icc_dbscan_clusters,
        "funder_backtrack": funder_backtrack

    }
