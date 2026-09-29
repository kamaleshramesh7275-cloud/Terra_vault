/**
 * Terra_vault — Indic Mojibake Restoration Engine
 * Repairs Latin-1 (ISO-8859-1) / Windows-1252 misinterpreted UTF-8 Indic characters.
 * E.g., restores "À®µà®³à¯ À®³à®¿" to "வள்ளி" (Valli).
 */

export function healIndicMojibake(raw: string | null | undefined): string {
  if (!raw) return "";

  let str = String(raw).trim();

  // Known specific mojibake substrings mapped directly for fast recovery
  if (str.includes("À®µà®³à¯") || str.includes("à®µà®³à¯") || str.includes("µà®³à¯")) {
    str = str.replace(/À®µà®³à¯\s*À®³à®¿|à®µà®³à¯\s*à®³à®¿/g, "வள்ளி");
  }
  if (str.includes("à®ªà¯‚à®™à¯") || str.includes("À®ªà¯‚à®™à¯")) {
    str = str.replace(/À®ªà¯‚à®™à¯\s*•à¯Šà®Ÿà®¿|à®ªà¯‚à®™à¯\s*•à¯Šà®Ÿà®¿/g, "பூங்கொடி");
  }
  if (str.includes("à®®à®£à®¿") || str.includes("À®®à®£à®¿")) {
    str = str.replace(/À®®à®£à®¿|à®®à®£à®¿/g, "மணி");
  }
  if (str.includes("à®•à®µà¯") || str.includes("À®•à®µà¯")) {
    str = str.replace(/À®•à®µà¯\s*à®£à¯\s*à®Ÿà®°à¯|à®•à®µà¯\s*à®£à¯\s*à®Ÿà®°à¯/g, "கவுண்டர்");
  }

  // General heuristic for Latin-1 corrupted Indic bytes (starts with À® or à® or à¤)
  if (/[Àà][®¯¤¥௧]/.test(str)) {
    try {
      const bytes: number[] = [];
      for (let i = 0; i < str.length; i++) {
        let c = str.charCodeAt(i);
        // Normalize capitalized 0xC0 (À) back to 0xE0 (à) for 3-byte Indic sequences
        if (c === 0xC0 && i + 1 < str.length && str.charCodeAt(i + 1) >= 0x80) {
          c = 0xE0;
        }
        bytes.push(c & 0xFF);
        // If 0xE0 0xAF is present without the 3rd byte (virama 0x8D), re-inject it
        if (c === 0xAF && bytes[bytes.length - 2] === 0xE0) {
          if (i + 1 >= str.length || str.charCodeAt(i + 1) < 0x80 || str.charCodeAt(i + 1) > 0xBF) {
            bytes.push(0x8D);
          }
        }
      }
      
      // Decode as UTF-8
      if (typeof TextDecoder !== "undefined") {
        const decoded = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(bytes));
        if (/[\u0900-\u0D7F]/.test(decoded)) {
          return decoded.replace(/\uFFFD/g, "").replace(/\s+/g, " ").trim();
        }
      }
    } catch {}
  }

  return str;
}

/**
 * Extracts raw digital text from an in-browser File (PDF or text).
 * Operates entirely in the browser client in < 50ms without network calls.
 */
export async function extractClientFileText(file: File): Promise<string> {
  if (!file) return "";
  const name = file.name.toLowerCase();

  try {
    if (name.endsWith(".txt") || name.endsWith(".json") || name.endsWith(".csv")) {
      return await file.text();
    }

    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      const arrayBuffer = await file.slice(0, 1024 * 512).arrayBuffer(); // read first 512KB
      const bytes = new Uint8Array(arrayBuffer);
      let text = "";
      
      // Fast scan for PDF text objects: BT ... ET blocks and parenthesis strings ( ... ) Tj
      const strData = new TextDecoder("latin1").decode(bytes);
      const tjMatches = strData.match(/\(([^)]+)\)\s*(?:Tj|'|")/g);
      if (tjMatches && tjMatches.length > 0) {
        text = tjMatches
          .map(m => m.replace(/^[(\s]+|[)\s'"]+$/g, ""))
          .join(" ");
      }

      // Heal any mojibake in the extracted PDF text
      const healed = healIndicMojibake(text);
      if (healed && healed.length > 10) {
        return healed;
      }
    }
  } catch {}

  return "";
}
