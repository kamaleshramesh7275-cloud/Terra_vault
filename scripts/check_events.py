import json
from web3 import Web3
from core.config import settings

# Event signature
# event RecordAnchored(string indexed recordId, bytes32 hash, address indexed verifier, uint256 timestamp);

def main():
    w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))
    
    # We will search the logs for the transaction hash:
    tx_hash = "0xa93854846cacca3429501d6e0c2c102712a1868b78f22226f5f820331c37252c"
    print(f"Fetching receipt for transaction: {tx_hash}")
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        print(f"Status: {receipt.status}")
        print(f"Block: {receipt.blockNumber}")
        print(f"Logs count: {len(receipt.logs)}")
        for i, l in enumerate(receipt.logs):
            print(f"Log {i}: Address: {l.address}")
            print(f"  Topics: {[t.hex() for t in l.topics]}")
            print(f"  Data: {l.data.hex() if hasattr(l.data, 'hex') else l.data}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch receipt: {e}")

if __name__ == "__main__":
    main()
