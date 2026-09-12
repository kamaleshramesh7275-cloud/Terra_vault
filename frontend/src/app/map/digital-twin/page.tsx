"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Layers, Mountain, Satellite, ZoomIn, ZoomOut, RotateCcw,
  Compass, Eye, ShieldCheck, Ruler, Activity, CheckCircle2,
  AlertTriangle, Info, MapPin, Building, Sprout, Sparkles, Navigation2,
  Search, X, ExternalLink, Copy, Check, Scissors, ChevronRight, History, Maximize2, ArrowLeft,
  Trees, Home, Factory, Briefcase, Filter
} from "lucide-react";
import { MOCK_COIMBATORE_PARCELS, CoimbatoreParcel } from "@/lib/mockData";
import { resolveGeographicCoordinates, generateCadastralPolygon, inferDistrict } from "@/lib/geoResolver";
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

function calculatePolygonAreaAcres(points: [number, number][]): { acres: number; cents: number; sqm: number; perimeterMeters: number } {
  if (points.length < 3) return { acres: 0, cents: 0, sqm: 0, perimeterMeters: 0 };
  let areaM2 = 0;
  let perimeter = 0;
  const numPoints = points.length;
  
  for (let i = 0; i < numPoints; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % numPoints];
    perimeter += calculateDistanceMeters(p1, p2);
    const x1 = (p1[0] * Math.PI / 180) * 6378137 * Math.cos(p1[1] * Math.PI / 180);
    const y1 = (p1[1] * Math.PI / 180) * 6378137;
    const x2 = (p2[0] * Math.PI / 180) * 6378137 * Math.cos(p2[1] * Math.PI / 180);
    const y2 = (p2[1] * Math.PI / 180) * 6378137;
    areaM2 += (x1 * y2 - x2 * y1);
  }
  
  areaM2 = Math.abs(areaM2) / 2;
  const acres = Number((areaM2 / 4046.86).toFixed(2));
  const cents = Number((areaM2 / 40.4686).toFixed(1));
  const sqm = Math.round(areaM2);
  return { acres, cents, sqm, perimeterMeters: Math.round(perimeter) };
}

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const initialPlotId = searchParams ? searchParams.get("plot") || searchParams.get("id") : null;
  const targetSurveyNo = searchParams ? searchParams.get("survey_no") : null;
  const targetPattaNo = searchParams ? searchParams.get("patta_no") : null;
  const targetVillage = searchParams ? searchParams.get("village") : null;
  const targetDistrict = searchParams ? searchParams.get("district") : null;
  const targetState = searchParams ? searchParams.get("state") : null;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const activePinMarkerRef = useRef<any>(null);
  const boundaryStoneMarkersRef = useRef<any[]>([]);
  const plotClusterMarkersRef = useRef<any[]>([]);

  const [allParcels, setAllParcels] = useState<CoimbatoreParcel[]>(MOCK_COIMBATORE_PARCELS);
  const [selectedTaluk, setSelectedTaluk] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [activeBasemap, setActiveBasemap] = useState("satellite");
  const [pitch, setPitch] = useState(50);
  const [bearing, setBearing] = useState(-20);
  const [zoom, setZoom] = useState(16.5);

  const [selectedParcel, setSelectedParcel] = useState<CoimbatoreParcel | null>(null);
  const [showEncroachment, setShowEncroachment] = useState(true);
  const [showNdvi, setShowNdvi] = useState(false);
  const [showSurveyMarkers, setShowSurveyMarkers] = useState(true);
  const [showBoundaryStones, setShowBoundaryStones] = useState(true);
  const [timeTravelYear, setTimeTravelYear] = useState<"1994" | "2026">("2026");

  // Measurement State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measureResult, setMeasureResult] = useState<string | null>(null);

  // Custom Land Demarcation / Marking State
  const [isMarkingLand, setIsMarkingLand] = useState(false);
  const [markedBoundaryPoints, setMarkedBoundaryPoints] = useState<[number, number][]>([]);
  const [markedMetrics, setMarkedMetrics] = useState<{ acres: number; cents: number; sqm: number; perimeterMeters: number } | null>(null);
  const [markedLandSaved, setMarkedLandSaved] = useState(false);

  // Collapsible Overlay Panels
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(true);
  const [isPlotDirectoryOpen, setIsPlotDirectoryOpen] = useState(false);

  // Subdivision Simulator State
  const [isSubdivisionActive, setIsSubdivisionActive] = useState(false);

  // Blockchain Modal State
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // 1. Fetch live plots from backend API and merge with Coimbatore datasets
  useEffect(() => {
    async function loadLivePlots() {
      try {
        const [resDb, res3d] = await Promise.all([
          fetch("http://127.0.0.1:8005/api/gis/plots?district=Coimbatore").catch(() => null),
          fetch("http://127.0.0.1:8005/api/gis/plots/3d").catch(() => null),
        ]);

        const dbParcels: CoimbatoreParcel[] = [];

        if (res3d && res3d.ok) {
          const data3d = await res3d.json();
          if (data3d.features && data3d.features.length > 0) {
            data3d.features.forEach((f: any, idx: number) => {
              const p = f.properties || {};
              const coords = f.geometry?.coordinates?.[0] || [];
              dbParcels.push({
                id: f.id || `3d-${idx}`,
                survey_no: p.survey_no || `${300 + idx}/1`,
                subdivision: p.subdivision || "1A",
                patta_no: p.patta_no || `${5000 + idx}`,
                owner_name: p.owner_name || "Statutory Land Owner",
                father_name: p.father_name || "Revenue Authority",
                co_owners: [],
                village: p.village || "Coimbatore",
                taluk: p.taluk || "Coimbatore North",
                district: p.district || "Coimbatore",
                state: p.state || "Tamil Nadu",
                village_lgd_code: p.village_lgd_code || "641001",
                land_type: "Ryotwari Patta Land (நன்செய்)",
                land_category: (p.land_category as any) || "Agriculture",
                soil_type: "Red Loam / செம்மண்",
                area_acres: p.area_acres || 2.5,
                area_cents: Math.round((p.area_acres || 2.5) * 100),
                area_sqm: Math.round((p.area_acres || 2.5) * 4046.86),
                guideline_value_sqft: 1950,
                market_value_inr: p.market_value_inr || 12000000,
                encumbrance_status: p.encumbrance_status || "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
                blockchain_hash: p.blockchain_hash || `0x3d${idx}a9f7e8b2c4d6`,
                polygon: coords.length > 0 ? coords : [[76.95, 11.01], [76.96, 11.01], [76.96, 11.02], [76.95, 11.02]],
                mutation_history: [],
                inheritance_tree: { root: { name: p.owner_name, relation: "Owner", generation: "Gen 1", children: [] } }
              });
            });
          }
        }

        if (resDb && resDb.ok) {
          const data = await resDb.json();
          if (data.features && data.features.length > 0) {
            data.features.forEach((f: any, idx: number) => {
              const p = f.properties || {};
              const coords = f.geometry?.coordinates?.[0] || [];
              dbParcels.push({
                id: f.id || `db-${idx}`,
                survey_no: p.survey_no || p.khasra_no || `${idx + 100}/1`,
                subdivision: p.sub_division_number || "1",
                patta_no: p.patta_no || `${4000 + idx}`,
                owner_name: p.owner_name || "Registered Land Owner",
                father_name: p.father_name || "Coimbatore Revenue Dept",
                co_owners: p.co_owners || [],
                village: p.village || "Coimbatore",
                taluk: p.taluk || "Coimbatore North",
                district: p.district || "Coimbatore",
                state: p.state || "Tamil Nadu",
                village_lgd_code: p.village_lgd_code || "641001",
                land_type: p.land_type || "Ryotwari Patta Land",
                land_category: (p.land_category as any) || "Agriculture",
                soil_type: p.soil_type || "Red Loam / செம்மண்",
                area_acres: p.area_acres || Number(((p.area_sqm || 4046) / 4046.86).toFixed(2)),
                area_cents: p.area_cents || Math.round((p.area_sqm || 4046) / 40.4686),
                area_sqm: p.area_sqm || 4046,
                guideline_value_sqft: p.guideline_value_sqft || 1850,
                market_value_inr: p.market_value_inr || 2500000,
                encumbrance_status: p.encumbrance_status || "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
                blockchain_hash: p.blockchain?.record_hash || `0x${idx}a9f7e8b2c4d6`,
                polygon: coords.length > 0 ? coords : [[76.95, 11.01], [76.96, 11.01], [76.96, 11.02], [76.95, 11.02]],
                mutation_history: p.mutation_history || [],
                inheritance_tree: p.inheritance_tree || { root: { name: p.owner_name, relation: "Owner", generation: "Gen 1", children: [] } }
              });
            });
          }
        }

        if (dbParcels.length > 0) {
          const existingSurveys = new Set(MOCK_COIMBATORE_PARCELS.map(p => p.survey_no));
          const newFromDb = dbParcels.filter(p => !existingSurveys.has(p.survey_no));
          setAllParcels([...MOCK_COIMBATORE_PARCELS, ...newFromDb]);
        }
      } catch (err) {
        console.warn("Backend GIS plots unavailable, using comprehensive mock set", err);
      }
    }
    loadLivePlots();
  }, []);

  // Filtered parcels list
  const filteredParcels = allParcels.filter(p => {
    const matchesTaluk = selectedTaluk === "All" || p.taluk.toLowerCase().includes(selectedTaluk.toLowerCase());
    const matchesCat = selectedCategory === "All" || p.land_category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesQuery = !searchQuery || 
      p.survey_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patta_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTaluk && matchesCat && matchesQuery;
  });

  // Initial target selection
  useEffect(() => {
    const matched = 
      allParcels.find(p => p.id === initialPlotId) ||
      allParcels.find(p => targetSurveyNo && p.survey_no.includes(targetSurveyNo)) ||
      allParcels.find(p => targetPattaNo && p.patta_no === targetPattaNo) ||
      allParcels[0];
    if (matched) {
      setSelectedParcel(matched);
    }
  }, [initialPlotId, targetSurveyNo, targetPattaNo, allParcels]);

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    let maplibregl: any;
    let map: any;

    import("maplibre-gl").then((mod) => {
      maplibregl = mod.default || mod;

      const initialTarget = selectedParcel || allParcels[0];
      const centerLng = initialTarget?.polygon?.[0]?.[0] || 76.9550;
      const centerLat = initialTarget?.polygon?.[0]?.[1] || 11.0500;

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
        maxPitch: 70,
        antialias: true
      });

      map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");

      map.on("load", () => {
        map.resize();

        // 1. Cadastral Parcels GeoJSON Source (All Plots)
        const features = allParcels.map((p, idx) => ({
          type: "Feature",
          id: p.id,
          properties: {
            id: p.id,
            survey_no: p.survey_no,
            patta_no: p.patta_no,
            owner_name: p.owner_name.split("/")[0].trim(),
            village: p.village,
            taluk: p.taluk,
            area_acres: p.area_acres,
            land_category: p.land_category,
            encumbrance_status: p.encumbrance_status,
            market_value_inr: p.market_value_inr,
            blockchain_hash: p.blockchain_hash,
            has_encroachment: (idx % 3 === 0),
            ndvi_score: 0.72 + ((idx % 7) * 0.035)
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
        const features1994 = allParcels.map(p => {
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

        // 3A. FLAT FILL POLYGON LAYER — primary always-visible plot marker (Bug 3 fix)
        // This renders flat coloured fills at ground level, visible at every pitch & zoom.
        map.addLayer({
          id: "parcels-flat-fill",
          type: "fill",
          source: "cadastral-parcels",
          layout: { visibility: "visible" },
          paint: {
            "fill-color": [
              "match",
              ["get", "land_category"],
              "Agriculture",  "rgba(16, 185, 129, 0.40)",
              "Commercial",   "rgba(245, 158, 11, 0.40)",
              "Industrial",   "rgba(139, 92, 246, 0.40)",
              "Residential",  "rgba(56, 189, 248, 0.40)",
              "rgba(6, 182, 212, 0.40)"
            ],
            "fill-outline-color": "#bef264"
          }
        });

        // 3B. Cadastral Boundary Line (Crisp Lime-Green #bef264 Mesh) — always visible
        map.addLayer({
          id: "parcels-outline",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#bef264",
            "line-width": 3.0,
            "line-opacity": 1.0
          }
        });

        // 4. Cadastral 3D Extrusion Layer — heights boosted for 3D visibility (Bug 2 fix)
        map.addLayer({
          id: "parcels-3d-extrusion",
          type: "fill-extrusion",
          source: "cadastral-parcels",
          layout: { visibility: "visible" },
          paint: {
            "fill-extrusion-color": [
              "match",
              ["get", "land_category"],
              "Agriculture", "#10b981",
              "Commercial",  "#f59e0b",
              "Industrial",  "#8b5cf6",
              "Residential", "#38bdf8",
              "#06b6d4"
            ],
            "fill-extrusion-height": [
              "match",
              ["get", "land_category"],
              "Commercial",  200,
              "Industrial",  150,
              "Residential", 120,
              80
            ],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.75
          }
        });

        // 5. NDVI Multi-Spectral 3D Crop Vigour Extrusion Layer
        map.addLayer({
          id: "parcels-3d-ndvi-extrusion",
          type: "fill-extrusion",
          source: "cadastral-parcels",
          layout: { visibility: "none" },
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "ndvi_score"],
              0.65, "#ef4444",
              0.75, "#eab308",
              0.82, "#22c55e",
              0.92, "#15803d"
            ],
            "fill-extrusion-height": 100,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.85
          }
        });

        // 6. 1994 Historical Ancestral 3D Ghost Extrusion Layer
        map.addLayer({
          id: "parcels-3d-1994-extrusion",
          type: "fill-extrusion",
          source: "historical-1994",
          layout: { visibility: "none" },
          paint: {
            "fill-extrusion-color": "#f59e0b",
            "fill-extrusion-height": 90,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.65
          }
        });

        // 7. Encroachment Alert 3D Hazard Extrusion Layer
        map.addLayer({
          id: "parcels-3d-encroachment-extrusion",
          type: "fill-extrusion",
          source: "cadastral-parcels",
          filter: ["==", "has_encroachment", true],
          layout: { visibility: "visible" },
          paint: {
            "fill-extrusion-color": "#ef4444",
            "fill-extrusion-height": 45,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.88
          }
        });

        // 8. Encroachment Alert Collision Line Layer (Neon Red)
        map.addLayer({
          id: "parcels-encroachment",
          type: "line",
          source: "cadastral-parcels",
          filter: ["==", "has_encroachment", true],
          layout: { visibility: "visible" },
          paint: {
            "line-color": "#ff0033",
            "line-width": 4
          }
        });

        // 9A. Selected Parcel Highlight Flat Fill (Neon Cyan — always visible)
        map.addLayer({
          id: "parcels-highlight-fill",
          type: "fill",
          source: "cadastral-parcels",
          paint: {
            "fill-color": "rgba(0, 255, 204, 0.55)",
            "fill-outline-color": "#00ffcc"
          },
          filter: ["==", "id", initialTarget?.id || ""]
        });

        // 9B. Selected Parcel Glowing Highlight 3D Extrusion (Neon Cyan)
        map.addLayer({
          id: "parcels-highlight-3d",
          type: "fill-extrusion",
          source: "cadastral-parcels",
          paint: {
            "fill-extrusion-color": "#00ffcc",
            "fill-extrusion-height": 280,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.90
          },
          filter: ["==", "id", initialTarget?.id || ""]
        });

        // 10. Selected Parcel Neon Cyan Perimeter Line
        map.addLayer({
          id: "parcels-highlight-line",
          type: "line",
          source: "cadastral-parcels",
          paint: {
            "line-color": "#00ffcc",
            "line-width": 5.0,
            "line-blur": 1.0
          },
          filter: ["==", "id", initialTarget?.id || ""]
        });

        // 11. Custom Marked Land Demarcation GeoJSON Source & 3D Layer
        map.addSource("custom-demarcation", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: []
          }
        });

        map.addLayer({
          id: "custom-demarcation-3d",
          type: "fill-extrusion",
          source: "custom-demarcation",
          paint: {
            "fill-extrusion-color": "#06b6d4",
            "fill-extrusion-height": 40,
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.88
          }
        });

        map.addLayer({
          id: "custom-demarcation-line",
          type: "line",
          source: "custom-demarcation",
          paint: {
            "line-color": "#22d3ee",
            "line-width": 5.5,
            "line-dasharray": [3, 1]
          }
        });

        // Unified Click Listener across all parcel layers (flat fill + 3D extrusion)
        const interactiveLayers = [
          "parcels-flat-fill",
          "parcels-3d-extrusion",
          "parcels-3d-ndvi-extrusion",
          "parcels-3d-encroachment-extrusion",
          "parcels-highlight-3d"
        ];
        interactiveLayers.forEach(lId => {
          map.on("click", lId, (e: any) => {
            if ((window as any).__measuring || (window as any).__markingLand) return;
            if (e.features && e.features[0]) {
              const featId = e.features[0].properties.id;
              // use the global ref so stale closure doesn't miss new parcels
              const allP = (window as any).__allParcels as CoimbatoreParcel[] || [];
              const found = allP.find((p: CoimbatoreParcel) => p.id === featId);
              if (found) {
                setSelectedParcel(found);
                map.setFilter("parcels-highlight-3d", ["==", "id", found.id]);
                map.setFilter("parcels-highlight-line", ["==", "id", found.id]);
                map.setFilter("parcels-highlight-fill", ["==", "id", found.id]);
              }
            }
          });
        });

        // Hover cursor on flat fill too
        map.on("mouseenter", "parcels-flat-fill", () => {
          if (!(window as any).__measuring && !(window as any).__markingLand)
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "parcels-flat-fill", () => {
          if (!(window as any).__measuring && !(window as any).__markingLand)
            map.getCanvas().style.cursor = "";
        });

        // Click Listener for Land Marking & Measurement on Terrain
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
          } else if ((window as any).__markingLand) {
            const pt: [number, number] = [e.lngLat.lng, e.lngLat.lat];
            setMarkedBoundaryPoints(prev => {
              const updated = [...prev, pt];
              if (updated.length >= 3) {
                const metrics = calculatePolygonAreaAcres(updated);
                setMarkedMetrics(metrics);
                const polyCoords = [...updated, updated[0]];
                const src = map.getSource("custom-demarcation");
                if (src) {
                  src.setData({
                    type: "FeatureCollection",
                    features: [{
                      type: "Feature",
                      geometry: { type: "Polygon", coordinates: [polyCoords] },
                      properties: {}
                    }]
                  });
                }
              }
              return updated;
            });
          }
        });

        map.on("mouseenter", "parcels-3d-extrusion", () => {
          if (!(window as any).__measuring && !(window as any).__markingLand) {
            map.getCanvas().style.cursor = "pointer";
          }
        });
        map.on("mouseleave", "parcels-3d-extrusion", () => {
          if (!(window as any).__measuring && !(window as any).__markingLand) {
            map.getCanvas().style.cursor = "";
          }
        });

        // Track camera orientation
        map.on("move", () => {
          setPitch(Math.round(map.getPitch()));
          setBearing(Math.round(map.getBearing()));
          setZoom(Number(map.getZoom().toFixed(1)));
        });

        if (initialTarget) {
          const [plng, plat] = initialTarget.polygon[0];
          map.jumpTo({
            center: [plng, plat],
            zoom: 16.5,
            pitch: 50,
            bearing: -20
          });
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // Bug 1 fix: initialize map ONCE, never destroy/re-create on data updates
  }, []);

  // Bug 4 fix: keep __allParcels window ref fresh for stale-closure-safe click handlers
  useEffect(() => {
    (window as any).__allParcels = allParcels;
  }, [allParcels]);

  // Bug 4 fix: push updated parcel data into the existing GeoJSON source WITHOUT re-creating the map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("cadastral-parcels") as any;
    if (!src) return;
    const features = allParcels.map((p, idx) => ({
      type: "Feature",
      id: p.id,
      properties: {
        id: p.id,
        survey_no: p.survey_no,
        patta_no: p.patta_no,
        owner_name: p.owner_name.split("/")[0].trim(),
        village: p.village,
        taluk: p.taluk,
        area_acres: p.area_acres,
        land_category: p.land_category,
        encumbrance_status: p.encumbrance_status,
        market_value_inr: p.market_value_inr,
        blockchain_hash: p.blockchain_hash,
        has_encroachment: (idx % 3 === 0),
        ndvi_score: 0.72 + ((idx % 7) * 0.035)
      },
      geometry: { type: "Polygon", coordinates: [p.polygon] }
    }));
    src.setData({ type: "FeatureCollection", features });

    // Also update 1994 historical source
    const src1994 = map.getSource("historical-1994") as any;
    if (src1994) {
      src1994.setData({
        type: "FeatureCollection",
        features: allParcels.map(p => ({
          type: "Feature",
          id: `1994-${p.id}`,
          properties: { id: p.id, survey_no: p.survey_no, year: "1994" },
          geometry: { type: "Polygon", coordinates: [p.polygon.map(([lng, lat]) => [lng - 0.0006, lat - 0.0004])] }
        }))
      });
    }
  }, [allParcels]);

  // ── Render 3D Floating Markers on ALL Plots Across Coimbatore ─────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    import("maplibre-gl").then(mod => {
      const maplibregl = mod.default || mod;

      // Clear previous plot cluster markers
      plotClusterMarkersRef.current.forEach(m => m.remove());
      plotClusterMarkersRef.current = [];

      if (!showSurveyMarkers) return;

      filteredParcels.forEach((parcel) => {
        const poly = parcel.polygon;
        if (!poly || poly.length === 0) return;

        let sumLng = 0; let sumLat = 0;
        poly.forEach(([lng, lat]) => { sumLng += lng; sumLat += lat; });
        const cLng = sumLng / poly.length;
        const cLat = sumLat / poly.length;

        const isSelected = selectedParcel?.id === parcel.id;
        const markerEl = document.createElement("div");
        markerEl.style.cursor = "pointer";
        markerEl.style.transform = "translateY(-8px)";
        markerEl.style.zIndex = isSelected ? "80" : "40";

        const catColor = 
          parcel.land_category === "Commercial" ? "#f59e0b" :
          parcel.land_category === "Industrial" ? "#8b5cf6" :
          parcel.land_category === "Residential" ? "#38bdf8" : "#10b981";

        markerEl.innerHTML = `
          <div style="
            background: ${isSelected ? 'linear-gradient(135deg, #1e3a8a, #0f172a)' : 'rgba(15, 23, 42, 0.88)'};
            border: ${isSelected ? '2px solid #facc15' : `1.5px solid ${catColor}`};
            color: #ffffff;
            padding: 3px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 4px 14px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            transition: all 0.15s ease;
          ">
            <span style="color: ${catColor}; font-size: 11px;">📍</span>
            <span>SF ${parcel.survey_no}</span>
            <span style="background: ${catColor}33; color: ${catColor}; padding: 1px 4px; border-radius: 3px; font-size: 8px;">${parcel.area_acres} Ac</span>
          </div>
        `;

        markerEl.addEventListener("click", (ev) => {
          ev.stopPropagation();
          setSelectedParcel(parcel);
          map.setFilter("parcels-highlight-3d", ["==", "id", parcel.id]);
          map.setFilter("parcels-highlight-line", ["==", "id", parcel.id]);
        });

        const marker = new maplibregl.Marker({ element: markerEl, anchor: "bottom" })
          .setLngLat([cLng, cLat])
          .addTo(map);

        plotClusterMarkersRef.current.push(marker);
      });
    });
  }, [filteredParcels, selectedParcel?.id, showSurveyMarkers]);

  // ── Render 3D Boundary Stone Corner Markers on Active Parcel Vertices ────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedParcel) return;

    import("maplibre-gl").then(mod => {
      const maplibregl = mod.default || mod;

      // Clear existing corner boundary stones
      boundaryStoneMarkersRef.current.forEach(m => m.remove());
      boundaryStoneMarkersRef.current = [];

      if (!showBoundaryStones) return;

      selectedParcel.polygon.forEach(([lng, lat], idx) => {
        const stoneEl = document.createElement("div");
        stoneEl.style.display = "flex";
        stoneEl.style.flexDirection = "column";
        stoneEl.style.alignItems = "center";
        stoneEl.style.pointerEvents = "none";
        stoneEl.innerHTML = `
          <div style="
            background: #ffffff;
            border: 2px solid #ef4444;
            color: #ef4444;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 900;
            box-shadow: 0 0 10px rgba(239,68,68,0.8), 0 2px 6px rgba(0,0,0,0.5);
          ">
            ${idx + 1}
          </div>
          <div style="
            width: 2px;
            height: 14px;
            background: linear-gradient(to bottom, #ef4444, transparent);
          "></div>
        `;

        const stoneMarker = new maplibregl.Marker({ element: stoneEl, anchor: "bottom" })
          .setLngLat([lng, lat])
          .addTo(map);

        boundaryStoneMarkersRef.current.push(stoneMarker);
      });
    });
  }, [selectedParcel, showBoundaryStones]);

  // Update basemap layers with instant visibility toggle
  const switchBasemap = (bmId: string) => {
    setActiveBasemap(bmId);
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (map.getLayer("layer-satellite")) {
        map.setLayoutProperty("layer-satellite", "visibility", bmId === "satellite" ? "visible" : "none");
      }
      if (map.getLayer("layer-osm")) {
        map.setLayoutProperty("layer-osm", "visibility", bmId === "osm" ? "visible" : "none");
      }
      if (map.getLayer("layer-topo")) {
        map.setLayoutProperty("layer-topo", "visibility", bmId === "topo" ? "visible" : "none");
      }
    } catch (e) {
      console.warn("Basemap switch exception", e);
    }
  };

  // Update NDVI layer visibility with prominent 3D color change
  const toggleNdvi = (val: boolean) => {
    setShowNdvi(val);
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (map.getLayer("parcels-3d-ndvi-extrusion")) {
        map.setLayoutProperty("parcels-3d-ndvi-extrusion", "visibility", val ? "visible" : "none");
      }
      if (map.getLayer("parcels-3d-extrusion")) {
        map.setLayoutProperty("parcels-3d-extrusion", "visibility", val ? "none" : "visible");
      }
    } catch (e) {
      console.warn("NDVI toggle exception", e);
    }
  };

  // Update Encroachment layer visibility with 3D hazard extrusion
  const toggleEncroachment = (val: boolean) => {
    setShowEncroachment(val);
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (map.getLayer("parcels-3d-encroachment-extrusion")) {
        map.setLayoutProperty("parcels-3d-encroachment-extrusion", "visibility", val ? "visible" : "none");
      }
      if (map.getLayer("parcels-encroachment")) {
        map.setLayoutProperty("parcels-encroachment", "visibility", val ? "visible" : "none");
      }
    } catch (e) {
      console.warn("Encroachment toggle exception", e);
    }
  };

  // Update Time-Travel baseline with 3D ancestral ghost blocks
  const switchTimeTravel = (year: "1994" | "2026") => {
    setTimeTravelYear(year);
    const map = mapInstanceRef.current;
    if (!map) return;
    try {
      if (map.getLayer("parcels-3d-1994-extrusion")) {
        map.setLayoutProperty("parcels-3d-1994-extrusion", "visibility", year === "1994" ? "visible" : "none");
      }
      if (map.getLayer("parcels-1994-outline")) {
        map.setLayoutProperty("parcels-1994-outline", "visibility", year === "1994" ? "visible" : "none");
      }
    } catch (e) {
      console.warn("Time travel toggle exception", e);
    }
  };

  // Update highlight, 3D pin marker, and fly-to when selectedParcel changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedParcel) return;
    try {
      if (map.getLayer("parcels-highlight-3d")) {
        map.setFilter("parcels-highlight-3d", ["==", "id", selectedParcel.id]);
      }
      if (map.getLayer("parcels-highlight-fill")) {
        map.setFilter("parcels-highlight-fill", ["==", "id", selectedParcel.id]);
      }
      if (map.getLayer("parcels-highlight-line")) {
        map.setFilter("parcels-highlight-line", ["==", "id", selectedParcel.id]);
      }

      // Compute centroid of parcel polygon
      const poly = selectedParcel.polygon;
      let sumLng = 0;
      let sumLat = 0;
      poly.forEach(([lng, lat]) => {
        sumLng += lng;
        sumLat += lat;
      });
      const centerLng = sumLng / poly.length;
      const centerLat = sumLat / poly.length;

      // Update / Create floating 3D Pin Marker
      import("maplibre-gl").then(mod => {
        const maplibregl = mod.default || mod;
        if (activePinMarkerRef.current) {
          activePinMarkerRef.current.remove();
          activePinMarkerRef.current = null;
        }

        const pinContainer = document.createElement("div");
        pinContainer.style.display = "flex";
        pinContainer.style.flexDirection = "column";
        pinContainer.style.alignItems = "center";
        pinContainer.style.cursor = "pointer";
        pinContainer.style.transform = "translateY(-14px)";
        pinContainer.style.zIndex = "100";
        pinContainer.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #0f172a, #1e3a8a);
            border: 2px solid #facc15;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 16px rgba(250,204,21,0.6);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="color:#facc15;font-size:14px;">📍</span>
            <span>SF.${selectedParcel.survey_no} • Patta #${selectedParcel.patta_no}</span>
            <span style="background:#0284c7;color:#fff;padding:2px 6px;border-radius:4px;font-size:9px;">${selectedParcel.area_acres} Ac</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 10px solid #facc15;
          "></div>
        `;

        activePinMarkerRef.current = new maplibregl.Marker({ element: pinContainer, anchor: "bottom" })
          .setLngLat([centerLng, centerLat])
          .addTo(map);
      });

      map.flyTo({
        center: [centerLng, centerLat],
        zoom: 17,
        pitch: pitch > 0 ? pitch : 55,
        bearing: bearing,
        speed: 1.2
      });
    } catch (e) {
      console.warn("Parcel flyTo exception", e);
    }
  }, [selectedParcel]);

  // Camera presets
  const setCameraPreset = (preset: "2d" | "3d" | "drone") => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (preset === "2d") {
      setPitch(0);
      setBearing(0);
      map.easeTo({ pitch: 0, bearing: 0, zoom: 16 });
    } else if (preset === "3d") {
      setPitch(50);
      setBearing(-20);
      map.easeTo({ pitch: 50, bearing: -20, zoom: 16.5 });
    } else if (preset === "drone") {
      setPitch(60);
      setBearing(45);
      map.easeTo({ pitch: 60, bearing: 45, zoom: 17 });
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleResetNorth = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.resetNorthPitch();
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
      setIsMarkingLand(false);
      (window as any).__markingLand = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.getCanvas().style.cursor = "crosshair";
      }
    }
  };

  // Toggle Land Demarcation & Boundary Marker Tool
  const toggleLandMarking = () => {
    const nextState = !isMarkingLand;
    setIsMarkingLand(nextState);
    (window as any).__markingLand = nextState;
    if (nextState) {
      setIsMeasuring(false);
      (window as any).__measuring = false;
      setMarkedLandSaved(false);
      if (mapInstanceRef.current) mapInstanceRef.current.getCanvas().style.cursor = "crosshair";
    } else {
      if (mapInstanceRef.current) mapInstanceRef.current.getCanvas().style.cursor = "";
    }
  };

  const clearMarkedLand = () => {
    setMarkedBoundaryPoints([]);
    setMarkedMetrics(null);
    setMarkedLandSaved(false);
    const map = mapInstanceRef.current;
    if (map && map.getSource("custom-demarcation")) {
      map.getSource("custom-demarcation").setData({
        type: "FeatureCollection",
        features: []
      });
    }
  };

  const snapToNearestParcel = () => {
    if (markedBoundaryPoints.length === 0) return;
    const [lastLng, lastLat] = markedBoundaryPoints[markedBoundaryPoints.length - 1];
    let bestParcel = allParcels[0];
    let minDistance = Infinity;
    allParcels.forEach(p => {
      const [plng, plat] = p.polygon[0];
      const d = calculateDistanceMeters([lastLng, lastLat], [plng, plat]);
      if (d < minDistance) {
        minDistance = d;
        bestParcel = p;
      }
    });
    if (bestParcel) {
      setSelectedParcel(bestParcel);
      clearMarkedLand();
      setIsMarkingLand(false);
      (window as any).__markingLand = false;
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
        {/* Title & Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/map"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#1e293b", border: "1px solid #334155", color: "#38bdf8",
              padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800,
              textDecoration: "none", transition: "all 0.15s"
            }}
          >
            <ArrowLeft size={14} />
            2D Map
          </Link>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: "linear-gradient(135deg, #134e4a, #0d9488)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(20, 184, 166, 0.4)"
          }}>
            <Eye size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 15, color: "#ffffff", letterSpacing: "-0.01em" }}>
              Terra_vault — 3D Cadastral Digital Twin
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>
              <strong>{filteredParcels.length}</strong> Plots Marked in 3D • Pitch <strong>{pitch}°</strong> • Bearing <strong>{bearing}°</strong>
            </div>
          </div>
        </div>

        {/* Directory & Taluk Selector Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsPlotDirectoryOpen(!isPlotDirectoryOpen)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: isPlotDirectoryOpen ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "#1e293b",
              color: "#ffffff", border: isPlotDirectoryOpen ? "1px solid #38bdf8" : "1px solid #334155",
              boxShadow: isPlotDirectoryOpen ? "0 0 12px rgba(14,165,233,0.4)" : "none"
            }}
          >
            <Filter size={13} />
            {isPlotDirectoryOpen ? "Close Directory" : `Browse All ${allParcels.length} Plots`}
          </button>

          {/* View Mode Preset Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "#1e293b", padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setCameraPreset("2d")}
              style={{
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                background: pitch === 0 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
                color: pitch === 0 ? "#ffffff" : "#94a3b8",
                border: "none"
              }}
            >
              2D Plan
            </button>
            <button
              onClick={() => setCameraPreset("3d")}
              style={{
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                background: pitch > 0 && pitch < 60 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
                color: pitch > 0 && pitch < 60 ? "#ffffff" : "#94a3b8",
                border: "none"
              }}
            >
              3D Extrusion
            </button>
            <button
              onClick={() => setCameraPreset("drone")}
              style={{
                padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                background: pitch >= 60 ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "transparent",
                color: pitch >= 60 ? "#ffffff" : "#94a3b8",
                border: "none"
              }}
            >
              Drone (60°)
            </button>
          </div>
        </div>

        {/* Basemap Switcher & Demarcation Tools */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {BASEMAPS.map(bm => {
            const Icon = bm.icon;
            const isSelected = activeBasemap === bm.id;
            return (
              <button
                key={bm.id}
                onClick={() => switchBasemap(bm.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
                  background: isSelected ? "linear-gradient(135deg, #0284c7, #0ea5e9)" : "#1e293b",
                  color: isSelected ? "#ffffff" : "#cbd5e1",
                  border: isSelected ? "1px solid #38bdf8" : "1px solid #334155"
                }}
              >
                <Icon size={12} />
                {bm.name.split(" ")[0]}
              </button>
            );
          })}

          {/* Interactive Mark Land / Demarcation Button */}
          <button
            onClick={toggleLandMarking}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: isMarkingLand ? "linear-gradient(135deg, #0891b2, #06b6d4)" : "#1e293b",
              color: "#ffffff",
              border: isMarkingLand ? "1px solid #22d3ee" : "1px solid #334155",
              boxShadow: isMarkingLand ? "0 0 14px rgba(6,182,212,0.6)" : "none"
            }}
          >
            <MapPin size={13} color={isMarkingLand ? "#ffffff" : "#38bdf8"} />
            {isMarkingLand ? "Marking Active" : "📍 Demarcate Plot"}
          </button>

          {/* Interactive Measurement Button */}
          <button
            onClick={toggleMeasurement}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 12px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer",
              background: isMeasuring ? "#dc2626" : "#1e293b",
              color: "#ffffff",
              border: isMeasuring ? "1px solid #ef4444" : "1px solid #334155"
            }}
          >
            <Ruler size={13} />
            {isMeasuring ? "Stop Measure" : "Measure"}
          </button>
        </div>
      </div>

      {/* ── Main Map Canvas & Overlays Container ─────────────────────────── */}
      <div style={{ display: "flex", flex: 1, position: "relative", overflow: "hidden" }}>
        {/* MapLibre Canvas */}
        <div ref={mapContainerRef} style={{ flex: 1, width: "100%", height: "100%" }} />

        {/* ── Left Plot Directory Drawer (Browse all 108+ Plots by Taluk) ──────── */}
        {isPlotDirectoryOpen && (
          <div style={{
            position: "absolute",
            top: 14,
            left: 14,
            bottom: 14,
            width: 320,
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(14px)",
            borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.16)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            zIndex: 30,
            overflow: "hidden"
          }}>
            {/* Header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#38bdf8" }}>
                Marked Coimbatore Plots ({filteredParcels.length})
              </div>
              <button onClick={() => setIsPlotDirectoryOpen(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>

            {/* Taluk Quick Dropdown */}
            <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: 8 }}>
              <select
                value={selectedTaluk}
                onChange={e => setSelectedTaluk(e.target.value)}
                style={{
                  background: "#0b1329", color: "#ffffff", border: "1px solid #334155",
                  borderRadius: 6, padding: "6px 8px", fontSize: 11, fontWeight: 800, width: "100%"
                }}
              >
                {COIMBATORE_TALUKS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>

              {/* Search Bar */}
              <div style={{ display: "flex", alignItems: "center", background: "#0b1329", border: "1px solid #334155", borderRadius: 6, padding: "4px 8px" }}>
                <Search size={13} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search SF No, Patta, Owner..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ background: "transparent", border: "none", color: "#fff", fontSize: 11, marginLeft: 6, outline: "none", width: "100%" }}
                />
              </div>
            </div>

            {/* Scrollable Plot Cards List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
              {filteredParcels.map(p => {
                const isSelected = selectedParcel?.id === p.id;
                const catColor = 
                  p.land_category === "Commercial" ? "#f59e0b" :
                  p.land_category === "Industrial" ? "#8b5cf6" :
                  p.land_category === "Residential" ? "#38bdf8" : "#10b981";

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedParcel(p);
                      setIsPlotDirectoryOpen(false);
                    }}
                    style={{
                      background: isSelected ? "linear-gradient(135deg, rgba(14,165,233,0.3), rgba(30,58,138,0.4))" : "rgba(30, 41, 59, 0.6)",
                      border: isSelected ? "1px solid #38bdf8" : "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 900, color: "#ffffff" }}>SF {p.survey_no}</span>
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${catColor}33`, color: catColor }}>
                        {p.area_acres} Acres
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{p.owner_name.split("/")[0].trim()}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>📍 {p.village} • {p.taluk}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating Measurement Banner — Docked Bottom Center */}
        {isMeasuring && (
          <div style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(12px)",
            border: "1px solid #38bdf8",
            padding: "10px 22px",
            borderRadius: 14,
            zIndex: 35,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            maxWidth: "92vw"
          }}>
            <Ruler size={16} color="#38bdf8" />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#ffffff" }}>
              {measureResult || "Click any two points on the 3D map to measure boundary distances"}
            </span>
            <button
              onClick={() => { setMeasurePoints([]); setMeasureResult(null); }}
              style={{ background: "#334155", border: "none", color: "#ffffff", fontSize: 10, padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontWeight: 800 }}
            >
              Reset
            </button>
          </div>
        )}

        {/* Floating Land Demarcation & Boundary Marker HUD Banner — Docked Bottom Center */}
        {isMarkingLand && (
          <div style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(14px)",
            border: "1px solid #22d3ee",
            padding: "10px 20px",
            borderRadius: 14,
            zIndex: 35,
            display: "flex",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 8px 36px rgba(6,182,212,0.45)",
            maxWidth: "92vw"
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #0891b2, #06b6d4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <MapPin size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#ffffff" }}>
                {markedMetrics ? (
                  <span>
                    Demarcated Land: <strong style={{ color: "#22d3ee" }}>{markedMetrics.acres} Acres</strong> ({markedMetrics.cents} Cents • {markedMetrics.sqm} m²)
                  </span>
                ) : (
                  <span>Click 3+ corner points on 3D terrain to demarcate custom parcel ({markedBoundaryPoints.length} points)</span>
                )}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Perimeter: {markedMetrics ? `${markedMetrics.perimeterMeters} meters (~${Math.round(markedMetrics.perimeterMeters * 3.28)} ft)` : "Pins connect automatically into 3D volumetric extrusion"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
              {markedBoundaryPoints.length >= 3 && (
                <>
                  <button
                    onClick={snapToNearestParcel}
                    style={{
                      background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
                      border: "none", color: "#ffffff", fontSize: 11, padding: "6px 12px",
                      borderRadius: 6, cursor: "pointer", fontWeight: 800,
                      boxShadow: "0 2px 10px rgba(14,165,233,0.3)",
                      whiteSpace: "nowrap"
                    }}
                  >
                    ✨ Snap to FMB
                  </button>
                  <button
                    onClick={() => setMarkedLandSaved(true)}
                    style={{
                      background: markedLandSaved ? "#16a34a" : "#1e3a8a",
                      border: "1px solid #38bdf8", color: "#ffffff", fontSize: 11, padding: "6px 12px",
                      borderRadius: 6, cursor: "pointer", fontWeight: 800,
                      whiteSpace: "nowrap"
                    }}
                  >
                    {markedLandSaved ? "✓ Anchored" : "💾 Anchor to DB"}
                  </button>
                </>
              )}
              <button
                onClick={clearMarkedLand}
                style={{
                  background: "#334155", border: "none", color: "#ffffff", fontSize: 11,
                  padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 800
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Floating Left Layer & Analysis Toggles (Collapsible) */}
        {isLeftPanelOpen ? (
          <div style={{
            position: "absolute",
            top: 14,
            left: isPlotDirectoryOpen ? 346 : 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            zIndex: 10,
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(10px)",
            padding: 14,
            borderRadius: 12,
            border: "1px solid rgba(255, 255, 255, 0.14)",
            width: 260,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            transition: "left 0.2s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                3D Markers & Vision
              </div>
              <button
                onClick={() => setIsLeftPanelOpen(false)}
                title="Minimize AI Panel"
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Toggle 3D Floating Labels */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer", fontWeight: 800 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#38bdf8" }}>
                <MapPin size={15} color="#38bdf8" />
                3D Plot Pin Labels
              </span>
              <input
                type="checkbox"
                checked={showSurveyMarkers}
                onChange={e => setShowSurveyMarkers(e.target.checked)}
                style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#38bdf8" }}
              />
            </label>

            {/* Toggle 3D Boundary Stone Markers */}
            <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12, cursor: "pointer", fontWeight: 800 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#f87171" }}>
                <Mountain size={15} color="#ef4444" />
                FMB Boundary Pillars
              </span>
              <input
                type="checkbox"
                checked={showBoundaryStones}
                onChange={e => setShowBoundaryStones(e.target.checked)}
                style={{ cursor: "pointer", width: 17, height: 17, accentColor: "#ef4444" }}
              />
            </label>

            {/* Toggle Encroachment */}
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

            {/* Toggle NDVI */}
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
        ) : (
          <button
            onClick={() => setIsLeftPanelOpen(true)}
            style={{
              position: "absolute",
              top: 14,
              left: isPlotDirectoryOpen ? 346 : 14,
              zIndex: 10,
              background: "rgba(15, 23, 42, 0.94)",
              backdropFilter: "blur(10px)",
              border: "1px solid #38bdf8",
              color: "#38bdf8",
              padding: "7px 14px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
            }}
          >
            <Sparkles size={13} />
            3D Layers
          </button>
        )}

        {/* Floating Map Zoom & Compass Controls */}
        <div style={{
          position: "absolute",
          top: 14,
          right: (isRightDrawerOpen && selectedParcel) ? 385 : 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          zIndex: 15,
          transition: "right 0.2s"
        }}>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: 36, height: 36, borderRadius: 8, background: "#0f172a", border: "1px solid #334155",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: 36, height: 36, borderRadius: 8, background: "#0f172a", border: "1px solid #334155",
              color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleResetNorth}
            title="Reset North Compass"
            style={{
              width: 36, height: 36, borderRadius: 8, background: "#0f172a", border: "1px solid #334155",
              color: "#38bdf8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <Compass size={18} />
          </button>
        </div>

        {/* Right Inspection Property Drawer with Scrollable Body (Collapsible) */}
        {selectedParcel && (
          isRightDrawerOpen ? (
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
                      Marked 3D Cadastral Plot
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#ffffff" }}>
                      SF {selectedParcel.survey_no} • Patta #{selectedParcel.patta_no}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 900,
                      background: selectedParcel.land_category === "Agriculture" ? "#064e3b" : "#78350f",
                      color: selectedParcel.land_category === "Agriculture" ? "#4ade80" : "#fbbf24",
                      border: "1px solid rgba(255, 255, 255, 0.15)"
                    }}>
                      {selectedParcel.land_category}
                    </span>
                    <button
                      onClick={() => setIsRightDrawerOpen(false)}
                      title="Minimize Drawer"
                      style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 2 }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Quick Jump Selector Dropdown across all Coimbatore plots */}
                <select
                  value={selectedParcel.id}
                  onChange={e => {
                    const target = allParcels.find(p => p.id === e.target.value);
                    if (target) setSelectedParcel(target);
                  }}
                  style={{
                    background: "#0b1329", color: "#ffffff", border: "1px solid #334155",
                    borderRadius: 6, padding: "6px 10px", fontSize: 11, fontWeight: 800, cursor: "pointer", width: "100%"
                  }}
                >
                  {filteredParcels.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.taluk}] SF {p.survey_no} — {p.owner_name.split("/")[0].trim()} ({p.area_acres} Ac)
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

                {/* 3D Corner Boundary Stones Count */}
                <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 10, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>FMB Corner Pillars</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#ef4444" }}>{selectedParcel.polygon.length} Boundary Stones Plotted</div>
                  </div>
                  <span style={{ fontSize: 10, background: "rgba(239,68,68,0.2)", color: "#f87171", padding: "3px 8px", borderRadius: 4, fontWeight: 800 }}>
                    GPS Anchored
                  </span>
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

                {/* Interactive Subdivision Simulator */}
                <div style={{ background: "rgba(30, 41, 59, 0.7)", padding: 12, borderRadius: 10, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", display: "flex", alignItems: "center", gap: 5 }}>
                      <Scissors size={14} /> Sub-Division Simulator (உட்பிரிவு)
                    </span>
                    <button
                      onClick={() => setIsSubdivisionActive(!isSubdivisionActive)}
                      style={{
                        background: isSubdivisionActive ? "#f59e0b" : "#334155",
                        border: "none", color: isSubdivisionActive ? "#000" : "#fff",
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, cursor: "pointer"
                      }}
                    >
                      {isSubdivisionActive ? "Active" : "Simulate"}
                    </button>
                  </div>
                  {isSubdivisionActive ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8, fontSize: 11 }}>
                      <div style={{ padding: "6px 8px", background: "#064e3b", borderRadius: 6, border: "1px solid #059669" }}>
                        <strong>SF {selectedParcel.survey_no}/1:</strong> {(selectedParcel.area_acres * 0.58).toFixed(2)} Acres ({Math.round(selectedParcel.area_cents * 0.58)} Cents) • 58% Share
                      </div>
                      <div style={{ padding: "6px 8px", background: "#78350f", borderRadius: 6, border: "1px solid #d97706" }}>
                        <strong>SF {selectedParcel.survey_no}/2:</strong> {(selectedParcel.area_acres * 0.42).toFixed(2)} Acres ({Math.round(selectedParcel.area_cents * 0.42)} Cents) • 42% Share
                      </div>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>
                        FMB Demarcation Order: SD/2026/0418 • GPS Points Recorded
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: "#94a3b8" }}>
                      Click Simulate to generate instant mathematical co-parcenary sub-divisions and FMB boundaries.
                    </div>
                  )}
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
          ) : (
            <button
              onClick={() => setIsRightDrawerOpen(true)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                zIndex: 10,
                background: "rgba(15, 23, 42, 0.94)",
                backdropFilter: "blur(10px)",
                border: "1px solid #facc15",
                color: "#facc15",
                padding: "7px 14px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}
            >
              <Info size={13} />
              SF.{selectedParcel.survey_no} Details
            </button>
          ))}
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
                  SF {selectedParcel.survey_no} • Patta #{selectedParcel.patta_no} • {selectedParcel.village}
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
    <Suspense fallback={<div style={{ padding: 30, color: "#ffffff" }}>Loading 3D Digital Twin...</div>}>
      <DigitalTwinContent />
    </Suspense>
  );
}
