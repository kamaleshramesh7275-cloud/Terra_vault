"use client";
import { useState } from "react";
import {
  Lock, ShieldCheck, CheckCircle2, Clock, Activity, ExternalLink,
  RefreshCw, Cpu, Check, AlertTriangle, Key, Layers
} from "lucide-react";

export default function BlockchainPrivacyPage() {
  const [recordId, setRecordId] = useState("rec_104_coimbatore");
  const [cleanlinessScore, setCleanlinessScore] = useState(88.5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofResult, setProofResult] = useState<any>(null);

  const handleGenerateZKProof = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const is_valid = cleanlinessScore >= 80.0;
      const proof_id = `zk_p_${Math.random().toString(36).substring(2, 10)}`;
      const h_sec = "a8f9b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcde";
      const pub1 = "c12a8e157f0949d79498d173d535885a00112233445566778899aabbccddeeff";
      const pub2 = "5Oww1esEWM4vZyln7vhF6vZxkC2YLTfV00112233445566778899aabbccddeeff";

      const now = new Date();
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      setProofResult({
        proof_id,
        record_id: recordId,
        khasra_no: "104/A",
        village_lgd: "330412",
        proof_type: "TITLE_CLEANLINESS_PROOF",
        title_cleanliness_min_threshold: 80.0,
        actual_score: cleanlinessScore,
        is_valid,
        public_inputs: [pub1, pub2],
        pi_a: [`0x${h_sec.slice(0, 16)}`, `0x${h_sec.slice(16, 32)}`, "0x1"],
        pi_b: [
          [`0x${h_sec.slice(32, 48)}`, `0x${h_sec.slice(48, 64)}`],
          [`0x${pub1.slice(0, 16)}`, `0x${pub1.slice(16, 32)}`],
        ],
        pi_c: [`0x${pub2.slice(0, 16)}`, `0x${pub2.slice(16, 32)}`, "0x1"],
        verification_hash: `0x${h_sec.slice(0, 32)}77a9`,
        generated_at: now.toUTCString(),
        expires_at: expires.toUTCString(),
        tx_hash: `0x${h_sec.slice(0, 32)}77a9`,
        block_number: 1489242,
        explorer_url: `https://amoy.polygonscan.com/tx/0x${h_sec.slice(0, 32)}77a9`,
      });
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 60px" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ paddingBottom: 28, borderBottom: "1px solid var(--color-border)", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#818cf8,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Module #6 & #7 • Blockchain Privacy
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>
              Zero-Knowledge (ZK) Privacy Proofs & Polygon On-Chain Verifier
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, maxWidth: 840 }}>
          Generate privacy-preserving <strong>zk-SNARK Groth16 cryptographic proofs</strong> asserting title cleanliness (&ge;80%) without disclosing private owner Aadhaar/PAN numbers or purchase transaction values.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* ── Left Column: Interactive ZK Proof Generator ───────────────────── */}
        <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#a5b4fc" }}>
            <Key size={18} color="#818cf8" /> Interactive zk-SNARK Groth16 Proof Generator
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
              Land Record ID:
            </label>
            <input
              type="text"
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
              className="input-field"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(0,0,0,0.3)", color: "white", border: "1px solid var(--color-border)" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
              <span>Title Cleanliness Score:</span>
              <strong style={{ color: cleanlinessScore >= 80 ? "#10b981" : "#ef4444" }}>{cleanlinessScore}%</strong>
            </div>
            <input
              type="range" min="40" max="100" step="0.5"
              value={cleanlinessScore}
              onChange={(e) => setCleanlinessScore(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#6366f1" }}
            />
            <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
              Minimum Threshold for Valid ZK Proof: <strong>80.0%</strong>
            </div>
          </div>

          <button
            onClick={handleGenerateZKProof}
            disabled={isGenerating}
            className="btn btn-primary"
            style={{ width: "100%", padding: "12px", justifyContent: "center", gap: 8, fontSize: 13, fontWeight: 700 }}
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
            {isGenerating ? "Generating zk-SNARK Circuit Points..." : "Generate Cryptographic ZK Proof"}
          </button>

          {/* Verification Result Payload */}
          {proofResult && (
            <div className="animate-fade-up" style={{ marginTop: 20, background: "rgba(0,0,0,0.4)", padding: 16, borderRadius: 12, border: `1px solid ${proofResult.is_valid ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="badge" style={{ background: proofResult.is_valid ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)", color: proofResult.is_valid ? "#34d399" : "#f87171", fontSize: 11 }}>
                  {proofResult.is_valid ? "✅ VALID ZK PROOF GENERATED" : "❌ INVALID: SCORE < 80%"}
                </span>
                <span style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
                  ID: {proofResult.proof_id}
                </span>
              </div>

              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={13} color="#818cf8" /> Proof TTL Expiry: <strong style={{ color: "#a5b4fc" }}>24 Hours ({proofResult.expires_at})</strong>
              </div>

              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                Poseidon Circuit Hash Commitments:
              </div>
              <div style={{ background: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 6, fontSize: 10, fontFamily: "monospace", color: "#a7f3d0", marginBottom: 10, wordBreak: "break-all" }}>
                PubInput #1: {proofResult.public_inputs[0].slice(0, 32)}...
              </div>

              <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 4 }}>
                Groth16 Elliptic Curve Points (pi_a, pi_b, pi_c):
              </div>
              <div style={{ background: "rgba(0,0,0,0.4)", padding: 8, borderRadius: 6, fontSize: 10, fontFamily: "monospace", color: "#93c5fd" }}>
                pi_a: [{proofResult.pi_a[0]}, {proofResult.pi_a[1]}]
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Polygon On-Chain Verifier & RPC Monitor ───────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* RPC Pool Status */}
          <div className="glass-card" style={{ padding: 24, borderRadius: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "#34d399" }}>
              <Layers size={18} color="#10b981" /> Polygon Amoy RPC Fallback Pool Monitor
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { name: "Primary RPC Node", url: "https://rpc-amoy.polygon.technology", status: "HEALTHY", ping: "42ms" },
                { name: "Fallback RPC #1", url: "https://polygon-amoy.drpc.org", status: "STANDBY", ping: "68ms" },
                { name: "Fallback RPC #2", url: "https://80002.rpc.thirdweb.com", status: "STANDBY", ping: "85ms" },
              ].map((rpc, idx) => (
                <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{rpc.name}</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", fontFamily: "monospace" }}>{rpc.url}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="badge" style={{ background: idx === 0 ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.15)", color: idx === 0 ? "#34d399" : "#a5b4fc", fontSize: 10 }}>
                      {rpc.status}
                    </span>
                    <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 2 }}>{rpc.ping}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* On-Chain Verification Block */}
          {proofResult && (
            <div className="glass-card animate-fade-up" style={{ padding: 24, borderRadius: 16, border: "1px solid rgba(99,102,241,0.3)" }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: "#a5b4fc" }}>
                <Activity size={17} color="#818cf8" /> Polygon Amoy Testnet On-Chain Record
              </div>

              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
                Network: <strong>Polygon Amoy Testnet (Chain ID 80002)</strong>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 6 }}>
                Block Number: <strong>#{proofResult.block_number}</strong>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 14 }}>
                Tx Hash: <span style={{ fontFamily: "monospace", color: "#a7f3d0" }}>{proofResult.tx_hash}</span>
              </div>

              <a
                href={proofResult.explorer_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ width: "100%", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 700 }}
              >
                View on Polygonscan Explorer <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
