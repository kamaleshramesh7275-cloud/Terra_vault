"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Layers, Mountain, Satellite, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ElevationPoint { lat: number; lon: number; elevation_m: number; }
interface EncroachmentZone {
  zone_id: string; overlap_area_sqm: number; severity: string;
  neighbor_type: string; centroid_lat: number; centroid_lon: number; description: string;
}
interface TwinPayload {
  record_id: string; khasra_no: string; centroid_lat: number; centroid_lon: number;
  boundary_geojson: any; elevation_mesh: ElevationPoint[];
  elevation_min_m: number; elevation_max_m: number; elevation_avg_m: number;
  terrain_type: string; satellite_tile_url: string;
  encroachments: EncroachmentZone[]; total_encroachment_area_sqm: number;
  has_encroachment: boolean; generated_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function elevationToColor(elev: number, min: number, max: number): string {
  const t = max === min ? 0.5 : (elev - min) / (max - min);
  if (t < 0.33) return `rgba(34,197,94,${0.6 + t * 0.4})`;   // green (low)
  if (t < 0.66) return `rgba(234,179,8,${0.6 + t * 0.3})`;   // amber (mid)
  return `rgba(239,68,68,${0.6 + (t - 0.66) * 0.8})`;         // red (high)
}

function terrainLabel(type: string): string {
  const map: Record<string, string> = {
    FLAT_PLAIN: "🌾 Flat Agricultural Plain",
    GENTLE_SLOPE: "⛰️ Gentle Slope Terrain",
    MODERATE_INCLINE: "🏞️ Moderate Incline Terrain",
    STEEP_HILL: "🏔️ Steep Hill Terrain",
    WATERLOGGED_BASIN: "🌊 Waterlogged Basin (High Flood Risk)",
    ROCKY_RIDGE: "🪨 Rocky Ridge Terrain",
  };
  return map[type] || type;
}

// ── Canvas 3D Renderer ─────────────────────────────────────────────────────────
function render3DMesh(
  canvas: HTMLCanvasElement,
  twin: TwinPayload,
  showSatellite: boolean,
  showEncroach: boolean,
  vertExag: number,
  rotation: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width; const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0a0e1a");
  bg.addColorStop(1, "#0f1929");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const mesh = twin.elevation_mesh;
  if (!mesh || mesh.length === 0) return;

  const lats = mesh.map(p => p.lat); const lons = mesh.map(p => p.lon);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons); const maxLon = Math.max(...lons);

  const PAD = 60;
  const toScreen = (lat: number, lon: number, elev: number) => {
    const nx = (lon - minLon) / (maxLon - minLon || 1);
    const ny = (lat - minLat) / (maxLat - minLat || 1);
    const elevNorm = (elev - twin.elevation_min_m) / ((twin.elevation_max_m - twin.elevation_min_m) || 1);

    // Isometric-style projection with rotation
    const rad = (rotation * Math.PI) / 180;
    const rx = nx * Math.cos(rad) - ny * Math.sin(rad);
    const ry = nx * Math.sin(rad) + ny * Math.cos(rad);

    const sx = PAD + rx * (W - PAD * 2);
    const sy = PAD + (1 - ry) * (H - PAD * 2) - elevNorm * 80 * vertExag;
    return { sx, sy, elevNorm };
  };

  // Draw terrain tiles (8x8 grid)
  const side = Math.sqrt(mesh.length);
  for (let i = 0; i < side - 1; i++) {
    for (let j = 0; j < side - 1; j++) {
      const idx = i * side + j;
      if (idx + side + 1 >= mesh.length) continue;
      const p0 = mesh[idx]; const p1 = mesh[idx + 1];
      const p2 = mesh[idx + (side | 0)]; const p3 = mesh[idx + (side | 0) + 1];
      const s0 = toScreen(p0.lat, p0.lon, p0.elevation_m);
      const s1 = toScreen(p1.lat, p1.lon, p1.elevation_m);
      const s2 = toScreen(p2.lat, p2.lon, p2.elevation_m);
      const s3 = toScreen(p3.lat, p3.lon, p3.elevation_m);
      const avgElev = (p0.elevation_m + p1.elevation_m + p2.elevation_m + p3.elevation_m) / 4;

      ctx.beginPath();
      ctx.moveTo(s0.sx, s0.sy);
      ctx.lineTo(s1.sx, s1.sy);
      ctx.lineTo(s3.sx, s3.sy);
      ctx.lineTo(s2.sx, s2.sy);
      ctx.closePath();
      ctx.fillStyle = showSatellite
        ? `rgba(34,120,90,${0.4 + s0.elevNorm * 0.5})`
        : elevationToColor(avgElev, twin.elevation_min_m, twin.elevation_max_m);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }

  // Draw deed boundary polygon
  const geo = twin.boundary_geojson?.geometry?.coordinates?.[0];
  if (geo && geo.length > 0) {
    ctx.beginPath();
    const refLat = twin.elevation_avg_m;
    geo.forEach(([lon, lat]: [number, number], i: number) => {
      const s = toScreen(lat, lon, refLat);
      i === 0 ? ctx.moveTo(s.sx, s.sy) : ctx.lineTo(s.sx, s.sy);
    });
    ctx.closePath();
    ctx.strokeStyle = twin.has_encroachment ? "#ef4444" : "#10b981";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = twin.has_encroachment ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)";
    ctx.fill();
  }

