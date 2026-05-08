import requests

RPC_URL = "https://base-mainnet.g.alchemy.com/v2/MVoVpT6qMNlUJciBeaf1C"
# You can replace with Alchemy or any Ethereum RPC endpoint

CONTRACT_ADDRESS = "0x532f27101965dd16442E59d40670FaF5eBB142E4"


def get_token_total_supply(token_contract):
    if not token_contract:
        return 0

    payload = {
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

    try:
        response = requests.post(RPC_URL, json=payload)
        result = response.json()

        if "result" in result:
            # Convert hex to integer
            total_supply = int(result["result"], 16)
            return total_supply
        else:
            print("Error:", result)
            return None

    except Exception as e:
        print("Request failed:", e)
        return None


if __name__ == "__main__":
    supply = get_token_total_supply(CONTRACT_ADDRESS)

    if supply is not None:
        print("Raw Total Supply:", supply)
        print("Readable (assuming 18 decimals):", supply / (10 ** 18))