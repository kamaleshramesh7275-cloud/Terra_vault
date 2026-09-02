"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FileText, Download, Lock, CheckCircle2, Search, ArrowRight,
  ShieldCheck, Layers, ExternalLink, User, Calculator, FileCheck, Check,
  Building2, AlertCircle, RefreshCw, Send, CheckSquare
} from "lucide-react";
import { MOCK_COIMBATORE_PARCELS, CoimbatoreParcel } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

export default function CitizenPortalPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"search" | "mutation" | "sro" | "zk">("search");

  // Search Form Input States
  const [pattaNoInput, setPattaNoInput] = useState("1042");
  const [surveyNoInput, setSurveyNoInput] = useState("409/A1");
  const [villageInput, setVillageInput] = useState("Kinathukadavu Town");
  const [ownerSearchInput, setOwnerSearchInput] = useState("");
  const [selectedVillageChip, setSelectedVillageChip] = useState<string>("Kinathukadavu Town");

  const [searching, setSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string>("");

  // Matched Parcel State (Defaulted to Parcel 0)
  const [matchedParcel, setMatchedParcel] = useState<CoimbatoreParcel>(MOCK_COIMBATORE_PARCELS[0]);

  // Action States
  const [downloadMsg, setDownloadMsg] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [mutationRefId, setMutationRefId] = useState("");

  // Multi-SRO Calculator State
  const [selectedSro, setSelectedSro] = useState("Kinathukadavu SRO");
  const [calcExtent, setCalcExtent] = useState<string>(MOCK_COIMBATORE_PARCELS[0].area_sqm.toString());
  const [sroBreakdown, setSroBreakdown] = useState<{
    rateSqft: number;
    guidelineVal: number;
    stampDuty: number;
    regFee: number;
    totalPayable: number;
  } | null>(null);

  // ZK Proof State
  const [zkProofGen, setZkProofGen] = useState(false);
  const [zkProofDone, setZkProofDone] = useState(false);
  const [bankApproved, setBankApproved] = useState(false);

  // SRO Rates dictionary
  const SRO_RATES: Record<string, number> = {
    "Kinathukadavu SRO": 2200,
    "Thudiyalur SRO": 3500,
    "Pollachi SRO": 1950,
    "Peelamedu SRO": 4800,
    "Coimbatore Joint-I SRO": 5800,
  };

  // Village list for quick chips
  const QUICK_VILLAGES = [
    "Kinathukadavu Town", "Kothavadi", "Vadachittor",
    "Soolakkal", "Panapatti", "Nallattipalayam"
  ];

  // Dynamic Search Handler with full text filtering
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    setSearchNotice("");
    setDownloadMsg("");

    setTimeout(() => {
      const pattaTrim = pattaNoInput.trim().toLowerCase();
      const surveyTrim = surveyNoInput.trim().toLowerCase();
      const villageTrim = villageInput.trim().toLowerCase();
      const ownerTrim = ownerSearchInput.trim().toLowerCase();

      let found = MOCK_COIMBATORE_PARCELS.find(p => {
        const pPatta = p.patta_no.toLowerCase();
        const pSurvey = p.survey_no.toLowerCase();
        const pVillage = p.village.toLowerCase();
        const pOwner = p.owner_name.toLowerCase();

        return (pattaTrim && pPatta.includes(pattaTrim)) ||
               (surveyTrim && pSurvey.includes(surveyTrim)) ||
               (villageTrim && pVillage.includes(villageTrim)) ||
               (ownerTrim && pOwner.includes(ownerTrim));
      });

      if (found) {
        setMatchedParcel(found);
        setSearchNotice(`✓ Matched official Land Record in ${found.village} (Patta #${found.patta_no} • ${found.owner_name.split("/")[0]})`);
        setCalcExtent(found.area_sqm.toString());
      } else {
        setMatchedParcel(MOCK_COIMBATORE_PARCELS[0]);
        setSearchNotice(`ℹ No exact record matching query. Displaying default Kinathukadavu Town SF.409/A1 (Patta #1042).`);
      }
      setSearching(false);
    }, 300);
  };

  // Sample Selection Handler by Village Chip
  const handleVillageChipSelect = (villageName: string) => {
    setSelectedVillageChip(villageName);
    const found = MOCK_COIMBATORE_PARCELS.find(p => p.village.toLowerCase().includes(villageName.toLowerCase()));
    if (found) {
      setPattaNoInput(found.patta_no);
      setSurveyNoInput(found.survey_no);
      setVillageInput(found.village);
      setMatchedParcel(found);
      setSearchNotice(`✓ Selected ${villageName} Sample Parcel: Patta #${found.patta_no} (${found.survey_no})`);
      setCalcExtent(found.area_sqm.toString());
    }
  };

  // Certified Patta PDF Downloader
  const downloadCertifiedPdf = () => {
    setDownloadMsg("Generating Certified Patta / Chitta PDF with Digital Signature Stamp...");

    setTimeout(() => {
      const pdfContent = `
================================================================================
                    GOVERNMENT OF TAMIL NADU • வருவாய்த் துறை
             CERTIFIED COPY OF LAND RECORD OF RIGHTS (PATTA / CHITTA)
             Issued under Digital India Land Records Modernization (DILRMP)
================================================================================

CERTIFICATE REF NO  : TN-PATTA-${matchedParcel.patta_no}-2026-CERT
DATE OF ISSUANCE   : ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}
STATUTORY JURISDICTION: ${matchedParcel.village} Village • ${matchedParcel.taluk} Taluk • ${matchedParcel.district}

1. PATTA NUMBER (பட்டா எண்)         : ${matchedParcel.patta_no}
2. PATTADAR NAME (பட்டாதார் பெயர்)    : ${matchedParcel.owner_name}
3. FATHER/HUSBAND NAME             : ${matchedParcel.father_name}
4. CO-OWNERS / JOINT PATTADARS     : ${matchedParcel.co_owners.length > 0 ? matchedParcel.co_owners.join(", ") : "Nil (Sole Owner)"}

SURVEY FIELD & EXTENT DETAILS:
--------------------------------------------------------------------------------
Survey Field No. (புல எண்)        : ${matchedParcel.survey_no} (Subdivision: ${matchedParcel.subdivision})
Total Extent (பரப்பளவு)             : ${matchedParcel.area_acres} Acres (${matchedParcel.area_cents} Cents / ${matchedParcel.area_sqm} Sq.M)
Land Classification (வகைப்பாடு)   : ${matchedParcel.land_type}
Soil Type                          : ${matchedParcel.soil_type}

VALUATION & ENCUMBRANCE STATUS:
--------------------------------------------------------------------------------
SRO Guideline Rate                 : ₹ ${matchedParcel.guideline_value_sqft.toLocaleString("en-IN")} / sq.ft
Estimated Govt Valuation           : ₹ ${matchedParcel.market_value_inr.toLocaleString("en-IN")}
Encumbrance Status                 : ${matchedParcel.encumbrance_status}

BLOCKCHAIN IMMUTABLE AUDIT TRAIL:
--------------------------------------------------------------------------------
Polygon Network Anchor Hash        : ${matchedParcel.blockchain_hash}
Verification Contract              : 0x71C83e9b102d5a39f18273491827349182734
Title Integrity Score              : 98.5% (Clean Title Verified)

[DIGITAL SIGNATURE STAMP]
Digitally signed by Tahsildar, ${matchedParcel.taluk} Revenue Taluk.
Security Verification QR Code: https://tn.gov.in/verify?hash=${matchedParcel.blockchain_hash.substring(0, 16)}
================================================================================
      `;

      const blob = new Blob([pdfContent], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Patta_TN_${matchedParcel.patta_no}_Certified.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadMsg(`✓ Downloaded Certified Patta #${matchedParcel.patta_no} File!`);
    }, 500);
  };

  // Submit Mutation Application
  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refId = `TN-MUT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setMutationRefId(refId);
    setMutationSubmitted(true);

    // Save to local storage for VAO desk retrieval
    try {
      const existing = JSON.parse(localStorage.getItem("terravault_vao_tasks") || "[]");
      existing.unshift({
        id: refId,
        applicant: matchedParcel.owner_name.split("/")[0],
        survey_no: matchedParcel.survey_no,
        village: matchedParcel.village,
        patta_no: matchedParcel.patta_no,
        submitted_at: new Date().toLocaleString(),
        status: "Pending Field Inspection by VAO"
      });
      localStorage.setItem("terravault_vao_tasks", JSON.stringify(existing));
    } catch (err) {}
  };

  // SRO Calculator Handler
  const handleCalculateSRO = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const sqm = parseFloat(calcExtent) || 1000;
    const sqft = sqm * 10.7639;
    const rate = SRO_RATES[selectedSro] || 2200;
    const guidelineVal = Math.round(sqft * rate);
    const stampDuty = Math.round(guidelineVal * 0.07);
    const regFee = Math.round(guidelineVal * 0.02);

    setSroBreakdown({
      rateSqft: rate,
      guidelineVal,
      stampDuty,
      regFee,
      totalPayable: guidelineVal + stampDuty + regFee
    });
  };

  // ZK Proof Handler
  const handleZkProof = () => {
    setZkProofGen(true);
    setTimeout(() => {
      setZkProofGen(false);
      setZkProofDone(true);
      setBankApproved(true);
    }, 600);
  };

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", paddingBottom: 50 }}>
      {/* Top Banner Header */}
      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 24, marginBottom: 24, borderTop: "4px solid #0f2942" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
              <User size={14} color="#0f2942" /> CITIZEN E-SERVICES PORTAL (பொதுமக்கள் சேவை தளம்)
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", margin: 0 }}>
              Self-Service Patta, Chitta & ZK Title Privacy Center
            </h1>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 4, margin: 0 }}>
              Official State Revenue Administration Digital Certificate & Land Valuation Portal
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", fontWeight: 700 }}>
              Statewide Citizen Self-Service
            </span>
          </div>
        </div>
      </div>

      {/* Citizen Service Navigation Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { id: "search", label: "Patta / Chitta Search & Certified PDF", icon: Search },
          { id: "mutation", label: "Apply Patta Subdivision Transfer", icon: FileCheck },
          { id: "sro", label: "SRO Guideline Valuation Calculator", icon: Calculator },
          { id: "zk", label: "Zero-Knowledge Bank Title Proof", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "10px 16px", fontSize: 13, background: activeTab === t.id ? "#0f2942" : "#ffffff", borderColor: "#cbd5e1", color: activeTab === t.id ? "#ffffff" : "#0f2942" }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Search & Download */}
      {activeTab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={18} color="#0f2942" /> Search Patta / Chitta Records (பட்டா / சிட்டா தேடல்)
            </h2>

            {/* Quick Sample Selector Village Chips */}
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={13} color="#0f2942" /> QUICK SAMPLE PARCEL VILLAGE SELECTOR:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUICK_VILLAGES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleVillageChipSelect(v)}
                    style={{
                      padding: "4px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 16,
                      border: "1px solid #cbd5e1",
                      background: selectedVillageChip === v ? "#0f2942" : "#ffffff",
                      color: selectedVillageChip === v ? "#ffffff" : "#0f2942",
                      cursor: "pointer"
                    }}
                  >
                    📍 {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 140px", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Revenue Village</label>
                <input type="text" placeholder="e.g. Kinathukadavu Town" value={villageInput} onChange={(e) => setVillageInput(e.target.value)} className="input" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Patta Number (பட்டா எண்)</label>
                <input type="text" placeholder="e.g. 1042" value={pattaNoInput} onChange={(e) => setPattaNoInput(e.target.value)} className="input" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Survey Field No. (புல எண்)</label>
                <input type="text" placeholder="e.g. SF.409/A1" value={surveyNoInput} onChange={(e) => setSurveyNoInput(e.target.value)} className="input" style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Owner Name (optional)</label>
                <input type="text" placeholder="e.g. Kandasamy" value={ownerSearchInput} onChange={(e) => setOwnerSearchInput(e.target.value)} className="input" style={{ width: "100%" }} />
              </div>
              <button type="submit" disabled={searching} className="btn btn-primary" style={{ justifyContent: "center", padding: 10, fontSize: 13, background: "#0f2942", borderColor: "#1e293b" }}>
                {searching ? "Searching..." : "Search RoR"}
              </button>
            </form>
          </div>

          {/* Search Result Feedback Strip */}
          {searchNotice && (
            <div style={{ padding: "10px 16px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, color: "#0f2942", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#0f2942" /> {searchNotice}
            </div>
          )}

          {/* Searched Record Display Card */}
          {matchedParcel && (
            <div className="glass-card" style={{ padding: 24, borderTop: "4px solid #0f2942", background: "#ffffff", borderColor: "#cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1px solid #cbd5e1", paddingBottom: 14 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942" }}>
                    VERIFIED OFFICIAL ROR COPY
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f2942", margin: "6px 0 0 0" }}>
                    Patta No. {matchedParcel.patta_no} — {matchedParcel.owner_name}
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" style={{ fontSize: 12, background: "#0f2942", borderColor: "#1e293b" }} onClick={downloadCertifiedPdf}>
                    <Download size={14} /> Download Certified Patta PDF
                  </button>
                </div>
              </div>

              {downloadMsg && (
                <div style={{ padding: 10, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12, color: "#0f2942", fontWeight: 600, marginBottom: 16 }}>
                  {downloadMsg}
                </div>
              )}

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Survey Field & Village</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>{matchedParcel.survey_no} • {matchedParcel.village} ({matchedParcel.taluk})</div>
                </div>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>Total Extent & Classification</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>{matchedParcel.area_acres} Acres ({matchedParcel.area_cents} Cents) • {matchedParcel.land_type.split("(")[0]}</div>
                </div>
                <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>SRO Guideline Value & Market Extent</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>₹ {matchedParcel.guideline_value_sqft.toLocaleString("en-IN")} / sq.ft (Est ₹ {(matchedParcel.market_value_inr / 100000).toFixed(1)} Lakhs)</div>
                </div>
              </div>

              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 11, color: "#475569", display: "flex", justifyContent: "space-between" }}>
                <span>Father Name: <strong>{matchedParcel.father_name}</strong></span>
                <span>Encumbrance: <strong>{matchedParcel.encumbrance_status}</strong></span>
                <span>Polygon Hash: <strong style={{ fontFamily: "monospace" }}>{matchedParcel.blockchain_hash.substring(0, 16)}...</strong></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Apply Mutation & Forward to VAO */}
      {activeTab === "mutation" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <FileCheck size={18} color="#0f2942" /> Apply Online Patta Subdivision & Title Transfer (பட்டா மாறுதல் விண்ணப்பம்)
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Applications are assigned directly to the Village Administrative Officer (VAO) of {matchedParcel.village} for field boundary verification.
          </p>

          {mutationSubmitted ? (
            <div style={{ padding: 20, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#166534" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                <CheckSquare size={20} color="#16a34a" /> APPLICATION SUBMITTED & FORWARDED TO VAO
              </div>
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                Reference Application ID: <strong>{mutationRefId}</strong>
              </div>
              <div style={{ fontSize: 12, color: "#15803d", background: "#ffffff", padding: 12, borderRadius: 6, border: "1px solid #bbf7d0" }}>
                📍 <strong>Workflow Status:</strong> Assigned to Village Administrative Officer (VAO — {matchedParcel.village}). The officer will review ground boundary measurements and forward recommendations to the Revenue Inspector (RI) and Tahsildar.
              </div>
            </div>
          ) : (
            <form onSubmit={handleMutationSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>APPLICANT NAME</label>
                  <input type="text" defaultValue={matchedParcel.owner_name.split("/")[0]} className="input" style={{ width: "100%" }} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>REGISTERED SALE DEED / SURVEY FIELD NO.</label>
                  <input type="text" defaultValue={`SF.${matchedParcel.survey_no} (${matchedParcel.village})`} className="input" style={{ width: "100%" }} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>TARGET REVENUE VILLAGE & VAO JURISDICTION</label>
                <input type="text" value={`${matchedParcel.village} Revenue Village • Kinathukadavu Taluk`} disabled className="input" style={{ width: "100%", background: "#f8fafc" }} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", padding: "10px 20px", fontSize: 13, alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={15} /> Forward Application to VAO Desk
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: SRO Guideline Calculator */}
      {activeTab === "sro" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Calculator size={18} color="#0f2942" /> SRO Multi-Station Guideline Valuation Calculator
          </h2>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>
            Select any Sub-Registrar Office (SRO) in Coimbatore District to calculate official land valuation, 7% stamp duty, and 2% registration fees.
          </p>

          <form onSubmit={handleCalculateSRO}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>SELECT SUB-REGISTRAR OFFICE (SRO)</label>
                <select
                  value={selectedSro}
                  onChange={(e) => setSelectedSro(e.target.value)}
                  className="input"
                  style={{ width: "100%", background: "#ffffff" }}
                >
                  <option value="Kinathukadavu SRO">Kinathukadavu SRO (கிணத்துக்கடவு)</option>
                  <option value="Thudiyalur SRO">Thudiyalur SRO (துடியலூர்)</option>
                  <option value="Pollachi SRO">Pollachi SRO (பொள்ளாச்சி)</option>
                  <option value="Peelamedu SRO">Peelamedu SRO (பீளமேடு)</option>
                  <option value="Coimbatore Joint-I SRO">Coimbatore Joint-I SRO (கோவை)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>PLOT EXTENT (IN SQ. METERS)</label>
                <input
                  type="number"
                  value={calcExtent}
                  onChange={(e) => setCalcExtent(e.target.value)}
                  className="input"
                  style={{ width: "100%" }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", padding: "10px 20px", fontSize: 13, marginBottom: 20 }}>
              Calculate Stamp Duty & Guideline Value
            </button>
          </form>

          {sroBreakdown && (
            <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f2942", marginBottom: 12 }}>
                Valuation Summary — {selectedSro}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, fontSize: 13 }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Guideline Rate:</span>
                  <strong>₹ {sroBreakdown.rateSqft} / sq.ft</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Base Valuation:</span>
                  <strong>₹ {sroBreakdown.guidelineVal.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>TN Stamp Duty (7%):</span>
                  <strong style={{ color: "#c2410c" }}>₹ {sroBreakdown.stampDuty.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Reg. Fee (2%):</span>
                  <strong style={{ color: "#c2410c" }}>₹ {sroBreakdown.regFee.toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: ZK Proof */}
      {activeTab === "zk" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={18} color="#0f2942" /> Zero-Knowledge Title Privacy Proof (Bank Mortgage Verification)
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>
            Generate cryptographic ZK-SNARK proof of clean land title for Patta #{matchedParcel.patta_no} ({matchedParcel.survey_no}) without revealing confidential identity details.
          </p>

          {zkProofDone ? (
            <div>
              <div style={{ padding: 16, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#166534", marginBottom: 16 }}>
                <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>
                  ✓ ZK-SNARK CRYPTOGRAPHIC PROOF GENERATED & APPROVED
                </div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: "#15803d" }}>
                  Proof Token Hash: 0x7f8a9b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Link href="/business" className="btn btn-primary" style={{ background: "#16a34a", borderColor: "#15803d", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <Building2 size={15} /> Verify on G2B Commercial Bank Portal <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", padding: "10px 20px", fontSize: 13 }} onClick={handleZkProof} disabled={zkProofGen}>
              {zkProofGen ? "Generating ZK Proof..." : "Generate Bank ZK Title Proof"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
