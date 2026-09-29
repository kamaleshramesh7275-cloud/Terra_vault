"""
Terra_vault — Indic Mojibake and UTF-8 Encoding Utilities
Repairs Latin-1 / Windows-1252 corrupted UTF-8 Indic bytes.
"""

def heal_indic_mojibake(raw: str) -> str:
    if not raw:
        return ""

    s = str(raw).strip()

    # Direct known mojibake recoveries
    if "À®µà®³à¯" in s or "à®µà®³à¯" in s or "µà®³à¯" in s:
        s = s.replace("À®µà®³à¯ À®³à®¿", "வள்ளி").replace("à®µà®³à¯ à®³à®¿", "வள்ளி")
    if "à®ªà¯‚à®™à¯" in s or "À®ªà¯‚à®™à¯" in s:
        s = s.replace("à®ªà¯‚à®™à¯ à®•à¯Šà®Ÿà®¿", "பூங்கொடி").replace("À®ªà¯‚à®™à¯ •à¯Šà®Ÿà®¿", "பூங்கொடி")
    if "à®®à®£à®¿" in s or "À®®à®£à®¿" in s:
        s = s.replace("à®®à®£à®¿", "மணி").replace("À®®à®£à®¿", "மணி")
    if "à®•à®µà¯" in s or "À®•à®µà¯" in s:
        s = s.replace("à®•à®µà¯ à®£à¯ à®Ÿà®°à¯", "கவுண்டர்").replace("À®•à®µà¯ à®£à¯ à®Ÿà®°à¯", "கவுண்டர்")

    # Heuristic for Latin-1 / CP1252 bytes
    if any(c in s for c in ["À®", "à®", "à¯", "à¤"]):
        try:
            byte_vals = []
            for i, ch in enumerate(s):
                code = ord(ch)
                if code == 0xC0 and i + 1 < len(s) and ord(s[i+1]) >= 0x80:
                    code = 0xE0
                byte_vals.append(code & 0xFF)
                if code == 0xAF and len(byte_vals) >= 2 and byte_vals[-2] == 0xE0:
                    if i + 1 >= len(s) or ord(s[i+1]) < 0x80 or ord(s[i+1]) > 0xBF:
                        byte_vals.append(0x8D)
            decoded = bytes(byte_vals).decode("utf-8", errors="ignore")
            if any(0x0900 <= ord(c) <= 0x0D7F for c in decoded):
                return " ".join(decoded.split()).strip()
        except Exception:
            pass

    return s
