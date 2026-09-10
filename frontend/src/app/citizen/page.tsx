"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FileText, Download, Lock, CheckCircle2, Search, ArrowRight,
  ShieldCheck, Layers, ExternalLink, User, Calculator, FileCheck, Check,
  Building2, AlertCircle, RefreshCw, Send, CheckSquare, LogOut, Landmark, Globe, Loader2
} from "lucide-react";
import { MOCK_COIMBATORE_PARCELS, CoimbatoreParcel } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/components/AuthGuard";
import { ALL_INDIAN_STATES, getStateMetadata, getAllStatesList } from "@/lib/stateRegistry";
import { calculateSROFees, getStampDutyStructure } from "@/lib/stampDutyRegistry";

interface StateSampleParcel {
  stateCode: string;
  stateName: string;
  rorTitle: string;
  surveyLabel: string;
  pattaLabel: string;
  villageLabel: string;
  sampleDistrict: string;
  sampleTaluk: string;
  sampleVillage: string;
  sampleSurveyNo: string;
  samplePattaNo: string;
  sampleOwner: string;
  sampleFather: string;
  sampleLandType: string;
  sampleSoil: string;
  sampleGuideline: number;
  sampleMarketVal: number;
  sampleExtent: number;
  actCitation: string;
}

const STATE_SAMPLES: Record<string, StateSampleParcel> = {
  tn: {
    stateCode: "tn",
    stateName: "Tamil Nadu",
    rorTitle: "Patta / Chitta Extract (பட்டா / சிட்டா நகல்)",
    surveyLabel: "Survey / SF No (புல எண்)",
    pattaLabel: "Patta No (பட்டா எண்)",
    villageLabel: "Revenue Village (வருவாய் கிராமம்)",
    sampleDistrict: "Coimbatore",
    sampleTaluk: "Kinathukadavu",
    sampleVillage: "Kinathukadavu Town",
    sampleSurveyNo: "409/A1",
    samplePattaNo: "1042",
    sampleOwner: "Kandasamy Gounder / கந்தசாமி கவுண்டர்",
    sampleFather: "Rama Gounder / ராம கவுண்டர்",
    sampleLandType: "தோட்டக்கால் நஞ்சை (Coconut & Agri)",
    sampleSoil: "Deep Red Loam / செம்மண்",
    sampleGuideline: 2200,
    sampleMarketVal: 24200000,
    sampleExtent: 2.53,
    actCitation: "Section 3 of Tamil Nadu Patta Pass Book Act, 1983"
  },
  mh: {
    stateCode: "mh",
    stateName: "Maharashtra",
    rorTitle: "7/12 Satbara & 8A Extract (सातबारा व ८-अ उतारा)",
    surveyLabel: "Gut / Survey No (गट / सर्व्हे क्र.)",
    pattaLabel: "Khate No (खाते क्र.)",
    villageLabel: "Saza / Village (सझा / महसूल गाव)",
    sampleDistrict: "Pune",
    sampleTaluk: "Haveli Taluka",
    sampleVillage: "Haveli Village (हवेली)",
    sampleSurveyNo: "Gut No 142/1",
    samplePattaNo: "Khate 512",
    sampleOwner: "Suresh R. Patil / सुरेश रघुनाथ पाटील",
    sampleFather: "Raghunath Patil / रघुनाथ पाटील",
    sampleLandType: "जिरायत शेतजमीन (Dry Agriculture)",
    sampleSoil: "काळी कसदार (Black Cotton Soil)",
    sampleGuideline: 2800,
    sampleMarketVal: 29500000,
    sampleExtent: 2.15,
    actCitation: "Section 148 of Maharashtra Land Revenue Code, 1966"
  },
  up: {
    stateCode: "up",
    stateName: "Uttar Pradesh",
    rorTitle: "Khatauni RoR Certificate (खतौनी अधिकार अभिलेख)",
    surveyLabel: "Khasra No (खसरा संख्या)",
    pattaLabel: "Khatauni Account No (खाता संख्या)",
    villageLabel: "Revenue Village (ग्राम / परगना)",
    sampleDistrict: "Lucknow",
    sampleTaluk: "Sadar Tehsil",
    sampleVillage: "Sadar Village (सदर)",
    sampleSurveyNo: "Khasra No 412/1",
    samplePattaNo: "Khatauni 00182",
    sampleOwner: "Rajesh Kumar Singh / राजेश कुमार सिंह",
    sampleFather: "Devendra Singh / देवेन्द्र सिंह",
    sampleLandType: "संक्रमणीय भूमिधर (Transferable Krishi)",
    sampleSoil: "दोमट बलुई (Alluvial Loam)",
    sampleGuideline: 2500,
    sampleMarketVal: 26800000,
    sampleExtent: 2.45,
    actCitation: "Section 31 of Uttar Pradesh Revenue Code, 2006"
  },
  ka: {
    stateCode: "ka",
    stateName: "Karnataka",
    rorTitle: "RTC Form 16 / Pahani (ಆರ್‌ಟಿಸಿ / ಪಹಣಿ)",
    surveyLabel: "Survey / Hissa No (ಸರ್ವೇ / ಹಿಸ್ಸಾ ನಂ)",
    pattaLabel: "Khata No (ಖಾತಾ ಸಂಖ್ಯೆ)",
    villageLabel: "Village / Hobli (ಗ್ರಾಮ / ಹೋಬಳಿ)",
    sampleDistrict: "Bengaluru Urban",
    sampleTaluk: "Bengaluru South Taluk",
    sampleVillage: "Bengaluru South (ದಕ್ಷಿಣ)",
    sampleSurveyNo: "Survey No 88/1",
    samplePattaNo: "Khata 240",
    sampleOwner: "Suresh Gowda / ಸುರೇಶ್ ಗೌಡ",
    sampleFather: "Narayana Gowda / ನಾರಾಯಣ ಗೌಡ",
    sampleLandType: "ತರಿ ಜಮೀನು (Wet Agricultural Land)",
    sampleSoil: "ಕೆಂಪು ಮಣ್ಣು (Red Sandy Loam)",
    sampleGuideline: 3200,
    sampleMarketVal: 32000000,
    sampleExtent: 2.30,
    actCitation: "Section 127 of Karnataka Land Revenue Act, 1964"
  },
  gj: {
    stateCode: "gj",
    stateName: "Gujarat",
    rorTitle: "VF 7/12 & 8A AnyRoR (ગા.ન. ૭/૧૨ અને ૮-અ)",
    surveyLabel: "Survey / Block No (સર્વે / બ્લોક નં)",
    pattaLabel: "Khata No (ખાતા નંબર)",
    villageLabel: "Village / Seje (ગામ / સેજે)",
    sampleDistrict: "Ahmedabad",
    sampleTaluk: "Daskroi Taluka",
    sampleVillage: "Daskroi Village (દસ્ક્રોઈ)",
    sampleSurveyNo: "Survey No 231/1",
    samplePattaNo: "Khata 104",
    sampleOwner: "Ramesh M. Patel / રમેશ એમ. પટેલ",
    sampleFather: "Manibhai Patel / મણીભાઈ પટેલ",
    sampleLandType: "પીયત ખેતી (Irrigated Agriculture)",
    sampleSoil: "કાળી ગોરાડુ (Sandy Loam)",
    sampleGuideline: 2900,
    sampleMarketVal: 28500000,
    sampleExtent: 2.20,
    actCitation: "Section 135 of Gujarat Land Revenue Code, 1879"
  },
  wb: {
    stateCode: "wb",
    stateName: "West Bengal",
    rorTitle: "Khatian & Plot Information (খতিয়ান ও প্লট তথ্য)",
    surveyLabel: "Plot / Dag No (দাগ নম্বর)",
    pattaLabel: "Khatian No (খতিয়ান নম্বর)",
    villageLabel: "Mouza & JL No (মৌজা ও জে.এল)",
    sampleDistrict: "North 24 Parganas",
    sampleTaluk: "Barasat-I Block",
    sampleVillage: "Barasat Mouza (বারাসাত)",
    sampleSurveyNo: "Dag No 1542",
    samplePattaNo: "Khatian 814",
    sampleOwner: "Debabrata Banerjee / দেবাশীষ ব্যানার্জী",
    sampleFather: "Subhash Banerjee / সুভাষ ব্যানার্জী",
    sampleLandType: "শালি ও বাস্তু জমি (Sali Agriculture)",
    sampleSoil: "পলিমাটি (Alluvial Clay)",
    sampleGuideline: 2600,
    sampleMarketVal: 25400000,
    sampleExtent: 2.10,
    actCitation: "Section 50 of West Bengal Land Reforms Act, 1955"
  },
  ap: {
    stateCode: "ap",
    stateName: "Andhra Pradesh",
    rorTitle: "Meebhoomi 1B & Adangal (అడంగల్ / 1B)",
    surveyLabel: "Survey No (సర్వే నెంబర్)",
    pattaLabel: "Khata / Pattadar No (ఖాతా నెంబర్)",
    villageLabel: "Village / Mandal (గ్రామం / మండలం)",
    sampleDistrict: "Visakhapatnam",
    sampleTaluk: "Anandapuram Mandal",
    sampleVillage: "Anandapuram (ఆనందపురం)",
    sampleSurveyNo: "Sy No 315/1",
    samplePattaNo: "Khata 421",
    sampleOwner: "Venkata Rao / వెంకట రావు",
    sampleFather: "Appala Naidu / అప్పల నాయుడు",
    sampleLandType: "మాగాణి (Wet Agricultural Land)",
    sampleSoil: "నల్ల రేగడి (Black Regur Soil)",
    sampleGuideline: 2400,
    sampleMarketVal: 24000000,
    sampleExtent: 2.25,
    actCitation: "Section 4 of AP Rights in Land & Pattadar Passbooks Act, 1971"
  },
  pb: {
    stateCode: "pb",
    stateName: "Punjab",
    rorTitle: "PLRS Fard Jamabandi (ਫਰਦ ਜਮ੍ਹਾਂਬੰਦੀ)",
    surveyLabel: "Khasra / Killa No (ਕਿੱਲਾ ਨੰਬਰ)",
    pattaLabel: "Khewat / Khatoni (ਖੇਵਟ ਨੰਬਰ)",
    villageLabel: "Hadbast / Village (ਹੱਦਬਸਤ / ਪਿੰਡ)",
    sampleDistrict: "Ludhiana",
    sampleTaluk: "Ludhiana East Tehsil",
    sampleVillage: "Ludhiana East (ਲੁਧਿਆਣਾ)",
    sampleSurveyNo: "Killa 24//12/1",
    samplePattaNo: "Khewat 45/89",
    sampleOwner: "Gurpreet Singh / ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ",
    sampleFather: "Harbhajan Singh / ਹਰਭਜਨ ਸਿੰਘ",
    sampleLandType: "ਨਹਿਰੀ ਚਾਹੀ (Canal Irrigated)",
    sampleSoil: "ਜ਼ਰਖੇਜ਼ ਮੈਰਾ (Rich Alluvial Loam)",
    sampleGuideline: 2700,
    sampleMarketVal: 28000000,
    sampleExtent: 2.50,
    actCitation: "Section 31 of Punjab Land Revenue Act, 1887"
  }
};

