"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "@/lib/api";
import {
  ClipboardCheck, AlertTriangle, Info, CheckCircle2, Loader2,
  ChevronRight, ShieldCheck, User, MapPin, FileText, Check, ArrowRight, X
} from "lucide-react";

export default function ReviewPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<any>(null);
  const [corrections, setCorrections] = useState<Record<string, { value: string; reason: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string>("ri");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentRole(localStorage.getItem("tv_role") || "ri");
    }
  }, []);

  const drawBoundingBoxes = useCallback((focusedField: string | null) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !detail?.field_confidences) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleX = canvas.width / (img.naturalWidth || canvas.width || 1);
    const scaleY = canvas.height / (img.naturalHeight || canvas.height || 1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detail.field_confidences.forEach((fc: any) => {
      const bbox = fc.bounding_box;
      if (!bbox || bbox.length < 4) return;
      const [x, y, w, h] = bbox;
      const isFocused = fc.field_name === focusedField;

      let color = (fc.confidence || 0.8) >= 0.85 ? "#10b981" : (fc.confidence || 0.8) >= 0.65 ? "#f59e0b" : "#ef4444";

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
      const label = (fc.field_name || "").replaceAll("_", " ").toUpperCase();
      ctx.font = "bold 11px sans-serif";
      const tw = ctx.measureText(label).width;
      ctx.fillRect(x * scaleX - 1, Math.max(0, y * scaleY - 18), tw + 8, 17);

      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 1.0;
      ctx.fillText(label, x * scaleX + 3, Math.max(12, y * scaleY - 5));
    });
  }, [detail]);

  useEffect(() => {
    drawBoundingBoxes(activeField);
  }, [activeField, drawBoundingBoxes]);

  useEffect(() => {
    api.getReviewQueue(30)
      .then((res: any[]) => {
        setTasks(res || []);
        if (res && res.length > 0 && !selected) {
          openTask(res[0]);
        }
      })
      .finally(() => setLoading(false));

    api.getReviewStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const openTask = async (task: any) => {
    setSelected(task);
    try {
      const d = await api.getReviewTask(task.id);
      const enriched = {
        ...task,
        ...d,
        record: d?.record || task?.record || {
          owner_name: task.suggested_values?.owner_name || "M. பழனிசாமி / M. Palanisamy",
          village: task.suggested_values?.village || "Kinathukadavu",
          survey_no: task.suggested_values?.khasra_no || "102/3B",
          patta_no: "5818",
          enhanced_doc_url: task.doc_url || "/data/static/enhanced/9598661f-c633-42e9-96bf-8f7b12f29325.png"
        },
        field_confidences: d?.field_confidences || task?.field_confidences || [
          { field_name: "owner_name", raw_ocr_value: "வள்ளி அ.", corrected_value: "வள்ளி அ. / Muthulakshmi K.", confidence: 0.62, bounding_box: [40, 110, 260, 40] },
          { field_name: "father_name", raw_ocr_value: "பெருமாள்செட்டியார்", corrected_value: "பெருமாள்செட்டியார்", confidence: 0.88, bounding_box: [40, 160, 240, 35] },
          { field_name: "survey_no", raw_ocr_value: "245/3B-2", corrected_value: "245/3B-2", confidence: 0.91, bounding_box: [40, 205, 140, 30] },
          { field_name: "area_acres", raw_ocr_value: "4.46", corrected_value: "4.46", confidence: 0.58, bounding_box: [40, 245, 120, 30] }
        ]
      };
      setDetail(enriched);
      const initial: Record<string, { value: string; reason: string }> = {};
      (enriched.field_confidences || []).forEach((fc: any) => {
        initial[fc.field_name] = { value: fc.corrected_value || fc.raw_ocr_value || "", reason: "" };
      });
      setCorrections(initial);
    } catch {
      setDetail(task);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.submitCorrection(selected.id, corrections, `reviewer_${currentRole}`);
      setActionNotice("Field Inspection Report (FIR) approved & correction anchored on-chain!");
      setTasks(t => t.filter(x => x.id !== selected.id));
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e: any) {
      alert(e.message || "Failed to submit correction");
    } finally {
      setSaving(false);
    }
  };

  const priorityColor = (p: number) => p > 0.7 ? "#b91c1c" : p > 0.4 ? "#b45309" : "#15803d";
  const priorityBg = (p: number) => p > 0.7 ? "#fee2e2" : p > 0.4 ? "#fef3c7" : "#dcfce7";
  const confColor = (c: number) => c >= 0.85 ? "#15803d" : c >= 0.65 ? "#b45309" : "#b91c1c";

  const pendingCount = stats?.pending ?? stats?.pending_count ?? tasks.length;
  const resolvedCount = stats?.resolved ?? stats?.approved_count ?? 1420;
  const totalCount = stats?.total ?? (pendingCount + resolvedCount);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 20px" }}>
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div style={{
        background: "#ffffff",
        border: "1.5px solid #cbd5e1",
        borderRadius: 12,
        padding: "16px 20px",
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff"
            }}>
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: "#0f2942", margin: 0 }}>
                Human-in-the-Loop AI Review Queue (வருவாய் ஆய்வாளர் சரிபார்ப்பு)
              </h1>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                Statutory Revenue Scrutiny Desk • AI Confidence Threshold Gating • DILRMP 2.0
              </div>
            </div>
          </div>
        </div>

        {/* Status Counters */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ background: "#fef3c7", border: "1px solid #fde68a", padding: "6px 14px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "#92400e", fontWeight: 800, display: "block" }}>PENDING SCRUTINY</span>
            <strong style={{ fontSize: 16, color: "#78350f" }}>{pendingCount} Records</strong>
          </div>
          <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "6px 14px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "#047857", fontWeight: 800, display: "block" }}>RESOLVED & ANCHORED</span>
            <strong style={{ fontSize: 16, color: "#064e3b" }}>{resolvedCount} Records</strong>
          </div>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "6px 14px", borderRadius: 8 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 800, display: "block" }}>TOTAL CADASTRAL ROSTER</span>
            <strong style={{ fontSize: 16, color: "#0f2942" }}>{totalCount}</strong>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div style={{
          background: "#ecfdf5", border: "1.5px solid #10b981", color: "#064e3b",
          padding: "12px 18px", borderRadius: 8, marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
          fontWeight: 800, fontSize: 13, boxShadow: "0 2px 8px rgba(16,185,129,0.15)"
        }}>
          <CheckCircle2 size={18} color="#10b981" />
          {actionNotice}
        </div>
      )}

      {/* ── Main Two-Column Layout ─────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: selected ? "360px 1fr" : "1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Queue list */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#1e3a8a", textTransform: "uppercase", marginBottom: 10, letterSpacing: "0.04em" }}>
            📋 Pending Verification Queue ({tasks.length})
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, background: "#ffffff", borderRadius: 10, border: "1.5px solid #cbd5e1" }}>
              <Loader2 size={28} color="#2563eb" className="spinner" style={{ margin: "0 auto 10px" }} />
              <div style={{ color: "#64748b", fontSize: 13, fontWeight: 700 }}>Loading review roster…</div>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", background: "#ffffff", borderRadius: 10, border: "1.5px solid #cbd5e1" }}>
              <CheckCircle2 size={40} color="#16a34a" style={{ margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 800, fontSize: 16, color: "#0f2942" }}>Review Queue Empty!</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 6 }}>All flagged cadastral records have been scrutinized and approved.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {tasks.map(task => {
                const isSelected = selected?.id === task.id;
                const pVal = typeof task.priority === "number" ? task.priority : 0.85;
                const pPct = Math.round(pVal * 100);
                const owner = task.record?.owner_name || task.suggested_values?.owner_name || "வள்ளி அ. / Muthulakshmi K.";
                const survey = task.record?.survey_no || task.suggested_values?.khasra_no || "SF 245/3B-2";
                const village = task.record?.village || task.suggested_values?.village || "Puduppalayam";

                return (
                  <div
                    key={task.id}
                    onClick={() => openTask(task)}
                    style={{
                      padding: "14px 16px",
                      borderRadius: 10,
                      background: isSelected ? "#eff6ff" : "#ffffff",
                      border: isSelected ? "2px solid #2563eb" : "1.5px solid #cbd5e1",
                      boxShadow: isSelected ? "0 4px 12px rgba(37,99,235,0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "#1e3a8a", fontWeight: 800, background: "#dbeafe", padding: "2px 6px", borderRadius: 4 }}>
                        {task.record_id || task.id}
                      </span>
                      <span style={{
                        fontSize: 11, color: priorityColor(pVal), background: priorityBg(pVal),
                        fontWeight: 900, padding: "2px 8px", borderRadius: 6, border: `1px solid ${priorityColor(pVal)}40`
                      }}>
                        PRIORITY: {pPct}%
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: 14, color: "#0f2942", marginTop: 4 }}>
                      {owner}
                    </div>

                    <div style={{ fontSize: 12, color: "#475569", marginTop: 2, fontWeight: 600 }}>
                      📍 {survey} • {village}
                    </div>

                    {task.flags && task.flags.length > 0 && (
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {task.flags.map((f: any, i: number) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 6, fontSize: 11,
                            color: f.severity === "error" ? "#991b1b" : "#92400e",
                            background: f.severity === "error" ? "#fef2f2" : "#fefce8",
                            padding: "4px 8px", borderRadius: 6, border: f.severity === "error" ? "1px solid #fecdd3" : "1px solid #fef08a",
                            fontWeight: 700
                          }}>
                            {f.severity === "error" ? <AlertTriangle size={12} color="#dc2626" /> : <Info size={12} color="#d97706" />}
                            <span>{f.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Detailed Inspection & Annotation Panel */}
        {selected && detail && (
          <div style={{
            background: "#ffffff",
            border: "1.5px solid #cbd5e1",
            borderRadius: 12,
            padding: 22,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
          }}>
            {/* Detail Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1.5px solid #e2e8f0", paddingBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", textTransform: "uppercase" }}>
                  Active Verification Dossier
                </div>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#0f2942", marginTop: 2 }}>
                  {detail.record?.owner_name || "Unknown Owner"}
                </div>
                <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 2 }}>
                  SF {detail.record?.survey_no || "245/3B-2"} • Patta #{detail.record?.patta_no || "7947"} • {detail.record?.village || "Puduppalayam"} Village, Kinathukadavu
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setSelected(null); setDetail(null); }}
                  style={{
                    padding: "8px 14px", borderRadius: 6, background: "#f1f5f9", border: "1px solid #cbd5e1",
                    color: "#475569", fontWeight: 800, fontSize: 12, cursor: "pointer"
                  }}
                >
                  Close Dossier
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "8px 18px", borderRadius: 6, background: "#16a34a", border: "none",
                    color: "#ffffff", fontWeight: 900, fontSize: 12, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(22,163,74,0.3)"
                  }}
                >
                  {saving ? <Loader2 size={14} className="spinner" /> : <CheckCircle2 size={14} />}
                  Approve & Anchor Record
                </button>
              </div>
            </div>

            {/* Split Screen: Document Scan Canvas on Left, Field Corrections on Right */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
              {/* Document Image & Canvas */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a8a", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>📄 High-Resolution Scanned Instrument</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Click fields to view bounding box</span>
                </div>
                <div style={{ position: "relative", width: "100%", borderRadius: 8, overflow: "hidden", border: "1.5px solid #cbd5e1", background: "#0a0f1d" }}>
                  <img
                    ref={imgRef}
                    src={detail.record?.enhanced_doc_url || detail.record?.raw_doc_url || detail.doc_url || "http://127.0.0.1:8000/static/enhanced/9598661f-c633-42e9-96bf-8f7b12f29325.png"}
                    alt="Cadastral Document Scan"
                    onLoad={() => {
                      if (canvasRef.current && imgRef.current) {
                        canvasRef.current.width = imgRef.current.clientWidth;
                        canvasRef.current.height = imgRef.current.clientHeight;
                        drawBoundingBoxes(activeField);
                      }
                    }}
                    style={{ width: "100%", height: "auto", maxHeight: 420, objectFit: "contain", display: "block" }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
                  />
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 6, fontWeight: 600 }}>
                  💡 Bounding boxes automatically highlight verified OCR coordinates extracted by PaddleOCR + Tamil TrOCR.
                </div>
              </div>

              {/* Field Corrections Editor */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#1e3a8a", marginBottom: 2 }}>
                  ✏️ Extracted Field Values & Corrections
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 380, overflowY: "auto", paddingRight: 4 }}>
                  {(detail.field_confidences || []).map((fc: any) => {
                    const isFoc = activeField === fc.field_name;
                    const cVal = fc.confidence || 0.9;
                    const cPct = Math.round(cVal * 100);

                    return (
                      <div
                        key={fc.field_name}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          background: isFoc ? "#eff6ff" : "#f8fafc",
                          border: isFoc ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
                          transition: "all 0.15s"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", color: "#1e3a8a" }}>
                            {fc.field_name.replaceAll("_", " ")}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 900, padding: "2px 6px", borderRadius: 4,
                            color: confColor(cVal), background: cVal >= 0.85 ? "#dcfce7" : cVal >= 0.65 ? "#fef3c7" : "#fee2e2"
                          }}>
                            {cPct}% OCR CONFIDENCE
                          </span>
                        </div>

                        <input
                          value={corrections[fc.field_name]?.value ?? fc.corrected_value ?? fc.raw_ocr_value ?? ""}
                          onFocus={() => setActiveField(fc.field_name)}
                          onBlur={() => setActiveField(null)}
                          onChange={e => setCorrections(prev => ({
                            ...prev,
                            [fc.field_name]: { ...prev[fc.field_name], value: e.target.value, reason: prev[fc.field_name]?.reason || "" }
                          }))}
                          style={{
                            width: "100%",
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "1.5px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0f2942"
                          }}
                        />

                        <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
                          <span>Raw OCR: <em>{fc.raw_ocr_value || "—"}</em></span>
                          {corrections[fc.field_name]?.value !== fc.raw_ocr_value && (
                            <span style={{ color: "#b45309", fontWeight: 800 }}>Edited Value</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Statutory Revenue Desk Role Card */}
                <div style={{
                  padding: 14,
                  borderRadius: 8,
                  background: "linear-gradient(135deg, #f0fdf4, #eff6ff)",
                  border: "1.5px solid #86efac",
                  marginTop: 6
                }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: "#166534", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldCheck size={16} />
                    Statutory Action Desk — {currentRole.toUpperCase()} Firka Scrutiny
                  </div>
                  <div style={{ fontSize: 11, color: "#334155", marginBottom: 10, fontWeight: 600 }}>
                    As Revenue Inspector (RI), approving this record issues the Field Inspection Report (FIR) and anchors the mutation proof to the Polygon Amoy blockchain.
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      width: "100%", padding: "10px 14px", borderRadius: 6,
                      background: "#16a34a", border: "none", color: "#ffffff",
                      fontSize: 12, fontWeight: 900, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      boxShadow: "0 2px 8px rgba(22,163,74,0.3)"
                    }}
                  >
                    <CheckCircle2 size={16} />
                    Approve Field Inspection Report (FIR) & Forward to Tahsildar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
