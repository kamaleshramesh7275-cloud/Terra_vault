"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import { ClipboardCheck, AlertTriangle, Info, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

export default function ReviewPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [corrections, setCorrections] = useState<Record<string, { value: string; reason: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>("tahsildar");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentRole(localStorage.getItem("tv_role") || "tahsildar");
    }
  }, []);

  const drawBoundingBoxes = useCallback((focusedField: string | null) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !detail?.field_confidences) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = canvas.width / (img.naturalWidth || canvas.width);
    const scaleY = canvas.height / (img.naturalHeight || canvas.height);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detail.field_confidences.forEach((fc: any) => {
      const bbox = fc.bounding_box;
      if (!bbox || bbox.length < 4) return;
      const [x, y, w, h] = bbox;
      const isFocused = fc.field_name === focusedField;

      let color = fc.confidence >= 0.85 ? "#10b981" : fc.confidence >= 0.65 ? "#f59e0b" : "#ef4444";

      ctx.strokeStyle = color;
      ctx.lineWidth = isFocused ? 3 : 1.5;
      ctx.globalAlpha = isFocused ? 1.0 : 0.45;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      if (isFocused) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15;
        ctx.fillRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = 0.85;
      const label = fc.field_name.replaceAll("_", " ").toUpperCase();
      ctx.font = "bold 11px sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillRect(x * scaleX - 1, y * scaleY - 18, tw + 8, 17);

      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 1.0;
      ctx.fillText(label, x * scaleX + 3, y * scaleY - 5);
    });
  }, [detail]);

  useEffect(() => {
    drawBoundingBoxes(activeField);
  }, [activeField, drawBoundingBoxes]);

  useEffect(() => {
    api.getReviewQueue(30).then(setTasks).finally(() => setLoading(false));
    api.getReviewStats().then(setStats).catch(() => {});
  }, []);

  const openTask = async (task: any) => {
    setSelected(task);
    const d = await api.getReviewTask(task.id);
    setDetail(d);
    const initial: Record<string, { value: string; reason: string }> = {};
    (d.field_confidences || []).forEach((fc: any) => {
      initial[fc.field_name] = { value: fc.corrected_value || fc.raw_ocr_value || "", reason: "" };
    });
    setCorrections(initial);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.submitCorrection(selected.id, corrections, "verifier_user");
      setTasks(t => t.filter(x => x.id !== selected.id));
      setSelected(null);
      setDetail(null);
    } catch (e: any) {
      alert(e.message || "Failed to submit correction");
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
          {stats && (
            <>
              <span style={{ color: "#f59e0b" }}>{stats.pending} pending</span>
              <span style={{ color: "#10b981" }}>{stats.resolved} resolved</span>
              <span style={{ color: "var(--color-text-muted)" }}>{stats.total} total</span>
            </>
          )}
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
                <div
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="glass-card cursor-pointer"
                  style={{
                    padding: 14,
                    borderColor: selected?.id === task.id ? "var(--color-accent)" : undefined,
                    background: selected?.id === task.id ? "var(--color-surface-hover)" : undefined,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                      {task.record_id?.slice(0, 8)}…
                    </span>
                    <span style={{ fontSize: 11, color: priorityColor(task.priority), fontWeight: 700 }}>
                      P: {(task.priority * 100).toFixed(0)}%
                    </span>
                  </div>
                  {task.flags?.slice(0, 2).map((f: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: f.severity === "error" ? "#fca5a5" : "#fcd34d", marginTop: 6 }}>
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
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginLeft: 8, fontWeight: 400 }}>
                  ({detail.record?.village || "Unknown Village"})
                </span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-secondary" onClick={() => { setSelected(null); setDetail(null); }}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 size={13} className="spinner" /> : <CheckCircle2 size={13} />}
                  Approve & Save
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
              {/* Document Image & Canvas */}
              <div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>
                  Document Scan — click a field to highlight region
                </div>
                <div style={{ position: "relative", display: "inline-block", width: "100%" }}>
                  <img
                    ref={imgRef}
                    src={detail.record.enhanced_doc_url || detail.record.raw_doc_url}
                    alt="document"
                    onLoad={() => {
                      if (canvasRef.current && imgRef.current) {
                        canvasRef.current.width = imgRef.current.clientWidth;
                        canvasRef.current.height = imgRef.current.clientHeight;
                        drawBoundingBoxes(activeField);
                      }
                    }}
                    style={{ width: "100%", borderRadius: 8, maxHeight: 340, objectFit: "contain", background: "#0a0e1a", display: "block" }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: 8 }}
                  />
                </div>
              </div>

              {/* Field Corrections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto", maxHeight: 420 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>
                  Field Corrections — edit values below
                </div>
                {detail.field_confidences?.map((fc: any) => (
                  <div key={fc.field_name} style={{
                    padding: 12, borderRadius: 10,
                    background: fc.confidence < 0.65 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.04)",
                    border: `1px solid ${activeField === fc.field_name ? (fc.confidence < 0.65 ? "#ef4444" : "#10b981") : fc.confidence < 0.65 ? "rgba(239,68,68,0.2)" : "var(--color-border)"}`,
                    transition: "border-color 0.2s",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
                        {fc.field_name.replaceAll("_", " ")}
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
                      style={{ fontSize: 13, marginBottom: 6, padding: "7px 10px", borderColor: corrections[fc.field_name]?.value !== fc.raw_ocr_value ? "#f59e0b" : undefined }}
                    />
                  </div>
                ))}

                {/* Statutory Desk Role Card */}
                <div className="glass-card" style={{ padding: 18, marginTop: 16, border: "1px solid rgba(99,102,241,0.4)", background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(16,185,129,0.05))" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    🏛️ Statutory Revenue Desk — Action Persona
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8 }}>
                    Role: {currentRole}
                  </div>

                  {currentRole === "vao" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert("VAO Ground Inspection Report & Adangal Verified! Forwarding to RI.")}>
                        🌾 Submit Ground Truth Inspection to RI
                      </button>
                    </div>
                  )}

                  {currentRole === "ri" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => alert("FIR Approved by Revenue Inspector! Forwarding to Tahsildar Sanction Desk.")}>
                        🔍 Approve Field Inspection Report (FIR) & Forward to Tahsildar
                      </button>
                    </div>
                  )}

                  {(currentRole === "tahsildar" || currentRole === "admin") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
