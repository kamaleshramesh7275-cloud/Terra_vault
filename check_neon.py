"""
Neon DB connectivity test — tries port 5432 first, then 443 as fallback.
Run: python check_neon.py
"""
import psycopg2
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')

HOST = "ep-young-bonus-ave5hy11-pooler.c-11.us-east-1.aws.neon.tech"
USER = "neondb_owner"
PASS = "npg_W3YAeE8kFfdZ"
DB   = "neondb"

def try_connect(port: int):
    print(f"Trying port {port}...", end=" ", flush=True)
    dsn = f"host={HOST} port={port} dbname={DB} user={USER} password={PASS} sslmode=require connect_timeout=10"
    conn = psycopg2.connect(dsn)
    print("Connected!")
    return conn

def try_http_connect():
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util import Retry

    print("Trying Neon HTTPS SQL API (port 443)...", end=" ", flush=True)
    url = f"https://{HOST}/sql"
    conn_str = f"postgresql://{USER}:{PASS}@{HOST}/{DB}?sslmode=require"
    
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retries))
    headers = {"Neon-Connection-String": conn_str, "Content-Type": "application/json"}

    try:
        resp = session.post(
            url,
            json={"query": "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;"},
            headers=headers,
            timeout=60
        )
        if resp.status_code == 200:
            print("Connected via HTTPS!")
            rows = [r['table_name'] for r in resp.json().get('rows', [])]
            if not rows:
                print("\nNeon DB is empty — no tables yet.")
            else:
                print(f"\n{'Table':<30} {'Rows':>8}")
                print("-" * 40)
                for tname in rows:
                    try:
                        cnt_resp = session.post(
                            url,
                            json={"query": f"SELECT COUNT(*) as c FROM {tname};"},
                            headers=headers,
                            timeout=60
                        )
                        cnt = cnt_resp.json().get('rows', [{}])[0].get('c', 0)
                        print(f"  {tname:<28} {cnt:>8}")
                    except Exception as err:
                        print(f"  {tname:<28} {'ERR':>8}")
            print("\n[OK] Neon database is reachable and active!")
            return True

        else:
            print(f"FAILED (HTTP {resp.status_code}: {resp.text})")
            return False
    except Exception as e:
        print(f"FAILED ({e})")
        return False


conn = None
try:
    conn = try_connect(5432)
except Exception as e:
    print(f"FAILED ({str(e).splitlines()[0]})")

if conn:
    cur = conn.cursor()
    cur.execute(
        "SELECT table_name FROM information_schema.tables "
        "WHERE table_schema='public' ORDER BY table_name"
    )
    rows = cur.fetchall()

    if not rows:
        print("\nNeon DB is empty — no tables yet. Need to run: python backend/create_neon_tables.py")
    else:
        print(f"\n{'Table':<30} {'Rows':>8}")
        print("-" * 40)
        for (tname,) in rows:
            cur.execute(f"SELECT COUNT(*) FROM {tname}")
            count = cur.fetchone()[0]
            print(f"  {tname:<28} {count:>8}")

    cur.close()
    conn.close()
    print("\nDone!")
else:
    print("\nTCP port 5432 is blocked on this network (common on college/corporate Wi-Fi).")
    http_ok = try_http_connect()
    if not http_ok:
        print("\nERROR: Cannot reach Neon via TCP or HTTPS.")
        print("Please switch to a mobile hotspot or check credentials.")
        sys.exit(1)

