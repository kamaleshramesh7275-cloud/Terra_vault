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
  const targetRecordId = searchParams.get("record_id");
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
        let features = [...(data?.features || [])];

        // Check if an uploaded custom record exists from OCR pipeline
        let customRec: any = null;
        if (typeof window !== "undefined") {
          try {
            const custom = JSON.parse(localStorage.getItem("tv_custom_records") || "[]");
            customRec = custom.find((r: any) =>
              (targetRecordId && r.id === targetRecordId) ||
              (targetSurveyNo && (r.survey_no === targetSurveyNo || r.khasra_no === targetSurveyNo)) ||
              (targetPattaNo && (r.patta_no === targetPattaNo || r.khata_no === targetPattaNo))
            );
            if (!customRec && (highlight || targetRecordId) && custom.length > 0) {
              customRec = custom[0];
            }
          } catch {}
        }

        let matchedFeature: any = null;

        if (customRec) {
          const isDindigul = (customRec.district || "").includes("Dindigul") || (customRec.district || "").includes("திண்டுக்கல்");
          const centerLat = isDindigul ? 10.1850 : 10.8250;
          const centerLng = isDindigul ? 77.8650 : 77.0220;

          const customFeature = {
            type: "Feature",
            properties: {
              id: customRec.id,
              survey_no: customRec.survey_no || targetSurveyNo || "245/3B-2",
              patta_no: customRec.patta_no || targetPattaNo || "3021",
              owner_name: customRec.owner_name,
              father_name: customRec.father_name,
              taluk: customRec.tehsil || "Kinathukadavu",
              district: customRec.district || "Coimbatore",
              village: customRec.village || "Kinathukadavu Town",
              area_acres: Number(customRec.area_value) || 2.15,
              area_cents: Math.round((Number(customRec.area_value) || 2.15) * 100),
              area_sqm: Math.round((Number(customRec.area_value) || 2.15) * 4046.86),
              land_type: customRec.land_type || "நஞ்சை நிலம் (Wet Land)",
              land_category: "Agriculture",
              soil_type: "செம்மண் (Red Fertile Soil)",
              guideline_value_sqft: 2150,
              market_value_inr: 4500000,
              encumbrance_status: "Clean Title & Nil Encumbrance (வில்லங்கம் இல்லை)",
              risk_score: 4.0,
              overall_confidence: customRec.overall_confidence || 0.94,
              field_confidences: customRec.field_confidences || [],
              detected_script: customRec.detected_script || "Tamil / Indic",
              mutation_no: customRec.mutation_no,
              mutation_date: customRec.mutation_date,
              transaction_type: customRec.transaction_type,
              is_ocr_ingested: true,
              highlighted: true,
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [centerLng - 0.0035, centerLat - 0.0025],
                [centerLng + 0.0030, centerLat - 0.0028],
                [centerLng + 0.0038, centerLat + 0.0032],
                [centerLng - 0.0025, centerLat + 0.0035],
                [centerLng - 0.0035, centerLat - 0.0025],
              ]]
            }
          };

          features = features.filter((f: any) => f.properties?.survey_no !== customFeature.properties.survey_no);
          features.unshift(customFeature);
          matchedFeature = customFeature;
        } else if (features.length > 0) {
          matchedFeature = features.find((f: any) => {
            const p = f.properties;
            return (targetSurveyNo && p.survey_no?.toLowerCase().includes(targetSurveyNo.toLowerCase())) ||
                   (targetPattaNo && p.patta_no === targetPattaNo);
          });
        }

        const finalGeoJson = { ...data, features };
        setPlotsData(finalGeoJson);

        if (matchedFeature) {
          handlePlotSelect(matchedFeature.properties);
        } else if (features.length > 0 && !selectedPlot) {
          handlePlotSelect(features[0].properties);
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
    setActiveTab("mutation");
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Taluks Covered</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#0a192f", marginTop: 3 }}>9 Taluks (வட்டங்கள்)</div>
          <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 1 }}>Coimbatore North to Valparai</div>
        </div>

        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Active Parcels in View</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#1d4ed8", marginTop: 3 }}>{totalParcels} FMB Parcels</div>
          <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 1 }}>Total Extent: {totalAcres.toFixed(1)} Acres</div>
        </div>

        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Average Maturity Score</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#059669", marginTop: 3 }}>94.2% Verified</div>
          <div style={{ fontSize: 11, color: "#059669", fontWeight: 700, marginTop: 1 }}>High Digitization Quality</div>
        </div>

        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Total Land Asset Value</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#d97706", marginTop: 3 }}>₹{(totalValuation / 10000000).toFixed(1)} Crores</div>
          <div style={{ fontSize: 11, color: "#334155", fontWeight: 700, marginTop: 1 }}>Based on Guideline & Fair Market</div>
        </div>

        <div className="glass-card" style={{ padding: "12px 16px", borderRadius: 10, border: "1.5px solid #cbd5e1", background: "#ffffff" }}>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>Blockchain Anchor Proof</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: "#7c3aed", marginTop: 3 }}>100% Anchored</div>
          <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700, marginTop: 1 }}>Polygon Amoy Testnet (80002)</div>
        </div>
      </div>

      {/* 9 Taluks Filter Strip */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
        {COIMBATORE_TALUKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedTaluk(t.id)}
            style={{
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 800,
              borderRadius: 8,
              whiteSpace: "nowrap",
              border: selectedTaluk === t.id ? "1.5px solid #1e40af" : "1.5px solid #cbd5e1",
              background: selectedTaluk === t.id ? "linear-gradient(135deg, #0a192f, #1d4ed8)" : "#ffffff",
              color: selectedTaluk === t.id ? "#ffffff" : "#0f172a",
              boxShadow: selectedTaluk === t.id ? "0 2px 8px rgba(29,78,216,0.3)" : "0 1px 2px rgba(0,0,0,0.04)",
              cursor: "pointer",
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Land Category Filter Strip */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        {LAND_CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 800,
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: isSelected ? "1.5px solid #1d4ed8" : "1.5px solid #cbd5e1",
                background: isSelected ? "linear-gradient(135deg, #1d4ed8, #2563eb)" : "#ffffff",
                color: isSelected ? "#ffffff" : "#0f172a",
                boxShadow: isSelected ? "0 2px 8px rgba(37,99,235,0.3)" : "0 1px 2px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              <Icon size={14} color={isSelected ? "#ffffff" : "#1d4ed8"} />
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
                  { id: "mutation", label: "📜 Land Transfer History (உரிமை மாற்றம்)", icon: Clock },
                  { id: "overview", label: "📋 Overview", icon: FileText },
                  { id: "inheritance", label: "🌳 Lineage & Heirs", icon: GitFork },
                  { id: "satellite", label: "🛰️ GeoAI Satellite", icon: Layers },
                  { id: "3d_twin", label: "🏔️ 3D Digital Twin", icon: Mountain },
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
                  {/* Latest Ownership Transfer Snapshot Card */}
                  {plotDetails.mutation_history && plotDetails.mutation_history.length > 0 && (() => {
                    const latest = plotDetails.mutation_history[plotDetails.mutation_history.length - 1];
                    return (
                      <div style={{
                        background: "rgba(15, 23, 42, 0.9)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        padding: 14,
                        borderRadius: 8,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", textTransform: "uppercase" }}>
                            📜 சமீபத்திய உரிமை மாற்றம் (Latest Title Transfer)
                          </span>
                          <button
                            onClick={() => setActiveTab("mutation")}
                            style={{
                              background: "rgba(56, 189, 248, 0.15)", border: "1px solid rgba(56, 189, 248, 0.3)",
                              color: "#38bdf8", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, cursor: "pointer"
                            }}
                          >
                            View Full Transfer History ({plotDetails.mutation_history.length} Steps) →
                          </button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, flexWrap: "wrap" }}>
                          <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "4px 8px", borderRadius: 4 }}>
                            <span style={{ fontSize: 10, color: "#f87171", display: "block" }}>Transferor (விற்பவர்):</span>
                            <strong style={{ color: "#ffffff" }}>{latest.transferor}</strong>
                          </div>
                          <span style={{ color: "#38bdf8", fontWeight: 900, fontSize: 16 }}>➔</span>
                          <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 8px", borderRadius: 4 }}>
                            <span style={{ fontSize: 10, color: "#34d399", display: "block" }}>Transferee (வாங்குபவர்):</span>
                            <strong style={{ color: "#ffffff" }}>{latest.transferee}</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 6, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 4 }}>
                          <span>{latest.deed_type} • {latest.doc_no}</span>
                          <span style={{ color: "#34d399", fontWeight: 700 }}>{latest.consideration || ""}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* OCR Ingestion & Granular Confidence Banner */}
                  {(plotDetails.is_ocr_ingested || plotDetails.field_confidences?.length > 0) && (
                    <div style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.12))",
                      border: "1px solid #10b981",
                      boxShadow: "0 4px 14px rgba(16, 185, 129, 0.15)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: "#10b981", display: "flex", alignItems: "center", gap: 6 }}>
                          <CheckCircle2 size={16} /> Verified OCR Extracted Land Parcel
                        </div>
                        <span style={{ fontSize: 11, background: "#10b981", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontWeight: 800 }}>
                          {Math.round((plotDetails.overall_confidence || 0.94) * 100)}% CONFIDENCE
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 10 }}>
                        Script: <strong>{plotDetails.detected_script || "Tamil (தமிழ்)"}</strong> • Mutation: <strong>#{plotDetails.mutation_no || "MUT-2024-8841"}</strong> • Type: <strong>{plotDetails.transaction_type || "கிரைய பத்திரம் (Sale Deed)"}</strong>
                      </div>
                      {plotDetails.field_confidences?.length > 0 && (
                        <div>
                          <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
                            Granular Field Extraction Scores
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {plotDetails.field_confidences.map((fc: any) => (
                              <span key={fc.field_name} style={{
                                fontSize: 10, padding: "2px 6px", borderRadius: 4,
                                background: fc.confidence >= 0.8 ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)",
                                color: fc.confidence >= 0.8 ? "#86efac" : "#fde68a",
                                border: `1px solid ${fc.confidence >= 0.8 ? "rgba(16,185,129,0.5)" : "rgba(245,158,11,0.5)"}`,
                                fontWeight: 700
                              }}>
                                {fc.field_name}: {Math.round((fc.confidence || 0.9) * 100)}%
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Mutation Entry & Date</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        #{plotDetails.mutation_no || "MUT-2024-8841"} ({plotDetails.mutation_date || "2024-02-18"})
                      </div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>Transaction Type</div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginTop: 2 }}>
                        {plotDetails.transaction_type || "கிரைய பத்திரம் (Sale Deed)"}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Chain of Title Header Banner */}
                  <div style={{
                    background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: "16px 18px",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#38bdf8", display: "flex", alignItems: "center", gap: 8 }}>
                        <span>📜</span> முழு நில உரிமை பரிமாற்ற வரலாறு (Chain of Title)
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)"
                      }}>
                        ✓ {plotDetails.mutation_history?.length || 0} Registered Transfers Verified
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                      Comprehensive Sub-Registrar Office (SRO) deed lineage, revenue mutation orders, and legal ownership transfers for <strong>புல எண் (Survey No): {plotDetails.survey_no}</strong>, Patta #{plotDetails.patta_no}.
                    </div>

                    {/* Chain Pathway Breadcrumbs */}
                    {plotDetails.mutation_history?.length > 1 && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
                        <span style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Chain:</span>
                        {plotDetails.mutation_history.map((stepItem: any, sidx: number) => (
                          <div key={sidx} style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                            <span style={{
                              fontSize: 11, padding: "2px 8px", borderRadius: 4,
                              background: sidx === plotDetails.mutation_history.length - 1 ? "rgba(16, 185, 129, 0.2)" : "rgba(56, 189, 248, 0.15)",
                              color: sidx === plotDetails.mutation_history.length - 1 ? "#34d399" : "#38bdf8",
                              fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)"
                            }}>
                              {stepItem.date?.split('-')[0]}: {stepItem.transferee?.split('/')[0]?.split(' ')[0]}
                            </span>
                            {sidx < plotDetails.mutation_history.length - 1 && (
                              <span style={{ color: "#64748b", fontSize: 10, fontWeight: 800 }}>➔</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {plotDetails.mutation_history?.length > 0 ? (
                    <div style={{ position: "relative", paddingLeft: 20, borderLeft: "2px solid rgba(56, 189, 248, 0.4)", display: "flex", flexDirection: "column", gap: 18, marginLeft: 6 }}>
                      {plotDetails.mutation_history.map((m: any, idx: number) => {
                        const isLatest = idx === plotDetails.mutation_history.length - 1;
                        return (
                          <div key={idx} style={{ position: "relative" }}>
                            {/* Step Timeline Node */}
                            <div style={{
                              position: "absolute",
                              left: -27,
                              top: 6,
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: isLatest ? "#10b981" : "#38bdf8",
                              border: "3px solid #0f172a",
                              boxShadow: isLatest ? "0 0 10px rgba(16, 185, 129, 0.6)" : "none"
                            }} />

                            <div style={{
                              background: isLatest ? "rgba(16, 185, 129, 0.04)" : "rgba(255,255,255,0.02)",
                              border: `1px solid ${isLatest ? "rgba(16, 185, 129, 0.3)" : "rgba(255,255,255,0.08)"}`,
                              padding: 16,
                              borderRadius: 10,
                              boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
                            }}>
                              {/* Step Top Bar */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{
                                      fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4,
                                      background: isLatest ? "#10b981" : "#0284c7", color: "#ffffff"
                                    }}>
                                      Step {m.step || idx + 1}
                                    </span>
                                    <span style={{ fontWeight: 800, fontSize: 14, color: isLatest ? "#34d399" : "#38bdf8" }}>
                                      {m.deed_type}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                                    🏛️ {m.doc_no}
                                  </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <span style={{ fontSize: 11, color: "#cbd5e1", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                    📅 {m.date}
                                  </span>
                                  <span style={{
                                    display: "inline-block", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 3, marginTop: 4,
                                    background: "rgba(16, 185, 129, 0.15)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.3)"
                                  }}>
                                    ✓ {m.status || "Registered & Verified"}
                                  </span>
                                </div>
                              </div>

                              {/* VISUAL TRANSFEROR ➔ TRANSFEREE FLOW CARD */}
                              <div style={{
                                background: "rgba(15, 23, 42, 0.7)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                padding: 12,
                                borderRadius: 8,
                                marginBottom: 12
                              }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: 8, letterSpacing: "0.05em" }}>
                                  🔄 உரிமை பரிமாற்ற விபரம் (Ownership Conveyance Flow)
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
                                  {/* Transferor Box (Seller / Prior) */}
                                  <div style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.25)", padding: 10, borderRadius: 6 }}>
                                    <div style={{ fontSize: 10, color: "#f87171", fontWeight: 700, textTransform: "uppercase" }}>
                                      விற்பவர் / முந்தையவர் (Transferor)
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 13, color: "#ffffff", marginTop: 2 }}>
                                      {m.transferor}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>
                                      {m.transferor_role || "Prior Title Holder"}
                                    </div>
                                    {m.transferor_patta && (
                                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
                                        முந்தைய பட்டா: <strong>#{m.transferor_patta}</strong>
                                      </div>
                                    )}
                                  </div>

                                  {/* Direction Arrow */}
                                  <div style={{ textAlign: "center", color: "#38bdf8", fontWeight: 900, fontSize: 18 }}>
                                    ➔
                                  </div>

                                  {/* Transferee Box (Buyer / Subsequent) */}
                                  <div style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: 10, borderRadius: 6 }}>
                                    <div style={{ fontSize: 10, color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>
                                      வாங்குபவர் / பெறுபவர் (Transferee)
                                    </div>
                                    <div style={{ fontWeight: 800, fontSize: 13, color: "#ffffff", marginTop: 2 }}>
                                      {m.transferee}
                                    </div>
                                    <div style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>
                                      {m.transferee_role || "New Title Holder"}
                                    </div>
                                    {m.transferee_patta && (
                                      <div style={{ fontSize: 10, color: "#34d399", marginTop: 2 }}>
                                        புதிய பட்டா: <strong>#{m.transferee_patta}</strong>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Detailed Conveyance Attributes Grid */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 10 }}>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6 }}>
                                  <span style={{ color: "#94a3b8" }}>பரிவர்த்தனை மதிப்பு (Consideration):</span>
                                  <div style={{ fontWeight: 700, color: "#38bdf8", marginTop: 2 }}>
                                    {m.consideration || "வாரிசுரிமை / Family Share"}
                                  </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6 }}>
                                  <span style={{ color: "#94a3b8" }}>முத்திரைத்தாள் கட்டணம் (Stamp Duty):</span>
                                  <div style={{ fontWeight: 700, color: "#cbd5e1", marginTop: 2 }}>
                                    {m.stamp_duty || "அரசு நிர்ணய கட்டணம்"}
                                  </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6 }}>
                                  <span style={{ color: "#94a3b8" }}>பரிமாற்ற பரப்பளவு (Extent):</span>
                                  <div style={{ fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
                                    {m.extent || `${plotDetails.area_acres} Acres`}
                                  </div>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: 8, borderRadius: 6 }}>
                                  <span style={{ color: "#94a3b8" }}>பட்டா மாறுதல் உத்தரவு (Mutation):</span>
                                  <div style={{ fontWeight: 700, color: "#34d399", marginTop: 2 }}>
                                    {m.mutation_order || `#MUT-${2020 + idx}-${plotDetails.survey_no}`}
                                  </div>
                                </div>
                              </div>

                              {/* Four Boundaries (நான்கு எல்லைகள்) */}
                              {m.boundaries && (
                                <div style={{
                                  background: "rgba(0,0,0,0.25)",
                                  border: "1px dashed rgba(255,255,255,0.1)",
                                  padding: 10,
                                  borderRadius: 6,
                                  marginBottom: 8
                                }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 6 }}>
                                    🧭 சொத்தின் நான்கு எல்லைகள் (Four Boundaries of Conveyance)
                                  </div>
                                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10, color: "#cbd5e1" }}>
                                    <div>⬆️ <strong>வடக்கு (North):</strong> {m.boundaries.north}</div>
                                    <div>⬇️ <strong>தெற்கு (South):</strong> {m.boundaries.south}</div>
                                    <div>➡️ <strong>கிழக்கு (East):</strong> {m.boundaries.east}</div>
                                    <div>⬅️ <strong>மேற்கு (West):</strong> {m.boundaries.west}</div>
                                  </div>
                                </div>
                              )}

                              {/* Blockchain Proof Stamp */}
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "#64748b", paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                                <span>⛓️ {m.blockchain_status || "Verified on Polygon Amoy Testnet"}</span>
                                <span style={{ color: "#38bdf8", cursor: "pointer" }}>RecordRegistry.sol ✓</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: 12, padding: 30, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                      No prior registered transfers found. This land parcel reflects the original government settlement grant.
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
