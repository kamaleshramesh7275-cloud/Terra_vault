"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Landmark, ArrowRight, Activity, Globe, FileText,
  Building2, Phone, Search, ShieldCheck, MapPin, CheckCircle2,
  Filter, Sparkles, Layers, Award
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllStatesList, INDIAN_REGIONS } from "@/lib/stateRegistry";

export default function NationalGatewayPage() {
  const { t } = useLanguage();
  const allStates = useMemo(() => getAllStatesList(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");

  const filteredStates = useMemo(() => {
    return allStates.filter((st) => {
      const matchesRegion = selectedRegion === "All" || st.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRegion;

      const matchesSearch =
        st.name.toLowerCase().includes(q) ||
        st.nativeName.toLowerCase().includes(q) ||
        st.portalName.toLowerCase().includes(q) ||
        st.rorName.toLowerCase().includes(q) ||
        st.mapName.toLowerCase().includes(q) ||
        st.mutationName.toLowerCase().includes(q) ||
        st.languages.some((l) => l.toLowerCase().includes(q)) ||
        st.sampleDistrict.toLowerCase().includes(q);

      return matchesRegion && matchesSearch;
    });
  }, [allStates, searchQuery, selectedRegion]);

  return (
    <div style={{ maxWidth: 1240, margin: "0 auto", paddingBottom: 60 }}>
      {/* Official Announcement Strip */}
      <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: 6, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#0f2942", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
            NATIONAL GATEWAY PORTAL
          </span>
          <div style={{ color: "#1e293b", fontWeight: 600 }}>
            {t("national_gateway_sub")}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
          <CheckCircle2 size={13} /> 36 States & Union Territories Connected
        </div>
      </div>

      {/* Hero Section */}
      <section style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 32, marginBottom: 24, borderTop: "4px solid #0f2942", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
        <div style={{ textAlign: "center", maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
            <Landmark size={15} color="#0f2942" /> MINISTRY OF RURAL DEVELOPMENT • DEPARTMENT OF LAND RESOURCES
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f2942", lineHeight: 1.25, marginBottom: 12 }}>
            {t("national_gateway_title")}
          </h1>

          <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 22 }}>
            Unified DILRMP 2.0 National Architecture integrating multi-lingual OCR Record of Rights extraction, Polygon blockchain identity anchoring, and specialized state revenue administrative portals across all 28 Indian States and 8 Union Territories.
          </p>

          {/* Quick Search Bar */}
          <div style={{ maxWidth: 680, margin: "0 auto", position: "relative" }}>
            <Search size={18} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder={t("search_state_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px 12px 42px", borderRadius: 8,
                border: "2px solid #cbd5e1", fontSize: 14, background: "#ffffff",
                color: "#0f2942", boxShadow: "0 2px 4px rgba(0,0,0,0.04)"
              }}
            />
          </div>
        </div>
      </section>

      {/* Region Filter Tabs */}
      <section style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {INDIAN_REGIONS.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                cursor: "pointer", border: "1px solid",
                background: selectedRegion === reg ? "#0f2942" : "#ffffff",
                color: selectedRegion === reg ? "#ffffff" : "#334155",
                borderColor: selectedRegion === reg ? "#0f2942" : "#cbd5e1",
                transition: "all 0.15s"
              }}
            >
              {reg === "All" ? `All Regions (${allStates.length})` : reg}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
          Showing <strong>{filteredStates.length}</strong> of {allStates.length} States & UTs
        </div>
      </section>

      {/* State Selector Grid */}
      <section style={{ marginBottom: 32 }}>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 18 }}>
          {filteredStates.map((st) => (
            <div
              key={st.code}
              className="glass-card"
              style={{
                padding: 20, borderTop: "4px solid #0f2942", borderColor: "#cbd5e1",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                background: "#ffffff", borderRadius: 8
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                      {st.name}
                    </h3>
                    <div style={{ fontSize: 11, color: "#1e3a8a", fontWeight: 700, marginTop: 1 }}>
                      {st.nativeName} • {st.portalName.split("(")[0]}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", flexShrink: 0 }}>
                    DILRMP: {st.dilrmpScore}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, color: "#475569", margin: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={14} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>RoR Terminology:</strong> {st.rorName}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Globe size={14} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Supported Languages:</strong> {st.languages.join(" • ")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Building2 size={14} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Statutory Hierarchy:</strong> {st.roles.map(r => r.title.split("—")[0].split("(")[0].trim()).slice(1).join(" → ")}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={14} color="#0f2942" style={{ flexShrink: 0 }} />
                    <span><strong>Toll-Free Helpline:</strong> {st.helpline}</span>
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Sample: {st.sampleDistrict.split("(")[0]}
                </div>
                <Link
                  href={`/state/${st.code}`}
                  className="btn btn-primary"
                  style={{ background: "#0f2942", borderColor: "#1e293b", fontSize: 11.5, padding: "6px 12px", gap: 5 }}
                >
                  {t("enter_portal_btn")} <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DILRMP National Metrics Bar */}
      <section className="glass-card" style={{ padding: 24, background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={17} color="#0f2942" /> National DILRMP 2.0 Digitization & RoR Modernization Summary
        </h3>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f2942" }}>36 / 36</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>States & UTs Integrated</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>100% Pan-India Coverage</div>
          </div>
          <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#059669" }}>93.8%</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>Average DILRMP Score</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>Digitized Cadastral Maps</div>
          </div>
          <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>22+</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>Official Indian Languages</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>Real-Time Live Translation</div>
          </div>
          <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706" }}>Polygon Amoy</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>Blockchain Audit Trail</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>Immutable RoR Timestamping</div>
          </div>
        </div>
      </section>
    </div>
  );
}
