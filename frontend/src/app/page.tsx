"use client";
import Link from "next/link";
import {
  Landmark, ArrowRight, Activity, Globe, FileText, Layers, Building2, Phone
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function NationalGatewayPage() {
  const { t } = useLanguage();

  const STATES = [
    {
      code: "tn",
      name: "Tamil Nadu (தமிழ்நாடு)",
      dilrmpScore: "96.4%",
      dilrmpRank: "#1 State",
      terminology: "Patta / Chitta, Adangal, FMB Sketch",
      languages: ["English", "தமிழ்"],
      hierarchy: ["VAO", "RI", "Tahsildar", "RDO", "District Collector"],
      sampleDistrict: "Kinathukadavu Taluk (Coimbatore)",
      helpline: "1800-425-1333",
      href: "/state/tn"
    },
    {
      code: "mh",
      name: "Maharashtra (महाराष्ट्र)",
      dilrmpScore: "92.1%",
      dilrmpRank: "High Progress",
      terminology: "7/12 Satbara (सातबारा), 8A Extract, Ferfar",
      languages: ["English", "मराठी"],
      hierarchy: ["Talathi (तलाठी)", "Circle Officer", "Tehsildar", "SDO", "Collector"],
      sampleDistrict: "Haveli Taluka (Pune District)",
      helpline: "1800-120-8040",
      href: "/state/mh"
    },
    {
      code: "up",
      name: "Uttar Pradesh (उत्तर प्रदेश)",
      dilrmpScore: "88.5%",
      dilrmpRank: "Moderate Progress",
      terminology: "Khatauni (खतौनी), Khasra (खसरा), Shajra Map",
      languages: ["English", "हिंदी"],
      hierarchy: ["Lekhpal (लेखपाल)", "Kanoongo", "Tehsildar", "SDM", "District Magistrate"],
      sampleDistrict: "Sadar Tehsil (Lucknow)",
      helpline: "1800-180-0888",
      href: "/state/up"
    },
    {
      code: "ka",
      name: "Karnataka (ಕರ್ನಾಟಕ)",
      dilrmpScore: "84.0%",
      dilrmpRank: "Ongoing Digitization",
      terminology: "RTC / Pahani (ಆರ್‌ಟಿಸಿ/ಪಹಣಿ), Mutation MR",
      languages: ["English", "ಕನ್ನಡ"],
      hierarchy: ["Village Accountant", "RI", "Tahsildar", "AC", "Deputy Commissioner"],
      sampleDistrict: "Bengaluru South Taluk",
      helpline: "080-22370281",
      href: "/state/ka"
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 50 }}>
      {/* Official Announcement Strip */}
      <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: 6, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
        <span style={{ background: "#0f2942", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
          NATIONAL GATEWAY PORTAL
        </span>
        <div style={{ color: "#1e293b", fontWeight: 600 }}>
          {t("national_gateway_sub")}
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 32, marginBottom: 30, borderTop: "4px solid #0f2942", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
        <div style={{ textAlign: "center", maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
            <Landmark size={15} color="#0f2942" /> MINISTRY OF RURAL DEVELOPMENT • LAND RESOURCES DEPT
          </div>

          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#0f2942", lineHeight: 1.25, marginBottom: 12 }}>
            {t("national_gateway_title")}
          </h1>

          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
            Unified DILRMP 2.0 Portal providing AI OCR RoR Extraction, Polygon Blockchain Identity Anchors, and Multi-State Revenue Administration Desks across India.
          </p>
        </div>
      </section>

      {/* State Selector Grid - Sober Government Colors */}
      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f2942", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={18} color="#0f2942" /> {t("select_state_heading")}
        </h2>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {STATES.map((st) => (
            <div key={st.code} className="glass-card" style={{ padding: 22, borderTop: "4px solid #0f2942", borderColor: "#cbd5e1", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f2942", margin: 0 }}>{st.name}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942" }}>
                    DILRMP: {st.dilrmpScore} ({st.dilrmpRank})
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12, color: "#475569", margin: "14px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={15} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Land Records Terminology:</strong> {st.terminology}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Globe size={15} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Supported Languages:</strong> {st.languages.join(" • ")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={15} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Officer Hierarchy:</strong> {st.hierarchy.join(" → ")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={15} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Toll-Free Helpline:</strong> {st.helpline}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 14, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>Sample District: {st.sampleDistrict}</div>
                <Link href={st.href} className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", fontSize: 12, gap: 6 }}>
                  {t("enter_portal_btn")} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DILRMP National Metrics Bar - Sober Styling */}
      <section className="glass-card" style={{ padding: 24, background: "#ffffff" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={17} color="#0f2942" /> National DILRMP 2.0 State Digitization Summary
        </h3>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {STATES.map((s) => (
            <div key={s.code} style={{ padding: 14, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#0f2942" }}>{s.dilrmpScore}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>{s.name.split("(")[0]}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.terminology.split(",")[0]}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
