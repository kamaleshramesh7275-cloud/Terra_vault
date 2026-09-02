"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ShieldCheck, FileText, Landmark, User, FileCheck, Phone, Building2, Layers } from "lucide-react";
import { useLanguage, LangCode } from "@/context/LanguageContext";
import { useFont } from "@/context/FontContext";

export function GovHeader() {
  const pathname = usePathname();
  const { lang, setLang, t, getDignitaries } = useLanguage();
  const { fontSize, setFontSize } = useFont();

  // Detect state key from URL path
  let stateKey = "national";
  if (pathname.startsWith("/state/tn")) stateKey = "tn";
  else if (pathname.startsWith("/state/mh")) stateKey = "mh";
  else if (pathname.startsWith("/state/up")) stateKey = "up";
  else if (pathname.startsWith("/state/ka")) stateKey = "ka";

  const dignitaries = getDignitaries(stateKey);

  return (
    <header style={{ width: "100%", zIndex: 100, borderBottom: "3px solid #0f2942" }}>
      {/* ── Top Official Govt Ticker Strip (Sober NIC Deep Slate Navy) ───────── */}
      <div style={{ background: "#0f2942", color: "#f8fafc", padding: "4px 24px", fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontWeight: 700, letterSpacing: "0.04em", color: "#e2e8f0", display: "flex", alignItems: "center", gap: 6 }}>
            GOVERNMENT OF INDIA • NATIONAL LAND RECORDS PORTAL
          </span>
          <span style={{ color: "#475569" }}>|</span>
          <span style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
            <Phone size={12} color="#38bdf8" /> {t("helpline_label")}: <strong>1800-425-1333</strong> | Emergency: <strong>1077</strong>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Accessibility Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.2)" }}>
            <span style={{ color: "#94a3b8", fontSize: 10, marginRight: 4, fontWeight: 600 }}>Font Size:</span>
            <button onClick={() => setFontSize("normal")} style={{ background: fontSize === "normal" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 10, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}>A-</button>
            <button onClick={() => setFontSize("large")} style={{ background: fontSize === "large" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 11, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}>A</button>
            <button onClick={() => setFontSize("xlarge")} style={{ background: fontSize === "xlarge" ? "#3b82f6" : "none", border: "none", color: "#ffffff", fontSize: 12, cursor: "pointer", fontWeight: 700, padding: "1px 5px", borderRadius: 2 }}>A+</button>
          </div>

          {/* Multi-State Language Switcher Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={13} color="#e2e8f0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              style={{ background: "#1e3a8a", color: "#ffffff", border: "1px solid #475569", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
            >
              <option value="en">English</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="mh">मराठी (Marathi)</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ka">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Main Emblem, Title & Real CM / Minister Cards Strip (Point 1) ───── */}
      <div style={{ background: "#ffffff", padding: "10px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* State Emblem Badge */}
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: "linear-gradient(135deg, #0a192f, #1e3a8a)",
            border: "1px solid #1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 2px 8px rgba(10, 25, 47, 0.25)"
          }}>
            <Landmark size={24} color="#ffffff" />
          </div>

          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: "#0a192f", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {t("header_title")}
            </div>
            <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: "#059669" }}>●</span> {t("motto")}
            </div>
          </div>
        </div>

        {/* Real Dignitary Minister Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
      <div style={{ background: "#f1f5f9", padding: "6px 24px", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/citizen" style={{ fontSize: 12, fontWeight: 800, color: pathname === "/citizen" ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname === "/citizen" ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "#ffffff", borderRadius: 6, border: pathname === "/citizen" ? "1px solid #1e40af" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname === "/citizen" ? "0 2px 6px rgba(37,99,235,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <User size={13} color={pathname === "/citizen" ? "#ffffff" : "#1d4ed8"} /> G2C: {t("citizen_services")}
          </Link>
          <Link href="/portal/tahsildar" style={{ fontSize: 12, fontWeight: 800, color: pathname.startsWith("/portal") ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname.startsWith("/portal") ? "linear-gradient(135deg, #059669, #10b981)" : "#ffffff", borderRadius: 6, border: pathname.startsWith("/portal") ? "1px solid #047857" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname.startsWith("/portal") ? "0 2px 6px rgba(16,185,129,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <FileCheck size={13} color={pathname.startsWith("/portal") ? "#ffffff" : "#059669"} /> G2G: {t("officer_desks")}
          </Link>
          <Link href="/business" style={{ fontSize: 12, fontWeight: 800, color: pathname === "/business" ? "#ffffff" : "#0f172a", textDecoration: "none", padding: "5px 14px", background: pathname === "/business" ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#ffffff", borderRadius: 6, border: pathname === "/business" ? "1px solid #b45309" : "1.5px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6, boxShadow: pathname === "/business" ? "0 2px 6px rgba(217,119,6,0.3)" : "0 1px 2px rgba(0,0,0,0.04)" }}>
            <Building2 size={13} color={pathname === "/business" ? "#ffffff" : "#d97706"} /> G2B: Commercial & Banks
          </Link>
        </div>

        <div style={{ fontSize: 11, color: "#334155", fontWeight: 700 }}>
          Digital India Land Records Modernization Programme (DILRMP 2.0)
        </div>
      </div>
    </header>
  );
}
