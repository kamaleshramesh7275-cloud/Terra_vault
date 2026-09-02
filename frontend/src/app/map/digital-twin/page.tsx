"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers, Mountain, Satellite, ZoomIn, ZoomOut, RotateCcw,
  Compass, Eye, ShieldCheck, Ruler, Activity, CheckCircle2,
  AlertTriangle, Info, MapPin, Building, Sprout, Sparkles, Navigation2
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

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const initialPlotId = searchParams ? searchParams.get("plot") : null;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const [activeBasemap, setActiveBasemap] = useState("satellite");
  const [pitch, setPitch] = useState(45);
  const [bearing, setBearing] = useState(-15);
  const [zoom, setZoom] = useState(15.5);

  const [selectedParcel, setSelectedParcel] = useState<CoimbatoreParcel | null>(null);
  const [showEncroachment, setShowEncroachment] = useState(true);
  const [showNdvi, setShowNdvi] = useState(false);
  const [timeTravelYear, setTimeTravelYear] = useState<"1994" | "2026">("2026");

  // Selected default parcel (Kinathukadavu or from URL)
  useEffect(() => {
    const matched = MOCK_COIMBATORE_PARCELS.find(p => p.id === initialPlotId) ||
      MOCK_COIMBATORE_PARCELS.find(p => p.taluk === "Kinathukadavu") ||
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
            "basemap-raster": {
              type: "raster",
              tiles: BASEMAPS[0].tiles,
              tileSize: 256,
              attribution: BASEMAPS[0].attribution
            }
          },
          layers: [
            {
              id: "basemap-layer",
              type: "raster",
              source: "basemap-raster",
              minzoom: 0,
              maxzoom: 20
            }
          ]
        },
        center: [centerLng, centerLat],
        zoom: 15.5,
        pitch: 45,
        bearing: -15,
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
            blockchain_hash: p.blockchain_hash
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

        // 2. Cadastral Fill Layer
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
              "#0f2942"
            ],
            "fill-opacity": 0.35
          }
        });

        // 3. Cadastral Outline Layer
        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-dasharray": [2, 1]
          }
        });

        // 4. Hover Highlight Layer
        map.addLayer({
          id: "parcels-highlight",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#eab308",
            "line-width": 4
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

        // Pointer cursor
        map.on("mouseenter", "parcels-fill", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "parcels-fill", () => {
          map.getCanvas().style.cursor = "";
        });

        // Update state on move
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

  // Update basemap tiles when activeBasemap changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    const bm = BASEMAPS.find(b => b.id === activeBasemap) || BASEMAPS[0];
    const source = mapInstanceRef.current.getSource("basemap-raster");
    if (source && source.setTiles) {
      source.setTiles(bm.tiles);
    }
  }, [activeBasemap]);

  // Update highlight when selectedParcel changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapInstanceRef.current.isStyleLoaded()) return;
    if (selectedParcel) {
      mapInstanceRef.current.setFilter("parcels-highlight", ["==", "id", selectedParcel.id]);
      const [lng, lat] = selectedParcel.polygon[0];
      mapInstanceRef.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        pitch: 45,
        bearing: -15,
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
      mapInstanceRef.current.easeTo({ pitch: 55, bearing: -25, zoom: 16.5 });
    } else if (preset === "drone") {
      mapInstanceRef.current.easeTo({ pitch: 60, bearing: 45, zoom: 17 });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px)", background: "#0b1329", color: "#f8fafc" }}>
      {/* Top Header Controls Bar */}
      <div style={{
        padding: "10px 18px",
        background: "#0f172a",
        borderBottom: "1px solid #1e293b",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12
      }}>
        {/* Title */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(14, 165, 233, 0.4)"
          }}>
            <Eye size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#ffffff", letterSpacing: "-0.01em" }}>
              2D / 3D Cadastral Digital Twin
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              MapLibre GL Vector GIS • Elevation Pitch {pitch}° • Bearing {bearing}°
            </div>
          </div>
        </div>

        {/* View Mode Preset Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e293b", padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setCameraPreset("2d")}
            style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: pitch === 0 ? "#0ea5e9" : "transparent",
              color: pitch === 0 ? "#ffffff" : "#94a3b8",
              border: "none", transition: "all 0.15s"
            }}
          >
            2D Ortho Plan
          </button>
          <button
            onClick={() => setCameraPreset("3d")}
            style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: pitch > 0 && pitch < 60 ? "#0ea5e9" : "transparent",
              color: pitch > 0 && pitch < 60 ? "#ffffff" : "#94a3b8",
              border: "none", transition: "all 0.15s"
            }}
          >
            3D Elevation ({pitch}°)
          </button>
          <button
            onClick={() => setCameraPreset("drone")}
            style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
              background: pitch >= 60 ? "#0ea5e9" : "transparent",
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
                onClick={() => setActiveBasemap(bm.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  background: isSelected ? "#0284c7" : "#1e293b",
                  color: isSelected ? "#ffffff" : "#cbd5e1",
                  border: isSelected ? "1px solid #38bdf8" : "1px solid #334155",
                  transition: "all 0.15s"
                }}
              >
                <Icon size={13} />
                {bm.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Body Area with Sidebar Panel */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* MapLibre Canvas Container */}
        <div ref={mapContainerRef} style={{ flex: 1, width: "100%", height: "100%" }} />

        {/* Floating Left Layer & Analysis Toggles */}
        <div style={{
          position: "absolute",
          top: 14,
          left: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          zIndex: 10,
          background: "rgba(15, 23, 42, 0.88)",
          backdropFilter: "blur(8px)",
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          width: 220
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            AI Analytics Layers
          </div>

          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={13} color="#ef4444" />
              Encroachment Alert
            </span>
            <input
              type="checkbox"
              checked={showEncroachment}
              onChange={e => setShowEncroachment(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sprout size={13} color="#22c55e" />
              NDVI Crop Health
            </span>
            <input
              type="checkbox"
              checked={showNdvi}
              onChange={e => setShowNdvi(e.target.checked)}
              style={{ cursor: "pointer" }}
            />
          </label>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Time-Travel Baseline
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <button
                onClick={() => setTimeTravelYear("1994")}
                style={{
                  padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: timeTravelYear === "1994" ? "#d97706" : "#1e293b",
                  color: "#ffffff", border: "none"
                }}
              >
                1994 Ancestral
              </button>
              <button
                onClick={() => setTimeTravelYear("2026")}
                style={{
                  padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  background: timeTravelYear === "2026" ? "#0ea5e9" : "#1e293b",
                  color: "#ffffff", border: "none"
                }}
              >
                2026 Drone Twin
              </button>
            </div>
          </div>
        </div>

        {/* Right Inspection Property Drawer */}
        {selectedParcel && (
          <div style={{
            position: "absolute",
            top: 14,
            right: 14,
            bottom: 14,
            width: 340,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(12px)",
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            zIndex: 10,
            overflow: "hidden"
          }}>
            {/* Drawer Header */}
            <div style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(37, 99, 235, 0.2))",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Kinathukadavu Cadastral Parcel
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                  SF {selectedParcel.survey_no} • Patta #{selectedParcel.patta_no}
                </div>
              </div>
              <span style={{
                padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                background: selectedParcel.land_category === "Agriculture" ? "rgba(34, 197, 94, 0.2)" : "rgba(217, 119, 6, 0.2)",
                color: selectedParcel.land_category === "Agriculture" ? "#4ade80" : "#fbbf24",
                border: "1px solid rgba(255, 255, 255, 0.1)"
              }}>
                {selectedParcel.land_category}
              </span>
            </div>

            {/* Drawer Body Scroll */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Owner Info */}
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 10, borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Registered Pattadar (உரிமையாளர்)</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#ffffff", marginTop: 2 }}>{selectedParcel.owner_name}</div>
                <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 1 }}>Father: {selectedParcel.father_name}</div>
              </div>

              {/* Area & Valuation Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 10, borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Land Extent</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8", marginTop: 2 }}>{selectedParcel.area_acres} Acres</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{selectedParcel.area_cents} Cents ({selectedParcel.area_sqm} m²)</div>
                </div>

                <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 10, borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                  <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Market Value</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#4ade80", marginTop: 2 }}>
                    ₹{(selectedParcel.market_value_inr / 100000).toFixed(2)} Lakhs
                  </div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>GLV: ₹{selectedParcel.guideline_value_sqft}/sqft</div>
                </div>
              </div>

              {/* Soil & Land Classification */}
              <div style={{ background: "rgba(30, 41, 59, 0.6)", padding: 10, borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Classification & Soil</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>{selectedParcel.land_type}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>🌱 {selectedParcel.soil_type}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>📍 {selectedParcel.village} • {selectedParcel.taluk} Taluk</div>
              </div>

              {/* Encumbrance Status */}
              <div style={{
                background: selectedParcel.encumbrance_status.includes("Clean") ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                padding: 10, borderRadius: 8,
                border: selectedParcel.encumbrance_status.includes("Clean") ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 800, color: selectedParcel.encumbrance_status.includes("Clean") ? "#4ade80" : "#f87171" }}>
                  <ShieldCheck size={14} />
                  SRO Encumbrance Certificate
                </div>
                <div style={{ fontSize: 11, color: "#ffffff", marginTop: 3 }}>
                  {selectedParcel.encumbrance_status}
                </div>
              </div>

              {/* Blockchain Seal Hash */}
              <div style={{ background: "rgba(15, 23, 42, 0.8)", padding: 10, borderRadius: 8, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Polygon Blockchain Seal</div>
                <div style={{
                  fontSize: 10, fontFamily: "monospace", color: "#38bdf8",
                  wordBreak: "break-all", background: "#0b1329", padding: "6px 8px", borderRadius: 4, marginTop: 4
                }}>
                  {selectedParcel.blockchain_hash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
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
