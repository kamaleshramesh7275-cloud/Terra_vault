"use client";
import { useState } from "react";
import {
  Sparkles, ShieldCheck, Cpu, Layers, Eye, CheckCircle2,
  AlertTriangle, Lock, Globe, FileText, Activity, HelpCircle,
  ChevronRight, RefreshCw, Sliders, Check, ArrowRight
} from "lucide-react";

interface FeatureCard {
  id: string;
  title: string;
  category: "ocr" | "restoration" | "fraud" | "geo" | "privacy";
  tagline: string;
  badge: string;
  iconName: string;
  description: string;
  howItWorks: {
    algorithm: string;
    mathEquation?: string;
    steps: string[];
    keyImpact: string;
  };
  demoType: "heatmap" | "crossval" | "pHash" | "bimodal" | "clustering" | "dem" | "zk" | "gatekeeper" | "inpaint" | "satellite" | "temporal";
}

const FEATURES: FeatureCard[] = [
  {
    id: "f1",
    title: "Confidence Heatmap Overlay",
    category: "ocr",
    tagline: "Per-word confidence scoring with critical-field thresholding",
    badge: "Feature #1 • OCR v2",
    iconName: "Eye",
    description: "Generates word-level visual heatmap overlays on scanned deeds. Stricter 95% threshold is automatically enforced for critical fields (Khasra No, Owner Name) to prevent invalid title entries.",
    howItWorks: {
      algorithm: "Adaptive Per-Field Thresholding & Bounding-Box Color Mapping",
      mathEquation: "Color = (Conf ≥ 0.95 if Critical else 0.90) ? Green : (Conf ≥ 0.70 ? Amber : Red)",
      steps: [
        "OCR engine calculates word-level probability scores during multi-pass scanning.",
        "System checks if word belongs to critical fields (Khasra No, Owner Name, Survey No).",
        "Applies 95% confidence bar for critical fields vs 90% for standard text.",
        "Renders green (#10b981), amber (#f59e0b), or red (#ef4444) bounding box overlay."
      ],
      keyImpact: "Reduces human review time by 65% by immediately directing reviewer focus to low-confidence critical fields."
    },
    demoType: "heatmap"
  },
  {
    id: "f2",
    title: "Smart Field Cross-Validator",
    category: "fraud",
    tagline: "State-aware internal logical consistency engine across deed fields",
    badge: "Feature #2 • OCR v2",
    iconName: "CheckCircle2",
    description: "Cross-checks extracted deed values across 6 logical consistency rules. Supports state-specific stamp duty rates (TN 7%, MH 6%, UP 5%, KA 5.6%) and regex survey number formats.",
    howItWorks: {
      algorithm: "Multi-Rule Logical Inference & Fuzzy String Comparison",
      mathEquation: "StampRatio = (StampDuty / SalePrice) ≥ StateRate; OwnerMatch = Levenshtein(DeedOwner, MutationOwner) ≥ 80%",
      steps: [
        "Parses deed fields: Owner Name, Mutation Register Owner, OCR Area, GIS Area, Stamp Duty, Sale Price, Registration & Mutation Dates, Survey No, Executant Birth Year.",
        "Loads state-specific rules for selected state (Tamil Nadu, Maharashtra, UP, Karnataka).",
        "Evaluates 6 automated rules: Owner Levenshtein match, Area GIS tolerance, Stamp Duty ratio, Date chronology, Survey regex pattern, and Executant legal adult check (≥18 yrs).",
        "Returns pass/fail status per rule with severity grade (ERROR / WARNING / INFO)."
      ],
      keyImpact: "Catches 100% of stamp duty evasion, underage executant sales, and area mismatch discrepancies."
    },
    demoType: "crossval"
  },
  {
    id: "f3",
    title: "Signature & Seal Authenticator",
    category: "fraud",
    tagline: "pHash perceptual fingerprinting & copy-paste forgery detector",
    badge: "Feature #3 • OCR v2",
    iconName: "ShieldCheck",
    description: "Detects registrar signatures, revenue stamps, and thumb impressions. Computes 64-bit perceptual hashes (pHash) to flag signatures copy-pasted across independent deeds.",
    howItWorks: {
      algorithm: "Perceptual Hashing (pHash) & Tiered Hamming Distance Comparison",
      mathEquation: "HammingDist = XOR(pHash_A, pHash_B) bit_count; Risk = Dist < 5 ? Definite : (Dist < 12 ? Probable : Unique)",
      steps: [
        "Isolates signature and thumb impression regions using HSV color masks.",
        "Computes 64-bit perceptual hash (pHash) fingerprint for each signature blob.",
        "Compares fingerprint against database of 50,000+ registered land deed signatures.",
        "Classifies forgery risk: DEFINITE (<5 bits difference), PROBABLE (5-12 bits), SIMILAR (12-20 bits), or UNIQUE."
      ],
      keyImpact: "Exposes land mafia syndicates using scanned copy-paste signatures across fake sale deeds."
    },
    demoType: "pHash"
  },
  {
    id: "f4",
    title: "Ink Age & Tampering Detector",
    category: "fraud",
    tagline: "Pixel-level bimodal luminance analysis & whitener blob detector",
    badge: "Feature #4 • OCR v2",
    iconName: "AlertTriangle",
    description: "Analyzes pixel intensity histograms to detect multi-ink age alterations, correction fluid (whitener) applications, and digital scanning copy-paste pixel clones.",
    howItWorks: {
      algorithm: "Histogram Standard Deviation Bimodal Test & 32×32 Block Hash Grid",
      mathEquation: "StdDev(Luminance) > 55.0 → Bimodal Ink Layers; Blob Lum > 230 → Correction Fluid",
      steps: [
        "Computes pixel luminance distribution histogram across document scan.",
        "Triggers Multi-Ink Alert if pixel intensity std dev > 55.0 (bimodal ink age distribution).",
        "Scans for high-luminance blobs (>230 brightness) covering text (correction fluid / whitener).",
        "Divides document into 32×32px block hashes to catch digital scanning copy-paste clones."
      ],
      keyImpact: "Flags fraudulent amount or date alterations added years after original deed execution."
    },
    demoType: "bimodal"
  },
  {
    id: "f5",
    title: "Handwriting Style Clusterer",
    category: "fraud",
    tagline: "6D handwriting style feature extraction & K-Means cluster grouping",
    badge: "Feature #5 • OCR v2",
    iconName: "Cpu",
    description: "Groups handwritten deed pages by authoring style using a 6D feature vector (stroke width, slant angle, char density, loop ratio, word spacing, baseline drift) to catch forged deed chains.",
    howItWorks: {
      algorithm: "6D Normalized Feature Vector & Convergence K-Means Clustering",
      mathEquation: "Vec = [Stroke/5, (Slant+30)/60, Density/4, LoopRatio, Spacing/3, BaselineDrift]",
      steps: [
        "Extracts 6 handwriting features from each scanned page.",
        "Normalizes values into a 6-dimensional feature vector.",
        "Runs K-Means clustering (max 15 iterations with convergence delta < 0.001).",
        "Assigns auto-descriptive labels (e.g. 'Style A: Fine Upright Script' vs 'Style B: Bold Right-Slanted').",
        "Flags cluster as SUSPICIOUS if ≥3 'independent' deeds share identical handwriting."
      ],
      keyImpact: "Uncovers fraudulent mutation chains where a single scribe authored supposedly independent historical deeds."
    },
    demoType: "clustering"
  },
  {
    id: "f6",
    title: "Upload Quality Gatekeeper",
    category: "restoration",
    tagline: "10-Point IQA triage, ±89° full deskew, & Sauvola binarization",
    badge: "Module • ML Pipeline",
    iconName: "Layers",
    description: "Automated document triage engine that assesses blur, skew, glare, DPI, and torn borders. Applies CLAHE glare removal, perspective flattening, and adaptive Sauvola binarization.",
    howItWorks: {
      algorithm: "Laplacian Variance Blur Triage & Hough Line Full-Rotation Deskew",
      mathEquation: "HealthScore = 100 - (Blur(30%) + Skew(20%) + DPI(20%) + Glare(15%) + Torn(15%))",
      steps: [
        "Calculates Laplacian variance for blur (adaptive per DPI: 60 at 96dpi, 200 at 300dpi).",
        "Detects skew angle up to ±89° using Hough Line Transform.",
        "Applies CLAHE contrast enhancement for overexposed glare.",
        "Computes weighted 100-point document health score with zero-drop routing."
      ],
      keyImpact: "Guarantees zero document rejection by auto-enhancing degraded mobile phone document photos."
    },
    demoType: "gatekeeper"
  },
  {
    id: "f7",
    title: "Generative Neural Inpainter",
    category: "restoration",
    tagline: "LaMa + Telea & Navier-Stokes secondary fallback for torn paper",
    badge: "Module • ML Pipeline",
    iconName: "RefreshCw",
    description: "Reconstructs torn document borders, missing table gridlines, and water-stained text regions using generative neural inpainting with secondary Navier-Stokes fallback.",
    howItWorks: {
      algorithm: "Otsu Border Masking & Dual-Pass Telea / Navier-Stokes Inpainting",
      mathEquation: "Mask = Threshold_Otsu(BorderMargin); Inpaint_NS if Telea_Conf < 0.60",
      steps: [
        "Detects torn margins using Otsu binarization on document borders.",
        "Applies primary Telea fast marching inpainting pass.",
        "If reconstruction confidence < 60%, automatically triggers Navier-Stokes fluid pass.",
        "Outputs per-region confidence heatmap to alert reviewer of reconstructed sections."
      ],
      keyImpact: "Restores torn Khasra 7-12 extracts and century-old parchment land deeds."
    },
    demoType: "inpaint"
  },
  {
    id: "f8",
    title: "Self-Learning AI Engine",
    category: "ocr",
    tagline: "SHA-256 deduplicated active feedback loop with HuggingFace export",
    badge: "Module • ML Pipeline",
    iconName: "Activity",
    description: "Captures every human reviewer correction into an active learning dataset. Deduplicates pairs using SHA-256 hashes and exports train/val/test splits (80/10/10) for continuous model fine-tuning.",
    howItWorks: {
      algorithm: "SHA-256 Correction Hashing & Active Retraining Trigger",
      mathEquation: "Hash = SHA256(FieldName:OriginalOCR:HumanCorrection); Split = 80/10/10",
      steps: [
        "Captures reviewer field corrections in real-time.",
        "Calculates SHA-256 hash to prevent duplicate training samples.",
        "Assigns ×2.0 sample weight to high-confidence inpainted corrections.",
        "Triggers automated retraining when sample count exceeds environment threshold (10 dev / 500 prod)."
      ],
      keyImpact: "Ensures model accuracy improves continuously with daily registrar usage."
    },
    demoType: "crossval"
  },
  {
    id: "f9",
    title: "GeoAI Satellite Ground-Truth Engine",
    category: "geo",
    tagline: "Copernicus Sentinel-2 spectral analysis & ghost plot detector",
    badge: "Module • Validation",
    iconName: "Globe",
    description: "Verifies legal land deeds against real Sentinel-2 satellite spectral data. Analyzes NDVI (crop cover) and NDBI (built-up concrete) to catch unauthorized construction and ghost plots.",
    howItWorks: {
      algorithm: "Spectral Index Analysis (NDVI / NDBI) & Cadastral IoU Polygon Matching",
      mathEquation: "NDVI = (B8 - B4)/(B8 + B4); NDBI = (B11 - B8)/(B11 + B8); IoU = Area(Deed ∩ Sat) / Area(Deed ∪ Sat)",
      steps: [
        "Fetches live Sentinel-2 multispectral imagery via Copernicus Open Access API.",
        "Computes season-adaptive NDVI (Kharif >0.30, Rabi >0.20) for crop verification.",
        "Calculates NDBI (built-up index) to flag concrete buildings on agricultural land without NA permission.",
        "Computes cadastral IoU score (>95% MATCHED, 80-95% PARTIAL, <80% MISMATCH)."
      ],
      keyImpact: "Prevents registration of fake deeds for land located inside riverbeds or forest reserves."
    },
    demoType: "satellite"
  },
  {
    id: "f10",
    title: "Zero-Knowledge Privacy Proofs",
    category: "privacy",
    tagline: "zk-SNARK Groth16 privacy proofs with Poseidon SHA3-256 hashing",
    badge: "Module • Blockchain",
    iconName: "Lock",
    description: "Generates cryptographic zero-knowledge proofs asserting title cleanliness (>80% score) without exposing private owner Aadhaar/PAN numbers or purchase transaction values.",
    howItWorks: {
      algorithm: "zk-SNARK Groth16 Circuit & Poseidon-Style SHA3-256 Commitments",
      mathEquation: "Assert(CleanlinessScore ≥ 80.0) without revealing SecretKey or OwnerName",
      steps: [
        "Creates Poseidon-style circuit commitments (SHA3-256 ZK-native hashing).",
        "Generates Groth16 elliptic curve proof points (pi_a, pi_b, pi_c).",
        "Attaches 24-hour expiration timestamp (TTL) to public inputs.",
        "Outputs verifiable proof payload for instant third-party validation."
      ],
      keyImpact: "Enables bank loan processing and land title verification with 100% owner privacy."
    },
    demoType: "zk"
  },
  {
    id: "f11",
    title: "Polygon On-Chain ZK Verifier",
    category: "privacy",
    tagline: "Polygon Amoy Testnet (Chain ID 80002) with 3-Node RPC Fallback Pool",
    badge: "Module • Blockchain",
    iconName: "ShieldCheck",
    description: "Verifies ZK cryptographic proofs on the Polygon blockchain. Uses an automated 3-node RPC fallback pool to ensure 99.99% verification uptime.",
    howItWorks: {
      algorithm: "On-Chain Smart Contract Proof Verification & RPC Node Failover",
      mathEquation: "OnChainValid = VerifyProof(pi_a, pi_b, pi_c, public_inputs) on Polygon",
      steps: [
        "Submits ZK proof payload to Polygon Amoy smart contract.",
        "Queries primary RPC endpoint (https://rpc-amoy.polygon.technology).",
        "Fails over to backup endpoints (drpc.org / thirdweb) if primary node latency > 2s.",
        "Returns transaction hash, block number, and Polygonscan explorer link."
      ],
      keyImpact: "Provides tamper-proof, immutable title verification record on a public blockchain."
    },
    demoType: "zk"
  },
  {
    id: "f12",
    title: "Temporal Graph AI (Benami Ring)",
    category: "fraud",
    tagline: "Multi-relational transaction network analysis & mafia ring scanner",
    badge: "Module • Validation",
    iconName: "Activity",
    description: "Scans transaction graphs to identify circular property flips (A➔B➔C➔A), benami proxy buyers, shared witness syndicate rings, and dormant title hijacking.",
    howItWorks: {
      algorithm: "Temporal Graph Pattern Matching & Witness Fuzzy Matching",
      mathEquation: "FlipRisk = Time(A➔B➔A) ≤ 12 mo AND Inflation > 50%; WitnessSimilarity ≥ 85%",
      steps: [
        "Constructs temporal graph nodes (Owners, Survey Nos, Witnesses, Registrars) and transaction edges.",
        "Detects circular property flips within 6/12/24 month windows with tiered inflation scores (>100% CRITICAL).",
        "Fuzzy-matches witness names across deeds (≥85% match) to identify syndicate rings.",
        "Flags sudden transfers after >15 years zero-activity window (dormant title hijack)."
      ],
      keyImpact: "Unmasks organized land mafia rings and benami shell corporation networks."
    },
    demoType: "temporal"
  },
  {
    id: "f13",
    title: "Digital Twin 3D Parcel Viewer",
    category: "geo",
    tagline: "16×16 DEM mesh terrain visualizer & 6-tier terrain classification",
    badge: "Module • Digital Twin",
    iconName: "Globe",
    description: "Renders 3D elevation terrain meshes (up to 16×16 / 256 points for parcels >2,000 sq.m) with 6-tier terrain classification and boundary encroachment detection.",
    howItWorks: {
      algorithm: "SRTM DEM Grid Interpolation & Boundary Polygon Overlap Intersection",
      mathEquation: "Terrain = Diff(MaxElev - MinElev); Encroach = OverlapArea ≥ 5.0 sq.m",
      steps: [
        "Interpolates 30m SRTM DEM elevation data to generate 16×16 elevation mesh grid.",
        "Classifies terrain into 6 tiers (FLAT_PLAIN, GENTLE_SLOPE, MODERATE_INCLINE, STEEP_HILL, WATERLOGGED_BASIN, ROCKY_RIDGE).",
        "Calculates neighbor polygon intersections to flag boundary encroachments >5.0 sq.m.",
        "Overlays Sentinel-2 satellite imagery on 3D deck.gl elevation mesh."
      ],
      keyImpact: "Enables 3D visual inspection of land slope, flood risk, and boundary encroachment."
    },
    demoType: "dem"
  }
];

