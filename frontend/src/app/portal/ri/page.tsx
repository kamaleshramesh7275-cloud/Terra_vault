"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Search, Check, User, Layers, ArrowRight, ShieldAlert, FileSearch
} from "lucide-react";
import Link from "next/link";

export default function RIPortalPage() {
  const [activeTab, setActiveTab] = useState<"fir" | "sro" | "overlap">("fir");
  const [scrutinizedFiles, setScrutinizedFiles] = useState<string[]>([]);

  const RI_TASKS = [
    { id: "FIR-RI-201", survey: "SF.409/A1", owner: "Palanisamy K / பழனிசாமி கே", village: "Kinathukadavu Town", vaoStatus: "VERIFIED", ecStatus: "CLEAN", recommendation: "Recommended for Patta Subdivision Order" },
    { id: "FIR-RI-202", survey: "SF.188/2", owner: "Muthusamy Gounder / முத்துசாமி கவுண்டர்", village: "Thamaraikulam", vaoStatus: "VERIFIED", ecStatus: "MORTGAGE_PENDING", recommendation: "Requires SRO NOC clearance for Bank Mortgage" },
  ];

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: 24, borderLeft: "4px solid #1e3a8a", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileSearch size={22} color="#1e3a8a" />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                RI Firka Scrutiny Portal (வருவாய் ஆய்வாளர் தளம்)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6, margin: 0 }}>
              Field Inspection Report (FIR) Scrutiny & SRO Encumbrance Cross-Check Desk
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, color: "#1e3a8a", fontWeight: 700 }}>
              Firka: Kinathukadavu (5 Revenue Villages)
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Taluk: Kinathukadavu • Revenue Division: Pollachi
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { id: "fir", label: "Field Inspection Reports (FIR)", icon: FileText },
          { id: "sro", label: "SRO Encumbrance Certificate Validation", icon: ShieldCheck },
          { id: "overlap", label: "Firka Boundary Overlap Inspection", icon: MapPin },
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
      {activeTab === "fir" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {RI_TASKS.map((task) => {
            const isDone = scrutinizedFiles.includes(task.id);
            return (
              <div key={task.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, color: "#1e3a8a" }}>
                        {task.id}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f2942" }}>
                        {task.survey} — {task.owner}
                      </h3>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6, display: "flex", gap: 16 }}>
                      <span>Village: {task.village}</span>
                      <span>VAO Status: {task.vaoStatus}</span>
                      <span>SRO EC: {task.ecStatus}</span>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> Scrutinized & Recommended to Tahsildar
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "8px 16px" }}
                        onClick={() => {
                          setScrutinizedFiles([...scrutinizedFiles, task.id]);
                          alert(`FIR ${task.id} scrutinized and forwarded with RI recommendations to Tahsildar!`);
                        }}
                      >
                        Recommend to Tahsildar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "sro" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            SRO Kinathukadavu Encumbrance Certificate (EC) Cross-Validation
          </h3>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
            Automated API query against STAR 2.0 Sub-Registrar Database for encumbrances & lien charges.
          </p>
          <div style={{ padding: 14, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, color: "#0f2942" }}>
            Status: <strong>0 Active Mortgages / Clean EC Title</strong> for SF 409/A1 Kinathukadavu Town.
          </div>
        </div>
      )}

      {activeTab === "overlap" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Multi-Village Boundary Gap & Overlap Inspection
          </h3>
          <p style={{ fontSize: 13, color: "#475569" }}>
            0 spatial overlaps detected across Kinathukadavu Firka 5 revenue village boundaries.
          </p>
        </div>
      )}
    </div>
  );
}
