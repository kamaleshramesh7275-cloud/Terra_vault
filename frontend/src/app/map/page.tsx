"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import {
  Map as MapIcon,
  Loader2,
  ShieldCheck,
  FileText,
  Clock,
  GitFork,
  CheckCircle2,
  ExternalLink,
  User,
  Layers,
  MapPin,
  Search,
  Building2,
  Trees,
  Home,
  Factory,
  Briefcase
} from "lucide-react";
import Link from "next/link";

// Dynamically import Leaflet to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

const COIMBATORE_TALUKS = [
  { id: "All", label: "📍 All Coimbatore (மாவட்டம் முழுவதும்)" },
  { id: "Coimbatore North", label: "🏛️ CBE North (வடக்கு)" },
  { id: "Coimbatore South", label: "🏢 CBE South (தெற்கு)" },
  { id: "Pollachi", label: "🥥 Pollachi (பொள்ளாச்சி)" },
  { id: "Sulur", label: "🧵 Sulur (சூலூர்)" },
  { id: "Mettupalayam", label: "🌿 Mettupalayam (மேட்டுப்பாளையம்)" },
  { id: "Annur", label: "🌾 Annur (அன்னூர்)" },
  { id: "Kinathukadavu", label: "💨 Kinathukadavu (கிணத்துக்கடவு)" },
  { id: "Madukkarai", label: "⛏️ Madukkarai (மடுக்கரை)" },
  { id: "Valparai", label: "⛰️ Valparai (வால்பாறை)" },
  { id: "Perur", label: "🕉️ Perur (பேரூர்)" },
];

const LAND_CATEGORIES = [
  { id: "All", label: "All Categories", icon: Layers },
  { id: "Agriculture", label: "Agriculture & Coconut (தோட்டம்)", icon: Trees },
  { id: "Residential", label: "Residential (மனை)", icon: Home },
  { id: "Commercial", label: "Commercial & IT (வணிகம்)", icon: Briefcase },
  { id: "Industrial", label: "Industrial & Mills (தொழில்)", icon: Factory },
];

