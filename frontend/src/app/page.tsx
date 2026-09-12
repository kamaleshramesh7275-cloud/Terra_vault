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
      {/* ── 1. HERO SECTION (Teal Radial Pattern Backdrop) ───────────────────── */}
      <section className="tn-hero-bg" style={{ color: "#ffffff", padding: "64px 32px 80px", position: "relative" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 48, alignItems: "center" }}>
          
          {/* Left Column: Heading, Subtitle, Badges & CTAs */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(8px)", borderRadius: 9999, border: "1px solid rgba(45, 212, 191, 0.3)", color: "#2dd4bf", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf" }} />
              DILRMP 2.0 • AI & BLOCKCHAIN CADASTRE
            </div>

            <h1 style={{ fontSize: "clamp(34px, 4.5vw, 48px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 18, fontFamily: "var(--font-head)" }}>
              Terra_vault – Land Intelligence
            </h1>

            <p style={{ fontSize: 16.5, color: "#d1fae5", lineHeight: 1.65, marginBottom: 28, maxWidth: 540 }}>
              Explore spatial land parcels with real-time GIS intelligence. Access cadastral survey details, FMB boundaries, ownership records, and blockchain audit layers — all in one unified platform.
            </p>

            {/* Feature Pill Badges */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
              <span className="tn-pill-badge">
                <Search size={15} color="#2dd4bf" /> Search by Survey / Patta
              </span>
              <span className="tn-pill-badge">
                <Layers size={15} color="#2dd4bf" /> Cadastral & Satellite View
              </span>
              <span className="tn-pill-badge">
                <Globe size={15} color="#2dd4bf" /> Multi-layer GIS Data
              </span>
              <span className="tn-pill-badge">
                <MapPin size={15} color="#2dd4bf" /> Nearby Facilities
              </span>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <Link href="/map" className="tn-btn-launch">
                <Play size={16} fill="#0f3d3e" /> Launch GIS Map
              </Link>
              <a href="#about" className="tn-btn-outline">
                Learn More
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Mockup Floating GIS Card */}
          <div style={{ position: "relative" }}>
            <div className="tn-glass-card" style={{ padding: 18, position: "relative", overflow: "hidden", minHeight: 380, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              
              {/* Satellite Background Simulation */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/30412/29472') center/cover no-repeat",
                filter: "brightness(0.7) contrast(1.15)",
                zIndex: 0
              }} />
              
              {/* Gradient Vignette */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "radial-gradient(circle at 60% 40%, transparent 20%, rgba(15, 61, 62, 0.75) 85%)",
                zIndex: 1
              }} />

              {/* Floating Glass Badges */}
              <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span className="tn-floating-tag" style={{ background: "rgba(15, 61, 62, 0.9)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.5)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#2dd4bf", display: "inline-block", boxShadow: "0 0 8px #2dd4bf" }} />
                  Live GIS
                </span>
                <span className="tn-floating-tag" style={{ background: "rgba(255, 255, 255, 0.95)", color: "#134e4a" }}>
                  <Layers size={13} color="#134e4a" /> Interactive Parcel View
                </span>
              </div>

              {/* Center Vector Parcel Simulation with Neon Cyan Glow */}
              <div style={{ position: "relative", zIndex: 2, margin: "30px auto", width: "75%", height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg viewBox="0 0 300 160" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 12px #00ffcc)" }}>
                  <polygon
                    points="40,25 240,15 270,120 70,145"
                    fill="rgba(0, 255, 204, 0.18)"
                    stroke="#00ffcc"
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                  />
                  <line x1="150" y1="20" x2="165" y2="135" stroke="#bef264" strokeWidth="2" strokeDasharray="3 3" />
                  <text x="100" y="85" fill="#bef264" fontSize="16" fontWeight="bold" fontFamily="monospace">629</text>
                  <text x="210" y="75" fill="#bef264" fontSize="16" fontWeight="bold" fontFamily="monospace">630</text>
                  <circle cx="158" cy="80" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                </svg>

                <div style={{
                  position: "absolute", top: "25%", left: "50%", transform: "translate(-50%, -50%)",
                  background: "#0f3d3e", color: "#ffffff", padding: "4px 10px", borderRadius: 6,
                  border: "1px solid #2dd4bf", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }}>
                  Survey No: 84/1
                </div>
              </div>

              {/* Bottom Info Hud */}
              <div style={{
                position: "relative", zIndex: 2,
                background: "rgba(15, 61, 62, 0.92)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(45, 212, 191, 0.4)",
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontSize: 11.5, color: "#e2e8f0"
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#2dd4bf" }}>Land Parcel Information (நில உரிமை விவரம்)</div>
                  <div style={{ color: "#cbd5e1", marginTop: 2 }}>Ariyalur • Keelapalur (கீழப்பழுவூர்) • ULPIN: TNGIS182441920</div>
                </div>
                <span className="tn-floating-tag" style={{ background: "#ffffff", color: "#134e4a", fontSize: 11 }}>
                  <Sparkles size={12} color="#134e4a" /> Insights Enabled
                </span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── 2. "WHAT IS TERRA_VAULT" SECTION ─────────────────────────────────── */}
      <section id="about" style={{ padding: "80px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 54, alignItems: "center" }}>
          
          {/* Left: Explanatory Content */}
          <div>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 38px)", fontWeight: 800, color: "#0f3d3e", letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 20, fontFamily: "var(--font-head)" }}>
              What is Terra_vault?
            </h2>

            <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              Terra_vault is an AI-powered spatial land intelligence platform that unifies multilingual legacy deed extraction, cadastral FMB vector mapping, and tamper-proof blockchain audit trails into a single next-generation platform.
            </p>

            <p style={{ fontSize: 15.5, color: "#475569", lineHeight: 1.7, marginBottom: 28 }}>
              Designed for citizens, surveyors, revenue officers, and financial institutions, Terra_vault eliminates land fraud, automates title verification, and provides real-time spatial parcel analytics.
            </p>

            {/* Checkmark Bullets */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                "Real-time cadastral FMB & satellite parcel visualization",
                "Multilingual AI OCR for degraded deeds with confidence scoring",
                "Immutable Polygon blockchain audit trail & mutation lineage"
              ].map((text, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 15, fontWeight: 700, color: "#134e4a" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f0fdfa", border: "1.5px solid #14b8a6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={14} color="#0d9488" strokeWidth={3} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3D Visual Card with Floating Badges */}
          <div style={{ position: "relative" }}>
            <div style={{
              background: "linear-gradient(135deg, #0f3d3e 0%, #164e4b 100%)",
              borderRadius: 20,
              padding: 24,
              border: "1px solid rgba(45, 212, 191, 0.3)",
              boxShadow: "0 24px 48px -12px rgba(15, 61, 62, 0.25)",
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                background: "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/16/30412/29472') center/cover no-repeat",
                opacity: 0.35,
                filter: "brightness(0.65)",
                zIndex: 0
              }} />

              <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 12, height: 320, justifyContent: "space-between" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="tn-floating-tag" style={{ background: "rgba(255,255,255,0.95)", color: "#0f3d3e" }}>
                    <FileText size={13} color="#0d9488" /> Survey Data
                  </span>
                  <span className="tn-floating-tag" style={{ background: "rgba(15,61,62,0.9)", color: "#2dd4bf", border: "1px solid rgba(45,212,191,0.4)" }}>
                    <Layers size={13} color="#2dd4bf" /> GIS Layers
                  </span>
                </div>

                <div style={{
                  margin: "0 auto", width: 220, height: 130,
                  border: "2.5px solid #00ffcc",
                  borderRadius: 8,
                  background: "rgba(0, 255, 204, 0.12)",
                  boxShadow: "0 0 20px rgba(0, 255, 204, 0.4), inset 0 0 15px rgba(0, 255, 204, 0.2)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 4
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
                  <span style={{ color: "#ffffff", fontWeight: 800, fontSize: 16, fontFamily: "monospace" }}>84</span>
                  <span style={{ color: "#2dd4bf", fontSize: 11, fontWeight: 700 }}>Active Cadastral FMB</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="tn-floating-tag" style={{ background: "rgba(255,255,255,0.95)", color: "#0f3d3e" }}>
                    <ShieldCheck size={13} color="#0d9488" /> Ownership
                  </span>
                  <span className="tn-floating-tag" style={{ background: "rgba(255,255,255,0.95)", color: "#0f3d3e" }}>
                    <Building2 size={13} color="#0d9488" /> Revenue Records
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. THREE CORE PILLARS GRID ───────────────────────────────────────── */}
      <section style={{ padding: "70px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0f3d3e", fontFamily: "var(--font-head)" }}>
              Built for Modern Land Governance & Citizen Transparency
            </h3>
            <p style={{ fontSize: 15, color: "#64748b", marginTop: 6 }}>
              Nationwide Spatial Intelligence & Digital RoR Modernization Architecture
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {/* Card 1 */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 32, boxShadow: "0 4px 12px rgba(15, 61, 62, 0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#f0fdfa", border: "1.5px solid #2dd4bf", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Globe size={26} color="#0d9488" />
              </div>
              <h4 style={{ fontSize: 19, fontWeight: 800, color: "#0f3d3e", marginBottom: 10 }}>Statewide & National Access</h4>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
                Complete coverage of all 36 Indian States & UTs with high-resolution cadastral vector meshes and instant spatial zooming from state down to parcel sub-divisions.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 32, boxShadow: "0 4px 12px rgba(15, 61, 62, 0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#f0fdfa", border: "1.5px solid #2dd4bf", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Zap size={26} color="#0d9488" />
              </div>
              <h4 style={{ fontSize: 19, fontWeight: 800, color: "#0f3d3e", marginBottom: 10 }}>Instant Data & AI OCR</h4>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
                Sub-second parcel centroid discovery, bilingual Patta/Chitta extraction, and automated SRO Encumbrance Certificate (EC) cross-verification.
              </p>
            </div>

            {/* Card 3 */}
            <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 32, boxShadow: "0 4px 12px rgba(15, 61, 62, 0.04)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "#f0fdfa", border: "1.5px solid #2dd4bf", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <ShieldCheck size={26} color="#0d9488" />
              </div>
              <h4 style={{ fontSize: 19, fontWeight: 800, color: "#0f3d3e", marginBottom: 10 }}>Polygon Blockchain Audit</h4>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.65 }}>
                DILRMP 2.0 certified records anchored with immutable Polygon public testnet blockchain hashes for undisputed legal title validity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 38-DISTRICT QUICK ACCESS DIRECTORY ────────────────────────────── */}
      <section style={{ padding: "70px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Cadastral Coverage
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0f3d3e", fontFamily: "var(--font-head)" }}>
                Explore Tamil Nadu Districts (38 மாவட்டங்கள்)
              </h3>
            </div>
            <Link href="/map" className="btn btn-secondary" style={{ borderColor: "#0d9488", color: "#0f3d3e", fontSize: 13, gap: 6 }}>
              Open Full Cadastral Map <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {TN_DISTRICTS_POPULAR.map((d, i) => (
              <Link
                key={i}
                href={`/map?district=${d.nameEn.toLowerCase()}`}
                style={{
                  textDecoration: "none",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.15s ease"
                }}
                className="glass-card"
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0f3d3e" }}>{d.nameEn}</div>
                  <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 700 }}>{d.nameTa}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{d.tag}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", background: "#f0fdfa", color: "#0f3d3e", border: "1px solid #2dd4bf", borderRadius: 6 }}>
                    {d.plots}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. ALL 36 INDIAN STATES & UTs EXPLORER ──────────────────────────── */}
      <section style={{ padding: "70px 32px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 760, margin: "0 auto 36px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              National Gateway
            </div>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0f3d3e", fontFamily: "var(--font-head)" }}>
              Pan-India State Revenue & Cadastral Portals (36 States & UTs)
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
              Select any state to inspect statutory Record of Rights terminology, localized cadastral maps, and revenue hierarchy.
            </p>

            {/* Quick State Search Input */}
            <div style={{ marginTop: 20, position: "relative" }}>
              <Search size={18} color="#64748b" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search state by name, native script, or RoR terminology (e.g. Tamil Nadu, 7/12, Patta)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px 12px 42px", borderRadius: 9999,
                  border: "2px solid #cbd5e1", fontSize: 14, background: "#ffffff",
                  color: "#0f3d3e", boxShadow: "0 2px 8px rgba(15,61,62,0.06)"
                }}
              />
            </div>
          </div>

          {/* Region Filter Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {INDIAN_REGIONS.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  style={{
                    padding: "6px 14px", borderRadius: 9999, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", border: "1px solid",
                    background: selectedRegion === reg ? "#134e4a" : "#ffffff",
                    color: selectedRegion === reg ? "#ffffff" : "#334155",
                    borderColor: selectedRegion === reg ? "#134e4a" : "#cbd5e1",
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
            {filteredStates.slice(0, 12).map((st) => (
              <div
                key={st.code}
                className="glass-card"
                style={{
                  padding: 20, borderTop: "4px solid #134e4a", borderColor: "#cbd5e1",
                  display: "flex", flexDirection: "column", justifyContent: "space-between",
                  background: "#ffffff", borderRadius: 10
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 800, color: "#0f3d3e", margin: 0 }}>
                        {st.name}
                      </h4>
                      <div style={{ fontSize: 11, color: "#0d9488", fontWeight: 700, marginTop: 1 }}>
                        {st.nativeName} • {st.portalName.split("(")[0]}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", background: "#f0fdfa", border: "1px solid #2dd4bf", borderRadius: 4, color: "#134e4a" }}>
                      Score: {st.dilrmpScore}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5, color: "#475569", margin: "10px 0" }}>
                    <div><strong>RoR Term:</strong> {st.rorName}</div>
                    <div><strong>Languages:</strong> {st.languages.join(" • ")}</div>
                    <div><strong>Sample District:</strong> {st.sampleDistrict.split("(")[0]}</div>
                  </div>
                </div>

                <div style={{ paddingTop: 10, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Helpline: {st.helpline}</span>
                  <Link
                    href={`/state/${st.code}`}
                    className="btn btn-primary"
                    style={{ background: "#134e4a", borderColor: "#0f3d3e", fontSize: 11.5, padding: "5px 12px", gap: 4, borderRadius: 9999 }}
                  >
                    Enter Portal <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredStates.length > 12 && (
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                + {filteredStates.length - 12} more states available via the top state switcher or direct search.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── 6. FAQ SECTION ───────────────────────────────────────────────────── */}
      <section id="faq" style={{ padding: "70px 32px", background: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: "#0f3d3e", fontFamily: "var(--font-head)" }}>
              Frequently Asked Questions
            </h3>
            <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
              Clear answers regarding Terra_vault AI digitization, FMB cadastral sketches, and blockchain title verification.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  overflow: "hidden"
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  style={{
                    width: "100%", padding: "16px 20px", background: "none", border: "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 700,
                    color: "#0f3d3e"
                  }}
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp size={18} color="#0d9488" /> : <ChevronDown size={18} color="#64748b" />}
                </button>
                {openFaq === idx && (
                  <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#475569", lineHeight: 1.6, borderTop: "1px solid #e2e8f0" }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CONTACT & SUPPORT FOOTER (Terra_vault) ─────────────────────────── */}
      <footer id="contact" style={{ background: "#0f3d3e", color: "#ffffff", padding: "50px 32px 30px" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 36, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#ffffff", marginBottom: 8, fontFamily: "var(--font-head)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>Terra_vault</span>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2dd4bf" }} />
            </div>
            <p style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.6, maxWidth: 300 }}>
              AI-powered spatial land intelligence & blockchain-anchored cadastral modernization platform.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2dd4bf", marginBottom: 12 }}>Contact Desk</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: "#cbd5e1" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color="#2dd4bf" /> support@terravault.ai
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color="#2dd4bf" /> +91-44-40164907 / 40164999
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={14} color="#2dd4bf" /> Chepauk & National Tech Center, Chennai
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#2dd4bf", marginBottom: 12 }}>Quick Navigation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              <Link href="/map" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Cadastral GIS Map</Link>
              <Link href="/map/digital-twin" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ 3D Digital Twin</Link>
              <Link href="/citizen" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Citizen Desk</Link>
              <Link href="/records" style={{ color: "#cbd5e1", textDecoration: "none" }}>→ Land Records RoR</Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: "0 auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, fontSize: 12, color: "#94a3b8" }}>
          <div>© {new Date().getFullYear()} Terra_vault. All rights reserved.</div>
          <div>DILRMP 2.0 Spatial Land Intelligence & Blockchain Cadastre</div>
        </div>
      </footer>

      {/* ── Back To Top Floating Action Button ─────────────────────────────── */}
      {showBackToTop && (
        <button onClick={scrollToTop} className="tn-back-to-top" title="Back to Top">
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
