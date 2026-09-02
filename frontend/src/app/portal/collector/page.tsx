"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Building2, Lock, Check, User, Layers, ArrowRight, ShieldAlert,
  BarChart3, Activity, Scale, Gavel, FileCheck2, Send, Download,
  Compass, Eye, CheckCircle, Clock, Search, AlertOctagon, TrendingUp, Sparkles, X
} from "lucide-react";
import Link from "next/link";
import {
  MOCK_COLLECTOR_COURT_CASES,
  MOCK_PORAMBOKE_ASSIGNMENTS,
  MOCK_TALUK_LEAGUE_TABLE,
  MOCK_LAND_ACQUISITION_PROJECTS,
  CollectorCourtCase
} from "@/lib/mockData";

export default function CollectorPortalPage() {
  const [activeTab, setActiveTab] = useState<"court" | "fraud" | "poramboke" | "taluk" | "acquisition">("court");

  // 1. Revenue Court State
  const [courtCases, setCourtCases] = useState<CollectorCourtCase[]>(MOCK_COLLECTOR_COURT_CASES);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("CASE-2026-001");
  const [courtFilter, setCourtFilter] = useState<string>("ALL");
  const [decreeModalCase, setDecreeModalCase] = useState<CollectorCourtCase | null>(null);
  const [decreeVerdict, setDecreeVerdict] = useState<"APPROVE_PETITIONER" | "DISMISS_APPEAL" | "ORDER_SUBDIVISION">("APPROVE_PETITIONER");
  const [isAnchoringDecree, setIsAnchoringDecree] = useState(false);
  const [decreeSuccessMessage, setDecreeSuccessMessage] = useState<string | null>(null);

  // 2. Fraud Freeze State
  const [overrideFlags, setOverrideFlags] = useState<string[]>([]);
  const [firDispatchedFlags, setFirDispatchedFlags] = useState<string[]>([]);

  // 3. Poramboke State
  const [porambokeList, setPorambokeList] = useState(MOCK_PORAMBOKE_ASSIGNMENTS);

  // 4. Active Selected Court Case
  const currentCase = courtCases.find(c => c.id === selectedCaseId) || courtCases[0];

  // Action: Issue Stay Order
  const handleIssueStayOrder = (caseId: string) => {
    setCourtCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          stage: "STAY_ORDER_ACTIVE",
          stay_order_issued: true
        };
      }
      return c;
    }));
    alert(`🛡️ Statutory Stay Order Issued for ${currentCase.survey_no}!\nSub-Registrar Offices (SROs) alerted. All sale & mortgage registrations frozen.`);
  };

  // Action: Summon Ground Surveyor
  const handleSummonSurveyor = (caseId: string) => {
    setCourtCases(prev => prev.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          stage: "SURVEY_PENDING",
          survey_summons_issued: true
        };
      }
      return c;
    }));
    alert(`📐 Executive Directive Dispatched!\nTahsildar & Head Surveyor summoned for mandatory DGPS/ETS ground re-verification within 7 days.`);
  };

  // Action: Pronounce Final Decree
  const handleConfirmDecree = () => {
    setIsAnchoringDecree(true);
    setTimeout(() => {
      const decreeHash = `0x7f8a9b2c3d4e5f60718293849506172839405162738495061728394051627384`;
      setCourtCases(prev => prev.map(c => {
        if (c.id === currentCase.id) {
          return {
            ...c,
            stage: "DECREE_ISSUED",
            decree_order: decreeVerdict === "APPROVE_PETITIONER"
              ? "APPEAL ALLOWED: Impugned mutation quashed. Directing Tahsildar Kinathukadavu to issue Title Patta to Petitioner within 14 days."
              : decreeVerdict === "DISMISS_APPEAL"
              ? "APPEAL DISMISSED: Prior Tahsildar mutation order upheld. No title suppression found."
              : "PARTITION DECREE: Disputed parcel ordered to be subdivided 50:50 with 12ft easement path.",
            blockchain_decree_hash: decreeHash
          };
        }
        return c;
      }));
      setIsAnchoringDecree(false);
      setDecreeSuccessMessage(`Decree pronouncement sealed on Polygon Amoy block #1489312! Order sheet generated.`);
      setTimeout(() => {
        setDecreeModalCase(null);
        setDecreeSuccessMessage(null);
      }, 2500);
    }, 1200);
  };

  // Action: Poramboke Approval
  const handleApprovePoramboke = (id: string) => {
    setPorambokeList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: "APPROVED_AND_ISSUED" };
      }
      return p;
    }));
  };

  const filteredCases = courtCases.filter(c => {
    if (courtFilter === "ALL") return true;
    return c.stage === courtFilter;
  });

  return (
    <div className="main-content" style={{ color: "#0f172a", minHeight: "100vh", paddingBottom: 60 }}>
      {/* ── Executive Apex Header Banner ─────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        padding: "24px 28px",
        borderRadius: 16,
        marginBottom: 24,
        border: "1px solid #334155",
        boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #dc2626, #b91c1c)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(220,38,38,0.4)" }}>
                <Building2 size={24} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#f87171", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                  Government of Tamil Nadu • Revenue Administration
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", margin: 0 }}>
                  District Collector Command Center (மாவட்ட ஆட்சியர் தளம்)
                </h1>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 8, margin: 0 }}>
              Apex District Revenue Oversight, Section 13 Quasi-Judicial Land Court, Emergency Fraud Freeze & Infrastructure Desk
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ textAlign: "right", background: "rgba(255,255,255,0.06)", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#38bdf8" }}>Coimbatore District (கோவை மாவட்டம்)</div>
              <div style={{ fontSize: 10, color: "#cbd5e1" }}>11 Taluks • 295 Revenue Villages • 16 SROs</div>
            </div>
            <Link
              href="/map/digital-twin"
              style={{
                padding: "10px 16px", borderRadius: 10, background: "#0284c7", color: "#ffffff",
                fontSize: 12, fontWeight: 800, textDecoration: "none", display: "flex", alignItems: "center", gap: 6,
                boxShadow: "0 4px 12px rgba(2,132,199,0.3)"
              }}
            >
              <Compass size={16} /> District 3D Twin
            </Link>
          </div>
        </div>

        {/* Top KPI Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Total District Extent</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#ffffff" }}>4,72,180 <span style={{ fontSize: 12 }}>Acres</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Active Court Appeals</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#f59e0b" }}>{courtCases.length} <span style={{ fontSize: 12 }}>Hearing</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Emergency Freezes Active</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#ef4444" }}>3 <span style={{ fontSize: 12 }}>SRO Locked</span></div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>DILRMP Digitization</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#22c55e" }}>98.4% <span style={{ fontSize: 12 }}>Sealed</span></div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "court", label: "Module 5: Collector Revenue Court (வருவாய் நீதிமன்றம்)", icon: Scale, count: courtCases.length },
          { id: "fraud", label: "Emergency Fraud Freeze & Mafia Blacklist", icon: ShieldAlert, count: 2 },
          { id: "poramboke", label: "Poramboke Assignment & Eviction Desk", icon: Layers, count: porambokeList.filter(p => p.status.includes("PENDING")).length },
          { id: "taluk", label: "11-Taluk Officer SLA League Table", icon: BarChart3 },
          { id: "acquisition", label: "RFCTLARR 2013 Land Acquisition Desk", icon: TrendingUp },
        ].map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10,
                fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "all 0.15s ease",
                background: isActive ? "#0f172a" : "#ffffff",
                color: isActive ? "#ffffff" : "#475569",
                border: isActive ? "1.5px solid #0f172a" : "1.5px solid #cbd5e1",
                boxShadow: isActive ? "0 4px 12px rgba(15, 23, 42, 0.15)" : "none"
              }}
            >
              <t.icon size={16} color={isActive ? "#38bdf8" : "#64748b"} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  padding: "1px 7px", borderRadius: 10, fontSize: 11, fontWeight: 800,
                  background: isActive ? "#38bdf8" : "#f1f5f9",
                  color: isActive ? "#0f172a" : "#475569"
                }}>
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab 1: Module 5 — Collector Quasi-Judicial Revenue Court ─────── */}
      {activeTab === "court" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20 }}>
          {/* Left Column: Cause List & Case Docket */}
          <div style={{ background: "#ffffff", padding: 20, borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontWeight: 900, fontSize: 15, display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                <Gavel size={18} color="#0284c7" />
                Cause List (விசாரணைப் பட்டியல்)
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>
                Session: Collector Camp Court
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
              {["ALL", "HEARING", "STAY_ORDER_ACTIVE", "SURVEY_PENDING", "DECREE_ISSUED"].map((f) => (
                <button
                  key={f}
                  onClick={() => setCourtFilter(f)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                    border: courtFilter === f ? "1px solid #0284c7" : "1px solid #e2e8f0",
                    background: courtFilter === f ? "#e0f2fe" : "#f8fafc",
                    color: courtFilter === f ? "#0369a1" : "#64748b"
                  }}
                >
                  {f.replace(/_/g, " ")}
                </button>
              ))}
            </div>

            {/* Case List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredCases.map((c) => {
                const isSelected = c.id === currentCase.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    style={{
                      padding: 14, borderRadius: 10, cursor: "pointer", transition: "all 0.15s ease",
                      border: isSelected ? "2px solid #0284c7" : "1px solid #e2e8f0",
                      background: isSelected ? "#f0f9ff" : "#ffffff",
                      boxShadow: isSelected ? "0 4px 12px rgba(2, 132, 199, 0.08)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: "#0284c7", background: "#e0f2fe", padding: "2px 6px", borderRadius: 4 }}>
                        {c.case_no}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12,
                        background: c.stage === "DECREE_ISSUED" ? "#dcfce7" : c.stage === "STAY_ORDER_ACTIVE" ? "#fee2e2" : "#fef3c7",
                        color: c.stage === "DECREE_ISSUED" ? "#15803d" : c.stage === "STAY_ORDER_ACTIVE" ? "#b91c1c" : "#b45309"
                      }}>
                        {c.stage.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 2 }}>
                      {c.survey_no} • {c.village} ({c.extent_acres} Ac)
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>
                      <strong>Petitioner:</strong> {c.petitioner.split("/")[0].trim()} vs <strong>Resp:</strong> {c.respondent.split("/")[0].trim()}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, color: "#64748b", borderTop: "1px solid #f1f5f9", paddingTop: 6 }}>
                      <span>Hearing: <strong>{c.hearing_date}</strong></span>
                      <span style={{
                        fontWeight: 800,
                        color: c.ai_fraud_risk === "CRITICAL" ? "#dc2626" : c.ai_fraud_risk === "HIGH" ? "#ea580c" : "#16a34a"
                      }}>
                        AI Risk: {c.ai_fraud_risk}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Hearing Bench & Judicial Action Desk */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Active Case Details Card */}
            <div style={{ background: "#ffffff", padding: 22, borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#0284c7", textTransform: "uppercase" }}>
                    {currentCase.appeal_type}
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "#0f172a", margin: "2px 0" }}>
                    {currentCase.case_no} — {currentCase.survey_no} ({currentCase.village})
                  </h2>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Filed on: {currentCase.filed_date} • Next Hearing: <strong>{currentCase.hearing_date}</strong>
                  </div>
                </div>

                {currentCase.stage === "STAY_ORDER_ACTIVE" && (
                  <div style={{ background: "#fee2e2", border: "1.5px solid #ef4444", padding: "6px 12px", borderRadius: 8, textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "#b91c1c", display: "flex", alignItems: "center", gap: 4 }}>
                      <AlertOctagon size={14} /> INJUNCTION ACTIVE
                    </div>
                    <div style={{ fontSize: 9, color: "#991b1b" }}>SRO Transfers Frozen</div>
                  </div>
                )}
              </div>

              {/* Dispute Summary in Tamil & English */}
              <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#475569", marginBottom: 2 }}>Case Subject (வழக்கின் விவரம்):</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: 4 }}>
                  {currentCase.dispute_summary}
                </div>
                <div style={{ fontSize: 11, color: "#0369a1", fontWeight: 600 }}>
                  {currentCase.dispute_summary_ta}
                </div>
              </div>

              {/* Side-by-Side Claims Comparison */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div style={{ background: "#f0fdf4", padding: 12, borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#166534", marginBottom: 4 }}>
                    Petitioner Claim (மனுதாரர் வாதம்):
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#14532d", marginBottom: 4 }}>
                    {currentCase.petitioner}
                  </div>
                  <div style={{ fontSize: 11, color: "#15803d", lineHeight: 1.35 }}>
                    {currentCase.petitioner_claim}
                  </div>
                </div>

                <div style={{ background: "#fff7ed", padding: 12, borderRadius: 8, border: "1px solid #fed7aa" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#9a3412", marginBottom: 4 }}>
                    Respondent Claim (எதிர்மனுதாரர் வாதம்):
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7c2d12", marginBottom: 4 }}>
                    {currentCase.respondent}
                  </div>
                  <div style={{ fontSize: 11, color: "#c2410c", lineHeight: 1.35 }}>
                    {currentCase.respondent_claim}
                  </div>
                </div>
              </div>

              {/* AI Forensic Title Diagnostics */}
              <div style={{ background: "#faf5ff", padding: 12, borderRadius: 8, border: "1px solid #e9d5ff", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#6b21a8", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={14} color="#9333ea" /> AI Legal Document & Boundary Insights:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#581c87", lineHeight: 1.5 }}>
                  {currentCase.ai_findings.map((f, idx) => (
                    <li key={idx} style={{ marginBottom: 2 }}>{f}</li>
                  ))}
                </ul>
              </div>

              {/* Decreed Order Banner if issued */}
              {currentCase.decree_order && (
                <div style={{ background: "#ecfdf5", padding: 14, borderRadius: 8, border: "1.5px solid #10b981", marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#065f46", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <CheckCircle2 size={16} color="#059669" /> FINAL COLLECTOR DECREE PRONOUNCED
                  </div>
                  <div style={{ fontSize: 12, color: "#047857", fontWeight: 700, lineHeight: 1.4 }}>
                    {currentCase.decree_order}
                  </div>
                  <div style={{ fontSize: 10, color: "#065f46", fontFamily: "monospace", marginTop: 6 }}>
                    On-Chain Seal: {currentCase.blockchain_decree_hash}
                  </div>
                </div>
              )}

              {/* Judicial Action Command Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: 10 }}>
                <button
                  onClick={() => handleIssueStayOrder(currentCase.id)}
                  disabled={currentCase.stage === "STAY_ORDER_ACTIVE" || currentCase.stage === "DECREE_ISSUED"}
                  style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                    background: currentCase.stage === "STAY_ORDER_ACTIVE" ? "#fee2e2" : "#dc2626",
                    color: currentCase.stage === "STAY_ORDER_ACTIVE" ? "#b91c1c" : "#ffffff",
                    border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  <Lock size={14} />
                  {currentCase.stage === "STAY_ORDER_ACTIVE" ? "Stay Order Active" : "Issue Stay Order"}
                </button>

                <button
                  onClick={() => handleSummonSurveyor(currentCase.id)}
                  disabled={currentCase.stage === "DECREE_ISSUED"}
                  style={{
                    padding: "10px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                    background: "#0284c7", color: "#ffffff", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  <Compass size={14} />
                  {currentCase.survey_summons_issued ? "Survey Summoned" : "Summon Re-Survey"}
                </button>

                <button
                  onClick={() => setDecreeModalCase(currentCase)}
                  disabled={currentCase.stage === "DECREE_ISSUED"}
                  style={{
                    padding: "10px 14px", borderRadius: 8, fontSize: 12, fontWeight: 900,
                    background: "linear-gradient(135deg, #059669, #047857)", color: "#ffffff", border: "none",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: "0 4px 12px rgba(5,150,105,0.25)"
                  }}
                >
                  <Gavel size={15} /> Pronounce Decree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Emergency Fraud Overrides ──────────────────────────────── */}
      {activeTab === "fraud" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            {
              id: "ALERT-COL-901",
              survey: "SF 512/B",
              village: "Kinathukadavu Town",
              type: "RAPID_FLIP_PATTERN (பினாமி / குறுகிய கால விற்பனை)",
              detail: "3 title transfers within 14 days • Suspicious valuation delta of +480% without developmental activity",
              risk: "CRITICAL"
            },
            {
              id: "ALERT-COL-902",
              survey: "SF 33/1A",
              village: "Kothavadi",
              type: "PORAMBOKE_ENCROACHMENT (நீர்வழி புறம்போக்கு ஆக்கிரமிப்பு)",
              detail: "Commercial warehouse boundary expanded 0.28 acres inside Waterbody Oorani buffer zone",
              risk: "HIGH"
            },
          ].map((alertItem) => {
            const isFrozen = overrideFlags.includes(alertItem.id);
            const isFirDispatched = firDispatchedFlags.includes(alertItem.id);
            return (
              <div key={alertItem.id} style={{ background: "#ffffff", padding: 22, borderRadius: 14, border: "1.5px solid #e2e8f0", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 4, color: "#b91c1c" }}>
                        {alertItem.id}
                      </span>
                      <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#0f172a" }}>
                        {alertItem.survey} — {alertItem.village}
                      </h3>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 12, background: "#dc2626", color: "#ffffff" }}>
                        {alertItem.risk}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                      <strong>Classification:</strong> {alertItem.type}
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
                      {alertItem.detail}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => {
                        setFirDispatchedFlags(prev => [...prev, alertItem.id]);
                        alert(`🚨 Criminal FIR Reference Dispatched to District SP (Coimbatore Rural) under IPC 420/468!`);
                      }}
                      disabled={isFirDispatched}
                      style={{
                        padding: "9px 14px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                        background: isFirDispatched ? "#f1f5f9" : "#ffffff",
                        color: isFirDispatched ? "#64748b" : "#dc2626",
                        border: "1.5px solid #dc2626", cursor: isFirDispatched ? "default" : "pointer"
                      }}
                    >
                      {isFirDispatched ? "✓ FIR Dispatched to SP" : "Dispatch FIR to SP"}
                    </button>

                    <button
                      onClick={() => {
                        setOverrideFlags(prev => [...prev, alertItem.id]);
                        alert(`🚨 Collector Emergency Freeze applied to ${alertItem.survey}! Transaction locked across SRO registry.`);
                      }}
                      disabled={isFrozen}
                      style={{
                        padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                        background: isFrozen ? "#059669" : "#dc2626",
                        color: "#ffffff", border: "none", cursor: isFrozen ? "default" : "pointer"
                      }}
                    >
                      {isFrozen ? "✓ SRO Registry Frozen" : "Emergency SRO Freeze"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab 3: Poramboke Land Assignment ─────────────────────────────── */}
      {activeTab === "poramboke" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Government Poramboke & Free House-Site Patta Approval Desk
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>
                Statutory grants of Grama Natham & Meikkal lands to landless rural poor (இலவச வீட்டுமனைப் பட்டா)
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", background: "#f0fdf4", color: "#166534", borderRadius: 6 }}>
              Social Welfare Quota: 100% Verified
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {porambokeList.map((p) => (
              <div key={p.id} style={{ background: "#f8fafc", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "monospace", color: "#0284c7" }}>{p.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{p.survey_no} • {p.village} ({p.extent_cents} Cents)</span>
                    <span style={{ fontSize: 10, padding: "2px 6px", background: "#e0e7ff", color: "#3730a3", borderRadius: 4, fontWeight: 700 }}>{p.land_class}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", fontWeight: 700 }}>Beneficiary: {p.beneficiary}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Scheme: {p.scheme}</div>
                </div>

                <div>
                  {p.status === "APPROVED_AND_ISSUED" ? (
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#059669", display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 size={16} /> Patta Granted & Anchored
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprovePoramboke(p.id)}
                      style={{
                        padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                        background: "#059669", color: "#ffffff", border: "none", cursor: "pointer"
                      }}
                    >
                      Approve & Issue Patta
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tab 4: 11-Taluk SLA League Table ─────────────────────────────── */}
      {activeTab === "taluk" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
            Coimbatore District 11-Taluk Revenue Officer SLA Performance
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
            Comparative ranking of Tahsildars by Patta clearance speed, Grievance resolution %, and Stamp revenue collection
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#0f172a", color: "#ffffff", textAlign: "left" }}>
                <th style={{ padding: "10px 12px" }}>Rank</th>
                <th style={{ padding: "10px 12px" }}>Taluk</th>
                <th style={{ padding: "10px 12px" }}>Tahsildar In-Charge</th>
                <th style={{ padding: "10px 12px" }}>Patta SLA (Days)</th>
                <th style={{ padding: "10px 12px" }}>Clearance %</th>
                <th style={{ padding: "10px 12px" }}>Grievances Cleared</th>
                <th style={{ padding: "10px 12px" }}>Revenue (₹ Cr)</th>
                <th style={{ padding: "10px 12px" }}>Rating</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TALUK_LEAGUE_TABLE.map((t) => (
                <tr key={t.rank} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 800 }}>#{t.rank}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: "#0284c7" }}>{t.taluk}</td>
                  <td style={{ padding: "10px 12px" }}>{t.officer}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: t.patta_sla_days < 10 ? "#059669" : "#ea580c" }}>{t.patta_sla_days} Days</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800 }}>{t.clearance_rate}</td>
                  <td style={{ padding: "10px 12px" }}>{t.grievances_resolved}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 800, color: "#0f172a" }}>₹{t.revenue_cr} Cr</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 800,
                      background: t.status === "EXEMPLARY" ? "#dcfce7" : t.status === "GOOD" ? "#e0f2fe" : "#fef3c7",
                      color: t.status === "EXEMPLARY" ? "#15803d" : t.status === "GOOD" ? "#0369a1" : "#b45309"
                    }}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab 5: RFCTLARR 2013 Land Acquisition Desk ───────────────────── */}
      {activeTab === "acquisition" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {MOCK_LAND_ACQUISITION_PROJECTS.map((proj) => (
            <div key={proj.id} style={{ background: "#ffffff", padding: 22, borderRadius: 14, border: "1.5px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "#0284c7", background: "#e0f2fe", padding: "2px 6px", borderRadius: 4 }}>
                    {proj.id} • {proj.authority}
                  </span>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", margin: "6px 0 2px" }}>
                    {proj.project_name}
                  </h3>
                  <div style={{ fontSize: 12, color: "#475569" }}>{proj.project_name_ta}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Disbursed Compensation</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: "#059669" }}>
                    ₹{proj.disbursed_cr} Cr <span style={{ fontSize: 12, color: "#64748b" }}>/ ₹{proj.compensation_budget_cr} Cr</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Total Land Extent</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{proj.total_extent_acres} Acres</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Parcels Settled</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{proj.parcels_acquired} / {proj.total_parcels} Parcels</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700 }}>Statutory Multiplier</div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#7c3aed" }}>{proj.multiplier_factor}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pronounce Decree Modal ────────────────────────────────────────── */}
      {decreeModalCase && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(6px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20
        }}>
          <div style={{ background: "#ffffff", borderRadius: 16, maxWidth: 650, width: "100%", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "1.5px solid #cbd5e1" }}>
            <div style={{ background: "#0f172a", color: "#ffffff", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Gavel size={20} color="#38bdf8" />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900 }}>Pronounce Collector Judicial Decree (நீதிமன்றத் தீர்ப்பு)</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Case: {decreeModalCase.case_no} • {decreeModalCase.survey_no}</div>
                </div>
              </div>
              <button onClick={() => setDecreeModalCase(null)} style={{ background: "#1e293b", border: "none", color: "#ffffff", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 800, color: "#334155", display: "block", marginBottom: 6 }}>
                  Select Judicial Pronouncement Verdict:
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { id: "APPROVE_PETITIONER", label: "ALLOW APPEAL: Quash rival mutation & issue fresh title to Petitioner" },
                    { id: "DISMISS_APPEAL", label: "DISMISS APPEAL: Uphold existing Tahsildar order (No fraud found)" },
                    { id: "ORDER_SUBDIVISION", label: "PARTITION DECREE: Order 50:50 parcel split with 12ft easement cart track" },
                  ].map((v) => (
                    <label key={v.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, border: decreeVerdict === v.id ? "2px solid #059669" : "1px solid #e2e8f0", background: decreeVerdict === v.id ? "#ecfdf5" : "#f8fafc", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      <input
                        type="radio"
                        name="decreeVerdict"
                        checked={decreeVerdict === v.id}
                        onChange={() => setDecreeVerdict(v.id as any)}
                      />
                      {v.label}
                    </label>
                  ))}
                </div>
              </div>

              {decreeSuccessMessage ? (
                <div style={{ padding: 14, background: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: 8, fontSize: 12, color: "#065f46", fontWeight: 800 }}>
                  ✨ {decreeSuccessMessage}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={() => setDecreeModalCase(null)}
                    style={{ padding: "9px 16px", borderRadius: 8, fontSize: 12, fontWeight: 700, background: "#f1f5f9", color: "#475569", border: "none", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDecree}
                    disabled={isAnchoringDecree}
                    style={{
                      padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 900,
                      background: "linear-gradient(135deg, #059669, #047857)", color: "#ffffff", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 6
                    }}
                  >
                    {isAnchoringDecree ? <Activity size={16} className="animate-spin" /> : <Gavel size={16} />}
                    {isAnchoringDecree ? "Sealing On-Chain..." : "Confirm & Pronounce Decree"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
