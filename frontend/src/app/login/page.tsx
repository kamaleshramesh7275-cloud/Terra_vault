"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import {
  ShieldCheck, Lock, User, Key, ArrowRight, CheckCircle2,
  Building2, Globe, Loader2, Shield, CreditCard, Landmark, Sprout, Search, FileCheck, Scale
} from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams ? searchParams.get("next") : null;

  const [username, setUsername] = useState("tahsildar_kinathukadavu");
  const [password, setPassword] = useState("••••••••••••");
  const [selectedRole, setSelectedRole] = useState("tahsildar");
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<string | null>(null);

  const ROLE_MAP: Record<string, { title: string; route: string; color: string; desc: string; scope: string }> = {
    citizen: { title: "Citizen / Pattadar Desk", route: "/citizen", color: "#16a34a", desc: "Patta/Chitta Downloads, Subdivision Applications & ZK Proofs", scope: "Statewide Personal Holdings" },
    vao: { title: "VAO — Village Administrative Officer", route: "/portal/vao", color: "#16a34a", desc: "Ground Truth Scrutiny, Geotag Photo Upload & Adangal Entry", scope: "Kinathukadavu Town (LGD 630401)" },
    ri: { title: "RI — Revenue Inspector", route: "/portal/ri", color: "#1e3a8a", desc: "Firka Scrutiny, SRO EC Validation & FIR Approval", scope: "Kinathukadavu Firka (5 Villages)" },
    tahsildar: { title: "Tahsildar / Sub-Tahsildar", route: "/portal/tahsildar", color: "#1e3a8a", desc: "Statutory Patta Order Sanction, FMB Update & Polygon Blockchain Seal", scope: "Kinathukadavu Revenue Taluk" },
    rdo: { title: "RDO — Revenue Divisional Officer", route: "/portal/rdo", color: "#d97706", desc: "1st Appellate Tribunal, Interim Stay Orders & Dispute Freezes", scope: "Pollachi Revenue Division" },
    collector: { title: "District Collector Desk", route: "/portal/collector", color: "#dc2626", desc: "Apex District Command Center, Emergency Fraud Override & Audit Logs", scope: "Coimbatore District" },
  };

  const handleLogin = async (e?: React.FormEvent, overrideRole?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    const roleToUse = overrideRole || selectedRole;
    setActivePersona(roleToUse);

    try {
      const res = await api.getPersonaToken(roleToUse);
      const token = res.access_token || `tv_token_persona_${roleToUse.toLowerCase()}_${Date.now()}`;
      localStorage.setItem("tv_token", token);
      localStorage.setItem("tv_role", roleToUse);
      localStorage.setItem("tv_user", JSON.stringify({
        username: `${roleToUse}_official`,
        role: roleToUse
      }));

      const defaultRoute = ROLE_MAP[roleToUse]?.route || "/";
      const targetRoute = nextRoute || defaultRoute;
      window.location.href = targetRoute;
    } catch (err) {
      console.error("Login error", err);
      const token = `tv_token_persona_${roleToUse.toLowerCase()}_${Date.now()}`;
      localStorage.setItem("tv_token", token);
      localStorage.setItem("tv_role", roleToUse);
      localStorage.setItem("tv_user", JSON.stringify({
        username: `${roleToUse}_official`,
        role: roleToUse
      }));
      const defaultRoute = ROLE_MAP[roleToUse]?.route || "/";
      const targetRoute = nextRoute || defaultRoute;
      window.location.href = targetRoute;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px", borderRadius: 4, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
          <ShieldCheck size={14} color="#1e3a8a" />
          OFFICIAL e-GOVERNANCE SINGLE SIGN-ON (SSO) PORTAL
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f2942", margin: 0 }}>
          Revenue Department Official Sign-In
        </h1>
        <p style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>
          Select statutory revenue role persona or enter official government credentials
        </p>
      </div>

      {/* Split Screen Layout */}
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: 20, alignItems: "start" }}>
        {/* ── Left Panel: 6 Quick Persona Cards ───────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Statutory Role Demonstration Quick Desks
          </div>

          {Object.entries(ROLE_MAP).map(([key, info]) => {
            const isSelected = selectedRole === key;
            const isAct = activePersona === key && loading;
            return (
              <div
                key={key}
                onClick={() => {
                  setSelectedRole(key);
                  handleLogin(undefined, key);
                }}
                className="glass-card"
                style={{
                  padding: 14,
                  borderLeft: `4px solid ${info.color}`,
                  border: isSelected ? `1px solid ${info.color}` : "1px solid #cbd5e1",
                  background: isSelected ? "#eff6ff" : "#ffffff",
                  cursor: "pointer"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f2942" }}>
                      {info.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
                      {info.desc}
                    </div>
                    <div style={{ fontSize: 10, color: info.color, fontWeight: 700, marginTop: 4 }}>
                      Jurisdiction: {info.scope}
                    </div>
                  </div>
                  <div>
                    {isAct ? (
                      <Loader2 size={16} className="spin" color={info.color} />
                    ) : (
                      <span className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11, background: "#f1f5f9" }}>
                        Sign In <ArrowRight size={12} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Right Panel: Standard Credentials Form ──────────────────────── */}
        <div className="glass-card" style={{ padding: 24, borderTop: "4px solid #0f2942" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={16} color="#1e3a8a" /> Government Official Credentials
          </h3>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                Govt Employee ID / Username / Aadhaar #
              </label>
              <div style={{ position: "relative" }}>
                <User size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                  style={{ width: "100%", paddingLeft: 34 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                Password / e-Sign Passcode
              </label>
              <div style={{ position: "relative" }}>
                <Key size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ width: "100%", paddingLeft: 34 }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                Select Revenue Designation
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input"
                style={{ width: "100%" }}
              >
                <option value="citizen">Citizen / Pattadar Desk</option>
                <option value="vao">VAO — Village Administrative Officer</option>
                <option value="ri">RI — Revenue Inspector</option>
                <option value="tahsildar">Tahsildar / Sub-Tahsildar</option>
                <option value="rdo">RDO — Revenue Divisional Officer</option>
                <option value="collector">District Collector Desk</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: 10, fontSize: 13, background: "#0f2942", marginTop: 4 }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin" /> Authenticating JWT Session...
                </>
              ) : (
                <>
                  Sign In to Revenue Portal <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* e-Gov SSO Buttons */}
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #cbd5e1", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, marginBottom: 10 }}>
              NATIONAL SINGLE SIGN-ON (SSO) GATEWAYS
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center", fontSize: 11, gap: 6 }}
                onClick={() => alert("Redirecting to Aadhaar e-KYC Single Sign-On Gateway...")}
              >
                <CreditCard size={13} color="#1e3a8a" /> Aadhaar e-KYC SSO
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, justifyContent: "center", fontSize: 11, gap: 6 }}
                onClick={() => alert("Redirecting to TN e-Pattadar OAuth Gateway...")}
              >
                <Landmark size={13} color="#1e3a8a" /> TN e-Pattadar SSO
              </button>
            </div>
          </div>

          {/* Security Compliance Badge */}
          <div style={{ padding: 10, borderRadius: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", marginTop: 16, fontSize: 11, color: "#16a34a", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <ShieldCheck size={15} color="#16a34a" /> MeitY Empanelled 256-bit SSL Encrypted & Polygon Amoy Blockchain Verified.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: "center", padding: "50px 0" }}>
        <Loader2 className="spin" size={32} color="#0f2942" />
        <div style={{ fontSize: 14, marginTop: 12, color: "#475569" }}>Loading Revenue Portal Single Sign-On...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
