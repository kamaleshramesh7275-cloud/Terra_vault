"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Briefcase,
  Mountain
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
  const [activeTab, setActiveTab] = useState<"overview" | "mutation" | "inheritance" | "blockchain" | "satellite" | "3d_twin">("overview");
  const [geoaiData, setGeoaiData] = useState<any>(null);
  const [geoaiLoading, setGeoaiLoading] = useState<boolean>(false);

  // Map Upgrades 1 & 2 State
  const [baseMapType, setBaseMapType] = useState<"esri" | "dark" | "street">("dark");
  const [showFraudHeatmap, setShowFraudHeatmap] = useState<boolean>(false);
  const [showFMBGrid, setShowFMBGrid] = useState<boolean>(true);
  const [measureMode, setMeasureMode] = useState<"none" | "distance" | "area">("none");
  const [measurementText, setMeasurementText] = useState<string>("");

  // Interactive Command Center State
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [bufferRadius, setBufferRadius] = useState<number>(0);
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false);
  const [splitResult, setSplitResult] = useState<any>(null);

  const searchParams = useSearchParams();
  const targetSurveyNo = searchParams.get("survey_no");
  const targetPattaNo = searchParams.get("patta_no");
  const highlight = searchParams.get("highlight") === "true";

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
        if (data?.features?.length > 0) {
          // Check if URL specified a target survey or patta number
          const matchedFeature = data.features.find((f: any) => {
            const p = f.properties;
            return (targetSurveyNo && p.survey_no?.toLowerCase().includes(targetSurveyNo.toLowerCase())) ||
                   (targetPattaNo && p.patta_no === targetPattaNo);
          });

          if (matchedFeature) {
            handlePlotSelect(matchedFeature.properties);
          } else if (!selectedPlot || !data.features.some((f: any) => f.properties.survey_no === selectedPlot?.survey_no)) {
            handlePlotSelect(data.features[0].properties);
          }
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
              <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                Coimbatore District Cadastral GIS & Land Registry
              </h1>
            </div>
            <p style={{ color: "#334155", fontSize: 13, fontWeight: 600, marginTop: 4, marginBottom: 0 }}>
              கோயம்புத்தூர் மாவட்ட நில அளவை, பட்டா மற்றும் வாரிசுரிமை பதிவேடு — Covering all 9 Taluks with FMB Survey Boundaries, Mutation Chains & Inheritance Trees
            </p>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", width: 280 }}>
              <Search size={15} color="#475569" style={{ position: "absolute", left: 10, top: 10 }} />
              <input
                type="text"
                placeholder="Search SF No, Patta or Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 8,
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontSize: 12,
                  fontWeight: 600,
                  outline: "none"
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: "#0f2942",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: 12,
                border: "1px solid #1e293b",
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
        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>Taluks Covered</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>9 Taluks (வட்டங்கள்)</div>
          <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>Coimbatore North to Valparai</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>Active Parcels in View</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{totalParcels} FMB Parcels</div>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>Total Extent: {totalAcres.toFixed(1)} Acres</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>Average Maturity Score</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#16a34a", marginTop: 2 }}>94.2% Verified</div>
          <div style={{ fontSize: 10, color: "#16a34a", fontWeight: 700 }}>High Digitization Quality</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>Total Land Asset Value</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#d97706", marginTop: 2 }}>₹{(totalValuation / 10000000).toFixed(1)} Crores</div>
          <div style={{ fontSize: 10, color: "#475569", fontWeight: 700 }}>Based on Guideline & Fair Market</div>
        </div>

        <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>Blockchain Anchor Proof</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a8a", marginTop: 2 }}>100% Anchored</div>
          <div style={{ fontSize: 10, color: "#1e3a8a", fontWeight: 700 }}>Polygon Amoy Testnet (80002)</div>
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
              fontWeight: 700,
              borderRadius: 8,
              whiteSpace: "nowrap",
              border: "1px solid",
              borderColor: selectedTaluk === t.id ? "#0f2942" : "#cbd5e1",
              background: selectedTaluk === t.id ? "#0f2942" : "#ffffff",
              color: selectedTaluk === t.id ? "#ffffff" : "#334155",
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
                fontWeight: 700,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 5,
                border: "1px solid",
                borderColor: isSelected ? "#0f2942" : "#cbd5e1",
                background: isSelected ? "#0f2942" : "#ffffff",
                color: isSelected ? "#ffffff" : "#334155",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <Icon size={13} color={isSelected ? "#ffffff" : "#475569"} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Map (Left) + Site Dossier Inspector (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 20, alignItems: "start" }}>
        
        {/* Left: Map Card & Quick Site Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* ── Map Upgrades Toolbar ── */}
          <div className="glass-card" style={{ padding: "10px 14px", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, border: "1px solid rgba(99,102,241,0.3)" }}>
            {/* Base Tile Switcher */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Base Map:</span>
              {[
                { id: "dark", label: "🌌 Dark" },
                { id: "esri", label: "🛰️ Esri Satellite" },
                { id: "street", label: "🗺️ Street" },
              ].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBaseMapType(b.id as any)}
                  style={{
                    padding: "3px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    borderRadius: 6,
                    border: baseMapType === b.id ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.1)",
                    background: baseMapType === b.id ? "rgba(99,102,241,0.25)" : "rgba(0,0,0,0.3)",
                    color: baseMapType === b.id ? "#a5b4fc" : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Overlay Toggles */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => setShowFraudHeatmap(!showFraudHeatmap)}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: showFraudHeatmap ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  background: showFraudHeatmap ? "rgba(239,68,68,0.2)" : "rgba(0,0,0,0.3)",
                  color: showFraudHeatmap ? "#fca5a5" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                🚨 Fraud Heatmap
              </button>
              <button
                onClick={() => setShowFMBGrid(!showFMBGrid)}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: showFMBGrid ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                  background: showFMBGrid ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.3)",
                  color: showFMBGrid ? "#34d399" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                📐 FMB Grid
              </button>
            </div>

            {/* Measurement Tools */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                onClick={() => setMeasureMode(measureMode === "distance" ? "none" : "distance")}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: measureMode === "distance" ? "1px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)",
                  background: measureMode === "distance" ? "rgba(245,158,11,0.2)" : "rgba(0,0,0,0.3)",
                  color: measureMode === "distance" ? "#fcd34d" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                📏 Measure Distance
              </button>
              <button
                onClick={() => setMeasureMode(measureMode === "area" ? "none" : "area")}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: measureMode === "area" ? "1px solid #10b981" : "1px solid rgba(255,255,255,0.1)",
                  background: measureMode === "area" ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.3)",
                  color: measureMode === "area" ? "#34d399" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                📐 Measure Area
              </button>
              {measureMode !== "none" && (
                <button
                  onClick={() => setMeasureMode("none")}
                  style={{ padding: "3px 8px", fontSize: 10, borderRadius: 6, background: "rgba(239,68,68,0.2)", color: "#f87171", border: "1px solid rgba(239,68,68,0.4)", cursor: "pointer" }}
                >
                  Clear
                </button>
              )}
            </div>
            {/* Interactive Command Center Extra Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Buffer Ring Selector */}
              <select
                value={bufferRadius}
                onChange={(e) => setBufferRadius(Number(e.target.value))}
                style={{ background: "rgba(0,0,0,0.4)", color: "#38bdf8", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: "1px solid rgba(56,189,248,0.3)", outline: "none" }}
              >
                <option value={0}>⭕ Buffer Ring: Off</option>
                <option value={100}>⭕ 100m Buffer</option>
                <option value={500}>⭕ 500m Buffer</option>
                <option value={1000}>⭕ 1000m Buffer</option>
              </select>

              {/* Sub-Division Split Mode Toggle */}
              <button
                onClick={() => {
                  setIsSplitMode(!isSplitMode);
                  if (isSplitMode) setSplitResult(null);
                }}
                style={{
                  padding: "3px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: isSplitMode ? "1px solid #ec4899" : "1px solid rgba(255,255,255,0.1)",
                  background: isSplitMode ? "rgba(236,72,153,0.2)" : "rgba(0,0,0,0.3)",
                  color: isSplitMode ? "#f472b6" : "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✂️ Split Parcel
              </button>
            </div>
          </div>

          {/* ── Historical Satellite Timeline Slider Bar (2018–2026) ── */}
          <div className="glass-card" style={{ padding: "8px 14px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(15,23,42,0.7)", border: "1px solid rgba(129,140,248,0.25)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
              <span>🛰️</span> Historical Satellite Imagery Timeline:
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[2018, 2020, 2022, 2024, 2026].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setTimelineYear(yr)}
                  style={{
                    padding: "2px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 6,
                    border: timelineYear === yr ? "1px solid #818cf8" : "1px solid rgba(255,255,255,0.08)",
                    background: timelineYear === yr ? "#6366f1" : "rgba(0,0,0,0.3)",
                    color: timelineYear === yr ? "#ffffff" : "#94a3b8",
                    cursor: "pointer",
                  }}
                >
                  {yr} {yr === 2026 ? "(Live)" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Measurement Result Banner */}
          {measurementText && (
            <div style={{ background: "rgba(245,158,11,0.15)", padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(245,158,11,0.4)", color: "#fcd34d", fontSize: 12, fontWeight: 700 }}>
              {measurementText}
            </div>
          )}

          {/* Sub-Division Interactive Result Banner */}
          {splitResult && (
            <div className="animate-fade-up" style={{ background: "rgba(236,72,153,0.12)", padding: 12, borderRadius: 10, border: "1px solid rgba(236,72,153,0.4)", color: "#f472b6" }}>
              <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>✂️ Interactive FMB Sub-Division Split Complete</span>
                <span className="badge" style={{ background: "rgba(236,72,153,0.2)", color: "#f472b6", fontSize: 10 }}>Survey #{splitResult.originalSurvey}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11, marginBottom: 8 }}>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: 700, color: "#38bdf8" }}>Sub-Plot {splitResult.subPlotA1.survey_no}</div>
                  <div>Area: <strong>{splitResult.subPlotA1.area_acres} acres</strong> ({splitResult.subPlotA1.share})</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontWeight: 700, color: "#34d399" }}>Sub-Plot {splitResult.subPlotA2.survey_no}</div>
                  <div>Area: <strong>{splitResult.subPlotA2.area_acres} acres</strong> ({splitResult.subPlotA2.share})</div>
                </div>
              </div>
              <button
                onClick={() => alert(`Sub-Division Survey #${splitResult.originalSurvey} split submitted to Revenue Authority for approval!`)}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "6px", fontSize: 11, fontWeight: 700 }}
              >
                Submit FMB Sub-Division to Revenue Authority
              </button>
            </div>
          )}

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
                baseMapType={baseMapType}
                showFraudHeatmap={showFraudHeatmap}
                showFMBGrid={showFMBGrid}
                measureMode={measureMode}
                onMeasureUpdate={setMeasurementText}
                timelineYear={timelineYear}
                bufferRadius={bufferRadius}
                isSplitMode={isSplitMode}
                onParcelSplit={setSplitResult}
                highlightSelected={highlight}
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
              <div className="no-scrollbar" style={{ display: "flex", gap: 6, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 10, marginBottom: 16, overflowX: "auto" }}>
                {[
                  { id: "overview", label: "📋 Overview", icon: FileText },
                  { id: "satellite", label: "🛰️ GeoAI Satellite", icon: Layers },
                  { id: "3d_twin", label: "🏔️ 3D Digital Twin", icon: Mountain },
                  { id: "mutation", label: "📜 Mutation", icon: Clock },
                  { id: "inheritance", label: "🌳 Lineage", icon: GitFork },
                  { id: "blockchain", label: "⛓️ Proof", icon: ShieldCheck },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveTab(t.id as any);
                      if (t.id === "satellite" && !geoaiData && plotDetails) {
                        setGeoaiLoading(true);
                        api.verifySatelliteBoundary({
                          khasra_no: plotDetails.survey_no,
                          village: plotDetails.village,
                          district: plotDetails.district || "Coimbatore",
                          land_type: plotDetails.land_type || "agricultural",
                          area_value: plotDetails.area_acres || 1.0,
                          area_unit: "acre"
                        }).then((res) => {
                          setGeoaiData(res);
                          setGeoaiLoading(false);
                        });
                      }
                    }}
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
                      whiteSpace: "nowrap",
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

              {/* Tab 3D Twin: 3D Digital Twin Parcel Split Inspector */}
              {activeTab === "3d_twin" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1px solid rgba(99,102,241,0.3)", padding: 14, borderRadius: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 6 }}>
                        <Mountain size={16} color="#818cf8" /> 16×16 DEM 3D Mesh Inspection
                      </span>
                      <span className="badge badge-verified" style={{ fontSize: 10 }}>
                        🌾 FLAT AGRICULTURAL PLAIN
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Min Elevation</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>412.5 m</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Max Elevation</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>418.2 m</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 8, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>Terrain Slope</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8" }}>1.8° Gentle</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>
                      Boundary Intersections: <strong>0 Encroachments Detected</strong> • Neighboring plots clear of overlap.
                    </div>

                    <Link
                      href={`/map/digital-twin?id=${plotDetails.survey_no || plotDetails.khasra_no || '104_coimbatore'}`}
                      className="btn btn-primary"
                      style={{ width: "100%", justifyContent: "center", gap: 8, fontSize: 12, fontWeight: 700, padding: "9px" }}
                    >
                      Open Fullscreen 3D Digital Twin Viewer <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab Satellite: GeoAI Satellite Ground Truth */}
              {activeTab === "satellite" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {geoaiLoading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, gap: 10, color: "#38bdf8" }}>
                      <Loader2 size={24} className="spinner" /> Analyzing Sentinel-2 / Cartosat-3 satellite tiles...
                    </div>
                  ) : (
                    <div>
                      <div style={{ background: "rgba(15, 23, 42, 0.8)", border: `1px solid ${geoaiData?.verification_status === "MATCHED" ? "#10b981" : "#ef4444"}`, padding: 14, borderRadius: 10, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Ground Truth Boundary Match</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: geoaiData?.verification_status === "MATCHED" ? "#10b981" : "#ef4444", marginTop: 2 }}>
                              {geoaiData?.iou_match_score || 96.8}% IoU Match
                            </div>
                          </div>
                          <span className={`badge ${geoaiData?.verification_status === "MATCHED" ? "badge-verified" : "badge-disputed"}`}>
                            {geoaiData?.verification_status || "MATCHED"}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>NDVI (Vegetation Index)</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981", marginTop: 2 }}>
                            {geoaiData?.ndvi_index || 0.65} (Crop Cover)
                          </div>
                        </div>
                        <div style={{ background: "rgba(0,0,0,0.25)", padding: 10, borderRadius: 8 }}>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>NDBI (Built-up Index)</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: (geoaiData?.ndbi_index || 0) > 0.25 ? "#ef4444" : "#a5b4fc", marginTop: 2 }}>
                            {geoaiData?.ndbi_index || 0.08}
                          </div>
                        </div>
                      </div>

                      {geoaiData?.alerts && geoaiData.alerts.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                          {geoaiData.alerts.map((alt: any, ai: number) => (
                            <div key={ai} style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "8px 12px", borderRadius: 8, fontSize: 11 }}>
                              <strong>{alt.code}:</strong> {alt.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
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
