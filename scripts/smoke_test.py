# -*- coding: utf-8 -*-
"""
Terra_vault — End-to-End Automated Smoke Test
Generates synthetic Tamil Nadu Patta document, uploads it, runs pipeline, anchors to blockchain, and verifies.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Create synthetic image with PIL
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("[ERROR] PIL is required. Please install it with: pip install Pillow")
    sys.exit(1)


def generate_synthetic_record(output_path: Path):
    """Create a mock Tamil Nadu land record image with Tamil & English text for OCR."""
    img = Image.new("RGB", (800, 1000), color=(253, 251, 245))  # parchment color
    d = ImageDraw.Draw(img)

    # Draw borders & header
    d.rectangle([20, 20, 780, 980], outline=(40, 80, 120), width=3)
    d.text((220, 50), "TAMIL NADU LAND RECORD REGISTRY / தமிழ்நாடு நிலப் பதிவேடு", fill=(0, 0, 0))

    # Details
    text_lines = [
        "State: Tamil Nadu (தமிழ்நாடு)",
        "District: Kanchipuram (காஞ்சிபுரம்)",
        "Taluk: Sriperumbudur (ஸ்ரீபெரும்புதூர்)",
        "Village: Malianpur (மலையன்பூர்)",
        "Village LGD Code: 629104",
        "--------------------------------------------------",
        "Survey No / புல எண்: 142/3A",
        "Patta No / பட்டா எண்: 1084",
        "Owner Name / பட்டாதாரர்: R. Selvakumar (ஆர். செல்வகுமார்)",
        "Father Name / தந்தை பெயர்: Ramasamy Gounder (ராமசாமி கவுண்டர்)",
        "Area / பரப்பளவு: 2.45 Acres (ஏக்கர்)",
        "Land Type / நில வகைப்பாடு: Wet Land / நன்செய்",
        "--------------------------------------------------",
        "Mutation Deed No: Doc 1092/2024, SRO Sriperumbudur",
        "Transaction Type: Family Settlement (குடும்ப ஏற்பாட்டு ஆவணம்)",
        "Date / பதிவு தேதி: 2026-08-30",
    ]

    # Draw lines
    y = 120
    for line in text_lines:
        d.text((60, y), line, fill=(20, 20, 20))
        y += 45

    img.save(output_path)
    print(f"[OK] Generated synthetic Tamil Nadu test record at {output_path}")


def main():
    root = Path(__file__).parent.parent
    test_img = root / "data" / "test_record.png"
    test_img.parent.mkdir(parents=True, exist_ok=True)

    # 1. Generate test image
    generate_synthetic_record(test_img)

    print("\n--- Running End-to-End Pipeline Smoke Test ---")

    # Multipart form upload
    boundary = "----WebKitFormBoundaryTerraVaultSmokeTest"
    data = []
    
    # File payload
    data.append(f"--{boundary}".encode())
    data.append(f'Content-Disposition: form-data; name="file"; filename="{test_img.name}"'.encode())
    data.append(b"Content-Type: image/png")
    data.append(b"")
    data.append(test_img.read_bytes())

    # Form fields
    data.append(f"--{boundary}".encode())
    data.append('Content-Disposition: form-data; name="state"'.encode())
    data.append(b"")
    data.append(b"Tamil Nadu")

    data.append(f"--{boundary}".encode())
    data.append('Content-Disposition: form-data; name="district"'.encode())
    data.append(b"")
    data.append(b"Kanchipuram")

    data.append(f"--{boundary}--".encode())
    data.append(b"")

    body = b"\r\n".join(data)

    # 2. Upload and trigger pipeline
    print("\n[->] Uploading document to /api/ingest/upload...")
    url = "http://127.0.0.1:8000/api/ingest/upload"
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body)),
    }
    
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            res_data = json.loads(res.read().decode())
        print(f"[OK] Upload Response: {json.dumps(res_data)}")
        record_id = res_data["record_id"]
    except Exception as e:
        print(f"[ERROR] Upload failed: {e}")
        sys.exit(1)

    # Wait for inline pipeline execution (since Celery is synchronous eager, it's already done)
    time.sleep(2)

    # 3. Retrieve extracted fields
    print(f"\n[->] Fetching extracted fields for record {record_id}...")
    url_get = f"http://127.0.0.1:8000/api/records/{record_id}"
    try:
        with urllib.request.urlopen(url_get) as res:
            record = json.loads(res.read().decode())
        print("\nExtracted Fields:")
        print(f"  Owner:      {record.get('owner_name')}")
        print(f"  Khasra:     {record.get('khasra_no')}")
        print(f"  Village:    {record.get('village')}")
        print(f"  Confidence: {record.get('overall_confidence')}")
        print(f"  Status:     {record.get('status')}")
    except Exception as e:
        print(f"[ERROR] Failed to fetch record: {e}")
        sys.exit(1)

    # 4. If status is 'review', force approve it (simulate reviewer workflow)
    if record.get("status") == "review":
        print("\n[->] Simulated Reviewer Approval (resolving queue task)...")
        # Fetch task first
        try:
            with urllib.request.urlopen("http://127.0.0.1:8000/api/review/stats") as res:
                stats = json.loads(res.read().decode())
                print(f"  Review Stats: {stats}")
            
            with urllib.request.urlopen("http://127.0.0.1:8000/api/review/queue") as res:
                queue = json.loads(res.read().decode())
            task = next((t for t in queue if t["record_id"] == record_id), None)
            if task:
                task_id = task["id"]
                corr_url = f"http://127.0.0.1:8000/api/review/queue/{task_id}/correct?reviewer_id=admin"
                # Approve owner name and khasra
                corrections = {
                    "owner_name": {"value": record.get("owner_name") or "Ramesh Kumar", "reason": "Accurate extraction"},
                    "khasra_no": {"value": record.get("khasra_no") or "142/3", "reason": "Accurate extraction"}
                }
                corr_body = json.dumps(corrections).encode("utf-8")
                req_corr = urllib.request.Request(corr_url, data=corr_body, headers={"Content-Type": "application/json"}, method="POST")
                with urllib.request.urlopen(req_corr) as res:
                    print(f"  [OK] Correction submitted: {res.read().decode()}")
            else:
                print("  [WARN] Review task not found in queue")
        except Exception as e:
            print(f"  [WARN] Simulated review failed: {e}")

    # Re-fetch status
    try:
        with urllib.request.urlopen(url_get) as res:
            record = json.loads(res.read().decode())
        print(f"  Updated Status: {record.get('status')}")
    except Exception:
        pass

    # 5. Anchor verified record to Polygon Amoy Testnet
    print(f"\n[->] Anchoring record hash to Polygon Amoy blockchain...")
    anchor_url = f"http://127.0.0.1:8000/api/blockchain/{record_id}/anchor?verifier_id=admin"
    req_anchor = urllib.request.Request(anchor_url, data=b"", method="POST")
    try:
        with urllib.request.urlopen(req_anchor) as res:
            anchor_res = json.loads(res.read().decode())
        print(f"[OK] Anchor Response: {json.dumps(anchor_res)}")
    except Exception as e:
        print(f"[ERROR] Anchoring failed: {e}")
        sys.exit(1)

    # 6. Verify blockchain anchoring (tamper detection test)
    print(f"\n[->] Performing live blockchain verification...")
    verify_url = f"http://127.0.0.1:8000/api/blockchain/{record_id}/verify"
    try:
        with urllib.request.urlopen(verify_url) as res:
            verify_res = json.loads(res.read().decode())
        print(f"[OK] Verification Response: {json.dumps(verify_res)}")
        if verify_res.get("status") == "VERIFIED":
            print("\n[SUCCESS] SMOKE TEST PASSED SUCCESSFULLY!")
            print("   Land record digitized, verified, and safely anchored to Polygon Amoy Testnet.")
        else:
            print(f"\n[FAIL] Verification failed: {verify_res.get('status')}")
    except Exception as e:
        print(f"[ERROR] Verification request failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
