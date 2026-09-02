"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Upload, Camera, Check, ChevronRight, User, Trees, Layers, Sprout, ClipboardList
} from "lucide-react";
import Link from "next/link";

export default function VAOPortalPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "adangal" | "enquiry">("queue");
  const [selectedVillage, setSelectedVillage] = useState("Kinathukadavu Town (630401)");
  const [submittedTasks, setSubmittedTasks] = useState<string[]>([]);

  const VAO_TASKS = [
    { id: "TASK-VAO-101", survey: "SF.409/A1", owner: "Palanisamy K / பழனிசாமி கே", village: "Kinathukadavu Town", area: "1.25 Acres", status: "PENDING_VERIFICATION", type: "Patta Subdivision / உட்பிரிவு" },
    { id: "TASK-VAO-102", survey: "SF.256/1B", owner: "Lakshmi Ammal / லட்சுமி அம்மாள்", village: "Kinathukadavu Town", area: "0.85 Acres", status: "PENDING_VERIFICATION", type: "Family Partition / பாகப்பிரிவினை" },
    { id: "TASK-VAO-103", survey: "SF.12/3", owner: "Kandasamy Gounder / கந்தசாமி கவுண்டர்", village: "Solavampalayam", area: "2.40 Acres", status: "VERIFIED", type: "Crop Adangal Entry" },
  ];

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: 24, borderLeft: "4px solid #16a34a", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sprout size={22} color="#16a34a" />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                VAO Ground Verification Desk (கிராம நிர்வாக அலுவலர் தளம்)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6, margin: 0 }}>
              Official Ground Truth Scrutiny, Adangal Crop Entry & Field Inspection Officer Portal
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, color: "#16a34a", fontWeight: 700 }}>
              Village LGD: Kinathukadavu Town (630401)
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              Taluk: Kinathukadavu • Firka: Kinathukadavu
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Export Hub */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12 }}>
          {[
            { id: "queue", label: "Field Verification Queue (3 Pending)", icon: FileText },
            { id: "adangal", label: "Season Adangal Crop Register", icon: Trees },
            { id: "enquiry", label: "Upload Ground Enquiry & Photos", icon: Camera },
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

        {/* Tabular Ledger Downloads (Format 3) */}
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/api/export/village/Kinathukadavu/excel" download style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
              📊 Download Jamabandi Ledger (.xlsx)
            </button>
          </a>
          <a href="/api/export/village/Kinathukadavu/csv" download style={{ textDecoration: "none" }}>
            <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 12, background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8", borderRadius: 6, display: "flex", alignItems: "center", gap: 6 }}>
              📑 Export CSV
            </button>
          </a>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {VAO_TASKS.map((task) => {
            const isDone = submittedTasks.includes(task.id);
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
                      <span>Extents: {task.area}</span>
                      <span>Type: {task.type}</span>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> Ground Verified & Forwarded to RI
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "8px 16px" }}
                        onClick={() => {
                          setSubmittedTasks([...submittedTasks, task.id]);
                          alert(`Ground Inspection for ${task.survey} verified and forwarded to Revenue Inspector (RI)!`);
                        }}
                      >
                        Submit Ground Truth Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "adangal" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Season Adangal Register Crop Entry (பசலி 1434 சாகுபடி பதிவேடு)
          </h3>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
            Update official crop cultivate records for Kinathukadavu Town survey fields.
          </p>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Survey Field No.</label>
              <input type="text" className="input" defaultValue="SF 409/A1" style={{ width: "100%" }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Cultivated Crop (பயிர்)</label>
              <select className="input" style={{ width: "100%" }}>
                <option>Coconut (தென்னை)</option>
                <option>Paddy (நல்)</option>
                <option>Sugarcane (கரும்பு)</option>
                <option>Cotton (பருத்தி)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Irrigation Source (நீர்ப்பாசனம்)</label>
              <select className="input" style={{ width: "100%" }}>
                <option>Borewell & Canal (கிணறு)</option>
                <option>Rainfed (மானாவாரி)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16, fontSize: 12 }} onClick={() => alert("Adangal crop entry updated successfully!")}>
            Save Adangal Entry
          </button>
        </div>
      )}

      {activeTab === "enquiry" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Upload Field Inspection Photo & Local Enquiry Summary
          </h3>
          <div style={{ border: "2px dashed #cbd5e1", padding: 24, borderRadius: 8, textAlign: "center", marginBottom: 16 }}>
            <Camera size={24} color="#1e3a8a" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f2942" }}>Click or Drag Geotagged Field Inspection Photo</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Includes GPS Metadata (Lat: 10.824, Lon: 77.012)</div>
          </div>
          <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => alert("Geotagged ground photo uploaded & attached to survey file!")}>
            Upload Inspection Photo
          </button>
        </div>
      )}
    </div>
  );
}