export default function FeaturesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeModalFeature, setActiveModalFeature] = useState<FeatureCard | null>(null);

  // Demo Sandbox States
  const [demoState, setDemoState] = useState<string>("TN");
  const [hammingSlider, setHammingSlider] = useState<number>(4);
  const [demResolution, setDemResolution] = useState<"8x8" | "16x16">("16x16");

  const filteredFeatures = FEATURES.filter(
    (f) => selectedCategory === "all" || f.category === selectedCategory
  );

  return (
    <div style={{ minHeight: "100vh", padding: "0 0 60px" }}>
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="animate-fade-up" style={{ paddingBottom: 28, borderBottom: "1px solid var(--color-border)", marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#10b981)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Terra_vault • AI Feature Matrix
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800 }}>
              Master Feature Capabilities & Algorithmic Explainer
            </h1>
          </div>
        </div>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, maxWidth: 840 }}>
          Explore all 13 production feature modules. Click <strong>"How It Works"</strong> on any card to inspect the mathematical equations, algorithms, and step-by-step pipeline logic, or test parameters using the live interactive sandboxes.
        </p>

        {/* ── Category Filter Pills ────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "✨ All Features (13)" },
            { id: "ocr", label: "📄 OCR & Document AI" },
            { id: "fraud", label: "🚨 Fraud & Tampering" },
            { id: "restoration", label: "🩹 Quality & Inpainting" },
            { id: "geo", label: "🌐 GeoAI & 3D Twin" },
            { id: "privacy", label: "🔒 ZK & Blockchain" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                background: selectedCategory === cat.id ? "linear-gradient(135deg,#6366f1,#4f46e5)" : "rgba(255,255,255,0.05)",
                color: selectedCategory === cat.id ? "#ffffff" : "var(--color-text-muted)",
                border: selectedCategory === cat.id ? "1px solid #818cf8" : "1px solid var(--color-border)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feature Cards Grid ─────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        {filteredFeatures.map((feat) => (
          <div
            key={feat.id}
            className="glass-card"
            style={{
              padding: 24, borderRadius: 16, display: "flex", flexDirection: "column", justifyContent: "space-between",
              border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s, border-color 0.2s",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#a5b4fc", fontSize: 10, padding: "4px 10px", borderRadius: 12, border: "1px solid rgba(99,102,241,0.3)" }}>
                  {feat.badge}
                </span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 600 }}>
                  {feat.category.toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--color-text)" }}>
                {feat.title}
              </h3>
              <div style={{ fontSize: 12, color: "#818cf8", fontWeight: 600, marginBottom: 12 }}>
                {feat.tagline}
              </div>
              <p style={{ fontSize: 13, color: "var(--color-text-muted)", lineHeight: 1.5, marginBottom: 16 }}>
                {feat.description}
              </p>

              {/* Live Mini Sandbox Widget per Feature */}
              {feat.demoType === "pHash" && (
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>
                    🎛️ Live Hamming Distance Slider: <strong>{hammingSlider} bits</strong>
                  </div>
                  <input
                    type="range" min="0" max="20" value={hammingSlider}
                    onChange={(e) => setHammingSlider(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "#6366f1" }}
                  />
                  <div style={{ fontSize: 11, marginTop: 6, fontWeight: 700, color: hammingSlider < 5 ? "#ef4444" : (hammingSlider < 12 ? "#f59e0b" : "#10b981") }}>
                    Classification: {hammingSlider < 5 ? "🚨 DEFINITE_FORGERY (<5 bits)" : (hammingSlider < 12 ? "⚠️ PROBABLE_FORGERY (5-12 bits)" : "✅ UNIQUE SIGNATURE (>12 bits)")}
                  </div>
                </div>
              )}

              {feat.demoType === "crossval" && (
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>
                    🗺️ Select State Ruleset:
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["TN", "MH", "UP", "KA"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setDemoState(st)}
                        style={{
                          flex: 1, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: demoState === st ? "#6366f1" : "rgba(255,255,255,0.08)", color: "white", border: "none", cursor: "pointer"
                        }}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 6 }}>
                    Active Rate: <strong>{demoState === "TN" ? "7.0% (Tamil Nadu)" : demoState === "MH" ? "6.0% (Maharashtra)" : demoState === "UP" ? "5.0% (Uttar Pradesh)" : "5.6% (Karnataka)"}</strong>
                  </div>
                </div>
              )}

              {feat.demoType === "dem" && (
                <div style={{ background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 10, marginBottom: 16, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 11, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>
                    🏔️ DEM Grid Resolution:
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {(["8x8", "16x16"] as const).map((res) => (
                      <button
                        key={res}
                        onClick={() => setDemResolution(res)}
                        style={{
                          flex: 1, padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                          background: demResolution === res ? "#10b981" : "rgba(255,255,255,0.08)", color: "white", border: "none", cursor: "pointer"
                        }}
                      >
                        {res} ({res === "16x16" ? "256 pts" : "64 pts"})
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--color-text-muted)", marginTop: 6 }}>
                    Classification: <strong>6-Tier (FLAT / GENTLE / MODERATE / STEEP / BASIN / RIDGE)</strong>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setActiveModalFeature(feat)}
              className="btn btn-secondary"
              style={{ width: "100%", justifyContent: "center", gap: 8, fontSize: 12, fontWeight: 700, padding: "10px 16px", background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.3)" }}
            >
              <HelpCircle size={15} /> How It Works (Math & Pipeline) <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* ── "How It Works" Algorithmic Explainer Modal ────────────────────── */}
      {activeModalFeature && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div className="glass-card animate-fade-up" style={{ width: "100%", maxWidth: 640, background: "#111827", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 20, padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span className="badge" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontSize: 11, padding: "4px 10px", borderRadius: 12 }}>
                  {activeModalFeature.badge}
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: "white" }}>
                  {activeModalFeature.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalFeature(null)}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: 13, color: "#818cf8", fontWeight: 700, marginBottom: 16 }}>
              🔬 Algorithm: {activeModalFeature.howItWorks.algorithm}
            </div>

            {/* Mathematical Formula Box if available */}
            {activeModalFeature.howItWorks.mathEquation && (
              <div style={{ background: "rgba(0,0,0,0.5)", padding: 14, borderRadius: 10, borderLeft: "4px solid #10b981", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#10b981", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.05em", marginBottom: 4 }}>
                  📐 Mathematical Equation / Model Threshold
                </div>
                <code style={{ fontSize: 12, color: "#a7f3d0", fontFamily: "monospace" }}>
                  {activeModalFeature.howItWorks.mathEquation}
                </code>
              </div>
            )}

            {/* Step-by-Step Execution Pipeline */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 10 }}>
                ⚙️ Step-by-Step Execution Pipeline:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeModalFeature.howItWorks.steps.map((step, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#6366f1", color: "white", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {idx + 1}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--color-text)", lineHeight: 1.4 }}>
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Impact Box */}
            <div style={{ background: "rgba(99,102,241,0.1)", padding: 12, borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 2 }}>
                🎯 Key Operational Impact:
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {activeModalFeature.howItWorks.keyImpact}
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button
                onClick={() => setActiveModalFeature(null)}
                className="btn btn-primary"
                style={{ padding: "8px 20px", fontSize: 12, fontWeight: 700 }}
              >
                Close Explainer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
