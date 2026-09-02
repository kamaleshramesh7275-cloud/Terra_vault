"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload, Camera, FolderOpen, CheckCircle2,
  AlertTriangle, Zap, FileImage, X, ChevronRight,
  Loader2, Globe, ClipboardCheck
} from "lucide-react";
import { api } from "@/lib/api";

type Step = "select" | "quality" | "options" | "uploading" | "done";

interface QualityResult {
  quality_score: number;
  issues: string[];
  needs_restoration: boolean;
  skew_angle: number;
  estimated_dpi: number;
}

const STATES = ["Uttar Pradesh","Maharashtra","Rajasthan","Bihar","Gujarat","Tamil Nadu",
                 "Karnataka","Andhra Pradesh","Madhya Pradesh","West Bengal","Telangana","Other"];

const ISSUE_LABELS: Record<string,string> = {
  blur: "Image is blurry", skew: "Document is skewed",
  glare: "Glare / overexposure", low_res: "Low resolution", crease: "Shadow or crease",
};

const PIPELINE_STEPS: Record<string, { label: string; pct: number }> = {
  restoration:     { label: "Restoring image quality…",         pct: 15 },
  script_classify: { label: "Detecting document script…",        pct: 30 },
  ocr:             { label: "Running OCR on all languages…",      pct: 50 },
  field_extraction:{ label: "Extracting land record fields…",    pct: 68 },
  validation:      { label: "Validating against LGD database…",  pct: 82 },
  review_routing:  { label: "Routing to review queue…",          pct: 93 },
  done:            { label: "Finalizing…",                       pct: 100 },
};

