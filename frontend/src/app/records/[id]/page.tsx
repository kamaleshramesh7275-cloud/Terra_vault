"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  ShieldCheck, ShieldAlert, Shield, ExternalLink, CheckCircle2,
  AlertTriangle, Info, Loader2, ChevronLeft, Anchor
} from "lucide-react";
import Link from "next/link";

const CONF_BAR = ({ value }: { value: number }) => {
  const c = value >= 0.85 ? "#10b981" : value >= 0.65 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${(value || 0) * 100}%`, background: c }} />
      </div>
      <span style={{ color: c, fontSize: 12, fontWeight: 700, minWidth: 36 }}>
        {value ? `${(value * 100).toFixed(0)}%` : "—"}
      </span>
    </div>
  );
};

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [record, setRecord] = useState<any>(null);
  const [fields, setFields]   = useState<any[]>([]);
  const [verify, setVerify]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anchoring, setAnchoring] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getRecord(id);
        setRecord(data);
        setFields(data.field_confidences || []);
        const v = await api.verifyBlockchain(id);
        setVerify(v);
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleAnchor = async () => {
    setAnchoring(true);
    try {
      await api.anchorRecord(id, "admin");
      const v = await api.verifyBlockchain(id);
      setVerify(v);
    } catch {}
    setAnchoring(false);
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <Loader2 size={32} color="#10b981" className="spinner" style={{ margin: "0 auto 16px" }} />
      <div style={{ color: "var(--color-text-muted)" }}>Loading record…</div>
    </div>
  );
  if (!record) return <div style={{ padding: 40, color: "var(--color-text-muted)" }}>Record not found.</div>;

  const verifyStatus = verify?.status || "NOT_ANCHORED";

  const FIELDS_DISPLAY = [
    { key: "owner_name",       label: "Owner Name" },
    { key: "father_name",      label: "Father's Name" },
    { key: "khasra_no",        label: "Khasra No." },
    { key: "khata_no",         label: "Khata No." },
    { key: "survey_no",        label: "Survey No." },
    { key: "village",          label: "Village" },
    { key: "tehsil",           label: "Tehsil" },
    { key: "district",         label: "District" },
    { key: "state",            label: "State" },
    { key: "area_value",       label: "Area" },
    { key: "land_type",        label: "Land Type" },
    { key: "mutation_no",      label: "Mutation No." },
    { key: "transaction_type", label: "Transaction" },
  ];

  return (
    <div>
      <Link href="/records" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13,
          color: "var(--color-text-muted)", marginBottom: 20, cursor: "pointer" }}>
          <ChevronLeft size={15} /> Back to Records
        </div>
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 700 }}>
            {record.owner_name || "Unnamed Record"}
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
            {record.village && `${record.village}, `}{record.district && `${record.district}, `}{record.state}
            {record.khasra_no && ` • Khasra: ${record.khasra_no}`}
          </p>
        </div>

        {/* Blockchain badge */}
        <div style={{ textAlign: "right" }}>
          <div className={`blockchain-badge ${
            verifyStatus === "VERIFIED" ? "blockchain-verified" :
            verifyStatus === "TAMPERED" ? "blockchain-tampered" : "blockchain-not-anchored"
          }`}>
            {verifyStatus === "VERIFIED"    && <><ShieldCheck size={15} /> Blockchain Verified</>}
            {verifyStatus === "TAMPERED"    && <><ShieldAlert size={15} /> TAMPERED</>}
            {verifyStatus === "NOT_ANCHORED"&& <><Shield size={15} /> Not Anchored</>}
            {verifyStatus === "NOT_CONFIGURED" && <><Shield size={15} /> Blockchain Off</>}
          </div>
          {verify?.tx_hash && (
            <a href={`https://amoy.polygonscan.com/tx/${verify.tx_hash}`} target="_blank"
              style={{ fontSize: 11, color: "var(--color-primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 6 }}>
              View on PolygonScan <ExternalLink size={11} />
            </a>
          )}
          {verifyStatus === "NOT_ANCHORED" && record.status === "verified" && (
            <button onClick={handleAnchor} className="btn-primary" style={{ marginTop: 10, fontSize: 12, padding: "7px 14px" }}>
              {anchoring ? <Loader2 size={12} className="spinner" /> : <Anchor size={12} />} Anchor to Polygon
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Document preview */}
        <div className="glass-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "var(--color-text-muted)" }}>
            Enhanced Document
          </div>
          {record.enhanced_doc_url ? (
            <img src={record.enhanced_doc_url} alt="enhanced document"
              style={{ width: "100%", borderRadius: 8, maxHeight: 360, objectFit: "contain", background: "#0a0e1a" }} />
          ) : (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--color-text-muted)", fontSize: 13 }}>No preview available</div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 12, fontSize: 11, color: "var(--color-text-muted)" }}>
            <span>Script: <strong style={{ color: "#a5b4fc" }}>{record.detected_script || "—"}</strong></span>
            <span>Quality: <strong style={{ color: "#10b981" }}>{record.quality_score ? `${(record.quality_score*100).toFixed(0)}%` : "—"}</strong></span>
          </div>
        </div>

        {/* Extracted fields */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Extracted Fields
            <span style={{ marginLeft: 10, fontSize: 11, color: "var(--color-text-muted)" }}>
              Overall: <span style={{ color: "#10b981", fontWeight: 700 }}>
                {record.overall_confidence ? `${(record.overall_confidence*100).toFixed(0)}%` : "—"}
              </span>
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FIELDS_DISPLAY.map(({ key, label }) => {
              const fc = fields.find(f => f.field_name === key);
              const value = key === "area_value"
                ? (record[key] ? `${record[key]} ${record.area_unit || ""}` : null)
                : record[key];
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 500 }}>{label}</span>
                    {fc?.is_corrected && (
                      <span style={{ fontSize: 10, color: "#10b981" }}>✓ Human verified</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                    {value || <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>Not detected</span>}
                  </div>
                  {fc && <CONF_BAR value={fc.confidence} />}
                  {fc?.flags?.map((flag: any, i: number) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6,
                      fontSize: 11, marginTop: 4, color: flag.severity === "error" ? "#fca5a5" : "#fcd34d" }}>
                      {flag.severity === "error" ? <AlertTriangle size={10} /> : <Info size={10} />}
                      {flag.reason}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
