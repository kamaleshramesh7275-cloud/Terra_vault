"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Users, Search, ShieldCheck, Shield, ShieldAlert, ExternalLink, Loader2 } from "lucide-react";

export default function CitizenPage() {
  const [name, setName]         = useState("");
  const [khasra, setKhasra]     = useState("");
  const [village, setVillage]   = useState("");
  const [results, setResults]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params: any = { page: 1, page_size: 10 };
      if (name)   params.q = name;
      if (village) params.village = village;
      const data = await api.listRecords(params);
      setResults(data.records || []);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <div style={{ maxWidth: 780, margin: "0 auto" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
          <Users size={22} style={{ display: "inline", marginRight: 10 }} />
          Citizen Land Record Lookup
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
          Search for your land record and verify its authenticity on the blockchain
        </p>
      </div>

      {/* Search form */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
        <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6, fontWeight: 500 }}>
                Owner Name
              </label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6, fontWeight: 500 }}>
                Khasra / Survey No.
              </label>
              <input className="input" value={khasra} onChange={e => setKhasra(e.target.value)}
                placeholder="e.g. 245/1" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6, fontWeight: 500 }}>
                Village
              </label>
              <input className="input" value={village} onChange={e => setVillage(e.target.value)}
                placeholder="e.g. Sultanpur" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ alignSelf: "flex-start" }}>
            <Search size={15} /> Search Records
          </button>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Loader2 size={28} color="#10b981" className="spinner" style={{ margin: "0 auto 12px" }} />
          <div style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Searching records…</div>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="glass-card" style={{ padding: 40, textAlign: "center" }}>
          <Search size={32} color="var(--color-text-muted)" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No records found</div>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            Try different search terms. Records may still be processing.
          </p>
        </div>
      )}

      {results.map(r => (
        <div key={r.id} className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{r.owner_name || "Unknown"}</div>
              <div style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 4 }}>
                {r.village && `${r.village}, `}{r.tehsil && `${r.tehsil}, `}{r.district}
              </div>
            </div>
            <div className={`blockchain-badge ${
              r.blockchain_anchored ? "blockchain-verified" : "blockchain-not-anchored"
            }`}>
              {r.blockchain_anchored ? <><ShieldCheck size={14} /> Blockchain Verified</> : <><Shield size={14} /> Not Anchored</>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
            {[
              ["Khasra No.", r.khasra_no],
              ["Khata No.", r.khata_no],
              ["Area", r.area_value ? `${r.area_value} ${r.area_unit || ""}` : null],
              ["Land Type", r.land_type],
              ["Mutation No.", r.mutation_no],
              ["Transaction", r.transaction_type],
              ["Script", r.detected_script],
              ["Status", r.status],
            ].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{val || "—"}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <a href={`/records/${r.id}`} className="btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
              View Full Record
            </a>
            <button className="btn-secondary" style={{ fontSize: 12, padding: "7px 16px" }}>
              Request Correction
            </button>
          </div>
        </div>
      ))}

      {/* How it works */}
      <div className="glass-card" style={{ padding: 24, marginTop: 28 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>How Blockchain Verification Works</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["1", "When a record is verified by a government officer, a cryptographic hash (SHA3-256) is computed from all the field values."],
            ["2", "This hash — not the actual data — is anchored to the Polygon blockchain, creating a tamper-evident timestamp."],
            ["3", "Anyone can recompute the hash from the current record and compare it with the on-chain value to detect any alteration."],
            ["4", "If the hashes match: ✅ VERIFIED. If they differ: 🚨 TAMPERED — legally actionable evidence of tampering."],
          ].map(([n, text]) => (
            <div key={n} style={{ display: "flex", gap: 12, fontSize: 13 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(16,185,129,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "#10b981", flexShrink: 0 }}>{n}</div>
              <span style={{ color: "var(--color-text-dim)", lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