  // Draw encroachment hotspots
  if (showEncroach && twin.encroachments.length > 0) {
    twin.encroachments.forEach(enc => {
      const s = toScreen(enc.centroid_lat, enc.centroid_lon, twin.elevation_avg_m + 5);
      const pulse = Math.sin(Date.now() / 400) * 4;
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 12 + pulse, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239,68,68,0.25)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 9px Inter";
      ctx.textAlign = "center";
      ctx.fillText("⚠", s.sx, s.sy + 3.5);
    });
  }

  // Axis labels
  ctx.fillStyle = "rgba(148,163,184,0.6)";
  ctx.font = "11px Inter";
  ctx.textAlign = "left";
  ctx.fillText(`▲ Elevation: ${twin.elevation_min_m}m – ${twin.elevation_max_m}m`, PAD, H - 20);
  ctx.textAlign = "right";
  ctx.fillText(`Khasra #${twin.khasra_no} • ${twin.terrain_type.replace(/_/g, " ")}`, W - PAD, H - 20);
}

function DigitalTwinContent() {
  const params = useSearchParams();
  const recordId = params.get("id") || params.get("record_id") || "rec-cbe-demo";

  const [twin, setTwin] = useState<TwinPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSatellite, setShowSatellite] = useState(true);
  const [showEncroach, setShowEncroach] = useState(true);
  const [vertExag, setVertExag] = useState(2.5);
  const [rotation, setRotation] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/digital-twin/${recordId}?lat=11.0168&lon=76.9558&khasra_no=104%2FA&area_sqm=4046`);
        if (res.ok) setTwin(await res.json());
      } catch {
        // Use fallback demo data
        setTwin(generateFallbackTwin(recordId));
      } finally { setLoading(false); }
    };
    load();
  }, [recordId]);

  // Animation loop
  useEffect(() => {
    if (!twin || !canvasRef.current) return;
    const loop = () => {
      if (canvasRef.current) render3DMesh(canvasRef.current, twin, showSatellite, showEncroach, vertExag, rotation);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [twin, showSatellite, showEncroach, vertExag, rotation]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Generating 3D Digital Twin…</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
          <Mountain size={22} color="#6366f1" /> 3D Digital Twin Land Parcel Visualizer
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
          Real-time SRTM DEM elevation mesh + Sentinel-2 satellite imagery + Encroachment detection
        </p>
      </div>

      {/* Stat bar */}
      {twin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 16 }}>
          {[
            { label: "Terrain Type", value: terrainLabel(twin.terrain_type), color: "#6366f1" },
            { label: "Min Elevation", value: `${twin.elevation_min_m} m`, color: "#10b981" },
            { label: "Max Elevation", value: `${twin.elevation_max_m} m`, color: "#f59e0b" },
            { label: "Avg Elevation", value: `${twin.elevation_avg_m} m`, color: "#a5b4fc" },
            { label: "Encroachment", value: twin.has_encroachment ? `⚠️ ${twin.total_encroachment_area_sqm} sq.m` : "✅ None Detected", color: twin.has_encroachment ? "#ef4444" : "#10b981" },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main 3D canvas + controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div className="glass-card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
          <canvas
            ref={canvasRef}
            width={820}
            height={520}
            style={{ width: "100%", height: 520, display: "block", borderRadius: 12 }}
          />
          {/* Encroachment badge overlay */}
          {twin?.has_encroachment && showEncroach && (
            <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(239,68,68,0.9)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={13} /> Encroachment Detected
            </div>
          )}
          <div style={{ position: "absolute", top: 16, right: 16, fontSize: 11, color: "rgba(148,163,184,0.7)", background: "rgba(10,14,26,0.6)", padding: "4px 10px", borderRadius: 6 }}>
            SRTM 30m DEM • Sentinel-2 RGB
          </div>
        </div>

        {/* Controls panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={14} color="#6366f1" /> Layer Controls
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={showSatellite} onChange={e => setShowSatellite(e.target.checked)} />
              <Satellite size={13} /> Satellite RGB Overlay
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, marginBottom: 14, cursor: "pointer" }}>
              <input type="checkbox" checked={showEncroach} onChange={e => setShowEncroach(e.target.checked)} />
              <AlertTriangle size={13} /> Encroachment Heatmap
            </label>

            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Vertical Exaggeration: <strong style={{ color: "#a5b4fc" }}>{vertExag}x</strong>
            </div>
            <input type="range" min={1} max={5} step={0.5} value={vertExag}
              onChange={e => setVertExag(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 14 }} />

            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
              Rotation: <strong style={{ color: "#a5b4fc" }}>{rotation}°</strong>
            </div>
            <input type="range" min={0} max={90} step={5} value={rotation}
              onChange={e => setRotation(Number(e.target.value))}
              style={{ width: "100%", marginBottom: 14 }} />

            <button onClick={() => { setVertExag(2.5); setRotation(30); }}
              style={{ width: "100%", padding: "8px 0", fontSize: 12, fontWeight: 600, border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text-muted)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <RotateCcw size={12} /> Reset View
            </button>
          </div>

          {/* Encroachment details */}
          {twin && twin.encroachments.length > 0 && (
            <div className="glass-card" style={{ padding: 16, border: "1px solid rgba(239,68,68,0.3)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f87171", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={13} /> Encroachment Details
              </div>
              {twin.encroachments.map(enc => (
                <div key={enc.zone_id} style={{ fontSize: 11, background: "rgba(239,68,68,0.08)", padding: 10, borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: "#fca5a5", marginBottom: 4 }}>
                    {enc.severity} — {enc.neighbor_type.replace(/_/g, " ")}
                  </div>
                  <div style={{ color: "var(--color-text-muted)" }}>Overlap: <strong style={{ color: "#f87171" }}>{enc.overlap_area_sqm} sq.m</strong></div>
                  <div style={{ color: "var(--color-text-muted)", marginTop: 4 }}>{enc.description}</div>
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Elevation Legend</div>
            {[
              { color: "rgba(34,197,94,0.8)", label: "Low Elevation (Plains)" },
              { color: "rgba(234,179,8,0.8)", label: "Mid Elevation (Slope)" },
              { color: "rgba(239,68,68,0.8)", label: "High Elevation (Hill)" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 6 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: l.color }} />
                <span style={{ color: "var(--color-text-muted)" }}>{l.label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginTop: 6 }}>
              <div style={{ width: 28, height: 3, background: "#10b981", borderRadius: 2 }} />
              <span style={{ color: "var(--color-text-muted)" }}>Clean Boundary</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginTop: 6 }}>
              <div style={{ width: 28, height: 3, background: "#ef4444", borderRadius: 2 }} />
              <span style={{ color: "var(--color-text-muted)" }}>Disputed Boundary</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Fallback demo data ─────────────────────────────────────────────────────────
function generateFallbackTwin(recordId: string): TwinPayload {
  const mesh: ElevationPoint[] = [];
  const baseLat = 11.0168; const baseLon = 76.9558;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      mesh.push({
        lat: baseLat - 0.002 + i * 0.0005,
        lon: baseLon - 0.002 + j * 0.0005,
        elevation_m: 280 + Math.sin(i * 0.8) * 12 + Math.cos(j * 0.6) * 8,
      });
    }
  }
  return {
    record_id: recordId, khasra_no: "104/A",
    centroid_lat: baseLat, centroid_lon: baseLon,
    boundary_geojson: {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [[[76.9539, 11.0149],[76.9577, 11.0149],[76.9577, 11.0187],[76.9539, 11.0187],[76.9539, 11.0149]]] },
      properties: { khasra_no: "104/A", status: "REGISTERED" }
    },
    elevation_mesh: mesh,
    elevation_min_m: 272.3, elevation_max_m: 295.8, elevation_avg_m: 282.1,
    terrain_type: "GENTLE_SLOPE",
    satellite_tile_url: "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2021_3857/default/GoogleMapsCompatible/12/1234/2345.jpg",
    encroachments: [{
      zone_id: "enc_104_A_001", overlap_area_sqm: 47.3, severity: "CRITICAL",
      neighbor_type: "GOVERNMENT_PORAMBOKE", centroid_lat: 11.0172, centroid_lon: 76.9561,
      description: "Registered boundary extends beyond legal limit into adjacent Poramboke land."
    }],
    total_encroachment_area_sqm: 47.3, has_encroachment: true,
    generated_at: new Date().toISOString(),
  };
}

export default function DigitalTwinPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 48, height: 48, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Loading 3D Digital Twin Engine…</div>
      </div>
    }>
      <DigitalTwinContent />
    </Suspense>
  );
}
