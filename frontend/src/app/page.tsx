"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Search, MapPin, Layers, CheckCircle2, ArrowRight, ShieldCheck,
  Zap, Globe, FileText, Building2, ChevronDown, ChevronUp,
  ExternalLink, Compass, Eye, Sparkles, Navigation, Phone, Mail,
  ArrowUp, Play, Check, Filter, Landmark
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getAllStatesList, INDIAN_REGIONS } from "@/lib/stateRegistry";

const TN_DISTRICTS_POPULAR = [
  { nameEn: "Coimbatore", nameTa: "கோயம்புத்தூர்", lat: 11.0168, lng: 76.9558, tag: "Kongu Region • FMB Active", plots: "84,250+" },
  { nameEn: "Chennai", nameTa: "சென்னை", lat: 13.0827, lng: 80.2707, tag: "Capital Metro • Smart GIS", plots: "120,400+" },
  { nameEn: "Madurai", nameTa: "மதுரை", lat: 9.9252, lng: 78.1198, tag: "Southern Hub • Heritage", plots: "65,120+" },
  { nameEn: "Tiruchirappalli", nameTa: "திருச்சிராப்பள்ளி", lat: 10.7905, lng: 78.7047, tag: "Cauvery Delta • Central", plots: "58,900+" },
  { nameEn: "Salem", nameTa: "சேலம்", lat: 11.6643, lng: 78.1460, tag: "Steel & Mineral Zone", plots: "52,300+" },
  { nameEn: "Kanchipuram", nameTa: "காஞ்சிபுரம்", lat: 12.8342, lng: 79.7036, tag: "Industrial & Heritage", plots: "47,800+" },
  { nameEn: "Tirunelveli", nameTa: "திருநெல்வேலி", lat: 8.7139, lng: 77.7567, tag: "Thamirabarani Basin", plots: "41,200+" },
  { nameEn: "Erode", nameTa: "ஈரோடு", lat: 11.3410, lng: 77.7172, tag: "Textile & Agri Hub", plots: "39,800+" },
];

const FAQS = [
  {
    q: "What is Terra_vault?",
    a: "Terra_vault is an AI-powered spatial land intelligence platform that unifies multilingual legacy deed extraction, cadastral FMB vector mapping, and tamper-proof blockchain audit trails into a single next-generation platform."
  },
  {
    q: "How do I search for a land parcel by Survey Number or Patta Number?",
    a: "Click 'Launch GIS Map' to open the 2D Cadastral Viewer. Select your District and Taluk from the top toolbar, then enter the Survey Number (e.g. 142/3A) or Patta Number in the search bar for instant camera centering and polygon highlight."
  },
  {
    q: "What is the source of the Cadastral FMB boundaries?",
    a: "Cadastral boundaries and survey sub-divisions are synchronized in real-time from official Survey & Settlement Department vector services, overlaid with high-resolution satellite imagery."
  },
  {
    q: "How does the Polygon Blockchain verification work?",
    a: "Every digitized Patta record, mutation deed, and cadastral survey hash is anchored as an immutable cryptographic block on the Polygon Amoy public testnet ledger, preventing fraudulent deed tampering or double-allocation."
  }
];

