"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  plotsData: any;
  selectedPlotId?: string | null;
  onPlotClick: (plotProps: any) => void;
  center?: [number, number];
  zoom?: number;
}

function getCategoryColor(category?: string, landType?: string) {
  const cat = (category || landType || "").toLowerCase();
  if (cat.includes("commercial") || cat.includes("it sez") || cat.includes("வணிக")) return "#f59e0b"; // Amber
  if (cat.includes("residential") || cat.includes("மனை") || cat.includes("layout")) return "#38bdf8"; // Sky Blue
  if (cat.includes("industrial") || cat.includes("தொழில்") || cat.includes("mining")) return "#a78bfa"; // Violet
  if (cat.includes("wet") || cat.includes("நன்செய்") || cat.includes("river")) return "#059669"; // Deep Emerald
  return "#10b981"; // Vibrant Emerald (Agriculture/Coconut/தோட்டம்)
}

export default function LeafletMap({
  plotsData,
  selectedPlotId,
  onPlotClick,
  center = [11.0168, 76.9558], // Coimbatore center
  zoom = 10,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("leaflet-map", {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap, © CARTO | Terra_vault Coimbatore Cadastral GIS",
          maxZoom: 19,
        }
      ).addTo(map);

      mapRef.current = map;
    }

    const map = mapRef.current;
    if (!map) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    if (plotsData?.features?.length) {
      const layer = L.geoJSON(plotsData, {
        style: (feature) => {
          const p = feature?.properties;
          const isSelected = p?.id === selectedPlotId || p?.survey_no === selectedPlotId;
          const baseColor = getCategoryColor(p?.land_category, p?.land_type);
          return {
            fillColor: isSelected ? "#38bdf8" : baseColor,
            fillOpacity: isSelected ? 0.85 : 0.45,
            color: isSelected ? "#ffffff" : baseColor,
            weight: isSelected ? 3 : 1.5,
            dashArray: isSelected ? "" : "2, 4",
          };
        },
        onEachFeature: (feature, layerItem) => {
          const p = feature.properties;
          
          // Tooltip on hover
          layerItem.bindTooltip(
            `<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;padding:2px 4px;">
              📌 SF No. ${p.survey_no} (${p.district})<br/>
              <span style="font-size:11px;font-weight:normal;color:#94a3b8;">${p.owner_name?.split('/')[0] || ''}</span>
            </div>`,
            { permanent: false, direction: "top", className: "cadastral-tooltip" }
          );

          // Popup on click
          layerItem.bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:220px;color:#0f172a;line-height:1.4;">
              <div style="font-weight:700;font-size:14px;color:#0369a1;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">
                புல எண்: ${p.survey_no} (Patta: ${p.patta_no})
              </div>
              <div style="font-size:12px;margin-bottom:3px;"><strong>உரிமையாளர்:</strong> ${p.owner_name}</div>
              <div style="font-size:12px;margin-bottom:3px;"><strong>மாவட்டம்:</strong> ${p.district} (${p.taluk})</div>
              <div style="font-size:12px;margin-bottom:3px;"><strong>பரப்பளவு:</strong> ${p.area_acres || '—'} ஏக்கர் (${p.area_cents || '—'} சென்ட்)</div>
              <div style="font-size:12px;margin-bottom:6px;"><strong>வகைப்பாடு:</strong> ${p.land_type}</div>
              <div style="font-size:11px;background:#ecfdf5;color:#047857;padding:3px 6px;border-radius:4px;font-weight:600;display:inline-block;">
                🛡️ Polygon Amoy Verified
              </div>
            </div>
          `);

          layerItem.on("click", (e) => {
            L.DomEvent.stopPropagation(e);
            onPlotClick(p);
          });

          layerItem.on("mouseover", () => {
            (layerItem as L.Path).setStyle({ fillOpacity: 0.8, weight: 3 });
          });

          layerItem.on("mouseout", () => {
            const isSelected = p.id === selectedPlotId || p.survey_no === selectedPlotId;
            (layerItem as L.Path).setStyle({
              fillOpacity: isSelected ? 0.75 : 0.45,
              weight: isSelected ? 3 : 1.5
            });
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = layer;

      // Fit bounds if plots exist
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
      } catch (err) {
        console.error("Bounds error", err);
      }
    }
  }, [plotsData, selectedPlotId]);

  return (
    <div
      id="leaflet-map"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 14,
        position: "relative",
        zIndex: 1,
      }}
    />
  );
}
