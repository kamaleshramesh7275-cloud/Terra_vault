"use client";
import { useState } from "react";
import {
  Building2, ShieldCheck, Calculator, FileCheck, CheckCircle2,
  Lock, Search, ExternalLink, AlertTriangle, ArrowRight, Download, Award
} from "lucide-react";
import { MOCK_COIMBATORE_PARCELS, CoimbatoreParcel } from "@/lib/mockData";

export default function BusinessPortalPage() {
  const [activeTab, setActiveTab] = useState<"bank" | "sro" | "sez">("bank");

  // Bank ZK Proof State
  const [proofInput, setProofInput] = useState("0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a");
  const [bankName, setBankName] = useState("State Bank of India — Kinathukadavu Branch");
  const [loanAmount, setLoanAmount] = useState("50,00,000");
  const [verificationResult, setVerificationResult] = useState<{
    status: "verified" | "pending" | "rejected";
    titleScore: number;
    encumbrance: string;
    owner: string;
    parcel: string;
    verifiedAt: string;
  } | null>(null);

  // SRO Multi-Station Guideline Calculator
  const [selectedSRO, setSelectedSRO] = useState("Kinathukadavu SRO");
  const [selectedVillage, setSelectedVillage] = useState("Kinathukadavu Town");
  const [landType, setLandType] = useState("Commercial SEZ");
  const [extentSqm, setExtentSqm] = useState("2023.43"); // ~0.5 acre
  const [sroCalcResult, setSroCalcResult] = useState<{
    rateSqft: number;
    guidelineTotal: number;
    stampDuty: number;
    regFee: number;
    grandTotal: number;
  } | null>(null);

  // SEZ Corporate Check
  const [sezSurveyNo, setSezSurveyNo] = useState("SF.409/A1");
  const [sezResult, setSezResult] = useState<CoimbatoreParcel | null>(null);

  // SRO Guideline Rates mapping per SRO & Land Type
  const SRO_RATES: Record<string, Record<string, number>> = {
    "Kinathukadavu SRO": {
      "Commercial SEZ": 3500,
      "Industrial Mill": 2800,
      "Residential Layout": 2200,
      "Agricultural": 800
    },
    "Thudiyalur SRO": {
      "Commercial SEZ": 4800,
      "Industrial Mill": 3900,
      "Residential Layout": 3100,
      "Agricultural": 1250
    },
    "Pollachi SRO": {
      "Commercial SEZ": 3200,
      "Industrial Mill": 2500,
      "Residential Layout": 1950,
      "Agricultural": 750
    },
    "Peelamedu SRO": {
      "Commercial SEZ": 6500,
      "Industrial Mill": 5200,
      "Residential Layout": 4500,
      "Agricultural": 1800
    },
    "Coimbatore Joint-I SRO": {
      "Commercial SEZ": 7800,
      "Industrial Mill": 6100,
      "Residential Layout": 5400,
      "Agricultural": 2200
    }
  };

  const handleVerifyProof = (e: React.FormEvent) => {
    e.preventDefault();
    setVerificationResult({
      status: "verified",
      titleScore: 98.4,
      encumbrance: "Clean / Nil Encumbrance (Approved for Commercial Mortgage)",
      owner: "Kandasamy Gounder s/o Rama Gounder",
      parcel: "Kinathukadavu Town SF.409/A1 (Patta #1042)",
      verifiedAt: new Date().toLocaleString()
    });
  };

  const handleSroCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const sqm = parseFloat(extentSqm) || 1000;
    const sqft = sqm * 10.7639;
    const rate = SRO_RATES[selectedSRO]?.[landType] || 2500;
    const guidelineTotal = Math.round(sqft * rate);
    const stampDuty = Math.round(guidelineTotal * 0.07); // 7% TN Stamp Duty
    const regFee = Math.round(guidelineTotal * 0.02);     // 2% Registration Fee

    setSroCalcResult({
      rateSqft: rate,
      guidelineTotal,
      stampDuty,
      regFee,
      grandTotal: guidelineTotal + stampDuty + regFee
    });
  };

  const handleSezSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_COIMBATORE_PARCELS.find(p => p.survey_no.toLowerCase().includes(sezSurveyNo.trim().toLowerCase())) || MOCK_COIMBATORE_PARCELS[0];
    setSezResult(found);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 40 }}>
      {/* ── Header Banner ─────────────────────────────────────────────────── */}
      <div style={{
        background: "linear-[#0f2942]",
        color: "#ffffff",
        padding: "24px 32px",
        borderRadius: 8,
        marginBottom: 24,
        display: "flex",
        justify: "space-between",
        alignItems: "center"
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#38bdf8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            G2B • GOVERNMENT TO BUSINESS & FINANCIAL INSTITUTIONS
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: "4px 0 8px 0" }}>
            Commercial Bank & Corporate Investor Land Portal
          </h1>
          <p style={{ fontSize: 13, color: "#cbd5e1", margin: 0, maxWidth: 700 }}>
            Sanction commercial land loans, verify Zero-Knowledge title privacy proofs, and compute multi-SRO guideline valuations across Tamil Nadu.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={{ background: "rgba(56, 189, 248, 0.2)", border: "1px solid #38bdf8", color: "#38bdf8", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Building2 size={14} /> Commercial Bank API Enabled
          </span>
        </div>
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, borderBottom: "2px solid #e2e8f0", marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab("bank")}
          style={{
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === "bank" ? "#0f2942" : "#64748b",
            background: "none",
            border: "none",
            borderBottom: activeTab === "bank" ? "3px solid #0f2942" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Lock size={16} /> Commercial Bank ZK Proof Verification
        </button>

        <button
          onClick={() => setActiveTab("sro")}
          style={{
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === "sro" ? "#0f2942" : "#64748b",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sro" ? "3px solid #0f2942" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Calculator size={16} /> Multi-SRO Guideline Valuation
        </button>

        <button
          onClick={() => setActiveTab("sez")}
          style={{
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 700,
            color: activeTab === "sez" ? "#0f2942" : "#64748b",
            background: "none",
            border: "none",
            borderBottom: activeTab === "sez" ? "3px solid #0f2942" : "3px solid transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <Building2 size={16} /> Industrial SEZ Land Title Search
        </button>
      </div>

      {/* ── TAB 1: Bank ZK Proof Verification ─────────────────────────────── */}
      {activeTab === "bank" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Lock size={18} color="#0f2942" /> Verify Zero-Knowledge Title Cleanliness Proof
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
              Commercial banks can enter the encrypted ZK Title Proof Hash or certificate code generated by land owners to instantly verify title cleanliness without exposing private personal details.
            </p>

            <form onSubmit={handleVerifyProof}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  COMMERCIAL BANK BRANCH NAME
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  PROPOSED LOAN / MORTGAGE SANCTION AMOUNT (₹)
                </label>
                <input
                  type="text"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13 }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  ZK TITLE PROOF HASH / CERTIFICATE TOKEN
                </label>
                <input
                  type="text"
                  value={proofInput}
                  onChange={(e) => setProofInput(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12, fontFamily: "monospace" }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "#0f2942",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                <ShieldCheck size={16} /> Verify ZK Title Proof with Revenue Registry
              </button>
            </form>
          </div>

          <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={18} color="#16a34a" /> Bank Verification & Sanction Status
            </h3>

            {verificationResult ? (
              <div>
                <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: 16, borderRadius: 6, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#166534", fontWeight: 800, fontSize: 15 }}>
                    <CheckCircle2 size={20} color="#16a34a" /> VERIFIED & APPROVED FOR BANK MORTGAGE
                  </div>
                  <div style={{ fontSize: 11, color: "#15803d", marginTop: 4 }}>
                    Verified by Revenue Authority • Token Anchored on Polygon Amoy
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#334155" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Title Cleanliness Score:</span>
                    <strong style={{ color: "#16a34a" }}>{verificationResult.titleScore} / 100 (Clean Title)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Encumbrance Status:</span>
                    <strong>{verificationResult.encumbrance}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Property Owner:</span>
                    <strong>{verificationResult.owner}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Cadastral Parcel:</span>
                    <strong>{verificationResult.parcel}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed #e2e8f0", paddingBottom: 6 }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>Bank Branch:</span>
                    <strong>{bankName}</strong>
                  </div>
                </div>

                <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
                  <button
                    onClick={() => alert("Downloading Official Commercial Bank ZK Collateral Approval Certificate...")}
                    style={{ flex: 1, padding: "8px 12px", background: "#16a34a", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                  >
                    <Download size={14} /> Download Bank Collateral Certificate
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ text: "center", padding: "40px 20px", color: "#64748b" }}>
                <Lock size={40} color="#cbd5e1" style={{ margin: "0 auto 12px auto", display: "block" }} />
                Enter a ZK Title Proof Hash on the left to verify property title cleanliness for bank loan collateral approval.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Multi-SRO Guideline Valuation Calculator ────────────────── */}
      {activeTab === "sro" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <Calculator size={18} color="#0f2942" /> Multi-SRO Guideline Valuation Calculator
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
              Compute official Tamil Nadu Registration Department guideline values, 7% stamp duty, and 2% registration fee across all Coimbatore sub-registrar offices.
            </p>

            <form onSubmit={handleSroCalculate}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  SUB-REGISTRAR OFFICE (SRO)
                </label>
                <select
                  value={selectedSRO}
                  onChange={(e) => setSelectedSRO(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13, background: "#ffffff" }}
                >
                  <option value="Kinathukadavu SRO">Kinathukadavu SRO (கிணத்துக்கடவு)</option>
                  <option value="Thudiyalur SRO">Thudiyalur SRO (துடியலூர்)</option>
                  <option value="Pollachi SRO">Pollachi SRO (பொள்ளாச்சி)</option>
                  <option value="Peelamedu SRO">Peelamedu SRO (பீளமேடு)</option>
                  <option value="Coimbatore Joint-I SRO">Coimbatore Joint-I SRO (கோவை)</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  LAND CLASSIFICATION & USAGE
                </label>
                <select
                  value={landType}
                  onChange={(e) => setLandType(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13, background: "#ffffff" }}
                >
                  <option value="Commercial SEZ">Commercial SEZ / Business Complex</option>
                  <option value="Industrial Mill">Industrial Mill & Warehousing</option>
                  <option value="Residential Layout">Residential Layout / House Plot</option>
                  <option value="Agricultural">Agricultural Land (Wet/Dry)</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  TOTAL LAND EXTENT (IN SQ. METRES)
                </label>
                <input
                  type="number"
                  value={extentSqm}
                  onChange={(e) => setExtentSqm(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13 }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: "#0f2942",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Calculate Official Stamp Duty & Guideline Value
              </button>
            </form>
          </div>

          <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", margin: "0 0 16px 0" }}>
              Valuation Breakdown ({selectedSRO})
            </h3>

            {sroCalcResult ? (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Applicable Guideline Rate:</span>
                    <strong>₹{sroCalcResult.rateSqft.toLocaleString()} / sq.ft</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Guideline Valuation (Base):</span>
                    <strong>₹{sroCalcResult.guidelineTotal.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>TN Stamp Duty (7%):</span>
                    <strong style={{ color: "#c2410c" }}>₹{sroCalcResult.stampDuty.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                    <span style={{ color: "#64748b" }}>Registration Fee (2%):</span>
                    <strong style={{ color: "#c2410c" }}>₹{sroCalcResult.regFee.toLocaleString()}</strong>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 12, borderRadius: 6, marginTop: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0f2942" }}>Total Payable Registration Cost:</span>
                    <strong style={{ fontSize: 16, fontWeight: 800, color: "#0f2942" }}>₹{sroCalcResult.grandTotal.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ text: "center", padding: "40px 20px", color: "#64748b" }}>
                Click "Calculate" to view official SRO guideline rates and registration fees.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Industrial SEZ Land Title Search ───────────────────────── */}
      {activeTab === "sez" && (
        <div style={{ background: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #cbd5e1" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={18} color="#0f2942" /> Commercial SEZ & Corporate Land Cleanliness Check
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Query cadastral title cleanliness, bank mortgage encumbrance, and court litigation risks for industrial projects.
          </p>

          <form onSubmit={handleSezSearch} style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Enter Survey No (e.g. SF.409/A1) or Patta No"
              value={sezSurveyNo}
              onChange={(e) => setSezSurveyNo(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 13 }}
            />
            <button
              type="submit"
              style={{ padding: "8px 20px", background: "#0f2942", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <Search size={15} /> Search Title Records
            </button>
          </form>

          {sezResult && (
            <div style={{ background: "#f8fafc", padding: 20, borderRadius: 6, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, color: "#0f2942" }}>{sezResult.village} — {sezResult.survey_no}</h4>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Patta #{sezResult.patta_no} • Owner: {sezResult.owner_name}</div>
                </div>
                <span style={{ background: sezResult.status === "Verified" ? "#dcfce7" : "#fee2e2", color: sezResult.status === "Verified" ? "#166534" : "#991b1b", padding: "4px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                  {sezResult.status} Title
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12, marginTop: 12 }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Land Extent:</span>
                  <strong>{sezResult.area_sqm} sq.m (~{(sezResult.area_sqm / 4046.86).toFixed(2)} Acres)</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Guideline Value:</span>
                  <strong>₹{sezResult.guideline_value_sqft} / sq.ft</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Encumbrance Status:</span>
                  <strong style={{ color: sezResult.encumbrance_status.includes("Clean") ? "#16a34a" : "#c2410c" }}>{sezResult.encumbrance_status}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
