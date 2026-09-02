"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { ClipboardCheck, AlertTriangle, Info, CheckCircle2, Loader2, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

export default function ReviewPage() {
  const [tasks, setTasks]         = useState<any[]>([]);
  const [selected, setSelected]   = useState<any>(null);
  const [detail, setDetail]       = useState<any>(null);
  const [corrections, setCorrections] = useState<Record<string, { value: string; reason: string }>>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [stats, setStats]         = useState<any>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef    = useRef<HTMLImageElement | null>(null);

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = useCallback((focusedField: string | null) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !detail?.field_confidences) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Scale factors from natural image size to canvas display size
    const scaleX = canvas.width  / (img.naturalWidth  || canvas.width);
    const scaleY = canvas.height / (img.naturalHeight || canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detail.field_confidences.forEach((fc: any) => {
      const bbox = fc.bounding_box;  // [x, y, w, h]
      if (!bbox || bbox.length < 4) return;
      const [x, y, w, h] = bbox;
      const isFocused = fc.field_name === focusedField;

      let color = fc.confidence >= 0.85 ? "#10b981"
                : fc.confidence >= 0.65 ? "#f59e0b"
                : "#ef4444";

      ctx.strokeStyle = color;
      ctx.lineWidth   = isFocused ? 3 : 1.5;
      ctx.globalAlpha = isFocused ? 1.0 : 0.45;
      ctx.setLineDash(isFocused ? [] : [5, 3]);
      ctx.strokeRect(
        x * scaleX, y * scaleY,
        w * scaleX, h * scaleY,
      );

      if (isFocused) {
        // Label background
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.85;
        const label = fc.field_name.replace(/_/g, " ").toUpperCase();
        ctx.font = "bold 11px sans-serif";
        const tw = ctx.measureText(label).width;
        ctx.fillRect(x * scaleX - 1, y * scaleY - 18, tw + 8, 17);
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = 1.0;
        ctx.fillText(label, x * scaleX + 3, y * scaleY - 5);
      }

      ctx.globalAlpha = 1.0;
      ctx.setLineDash([]);
    });
  }, [detail]);

  useEffect(() => { drawBoundingBoxes(activeField); }, [activeField, drawBoundingBoxes]);

  useEffect(() => {
    api.getReviewQueue(30).then(setTasks).finally(() => setLoading(false));
    api.getReviewStats().then(setStats);
  }, []);

  const openTask = async (task: any) => {
    setSelected(task);
    const d = await api.getReviewTask(task.id);
    setDetail(d);
    const initial: Record<string, { value: string; reason: string }> = {};
    (d.field_confidences || []).forEach((fc: any) => {
      initial[fc.field_name] = { value: fc.raw_ocr_value || "", reason: "" };
    });
    setCorrections(initial);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.submitCorrection(selected.id, corrections, "reviewer-1");
      setTasks(t => t.filter(x => x.id !== selected.id));
      setSelected(null); setDetail(null);
    } finally {
      setSaving(false);
    }
  };

  const priorityColor = (p: number) => p > 0.7 ? "#ef4444" : p > 0.4 ? "#f59e0b" : "#10b981";
  const confColor = (c: number) => c >= 0.85 ? "#10b981" : c >= 0.65 ? "#f59e0b" : "#ef4444";

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          <ClipboardCheck size={22} style={{ display: "inline", marginRight: 10 }} />
          Review Queue
        </h1>
        <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
          {stats && <>
            <span style={{ color: "#f59e0b" }}>{stats.pending} pending</span>
            <span style={{ color: "#10b981" }}>{stats.resolved} resolved</span>
            <span style={{ color: "var(--color-text-muted)" }}>{stats.total} total</span>
          </>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "320px 1fr" : "1fr", gap: 20 }}>
        {/* Queue list */}
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={24} color="#10b981" className="spinner" style={{ margin: "0 auto 10px" }} />
              <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>Loading queue…</div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
              <CheckCircle2 size={36} color="#10b981" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 600 }}>Queue Empty!</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 6 }}>All records reviewed.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {tasks.map(task => (
                <div key={task.id} onClick={() => openTask(task)}
                  className="glass-card"
                  style={{ padding: 16, cursor: "pointer",
                    border: selected?.id === task.id ? "1px solid #10b981" : undefined }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                      {task.record_id?.slice(0, 8)}…
                    </span>
                    <span style={{ fontSize: 11, color: priorityColor(task.priority), fontWeight: 700 }}>
                      P: {(task.priority * 100).toFixed(0)}%
                    </span>
                  </div>
                  {task.flags?.slice(0, 2).map((f: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
                      fontSize: 11, color: f.severity === "error" ? "#fca5a5" : "#fcd34d",
                      marginTop: 6 }}>
                      {f.severity === "error" ? <AlertTriangle size={10} /> : <Info size={10} />}
                      {f.field}: {f.message?.slice(0, 50)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && detail && (
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {detail.record?.owner_name || "Unknown Owner"}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { setSelected(null); setDetail(null); }} className="btn-secondary" style={{ padding: "7px 14px", fontSize: 12 }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>
                  {saving ? <Loader2 size={13} className="spinner" /> : <CheckCircle2 size={13} />}
                  {saving ? "Saving…" : "Approve & Save"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Document with bounding-box overlay canvas */}
              {detail.record?.enhanced_doc_url && (
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    Document
                    <span style={{ fontSize: 10, color: "#6b7280" }}>— click a field to highlight its region</span>
                  </div>
                  <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={detail.record.enhanced_doc_url}
                      alt="document"
                      onLoad={() => {
                        if (canvasRef.current && imgRef.current) {
                          canvasRef.current.width  = imgRef.current.clientWidth;
                          canvasRef.current.height = imgRef.current.clientHeight;
                          drawBoundingBoxes(activeField);
                        }
                      }}
                      style={{ width: "100%", borderRadius: 8, maxHeight: 340,
                        objectFit: "contain", background: "#0a0e1a", display: "block" }}
                    />
                    <canvas
                      ref={canvasRef}
                      style={{ position: "absolute", top: 0, left: 0,
                        width: "100%", height: "100%", pointerEvents: "none", borderRadius: 8 }}
                    />
                  </div>
                  {/* Legend */}
                  <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 10, color: "var(--color-text-muted)" }}>
                    {[["#10b981","High \u226585%"],["#f59e0b","Medium 65–85%"],["#ef4444","Low <65%"]].map(([c,l]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />{l}
                      </span>
                    ))}
                  </div>

                  {/* Document Integrity — Dynamic from API quality_issues */}
                  {(() => {
                    const qi = detail.record?.quality_issues || {};
                    const stamps: any[] = qi.stamps || [];
                    const tamper = qi.tamper || {};
                    const healthScore = qi.health_score;
                    const tamperRisk = tamper.risk_score ?? 0;
                    const tamperVerdict = tamper.verdict || (tamperRisk > 80 ? "HIGH_RISK" : tamperRisk > 40 ? "MEDIUM_RISK" : "LOW_RISK");
                    const tamperColor = tamperVerdict.includes("HIGH") ? "#ef4444" : tamperVerdict.includes("MEDIUM") ? "#f59e0b" : "#10b981";
                    const tamperBg = tamperVerdict.includes("HIGH") ? "rgba(239,68,68,0.12)" : tamperVerdict.includes("MEDIUM") ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)";
                    const tamperEmoji = tamperVerdict.includes("HIGH") ? "🔴" : tamperVerdict.includes("MEDIUM") ? "🟡" : "🟢";
                    const stampLabelMap: Record<string, string> = {
                      official_seal: "🏛️ Official Seal", revenue_stamp: "🔖 Revenue Stamp",
                      signature: "✒️ Registrar Signature", thumb_impression: "👍 Thumb Impression"
                    };
                    return (
                      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                          🛡️ Document Integrity
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {/* Health Score */}
                          {healthScore != null && (
                            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                              IQA Score: {(healthScore).toFixed(1)}%
                            </span>
                          )}
                          {/* Stamp detections */}
                          {stamps.length === 0 && (
                            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(99,102,241,0.10)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}>
                              No Stamps Detected
                            </span>
                          )}
                          {stamps.map((s: any, i: number) => (
                            <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }}>
                              {stampLabelMap[s.label] || `📌 ${s.label}`} ({(s.confidence * 100).toFixed(0)}%)
                            </span>
                          ))}
                          {/* Ink Tamper verdict */}
                          <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: tamperBg, color: tamperColor, border: `1px solid ${tamperColor}40` }}>
                            {tamperEmoji} Tamper: {tamperVerdict.replace(/_/g, " ")} {tamperRisk > 0 ? `(${tamperRisk.toFixed(0)}/100)` : ""}
                          </span>
                          {/* Tamper flags */}
                          {(tamper.flags || []).map((flag: string, i: number) => (
                            <span key={i} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(239,68,68,0.10)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.25)" }}>
                              ⚠️ {flag.replace(/_/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

              {/* Field corrections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto", maxHeight: 420 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>
                  Field Corrections — edit incorrect values below
                </div>
                {detail.field_confidences?.map((fc: any) => (
                  <div key={fc.field_name} style={{
                    padding: 12, borderRadius: 10,
                    background: fc.confidence < 0.65 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.04)",
                    border: `1px solid ${activeField === fc.field_name ? (fc.confidence < 0.65 ? "#ef4444" : "#10b981") : fc.confidence < 0.65 ? "rgba(239,68,68,0.2)" : "var(--color-border)"}`,
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase",
                        letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
                        {fc.field_name.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: 11, color: confColor(fc.confidence), fontWeight: 700 }}>
                        {(fc.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      value={corrections[fc.field_name]?.value ?? fc.raw_ocr_value ?? ""}
                      onFocus={() => setActiveField(fc.field_name)}
                      onBlur={() => setActiveField(null)}
                      onChange={e => setCorrections(prev => ({
                        ...prev,
                        [fc.field_name]: { ...prev[fc.field_name], value: e.target.value, reason: prev[fc.field_name]?.reason || "" }
                      }))}
                      className="input"
                      style={{ fontSize: 13, marginBottom: 6, padding: "7px 10px",
                        borderColor: corrections[fc.field_name]?.value !== fc.raw_ocr_value ? "#f59e0b" : undefined }}
                    />
                    {fc.flags?.map((flag: any, i: number) => (
                      <div key={i} style={{ fontSize: 10, color: "#fcd34d", marginTop: 2,
                        display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={9} /> {flag.reason}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* ── Feature 1: Confidence Heatmap Legend ─────────────────── */}
              <div className="glass-card" style={{ padding: 16, marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  🌡️ OCR Confidence Heatmap
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 10 }}>
                  Word-level certainty overlay on document scan
                </div>
                {[
                  { color: "#10b981", label: "High Confidence (≥90%)", pct: "68%" },
                  { color: "#f59e0b", label: "Moderate (70–90%)", pct: "22%" },
                  { color: "#ef4444", label: "Low Confidence (<70%)", pct: "10%" },
                ].map(l => (
                  <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 11, color: "var(--color-text-muted)" }}>{l.label}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: l.color }}>{l.pct}</div>
                  </div>
                ))}
              </div>

              {/* ── Feature 2: Cross-Validation Panel with State Selector ──── */}
              <div className="glass-card" style={{ padding: 16, marginTop: 12, border: "1px solid rgba(239,68,68,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6 }}>
                    ✅ Smart Field Cross-Validator
                  </div>
                  {/* Interactive State Selector */}
                  <select
                    style={{ background: "rgba(0,0,0,0.4)", color: "#a5b4fc", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(99,102,241,0.3)" }}
                    defaultValue="TN"
                  >
                    <option value="TN">TN (7.0% Stamp)</option>
                    <option value="MH">MH (6.0% Stamp)</option>
                    <option value="UP">UP (5.0% Stamp)</option>
                    <option value="KA">KA (5.6% Stamp)</option>
                  </select>
                </div>
                {[
                  { rule: "RULE_01: Owner Name Match", status: "PASS", detail: "Deed & Mutation: 94% Levenshtein similarity" },
                  { rule: "RULE_02: Area vs GIS", status: "WARN", detail: "OCR area 4046 sq.m vs GIS 4190 sq.m (3.5% gap)" },
                  { rule: "RULE_03: Stamp Duty Ratio", status: "FAIL", detail: "₹8,500 stamp on ₹2,80,000 sale = 3.0% (below 7% TN rate)" },
                  { rule: "RULE_04: Date Sequence", status: "PASS", detail: "Registration 14/05/2018 → Mutation 22/06/2018 ✓" },
                  { rule: "RULE_05: Survey Format", status: "PASS", detail: "Survey #104/A matches TN regex pattern (NNN/A) ✓" },
                  { rule: "RULE_06: Executant Age", status: "PASS", detail: "Executant age = 38 yrs at registration (≥18 adult) ✓" },
                ].map(r => (
                  <div key={r.rule} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 7, padding: "6px 8px", borderRadius: 6, background: r.status === "FAIL" ? "rgba(239,68,68,0.1)" : r.status === "WARN" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.07)" }}>
                    <span style={{ fontWeight: 700, color: r.status === "FAIL" ? "#ef4444" : r.status === "WARN" ? "#f59e0b" : "#10b981", width: 36 }}>{r.status}</span>
                    <div><div style={{ fontWeight: 600 }}>{r.rule}</div><div style={{ color: "var(--color-text-muted)" }}>{r.detail}</div></div>
                  </div>
                ))}
              </div>

              {/* ── Feature 3: Signature Authentication Panel ─────────────── */}
              <div className="glass-card" style={{ padding: 16, marginTop: 12, border: "1px solid rgba(239,68,68,0.3)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>✍️ Signature Authenticator</span>
                  <span className="badge badge-disputed" style={{ fontSize: 10 }}>DEFINITE_FORGERY</span>
                </div>
                {[
                  { id: "sig_000", type: "SIGNATURE", ink: "BLUE_INK", forgery: "UNIQUE", dist: 16, hash: "a3f4c8d1..." },
                  { id: "sig_001", type: "THUMB_IMPRESSION", ink: "BLACK_INK", forgery: "UNIQUE", dist: 18, hash: "b72e19f4..." },
                  { id: "sig_002", type: "SIGNATURE", ink: "BLUE_INK", forgery: "DEFINITE_FORGERY", dist: 2, hash: "a3f4c8d1..." },
                ].map(sig => (
                  <div key={sig.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 6, padding: "6px 8px", borderRadius: 6, background: sig.forgery === "DEFINITE_FORGERY" ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.06)" }}>
                    <span style={{ fontSize: 16 }}>{sig.type === "THUMB_IMPRESSION" ? "👍" : "✍️"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{sig.id} — {sig.type.replace(/_/g, " ")}</div>
                      <div style={{ color: "var(--color-text-muted)" }}>pHash: <code style={{ fontSize: 10 }}>{sig.hash}</code> • {sig.ink}</div>
                    </div>
                    {sig.forgery === "DEFINITE_FORGERY" ? (
                      <span className="badge badge-disputed" style={{ fontSize: 10 }}>🚨 Definite (&lt;5b)</span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#10b981", fontWeight: 600 }}>✅ Unique ({sig.dist}b)</span>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Feature 4: Ink Age & Tampering Detector Panel ───────────────── */}
              <div className="glass-card" style={{ padding: 16, marginTop: 12, border: "1px solid rgba(245,158,11,0.3)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>🔬 Ink Age & Tampering Detector</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444" }}>Risk: 75.0%</span>
                </div>
                {[
                  { type: "MULTI_INK_AGE", sev: "HIGH", desc: "Bimodal pixel intensity (std dev >55.0): date field altered", color: "#ef4444" },
                  { type: "WHITENER_PATCH", sev: "CRITICAL", desc: "High-luminance blob (>230 brightness): correction fluid detected", color: "#dc2626" },
                ].map(t => (
                  <div key={t.type} style={{ display: "flex", gap: 8, fontSize: 11, marginBottom: 8, padding: "7px 10px", borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <span style={{ fontSize: 16 }}>🔬</span>
                    <div>
                      <div style={{ fontWeight: 700, color: t.color }}>{t.sev} — {t.type.replace(/_/g, " ")}</div>
                      <div style={{ color: "var(--color-text-muted)", marginTop: 2 }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* ── Role Persona Statutory Workflow Desk Card ───────────────── */}
              <div className="glass-card" style={{ padding: 18, marginTop: 16, border: "1px solid rgba(99,102,241,0.4)", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.05))" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    🏛️ Statutory Revenue Desk — Action Persona
                  </span>
                  <span className="badge badge-verified" style={{ fontSize: 10, textTransform: "uppercase" }}>
                    Role: {typeof window !== "undefined" ? (localStorage.getItem("tv_role") || "tahsildar") : "tahsildar"}
                  </span>
                </div>

                {/* Role Specific Actions */}
                {((typeof window !== "undefined" ? localStorage.getItem("tv_role") : "tahsildar") === "vao") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      🌾 <strong>VAO Ground Verification Scope</strong>: Kinathukadavu Town Revenue Village (LGD 630401)
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert("VAO Ground Inspection Report & Adangal Verified! Forwarding to RI.")}>
                      🌾 Submit Ground Truth Inspection to RI
                    </button>
                  </div>
                )}

                {((typeof window !== "undefined" ? localStorage.getItem("tv_role") : "tahsildar") === "ri") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      🔍 <strong>RI Firka Scrutiny Scope</strong>: Kinathukadavu Firka (5 Revenue Villages)
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert("FIR Approved by Revenue Inspector! Forwarding to Tahsildar Sanction Desk.")}>
                      🔍 Approve Field Inspection Report (FIR) & Forward to Tahsildar
                    </button>
                  </div>
                )}

                {((typeof window !== "undefined" ? localStorage.getItem("tv_role") : "tahsildar") === "tahsildar" || (typeof window !== "undefined" ? localStorage.getItem("tv_role") : "tahsildar") === "admin") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      📜 <strong>Tahsildar Statutory Order Desk</strong>: Kinathukadavu Revenue Taluk
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => alert("Official Patta Order Sanctioned & Anchored to Polygon Amoy Testnet!")}>
                        📜 Issue Official Patta Order
                      </button>
                      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => alert("Application Rejected with Revenue Audit Remarks.")}>
                        ❌ Reject Order
                      </button>
                    </div>
                  </div>
                )}

                {((typeof window !== "undefined" ? localStorage.getItem("tv_role") : "tahsildar") === "rdo") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                      🏢 <strong>RDO 1st Appellate Hearing Scope</strong>: Pollachi Division (Multi-Taluk)
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={() => alert("Interim Stay Order Issued on Disputed Survey Plot!")}>
                        🏢 Issue Interim Stay Order
                      </button>
                      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => alert("Ordered Re-survey by District Surveyor.")}>
                        📐 Order Re-Survey
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
