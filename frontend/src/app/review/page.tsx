"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ClipboardCheck, AlertTriangle, Info, CheckCircle2, Loader2, ChevronRight } from "lucide-react";

export default function ReviewPage() {
  const [tasks, setTasks]         = useState<any[]>([]);
  const [selected, setSelected]   = useState<any>(null);
  const [detail, setDetail]       = useState<any>(null);
  const [corrections, setCorrections] = useState<Record<string, { value: string; reason: string }>>({});
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [stats, setStats]         = useState<any>(null);

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
              {/* Document */}
              {detail.record?.enhanced_doc_url && (
                <div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>Document</div>
                  <img src={detail.record.enhanced_doc_url} alt="document"
                    style={{ width: "100%", borderRadius: 8, maxHeight: 300, objectFit: "contain", background: "#0a0e1a" }} />
                </div>
              )}

              {/* Field corrections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "auto", maxHeight: 420 }}>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 4 }}>
                  Field Corrections — edit incorrect values below
                </div>
                {detail.field_confidences?.map((fc: any) => (
                  <div key={fc.field_name} style={{
                    padding: 12, borderRadius: 10,
                    background: fc.confidence < 0.65 ? "rgba(239,68,68,0.06)" : "rgba(16,185,129,0.04)",
                    border: `1px solid ${fc.confidence < 0.65 ? "rgba(239,68,68,0.2)" : "var(--color-border)"}`,
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
