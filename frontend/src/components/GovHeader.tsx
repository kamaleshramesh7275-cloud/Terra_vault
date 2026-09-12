"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Globe, Landmark, User, FileCheck, Phone, Building2,
  ChevronDown, X, Copy, Check, AlertTriangle, ShieldCheck,
  Search, ExternalLink, Sparkles
} from "lucide-react";
import { useLanguage, INDIAN_LANGUAGES, LangCode } from "@/context/LanguageContext";
import { useFont } from "@/context/FontContext";
import { ALL_INDIAN_STATES, getStateMetadata, getAllStatesList } from "@/lib/stateRegistry";

export function GovHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t, getDignitaries, isTranslating } = useLanguage();
  const { fontSize, setFontSize } = useFont();

  // State modals & drop-downs
  const [showHelplineModal, setShowHelplineModal] = useState(false);
  const [showStatePickerModal, setShowStatePickerModal] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState("");
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // Detect state key from URL path (e.g. /state/tn -> tn)
  let activeStateKey = "national";
  const stateMatch = pathname.match(/^\/state\/([a-zA-Z0-9_-]+)/);
  if (stateMatch && stateMatch[1]) {
    activeStateKey = stateMatch[1].toLowerCase();
  }

  const activeStateMeta = ALL_INDIAN_STATES[activeStateKey] || null;
  const dignitaries = getDignitaries(activeStateKey);
  const allStates = getAllStatesList();

  const filteredStates = allStates.filter(st => {
    const q = stateSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name.toLowerCase().includes(q) ||
      st.nativeName.toLowerCase().includes(q) ||
      st.code.toLowerCase().includes(q) ||
      st.rorName.toLowerCase().includes(q) ||
      st.region.toLowerCase().includes(q) ||
      st.languages.some(l => l.toLowerCase().includes(q))
    );
  });

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNumber(text);
      setTimeout(() => setCopiedNumber(null), 2000);
    }
  };

  return (
    <header style={{ width: "100%", zIndex: 100, borderBottom: "1px solid #e2e8f0", background: "#ffffff" }}>
      {/* ── Top Official Govt Utility Strip (Tamil Nilam Deep Teal Ribbon) ─────── */}
      <div style={{ background: "#0f3d3e", color: "#f8fafc", padding: "6px 32px", fontSize: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <a
            href="mailto:tngis.support@tn.gov.in"
            style={{ color: "#e2e8f0", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}
          >
            <span style={{ opacity: 0.8 }}>✉</span> tngis.support@tn.gov.in
          </a>
          <span style={{ color: "#2dd4bf", opacity: 0.4 }}>|</span>
          <a
            href="tel:+914440164907"
            style={{ color: "#e2e8f0", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontSize: 11.5 }}
          >
            <span style={{ opacity: 0.8 }}>📞</span> +91-44-40164907 / +91-44-40164999
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Dark Mode Icon Toggle */}
          <button
            title="Toggle Night Mode"
            style={{
              background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "50%", width: 26, height: 26, color: "#ffffff",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12
            }}
          >
            🌙
          </button>

          {/* Font Zoom Controls (A+ A A-) */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.12)", padding: "2px 6px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)" }}>
            <button
              onClick={() => setFontSize("xlarge")}
              title="Large Font Size"
              style={{ background: fontSize === "xlarge" ? "#14b8a6" : "none", border: "none", color: "#ffffff", fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize("large")}
              title="Medium Font Size"
              style={{ background: fontSize === "large" ? "#14b8a6" : "none", border: "none", color: "#ffffff", fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("normal")}
              title="Standard Font Size"
              style={{ background: fontSize === "normal" ? "#14b8a6" : "none", border: "none", color: "#ffffff", fontSize: 10, cursor: "pointer", fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}
            >
              A-
            </button>
          </div>

          {/* All Indian Languages Selector Dropdown (22+ Scheduled Languages) */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
            <span style={{ fontSize: 13 }}>🌐</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              aria-label="Select Indian Language"
              style={{
                background: "rgba(255, 255, 255, 0.18)",
                color: "#ffffff",
                border: "1px solid rgba(45, 212, 191, 0.5)",
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11.5,
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
                maxWidth: 165
              }}
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: "#0f3d3e", color: "#ffffff" }}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            {isTranslating && (
              <span style={{ fontSize: 10, color: "#2dd4bf", fontWeight: 800, display: "flex", alignItems: "center", gap: 3 }}>
                <Sparkles size={11} /> Translating...
              </span>
            )}
          </div>

          {/* Screen Reader */}
          <button
            style={{
              background: "rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5
            }}
          >
            👁 Screen Reader
          </button>
        </div>
      </div>

      {/* ── Main Navbar: Terra_vault Brand, Nav Items & Login Pill ─────── */}
      <div style={{ background: "#ffffff", padding: "12px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        {/* Brand: Terra_vault (No Emblem / Logo Images) */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#134e4a", letterSpacing: "-0.03em", lineHeight: 1.15, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>Terra_vault</span>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#14b8a6", display: "inline-block" }} />
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginTop: 2, letterSpacing: "0.02em" }}>
              AI Land Intelligence & Cadastral Modernization Platform
            </div>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: pathname === "/" ? 700 : 500,
              color: pathname === "/" ? "#134e4a" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: pathname === "/" ? "2.5px solid #14b8a6" : "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            Home
          </Link>
          <Link
            href="/#about"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            About
          </Link>
          <Link
            href="/map"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: pathname.startsWith("/map") ? 700 : 500,
              color: pathname.startsWith("/map") ? "#134e4a" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: pathname.startsWith("/map") ? "2.5px solid #14b8a6" : "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            Cadastral GIS
          </Link>
          <Link
            href="/records"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: pathname === "/records" ? 700 : 500,
              color: pathname === "/records" ? "#134e4a" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: pathname === "/records" ? "2.5px solid #14b8a6" : "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            Land Records
          </Link>
          <Link
            href="/citizen"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: pathname === "/citizen" ? 700 : 500,
              color: pathname === "/citizen" ? "#134e4a" : "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: pathname === "/citizen" ? "2.5px solid #14b8a6" : "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            Citizen Desk
          </Link>
          <Link
            href="/#faq"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            FAQ
          </Link>
          <Link
            href="/#contact"
            style={{
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "#475569",
              display: "flex",
              alignItems: "center",
              gap: 6,
              paddingBottom: 4,
              borderBottom: "2.5px solid transparent",
              transition: "all 0.15s ease"
            }}
          >
            Contact
          </Link>
        </nav>

        {/* Right CTA Login Pill Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setShowStatePickerModal(true)}
            style={{
              background: "#f0fdfa",
              color: "#134e4a",
              border: "1px solid #2dd4bf",
              borderRadius: 9999,
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer"
            }}
          >
            <span>🌐</span>
            <span>{activeStateMeta ? activeStateMeta.name : "36 States & UTs"}</span>
            <ChevronDown size={12} />
          </button>

          <Link
            href="/login"
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
              color: "#ffffff",
              padding: "8px 22px",
              borderRadius: 9999,
              fontSize: 13.5,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 12px rgba(19, 78, 74, 0.25)",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            Login
          </Link>
        </div>
      </div>

      {/* ── Helpline & Emergency Quick Modal ───────────────────────────────── */}
      {showHelplineModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20
        }}>
          <div style={{ background: "#ffffff", borderRadius: 10, maxWidth: 540, width: "100%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ background: "#0f2942", color: "#ffffff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                <Phone size={18} color="#38bdf8" /> Official Toll-Free & Emergency Directory
              </div>
              <button onClick={() => setShowHelplineModal(false)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {activeStateMeta && (
                <div style={{ padding: 14, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>
                    Active State Helpline • {activeStateMeta.name}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#0f2942" }}>{activeStateMeta.helpline}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{activeStateMeta.department}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(activeStateMeta.helpline)}
                      style={{ padding: "6px 12px", background: "#0f2942", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {copiedNumber === activeStateMeta.helpline ? <Check size={13} color="#86efac" /> : <Copy size={13} />}
                      {copiedNumber === activeStateMeta.helpline ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { title: "National Land Portal Support", num: "1800-425-1333", desc: "MoRD DILRMP 2.0 Desk" },
                  { title: "National Disaster Response", num: "1077 / 1070", desc: "24x7 Emergency Line" },
                  { title: "National Emergency Helpline", num: "112", desc: "Unified Emergency Service" },
                  { title: "Kisan Call Center (Agriculture)", num: "1800-180-1551", desc: "Crop & Land Consultation" },
                  { title: "National Cyber Crime Helpline", num: "1930", desc: "Land Fraud & Cyber Grievance" },
                  { title: "National Consumer Helpline", num: "1915", desc: "Citizen Service Grievances" },
                ].map((item, idx) => (
                  <div key={idx} style={{ padding: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>{item.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#0f2942" }}>{item.num}</span>
                      <button
                        onClick={() => copyToClipboard(item.num)}
                        style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", padding: 2 }}
                        title="Copy Number"
                      >
                        {copiedNumber === item.num ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "right", marginTop: 8 }}>
                <button
                  onClick={() => setShowHelplineModal(false)}
                  style={{ padding: "8px 18px", background: "#0f2942", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                >
                  Close Directory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick State Switcher Modal ─────────────────────────────────────── */}
      {showStatePickerModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20
        }}>
          <div style={{ background: "#ffffff", borderRadius: 10, maxWidth: 840, width: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)", border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div style={{ background: "#0f2942", color: "#ffffff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15 }}>
                <Landmark size={18} color="#60a5fa" /> All-India State & UT Revenue Portal Switcher (36 States & UTs)
              </div>
              <button onClick={() => setShowStatePickerModal(false)} style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Filter states by name, language or land record (e.g. Satbara, Patta, Khatauni, Adangal)..."
                  value={stateSearchQuery}
                  onChange={(e) => setStateSearchQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px 9px 36px", borderRadius: 6,
                    border: "1px solid #cbd5e1", fontSize: 13, background: "#ffffff", color: "#0f2942"
                  }}
                  autoFocus
                />
              </div>
            </div>

            {/* State List Grid */}
            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <button
                onClick={() => {
                  setShowStatePickerModal(false);
                  router.push("/");
                }}
                style={{
                  padding: 12, borderRadius: 6, textAlign: "left", cursor: "pointer",
                  background: activeStateKey === "national" ? "#0f2942" : "#f1f5f9",
                  color: activeStateKey === "national" ? "#ffffff" : "#0f2942",
                  border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: 4
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800 }}>🇮🇳 National Portal Gateway</div>
                <div style={{ fontSize: 10, opacity: 0.8 }}>Unified DILRMP 2.0 Center</div>
              </button>

              {filteredStates.map((st) => (
                <button
                  key={st.code}
                  onClick={() => {
                    setShowStatePickerModal(false);
                    router.push(`/state/${st.code}`);
                  }}
                  style={{
                    padding: 10, borderRadius: 6, textAlign: "left", cursor: "pointer",
                    background: activeStateKey === st.code ? "#0f2942" : "#ffffff",
                    color: activeStateKey === st.code ? "#ffffff" : "#0f2942",
                    border: activeStateKey === st.code ? "1.5px solid #1e3a8a" : "1px solid #cbd5e1",
                    display: "flex", flexDirection: "column", gap: 3, transition: "all 0.1s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{st.name}</span>
                    <span style={{ fontSize: 9, padding: "1px 5px", background: activeStateKey === st.code ? "#1e3a8a" : "#f1f5f9", borderRadius: 3, fontWeight: 700 }}>
                      {st.dilrmpScore}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: activeStateKey === st.code ? "#93c5fd" : "#64748b", fontWeight: 600 }}>
                    {st.nativeName} • {st.rorName.split("(")[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
