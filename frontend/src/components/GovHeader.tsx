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
    <header style={{ width: "100%", zIndex: 100, borderBottom: "3px solid #0f2942" }}>
      {/* ── Top Official Govt Ticker Strip (Sober NIC Deep Slate Navy) ───────── */}
      <div style={{ background: "#0f2942", color: "#f8fafc", padding: "5px 24px", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, letterSpacing: "0.04em", color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
            GOVERNMENT OF INDIA • NATIONAL LAND RECORDS PORTAL
          </span>
          <span style={{ color: "#475569" }}>|</span>
          <button
            onClick={() => setShowHelplineModal(true)}
            style={{
              background: "none", border: "none", color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6,
              cursor: "pointer", padding: 0, fontSize: 11
            }}
          >
            <Phone size={12} color="#38bdf8" />
            <span>{t("helpline_label")}: <strong style={{ color: "#ffffff", textDecoration: "underline" }}>{activeStateMeta ? activeStateMeta.helpline : "1800-425-1333"}</strong></span>
            <span style={{ color: "#94a3b8" }}>|</span>
            <span>Emergency: <strong style={{ color: "#f87171" }}>{activeStateMeta ? activeStateMeta.emergencyNo : "1077"}</strong></span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Quick State Switcher in Header */}
          <button
            onClick={() => setShowStatePickerModal(true)}
            style={{
              background: "#1e3a8a",
              color: "#ffffff",
              border: "1px solid #3b82f6",
              borderRadius: 4,
              padding: "2px 9px",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer"
            }}
          >
            <Landmark size={12} color="#60a5fa" />
            <span>{activeStateMeta ? activeStateMeta.name : "National Portal (36 States)"}</span>
            <ChevronDown size={11} />
          </button>

          {/* Accessibility Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, background: "rgba(255,255,255,0.15)", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ color: "#cbd5e1", fontSize: 10, marginRight: 3, fontWeight: 600 }}>Font:</span>
            <button
              onClick={() => setFontSize("normal")}
              title="Standard Font Size"
              style={{ background: fontSize === "normal" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 10, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize("large")}
              title="Medium Font Size"
              style={{ background: fontSize === "large" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}
            >
              A
            </button>
            <button
              onClick={() => setFontSize("xlarge")}
              title="Large Font Size"
              style={{ background: fontSize === "xlarge" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 12, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}
            >
              A+
            </button>
          </div>

          {/* All Indian Languages Switcher Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, position: "relative" }}>
            <Globe size={13} color="#e2e8f0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              style={{
                background: "#0a192f",
                color: "#ffffff",
                border: "1px solid #3b82f6",
                borderRadius: 4,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                maxWidth: 160
              }}
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeName} ({l.name})
                </option>
              ))}
            </select>
            {isTranslating && (
              <span style={{ fontSize: 9, color: "#38bdf8", fontWeight: 700, display: "flex", alignItems: "center", gap: 2 }}>
                <Sparkles size={10} /> Translating...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Emblem, Title & Real CM / Minister Cards Strip ──────────────── */}
      <div style={{ background: "#ffffff", padding: "10px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 14 }}>
          {/* State/National Emblem Badge */}
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: "linear-gradient(135deg, #0a192f, #1e3a8a)",
            border: "1px solid #1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 2px 8px rgba(10, 25, 47, 0.25)",
            flexShrink: 0
          }}>
            <Landmark size={24} color="#ffffff" />
          </div>

          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0a192f", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {activeStateMeta ? `${activeStateMeta.name} • ${activeStateMeta.portalName}` : t("header_title")}
            </div>
            <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#059669" }}>●</span> {activeStateMeta ? activeStateMeta.department : t("motto")}
            </div>
          </div>
        </Link>

        {/* Real Dignitary Minister Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0a192f, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11, fontWeight: 800 }}>
              {dignitaries.cmName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>{dignitaries.cmTitle}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0a192f" }}>{dignitaries.cmName}</div>
              <div style={{ fontSize: 10, color: "#1d4ed8", fontWeight: 700 }}>{dignitaries.cmState}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", background: "#f8fafc", border: "1.5px solid #cbd5e1", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #059669, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 11, fontWeight: 800 }}>
              {dignitaries.rmName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>{dignitaries.rmTitle}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0a192f" }}>{dignitaries.rmName}</div>
              <div style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>{dignitaries.rmDept}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Service Categorization Bar: G2C / G2G / G2B ────────────────────── */}
      <div style={{ background: "#f1f5f9", padding: "6px 24px", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/citizen" style={{ fontSize: 12, fontWeight: 800, color: pathname === "/citizen" ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname === "/citizen" ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "#ffffff", borderRadius: 6, border: pathname === "/citizen" ? "1px solid #1e40af" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname === "/citizen" ? "0 2px 6px rgba(37,99,235,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <User size={13} color={pathname === "/citizen" ? "#ffffff" : "#1d4ed8"} /> {t("citizen_services")}
          </Link>
          <Link href={activeStateMeta ? `/login?state=${activeStateMeta.code}` : "/login"} style={{ fontSize: 12, fontWeight: 800, color: pathname.startsWith("/portal") || pathname === "/login" ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname.startsWith("/portal") || pathname === "/login" ? "linear-gradient(135deg, #059669, #10b981)" : "#ffffff", borderRadius: 6, border: pathname.startsWith("/portal") || pathname === "/login" ? "1px solid #047857" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname.startsWith("/portal") || pathname === "/login" ? "0 2px 6px rgba(16,185,129,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <FileCheck size={13} color={pathname.startsWith("/portal") || pathname === "/login" ? "#ffffff" : "#059669"} /> {t("officer_desks")}
          </Link>
          <Link href="/business" style={{ fontSize: 12, fontWeight: 800, color: pathname === "/business" ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname === "/business" ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#ffffff", borderRadius: 6, border: pathname === "/business" ? "1px solid #b45309" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname === "/business" ? "0 2px 6px rgba(217,119,6,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Building2 size={13} color={pathname === "/business" ? "#ffffff" : "#d97706"} /> {t("business_sro")}
          </Link>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: "#334155", fontWeight: 700 }}>
          <span>Digital India Land Records Modernization Programme (DILRMP 2.0)</span>
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
