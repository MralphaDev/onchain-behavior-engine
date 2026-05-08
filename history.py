import requests
import time

API_KEY = "MVoVpT6qMNlUJciBeaf1C"
CHAIN = "base"
#WALLET = "0x4675d01fa3b1f483f04c364b6f9e2c2696ec6c6f"
#WALLET ="0x30226f2a0881cfcfe06bbcc770bdf499d4af92ad"
#WALLET = "0x04a9d53236ac03a95ba93dff306b12011967a846"

WALLET = "0x9ba188e4b2c46c15450ea5eac83a048e5e5d9444"  

URL = f"https://{CHAIN}-mainnet.g.alchemy.com/v2/{API_KEY}"


# ---------------------------
# RPC helper
# ---------------------------
def rpc_call(method, params):
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": method,
        "params": params
    }
    res = requests.post(URL, json=payload).json()
    return res.get("result")


# ---------------------------
# Get ALL tx hashes (raw activity via Alchemy indexer)
# ---------------------------
def get_tx_hashes(wallet):
    hashes = set()
    page_key = None

    while True:
        payload = {
            "fromBlock": "0x0",
            "toBlock": "latest",
            "category": ["erc20"],  # ONLY native txs
            "maxCount": "0x3e8"
        }

        if page_key:
            payload["pageKey"] = page_key

        for direction in ["fromAddress", "toAddress"]:
            payload.pop("fromAddress", None)
            payload.pop("toAddress", None)
            payload[direction] = wallet

            result = rpc_call("alchemy_getAssetTransfers", [payload])

            for t in result.get("transfers", []):
                hashes.add(t["hash"])

            page_key = result.get("pageKey")

        if not page_key:
            break

    return list(hashes)


# ---------------------------
# Extract raw tx + method ID ONLY
# ---------------------------
def get_tx_data(tx_hash):
    tx = rpc_call("eth_getTransactionByHash", [tx_hash])

    if not tx:
        return None

    input_data = tx.get("input", "")

    return {
        "hash": tx_hash,
        "from": tx.get("from"),
        "to": tx.get("to"),
        "block": int(tx["blockNumber"], 16) if tx.get("blockNumber") else None,
        "method_id": input_data[:10] if input_data else None,
        
    }


# ---------------------------
# Main
# ---------------------------
def run(wallet, limit=50):
    hashes = get_tx_hashes(wallet)

    print(f"Found {len(hashes)} txs")

    results = []

    for i, h in enumerate(hashes[:limit]):
        data = get_tx_data(h)

        if data:
            results.append(data)

        if i % 20 == 0:
            print(f"Processed {i}/{limit}")
            time.sleep(0.2)

    return results


# ---------------------------
# Execute
# ---------------------------
if __name__ == "__main__":
    data = run(WALLET, limit=50)

    for d in data:
        print(d)