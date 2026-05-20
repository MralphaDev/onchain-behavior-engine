import requests
import csv
import os
from datetime import datetime
import json



# =========================
# CONFIG
# =========================
CHAIN = "bnb" # "base", "eth", "bnb"
LIMIT = 5  # Alchemy API max limit per request

#brett
#0x532f27101965dd16442E59d40670FaF5eBB142E4

#myx
#0xD82544bf0dfe8385eF8FA34D67e6e4940CC63e16

# =========================
# TX CACHE FILE
# =========================
TX_CACHE_FILE = "tx_cache.json"

# =========================
# BLOCK CACHE FILE
# =========================
BLOCK_CACHE_FILE = "block_cache.json"


API_KEY = "MVoVpT6qMNlUJciBeaf1C"

CHAIN_CONFIG = {
    "base": f"https://base-mainnet.g.alchemy.com/v2/{API_KEY}",
    "eth": f"https://eth-mainnet.g.alchemy.com/v2/{API_KEY}",
    "bnb": f"https://bnb-mainnet.g.alchemy.com/v2/{API_KEY}"
}

URL = CHAIN_CONFIG[CHAIN]
OUTPUT_FILE = "event_log.csv"

# =========================
# SIMPLE IN-MEMORY CACHE (NEW)
# =========================
_tx_cache = {}
_block_cache = {}

def load_cache():
    global _tx_cache, _block_cache

    # --- TX CACHE ---
    if os.path.exists(TX_CACHE_FILE):
        try:
            with open(TX_CACHE_FILE) as f:
                _tx_cache = json.load(f)
        except:
            print("⚠️ tx_cache.json corrupted → resetting")
            _tx_cache = {}

    # --- BLOCK CACHE ---
    if os.path.exists(BLOCK_CACHE_FILE):
        try:
            with open(BLOCK_CACHE_FILE) as f:
                _block_cache = json.load(f)
        except:
            print("⚠️ block_cache.json corrupted → resetting")
            _block_cache = {}


def save_cache():
    with open(TX_CACHE_FILE, "w") as f:
        json.dump(_tx_cache, f)

    with open(BLOCK_CACHE_FILE, "w") as f:
        json.dump(_block_cache, f)


# =========================
# RPC CALL (OPTIMIZED: SAFE CACHE LAYER)
# =========================
def rpc_call(method, params):
    key = f"{method}:{json.dumps(params, sort_keys=True)}"

    # ❗ cache hit → no CU cost
    if key in _tx_cache:
        return _tx_cache[key]

    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }

    try:
        r = requests.post(URL, json=payload, timeout=10)
        result = r.json().get("result")

        # cache result
        _tx_cache[key] = result
        return result

    except:
        return None


# =========================
# DATE PARSER
# =========================
def parse_date(date_str):
    if not date_str:
        return None
    return int(datetime.strptime(date_str, "%Y-%m-%d").timestamp())


# =========================
# RAW TX FETCH (UNCHANGED LOGIC + CACHE EFFECT)
# =========================
def get_raw_tx(tx_hash):
    return rpc_call("eth_getTransactionByHash", [tx_hash])


# =========================
# METHOD ID
# =========================
def extract_method_id_from_raw_tx(raw_tx):
    if not raw_tx:
        return "unknown"

    input_data = raw_tx.get("input", "")

    if not input_data or input_data == "0x":
        return "0x"

    if not input_data.startswith("0x"):
        input_data = "0x" + input_data

    return input_data[:10].lower()


# =========================
# BLOCK TIME (OPTIMIZED CACHE)
# =========================
def get_block_time(block_hex):
    if not block_hex:
        return None

    if block_hex in _block_cache:
        return _block_cache[block_hex]

    block = rpc_call("eth_getBlockByNumber", [block_hex, False])

    if not block:
        return None

    ts = int(block["timestamp"], 16)
    _block_cache[block_hex] = ts

    return ts


# =========================
# TOKEN TOTAL SUPPLY FETCH
# =========================
def get_token_total_supply(token_contract):

    if not token_contract:
        return 0

    try:
        # --- totalSupply ---
        payload_supply = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_call",
            "params": [
                {
                    "to": token_contract,
                    "data": "0x18160ddd"  # totalSupply()
                },
                "latest"
            ]
        }

        r1 = requests.post(URL, json=payload_supply, timeout=10)
        result_supply = r1.json().get("result")

        if not result_supply:
            return 0

        raw_supply = int(result_supply, 16)

        # --- decimals ---
        payload_decimals = {
            "jsonrpc": "2.0",
            "id": 2,
            "method": "eth_call",
            "params": [
                {
                    "to": token_contract,
                    "data": "0x313ce567"  # decimals()
                },
                "latest"
            ]
        }

        r2 = requests.post(URL, json=payload_decimals, timeout=10)
        result_decimals = r2.json().get("result")

        decimals = int(result_decimals, 16) if result_decimals else 18

        # --- human readable ---
        return raw_supply / (10 ** decimals)

    except Exception as e:
        print("error:", e)
        return 0
    
