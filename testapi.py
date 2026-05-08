import requests
from datetime import datetime, timezone

API_KEY = "MVoVpT6qMNlUJciBeaf1C"

CHAIN = "base"
WALLET = "0x4675d01fa3b1f483f04c364b6f9e2c2696ec6c6f"
TOKEN_CONTRACT = "0x532f27101965dd16442E59d40670FaF5eBB142E4"


# -------------------------------
# CHAIN CONFIG
# -------------------------------
CHAIN_CONFIG = {
    "base": f"https://base-mainnet.g.alchemy.com/v2/{API_KEY}",
    "eth": f"https://eth-mainnet.g.alchemy.com/v2/{API_KEY}",
    "bnb": f"https://bnb-mainnet.g.alchemy.com/v2/{API_KEY}"
}

URL = CHAIN_CONFIG[CHAIN]


# -------------------------------
# RPC CALL
# -------------------------------
def rpc_call(method, params):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }
    r = requests.post(URL, json=payload, timeout=10)
    return r.json().get("result")


# -------------------------------
# FORMAT TIME
# -------------------------------
def format_time(ts):
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


# -------------------------------
# BLOCK → TIME
# -------------------------------
def get_block_time(block_hex):
    block = rpc_call("eth_getBlockByNumber", [block_hex, False])
    if not block:
        return None
    return int(block["timestamp"], 16)


# -------------------------------
# NATIVE TRANSFERS (UNCHANGED)
# -------------------------------
def get_all_native_transfers():
    all_txs = []
    page_key = None

    while True:
        params = {
            "fromBlock": "0x0",
            "toAddress": WALLET,
            "category": ["external"],
            "order": "asc",
            "maxCount": "0x3e8"
        }

        if page_key:
            params["pageKey"] = page_key

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "alchemy_getAssetTransfers",
            "params": [params]
        }

        r = requests.post(URL, json=payload, timeout=10)
        data = r.json()

        transfers = data.get("result", {}).get("transfers", [])
        all_txs.extend(transfers)

        page_key = data.get("result", {}).get("pageKey")
        if not page_key:
            break

    return all_txs


# -------------------------------
# TX COUNT
# -------------------------------
def get_tx_count():
    return int(rpc_call("eth_getTransactionCount", [WALLET, "latest"]), 16)


# -------------------------------
# TOKEN INFLOWS (UNCHANGED FETCH)
# -------------------------------
def get_token_inflows():
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "alchemy_getAssetTransfers",
        "params": [{
            "fromBlock": "0x0",
            "toAddress": WALLET,
            "category": ["erc20"],
            "contractAddresses": [TOKEN_CONTRACT],
            "order": "asc",
            "maxCount": "0x64"
        }]
    }

    r = requests.post(URL, json=payload, timeout=10)
    return r.json().get("result", {}).get("transfers", [])


# -------------------------------
# MAIN
# -------------------------------
def run():
    print(f"\n🌐 Chain: {CHAIN}")
    print(f"👛 Wallet: {WALLET}")

    # -----------------------
    # NATIVE (UNCHANGED)
    # -----------------------
    native = get_all_native_transfers()
    print(f"\n📦 Native transfers (FULL): {len(native)}")

    if native:
        first = native[0]
        print("\n🔥 TRUE FIRST FUNDER (native)")
        print("From :", first.get("from"))
        print("To   :", first.get("to"))
        print("Value:", first.get("value"))
        print("Hash :", first.get("hash"))

        ts = get_block_time(first.get("blockNum"))
        if ts:
            print("Block:", int(first.get("blockNum"), 16))
            print("Time :", format_time(ts))

    # -----------------------
    # TX COUNT
    # -----------------------
    print("\n📊 TX COUNT:", get_tx_count())

    # -----------------------
    # TOKEN NET FLOW (DATE FILTERED)
    # -----------------------

    # 🔥 DATE RANGE HERE
    start = datetime(2024, 2, 23, tzinfo=timezone.utc)
    end = datetime(2024, 2, 25, tzinfo=timezone.utc)

    start_ts = int(start.timestamp())
    end_ts = int(end.timestamp())

    token = get_token_inflows()
    print(f"\n🟢 TOKEN INFLOWS ({TOKEN_CONTRACT}): {len(token)}\n")

    total_in = 0
    total_out = 0

    for t in token:
        block_hex = t.get("blockNum")
        ts = get_block_time(block_hex)

        if not ts:
            continue

        # 🔥 DATE FILTER ADDED
        if not (start_ts <= ts < end_ts):
            continue

        value = float(t.get("value", 0))
        from_addr = t.get("from", "").lower()
        to_addr = t.get("to", "").lower()

        if to_addr == WALLET.lower():
            total_in += value
        if from_addr == WALLET.lower():
            total_out += value

        print("────────────────────────────")
        print("From  :", t.get("from"))
        print("Value :", value)
        print("Hash  :", t.get("hash"))
        print("Block :", int(block_hex, 16))

        print("Time  :", format_time(ts))

    # -----------------------
    # NET FLOW RESULT
    # -----------------------
    print("\n🧠 TOKEN NET FLOW")
    print("Start:", format_time(start_ts))
    print("End  :", format_time(end_ts))
    print("In   :", total_in)
    print("Out  :", total_out)
    print("Net  :", total_in - total_out)


if __name__ == "__main__":
    run()