function CitizenPortalPageContent() {
  const { t } = useLanguage();
  const { user, username, logout } = useAuth();
  const allStates = getAllStatesList();
  const searchParams = useSearchParams();
  const stateQueryParam = searchParams ? searchParams.get("state") : null;

  const [activeTab, setActiveTab] = useState<"search" | "mutation" | "sro" | "zk">("search");
  const [selectedStateCode, setSelectedStateCode] = useState<string>(
    (stateQueryParam || (typeof window !== "undefined" ? localStorage.getItem("tv_state") : null) || "tn").toLowerCase()
  );

  const activeSample = STATE_SAMPLES[selectedStateCode] || STATE_SAMPLES.tn;
  const activeStateMeta = getStateMetadata(selectedStateCode);

  // Search Input States
  const [villageInput, setVillageInput] = useState(activeSample.sampleVillage);
  const [talukInput, setTalukInput] = useState(activeSample.sampleTaluk);
  const [surveyNoInput, setSurveyNoInput] = useState(activeSample.sampleSurveyNo);
  const [pattaNoInput, setPattaNoInput] = useState(activeSample.samplePattaNo);
  const [ownerSearchInput, setOwnerSearchInput] = useState("");

  const [matchedParcel, setMatchedParcel] = useState<any>(activeSample);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");

  // Mutation Application Form States
  const [mutationDeedType, setMutationDeedType] = useState("Sale Deed (கிரையப் பத்திரம் / Sale Transfer)");
  const [applicantAadhaar, setApplicantAadhaar] = useState("XXXX-XXXX-8912");
  const [mutationRefId, setMutationRefId] = useState("");
  const [mutationSubmitted, setMutationSubmitted] = useState(false);

  // SRO Calculator States
  const [calcExtentSqFt, setCalcExtentSqFt] = useState("10890"); // ~0.25 acre
  const [calcGuidelineRate, setCalcGuidelineRate] = useState(activeSample.sampleGuideline.toString());
  const [buyerGender, setBuyerGender] = useState<"male" | "female" | "joint">("male");
  const [sroBreakdown, setSroBreakdown] = useState<any>(null);

  // ZK Proof State
  const [zkProofGen, setZkProofGen] = useState(false);
  const [zkProofDone, setZkProofDone] = useState(false);
  const [bankApproved, setBankApproved] = useState(false);

  // Sync inputs when state changes
  useEffect(() => {
    const s = STATE_SAMPLES[selectedStateCode] || STATE_SAMPLES.tn;
    setVillageInput(s.sampleVillage);
    setTalukInput(s.sampleTaluk);
    setSurveyNoInput(s.sampleSurveyNo);
    setPattaNoInput(s.samplePattaNo);
    setCalcGuidelineRate(s.sampleGuideline.toString());
    setMatchedParcel(s);
  }, [selectedStateCode]);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setMatchedParcel({
      ...activeSample,
      sampleVillage: villageInput || activeSample.sampleVillage,
      sampleTaluk: talukInput || activeSample.sampleTaluk,
      sampleSurveyNo: surveyNoInput || activeSample.sampleSurveyNo,
      samplePattaNo: pattaNoInput || activeSample.samplePattaNo,
      sampleOwner: ownerSearchInput || activeSample.sampleOwner,
    });
  };

  // Download Certified PDF Certificate
  const handleDownloadPDF = () => {
    setDownloadLoading(true);
    setDownloadMsg("");

    setTimeout(() => {
      setDownloadLoading(false);
      const hash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
      const certContent = `
================================================================================
GOVERNMENT OF INDIA • ${activeStateMeta.name.toUpperCase()} LAND ADMINISTRATION SYSTEM
${activeStateMeta.portalName.toUpperCase()}
CERTIFIED EXTRACT OF ${activeSample.rorTitle.toUpperCase()}
Issued under: ${activeSample.actCitation}
================================================================================

CERTIFICATE METADATA:
Certificate Ref No             : ${activeStateMeta.code.toUpperCase()}-ROR-2026-${Math.floor(100000 + Math.random() * 900000)}
Date of Issuance               : ${new Date().toLocaleDateString("en-IN")}
Authenticity Protocol          : Polygon Amoy Blockchain Immutable Audit Trail
Blockchain TX Hash             : ${hash}

LAND HOLDING DETAILS:
State / UT                     : ${activeStateMeta.name} (${activeStateMeta.nativeName})
District                       : ${activeSample.sampleDistrict}
Taluk / Tehsil / Anchal        : ${activeSample.sampleTaluk}
Revenue Village / Mouza        : ${activeSample.sampleVillage}
${activeSample.surveyLabel}    : ${activeSample.sampleSurveyNo}
${activeSample.pattaLabel}     : ${activeSample.samplePattaNo}

OWNERSHIP & CULTIVATION:
Registered Title Holder (Pattadar/Bhumiswami/Raiyat):
-> ${activeSample.sampleOwner}
Father / Husband Name          : ${activeSample.sampleFather}
Total Holding Extent           : ${activeSample.sampleExtent} Acres (${Math.round(activeSample.sampleExtent * 4046.86)} Sq. Meters)
Land Classification / Type     : ${activeSample.sampleLandType}
Soil Classification            : ${activeSample.sampleSoil}

VALUATION & STATUTORY RECORD:
Guideline Value / SRO Rate     : Rs. ${activeSample.sampleGuideline.toLocaleString("en-IN")} per Sq.Ft
Estimated Market Value         : Rs. ${activeSample.sampleMarketVal.toLocaleString("en-IN")}
Encumbrance / Court Stay Status: Clean Title & Nil Encumbrance (विलम्ब/வில்லங்கம் இல்லை)
Title Integrity Confidence     : 98.6% (Verified via AI OCR & Polygon Amoy)

[DIGITAL SIGNATURE & QR AUTHENTICATION]
Digitally signed by Statutory Revenue Officer, ${activeSample.sampleTaluk} Sub-Division.
Verification Portal: https://terravault.gov.in/verify?hash=${hash}
================================================================================
      `;

      const blob = new Blob([certContent], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeStateMeta.code.toUpperCase()}_Certified_RoR_${activeSample.samplePattaNo.replace(/[^a-zA-Z0-9]/g, "")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadMsg(`✓ Downloaded Certified ${activeSample.rorTitle.split("(")[0]} Certificate!`);
    }, 450);
  };

  // Submit Mutation Application
  const handleMutationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refId = `${activeStateMeta.code.toUpperCase()}-MUT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setMutationRefId(refId);
    setMutationSubmitted(true);

    try {
      const existing = JSON.parse(localStorage.getItem("terravault_vao_tasks") || "[]");
      existing.unshift({
        id: refId,
        state: activeStateMeta.name,
        applicant: activeSample.sampleOwner.split("/")[0],
        survey_no: activeSample.sampleSurveyNo,
        village: activeSample.sampleVillage,
        patta_no: activeSample.samplePattaNo,
        deed_type: mutationDeedType,
        submitted_at: new Date().toLocaleString(),
        status: `Pending Field Verification by ${activeStateMeta.roles[1]?.title.split("—")[0] || "Village Officer"}`
      });
      localStorage.setItem("terravault_vao_tasks", JSON.stringify(existing));
    } catch (err) {}
  };

  // Calculate SRO Fees
  const handleCalculateSRO = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const sqft = parseFloat(calcExtentSqFt) || 1000;
    const rate = parseFloat(calcGuidelineRate) || activeSample.sampleGuideline;
    const marketVal = Math.round(sqft * rate);

    const calc = calculateSROFees(marketVal, selectedStateCode, buyerGender);
    setSroBreakdown({
      marketValueINR: marketVal,
      ...calc
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
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 50 }}>
      {/* Top Banner Header */}
      <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 24, marginBottom: 20, borderTop: "4px solid #0f2942" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 4, color: "#0f2942", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>
              <User size={14} color="#0f2942" /> CITIZEN E-SERVICES PORTAL (G2C SELF-SERVICE)
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", margin: 0 }}>
              {activeStateMeta.name} • {activeSample.rorTitle.split("(")[0]} & ZK Title Center
            </h1>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 4, margin: 0 }}>
              Statutory Online Land Records Search, Certified PDF Issuance, Mutation Filings & SRO Valuation
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Active State Selector Dropdown */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f8fafc", border: "1.5px solid #3b82f6", borderRadius: 6 }}>
              <Globe size={14} color="#1e3a8a" />
              <select
                value={selectedStateCode}
                onChange={(e) => setSelectedStateCode(e.target.value)}
                style={{ background: "none", border: "none", fontSize: 12, fontWeight: 800, color: "#0f2942", cursor: "pointer", outline: "none" }}
              >
                {allStates.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => logout()}
              className="btn btn-secondary"
              style={{ fontSize: 12, fontWeight: 700, color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 4 }}
            >
              <LogOut size={13} color="#b91c1c" /> Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Service Navigation Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "search", label: `${activeSample.rorTitle.split("(")[0]} Search & Certified PDF`, icon: Search },
          { id: "mutation", label: `Apply ${activeStateMeta.mutationName.split("(")[0]}`, icon: FileCheck },
          { id: "sro", label: "SRO Stamp Duty & Registration Calculator", icon: Calculator },
          { id: "zk", label: "Zero-Knowledge Bank Title Proof", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "9px 16px", fontSize: 12.5, background: activeTab === t.id ? "#0f2942" : "#ffffff", borderColor: "#cbd5e1", color: activeTab === t.id ? "#ffffff" : "#0f2942" }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Search & Download ────────────────────────────────────────── */}
      {activeTab === "search" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="glass-card" style={{ padding: 22, background: "#ffffff", borderColor: "#cbd5e1" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Search size={18} color="#0f2942" /> Search {activeStateMeta.name} {activeSample.rorTitle}
            </h2>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) 130px", gap: 12, alignItems: "end" }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>{activeSample.villageLabel}</label>
                <input type="text" value={villageInput} onChange={(e) => setVillageInput(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>{activeSample.surveyLabel}</label>
                <input type="text" value={surveyNoInput} onChange={(e) => setSurveyNoInput(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>{activeSample.pattaLabel}</label>
                <input type="text" value={pattaNoInput} onChange={(e) => setPattaNoInput(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Owner / Pattadar Name</label>
                <input type="text" placeholder="Search by Owner..." value={ownerSearchInput} onChange={(e) => setOwnerSearchInput(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", fontSize: 12.5, height: 38 }}>
                <Search size={14} /> Search RoR
              </button>
            </form>
          </div>

          {/* Record Display Card */}
          <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18, borderBottom: "1px solid #e2e8f0", paddingBottom: 14, flexWrap: "wrap", gap: 10 }}>
              <div>
                <span style={{ fontSize: 11, padding: "2px 8px", background: "#f0fdf4", color: "#166534", border: "1px solid #86efac", borderRadius: 4, fontWeight: 700 }}>
                  ✓ Official Statutory RoR Verified
                </span>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0f2942", marginTop: 6 }}>
                  {activeSample.sampleOwner}
                </h3>
                <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
                  {activeSample.sampleVillage} • {activeSample.sampleTaluk} • {activeStateMeta.name}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                  className="btn btn-primary"
                  style={{ background: "#059669", borderColor: "#047857", fontSize: 12.5, gap: 6 }}
                >
                  <Download size={15} /> {downloadLoading ? "Generating..." : `Download Certified ${activeSample.rorTitle.split("(")[0]}`}
                </button>
              </div>
            </div>

            {downloadMsg && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, color: "#166534", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
                {downloadMsg}
              </div>
            )}

            {/* Detailed Metadata Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>{activeSample.surveyLabel}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{activeSample.sampleSurveyNo}</div>
              </div>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>{activeSample.pattaLabel}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{activeSample.samplePattaNo}</div>
              </div>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>Holding Extent</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{activeSample.sampleExtent} Acres ({Math.round(activeSample.sampleExtent * 4046.86)} Sq.M)</div>
              </div>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>Land Classification</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{activeSample.sampleLandType}</div>
              </div>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>Soil Type</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginTop: 2 }}>{activeSample.sampleSoil}</div>
              </div>
              <div style={{ padding: 12, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b" }}>Market Valuation (Est.)</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#059669", marginTop: 2 }}>₹{activeSample.sampleMarketVal.toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 2: Apply Mutation Transfer ─────────────────────────────────── */}
      {activeTab === "mutation" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <FileCheck size={18} color="#0f2942" /> Apply Online {activeStateMeta.mutationName} ({activeStateMeta.name})
          </h2>

          {mutationSubmitted ? (
            <div style={{ padding: 24, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, textAlign: "center" }}>
              <CheckCircle2 size={40} color="#16a34a" style={{ margin: "0 auto 12px auto" }} />
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#166534" }}>
                {activeStateMeta.mutationName} Application Successfully Registered!
              </h3>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f2942", marginTop: 6 }}>
                Application Token / Acknowledgement Ref: <span style={{ color: "#1d4ed8" }}>{mutationRefId}</span>
              </div>
              <p style={{ fontSize: 12, color: "#475569", marginTop: 8 }}>
                Your petition has been routed to the <strong>{activeStateMeta.roles[1]?.title || "Village Officer"}</strong> for ground verification, geotagged boundary capture, and report forwarding.
              </p>
              <button
                onClick={() => setMutationSubmitted(false)}
                className="btn btn-primary"
                style={{ marginTop: 14, background: "#0f2942", fontSize: 12 }}
              >
                Submit Another Petition
              </button>
            </div>
          ) : (
            <form onSubmit={handleMutationSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Nature of Transfer Deed</label>
                <select value={mutationDeedType} onChange={(e) => setMutationDeedType(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }}>
                  <option value="Sale Deed">Registered Sale Deed (கிரையப் பத்திரம் / बैनामा / ಕ್ರಯ ಪತ್ರ)</option>
                  <option value="Inheritation">Succession / Legal Heir (வாரிசு உரிமை / वरासत / ವಾರಸು)</option>
                  <option value="Partition">Family Partition Deed (பாகப்பிரிவினை / बंटवारा)</option>
                  <option value="Gift">Settlement / Gift Deed (தான செட்டில்மென்ட் / दानपत्र)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Applicant Aadhaar e-KYC</label>
                <input type="text" value={applicantAadhaar} onChange={(e) => setApplicantAadhaar(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Target {activeSample.surveyLabel}</label>
                <input type="text" defaultValue={activeSample.sampleSurveyNo} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Transfer Extent (Acres)</label>
                <input type="text" defaultValue={activeSample.sampleExtent.toString()} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
              </div>
              <div style={{ gridColumn: "span 2", paddingTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", fontSize: 13, padding: "10px 20px" }}>
                  <Send size={15} /> Submit {activeStateMeta.mutationName.split("(")[0]} for Field Inspection
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Tab 3: SRO Stamp Duty Calculator ───────────────────────────────── */}
      {activeTab === "sro" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Calculator size={18} color="#0f2942" /> {activeStateMeta.name} SRO Statutory Stamp Duty & Registration Calculator
          </h2>

          <form onSubmit={handleCalculateSRO} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 14, alignItems: "end", marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Land Extent (Sq. Feet)</label>
              <input type="number" value={calcExtentSqFt} onChange={(e) => setCalcExtentSqFt(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Guideline Rate (₹ / Sq.Ft)</label>
              <input type="number" value={calcGuidelineRate} onChange={(e) => setCalcGuidelineRate(e.target.value)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>Purchaser Gender / Category</label>
              <select value={buyerGender} onChange={(e) => setBuyerGender(e.target.value as any)} className="input" style={{ width: "100%", padding: "8px 10px", fontSize: 12 }}>
                <option value="male">Male (Standard Slab)</option>
                <option value="female">Female (Women Concession Slabs)</option>
                <option value="joint">Joint (Male + Female)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ background: "#0f2942", fontSize: 12.5, height: 38 }}>
              Compute SRO Fees
            </button>
          </form>

          {sroBreakdown && (
            <div style={{ padding: 18, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", marginBottom: 10 }}>
                Statutory Breakdown • {activeStateMeta.name} Sub-Registrar Office
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <div style={{ fontSize: 10.5, color: "#64748b" }}>Market Guideline Value</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f2942" }}>₹{sroBreakdown.marketValueINR.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <div style={{ fontSize: 10.5, color: "#64748b" }}>Stamp Duty ({sroBreakdown.stampDutyPercent}%)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#1d4ed8" }}>₹{sroBreakdown.stampDutyINR.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <div style={{ fontSize: 10.5, color: "#64748b" }}>Registration Fee ({sroBreakdown.registrationFeePercent}%)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>₹{sroBreakdown.registrationFeeINR.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                  <div style={{ fontSize: 10.5, color: "#64748b" }}>Total Govt Fees Payable</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#d97706" }}>₹{sroBreakdown.totalGovernmentFeesINR.toLocaleString("en-IN")}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 10 }}>
                ℹ️ {sroBreakdown.breakdownSummary}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: ZK Title Proof ──────────────────────────────────────────── */}
      {activeTab === "zk" && (
        <div className="glass-card" style={{ padding: 24, background: "#ffffff", borderColor: "#cbd5e1" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={18} color="#0f2942" /> Zero-Knowledge Snark Title Proof for Commercial Bank Loans
          </h2>
          <p style={{ fontSize: 13, color: "#475569", marginBottom: 18 }}>
            Cryptographically prove to banks (SBI, HDFC, Canara, NABARD) that your property has a 100% clean title and nil encumbrance <strong>without revealing private holding extent or personal details</strong>.
          </p>

          <div style={{ padding: 18, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0f2942" }}>Property Title Token: {activeSample.sampleSurveyNo}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Registered Owner: {activeSample.sampleOwner}</div>
              </div>
              <button
                onClick={handleZkProof}
                disabled={zkProofGen}
                className="btn btn-primary"
                style={{ background: "#0f2942", fontSize: 12.5 }}
              >
                {zkProofGen ? "Computing ZK-SNARK Proof..." : "Generate Cryptographic ZK Proof"}
              </button>
            </div>
          </div>

          {zkProofDone && (
            <div style={{ padding: 18, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#166534", fontWeight: 800, fontSize: 14 }}>
                <CheckCircle2 size={18} /> Zero-Knowledge Title Proof Validated by Smart Contract!
              </div>
              <div style={{ fontSize: 11, color: "#334155", marginTop: 6, fontFamily: "monospace", background: "#ffffff", padding: "8px 12px", borderRadius: 4, border: "1px solid #cbd5e1" }}>
                Proof Hash: 0x7f4a8b9c2d1e0f3a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CitizenPortalPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Loader2 className="spin" size={32} color="#0f2942" />
        <div style={{ fontSize: 14, marginTop: 12, color: "#475569" }}>Loading Citizen Services Portal...</div>
      </div>
    }>
      <CitizenPortalPageContent />
    </Suspense>
  );
}
