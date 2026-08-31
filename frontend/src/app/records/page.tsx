"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Filter, Download, ChevronRight, CheckCircle2, Clock, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

const STATUS_BADGE: Record<string, string> = {
  processing: "badge badge-processing",
  review:     "badge badge-review",
  verified:   "badge badge-verified",
  disputed:   "badge badge-disputed",
  rejected:   "badge badge-rejected",
};

const CONF_CLASS = (c: number) =>
  c >= 0.85 ? "conf-high" : c >= 0.65 ? "conf-medium" : "conf-low";

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 15 };
      if (search) params.q = search;
      if (status) params.status = status;
      const data = await api.listRecords(params);
      setRecords(data.records);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const totalPages = Math.ceil(total / 15);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Land Records</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          {total.toLocaleString()} records — search, filter, and inspect extracted fields
        </p>
      </div>

      {/* Search + filter bar */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", gap: 10 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search owner, khasra no., village…"
              style={{ paddingLeft: 38 }} />
          </div>
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="input" style={{ width: 160, background: "var(--color-surface-2)" }}>
          <option value="">All Status</option>
          {["processing","review","verified","disputed","rejected"].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
          ))}
        </select>
        <button className="btn-secondary"><Download size={15} /> Export</button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Loader2 size={28} color="#10b981" className="spinner" style={{ margin: "0 auto 12px" }} />
            <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Loading records…</div>
          </div>
        ) : records.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "var(--color-text-muted)", fontSize: 14 }}>
            No records found. <Link href="/upload" style={{ color: "#10b981" }}>Upload the first one →</Link>
          </div>
        ) : (
          <table className="tv-table">
            <thead>
              <tr>
                <th>Owner / Khasra</th>
                <th>Location</th>
                <th>Area</th>
                <th>Script</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Blockchain</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.owner_name || "—"}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11, marginTop: 2 }}>
                      Khasra: {r.khasra_no || "—"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{r.village || "—"}</div>
                    <div style={{ color: "var(--color-text-muted)", fontSize: 11 }}>{r.district}</div>
                  </td>
                  <td>
                    {r.area_value ? `${r.area_value} ${r.area_unit || ""}` : "—"}
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10,
                      background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }}>
                      {r.detected_script || "—"}
                    </span>
                  </td>
                  <td>
                    <span className={CONF_CLASS(r.overall_confidence || 0)} style={{ fontWeight: 700 }}>
                      {r.overall_confidence ? `${(r.overall_confidence * 100).toFixed(0)}%` : "—"}
                    </span>
                  </td>
                  <td><span className={STATUS_BADGE[r.status] || "badge"}>{r.status}</span></td>
                  <td>
                    {r.blockchain_anchored ? (
                      <span style={{ color: "#10b981", fontSize: 12 }}>⛓ Anchored</span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)", fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/records/${r.id}`}>
                      <button style={{ background: "none", border: "none", cursor: "pointer",
                        color: "var(--color-primary)", display: "flex", alignItems: "center" }}>
                        <ChevronRight size={16} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 34, height: 34, borderRadius: 8, border: "none", cursor: "pointer",
                background: p === page ? "#10b981" : "var(--color-surface-2)",
                color: p === page ? "white" : "var(--color-text-muted)",
                fontWeight: p === page ? 700 : 400, fontSize: 13 }}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
