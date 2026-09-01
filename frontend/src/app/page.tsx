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

      {/* ── AI Feature Capabilities Spotlight Banner ── */}
      <div className="glass-card animate-fade-up" style={{ padding: 24, borderRadius: 16, marginBottom: 36, border: "1px solid rgba(99,102,241,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={14} color="#818cf8" /> Master AI Feature Suite • 13 Production Modules Active
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: "white" }}>
              Explore Terra_vault AI Capabilities & "How It Works" Visualizers
            </h2>
          </div>
          <Link href="/features" className="btn btn-primary" style={{ gap: 8, fontSize: 12, fontWeight: 700, padding: "8px 18px" }}>
            Explore All 13 Features <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            { title: "📄 Advanced OCR v2", desc: "Heatmaps, Cross-Val, Signatures, Ink, 6D Clusters", href: "/review", color: "#818cf8" },
            { title: "🌐 GeoAI & 3D Twin", desc: "Sentinel-2 NDVI, NDBI, 16x16 DEM Mesh, 6-Tier Terrain", href: "/map", color: "#10b981" },
            { title: "🔒 ZK Blockchain", desc: "Groth16 ZK-SNARK Privacy, Poseidon Hash, 24h TTL", href: "/blockchain", color: "#6366f1" },
            { title: "📊 Temporal Graph AI", desc: "Benami Ring, Circular Flips, Witness Syndicate", href: "/analytics", color: "#f59e0b" },
          ].map((f) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 14, borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", height: "100%", transition: "all 0.2s" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: f.color, marginBottom: 4 }}>
                  {f.title}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", lineHeight: 1.4 }}>
                  {f.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
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

      {/* ── State-wise & District-wise DILRMP Digitization Progress ── */}
      <div className="glass-card animate-fade-up" style={{ padding: 24, borderRadius: 16, marginBottom: 36, border: "1px solid rgba(16,185,129,0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span>🇮🇳</span> DILRMP Mandate • State & District Digitization Progress
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: "white" }}>
              Digital India Land Records Modernization Programme Status
            </h2>
          </div>
          <span className="badge badge-verified" style={{ fontSize: 11, padding: "6px 12px" }}>
            Overall: 91.2% Digitized
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* State-wise Progress Bars */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#a5b4fc", marginBottom: 10 }}>State-wise Vectorization & OCR Index</div>
            {[
              { state: "Tamil Nadu (TN)", pct: 96.4, docs: "4,820 / 5,000", color: "#10b981" },
              { state: "Maharashtra (MH)", pct: 92.1, docs: "3,680 / 4,000", color: "#38bdf8" },
              { state: "Uttar Pradesh (UP)", pct: 88.5, docs: "3,540 / 4,000", color: "#818cf8" },
              { state: "Karnataka (KA)", pct: 84.0, docs: "2,240 / 2,670", color: "#f59e0b" },
            ].map(st => (
              <div key={st.state} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{st.state}</span>
                  <span style={{ color: st.color, fontWeight: 700 }}>{st.pct}% ({st.docs})</span>
                </div>
                <div style={{ width: "100%", height: 7, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ width: `${st.pct}%`, height: "100%", background: st.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>

          {/* District Breakdown: Coimbatore Taluks */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", marginBottom: 10 }}>Coimbatore Pilot District Taluk Progress</div>
            {[
              { taluk: "Pollachi (பொள்ளாச்சி)", pct: 98.5, status: "NEAR COMPLETE" },
              { taluk: "Coimbatore North (வடக்கு)", pct: 94.2, status: "ON TRACK" },
              { taluk: "Sulur (சூலூர்)", pct: 91.0, status: "ON TRACK" },
              { taluk: "Mettupalayam (மேட்டுப்பாளையம்)", pct: 86.8, status: "IN PROGRESS" },
            ].map(tk => (
              <div key={tk.taluk} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{tk.taluk}</div>
                  <div style={{ fontSize: 10, color: "var(--color-text-muted)" }}>FMB Cadastral Mesh Aligned</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: "#34d399" }}>{tk.pct}%</span>
                  <div style={{ fontSize: 9, color: "var(--color-text-muted)" }}>{tk.status}</div>
                </div>
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
