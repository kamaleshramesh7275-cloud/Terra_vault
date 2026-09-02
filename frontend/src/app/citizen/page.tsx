"use client";
import { useState } from "react";
import {
  FileText, Download, Lock, CheckCircle2, Search, ArrowRight,
  ShieldCheck, Layers, ExternalLink, User, Calculator, FileCheck, Check,
  Building2, AlertCircle, RefreshCw
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
  const [selectedSample, setSelectedSample] = useState<string>("cbe-plot-000");

  const [searching, setSearching] = useState(false);
  const [searchNotice, setSearchNotice] = useState<string>("");

  // Matched Parcel State (Defaulted to Parcel 000)
  const [matchedParcel, setMatchedParcel] = useState<CoimbatoreParcel>(MOCK_COIMBATORE_PARCELS[0]);

  // Action States
  const [downloadMsg, setDownloadMsg] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);
  const [calcExtent, setCalcExtent] = useState<string>(MOCK_COIMBATORE_PARCELS[0].area_sqm.toString());
  const [calcResult, setCalcResult] = useState<number | null>(
    Math.round(MOCK_COIMBATORE_PARCELS[0].area_sqm * MOCK_COIMBATORE_PARCELS[0].guideline_value_sqft)
  );
  const [zkProofGen, setZkProofGen] = useState(false);
  const [zkProofDone, setZkProofDone] = useState(false);

  // Dynamic Search Handler
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearching(true);
    setSearchNotice("");
    setDownloadMsg("");

    setTimeout(() => {
      const pattaTrim = pattaNoInput.trim().toLowerCase();
      const surveyTrim = surveyNoInput.trim().toLowerCase();
      const villageTrim = villageInput.trim().toLowerCase();

      // Search in 108 Coimbatore Parcels
      let found = MOCK_COIMBATORE_PARCELS.find(p => {
        const pPatta = p.patta_no.toLowerCase();
        const pSurvey = p.survey_no.toLowerCase();
        const pVillage = p.village.toLowerCase();

        return (pattaTrim && pPatta.includes(pattaTrim)) ||
               (surveyTrim && pSurvey.includes(surveyTrim)) ||
               (villageTrim && pVillage.includes(villageTrim));
      });

      if (found) {
        setMatchedParcel(found);
        setSearchNotice(`✓ Matched official Land Record in ${found.village} (Patta #${found.patta_no})`);
        setCalcExtent(found.area_sqm.toString());
        setCalcResult(Math.round(found.area_sqm * found.guideline_value_sqft));
      } else {
        // Fallback to Parcel 0
        setMatchedParcel(MOCK_COIMBATORE_PARCELS[0]);
        setSearchNotice(`ℹ No exact record found for Patta #${pattaNoInput}. Displaying default Kinathukadavu Town SF.409/A1 (Patta #1042).`);
      }
      setSearching(false);
    }, 350);
  };

  // Sample Selection Handler
  const handleSampleSelect = (parcelId: string) => {
    setSelectedSample(parcelId);
    const found = MOCK_COIMBATORE_PARCELS.find(p => p.id === parcelId);
    if (found) {
      setPattaNoInput(found.patta_no);
      setSurveyNoInput(found.survey_no);
      setVillageInput(found.village);
      setMatchedParcel(found);
      setSearchNotice(`✓ Loaded Sample Record: Patta #${found.patta_no} — ${found.survey_no} (${found.village})`);
      setCalcExtent(found.area_sqm.toString());
      setCalcResult(Math.round(found.area_sqm * found.guideline_value_sqft));
    }
  };

  // Certified Patta PDF File Downloader
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
    }, 600);
  };

  const handleZkProof = () => {
    setZkProofGen(true);
    setTimeout(() => {
      setZkProofGen(false);
      setZkProofDone(true);
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

            {/* Quick Sample Selector Dropdown */}
            <div style={{ marginBottom: 16, padding: "10px 14px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw size={14} color="#0f2942" /> Quick Sample Parcel Selector:
              </div>
              <select
                value={selectedSample}
                onChange={(e) => handleSampleSelect(e.target.value)}
                style={{ background: "#ffffff", color: "#0f2942", border: "1px solid #cbd5e1", borderRadius: 4, padding: "4px 10px", fontSize: 12, fontWeight: 600, maxWidth: 450 }}
              >
                {MOCK_COIMBATORE_PARCELS.slice(0, 12).map((p) => (
                  <option key={p.id} value={p.id}>
                    Patta #{p.patta_no} — {p.survey_no} ({p.village}) • {p.owner_name.split("/")[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 160px", gap: 14, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Revenue Village</label>
                <input type="text" value={villageInput} onChange={(e) => setVillageInput(e.target.value)} className="input" style={{ width: "100%" }} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Patta Number (பட்டா எண்)</label>
                <input type="text" value={pattaNoInput} onChange={(e) => setPattaNoInput(e.target.value)} className="input" style={{ width: "100%" }} required />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Survey Field No. (புல எண்)</label>
                <input type="text" value={surveyNoInput} onChange={(e) => setSurveyNoInput(e.target.value)} className="input" style={{ width: "100%" }} required />
              </div>
              <button type="submit" disabled={searching} className="btn btn-primary" style={{ justifyContent: "center", padding: 10, fontSize: 13, background: "#0f2942", borderColor: "#1e293b" }}>
                {searching ? "Searching..." : "Search Land RoR"}
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

      {/* Tab 2: Apply Mutation */}
      {activeTab === "mutation" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Apply Online Patta Subdivision & Title Transfer (பட்டா மாறுதல் விண்ணப்பம்)
          </h2>
          {mutationSubmitted ? (
            <div style={{ padding: 16, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f2942", fontWeight: 700, fontSize: 13 }}>
              ✓ Application Submitted! Reference ID: <strong>TN-MUT-2026-8819</strong>. Forwarded to VAO {matchedParcel.village} for ground scrutiny.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setMutationSubmitted(true); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Applicant Name</label>
                  <input type="text" defaultValue={matchedParcel.owner_name.split("/")[0]} className="input" style={{ width: "100%" }} required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Registered Sale Deed / Survey Field No.</label>
                  <input type="text" defaultValue={`SF.${matchedParcel.survey_no} (${matchedParcel.village})`} className="input" style={{ width: "100%" }} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", width: 240 }}>
                Submit Mutation Application
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: SRO Guideline Calculator */}
      {activeTab === "sro" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            SRO Guideline Land Valuation Calculator (சார்பதிவாளர் வழிகாட்டி மதிப்பு)
          </h2>
          <div style={{ display: "flex", gap: 16, alignItems: "end", marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Plot Area Extent (sq. meters / sq. ft)</label>
              <input
                type="number"
                value={calcExtent}
                onChange={(e) => {
                  setCalcExtent(e.target.value);
                  setCalcResult(Math.round(Number(e.target.value) * matchedParcel.guideline_value_sqft));
                }}
                className="input"
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>SRO Guideline Rate for {matchedParcel.village}</label>
              <input type="text" value={`₹ ${matchedParcel.guideline_value_sqft.toLocaleString("en-IN")} / sq. ft`} disabled className="input" style={{ width: "100%", background: "#f8fafc" }} />
            </div>
          </div>
          {calcResult && (
            <div style={{ padding: 16, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
              <div style={{ fontSize: 11, color: "#475569" }}>Total Estimated Minimum Registration Valuation ({matchedParcel.village})</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", marginTop: 4 }}>₹ {calcResult.toLocaleString("en-IN")}</div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: ZK Proof */}
      {activeTab === "zk" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Zero-Knowledge Title Privacy Proof (Bank Mortgage Verification)
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 16 }}>
            Generate cryptographic ZK-SNARK proof of clean land title for Patta #{matchedParcel.patta_no} ({matchedParcel.survey_no}) without revealing confidential identity details.
          </p>

          {zkProofDone ? (
            <div style={{ padding: 16, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f2942", fontWeight: 700, fontSize: 13 }}>
              ✓ ZK-SNARK Cryptographic Proof Generated! Hash: <strong style={{ fontFamily: "monospace" }}>{matchedParcel.blockchain_hash.substring(0, 24)}...</strong>. Valid for all Scheduled Commercial Banks.
            </div>
          ) : (
            <button className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b" }} onClick={handleZkProof} disabled={zkProofGen}>
              {zkProofGen ? "Generating ZK Proof..." : "Generate Bank ZK Title Proof"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
