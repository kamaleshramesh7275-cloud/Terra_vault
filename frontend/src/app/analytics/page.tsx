"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { BarChart3, TrendingUp, AlertTriangle, Users, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from "recharts";

const SCRIPT_DATA = [
  { script: "Devanagari", count: 4821, conf: 88 },
  { script: "Tamil",      count: 1203, conf: 84 },
  { script: "Telugu",     count: 987,  conf: 82 },
  { script: "Kannada",    count: 654,  conf: 80 },
  { script: "Malayalam",  count: 543,  conf: 85 },
  { script: "Bengali",    count: 432,  conf: 79 },
  { script: "Gujarati",   count: 387,  conf: 83 },
  { script: "Latin",      count: 1820, conf: 92 },
];

const MODEL_ACCURACY = [
  { week: "W1", wer: 18, f1: 72, restoration: 68 },
  { week: "W2", wer: 15, f1: 75, restoration: 72 },
  { week: "W3", wer: 13, f1: 78, restoration: 76 },
  { week: "W4", wer: 11, f1: 82, restoration: 80 },
  { week: "W5", wer: 9,  f1: 85, restoration: 83 },
  { week: "W6", wer: 7,  f1: 88, restoration: 87 },
];

const FRAUD_TYPES = [
  { type: "Duplicate Claims", count: 14, severity: "high" },
  { type: "Circular Mutation", count: 3, severity: "critical" },
  { type: "Orphaned Mutation", count: 7, severity: "medium" },
  { type: "Area Mismatch",    count: 11, severity: "high" },
  { type: "Date Anomaly",     count: 5,  severity: "medium" },
];

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => { api.getMaturitySummary().then(setSummary).catch(() => {}); }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          <BarChart3 size={22} style={{ display: "inline", marginRight: 10 }} /> Analytics Dashboard
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Pipeline metrics, model accuracy trends, fraud detection, and script distribution
        </p>
      </div>

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Avg OCR WER", value: "7%",       color: "#10b981", icon: TrendingUp },
          { label: "Avg Field F1", value: "88%",      color: "#6366f1", icon: BarChart3 },
          { label: "Fraud Alerts", value: "40",        color: "#ef4444", icon: AlertTriangle },
          { label: "Active Scripts", value: "14",      color: "#f59e0b", icon: Users },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>Model Accuracy Over Time</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MODEL_ACCURACY}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
              <XAxis dataKey="week" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="f1" stroke="#10b981" strokeWidth={2} dot={false} name="Field F1 %" />
              <Line type="monotone" dataKey="restoration" stroke="#6366f1" strokeWidth={2} dot={false} name="Restoration %" />
              <Line type="monotone" dataKey="wer" stroke="#ef4444" strokeWidth={2} dot={false} name="OCR WER %" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>Records by Script</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SCRIPT_DATA} layout="vertical">
              <XAxis type="number" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis dataKey="script" type="category" width={80} stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fraud alerts table */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} color="#ef4444" /> Fraud Detection Alerts
        </div>
        <table className="tv-table">
          <thead>
            <tr>
              <th>Alert Type</th>
              <th>Count</th>
              <th>Severity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {FRAUD_TYPES.map(f => (
              <tr key={f.type}>
                <td style={{ fontWeight: 500 }}>{f.type}</td>
                <td style={{ fontWeight: 700 }}>{f.count}</td>
                <td>
                  <span className={`badge badge-${f.severity === "critical" ? "disputed" : f.severity === "high" ? "review" : "processing"}`}>
                    {f.severity}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: "4px 12px", fontSize: 11 }}>
                    Investigate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Script confidence */}
      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 18 }}>Average Confidence by Script</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SCRIPT_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
            <XAxis dataKey="script" stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} domain={[60, 100]} />
            <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8 }} formatter={(v: any) => [`${v}%`, "Avg Confidence"]} />
            <Bar dataKey="conf" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
