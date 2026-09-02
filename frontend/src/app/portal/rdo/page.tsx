"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Scale, Lock, Check, User, Layers, ArrowRight, Gavel, AlertOctagon
} from "lucide-react";
import Link from "next/link";

export default function RDOPortalPage() {
  const [activeTab, setActiveTab] = useState<"appeals" | "stay" | "resurvey">("appeals");
  const [issuedStays, setIssuedStays] = useState<string[]>([]);

  const APPEALS = [
    { id: "APPEAL-RDO-801", survey: "SF.112/4B", appellant: "Subramaniam S / சுப்பிரமணியம் எஸ்", village: "Kothavadi", issue: "Boundary Overlap Dispute with Adjacent Nanjai Land", status: "HEARING_SCHEDULED" },
    { id: "APPEAL-RDO-802", survey: "SF.54/1", appellant: "Karuppusamy G / கருப்புசாமி ஜி", village: "Thamaraikulam", issue: "Challenging Tahsildar Mutation Order #9812", status: "INTERIM_STAY_REQUESTED" },
  ];

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: 24, borderLeft: "4px solid #d97706", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Scale size={22} color="#d97706" />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                RDO 1st Appellate Tribunal Portal (வருவாய் கோட்டாட்சியர் தளம்)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6, margin: 0 }}>
              1st Revenue Appellate Hearing Court, Interim Stay Orders & Boundary Freeze Authority
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 4, color: "#d97706", fontWeight: 700 }}>
              Division: Pollachi Revenue Division
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Taluks: Pollachi, Kinathukadavu, Anaimalai
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { id: "appeals", label: "Appellate Tribunal Hearing Cases", icon: Scale },
          { id: "stay", label: "Issue Interim Stay Order & GIS Freeze", icon: AlertOctagon },
          { id: "resurvey", label: "Order Divisional Re-Survey", icon: MapPin },
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
      {activeTab === "appeals" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {APPEALS.map((app) => {
            const isStayed = issuedStays.includes(app.id);
            return (
              <div key={app.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 4, color: "#d97706" }}>
                        {app.id}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f2942" }}>
                        {app.survey} — {app.appellant}
                      </h3>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6, display: "flex", gap: 16 }}>
                      <span>Village: {app.village}</span>
                      <span>Dispute: {app.issue}</span>
                    </div>
                  </div>

                  <div>
                    {isStayed ? (
                      <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertOctagon size={16} /> Interim Stay Issued & GIS Plot Frozen
                      </span>
                    ) : (
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: 12, padding: "8px 16px", borderColor: "#dc2626", color: "#dc2626" }}
                        onClick={() => {
                          setIssuedStays([...issuedStays, app.id]);
                          alert(`Interim Stay Order issued for ${app.survey}! Mutation frozen on GIS & TamilNilam.`);
                        }}
                      >
                        Issue Interim Stay Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "stay" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Interim Stay Orders & Cadastral Lock Registry
          </h3>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Freezes sub-registrar sale deed transactions and mutation updates on disputed survey fields.
          </p>
        </div>
      )}

      {activeTab === "resurvey" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Order Divisional Re-Survey & Boundary Demarcation
          </h3>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Dispatches Head Surveyor team for field measurement under Section 10(1) of TN Survey Act.
          </p>
        </div>
      )}
    </div>
  );
}