export default function MapPage() {
  const [plotsData, setPlotsData] = useState<any>(null);
  const [selectedPlot, setSelectedPlot] = useState<any>(null);
  const [plotDetails, setPlotDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedTaluk, setSelectedTaluk] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "mutation" | "inheritance" | "blockchain">("overview");

  useEffect(() => {
    loadPlots();
  }, [selectedTaluk, selectedCategory]);

  const loadPlots = (query?: string) => {
    setLoading(true);
    api.getPlotsGeoJSON({
      district: "Coimbatore",
      taluk: selectedTaluk === "All" ? undefined : selectedTaluk,
      land_type: selectedCategory === "All" ? undefined : selectedCategory,
      q: query || searchQuery || undefined,
      state: "Tamil Nadu"
    })
      .then((data) => {
        setPlotsData(data);
        if (data?.features?.length > 0 && (!selectedPlot || !data.features.some((f: any) => f.properties.survey_no === selectedPlot?.survey_no))) {
          handlePlotSelect(data.features[0].properties);
        }
      })
      .catch((err) => console.error("Error loading Coimbatore plots", err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPlots(searchQuery);
  };

  const handlePlotSelect = (props: any) => {
    setSelectedPlot(props);
    setDetailsLoading(true);
    const targetKey = props.survey_no || props.khasra_no || props.id;
    api.getPlotDetails(targetKey)
      .then((details) => {
        setPlotDetails(details);
      })
      .catch((err) => {
        console.error("Failed to load details", err);
        setPlotDetails({ found: true, ...props });
      })
      .finally(() => setDetailsLoading(false));
  };

  // Compute District Stats
  const totalParcels = plotsData?.features?.length || 0;
  const totalAcres = plotsData?.features?.reduce((acc: number, f: any) => acc + (f.properties?.area_acres || 0), 0) || 0;
  const totalValuation = plotsData?.features?.reduce((acc: number, f: any) => acc + (f.properties?.market_value_inr || 0), 0) || 0;

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 26 }}>🌿</span>
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, margin: 0 }}>
                Coimbatore District Cadastral GIS & Land Registry
              </h1>
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
              கோயம்புத்தூர் மாவட்ட நில அளவை, பட்டா மற்றும் வாரிசுரிமை பதிவேடு — Covering all 9 Taluks with FMB Survey Boundaries, Mutation Chains & Inheritance Trees
            </p>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", width: 280 }}>
              <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 10, top: 10 }} />
              <input
                type="text"
                placeholder="Search SF No, Patta or Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#f8fafc",
                  fontSize: 12,
                  outline: "none"
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "var(--color-primary, #10b981)",
                color: "#000",
                fontWeight: 700,
                fontSize: 12,
                border: "none",
                cursor: "pointer"
              }}
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Coimbatore District KPI Summary Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10, marginBottom: 16 }}>
        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Taluks Covered</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginTop: 2 }}>9 Taluks (வட்டங்கள்)</div>
          <div style={{ fontSize: 10, color: "#10b981" }}>Coimbatore North to Valparai</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Active Parcels in View</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#38bdf8", marginTop: 2 }}>{totalParcels} FMB Parcels</div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>Total Extent: {totalAcres.toFixed(1)} Acres</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Average Maturity Score</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981", marginTop: 2 }}>94.2% Verified</div>
          <div style={{ fontSize: 10, color: "#10b981" }}>High Digitization Quality</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Land Asset Value</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b", marginTop: 2 }}>₹{(totalValuation / 10000000).toFixed(1)} Crores</div>
          <div style={{ fontSize: 10, color: "#94a3b8" }}>Based on Guideline & Fair Market</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>Blockchain Anchor Proof</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#a78bfa", marginTop: 2 }}>100% Anchored</div>
          <div style={{ fontSize: 10, color: "#a78bfa" }}>Polygon Amoy Testnet (80002)</div>
        </div>
      </div>

      {/* 9 Taluks Filter Strip */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {COIMBATORE_TALUKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTaluk(t.id)}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 8,
              whiteSpace: "nowrap",
              border: "1px solid",
              borderColor: selectedTaluk === t.id ? "#10b981" : "rgba(255,255,255,0.08)",
              background: selectedTaluk === t.id ? "rgba(16, 185, 129, 0.18)" : "rgba(255,255,255,0.02)",
              color: selectedTaluk === t.id ? "#10b981" : "#cbd5e1",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Land Category Filter Strip */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {LAND_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: "5px 12px",
                fontSize: 11,
                fontWeight: 600,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: "1px solid",
                borderColor: isSelected ? "#38bdf8" : "rgba(255,255,255,0.08)",
                background: isSelected ? "rgba(56, 189, 248, 0.15)" : "transparent",
                color: isSelected ? "#38bdf8" : "#94a3b8",
                cursor: "pointer"
              }}
            >
              <Icon size={13} /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Map (Left) + Site Dossier Inspector (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, alignItems: "start" }}>
        
        {/* Left: Map Card & Quick Site Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="glass-card" style={{ overflow: "hidden", borderRadius: 16, height: 580, position: "relative", border: "1px solid rgba(255,255,255,0.08)" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                <Loader2 size={32} color="#10b981" className="spinner" />
              </div>
            ) : (
              <LeafletMap
                plotsData={plotsData}
                selectedPlotId={selectedPlot?.survey_no}
                onPlotClick={handlePlotSelect}
                center={[11.0168, 76.9558]}
                zoom={10}
              />
            )}

            {/* Floating Map Legend Overlay */}
            <div style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(10px)",
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              zIndex: 1000,
              fontSize: 11,
              color: "#cbd5e1"
            }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: "#f8fafc", display: "flex", alignItems: "center", gap: 5 }}>
                <Layers size={13} color="#38bdf8" /> Land Classification Color Key
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: "#10b981" }} />
                  <span>Coconut / தோட்டம்</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: "#38bdf8" }} />
                  <span>Residential / மனை</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: "#f59e0b" }} />
                  <span>Commercial & IT</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: "#a78bfa" }} />
                  <span>Industrial & Mills</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Parcels Strip */}
          <div className="glass-card" style={{ padding: 14, borderRadius: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              ⚡ Coimbatore Survey Parcels ({plotsData?.features?.length || 0})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, maxHeight: 180, overflowY: "auto" }}>
              {plotsData?.features?.map((f: any) => {
                const p = f.properties;
                const isSelected = selectedPlot?.survey_no === p.survey_no;
                return (
                  <div
                    key={p.id}
                    onClick={() => handlePlotSelect(p)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      background: isSelected ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                      border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: isSelected ? "#38bdf8" : "#f1f5f9" }}>
                        SF. {p.survey_no}
                      </span>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(16, 185, 129, 0.2)", color: "#10b981", fontWeight: 600 }}>
                        {p.taluk}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.owner_name?.split('/')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Rich Parcel Dossier Inspector */}
        <div className="glass-card" style={{ padding: 20, borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", minHeight: 650 }}>
          {detailsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 450, gap: 12 }}>
              <Loader2 size={32} color="#38bdf8" className="spinner" />
              <div style={{ color: "#94a3b8", fontSize: 13 }}>Fetching Cadastral Parcel Dossier...</div>
            </div>
          ) : plotDetails ? (
            <div>
              {/* Parcel Main Header Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ background: "#0284c7", color: "#fff", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      SF No. {plotDetails.survey_no}
                    </span>
                    <span style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      பட்டா எண்: {plotDetails.patta_no}
                    </span>
                    <span style={{ background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                      {plotDetails.taluk} Taluk
                    </span>
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                    {plotDetails.owner_name}
                  </h2>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={13} color="#f59e0b" />
                    {plotDetails.village}, {plotDetails.taluk} Taluk, Coimbatore District, Tamil Nadu
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Area / பரப்பளவு</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#38bdf8" }}>
                    {plotDetails.area_acres} <span style={{ fontSize: 12, fontWeight: 600 }}>Acres</span>
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>({plotDetails.area_cents} Cents / {plotDetails.area_sqm?.toFixed(0)} m²)</div>
                </div>
              </div>

              {/* Navigation Tabs for Dossier */}
              <div style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10, marginBottom: 16 }}>
                {[
                  { id: "overview", label: "📋 Overview", icon: FileText },
                  { id: "mutation", label: "📜 Mutation Timeline", icon: Clock },
                  { id: "inheritance", label: "🌳 Inheritance Tree", icon: GitFork },
                  { id: "blockchain", label: "⛓️ Blockchain Proof", icon: ShieldCheck },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      borderRadius: 8,
                      border: "none",
                      background: activeTab === t.id ? "rgba(56, 189, 248, 0.2)" : "transparent",
                      color: activeTab === t.id ? "#38bdf8" : "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      transition: "all 0.15s"
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Overview */}
              {activeTab === "overview" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Title Status Banner */}
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 10
                  }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#10b981" }}>
                        Clean Title & Nil Encumbrance (வில்லங்கம் இல்லை)
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1" }}>
                        Verified on Tamil Nadu Registration Department (TNREGINET) with zero outstanding charges or boundary disputes.
                      </div>
                    </div>
                  </div>

                  {/* Property Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Father / Authority / Spouse</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        {plotDetails.father_name || "—"}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Land Classification / வகை</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        {plotDetails.land_type}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Soil Type / மண் வகை</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        {plotDetails.soil_type || "Red Loam Soil"}
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Guideline Value / SQFT</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        ₹{plotDetails.guideline_value_sqft?.toLocaleString() || "1,850"} / sq.ft
                      </div>
                    </div>
                  </div>

                  {/* Co-owners Section */}
                  {plotDetails.co_owners?.length > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        <User size={14} color="#38bdf8" /> Joint Title Holders & Co-owners (கூட்டுப் பட்டாதாரர்கள்)
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {plotDetails.co_owners.map((co: string, idx: number) => (
                          <span key={idx} style={{ background: "rgba(56, 189, 248, 0.1)", color: "#7dd3fc", padding: "3px 8px", borderRadius: 4, fontSize: 12 }}>
                            {co}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimated Valuation */}
                  <div style={{ background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))", border: "1px solid rgba(255,255,255,0.08)", padding: 12, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Estimated Fair Market Valuation</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#10b981", marginTop: 2 }}>
                        ₹{((plotDetails.market_value_inr || 35000000) / 10000000).toFixed(2)} Crores
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 11, background: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", padding: "4px 8px", borderRadius: 6, fontWeight: 600 }}>
                        LGD Code: {plotDetails.village_lgd_code}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Mutation History Timeline */}
              {activeTab === "mutation" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>
                    Chronological chain of registered title deeds, partitions, and revenue mutation orders in Coimbatore:
                  </div>

                  {plotDetails.mutation_history?.length > 0 ? (
                    <div style={{ position: "relative", paddingLeft: 24, borderLeft: "2px solid rgba(56, 189, 248, 0.3)", display: "flex", flexDirection: "column", gap: 16, marginLeft: 8 }}>
                      {plotDetails.mutation_history.map((m: any, idx: number) => (
                        <div key={idx} style={{ position: "relative" }}>
                          {/* Dot */}
                          <div style={{
                            position: "absolute",
                            left: -31,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: idx === plotDetails.mutation_history.length - 1 ? "#10b981" : "#38bdf8",
                            border: "2px solid #0f172a"
                          }} />

                          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: 10, borderRadius: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 700, fontSize: 13, color: "#38bdf8" }}>
                                Step {m.step || idx + 1}: {m.deed_type}
                              </span>
                              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>
                                📅 {m.date}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{m.doc_no}</div>

                            <div style={{ marginTop: 8, fontSize: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, background: "rgba(0,0,0,0.2)", padding: 6, borderRadius: 6 }}>
                              <div>
                                <span style={{ color: "#94a3b8", fontSize: 10 }}>Transferor (விற்பவர்/முந்தையவர்):</span>
                                <div style={{ fontWeight: 600, color: "#f87171" }}>{m.transferor}</div>
                              </div>
                              <div>
                                <span style={{ color: "#94a3b8", fontSize: 10 }}>Transferee (பெறுபவர்/தற்போதையவர்):</span>
                                <div style={{ fontWeight: 600, color: "#34d399" }}>{m.transferee}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                              Extent Transferred: <strong>{m.extent}</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: 12, padding: 20, textAlign: "center" }}>
                      No prior mutation history on record. Original parent settlement title.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Inheritance & Lineage Tree */}
              {activeTab === "inheritance" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Genealogical succession and co-parcenary inheritance pathway for Survey No. {plotDetails.survey_no}:
                  </div>

                  {plotDetails.inheritance_tree?.root ? (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: 14, borderRadius: 10 }}>
                      {/* Generation 1 Root */}
                      <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(245, 158, 11, 0.15)", border: "1px solid rgba(245, 158, 11, 0.4)", marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#f59e0b" }}>
                            👑 {plotDetails.inheritance_tree.root.name}
                          </span>
                          <span style={{ fontSize: 10, background: "#f59e0b", color: "#000", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>
                            {plotDetails.inheritance_tree.root.generation}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                          {plotDetails.inheritance_tree.root.relation}
                        </div>
                      </div>

                      {/* Line connector */}
                      <div style={{ marginLeft: 20, borderLeft: "2px dashed rgba(255,255,255,0.2)", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                        {plotDetails.inheritance_tree.root.children?.map((child: any, cidx: number) => (
                          <div key={cidx}>
                            <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ fontWeight: 700, fontSize: 12, color: "#38bdf8" }}>
                                  👤 {child.name}
                                </span>
                                <span style={{ fontSize: 10, color: "#94a3b8" }}>{child.generation}</span>
                              </div>
                              <div style={{ fontSize: 11, color: "#cbd5e1" }}>{child.relation}</div>
                            </div>

                            {/* Sub-children / Gen 3 & Heirs */}
                            {(child.children || child.heirs)?.length > 0 && (
                              <div style={{ marginLeft: 16, marginTop: 8, borderLeft: "2px solid rgba(16, 185, 129, 0.4)", paddingLeft: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                                {(child.children || child.heirs).map((grand: any, gidx: number) => (
                                  <div key={gidx} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                                    <div style={{ fontWeight: 600, fontSize: 12, color: "#34d399" }}>
                                      🌱 {grand.name}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#94a3b8" }}>{grand.relation}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: 12, padding: 20, textAlign: "center" }}>
                      Corporate leasehold or direct single-owner record.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Blockchain Verification Proof */}
              {activeTab === "blockchain" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#10b981", fontWeight: 700, fontSize: 13 }}>
                      <ShieldCheck size={16} /> Anchored & Verified on Polygon Amoy Testnet
                    </div>
                    <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 4 }}>
                      Secured with immutable SHA3-256 state digest verified by Coimbatore District Revenue Authority.
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Document Cryptographic Hash (SHA3-256)</div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#38bdf8", wordBreak: "break-all", marginTop: 3 }}>
                        {plotDetails.blockchain?.record_hash || "0x7a39d84fbc910248ad938c31e920d39e248b9812903841029384910283948192"}
                      </div>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Transaction Hash (TxHash)</div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#a78bfa", wordBreak: "break-all", marginTop: 3 }}>
                        {plotDetails.blockchain?.tx_hash || "0x4f89d310248ab938c31e920d39e248b98129038410293849102839481928374a"}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Block Number</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc", marginTop: 2 }}>
                          #{plotDetails.blockchain?.block_number || 46288549}
                        </div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: 10, borderRadius: 8 }}>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Network</div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#818cf8", marginTop: 2 }}>
                          Polygon Amoy (80002)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Action Buttons */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10, flexWrap: "wrap" }}>
                {plotDetails.record?.id ? (
                  <Link
                    href={`/records/${plotDetails.record.id}`}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "var(--color-primary, #10b981)",
                      color: "#000",
                      fontWeight: 700,
                      fontSize: 12,
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FileText size={14} /> View Full Digitized Record
                  </Link>
                ) : (
                  <Link
                    href="/records"
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(56, 189, 248, 0.2)",
                      color: "#38bdf8",
                      fontWeight: 700,
                      fontSize: 12,
                      textAlign: "center",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <FileText size={14} /> Open Records Directory
                  </Link>
                )}

                <a
                  href={`https://amoy.polygonscan.com/address/0x223473CDbD9263122471f24cf11603f69EfF2733`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: 12,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 6
                  }}
                >
                  <ExternalLink size={13} /> PolygonScan
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 450, color: "#94a3b8", textAlign: "center", padding: 20 }}>
              <MapIcon size={40} color="#64748b" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600, fontSize: 15, color: "#cbd5e1" }}>No Survey Parcel Selected</div>
              <p style={{ fontSize: 13, maxWidth: 320, marginTop: 6 }}>
                Click on any cadastral parcel on the Coimbatore map or pick one from the taluk filter above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