# =========================
# NORMALIZE TX (UNCHANGED LOGIC)
# =========================
def normalize(tx, wallet):

    tx_hash = tx.get("hash")

    raw_tx = get_raw_tx(tx_hash)
    method_id = extract_method_id_from_raw_tx(raw_tx)

    from_addr = (tx.get("from") or "").lower()
    to_addr = (tx.get("to") or "").lower()
    wallet_l = wallet.lower()

    if from_addr == wallet_l:
        direction = "out"
    elif to_addr == wallet_l:
        direction = "in"
    else:
        direction = "unknown"

    value = tx.get("value")
    value = float(value) if value is not None else 0.0

    block = tx.get("blockNum") or tx.get("blockNumber")

    return {
        "wallet": wallet,
        "from_address": tx.get("from"),
        "to_address": tx.get("to"),
        "hash": tx_hash,
        "block": block,
        "timestamp": get_block_time(block),
        "tx_type": tx.get("category"),
        "method_id": method_id,
        "direction": direction,
        "asset": tx.get("asset"),
        "amount": max(value, 0.0),
        "token_amount": (tx.get("rawContract") or {}).get("value") or 0,
        "chain": CHAIN
    }


# =========================
# FETCH WALLET (NO LOGIC CHANGE)
# =========================
def fetch_wallet(wallet, token_contract, start_date=None, end_date=None, existing_hashes=None):

    start_ts = parse_date(start_date)
    end_ts = parse_date(end_date)

    def build_payload(addr_key):
        return {
            addr_key: wallet,
            "fromBlock": "0x0",
            "toBlock": "latest",
            "category": ["external", "erc20"],
            "contractAddresses": [token_contract],
            "maxCount": hex(LIMIT),
            "withMetadata": False
        }

    out = rpc_call("alchemy_getAssetTransfers", [build_payload("fromAddress")])
    out = out.get("transfers", []) if out else []

    inn = rpc_call("alchemy_getAssetTransfers", [build_payload("toAddress")])
    inn = inn.get("transfers", []) if inn else []

    merged = {}
    for t in (out + inn):
        if t and t.get("hash"):
            if existing_hashes and t["hash"] in existing_hashes:
                continue  # 🔥 skip already processed
            merged[t["hash"]] = t

    rows = [normalize(t, wallet) for t in merged.values()]

    rows = sorted(
        rows,
        key=lambda x: x["timestamp"] if x["timestamp"] is not None else 0
    )

    if start_ts is not None:
        rows = [r for r in rows if r["timestamp"] and r["timestamp"] >= start_ts]

    if end_ts is not None:
        rows = [r for r in rows if r["timestamp"] and r["timestamp"] <= end_ts]

    return rows


# =========================
# WRITE CSV (UNCHANGED)
# =========================
def write_rows(rows):

    if not rows:
        return

    file_exists = os.path.exists(OUTPUT_FILE)
    file_empty = (not file_exists) or os.path.getsize(OUTPUT_FILE) == 0

    with open(OUTPUT_FILE, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())

        # 🔥 FIX: also handle empty file (header missing case)
        if file_empty:
            writer.writeheader()

        writer.writerows(rows)


def load_existing_hashes():
    if not os.path.exists(OUTPUT_FILE):
        return set()

    hashes = set()

    with open(OUTPUT_FILE, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            hashes.add(row["hash"])

    return hashes

# =========================
# ENTRY POINT 
# =========================
def process_wallets(cleaned_rows, token_contract, start_date=None, end_date=None):

    load_cache()  
    
    existing_hashes = load_existing_hashes() 

    addresses = list({
        r.get("address", "").strip().lower()
        for r in cleaned_rows
        if r.get("address")
    })

    for wallet in addresses:
        try:
            txs = fetch_wallet(
                wallet,
                token_contract,
                start_date,
                end_date,
                existing_hashes   
            )

            write_rows(txs)

        except Exception as e:
            print(f"[Alchemy Error] {wallet}: {e}")

    save_cache()  