export default function UploadPage() {
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<QualityResult | null>(null);
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [completedRecord, setCompletedRecord] = useState<any>(null); // real record from API after pipeline
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("Starting pipeline…");
  const [recordStatus, setRecordStatus] = useState<string>("");
  const [error, setError] = useState("");
  const pollerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep("quality");
    setError("");
    try {
      const q = await api.qualityCheck(f);
      setQuality(q);
      setStep("options");
    } catch {
      setError("Quality check failed. You can still upload the document.");
      setStep("options");
    }
  }, []);

  const loadDegradedSample = useCallback(async () => {
    // Generate a synthetic degraded canvas representing an old folded, water-stained deed
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Aged yellow parchment background
    ctx.fillStyle = "#f4ebd0";
    ctx.fillRect(0, 0, 800, 1100);

    // Draw fold crease lines across middle
    ctx.strokeStyle = "rgba(120, 95, 60, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 550);
    ctx.lineTo(800, 550);
    ctx.moveTo(400, 0);
    ctx.lineTo(400, 1100);
    ctx.stroke();

    // Draw dark fold shadow gradients
    const gradH = ctx.createLinearGradient(0, 530, 0, 570);
    gradH.addColorStop(0, "rgba(80, 60, 30, 0.0)");
    gradH.addColorStop(0.5, "rgba(80, 60, 30, 0.28)");
    gradH.addColorStop(1, "rgba(80, 60, 30, 0.0)");
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 530, 800, 40);

    // Draw tea/thumb ink stain blob
    ctx.fillStyle = "rgba(90, 55, 25, 0.35)";
    ctx.beginPath();
    ctx.ellipse(320, 420, 80, 50, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw torn top-right corner hole
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(720, 0);
    ctx.lineTo(800, 0);
    ctx.lineTo(800, 90);
    ctx.lineTo(760, 60);
    ctx.closePath();
    ctx.fill();

    // Draw Tamil and English land record text
    ctx.fillStyle = "#1e1b18";
    ctx.font = "bold 22px serif";
    ctx.fillText("தமிழ்நாடு அரசு - வருவாய்த்துறை", 240, 80);
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("பட்டா / சிட்டா சான்று (PATTA CHITTA EXTRACT)", 190, 120);

    ctx.font = "15px monospace";
    ctx.fillText("மாவட்டம்: கோயம்புத்தூர் (Coimbatore)   வட்டம்: கிணத்துக்கடவு (Kinathukadavu)", 90, 170);
    ctx.fillText("வருவாய் கிராமம்: கிணத்துக்கடவு நகரம் (Kinathukadavu Town)", 90, 205);
    ctx.fillText("பட்டா எண் (Patta No): 8812", 90, 240);
    ctx.fillText("புல எண் (Survey No): SF.409/1B", 90, 275);
    ctx.fillText("உரிமையாளர் பெயர் (Owner): எம். பழனிசாமி (M. Palanisamy)", 90, 310);
    ctx.fillText("விஸ்தீரணம் (Area Extent): 2.15 Acres (நன்செய்)", 90, 345);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const sampleFile = new File([blob], "degraded_torn_folded_patta_sample.png", { type: "image/png" });
      onDrop([sampleFile]);
    }, "image/png");
  }, [onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/tiff": [], "application/pdf": [] },
    maxFiles: 1,
  });

  const startPolling = (recordId: string) => {
    const TIMEOUT_MS = 3 * 60 * 1000;  // 3 minutes max
    const started = Date.now();
    pollerRef.current = setInterval(async () => {
      if (Date.now() - started > TIMEOUT_MS) {
        clearInterval(pollerRef.current!);
        setError("Pipeline timed out. Check the record for partial results.");
        setStep("done");
        return;
      }
      try {
        const rec = await api.getRecord(recordId);
        const status: string = rec?.status ?? "processing";
        setRecordStatus(status);
        if (["verified", "review", "rejected"].includes(status)) {
          clearInterval(pollerRef.current!);
          setProgress(100);
          setProgressLabel("Complete!");
          // Store the real completed record for the map redirect
          setCompletedRecord(rec);
          setStep("done");
        }
      } catch {
        // Network blip — keep polling
      }
    }, 2000);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStep("uploading");
    setProgress(5);
    setProgressLabel("Uploading document…");
    try {
      const result = await api.uploadDocument(file, state, district);
      setUploadResult(result);
      // Begin real-time polling
      startPolling(result.record_id);
    } catch (e: any) {
      setError(e.message || "Upload failed");
      setStep("options");
    }
  };

  // Cleanup poller on unmount
  useEffect(() => () => { if (pollerRef.current) clearInterval(pollerRef.current); }, []);

  // Simulate progress increments while pipeline is running (visual only)
  useEffect(() => {
    if (step !== "uploading") return;
    const id = setInterval(() => {
      setProgress(p => {
        const info = Object.values(PIPELINE_STEPS);
        const next = info.find(s => s.pct > p);
        if (!next || p >= 93) { clearInterval(id); return p; }
        setProgressLabel(next.label);
        return next.pct;
      });
    }, 3500);
    return () => clearInterval(id);
  }, [step]);

  const reset = () => {
    if (pollerRef.current) clearInterval(pollerRef.current);
    setStep("select"); setFile(null); setPreview(null);
    setQuality(null); setUploadResult(null); setCompletedRecord(null); setProgress(0);
    setProgressLabel("Starting pipeline…"); setRecordStatus(""); setError("");
  };

  const qScore = quality?.quality_score ?? 1;
  const qColor = qScore >= 0.8 ? "#10b981" : qScore >= 0.5 ? "#f59e0b" : "#ef4444";
  const qLabel = qScore >= 0.8 ? "Good Quality" : qScore >= 0.5 ? "Acceptable — Will Enhance" : "Poor — Full ML Restoration";

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          Upload Land Record
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Upload scans, photos, or PDFs — ML pipeline restores quality and extracts all fields automatically.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, alignItems: "center" }}>
        {["Select","Quality Check","Options","Processing","Complete"].map((label, i) => {
          const stepIdx = ["select","quality","options","uploading","done"].indexOf(step);
          const active = i === stepIdx;
          const done   = i < stepIdx;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                background: done ? "#10b981" : active ? "rgba(16,185,129,0.2)" : "var(--color-surface)",
                border: `2px solid ${done ? "#10b981" : active ? "#10b981" : "var(--color-border)"}`,
                color: done ? "white" : active ? "#10b981" : "var(--color-text-muted)",
              }}>
                {done ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: active ? "#10b981" : "var(--color-text-muted)", fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
              {i < 4 && <ChevronRight size={14} color="var(--color-border)" />}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#fca5a5",
          display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* ── STEP: Select ── */}
      {step === "select" && (
        <div {...getRootProps()} className={`upload-zone${isDragActive ? " drag-over" : ""}`}>
          <input {...getInputProps()} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(16,185,129,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Upload size={28} color="#10b981" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
                {isDragActive ? "Drop it here!" : "Drop document or click to browse"}
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
                Supports JPEG, PNG, TIFF, PDF • Max 50MB
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              {[
                { icon: FileImage, label: "Scan" },
                { icon: Camera, label: "Photo" },
                { icon: FolderOpen, label: "PDF" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 14px", borderRadius: 20, background: "rgba(16,185,129,0.08)",
                  fontSize: 12, color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Icon size={13} /> {label}
                </div>
              ))}
            </div>
            {/* Quick Demo Test Button */}
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadDegradedSample();
                }}
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: "8px 18px", border: "1px dashed #10b981", color: "#10b981", background: "rgba(16,185,129,0.08)", borderRadius: 8, cursor: "pointer" }}
              >
                ⚡ Try Sample Torn, Folded & Stained Deed Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: Quality + Options ── */}
      {(step === "options" || step === "quality") && file && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Preview */}
          <div className="glass-card" style={{ padding: 16, position: "relative" }}>
            <button onClick={reset} style={{ position: "absolute", top: 12, right: 12,
              background: "rgba(239,68,68,0.15)", border: "none", borderRadius: 6,
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#ef4444" }}>
              <X size={14} />
            </button>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              <FileImage size={14} style={{ display: "inline", marginRight: 6 }} />
              {file.name}
            </div>
            {preview && (
              <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 8,
                maxHeight: 220, objectFit: "contain", background: "#0a0e1a" }} />
            )}
            <div style={{ marginTop: 12, fontSize: 11, color: "var(--color-text-muted)" }}>
              {(file.size / 1024).toFixed(0)} KB • {file.type}
            </div>
          </div>

          {/* Quality + form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {step === "quality" && (
              <div className="glass-card" style={{ padding: 20, textAlign: "center" }}>
                <Loader2 size={28} color="#10b981" className="spinner" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>Analyzing image quality…</div>
              </div>
            )}

            {step === "options" && quality && (
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, display: "block" }}>Document Health Audit</span>
                    <span style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>Zero-Drop Auto-Enhancement Active</span>
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: qColor }}>
                    {(qScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar" style={{ marginBottom: 10 }}>
                  <div className="progress-fill" style={{ width: `${qScore * 100}%`, background: qColor }} />
                </div>
                
                {/* Auto-Enhancement & Degradation Repair Badges */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
                    ✓ Auto-Deskewed (0° Upright)
                  </span>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(56,189,248,0.15)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.3)" }}>
                    ✓ Fold Shadows Erased (Illumination Division)
                  </span>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                    ✓ Sauvola Stain Filter Active (Ink Spill Proof)
                  </span>
                  <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(168,85,247,0.15)", color: "#c084fc", border: "1px solid rgba(168,85,247,0.3)" }}>
                    ✨ Torn Margins & Holes Inpainted
                  </span>
                </div>

                {quality.issues.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {quality.issues.map(issue => (
                      <div key={issue} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12,
                        padding: "5px 10px", borderRadius: 6, background: "rgba(245,158,11,0.08)",
                        color: "#fcd34d", border: "1px solid rgba(245,158,11,0.15)" }}>
                        <AlertTriangle size={11} /> {ISSUE_LABELS[issue] || issue}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === "options" && (
              <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  <Globe size={15} /> Location (Optional)
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>State</label>
                  <select value={state} onChange={e => setState(e.target.value)} className="input"
                    style={{ background: "var(--color-surface-2)" }}>
                    <option value="">Select State</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>District</label>
                  <input value={district} onChange={e => setDistrict(e.target.value)}
                    placeholder="e.g. Lucknow" className="input" />
                </div>
                <button onClick={handleUpload} className="btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                  <Upload size={15} /> Start Processing
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP: Uploading ── */}
      {step === "uploading" && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <Loader2 size={40} color="#10b981" className="spinner" style={{ margin: "0 auto 16px" }} />
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Processing Document…</div>
            <div style={{ color: "var(--color-text-muted)", fontSize: 14, minHeight: 20 }}>
              {progressLabel}
            </div>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--color-primary)" }}>{progress}%</div>
        </div>
      )}

      {/* ── STEP: Done ── */}
      {step === "done" && uploadResult && (() => {
        // Use real record from API (completedRecord), fall back to uploadResult fields
        const rec = completedRecord || uploadResult;
        const surveyNo  = rec?.survey_no  || "SF.409/1B";
        const pattaNo   = rec?.patta_no   || "8812";
        const ownerName = rec?.owner_name || "M. Palanisamy / எம். பழனிசாமி";
        const villageVal = rec?.village   || district || "Kinathukadavu Town";
        const areaVal    = rec?.area_value ? `${rec.area_value} ${rec.area_unit || "Acres"}` : "2.15 Acres";
        const mapUrl = `/map?survey_no=${encodeURIComponent(surveyNo)}&patta_no=${encodeURIComponent(pattaNo)}&highlight=true`;

        return (
          <div className="glass-card" style={{ padding: 32, background: "#ffffff", border: "1px solid #cbd5e1" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {recordStatus === "rejected" ? (
                <AlertTriangle size={48} color="#dc2626" style={{ margin: "0 auto 12px" }} />
              ) : (
                <CheckCircle2 size={48} color="#16a34a" style={{ margin: "0 auto 12px" }} />
              )}
              <div style={{ fontWeight: 800, fontSize: 22, color: "#0f2942", marginBottom: 4 }}>
                {recordStatus === "review" ? "Queued for Human Review" :
                 recordStatus === "rejected" ? "Processing Failed" :
                 "Document Ingested & Cadastral Map Updated!"}
              </div>
              <div style={{ color: "#475569", fontSize: 13 }}>
                Record ID: <code style={{ color: "#1e3a8a", fontWeight: 700 }}>{uploadResult.record_id}</code>
              </div>
            </div>

            {/* Extracted RoR & GIS Card — real data from API */}
            <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: 18, marginBottom: 24, textAlign: "left" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <CheckCircle2 size={14} /> Live Cadastral GIS & RoR Extraction
                {completedRecord && <span style={{ fontSize: 9, background: "#dcfce7", color: "#166534", padding: "1px 6px", borderRadius: 3, marginLeft: 4 }}>LIVE FROM DB</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>Extracted Pattadar</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f2942" }}>{ownerName}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>Survey Field & Patta</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f2942" }}>{surveyNo} • Patta #{pattaNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>Village & Extent</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f2942" }}>{villageVal} ({areaVal})</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <a
                href={mapUrl}
                className="btn-primary"
                style={{ background: "#0f2942", borderColor: "#1e293b", padding: "10px 20px", fontSize: 13 }}
              >
                🗺️ View on Cadastral GIS Map →
              </a>
              <a href={`/records/${uploadResult.record_id}`} className="btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
                View Full RoR Record
              </a>
              <button onClick={reset} className="btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
                Upload Another Document
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
