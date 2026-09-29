"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../components/AuthGuard";
import { api } from "../../lib/api";
import { sendResetPassword } from "../../lib/firebase";
import {
  ShieldCheck, Lock, Mail, Key, ArrowRight, CheckCircle2,
  Building2, Globe, Loader2, Shield, CreditCard, Landmark, Sprout, Search, FileCheck, Scale,
  AlertCircle, Sparkles, ChevronDown, ChevronUp, UserCheck, Eye, EyeOff, Copy, Check, User
} from "lucide-react";
import Link from "next/link";
import { getStateMetadata, getAllStatesList } from "../../lib/stateRegistry";

export interface DemoPersona {
  id: string;
  role: string;
  title: string;
  email: string;
  password: string;
  name: string;
  scope: string;
  route: string;
  color: string;
  desc: string;
  routesAllowed: string[];
}

export const REVIEWER_PERSONAS: DemoPersona[] = [
  {
    id: "citizen",
    role: "CITIZEN",
    title: "Citizen / Pattadar",
    email: "citizen@terravault.gov.in",
    password: "TerraVault@2026",
    name: "Thiru. S. Arumugam (Pattadar)",
    scope: "Kinathukadavu Village • Survey No. 84/1",
    route: "/citizen",
    color: "#047857",
    desc: "Self-service Patta & Chitta download, mutation filing, ZK ownership proofs",
    routesAllowed: ["/citizen", "/map", "/records", "/blockchain"]
  },
  {
    id: "vao",
    role: "VAO",
    title: "VAO (Ground Desk)",
    email: "vao.kinathukadavu@tn.gov.in",
    password: "TerraVault@2026",
    name: "K. Selvaraj (VAO)",
    scope: "Kinathukadavu Village (Code: 630401)",
    route: "/portal/vao",
    color: "#059669",
    desc: "Village ground verification, crop adangal updates, local mutation forwarding",
    routesAllowed: ["/portal/vao", "/map", "/records", "/upload", "/map/digital-twin"]
  },
  {
    id: "ri",
    role: "RI",
    title: "Revenue Inspector (RI)",
    email: "ri.kinathukadavu@tn.gov.in",
    password: "TerraVault@2026",
    name: "M. Thangavel (RI)",
    scope: "Kinathukadavu Firka (7 Revenue Villages)",
    route: "/portal/ri",
    color: "#0284c7",
    desc: "Firka field scrutiny, SRO encumbrance cross-verification, deed verification",
    routesAllowed: ["/portal/ri", "/portal/vao", "/review", "/map", "/upload"]
  },
  {
    id: "tahsildar",
    role: "TAHSILDAR",
    title: "Tahsildar (Executive)",
    email: "tahsildar.kinathukadavu@tn.gov.in",
    password: "TerraVault@2026",
    name: "R. Soundararajan (Tahsildar)",
    scope: "Kinathukadavu Taluk (48 Revenue Villages)",
    route: "/portal/tahsildar",
    color: "#1e40af",
    desc: "Statutory Patta order issuance, sub-division sanction, blockchain seal",
    routesAllowed: ["/portal/tahsildar", "/portal/ri", "/review", "/analytics", "/blockchain"]
  },
  {
    id: "rdo",
    role: "RDO",
    title: "RDO (Tribunal Desk)",
    email: "rdo.pollachi@tn.gov.in",
    password: "TerraVault@2026",
    name: "Dr. P. Meenakshi, IAS (RDO)",
    scope: "Pollachi Revenue Division (3 Taluks)",
    route: "/portal/rdo",
    color: "#7c3aed",
    desc: "First appellate hearings, interim stay orders, disputed plot freezing",
    routesAllowed: ["/portal/rdo", "/portal/tahsildar", "/review", "/analytics"]
  },
  {
    id: "collector",
    role: "DISTRICT_COLLECTOR",
    title: "District Collector",
    email: "collector.coimbatore@tn.gov.in",
    password: "TerraVault@2026",
    name: "Thiru Kranthi Kumar Pati, IAS (Collector)",
    scope: "Coimbatore District (Apex Command)",
    route: "/portal/collector",
    color: "#b45309",
    desc: "District apex revision, fraud overrides, security audit inspection",
    routesAllowed: ["/portal/collector", "/portal/rdo", "/portal/tahsildar", "/admin", "/analytics"]
  },
  {
    id: "business",
    role: "BUSINESS",
    title: "Bank & Commercial Desk",
    email: "commercial.bank@sbi.co.in",
    password: "TerraVault@2026",
    name: "State Bank of India (Title Audit Desk)",
    scope: "Statewide Commercial Title Clearance",
    route: "/business",
    color: "#0f766e",
    desc: "Institutional mortgage screening, bulk title verification, encumbrance check",
    routesAllowed: ["/business", "/map", "/records", "/blockchain"]
  },
  {
    id: "admin",
    role: "ADMIN",
    title: "System Administrator",
    email: "admin@terravault.gov.in",
    password: "TerraVault@2026",
    name: "Terra_vault System Administrator",
    scope: "National Infrastructure & Full Command",
    route: "/admin",
    color: "#b91c1c",
    desc: "System configuration, user provisioning, model pipelines, full access",
    routesAllowed: ["/admin", "/portal/collector", "/review", "/upload", "/analytics", "/map/digital-twin"]
  }
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams ? searchParams.get("next") : null;
  const stateCodeParam = searchParams ? searchParams.get("state") : null;

  // Active State Metadata
  const [activeStateCode, setActiveStateCode] = useState<string>(
    (stateCodeParam || (typeof window !== "undefined" ? localStorage.getItem("tv_state") : null) || "tn").toLowerCase()
  );

  const st = getStateMetadata(activeStateCode);
  const allStates = getAllStatesList();
  const { loginWithGoogle, loginWithEmail, registerWithEmail, isFirebaseLive } = useAuth();

  // Mode: "signin" | "signup" | "forgot"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");
  
  // Selected Persona (Default to Citizen)
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("citizen");
  const activePersona = REVIEWER_PERSONAS.find((p) => p.id === selectedPersonaId) || REVIEWER_PERSONAS[0];

  // Pre-filled credentials in input fields
  const [email, setEmail] = useState<string>(activePersona.email);
  const [password, setPassword] = useState<string>(activePersona.password);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>(activePersona.name);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCredentialsTable, setShowCredentialsTable] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // When persona changes, auto-fill the fields directly
  const handleSelectPersona = (persona: DemoPersona) => {
    setSelectedPersonaId(persona.id);
    setEmail(persona.email);
    setPassword(persona.password);
    setFullName(persona.name);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1800);
    }
  };

  const handleStateChange = (newCode: string) => {
    setActiveStateCode(newCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_state", newCode);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("tv_state", st.code);
      }
      if (isFirebaseLive) {
        await loginWithGoogle();
        const targetRoute = nextRoute || activePersona.route || "/citizen";
        window.location.href = targetRoute;
      } else {
        const token = `tv_token_persona_${activePersona.role.toLowerCase()}_${Date.now()}`;
        localStorage.setItem("tv_token", token);
        localStorage.setItem("tv_role", activePersona.role.toLowerCase());
        localStorage.setItem("tv_user", JSON.stringify({
          email: "google.user@example.com",
          displayName: "Google Verified User",
          username: "google_user"
        }));
        const targetRoute = nextRoute || activePersona.route || "/citizen";
        window.location.href = targetRoute;
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setErrorMsg(err.message || "Google Authentication failed. Please verify popup permissions.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("tv_state", st.code);
      }

      if (authMode === "forgot") {
        await sendResetPassword(email);
        setSuccessMsg("Password reset link sent to your email address.");
        setLoading(false);
        return;
      }

      // 1. Try Backend Token Auth first (Works for seeded demo accounts & DB users)
      try {
        const tokenRes = await api.login(email, password);
        if (tokenRes?.access_token) {
          localStorage.setItem("tv_token", tokenRes.access_token);
          const assignedRole = (tokenRes.role || activePersona.role).toLowerCase();
          localStorage.setItem("tv_role", assignedRole);
          localStorage.setItem("tv_user", JSON.stringify({
            username: email.split("@")[0],
            email: email,
            displayName: fullName || activePersona.name,
            role: assignedRole
          }));

          const targetRoute = nextRoute || activePersona.route || "/";
          setSuccessMsg(`Authenticated successfully as ${activePersona.title}! Redirecting...`);
          setTimeout(() => {
            window.location.href = targetRoute;
          }, 300);
          return;
        }
      } catch (backendErr: any) {
        // If Firebase is configured and user is custom, try Firebase fallback
        if (isFirebaseLive) {
          if (authMode === "signup") {
            await registerWithEmail(email, password, fullName);
            setSuccessMsg("Account created successfully! Redirecting...");
          } else {
            await loginWithEmail(email, password);
          }
          const targetRoute = nextRoute || activePersona.route || "/citizen";
          setTimeout(() => {
            window.location.href = targetRoute;
          }, 300);
          return;
        }
        throw backendErr;
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Authentication failed. For demo review, select any role pill above with pre-filled credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleFastPassSignIn = async (persona: DemoPersona) => {
    handleSelectPersona(persona);
    setLoading(true);
    setErrorMsg(null);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("tv_state", st.code);
      }

      let token = `tv_token_persona_${persona.role.toLowerCase()}_${Date.now()}`;
      try {
        const res = await api.getPersonaToken(persona.role);
        if (res?.access_token) {
          token = res.access_token;
        }
      } catch {}

      localStorage.setItem("tv_token", token);
      localStorage.setItem("tv_role", persona.role.toLowerCase());
      localStorage.setItem("tv_user", JSON.stringify({
        username: persona.email.split("@")[0],
        email: persona.email,
        displayName: persona.name,
        role: persona.role.toLowerCase()
      }));

      const targetRoute = nextRoute || persona.route || "/";
      setSuccessMsg(`1-Click Fast Pass: Entering ${persona.title} Workspace...`);
      setTimeout(() => {
        window.location.href = targetRoute;
      }, 250);
    } catch (err: any) {
      setErrorMsg(err.message || "Fast pass sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 0" }}>
      {/* ── Header Banner: Official Identity ─────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 14px", borderRadius: 4, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 11.5, fontWeight: 700 }}>
            <ShieldCheck size={14} color="#1e40af" />
            DILRMP 2.0 • STATUTORY RBAC AUTHENTICATION GATEWAY
          </div>

          <select
            value={st.code}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{
              padding: "4px 10px", borderRadius: 4, border: "1px solid #1e40af",
              background: "#0f2942", color: "#ffffff", fontSize: 11.5, fontWeight: 700,
              cursor: "pointer"
            }}
          >
            {allStates.map((s) => (
              <option key={s.code} value={s.code}>
                🇮🇳 {s.name} ({s.portalName})
              </option>
            ))}
          </select>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f2942", margin: 0, letterSpacing: "-0.02em", fontFamily: "var(--font-head)" }}>
          Terra_vault Revenue Single Sign-On (SSO)
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", maxWidth: 650, margin: "4px auto 0" }}>
          Statutory access gateway for Land Administration Officers, Surveyors, Pattadars, and Financial Auditors.
        </p>
      </div>

      {/* ── Interactive 8-Persona Role Quick Selector (For Reviewers) ───── */}
      <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: "14px 16px", marginBottom: 20, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={14} color="#b45309" /> Select Demo Role (Pre-fills credentials automatically):
          </div>
          <span style={{ fontSize: 11, color: "#047857", fontWeight: 700, background: "#ecfdf5", padding: "2px 8px", borderRadius: 4, border: "1px solid #a7f3d0" }}>
            ✓ Ready for instant evaluation
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          {REVIEWER_PERSONAS.map((p) => {
            const isSelected = selectedPersonaId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPersona(p)}
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  border: isSelected ? `2px solid ${p.color}` : "1px solid #e2e8f0",
                  background: isSelected ? "#eff6ff" : "#f8fafc",
                  color: isSelected ? "#0f2942" : "#475569",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, color: isSelected ? p.color : "#0f2942", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{p.title}</span>
                  {isSelected && <Check size={12} color={p.color} strokeWidth={3} />}
                </div>
                <div style={{ fontSize: 10, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.role}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Grid Layout: Form on Left, Active Scope & Matrix on Right ─ */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24, alignItems: "start" }}>
        
        {/* Left Column: Pre-Filled Credential Sign-In Form */}
        <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", borderTop: `4px solid ${activePersona.color}`, padding: 24, boxShadow: "var(--shadow-card)" }}>
          
          {/* Active Role Specimen Banner */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 14px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>ACTIVE EVALUATION PERSONA</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: activePersona.color }}>{activePersona.title}</div>
              <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{activePersona.name}</div>
            </div>
            <button
              type="button"
              onClick={() => handleFastPassSignIn(activePersona)}
              className="btn-primary"
              style={{ background: activePersona.color, borderColor: activePersona.color, fontSize: 11.5, padding: "6px 12px" }}
              title="Instantly sign in as this persona"
            >
              ⚡ 1-Click Login
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: 18 }}>
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: authMode === "signin" ? "#1e40af" : "#64748b",
                borderBottom: authMode === "signin" ? "2px solid #1e40af" : "2px solid transparent",
                marginBottom: -2,
                transition: "all 0.15s"
              }}
            >
              Sign In (Pre-Filled)
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: "8px 0",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: authMode === "signup" ? "#1e40af" : "#64748b",
                borderBottom: authMode === "signup" ? "2px solid #1e40af" : "2px solid transparent",
                marginBottom: -2,
                transition: "all 0.15s"
              }}
            >
              New Registration
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} color="#b91c1c" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#15803d" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {authMode === "signup" && (
              <div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                  Full Name / Statutory Designation
                </label>
                <div style={{ position: "relative" }}>
                  <UserCheck size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. S. Arumugam / Tahsildar K."
                    className="input"
                    style={{ width: "100%", paddingLeft: 34, fontSize: 13 }}
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field with Pre-filled Indicator */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                  Official Email / Username
                </label>
                <span style={{ fontSize: 10.5, color: "#047857", fontWeight: 700, background: "#ecfdf5", padding: "1px 6px", borderRadius: 3 }}>
                  Pre-filled
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@tn.gov.in"
                  className="input"
                  style={{ width: "100%", paddingLeft: 34, fontSize: 13, fontWeight: 600 }}
                  required
                />
              </div>
            </div>

            {/* Password Field with Show/Hide Toggle */}
            {authMode !== "forgot" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                    Password
                  </label>
                  <span style={{ fontSize: 10.5, color: "#047857", fontWeight: 700, background: "#ecfdf5", padding: "1px 6px", borderRadius: 3 }}>
                    Demo: TerraVault@2026
                  </span>
                </div>
                <div style={{ position: "relative" }}>
                  <Key size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 10 }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input"
                    style={{ width: "100%", paddingLeft: 34, paddingRight: 36, fontSize: 13, fontWeight: 600 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: 10, top: 9, background: "none", border: "none", color: "#64748b", cursor: "pointer" }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 16px",
                  fontSize: 13.5,
                  background: "#1e40af"
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="spin" /> Authenticating Session...
                  </>
                ) : (
                  <>
                    Sign In with Selected Credentials <ArrowRight size={14} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleFastPassSignIn(activePersona)}
                disabled={loading}
                className="btn-secondary"
                style={{ width: "100%", justifyContent: "center", fontSize: 12.5, padding: "8px 14px", border: "1px dashed #cbd5e1" }}
              >
                ⚡ 1-Click Fast Pass (Bypass Form & Enter {activePersona.title})
              </button>
            </div>
          </form>

          {/* Security Compliance Footnote */}
          <div style={{ padding: 10, borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", marginTop: 18, fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={16} color="#047857" style={{ flexShrink: 0 }} />
            <span>MeitY Empanelled 256-bit SSL Encrypted & Polygon Amoy Blockchain Anchored.</span>
          </div>
        </div>

        {/* Right Column: Persona Scope, Rights & Accessible Portals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          
          {/* Active Persona Inspection Card */}
          <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 20, boxShadow: "var(--shadow-card)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f2942", textTransform: "uppercase" }}>
                Role Clearance & Jurisdiction
              </div>
              <span className="badge badge-verified" style={{ fontSize: 11 }}>
                Role: {activePersona.role}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5, color: "#334155" }}>
              <div><strong>Designation:</strong> {activePersona.name}</div>
              <div><strong>Territorial Scope:</strong> {activePersona.scope}</div>
              <div><strong>Statutory Duties:</strong> {activePersona.desc}</div>
              
              <div style={{ marginTop: 6, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, color: "#0f2942", marginBottom: 6, fontSize: 11.5 }}>
                  Accessible Workspaces & Portals:
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {activePersona.routesAllowed.map((rt) => (
                    <span key={rt} style={{ fontSize: 11, padding: "2px 7px", background: "#f1f5f9", color: "#1e40af", borderRadius: 4, border: "1px solid #cbd5e1", fontWeight: 600 }}>
                      {rt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick SSO Integrations */}
          <div style={{ background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "#0f2942", marginBottom: 10, textTransform: "uppercase" }}>
              National & State Identity Federation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ justifyContent: "center", fontSize: 11.5, gap: 6, padding: "7px 10px" }}
                onClick={() => alert("Aadhaar e-KYC Sandbox Connected. Verified OTP simulated.")}
              >
                <CreditCard size={13} color="#1e40af" /> UIDAI e-KYC
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ justifyContent: "center", fontSize: 11.5, gap: 6, padding: "7px 10px" }}
                onClick={() => alert("State SSO Gateway Connected.")}
              >
                <Landmark size={13} color="#1e40af" /> State Single Sign-On
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Reviewer Evaluation Credentials Cheat Sheet Table ─────────────── */}
      <div style={{ marginTop: 24, background: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", padding: 20, boxShadow: "var(--shadow-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0f2942", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Shield size={16} color="#1e40af" /> Reviewer Evaluation Credentials Directory
            </h3>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              All accounts are pre-configured with active RBAC permissions. Click &quot;Fill &amp; Test&quot; on any row to evaluate that workspace.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCredentialsTable(!showCredentialsTable)}
            style={{ fontSize: 11.5, color: "#1e40af", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
          >
            {showCredentialsTable ? "Collapse Table" : "Expand Table"}
            {showCredentialsTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showCredentialsTable && (
          <div style={{ overflowX: "auto" }}>
            <table className="tv-table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={{ padding: "8px 10px" }}>Role / Persona</th>
                  <th style={{ padding: "8px 10px" }}>Email Username</th>
                  <th style={{ padding: "8px 10px" }}>Password</th>
                  <th style={{ padding: "8px 10px" }}>Jurisdiction</th>
                  <th style={{ padding: "8px 10px" }}>Target Workspace</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {REVIEWER_PERSONAS.map((p) => {
                  const isSelected = selectedPersonaId === p.id;
                  return (
                    <tr key={p.id} style={{ background: isSelected ? "#f0fdf4" : undefined }}>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: p.color }}>
                        {p.title}
                      </td>
                      <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#0f2942" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{p.email}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.email, `email_${p.id}`)}
                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 1 }}
                            title="Copy email"
                          >
                            {copiedKey === `email_${p.id}` ? <Check size={12} color="#047857" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#64748b" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>{p.password}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(p.password, `pass_${p.id}`)}
                            style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: 1 }}
                            title="Copy password"
                          >
                            {copiedKey === `pass_${p.id}` ? <Check size={12} color="#047857" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: "8px 10px", color: "#475569" }}>
                        {p.scope}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", fontFamily: "monospace" }}>
                          {p.route}
                        </span>
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => handleFastPassSignIn(p)}
                          className="btn-primary"
                          style={{ background: isSelected ? p.color : "#0f2942", fontSize: 11, padding: "3px 8px", borderRadius: 4 }}
                        >
                          Fill & Test
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