export default function TerraVaultHomePage() {
  const { t } = useLanguage();
  const allStates = useMemo(() => getAllStatesList(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredStates = useMemo(() => {
    return allStates.filter((st) => {
      const matchesRegion = selectedRegion === "All" || st.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRegion;

      return (
        matchesRegion &&
        (st.name.toLowerCase().includes(q) ||
          st.nativeName.toLowerCase().includes(q) ||
          st.portalName.toLowerCase().includes(q) ||
          st.rorName.toLowerCase().includes(q) ||
          st.languages.some((l) => l.toLowerCase().includes(q)) ||
          st.sampleDistrict.toLowerCase().includes(q))
      );
    });
  }, [allStates, searchQuery, selectedRegion]);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ── 1. HERO SECTION (National Slate Navy Header) ───────────────────── */}
      <section className="tn-hero-bg" style={{ color: "#ffffff", padding: "54px 32px 64px", position: "relative" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 40, alignItems: "center" }}>
          
          {/* Left Column: Heading, Subtitle, Badges & CTAs */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "rgba(255, 255, 255, 0.1)", borderRadius: 4, border: "1px solid rgba(255, 255, 255, 0.2)", color: "#93c5fd", fontSize: 11.5, fontWeight: 700, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
              DILRMP 2.0 • NATIONAL SPATIAL CADASTRE & RECORD OF RIGHTS
            </div>

            <h1 style={{ fontSize: "clamp(30px, 3.8vw, 44px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.18, marginBottom: 16, fontFamily: "var(--font-head)" }}>
              National Land Intelligence & Cadastral Verification
            </h1>

            <p style={{ fontSize: 15.5, color: "#cbd5e1", lineHeight: 1.6, marginBottom: 24, maxWidth: 540 }}>
              Statutory spatial intelligence platform for land administration. Inspect cadastral survey vectors, Field Measurement Books (FMB), Record of Rights (RoR), and cryptographic blockchain audit records in a single unified interface.
            </p>

            {/* Feature Pill Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 30 }}>
              <span className="tn-pill-badge">
                <Search size={14} color="#60a5fa" /> Survey & Patta Search
              </span>
              <span className="tn-pill-badge">
                <Layers size={14} color="#60a5fa" /> Cadastral FMB Vectors
              </span>
              <span className="tn-pill-badge">
                <ShieldCheck size={14} color="#60a5fa" /> Polygon Amoy Ledger
              </span>
              <span className="tn-pill-badge">
                <Globe size={14} color="#60a5fa" /> 36 States & UTs
              </span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/map" className="btn-primary" style={{ padding: "10px 22px", fontSize: 14, background: "#1e40af" }}>
                <Play size={15} fill="#ffffff" /> Launch Cadastral Map
              </Link>
              <Link href="/records" className="btn-secondary" style={{ padding: "10px 20px", fontSize: 14, background: "rgba(255,255,255,0.1)", color: "#ffffff !important", borderColor: "rgba(255,255,255,0.25)" }}>
                <FileText size={15} /> Search Land Records
              </Link>
            </div>
          </div>

          {/* Right Column: High-Precision Enterprise Cadastral Card */}
          <div style={{ position: "relative" }}>
            <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 18, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.25)", color: "#0f172a" }}>
              
              {/* Header Strip */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 10, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#059669" }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0f2942" }}>OFFICIAL CADASTRAL PARCEL SPECIMEN</span>
                </div>
                <span className="badge badge-verified" style={{ fontSize: 11 }}>
                  <ShieldCheck size={12} /> Cryptographically Anchored
                </span>
              </div>

              {/* Vector Geometry Specimen */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "16px 12px", position: "relative", marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
                  <span>Spatial Mesh: Kinathukadavu (Taluk)</span>
                  <span>Scale: 1:1,000 Cadastre</span>
                </div>

                <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                  {/* Grid lines for CAD feel */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)", backgroundSize: "20px 20px", opacity: 0.6 }} />
                  
                  <svg viewBox="0 0 280 140" style={{ width: "100%", height: "100%", position: "relative", zIndex: 1 }}>
                    <polygon
                      points="35,20 225,12 255,110 55,130"
                      fill="rgba(30, 64, 175, 0.08)"
                      stroke="#1e40af"
                      strokeWidth="2"
                    />
                    <line x1="140" y1="16" x2="155" y2="120" stroke="#059669" strokeWidth="1.5" strokeDasharray="4 2" />
                    
                    {/* Survey Nodes */}
                    <circle cx="35" cy="20" r="3.5" fill="#1e40af" />
                    <circle cx="225" cy="12" r="3.5" fill="#1e40af" />
                    <circle cx="255" cy="110" r="3.5" fill="#1e40af" />
                    <circle cx="55" cy="130" r="3.5" fill="#1e40af" />
                    <circle cx="148" cy="68" r="4" fill="#b91c1c" />

                    <text x="85" y="75" fill="#1e40af" fontSize="13" fontWeight="bold" fontFamily="sans-serif">84/1A</text>
                    <text x="185" y="65" fill="#059669" fontSize="13" fontWeight="bold" fontFamily="sans-serif">84/1B</text>
                  </svg>

                  <div style={{ position: "absolute", bottom: 8, right: 8, background: "#0f2942", color: "#ffffff", padding: "2px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700 }}>
                    Area: 1.42 Hectares (3.51 Acres)
                  </div>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 10.5, fontWeight: 600 }}>SURVEY / SUB-DIVISION</div>
                  <div style={{ fontWeight: 800, color: "#0f2942", marginTop: 2 }}>Survey No: 84 / 1A</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "8px 10px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                  <div style={{ color: "#64748b", fontSize: 10.5, fontWeight: 600 }}>UNIQUE LAND PARCEL ID</div>
                  <div style={{ fontWeight: 800, color: "#0f2942", marginTop: 2, fontFamily: "monospace" }}>ULPIN: 33-04-1824</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  Coimbatore District • Kinathukadavu Village
                </div>
                <Link href="/map" style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>
                  Inspect Coordinates <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 2. "WHAT IS TERRA_VAULT" SECTION ─────────────────────────────────── */}
      <section id="about" style={{ padding: "64px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 48, alignItems: "center" }}>
          
          {/* Left: Explanatory Content */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              Institutional Architecture
            </div>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, color: "#0f2942", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 16, fontFamily: "var(--font-head)" }}>
              Digital Land Administration & Spatial Cadastre
            </h2>

            <p style={{ fontSize: 14.5, color: "#334155", lineHeight: 1.65, marginBottom: 14 }}>
              Terra_vault delivers an integrated digital cadastre solution compliant with the National Land Records Modernization Programme (DILRMP 2.0). It standardizes multilingual legacy revenue deeds, cadastral vector boundaries, and public cryptographic registries.
            </p>

            <p style={{ fontSize: 14.5, color: "#334155", lineHeight: 1.65, marginBottom: 24 }}>
              Built for citizens, village administrative officers (VAOs), revenue inspectors, registrars, and banking institutions to streamline mutation processing, verify titles, and eliminate boundary disputes.
            </p>

            {/* Checkmark Bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Direct synchronization with state Survey & Settlement Department vector services",
                "High-accuracy multilingual OCR engine supporting 14 Indic scripts with field confidence scoring",
                "Tamper-evident Polygon public blockchain anchoring for verified mutation certificates"
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, color: "#0f2942" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={12} color="#047857" strokeWidth={3} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Architectural Workflow Card */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "#f8fafc",
              borderRadius: 8,
              padding: 24,
              border: "1px solid #cbd5e1",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 16
            }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#0f2942", borderBottom: "1px solid #e2e8f0", paddingBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <Landmark size={16} color="#1e40af" /> Integrated Governance Flow
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { step: "01", title: "Document Ingestion & Image Restoration", desc: "Deskew, CLAHE, and Sauvola binarization of aged or handwritten land deeds." },
                  { step: "02", title: "Multilingual OCR & NER Field Extraction", desc: "Automated extraction of Patta numbers, survey bounds, owner names, and area." },
                  { step: "03", title: "Cadastral Boundary Cross-Validation", desc: "Topological verification against official LGD directories and GIS shapefiles." },
                  { step: "04", title: "Cryptographic Title Anchoring", desc: "Immutable SHA3-256 hash anchored on Polygon Amoy for audit transparency." },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "#ffffff", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#1e40af", fontFamily: "monospace" }}>{item.step}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942" }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. THREE CORE PILLARS GRID ───────────────────────────────────────── */}
      <section style={{ padding: "64px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Core Capabilities
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", fontFamily: "var(--font-head)" }}>
              Engineered for Revenue Administration & Public Trust
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              High-throughput spatial cadastre infrastructure and digitized title repository.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Card 1 */}
            <div className="gov-card" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: "#eff6ff", border: "1px solid #bfdbfe", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Globe size={22} color="#1e40af" />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: "#0f2942", marginBottom: 8 }}>National Spatial Gateway</h4>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Comprehensive coverage of all 36 Indian States & UTs with high-resolution cadastral vector meshes and instant spatial navigation from state down to sub-division parcels.
              </p>
            </div>

            {/* Card 2 */}
            <div className="gov-card" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: "#ecfdf5", border: "1px solid #a7f3d0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Zap size={22} color="#047857" />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: "#0f2942", marginBottom: 8 }}>Automated Document Digitization</h4>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Sub-second parcel centroid discovery, bilingual Patta/Chitta extraction, and automated cross-verification against Local Government Directory (LGD) databases.
              </p>
            </div>

            {/* Card 3 */}
            <div className="gov-card" style={{ padding: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 6, background: "#fffbeb", border: "1px solid #fde68a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <ShieldCheck size={22} color="#b45309" />
              </div>
              <h4 style={{ fontSize: 17, fontWeight: 800, color: "#0f2942", marginBottom: 8 }}>Cryptographic Audit Ledger</h4>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                DILRMP 2.0 certified records anchored with immutable Polygon public testnet blockchain hashes for undisputed legal title validity and fraud prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DISTRICT QUICK ACCESS DIRECTORY ────────────────────────────── */}
      <section style={{ padding: "64px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Cadastral Survey Coverage
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", fontFamily: "var(--font-head)" }}>
                Popular Cadastral Districts (தமிழ்நாடு மாவட்டங்கள்)
              </h3>
            </div>
            <Link href="/map" className="btn-secondary" style={{ fontSize: 13, gap: 6 }}>
              Open Full Cadastral Map <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {TN_DISTRICTS_POPULAR.map((d, i) => (
              <Link
                key={i}
                href={`/map?district=${d.nameEn.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
                className="glass-card"
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#0f2942" }}>{d.nameEn}</div>
                  <div style={{ fontSize: 12, color: "#1e40af", fontWeight: 600 }}>{d.nameTa}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{d.tag}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 4 }}>
                    {d.plots}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ALL 36 INDIAN STATES & UTs EXPLORER ──────────────────────────── */}
      <section style={{ padding: "64px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 32px" }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              National Repository
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", fontFamily: "var(--font-head)" }}>
              Pan-India State Revenue & Cadastral Portals (36 States & UTs)
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              Select any state to inspect statutory Record of Rights terminology, localized cadastral maps, and revenue hierarchy.
            </p>

            {/* Quick State Search Input */}
            <div style={{ marginTop: 18, position: "relative" }}>
              <Search size={16} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search state by name, native script, or RoR terminology (e.g. Tamil Nadu, 7/12, Patta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px 10px 40px", borderRadius: 6,
                  border: "1px solid #cbd5e1", fontSize: 13.5, background: "#ffffff",
                  color: "#0f2942", boxShadow: "0 1px 2px rgba(15,23,42,0.04)"
                }}
              />
            </div>
          </div>

          {/* Region Filter Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {INDIAN_REGIONS.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  style={{
                    padding: "5px 12px", borderRadius: 4, fontSize: 12, fontWeight: 600,
                    cursor: "pointer", border: "1px solid",
                    background: selectedRegion === reg ? "#0f2942" : "#ffffff",
                    color: selectedRegion === reg ? "#ffffff" : "#475569",
                    borderColor: selectedRegion === reg ? "#0f2942" : "#cbd5e1",
                    transition: "all 0.15s"
                  }}
                >
                  {reg === "All" ? `All Regions (${allStates.length})` : reg}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
              Showing <strong>{filteredStates.length}</strong> of {allStates.length} States & UTs
            </div>
          </div>

          {/* States Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
            {filteredStates.slice(0, 12).map((st) => (
              <div
                key={st.code}
                className="gov-card"
                style={{
                  padding: 18, borderTop: "3px solid #1e40af",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  background: "#ffffff", borderRadius: 6
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                        {st.name}
                      </h4>
                      <div style={{ fontSize: 11, color: "#1e40af", fontWeight: 600, marginTop: 1 }}>
                        {st.nativeName} • {st.portalName.split("(")[0]}
                      </div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 6px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: 3, color: "#334155" }}>
                      Score: {st.dilrmpScore}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "#475569", margin: "10px 0" }}>
                    <div><strong>RoR Term:</strong> {st.rorName}</div>
                    <div><strong>Languages:</strong> {st.languages.join(" • ")}</div>
                    <div><strong>Sample District:</strong> {st.sampleDistrict.split("(")[0]}</div>
                  </div>
                </div>

                <div style={{ paddingTop: 10, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Helpline: {st.helpline}</span>
                  <Link
                    href={`/state/${st.code}`}
                    className="btn-primary"
                    style={{ fontSize: 11.5, padding: "4px 10px", gap: 4, borderRadius: 4 }}
                  >
                    Enter Portal <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredStates.length > 12 && (
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ fontSize: 12.5, color: "#64748b" }}>
                + {filteredStates.length - 12} more states available via the top state switcher or direct search.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. FAQ SECTION ───────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "64px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              Help & Clarifications
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: "#0f2942", fontFamily: "var(--font-head)" }}>
              Frequently Asked Questions
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              Authoritative guidance regarding land records digitization, cadastral FMB sketches, and blockchain title verification.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  overflow: "hidden"
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: "100%", padding: "14px 18px", background: "none", border: "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", textAlign: "left", fontSize: 14.5, fontWeight: 700,
                    color: "#0f2942"
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={16} color="#1e40af" /> : <ChevronDown size={16} color="#64748b" />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: "0 18px 16px", fontSize: 13.5, color: "#334155", lineHeight: 1.6, borderTop: "1px solid #e2e8f0" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CONTACT & SUPPORT FOOTER ──────────────────────────────────────── */}
      <footer id="contact" style={{ background: "#0f2942", color: "#ffffff", padding: "48px 32px 28px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 36, marginBottom: 36 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", marginBottom: 8, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>Terra_vault</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#60a5fa" }} />
            </div>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, maxWidth: 300 }}>
              National spatial land intelligence and blockchain-anchored cadastral modernization platform (DILRMP 2.0).
            </p>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 12 }}>Contact Desk</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "#cbd5e1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={13} color="#93c5fd" /> support.landrecords@gov.in
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={13} color="#93c5fd" /> Toll-Free: 1800-425-1333
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={13} color="#93c5fd" /> Survey & Land Records Bhavan, New Delhi
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd", marginBottom: 12 }}>Quick Navigation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
              <Link href="/map" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Cadastral GIS Map</Link>
              <Link href="/map/digital-twin" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ 3D Digital Twin</Link>
              <Link href="/citizen" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Citizen Desk</Link>
              <Link href="/records" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Land Records RoR</Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#94a3b8" }}>
          <div>© {new Date().getFullYear()} Terra_vault. All rights reserved.</div>
          <div>DILRMP 2.0 Spatial Land Intelligence & Cadastral Registry</div>
        </div>
      </footer>

      {/* ── Back To Top Floating Action Button ─────────────────────────────── */}
      {showBackToTop && (
        <button onClick={scrollToTop} className="tn-back-to-top" title="Back to Top">
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
