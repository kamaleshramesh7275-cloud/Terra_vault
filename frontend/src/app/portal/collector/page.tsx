"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Building2, Lock, Check, User, Layers, ArrowRight, ShieldAlert, BarChart3, Activity
} from "lucide-react";
import Link from "next/link";

export default function CollectorPortalPage() {
  const [activeTab, setActiveTab] = useState<"metrics" | "fraud" | "poramboke">("metrics");
  const [overrideFlags, setOverrideFlags] = useState<string[]>([]);

  const FRAUD_ALERTS = [
    { id: "ALERT-COL-901", survey: "SF.512/B", village: "Kinathukadavu Town", type: "RAPID_FLIP_PATTERN", detail: "3 Title transfers within 14 days • Suspicious valuation delta", risk: "CRITICAL" },
    { id: "ALERT-COL-902", survey: "SF.33/1A", village: "Kothavadi", type: "PORAMBOKE_ENCROACHMENT", detail: "Construction detected inside Waterbody Poramboke boundary", risk: "HIGH" },
  ];

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: 24, borderLeft: "4px solid #dc2626", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Building2 size={22} color="#dc2626" />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                District Collector Command Center (மாவட்ட ஆட்சியர் தளம்)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6, margin: 0 }}>
              Apex District Revenue Oversight, Emergency Fraud Freeze & DILRMP Progress Monitor
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, color: "#dc2626", fontWeight: 700 }}>
              District: Coimbatore (Coimbatore Revenue Administration)
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Divisions: 3 • Taluks: 11 • Revenue Villages: 295
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { id: "metrics", label: "District DILRMP 2.0 Digitization Metrics", icon: BarChart3 },
          { id: "fraud", label: "Emergency Fraud Overrides (2 Alerts)", icon: ShieldAlert },
          { id: "poramboke", label: "Govt Poramboke Land Assignment Desk", icon: Layers },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "metrics" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Activity size={18} color="#16a34a" /> Coimbatore District DILRMP 2.0 Real-Time Digitization
          </h3>
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div style={{ padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#16a34a" }}>96.4%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942" }}>Digitization Index</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>Rank #1 in Tamil Nadu</div>
            </div>
            <div style={{ padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#1e3a8a" }}>2,760</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942" }}>Kinathukadavu Parcels</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>35 / 35 Villages Sealed</div>
            </div>
            <div style={{ padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0284c7" }}>100%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942" }}>Polygon Anchors</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>Polygon Testnet Active</div>
            </div>
            <div style={{ padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706" }}>0.00%</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942" }}>Boundary Gap Rate</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>Full Coverage Validated</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "fraud" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FRAUD_ALERTS.map((alertItem) => {
            const isOverridden = overrideFlags.includes(alertItem.id);
            return (
              <div key={alertItem.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 4, color: "#dc2626" }}>
                        {alertItem.id}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f2942" }}>
                        {alertItem.survey} — {alertItem.village}
                      </h3>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6 }}>
                      <span>Type: {alertItem.type} • </span>
                      <span>Details: {alertItem.detail}</span>
                    </div>
                  </div>

                  <div>
                    {isOverridden ? (
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> District Collector Emergency Override Applied
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "8px 16px", background: "#dc2626" }}
                        onClick={() => {
                          setOverrideFlags([...overrideFlags, alertItem.id]);
                          alert(`Collector Emergency Freeze override applied to ${alertItem.survey}! Transaction locked across state database.`);
                        }}
                      >
                        Apply Emergency Collector Override
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "poramboke" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Government Poramboke & Anadheena Land Assignment Registry
          </h3>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Manages statutory assignment of Government Public Poramboke land for public infrastructure.
          </p>
        </div>
      )}
    </div>
  );
}
