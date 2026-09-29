"use client";
import { useState } from "react";
import {
  Shield, CheckCircle2, XCircle, ChevronDown, ChevronUp, MapPin,
  Scale, FileText, Landmark, AlertTriangle, ArrowRight, RefreshCw, Key
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthGuard";

export interface RolePowerSpec {
  role: string;
  title: string;
  cadre: string;
  statutoryAct: string;
  jurisdictionScope: string;
  powers: string[];
  prohibitions: string[];
  badgeColor: string;
  accentBg: string;
}

export const STATUTORY_POWER_SPECS: Record<string, RolePowerSpec> = {
  CITIZEN: {
    role: "CITIZEN",
    title: "Citizen / Pattadar Desk",
    cadre: "Landholder / Registered Title Beneficiary",
    statutoryAct: "Tamil Nadu Patta Pass Book Act, 1983 (Sec. 3)",
    jurisdictionScope: "Kinathukadavu Village • Survey Parcel SF.84/1 (Self-Owned)",
    powers: [
      "View & download digitized e-Patta and 'A'-Register extracts",
      "File online Patta Transfer & Sub-division mutation applications",
      "Generate Zero-Knowledge (ZK) Proofs for bank loan title validation",
      "Track real-time statutory review SLA & blockchain anchoring status"
    ],
    prohibitions: [
      "Cannot approve, sanction, or seal any mutation order",
      "Cannot inspect or modify official confidential field inspection notes",
      "Cannot access other citizens' non-public uncertified revenue notes",
      "Cannot alter Cadastral boundary coordinates or FMB sketches"
    ],
    badgeColor: "#047857",
    accentBg: "#ecfdf5"
  },
  VAO: {
    role: "VAO",
    title: "Village Administrative Officer (VAO)",
    cadre: "Village Revenue Executive • Ground Field Authority",
    statutoryAct: "TN Village Revenue Administration Code (Rule 14)",
    jurisdictionScope: "Kinathukadavu Revenue Village (LGD Code: 630401)",
    powers: [
      "Conduct physical ground inspection & verify actual field possession",
      "Enter seasonal crop details in Permanent Adangal Register (Form 2)",
      "Record local heirship consensus & verify seller-buyer identity",
      "Forward field reports with GPS photo geotags to Revenue Inspector"
    ],
    prohibitions: [
      "Cannot issue final statutory Patta Transfer orders (Reserved for Tahsildar)",
      "Cannot adjudicate disputed title claims or grant interim stays",
      "Cannot execute land record actions outside Village Code 630401",
      "Cannot freeze or unfreeze high-value contested parcels"
    ],
    badgeColor: "#059669",
    accentBg: "#ecfdf5"
  },
  RI: {
    role: "RI",
    title: "Revenue Inspector (RI)",
    cadre: "Firka Supervisory Authority • Sub-Taluk Scrutiny",
    statutoryAct: "TN Board of Revenue Standing Orders (BSO 31 §8)",
    jurisdictionScope: "Kinathukadavu Revenue Firka (7 Revenue Villages)",
    powers: [
      "Scrutinize VAO field verification reports & SRO Encumbrance deeds",
      "Conduct cross-examination of contested boundary disputes in firka",
      "Endorse & submit formal mutation enquiry summaries to Tahsildar",
      "Audit Village 'A'-Register records and crop yield assessments"
    ],
    prohibitions: [
      "Cannot sign or issue statutory Patta passbook certificates",
      "Cannot hear formal quasi-judicial appeals against Tahsildar decisions",
      "Cannot alter district revenue targets or DILRMP sync pipelines",
      "Cannot dismiss registered citizen grievances unilaterally"
    ],
    badgeColor: "#0284c7",
    accentBg: "#f0f9ff"
  },
  TAHSILDAR: {
    role: "TAHSILDAR",
    title: "Tahsildar / Sub-Tahsildar",
    cadre: "Taluk Executive Magistrate & Primary Statutory Revenue Authority",
    statutoryAct: "Tamil Nadu Patta Pass Book Act, 1983 (Sec. 10 & 11)",
    jurisdictionScope: "Kinathukadavu Taluk Command (48 Revenue Villages)",
    powers: [
      "Sanction & issue statutory Patta Transfer & sub-division orders",
      "Authorize cadastral sub-division demarcation on digital FMB maps",
      "Sign and commit cryptographic hashes to Polygon Blockchain registry",
      "Order recovery of government revenue and Land Encroachment evictions"
    ],
    prohibitions: [
      "Cannot adjudicate first appeals against orders passed by self (Reserved for RDO)",
      "Cannot override stay orders or dispute freezes issued by RDO / Collector",
      "Cannot perform revenue modifications outside Kinathukadavu Taluk",
      "Cannot alter encrypted blockchain ledger transactions once anchored"
    ],
    badgeColor: "#1e40af",
    accentBg: "#eff6ff"
  },
  RDO: {
    role: "RDO",
    title: "Revenue Divisional Officer (RDO / Sub-Collector)",
    cadre: "Sub-Divisional Magistrate & 1st Appellate Quasi-Judicial Authority",
    statutoryAct: "Tamil Nadu Patta Pass Book Act, 1983 (Sec. 12 Appellate Powers)",
    jurisdictionScope: "Pollachi Revenue Division (Kinathukadavu, Pollachi, Anaimalai Taluks)",
    powers: [
      "Conduct quasi-judicial appeal hearings under Sec. 12 of Patta Pass Book Act",
      "Issue interim stay orders & freeze disputed cadastral parcels",
      "Quash erroneous or fraudulent Tahsildar Patta orders and restore title",
      "Summon parties, examine original registered deeds, and record depositions"
    ],
    prohibitions: [
      "Cannot initiate routine original mutation applications (Primary jurisdiction is Tahsildar)",
      "Cannot modify AI ML model hyperparameters or system configurations",
      "Cannot override final District Collector or High Court writ directives",
      "Cannot delete audit trail entries from the immutable revenue ledger"
    ],
    badgeColor: "#7c3aed",
    accentBg: "#f5f3ff"
  },
  DISTRICT_COLLECTOR: {
    role: "DISTRICT_COLLECTOR",
    title: "District Collector & District Magistrate (IAS)",
    cadre: "Apex District Revenue Command & Revisional Authority",
    statutoryAct: "Tamil Nadu Patta Pass Book Act, 1983 (Sec. 13 Revisional Jurisdiction)",
    jurisdictionScope: "Entire Coimbatore District (All 11 Taluks & Apex Revenue Command)",
    powers: [
      "Exercise Sec. 13 Revisional Jurisdiction over all RDO & Tahsildar orders",
      "Execute district-wide emergency fraud freezes on AI graph fraud alerts",
      "Grant administrative overrides for high-value industrial land conversions",
      "Direct vigilance audits, police FIRs for benami land grabs, and officer suspensions"
    ],
    prohibitions: [
      "Cannot operate or issue revenue orders outside Coimbatore District limits",
      "Cannot delete or tamper with cryptographically anchored Polygon Amoy blocks",
      "Cannot bypass statutory hearing rights (Audi Alteram Partem) in title disputes",
      "Cannot backdate revenue orders in the digital immutable ledger"
    ],
    badgeColor: "#991b1b",
    accentBg: "#fef2f2"
  },
  BUSINESS: {
    role: "BUSINESS",
    title: "Commercial & Institutional Banking Title Desk",
    cadre: "Institutional Financial / Legal Auditor (G2B)",
    statutoryAct: "Transfer of Property Act, 1882 & SARFAESI Act, 2002",
    jurisdictionScope: "State-Wide Institutional Title Search & Banking Verification",
    powers: [
      "Perform 30-Year Chain of Title verification & Encumbrance audits",
      "Verify seller digital ZK proof credentials for mortgage processing",
      "File online bank lien notices & mortgage registration intimations",
      "Export certified title clearance audit certificates with cryptographic seals"
    ],
    prohibitions: [
      "Cannot alter, create, or sanction government land records or Patta entries",
      "Cannot access confidential internal administrative revenue proceedings",
      "Cannot approve or reject citizen mutation filings",
      "Cannot modify cadastral map polygons or GIS coordinates"
    ],
    badgeColor: "#0f766e",
    accentBg: "#f0fdfa"
  },
  ADMIN: {
    role: "ADMIN",
    title: "System Administrator (DILRMP Apex Console)",
    cadre: "National Land Records Modernization Technical Command",
    statutoryAct: "Digital India Land Records Modernization Programme (DILRMP 2.0 Guidelines)",
    jurisdictionScope: "National System Architecture & Technical Infrastructure",
    powers: [
      "Manage user accounts, RBAC access roles, and statutory credential provisioning",
      "Configure Indic OCR neural engines, ML pipelines, and model inference thresholds",
      "Monitor Polygon blockchain smart contract telemetry & gas balances",
      "Audit system security logs, database integrity, and automated nightly backups"
    ],
    prohibitions: [
      "Cannot adjudicate judicial land disputes or pass statutory revenue orders",
      "Cannot forge or manually alter registered ownership names without due process",
      "Cannot bypass cryptographic blockchain signatures or smart contract checks",
      "Cannot delete historical transaction audit logs from system archives"
    ],
    badgeColor: "#334155",
    accentBg: "#f8fafc"
  }
};

export function StatutoryPowerBadge({
  activeRole,
  compact = false
}: {
  activeRole?: string;
  compact?: boolean;
}) {
  const { role: contextRole, jurisdiction } = useAuth();
  const [expanded, setExpanded] = useState(!compact);

  const roleKey = (activeRole || contextRole || "CITIZEN").toUpperCase();
  const spec = STATUTORY_POWER_SPECS[roleKey] || STATUTORY_POWER_SPECS.CITIZEN;

  return (
    <div
      className="mb-6 rounded-lg border shadow-sm transition-all"
      style={{
        backgroundColor: "#ffffff",
        borderColor: "#cbd5e1",
      }}
    >
      {/* Top Banner Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b"
        style={{
          backgroundColor: spec.accentBg,
          borderColor: "#e2e8f0",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md font-bold text-white shadow-sm"
            style={{ backgroundColor: spec.badgeColor }}
          >
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: spec.badgeColor }}
              >
                {spec.role}
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                {spec.title}
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {spec.cadre} • <span className="text-slate-800 font-semibold">{spec.statutoryAct}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Jurisdiction indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 shadow-2xs">
            <MapPin className="h-3.5 w-3.5 text-blue-700" />
            <span>{spec.jurisdictionScope}</span>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 rounded text-slate-700 transition"
            title="Switch statutory persona"
          >
            <RefreshCw className="h-3 w-3 text-slate-500" />
            <span>Switch Role</span>
          </Link>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded transition border border-transparent hover:border-slate-200"
            aria-label="Toggle Power Limits Envelope"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Power Limits Matrix */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white text-xs">
          {/* Permitted Powers */}
          <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
            <div className="flex items-center gap-2 mb-2 font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
              <span>Statutory Powers & Delegated Authorities</span>
            </div>
            <ul className="space-y-1.5">
              {spec.powers.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                  <span className="text-emerald-700 font-bold mt-0.5">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Strict Statutory Prohibitions */}
          <div className="rounded-md border border-rose-200 bg-rose-50/40 p-3">
            <div className="flex items-center gap-2 mb-2 font-bold text-rose-900">
              <XCircle className="h-4 w-4 text-rose-700 shrink-0" />
              <span>Strict Statutory Boundaries & Prohibitions</span>
            </div>
            <ul className="space-y-1.5">
              {spec.prohibitions.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-700 leading-relaxed">
                  <span className="text-rose-700 font-bold mt-0.5">✕</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
