"use client";
import { useState } from "react";
import { Shield, Users, RefreshCw, Database, Settings, CheckCircle2, AlertTriangle } from "lucide-react";

const MOCK_USERS = [
  { id: 1, username: "admin",     email: "admin@terravault.in",    role: "admin",    active: true },
  { id: 2, username: "reviewer1", email: "rev1@terravault.in",     role: "reviewer", active: true },
  { id: 3, username: "reviewer2", email: "rev2@terravault.in",     role: "reviewer", active: false },
  { id: 4, username: "viewer1",   email: "viewer1@terravault.in",  role: "viewer",   active: true },
];

const ROLE_BADGE: Record<string, string> = {
  admin: "badge-disputed", reviewer: "badge-review", viewer: "badge-processing",
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users"|"system"|"datasets">("users");
  const [retraining, setRetraining] = useState(false);

  const triggerRetrain = () => {
    setRetraining(true);
    setTimeout(() => setRetraining(false), 3000);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          <Shield size={22} style={{ display: "inline", marginRight: 10 }} /> Admin Panel
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Manage users, system config, model retraining, and dataset sources
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--color-surface)", padding: 4, borderRadius: 10, width: "fit-content" }}>
        {(["users","system","datasets"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: activeTab === tab ? "#10b981" : "transparent",
              color: activeTab === tab ? "white" : "var(--color-text-muted)" }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Users tab */}
      {activeTab === "users" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>User Management</div>
            <button className="btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
              <Users size={13} /> Add User
            </button>
          </div>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <table className="tv-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_USERS.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.username}</td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: 13 }}>{u.email}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.active ? "badge-verified" : "badge-rejected"}`}>
                        {u.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: 11 }}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System tab */}
      {activeTab === "system" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <RefreshCw size={15} color="#6366f1" /> Model Retraining
            </div>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Trigger active learning retraining using corrections accumulated since last run.
              Retrains TrOCR, EasyOCR fine-tune, and spaCy NER.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {[
                ["Pending corrections", "142"],
                ["Last retrain", "6 days ago"],
                ["Model WER improvement", "-2.3%"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
                  <span style={{ fontWeight: 600, color: "#10b981" }}>{val}</span>
                </div>
              ))}
            </div>
            <button onClick={triggerRetrain} className="btn-primary" disabled={retraining} style={{ width: "100%", justifyContent: "center" }}>
              {retraining ? <><RefreshCw size={14} className="spinner" /> Retraining…</> : <><RefreshCw size={14} /> Trigger Retraining</>}
            </button>
          </div>

          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={15} color="#f59e0b" /> System Config
            </div>
            {[
              { label: "Confidence Threshold", value: "0.75", type: "number" },
              { label: "Fraud Scan Schedule", value: "Weekly (Monday 03:00)", type: "text" },
              { label: "Maturity Score Schedule", value: "Nightly (02:00 IST)", type: "text" },
              { label: "OCR Ensemble Strategy", value: "Max Confidence", type: "text" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, color: "var(--color-text-muted)", marginBottom: 5 }}>{f.label}</label>
                <input className="input" defaultValue={f.value} style={{ fontSize: 13, padding: "8px 12px" }} />
              </div>
            ))}
            <button className="btn-primary" style={{ fontSize: 12, padding: "8px 20px" }}>Save Config</button>
          </div>
        </div>
      )}

      {/* Datasets tab */}
      {activeTab === "datasets" && (
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Open-Source Datasets</div>
          <div className="glass-card" style={{ overflow: "hidden" }}>
            <table className="tv-table">
              <thead>
                <tr><th>Dataset</th><th>Source</th><th>Used For</th><th>Status</th></tr>
              </thead>
              <tbody>
                {[
                  ["LGD Directory", "lgdirectory.gov.in", "Village/tehsil name validation", "loaded"],
                  ["Census 2011 Villages", "censusindia.gov.in", "Village existence check", "loaded"],
                  ["Bhu-Naksha GeoJSON", "NIC / DILRMP", "Plot polygon & area validation", "partial"],
                  ["OpenStreetMap India", "Geofabrik", "District boundary GIS", "loaded"],
                  ["AI4Bharat IndicNER", "ai4bharat.org", "NER training data", "loaded"],
                  ["Datameet Land Records", "datameet.org", "Cross-validation records", "pending"],
                ].map(([name, src, use, status]) => (
                  <tr key={name}>
                    <td style={{ fontWeight: 500 }}>{name}</td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: 12 }}>{src}</td>
                    <td style={{ fontSize: 12 }}>{use}</td>
                    <td>
                      <span className={`badge ${status === "loaded" ? "badge-verified" : status === "partial" ? "badge-review" : "badge-processing"}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
