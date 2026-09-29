import sys
import os
import sqlite3

sys.path.insert(0, os.path.abspath('backend'))
from core.models import Base

db_paths = ['terravault.db', 'backend/terravault.db', 'backend/terravault_local.db', 'terravault_local.db']

for db_path in db_paths:
    if not os.path.exists(db_path):
        continue
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for table_name, table in Base.metadata.tables.items():
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table_name,))
            if not cur.fetchone():
                continue
            cur.execute(f"PRAGMA table_info({table_name})")
            existing_cols = {r[1] for r in cur.fetchall()}
            for col in table.columns:
                if col.name not in existing_cols:
                    col_type = "TEXT"
                    try:
                        cur.execute(f"ALTER TABLE {table_name} ADD COLUMN {col.name} {col_type}")
                        print(f"{db_path} [{table_name}]: added {col.name}")
                    except Exception as ex:
                        print(f"{db_path} [{table_name}] error on {col.name}:", ex)
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"{db_path} error:", e)

print("Schema alignment complete!")
