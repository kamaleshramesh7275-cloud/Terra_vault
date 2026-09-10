"use client";
import { useState, use } from "react";
import Link from "next/link";
import {
  FileText, ShieldCheck, MapPin, Layers, Lock, Globe,
  CheckCircle2, ArrowRight, Activity, Users, Building2,
  Trees, Eye, Shield, Search, ExternalLink, ChevronRight,
  Landmark, User, Sprout, FileCheck, Scale, Phone, Compass
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStateMetadata, ALL_INDIAN_STATES } from "@/lib/stateRegistry";

export default function DynamicStatePage({ params }: { params: Promise<{ stateCode: string }> }) {
  const { stateCode } = use(params);
  const st = getStateMetadata(stateCode);
  const defaultRole = st.roles && st.roles.length > 3 ? st.roles[3].id : (st.roles?.[0]?.id || "citizen");
  const [activeRoleTab, setActiveRoleTab] = useState<string>(defaultRole);
  const { t } = useLanguage();

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", paddingBottom: 50 }}>
      {/* Official Announcement Ticker */}
      <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 18px", borderRadius: 6, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ background: "#0f2942", color: "#ffffff", padding: "2px 8px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
            STATE PORTAL ACTIVE
          </span>
          <div style={{ color: "#1e293b", fontWeight: 600 }}>
            Digital India Land Records Modernization Programme (DILRMP 2.0) — {st.name} ({st.nativeName}) Land Administration Portal.
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#1e3a8a", fontWeight: 700 }}>
          Region: <strong>{st.region}</strong> | Languages: <strong>{st.languages.join(", ")}</strong>
        </div>
      </div>

      {/* Hero Banner */}
      <section style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 30, marginBottom: 24, borderTop: "4px solid #0f2942", boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}>
        <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr", gap: 26, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {st.name} • {st.department}
            </div>

            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f2942", lineHeight: 1.25, marginBottom: 12 }}>
              Statutory {st.rorName.split("(")[0]} & Spatial Cadastral Portal
            </h1>

            <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6, marginBottom: 20 }}>
              Official e-Governance platform for {st.name} integrating statutory {st.rorName}, {st.mapName}, online {st.mutationName}, and Polygon Amoy Blockchain Verification. Motto: "{st.motto}".
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href={`/citizen?state=${st.code}`} className="btn btn-primary" style={{ background: "#0f2942", borderColor: "#1e293b", fontSize: 12.5, gap: 6 }}>
                <User size={14} /> Citizen e-Services Portal <ArrowRight size={13} />
              </Link>
              <Link href="/map" className="btn btn-secondary" style={{ fontSize: 12.5, gap: 6, borderColor: "#cbd5e1", color: "#0f2942" }}>
                <MapPin size={14} /> Launch Cadastral Map ({st.sampleDistrict.split("(")[0]})
              </Link>
              <Link href={`/login?state=${st.code}`} className="btn btn-secondary" style={{ background: "#f8fafc", borderColor: "#cbd5e1", fontSize: 12.5, gap: 6, color: "#0f2942" }}>
                <FileCheck size={14} /> {st.name} Officers Login Gateway
              </Link>
            </div>
          </div>

          <div style={{ padding: 18, background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", marginBottom: 12, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <Landmark size={15} color="#0f2942" /> {st.name} Revenue Administration Metrics
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f2942" }}>{st.dilrmpScore}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>DILRMP Progress</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{st.dilrmpRank}</div>
              </div>
              <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f2942" }}>{st.helpline}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0f2942", marginTop: 2 }}>Toll-Free Support</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>Emergency: {st.emergencyNo}</div>
              </div>
              <div style={{ padding: 10, background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, gridColumn: "span 2" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#0f2942" }}>{st.sampleDistrict}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>Centroid Focus: {st.centerLat.toFixed(4)}° N, {st.centerLng.toFixed(4)}° E</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E-Services Directory */}
      <section style={{ marginBottom: 26 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={16} color="#0f2942" /> {st.name} Citizen e-Services Directory
        </h2>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {[
            { title: `View ${st.rorName.split("(")[0]}`, desc: `Search & download certified digital ${st.rorName}`, href: "/citizen", icon: FileText },
            { title: st.mutationName, desc: `Apply online for statutory ${st.mutationName}`, href: "/citizen", icon: ArrowRight },
            { title: `GIS ${st.mapName.split("(")[0]}`, desc: `View cadastral survey field boundaries & plot geometry in ${st.sampleDistrict.split("(")[0]}`, href: "/map", icon: Layers },
            { title: "ZK Title Privacy Proof", desc: "Generate Zero-Knowledge Title Proof for bank mortgages and commercial vetting", href: "/citizen", icon: Lock },
          ].map((srv) => (
            <Link key={srv.title} href={srv.href} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="glass-card" style={{ padding: 16, height: "100%", borderTop: "3px solid #0f2942", background: "#ffffff", borderColor: "#cbd5e1", borderRadius: 6 }}>
                <srv.icon size={18} color="#0f2942" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942" }}>{srv.title}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>{srv.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic State Administrative Power Level Login Portal */}
      <section style={{ marginBottom: 30 }}>
        <div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8, padding: 22, borderTop: "4px solid #0f2942", boxShadow: "0 2px 4px rgba(15,23,42,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f2942", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Building2 size={18} color="#0f2942" /> {st.name} Statutory Revenue Officer Power Levels
              </h2>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>
                Select administrative tier to view statutory powers or sign in directly to the officer desk.
              </div>
            </div>

            <Link
              href={`/login?state=${st.code}`}
              className="btn btn-primary"
              style={{ background: "#0f2942", fontSize: 12, borderColor: "#1e293b", padding: "6px 14px", gap: 6 }}
            >
              <ShieldCheck size={14} /> Open Full {st.name} SSO Gateway <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {st.roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoleTab(r.id)}
                className={`btn ${activeRoleTab === r.id ? "btn-primary" : "btn-secondary"}`}
                style={{
                  fontSize: 12, padding: "6px 14px",
                  background: activeRoleTab === r.id ? "#0f2942" : "#ffffff",
                  borderColor: "#cbd5e1",
                  color: activeRoleTab === r.id ? "#ffffff" : "#0f2942",
                  fontWeight: activeRoleTab === r.id ? 700 : 500
                }}
              >
                {r.title.split("—")[0].split("(")[0].trim()}
              </button>
            ))}
          </div>

          {(() => {
            const r = st.roles.find((item) => item.id === activeRoleTab) || st.roles[0];
            if (!r) return null;

            const handleDirectRoleLogin = () => {
              if (typeof window !== "undefined") {
                localStorage.setItem("tv_state", st.code);
                localStorage.setItem("tv_role", r.id);
                localStorage.setItem("tv_token", `tv_token_persona_${r.id}_${Date.now()}`);
                localStorage.setItem("tv_user", JSON.stringify({
                  username: `${r.id}_${st.code}_official`,
                  role: r.id,
                  displayName: `${r.title} (${st.name})`
                }));
                window.location.href = r.href;
              }
            };

            return (
              <div style={{ padding: 20, background: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0f2942", margin: 0 }}>{r.title}</h3>
                    <div style={{ fontSize: 11.5, color: "#1e3a8a", fontWeight: 700, marginTop: 3 }}>
                      Statutory Scope: {r.scope}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleDirectRoleLogin}
                      className="btn btn-primary"
                      style={{ background: "#16a34a", borderColor: "#15803d", fontSize: 11.5, padding: "7px 14px", gap: 6 }}
                    >
                      <User size={13} /> Sign In as {r.title.split("—")[0].split("(")[0].trim()} <ArrowRight size={13} />
                    </button>
                    <Link href={`/login?state=${st.code}`} className="btn btn-secondary" style={{ fontSize: 11.5, borderColor: "#cbd5e1", padding: "7px 14px" }}>
                      SSO Gateway
                    </Link>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, marginBottom: 14 }}>{r.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
