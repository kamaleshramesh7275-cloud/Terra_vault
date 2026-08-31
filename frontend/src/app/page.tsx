"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Upload, FileText, ClipboardCheck, ShieldCheck,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
  BarChart3, Globe, Leaf, ArrowRight, Zap
} from "lucide-react";
import { api } from "@/lib/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const QUICK_ACTIONS = [
  { href: "/upload",  icon: Upload,       label: "Upload Document",  desc: "Scan or photo capture",         color: "#10b981" },
  { href: "/review",  icon: ClipboardCheck, label: "Review Queue",   desc: "Pending human verification",    color: "#f59e0b" },
  { href: "/records", icon: FileText,     label: "Browse Records",   desc: "Search all land records",        color: "#6366f1" },
  { href: "/map",     icon: Globe,        label: "GIS Map",          desc: "Digitization maturity map",      color: "#3b82f6" },
];

const MOCK_TREND = [
  { day: "Mon", processed: 120, verified: 95 },
  { day: "Tue", processed: 180, verified: 142 },
  { day: "Wed", processed: 210, verified: 178 },
  { day: "Thu", processed: 165, verified: 130 },
  { day: "Fri", processed: 240, verified: 198 },
  { day: "Sat", processed: 300, verified: 261 },
  { day: "Sun", processed: 195, verified: 163 },
];

const PIE_DATA = [
  { name: "Verified",   value: 62, color: "#10b981" },
  { name: "In Review",  value: 18, color: "#f59e0b" },
  { name: "Processing", value: 12, color: "#6366f1" },
  { name: "Disputed",   value: 8,  color: "#ef4444" },
];

export default function DashboardPage() {
  const [maturitySummary, setMaturitySummary] = useState<any>(null);
  const [reviewStats, setReviewStats] = useState<any>(null);

  useEffect(() => {
    api.getMaturitySummary().then(setMaturitySummary).catch(() => {});
    api.getReviewStats().then(setReviewStats).catch(() => {});
  }, []);

  const stats = [
    { label: "Total Records",     value: "12,847",  icon: FileText,     color: "#6366f1", delta: "+243 today" },
    { label: "Verified",          value: "7,964",   icon: CheckCircle2, color: "#10b981", delta: "62% verified" },
    { label: "Pending Review",    value: reviewStats?.pending ?? "—",    icon: Clock,        color: "#f59e0b", delta: "high priority" },
    { label: "Fraud Alerts",      value: "24",       icon: AlertTriangle, color: "#ef4444", delta: "7 critical" },
    { label: "Avg Confidence",    value: "87.4%",    icon: TrendingUp,   color: "#10b981", delta: "+2.1% this week" },
    { label: "Geo Units Scored",  value: maturitySummary?.total_geo_units ?? "—", icon: Globe, color: "#3b82f6", delta: "villages" },
  ];

  return (
    <div className="hero-bg" style={{ minHeight: "100vh", padding: "0 0 60px" }}>
      {/* ── Hero ── */}
      <div className="animate-fade-up" style={{ paddingBottom: 40, borderBottom: "1px solid var(--color-border)", marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg,#10b981,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 700 }}>
              <span className="gradient-text">Terra_vault</span>
            </h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
              AI-powered Indian land record digitization platform
            </p>
          </div>
        </div>
        <p style={{ color: "var(--color-text-dim)", maxWidth: 600, lineHeight: 1.7, fontSize: 14 }}>
          Ingest scanned, handwritten, or phone-photographed land records — enhanced by ML, extracted
          by multilingual OCR, validated by open-source data, and anchored to Polygon blockchain for
          tamper-evident proof.
        </p>
      </div>

      {/* ── Stats grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: "var(--color-text-muted)", fontWeight: 500 }}>{s.label}</span>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${s.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <s.icon size={17} color={s.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "var(--font-head)", color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 36 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Weekly Processing Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_TREND}>
              <defs>
                <linearGradient id="gProc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gVer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8, color: "#f1f5f9" }} />
              <Area type="monotone" dataKey="processed" stroke="#6366f1" fill="url(#gProc)" strokeWidth={2} />
              <Area type="monotone" dataKey="verified"  stroke="#10b981" fill="url(#gVer)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
            {[["#6366f1","Processed"],["#10b981","Verified"]].map(([c,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)" }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                {l}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20, fontSize: 15 }}>Record Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value">
                {PIE_DATA.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a2235", border: "1px solid #1e2d45", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PIE_DATA.map(d => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                  <span style={{ color: "var(--color-text-muted)" }}>{d.name}</span>
                </div>
                <span style={{ color: d.color, fontWeight: 600 }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick actions ── */}
      <h2 style={{ fontWeight: 600, marginBottom: 18, fontSize: 16 }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {QUICK_ACTIONS.map((a, i) => (
          <Link key={a.href} href={a.href} style={{ textDecoration: "none" }}>
            <div className="glass-card animate-fade-up" style={{
              padding: 20, cursor: "pointer", animationDelay: `${i * 80}ms`
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${a.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 14,
              }}>
                <a.icon size={20} color={a.color} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{a.label}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>{a.desc}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: a.color }}>
                Open <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── System status ── */}
      <div className="glass-card" style={{ marginTop: 28, padding: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>
          <Zap size={16} color="#f59e0b" /> System Status
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
          {[
            ["OCR Engine", "online", "#10b981"],
            ["ML Pipeline", "online", "#10b981"],
            ["Polygon RPC", "online", "#10b981"],
            ["Review Queue", "24 pending", "#f59e0b"],
            ["Fraud Scanner", "idle", "#6366f1"],
          ].map(([name, status, color]) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>
                <span style={{ color }}>●</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{name}</div>
              <div style={{ fontSize: 11, color }}>{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
