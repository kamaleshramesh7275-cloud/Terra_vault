"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ShieldCheck, FileText, Landmark, User, FileCheck, Phone, Building2, Layers } from "lucide-react";
import { useLanguage, LangCode } from "@/context/LanguageContext";

export function GovHeader() {
  const pathname = usePathname();
  const { lang, setLang, t, getDignitaries } = useLanguage();
  const [fontSize, setFontSize] = useState<"normal" | "large" | "xlarge">("normal");

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
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: 4 }}>
            <span style={{ color: "#94a3b8", fontSize: 10, marginRight: 4 }}>Text:</span>
            <button onClick={() => setFontSize("normal")} style={{ background: "none", border: "none", color: "#ffffff", fontSize: 10, cursor: "pointer", fontWeight: 700 }}>A-</button>
            <button onClick={() => setFontSize("large")} style={{ background: "none", border: "none", color: "#ffffff", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>A</button>
            <button onClick={() => setFontSize("xlarge")} style={{ background: "none", border: "none", color: "#ffffff", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>A+</button>
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
      <div style={{ background: "#ffffff", padding: "10px 24px", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* State Emblem Badge */}
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "#0f2942", border: "2px solid #334155",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
          }}>
            <Landmark size={22} color="#ffffff" />
          </div>

          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f2942", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
              {t("header_title")}
            </div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 2 }}>
              {t("motto")}
            </div>
          </div>
        </div>

        {/* Real Dignitary Minister Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#0f2942", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 10, fontWeight: 800 }}>
              {dignitaries.cmName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{dignitaries.cmTitle}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f2942" }}>{dignitaries.cmName}</div>
              <div style={{ fontSize: 9, color: "#475569" }}>{dignitaries.cmState}</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1e3a8a", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontSize: 10, fontWeight: 800 }}>
              {dignitaries.rmName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600 }}>{dignitaries.rmTitle}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f2942" }}>{dignitaries.rmName}</div>
              <div style={{ fontSize: 9, color: "#475569" }}>{dignitaries.rmDept}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Service Categorization Bar: G2C / G2G / G2B ────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "4px 24px", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/citizen" style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", textDecoration: "none", padding: "4px 12px", background: "#ffffff", borderRadius: 4, border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
            <User size={13} color="#0f2942" /> {t("citizen_services")}
          </Link>
          <Link href="/portal/tahsildar" style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", textDecoration: "none", padding: "4px 12px", background: "#ffffff", borderRadius: 4, border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
            <FileCheck size={13} color="#0f2942" /> {t("officer_desks")}
          </Link>
          <Link href="/citizen" style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", textDecoration: "none", padding: "4px 12px", background: "#ffffff", borderRadius: 4, border: "1px solid #cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={13} color="#0f2942" /> {t("business_sro")}
          </Link>
        </div>

        <div style={{ fontSize: 11, color: "#475569", fontWeight: 600 }}>
          Digital India Land Records Modernization Programme (DILRMP 2.0)
        </div>
      </div>
    </header>
  );
}
