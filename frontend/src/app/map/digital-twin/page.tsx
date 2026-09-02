"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers, Mountain, Satellite, ZoomIn, ZoomOut, RotateCcw,
  Compass, Eye, ShieldCheck, Ruler, Activity, CheckCircle2,
  AlertTriangle, Info, MapPin, Building, Sprout, Sparkles, Navigation2,
  Search, X, ExternalLink, Copy, Check, Scissors, ChevronRight, History, Maximize2
} from "lucide-react";
import { MOCK_COIMBATORE_PARCELS, CoimbatoreParcel } from "@/lib/mockData";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Basemap Definitions ───────────────────────────────────────────────────────
const BASEMAPS = [
  {
    id: "satellite",
    name: "High-Res Satellite (Esri)",
    icon: Satellite,
    tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    attribution: "© Esri, Maxar, Earthstar Geographics"
  },
  {
    id: "osm",
    name: "OpenStreetMap Carto",
    icon: Navigation2,
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenStreetMap contributors"
  },
  {
    id: "topo",
    name: "OpenTopoMap Contours",
    icon: Mountain,
    tiles: ["https://tile.opentopomap.org/{z}/{x}/{y}.png"],
    attribution: "© OpenTopoMap (CC-BY-SA)"
  }
];

function calculateDistanceMeters(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371000;
  const lat1 = (coord1[1] * Math.PI) / 180;
  const lat2 = (coord2[1] * Math.PI) / 180;
  const dLat = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const dLng = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const initialPlotId = searchParams ? searchParams.get("plot") : null;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [activeBasemap, setActiveBasemap] = useState("satellite");
  const [pitch, setPitch] = useState(50);
  const [bearing, setBearing] = useState(-20);
  const [zoom, setZoom] = useState(16.5);

  const [selectedParcel, setSelectedParcel] = useState<CoimbatoreParcel | null>(null);
  const [showEncroachment, setShowEncroachment] = useState(true);
  const [showNdvi, setShowNdvi] = useState(false);
  const [timeTravelYear, setTimeTravelYear] = useState<"1994" | "2026">("2026");

  // Measurement State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);

  // Subdivision Simulator State
  const [isSubdivisionActive, setIsSubdivisionActive] = useState(false);

  // Blockchain Modal State
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // Filtered Kinathukadavu Parcels for quick select
  const kinathukadavuParcels = MOCK_COIMBATORE_PARCELS.filter(p => p.taluk === "Kinathukadavu" || p.id.startsWith("cbe-plot"));

  // Select initial parcel
  useEffect(() => {
    const matched =
      MOCK_COIMBATORE_PARCELS.find(p => p.id === initialPlotId) ||
      kinathukadavuParcels[0] ||
      MOCK_COIMBATORE_PARCELS[0];
    setSelectedParcel(matched);
  }, [initialPlotId]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let maplibregl: any;
    let map: any;

    import("maplibre-gl").then((mod) => {
      maplibregl = mod.default || mod;

      const centerLng = selectedParcel ? selectedParcel.polygon[0][0] : 77.0200;
      const centerLat = selectedParcel ? selectedParcel.polygon[0][1] : 10.8200;

      map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: {
          version: 8,
          sources: {
            "source-satellite": {
              type: "raster",
              tiles: BASEMAPS[0].tiles,
              tileSize: 256,
              attribution: BASEMAPS[0].attribution
            },
            "source-osm": {
              type: "raster",
              tiles: BASEMAPS[1].tiles,
              tileSize: 256,
              attribution: BASEMAPS[1].attribution
            },
            "source-topo": {
              type: "raster",
              tiles: BASEMAPS[2].tiles,
              tileSize: 256,
              attribution: BASEMAPS[2].attribution
            }
          },
          layers: [
            {
              id: "layer-satellite",
              type: "raster",
              source: "source-satellite",
              layout: { visibility: "visible" },
              minzoom: 0,
              maxzoom: 20
            },
            {
              id: "layer-osm",
              type: "raster",
              source: "source-osm",
              layout: { visibility: "none" },
              minzoom: 0,
              maxzoom: 20
            },
            {
              id: "layer-topo",
              type: "raster",
              source: "source-topo",
              layout: { visibility: "none" },
              minzoom: 0,
              maxzoom: 20
            }
          ]
        },
        center: [centerLng, centerLat],
        zoom: 16.5,
        pitch: 50,
        bearing: -20,
        maxPitch: 65,
        antialias: true
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

      map.on("load", () => {
        // 1. Cadastral Parcels GeoJSON Source
        const features = MOCK_COIMBATORE_PARCELS.map(p => ({
          type: "Feature",
          id: p.id,
          properties: {
            id: p.id,
            survey_no: p.survey_no,
            patta_no: p.patta_no,
            owner_name: p.owner_name,
            village: p.village,
            taluk: p.taluk,
            area_acres: p.area_acres,
            land_category: p.land_category,
            encumbrance_status: p.encumbrance_status,
            market_value_inr: p.market_value_inr,
            blockchain_hash: p.blockchain_hash,
            has_encroachment: p.id === "cbe-plot-001" || p.id === "cbe-plot-003",
            ndvi_score: 0.78 + ((p.id.charCodeAt(p.id.length - 1) % 5) * 0.04)
          },
          geometry: {
            type: "Polygon",
            coordinates: [p.polygon]
          }
        }));

        map.addSource("cadastral-parcels", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features
          }
        });

        // 2. 1994 Historical Time-Travel GeoJSON Source
        const features1994 = MOCK_COIMBATORE_PARCELS.map(p => {
          const shiftedPoly = p.polygon.map(([lng, lat]) => [lng - 0.0006, lat - 0.0004]);
          return {
            type: "Feature",
            id: `1994-${p.id}`,
            properties: {
              id: p.id,
              survey_no: p.survey_no,
              patta_no: `Old #${Number(p.patta_no) - 400}`,
              year: "1994"
            },
            geometry: {
              type: "Polygon",
              coordinates: [shiftedPoly]
            }
          };
        });

        map.addSource("historical-1994", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features1994
          }
        });

        // 3. Cadastral Standard Fill Layer (Bold Saturated Colors)
        map.addLayer({
          id: "parcels-fill",
          type: "fill",
          source: "cadastral-parcels",
          paint: {
            "fill-color": [
              "match",
              ["get", "land_category"],
              "Agriculture", "#16a34a",
              "Commercial", "#d97706",
              "Industrial", "#2563eb",
              "Residential", "#9333ea",
              "#0ea5e9"
            ],
            "fill-opacity": 0.45
          }
        });

        // 4. NDVI Crop Health Layer
        map.addLayer({
          id: "parcels-ndvi-fill",
          type: "fill",
          source: "cadastral-parcels",
          layout: { visibility: "none" },
          paint: {
            "fill-color": [
              "interpolate",
              ["linear"],
              ["get", "ndvi_score"],
              0.65, "#ef4444",
              0.75, "#eab308",
              0.82, "#22c55e",
              0.92, "#15803d"
            ],
            "fill-opacity": 0.75
          }
        });

        // 5. Cadastral Outline Layer (Bold High-Contrast White)
        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#ffffff",
            "line-width": 3,
            "line-dasharray": [3, 1]
          }
        });

        // 6. Encroachment Alert Collision Layer (Flashing Neon Red)
        map.addLayer({
          id: "parcels-encroachment",
          type: "line",
          source: "cadastral-parcels",
          filter: ["==", "has_encroachment", true],
          paint: {
            "line-color": "#ef4444",
            "line-width": 5
          }
        });

        // 7. 1994 Historical Ancestral Boundary Layer (Dashed Gold)
        map.addLayer({
          id: "parcels-1994-outline",
          type: "line",
          source: "historical-1994",
          layout: { visibility: "none" },
          paint: {
            "line-color": "#f59e0b",
            "line-width": 3.5,
            "line-dasharray": [4, 2]
          }
        });

        // 8. Selected Parcel Glowing Highlight Outline
        map.addLayer({
          id: "parcels-highlight",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#facc15",
            "line-width": 6
          },
          filter: ["==", "id", selectedParcel?.id || ""]
        });

        // Click on parcel
        map.on("click", "parcels-fill", (e: any) => {
          if (e.features && e.features[0]) {
            const featId = e.features[0].properties.id;
            const found = MOCK_COIMBATORE_PARCELS.find(p => p.id === featId);
            if (found) {
              setSelectedParcel(found);
              map.setFilter("parcels-highlight", ["==", "id", found.id]);
            }
          }
        });

        // Measurement click listener
        map.on("click", (e: any) => {
          if ((window as any).__measuring) {
            const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setMeasurePoints(prev => {
              const updated = [...prev, pt];
              if (updated.length >= 2) {
                const p1 = updated[updated.length - 2];
                const p2 = updated[updated.length - 1];
                const dist = calculateDistanceMeters(p1, p2);
                setMeasureResult(`Distance: ${dist} meters (~${Math.round(dist * 3.28)} ft) | Points: ${updated.length}`);
              }
              return updated;
            });
          }
        });

        map.on("mouseenter", "parcels-fill", () => {
          if (!(window as any).__measuring) {
            map.getCanvas().style.cursor = "pointer";
          }
        });
        map.on("mouseleave", "parcels-fill", () => {
          if (!(window as any).__measuring) {
            map.getCanvas().style.cursor = "";
          }
        });

        // Track camera orientation
        map.on("move", () => {
          setPitch(Math.round(map.getPitch()));
          setBearing(Math.round(map.getBearing()));
          setZoom(Number(map.getZoom().toFixed(1)));
        });
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update basemap layers with instant visibility toggle
  const switchBasemap = (bmId: string) => {
    setActiveBasemap(bmId);
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    const map = mapInstanceRef.current;
    map.setLayoutProperty("layer-satellite", "visibility", bmId === "satellite" ? "visible" : "none");
    map.setLayoutProperty("layer-osm", "visibility", bmId === "osm" ? "visible" : "none");
    map.setLayoutProperty("layer-topo", "visibility", bmId === "topo" ? "visible" : "none");
  };

  // Update NDVI layer visibility
  const toggleNdvi = (val: boolean) => {
    setShowNdvi(val);
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    mapInstanceRef.current.setLayoutProperty(
      "parcels-ndvi-fill",
      "visibility",
      val ? "visible" : "none"
    );
  };

  // Update Encroachment layer visibility
  const toggleEncroachment = (val: boolean) => {
    setShowEncroachment(val);
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    mapInstanceRef.current.setLayoutProperty(
      "parcels-encroachment",
      "visibility",
      val ? "visible" : "none"
    );
  };

  // Update Time-Travel baseline
  const switchTimeTravel = (year: "1994" | "2026") => {
    setTimeTravelYear(year);
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    mapInstanceRef.current.setLayoutProperty(
      "parcels-1994-outline",
      "visibility",
      year === "1994" ? "visible" : "none"
    );
  };

  // Update highlight and fly-to when selectedParcel changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    if (selectedParcel) {
      mapInstanceRef.current.setFilter("parcels-highlight", ["==", "id", selectedParcel.id]);
      const [lng, lat] = selectedParcel.polygon[0];
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 16.5,
        pitch: pitch > 0 ? pitch : 50,
        bearing: bearing,
        speed: 1.2
      });
    }
  }, [selectedParcel]);

  // Camera presets
  const setCameraPreset = (preset: "2d" | "3d" | "drone") => {
    if (!mapInstanceRef.current) return;
    if (preset === "2d") {
      mapInstanceRef.current.easeTo({ pitch: 0, bearing: 0, zoom: 16 });
    } else if (preset === "3d") {
      mapInstanceRef.current.easeTo({ pitch: 50, bearing: -20, zoom: 16.5 });
    } else if (preset === "drone") {
      mapInstanceRef.current.easeTo({ pitch: 60, bearing: 45, zoom: 17 });
    }
  };

  // Toggle Measurement Tool
  const toggleMeasurement = () => {
    const nextState = !isMeasuring;
    setIsMeasuring(nextState);
    (window as any).__measuring = nextState;
    if (!nextState) {
      setMeasurePoints([]);
      setMeasureResult(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getCanvas().style.cursor = "";
      }
    } else {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getCanvas().style.cursor = "crosshair";
      }
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "#0a1128", color: "#f8fafc", position: "relative" }}>
      {/* ── Top Header Controls Bar ────────────────────────────────────────── */}
      <div style={{
        padding: "10px 18px",
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
        zIndex: 20
      }}>
        {/* Title & Telemetry */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(14, 165, 233, 0.4)"
          }}>
            <Eye size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#ffffff", letterSpacing: "-0.01em" }}>
              2D / 3D Cadastral Digital Twin
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              MapLibre GL Vector GIS • Elevation Pitch <strong>{pitch}°</strong> • Bearing <strong>{bearing}°</strong>
            </div>
          </div>
        </div>

        {/* View Mode Preset Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e293b", padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setCameraPreset("2d")}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: pitch === 0 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
              color: pitch === 0 ? "#ffffff" : "#94a3b8",
              border: "none", transition: "all 0.15s"
            }}
          >
            2D Ortho Plan
          </button>
          <button
            onClick={() => setCameraPreset("3d")}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: pitch > 0 && pitch < 60 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
              color: pitch > 0 && pitch < 60 ? "#ffffff" : "#94a3b8",
              border: "none", transition: "all 0.15s"
            }}
          >
            3D Elevation ({pitch}°)
          </button>
          <button
            onClick={() => setCameraPreset("drone")}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: pitch >= 60 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
              color: pitch >= 60 ? "#ffffff" : "#94a3b8",
              border: "none", transition: "all 0.15s"
            }}
          >
            Drone Oblique (60°)
          </button>
        </div>

        {/* Basemap Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {BASEMAPS.map(bm => {
            const Icon = bm.icon;
            const isSelected = activeBasemap === bm.id;
            return (
              <button
                key={bm.id}
                onClick={() => switchBasemap(bm.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                  background: isSelected ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "#1e293b",
                  color: isSelected ? "#ffffff" : "#cbd5e1",
                  border: isSelected ? "1px solid #38bdf8" : "1px solid #334155",
                  boxShadow: isSelected ? "0 0 10px rgba(14,165,233,0.35)" : "none",
                  transition: "all 0.15s"
                }}
              >
                <Icon size={13} />
                {bm.name.split(" ")[0]}
              </button>
            );
          })}

          {/* Interactive Measurement Button */}
          <button
            onClick={toggleMeasurement}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: isMeasuring ? "#dc2626" : "#1e293b",
              color: "#ffffff",
              border: isMeasuring ? "1px solid #ef4444" : "1px solid #334155",
              boxShadow: isMeasuring ? "0 0 12px rgba(239,68,68,0.4)" : "none",
              transition: "all 0.15s"
            }}
          >
            <Ruler size={13} />
            {isMeasuring ? "Stop Measure" : "Measure Tool"}
          </button>
        </div>
      </div>

      {/* ── Main Map Canvas & Overlays Container ─────────────────────────── */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* MapLibre Canvas */}
        <div ref={mapContainerRef} style={{ flex: 1, width: "100%", height: "100%" }} />

        {/* Floating Measurement Banner */}
        {isMeasuring && (
          <div style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(8px)",
            border: "1px solid #38bdf8",
            padding: "8px 18px",
            borderRadius: 20,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.5)"
          }}>
            <Ruler size={16} color="#38bdf8" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#ffffff" }}>
              {measureResult || "Click any two points on the map to measure boundary distances"}
            </span>
            <button
              onClick={() => { setMeasurePoints([]); setMeasureResult(null); }}
              style={{ background: "#334155", border: "none", color: "#ffffff", fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 800 }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Floating Left Layer & Analysis Toggles */}
        <div style={{
          position: "absolute",
          top: 14,
          left: 14,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.94)",
          backdropFilter: "blur(10px)",
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.14)",
          width: 240,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            AI Analytics Layers
          </div>

          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer", fontWeight: 800 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#f87171" }}>
              <AlertTriangle size={15} color="#ef4444" />
              Encroachment Alert
            </span>
            <input
              type="checkbox"
              checked={showEncroachment}
              onChange={e => toggleEncroachment(e.target.checked)}
              style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#ef4444" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer", fontWeight: 800 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4ade80" }}>
              <Sprout size={15} color="#22c55e" />
              NDVI Crop Health
            </span>
            <input
              type="checkbox"
              checked={showNdvi}
              onChange={e => toggleNdvi(e.target.checked)}
              style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#22c55e" }}
            />
          </label>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: 10, marginTop: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Time-Travel Baseline
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              <button
                onClick={() => switchTimeTravel("1994")}
                style={{
                  padding: "7px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                  background: timeTravelYear === "1994" ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#1e293b",
                  color: "#ffffff", border: timeTravelYear === "1994" ? "1px solid #fde68a" : "1px solid #334155",
                  boxShadow: timeTravelYear === "1994" ? "0 0 10px rgba(217,119,6,0.4)" : "none"
                }}
              >
                1994 Ancestral
              </button>
              <button
                onClick={() => switchTimeTravel("2026")}
                style={{
                  padding: "7px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                  background: timeTravelYear === "2026" ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "#1e293b",
                  color: "#ffffff", border: timeTravelYear === "2026" ? "1px solid #38bdf8" : "1px solid #334155",
                  boxShadow: timeTravelYear === "2026" ? "0 0 10px rgba(14,165,233,0.4)" : "none"
                }}
              >
                2026 Drone Twin
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspection Property Drawer with Scrollable Body */}
        {selectedParcel && (
          <div style={{
            position: "absolute",
            top: 14,
            right: 14,
            bottom: 14,
            width: 360,
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(14px)",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.16)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            overflow: "hidden"
          }}>
            {/* Drawer Header with Parcel Selector */}
            <div style={{
              padding: "14px 16px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.3), rgba(37, 99, 235, 0.3))",
              borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flexShrink: 0
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Kinathukadavu Cadastral Parcel
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#ffffff" }}>
                    SF {selectedParcel.survey_no} • Patta #{selectedParcel.patta_no}
                  </div>
                </div>
                <span style={{
                  padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900,
                  background: selectedParcel.land_category === "Agriculture" ? "#064e3b" : "#78350f",
                  color: selectedParcel.land_category === "Agriculture" ? "#4ade80" : "#fbbf24",
                  border: "1px solid rgba(255, 255, 255, 0.15)"
                }}>
                  {selectedParcel.land_category}
                </span>
              </div>

              {/* Quick Jump Selector Dropdown */}
              <select
                value={selectedParcel.id}
                onChange={e => {
                  const target = MOCK_COIMBATORE_PARCELS.find(p => p.id === e.target.value);
                  if (target) setSelectedParcel(target);
                }}
                style={{
                  background: "#0b1329", color: "#ffffff", border: "1px solid #334155",
                  borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", width: "100%"
                }}
              >
                {kinathukadavuParcels.map(p => (
                  <option key={p.id} value={p.id}>
                    SF {p.survey_no} — {p.owner_name.split("/")[0].trim()} ({p.area_acres} Ac)
                  </option>
                ))}
              </select>
            </div>

            {/* Drawer Body Scroll */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 30px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Registered Pattadar */}
              <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Registered Pattadar (உரிமையாளர்)</div>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#ffffff", marginTop: 2 }}>{selectedParcel.owner_name}</div>
                <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>Father / Spouse: <strong>{selectedParcel.father_name}</strong></div>
              </div>

              {/* Area & Valuation Metrics */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 10, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Land Extent</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#38bdf8", marginTop: 2 }}>{selectedParcel.area_acres} Acres</div>
                  <div style={{ fontSize: 10, color: "#cbd5e1" }}>{selectedParcel.area_cents} Cents ({selectedParcel.area_sqm} m²)</div>
                </div>

                <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 10, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Market Value</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: "#4ade80", marginTop: 2 }}>
                    ₹{(selectedParcel.market_value_inr / 100000).toFixed(2)} Lakhs
                  </div>
                  <div style={{ fontSize: 10, color: "#cbd5e1" }}>GLV: ₹{selectedParcel.guideline_value_sqft}/sqft</div>
                </div>
              </div>

              {/* Classification & Soil */}
              <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 10, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Classification & Soil</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>{selectedParcel.land_type}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>🌱 {selectedParcel.soil_type}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {selectedParcel.village} • {selectedParcel.taluk} Taluk</div>
              </div>

              {/* Encumbrance Certificate Status */}
              <div style={{
                background: selectedParcel.encumbrance_status.includes("Clean") ? "rgba(6, 78, 59, 0.45)" : "rgba(127, 29, 29, 0.45)",
                padding: 10, borderRadius: 10,
                border: selectedParcel.encumbrance_status.includes("Clean") ? "1px solid #059669" : "1px solid #dc2626"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 900, color: selectedParcel.encumbrance_status.includes("Clean") ? "#4ade80" : "#f87171" }}>
                  <ShieldCheck size={15} />
                  SRO Encumbrance Certificate
                </div>
                <div style={{ fontSize: 11, color: "#ffffff", marginTop: 3 }}>
                  {selectedParcel.encumbrance_status}
                </div>
              </div>

              {/* Blockchain Polygon Proof Trigger Button */}
              <button
                onClick={() => setShowBlockchainModal(true)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "11px 14px", borderRadius: 8,
                  background: "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: "1px solid #6366f1",
                  color: "#ffffff", cursor: "pointer", transition: "all 0.15s",
                  boxShadow: "0 2px 8px rgba(99,102,241,0.3)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <ShieldCheck size={16} color="#818cf8" />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 11, fontWeight: 800 }}>Polygon Blockchain Proof</div>
                    <div style={{ fontSize: 9, color: "#a5b4fc" }}>Amoy Testnet (Chain ID 80002)</div>
                  </div>
                </div>
                <ChevronRight size={14} color="#818cf8" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Polygon Blockchain Verification Modal ──────────────────────────── */}
      {showBlockchainModal && selectedParcel && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{
            width: "100%", maxWidth: 520, background: "#0f172a", borderRadius: 14,
            border: "1px solid #334155", boxShadow: "0 20px 50px rgba(0,0,0,0.8)", overflow: "hidden"
          }}>
            <div style={{
              padding: "16px 20px", background: "linear-gradient(135deg, #1e1b4b, #312e81)",
              borderBottom: "1px solid #4338ca", display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck size={20} color="#818cf8" />
                <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff" }}>
                  Polygon Amoy Audit Proof
                </div>
              </div>
              <button onClick={() => setShowBlockchainModal(false)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(16,185,129,0.15)", border: "1px solid #059669", borderRadius: 8, color: "#4ade80", fontSize: 12, fontWeight: 800 }}>
                <CheckCircle2 size={16} />
                Cryptographically Anchored & Immutable
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Cadastral Record Identifier</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>
                  SF {selectedParcel.survey_no} • Patta #{selectedParcel.patta_no} • Kinathukadavu
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>SHA-256 State Merkle Hash</div>
                <div style={{
                  fontSize: 11, fontFamily: "monospace", color: "#38bdf8", wordBreak: "break-all",
                  background: "#020617", padding: "8px 12px", borderRadius: 6, border: "1px solid #1e293b", marginTop: 4
                }}>
                  {selectedParcel.blockchain_hash}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ background: "#1e293b", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>BLOCK NUMBER</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>#492810</div>
                </div>
                <div style={{ background: "#1e293b", padding: 10, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700 }}>NETWORK</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#818cf8", marginTop: 2 }}>Polygon Amoy (80002)</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedParcel.blockchain_hash);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  style={{
                    flex: 1, padding: "9px 14px", borderRadius: 8, background: "#1e293b",
                    border: "1px solid #475569", color: "#ffffff", fontSize: 12, fontWeight: 700,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  {copiedHash ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                  {copiedHash ? "Hash Copied!" : "Copy SHA-256 Hash"}
                </button>
                <button
                  onClick={() => setShowBlockchainModal(false)}
                  style={{
                    padding: "9px 20px", borderRadius: 8, background: "#2563eb",
                    border: "none", color: "#ffffff", fontSize: 12, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DigitalTwinPage() {
  return (
    <Suspense fallback={<div style={{ padding: 30, color: "#ffffff" }}>Loading MapLibre Digital Twin...</div>}>
      <DigitalTwinContent />
    </Suspense>
  );
}
