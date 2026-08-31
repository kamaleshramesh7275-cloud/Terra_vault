import json
from web3 import Web3
from core.config import settings

RECORD_REGISTRY_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "recordId", "type": "string"}
        ],
        "name": "getLatestAnchor",
        "outputs": [
            {"internalType": "bytes32", "name": "recordHash", "type": "bytes32"},
            {"internalType": "address", "name": "verifier", "type": "address"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

def main():
    w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        abi=RECORD_REGISTRY_ABI
    )
    
    # Check with hyphens
    id_with_hyphens = "10a57ccc-f56e-4c3e-b490-f247e1520824"
    print(f"Querying with hyphens: {id_with_hyphens}")
    try:
        res = contract.functions.getLatestAnchor(id_with_hyphens).call()
        print(f"[FOUND] Hash: {res[0].hex()}, Verifier: {res[1]}, Timestamp: {res[2]}")
    except Exception as e:
        print(f"[ERROR] Failed with hyphens: {e}")

    # Check without hyphens
    id_no_hyphens = "10a57cccf56e4c3eb490f247e1520824"
    print(f"Querying without hyphens: {id_no_hyphens}")
    try:
        res = contract.functions.getLatestAnchor(id_no_hyphens).call()
        print(f"[FOUND] Hash: {res[0].hex()}, Verifier: {res[1]}, Timestamp: {res[2]}")
    except Exception as e:
        print(f"[ERROR] Failed without hyphens: {e}")

if __name__ == "__main__":
    main()
