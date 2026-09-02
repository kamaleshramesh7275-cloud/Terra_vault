"use client";
import { useState, use } from "react";
import Link from "next/link";
import {
  FileText, ShieldCheck, MapPin, Layers, Lock, Globe,
  CheckCircle2, ArrowRight, Activity, Users, Building2,
  Trees, Eye, Shield, Search, ExternalLink, ChevronRight,
  Landmark, User, Sprout, FileCheck, Scale, Phone
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const STATE_DATA: Record<string, {
  name: string;
  nativeName: string;
  motto: string;
  department: string;
  dilrmpScore: string;
  helpline: string;
  languages: string[];
  rorName: string;
  mapName: string;
  mutationName: string;
  roles: { id: string; title: string; scope: string; desc: string; powers: string[]; href: string; cta: string }[];
}> = {
  tn: {
    name: "Tamil Nadu",
    nativeName: "தமிழ்நாடு அரசு",
    motto: "வாய்மையே வெல்லும் (Truth Alone Triumphs)",
    department: "Revenue & Disaster Management Department",
    dilrmpScore: "96.4%",
    helpline: "1800-425-1333",
    languages: ["English", "தமிழ்"],
    rorName: "Patta / Chitta (பட்டா சான்று)",
    mapName: "FMB Cadastral Sketch (புலப் படம்)",
    mutationName: "Patta Transfer (பட்டா மாறுதல்)",
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Personal Holdings", desc: "Self-service Patta & Chitta PDF downloads, online mutation applications, SRO fee calculator, and ZK-SNARK title privacy proofs.", powers: ["Patta / Chitta Download", "Apply Patta Subdivision", "SRO Guideline Fee Calc", "Generate ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "vao", title: "VAO — Village Administrative Officer", scope: "Kinathukadavu Town (LGD 630401)", desc: "First-mile ground truth verification, geotagged boundary photo uploads, local enquiry reports, and season-wise Adangal crop register updates.", powers: ["Ground Boundary Scrutiny", "Geotag Photo Upload", "Season Adangal Crop Entry", "Forward Report to RI"], href: "/portal/vao", cta: "Open VAO Verification Desk" },
      { id: "ri", title: "RI — Revenue Inspector", scope: "Kinathukadavu Firka (5 Villages)", desc: "Firka-level Field Inspection Report (FIR) scrutiny, SRO Encumbrance Certificate (EC) cross-checks, multi-village boundary overlap inspection.", powers: ["FIR Scrutiny & Remarks", "Cross-Verify SRO EC", "Firka Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Firka Desk" },
      { id: "tahsildar", title: "Tahsildar / Sub-Tahsildar", scope: "Kinathukadavu Revenue Taluk", desc: "Sole statutory authority to sanction Patta Orders, update Master TamilNilam A-Register, execute FMB subdivisions, and seal Polygon blockchain anchors.", powers: ["Statutory Patta Order Sanction", "FMB Subdivision Update", "TamilNilam A-Register Mutate", "Polygon Blockchain E-Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "rdo", title: "RDO — Revenue Divisional Officer", scope: "Pollachi Revenue Division", desc: "1st Appellate Hearing Tribunal for Patta dispute appeals, interim stay order issuance, boundary dispute freezes, and re-survey orders.", powers: ["1st Appellate Hearing Tribunal", "Issue Interim Stay Order", "Freeze Disputed GIS Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open RDO Tribunal Desk" },
      { id: "collector", title: "District Collector Desk", scope: "Coimbatore District", desc: "Apex district revenue oversight, emergency fraud alert overrides, Government Poramboke land assignment, DILRMP metrics, and SHA-256 audit logs.", powers: ["Apex Revision Override", "Emergency Fraud Freeze", "Assign Poramboke Land", "SHA-256 Audit Log Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },
  mh: {
    name: "Maharashtra",
    nativeName: "महाराष्ट्र शासन",
    motto: "प्रतिपच्चन्द्रलेखेव वर्धिष्णुर्विश्ववन्दिता",
    department: "Revenue & Forest Department",
    dilrmpScore: "92.1%",
    helpline: "1800-120-8040",
    languages: ["English", "मराठी"],
    rorName: "7/12 Extract (सातबारा उतारा)",
    mapName: "Mojani Map (मोजणी नकाशा)",
    mutationName: "Ferfar Mutation (फेरफार नोंद)",
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Land Holdings", desc: "Self-service 7/12 Satbara & 8A Extract downloads, Ferfar online mutation applications, and e-Mojani measurement requests.", powers: ["7/12 Satbara Download", "Apply Ferfar Mutation", "e-Mojani Measurement Request", "Generate Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "talathi", title: "Talathi Desk (तलाठी दप्तर)", scope: "Haveli Village (LGD 528901)", desc: "Village level 7/12 register updates, Crop Goshwara entry, and field verification reports.", powers: ["7/12 Register Update", "Crop Goshwara Entry", "Local Verification", "Forward to Circle Officer"], href: "/portal/vao", cta: "Open Talathi Desk" },
      { id: "circle", title: "Circle Officer (मंडळ अधिकारी)", scope: "Haveli Circle (6 Villages)", desc: "Circle level Ferfar dispute scrutiny, spot inspection, and Mutation approval recommendations.", powers: ["Ferfar Scrutiny", "Spot Inspection", "Certify Mutation", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Circle Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Tehsildar", scope: "Haveli Taluka (Pune)", desc: "Statutory sanction for 7/12 Satbara changes, Non-Agricultural (NA) land orders, and Polygon blockchain e-seal.", powers: ["Sanction Satbara Order", "NA Permission Sanction", "e-Mojani Approval", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Desk" },
      { id: "sdo", title: "SDO — Sub-Divisional Officer", scope: "Pune Sub-Division", desc: "1st Appellate Tribunal for 7/12 Satbara appeals, stay orders on disputed land, and re-measurement orders.", powers: ["1st Appellate Hearing", "Issue Stay Order", "Freeze Satbara Record", "Order Re-Measurement"], href: "/portal/rdo", cta: "Open SDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Pune District", desc: "Apex district revenue oversight, Mahabhulekh monitoring, and emergency land dispute overrides.", powers: ["Apex Revision Override", "Mahabhulekh Monitor", "Government Land Assign", "Audit Log Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },
  up: {
    name: "Uttar Pradesh",
    nativeName: "उत्तर प्रदेश सरकार",
    motto: "सत्यमेव जयते (Truth Alone Triumphs)",
    department: "Revenue Department (राजस्व विभाग)",
    dilrmpScore: "88.5%",
    helpline: "1800-180-0888",
    languages: ["English", "हिंदी"],
    rorName: "Khatauni (खतौनी नकल)",
    mapName: "Shajra Map (शजरा नक्शा)",
    mutationName: "Dakhil Kharij (दाखिल खारिज)",
    roles: [
      { id: "citizen", title: "Citizen / Account Holder Desk", scope: "Statewide Holdings", desc: "Self-service Khatauni & Khasra downloads, online Dakhil Kharij applications, and legal title checks.", powers: ["Khatauni Download", "Apply Dakhil Kharij", "Shajra Map View", "Generate Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "lekhpal", title: "Lekhpal Desk (लेखपाल दफ्तर)", scope: "Sadar Village (LGD 134201)", desc: "First-mile field scrutiny, Khasra crop girdawari entry, and spot enquiry reports.", powers: ["Khasra Girdawari Entry", "Spot Measurement", "Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Lekhpal Desk" },
      { id: "kanoongo", title: "Kanoongo / Revenue Inspector", scope: "Sadar Circle (5 Villages)", desc: "Circle level Dakhil Kharij scrutiny, Registry cross-check, and recommendation to Tehsildar.", powers: ["Dakhil Kharij Scrutiny", "Cross-Verify Registry", "Circle Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanoongo Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Tehsildar", scope: "Sadar Tehsil (Lucknow)", desc: "Statutory Court Orders for Dakhil Kharij, Master Khatauni mutation, and Polygon blockchain seal.", powers: ["Sanction Dakhil Kharij", "Bhurajashwa Mutate", "Shajra Demarcation", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Desk" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Lucknow Sub-Division", desc: "1st Revenue Court Appellate Tribunal under UP Revenue Code, interim stay orders, and dispute freezes.", powers: ["1st Revenue Court Hearing", "Issue Stay Order", "Freeze Khatauni Record", "Order Re-Demarcation"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "Lucknow District", desc: "Apex District Magistrate oversight, Bhulekh UP monitoring, and emergency fraud overrides.", powers: ["Apex DM Override", "Bhulekh UP Monitor", "Nazul Land Assignment", "Audit Log Inspector"], href: "/portal/collector", cta: "Open DM Command Desk" },
    ]
  },
  ka: {
    name: "Karnataka",
    nativeName: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ",
    motto: "ಸತ್ಯಮೇವ ಜಯತೇ (Truth Alone Triumphs)",
    department: "Revenue Department (ಕಂದಾಯ ಇಲಾಖೆ)",
    dilrmpScore: "84.0%",
    helpline: "080-22370281",
    languages: ["English", "ಕನ್ನಡ"],
    rorName: "RTC / Pahani (ಆರ್‌ಟಿಸಿ / ಪಹಣಿ)",
    mapName: "Tippani & Aakarbandh Sketch",
    mutationName: "Mutation MR (ಮ್ಯುಟೇಶನ್ నమోదు)",
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Self-service RTC Pahani downloads, Mutation status check, and e-Swathu verification.", powers: ["RTC Pahani Download", "Apply Mutation MR", "Tippani Sketch View", "Generate Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "va", title: "Village Accountant (ಗ್ರಾಮ ಲೆಕ್ಕಿಗ)", scope: "Bengaluru South Village", desc: "First-mile RTC crop entry, field measurement inspection, and local enquiry reports.", powers: ["RTC Crop Entry", "Field Inspection", "Local Verification", "Forward to RI"], href: "/portal/vao", cta: "Open VA Desk" },
      { id: "ri", title: "Revenue Inspector (ಕಂದಾಯ ನಿರೀಕ್ಷಕ)", scope: "Bengaluru South Hobli", desc: "Hobli level Mutation scrutiny, SRO registration cross-check, and Tahsildar recommendation.", powers: ["Mutation Scrutiny", "SRO Cross-Check", "Hobli Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Hobli Desk" },
      { id: "tahsildar", title: "Tahsildar / Sub-Tahsildar", scope: "Bengaluru South Taluk", desc: "Statutory sanction for Mutation Orders, Bhoomi database mutation, and Polygon blockchain seal.", powers: ["Sanction Mutation Order", "Bhoomi System Mutate", "Aakarbandh Update", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Desk" },
      { id: "ac", title: "AC — Assistant Commissioner", scope: "Bengaluru Sub-Division", desc: "1st Appellate Tribunal for RTC Pahani disputes, interim stay orders, and survey demarcation orders.", powers: ["1st Appellate Hearing", "Issue Stay Order", "Freeze Bhoomi RTC", "Order Re-Survey"], href: "/portal/rdo", cta: "Open AC Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Bengaluru Urban District", desc: "Apex District Commissioner oversight, Bhoomi monitoring, and emergency land dispute overrides.", powers: ["Apex DC Override", "Bhoomi System Monitor", "Government Land Assign", "Audit Log Inspector"], href: "/portal/collector", cta: "Open DC Command Center" },
    ]
  }
};

export default function DynamicStatePage({ params }: { params: Promise<{ stateCode: string }> }) {
  const { stateCode } = use(params);
  const st = STATE_DATA[stateCode] || STATE_DATA["tn"];
  const [activeRoleTab, setActiveRoleTab] = useState<string>(st.roles[3].id);
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 50 }}>
      {/* Official Announcement Ticker */}
      <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: 6, marginBottom: 24, display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
        <span style={{ background: "#0f2942", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
          STATE PORTAL ACTIVE
        </span>
        <div style={{ color: "#1e293b", fontWeight: 600 }}>
          Digital India Land Records Modernization Programme (DILRMP 2.0) — {st.name} ({st.nativeName}) Land Revenue Portal.
        </div>
      </div>

      {/* Hero Banner - Sober NIC Palette */}
      <section style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 32, marginBottom: 28, borderTop: "4px solid #0f2942", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 30, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {st.name} {st.department}
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f2942", lineHeight: 1.25, marginBottom: 14 }}>
              Statutory {st.rorName.split("(")[0]} & Spatial Cadastral Portal
            </h1>

            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 22 }}>
              Official e-Governance platform for {st.name} integrating {st.rorName}, {st.mapName}, and Polygon Amoy Blockchain Authentication. Motto: "{st.motto}".
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/citizen" className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", fontSize: 13, gap: 6 }}>
                <User size={15} /> Citizen e-Services Portal <ArrowRight size={14} />
              </Link>
              <Link href="/map" className="btn btn-secondary" style={{ fontSize: 13, gap: 6, borderColor: "#cbd5e1", color: "#0f2942" }}>
                <MapPin size={15} /> Launch GIS Map ({st.mapName.split("(")[0]})
              </Link>
              <Link href="/portal/tahsildar" className="btn btn-secondary" style={{ background: "#f8fafc", borderColor: "#cbd5e1", fontSize: 13, gap: 6, color: "#0f2942" }}>
                <FileCheck size={15} /> Revenue Officers Login
              </Link>
            </div>
          </div>

          <div style={{ padding: 20, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", marginBottom: 12, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <Landmark size={15} color="#0f2942" /> {st.name} Key Revenue Metrics
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: 12, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f2942" }}>{st.dilrmpScore}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>DILRMP Digitization</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>State Progress Score</div>
              </div>
              <div style={{ padding: 12, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0f2942" }}>{st.helpline}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>Toll-Free Helpline</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>State Revenue Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-Services Directory */}
      <section style={{ marginBottom: 30 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f2942", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={17} color="#0f2942" /> {st.name} Citizen e-Services Directory
        </h2>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {[
            { title: `View ${st.rorName.split("(")[0]}`, desc: `Search & download certified ${st.rorName}`, href: "/citizen", icon: FileText },
            { title: st.mutationName, desc: `Apply online for ${st.mutationName}`, href: "/citizen", icon: ArrowRight },
            { title: `GIS ${st.mapName.split("(")[0]}`, desc: `View cadastral survey field boundaries & plot geometry`, href: "/map", icon: Layers },
            { title: "ZK Title Privacy Proof", desc: "Generate Zero-Knowledge Title Proof for bank loans", href: "/citizen", icon: Lock },
          ].map((srv) => (
            <Link key={srv.title} href={srv.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="glass-card" style={{ padding: 18, height: "100%", borderTop: "3px solid #0f2942", background: "#ffffff", borderColor: "#cbd5e1" }}>
                <srv.icon size={20} color="#0f2942" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942" }}>{srv.title}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{srv.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Role Hierarchy Showcase */}
      <section style={{ marginBottom: 30 }}>
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 24, borderTop: "3px solid #0f2942" }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Building2 size={17} color="#0f2942" /> {st.name} Statutory Revenue Officer Hierarchy
          </h2>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {st.roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoleTab(r.id)}
                className={`btn ${activeRoleTab === r.id ? "btn-primary" : "btn-secondary"}`}
                style={{ fontSize: 12, padding: "6px 14px", background: activeRoleTab === r.id ? "#0f2942" : "#ffffff", borderColor: "#cbd5e1", color: activeRoleTab === r.id ? "#ffffff" : "#0f2942" }}
              >
                {r.title.split("—")[0]}
              </button>
            ))}
          </div>

          {(() => {
            const r = st.roles.find(item => item.id === activeRoleTab) || st.roles[3];
            return (
              <div style={{ padding: 20, background: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f2942", margin: 0 }}>{r.title}</h3>
                    <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginTop: 2 }}>
                      Jurisdiction: {r.scope}
                    </div>
                  </div>
                  <Link href={r.href} className="btn btn-primary" style={{ background: "#0f2942", fontSize: 12, borderColor: "#1e293b" }}>
                    {r.cta} <ArrowRight size={14} />
                  </Link>
                </div>
                <p style={{ fontSize: 13, color: "#475569", marginBottom: 14 }}>{r.desc}</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {r.powers.map((p, i) => (
                    <span key={i} style={{ padding: "4px 10px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11, fontWeight: 600, color: "#0f2942" }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>
    </div>
  );
}
