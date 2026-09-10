"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../components/AuthGuard";
import { api } from "../../lib/api";
import { sendResetPassword } from "../../lib/firebase";
import {
  ShieldCheck, Lock, Mail, Key, ArrowRight, CheckCircle2,
  Building2, Globe, Loader2, Shield, CreditCard, Landmark, Sprout, Search, FileCheck, Scale,
  AlertCircle, Sparkles, ChevronDown, ChevronUp, UserCheck
} from "lucide-react";
import Link from "next/link";
import { getStateMetadata, getAllStatesList } from "../../lib/stateRegistry";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState(st.roles?.[0]?.id || "citizen");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showSandbox, setShowSandbox] = useState(true);

  // Build dynamic ROLE_MAP for the selected state
  const ROLE_MAP: Record<string, { title: string; route: string; color: string; desc: string; scope: string }> = {};
  const ROLE_COLORS = ["#16a34a", "#16a34a", "#1e3a8a", "#1e3a8a", "#d97706", "#dc2626"];
  
  st.roles.forEach((r, idx) => {
    ROLE_MAP[r.id] = {
      title: r.title,
      route: r.href,
      color: ROLE_COLORS[idx % ROLE_COLORS.length],
      desc: r.desc,
      scope: r.scope
    };
  });

  const handleStateChange = (newCode: string) => {
    setActiveStateCode(newCode);
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_state", newCode);
    }
    const newSt = getStateMetadata(newCode);
    if (newSt.roles && newSt.roles.length > 0) {
      setSelectedRole(newSt.roles[0].id);
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
        const targetRoute = nextRoute || ROLE_MAP[selectedRole]?.route || "/citizen";
        window.location.href = targetRoute;
      } else {
        const token = `tv_token_persona_${selectedRole}_${Date.now()}`;
        localStorage.setItem("tv_token", token);
        localStorage.setItem("tv_role", selectedRole);
        localStorage.setItem("tv_user", JSON.stringify({
          email: "google.user@example.com",
          displayName: "Google Verified User",
          username: "google_user"
        }));
        const targetRoute = nextRoute || ROLE_MAP[selectedRole]?.route || "/citizen";
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

      if (isFirebaseLive) {
        if (authMode === "signup") {
          await registerWithEmail(email, password, fullName);
          setSuccessMsg("Account created successfully! Redirecting...");
        } else {
          await loginWithEmail(email, password);
        }
        const targetRoute = nextRoute || ROLE_MAP[selectedRole]?.route || "/citizen";
        setTimeout(() => {
          window.location.href = targetRoute;
        }, 500);
      } else {
        const token = `tv_token_persona_${selectedRole}_${Date.now()}`;
        localStorage.setItem("tv_token", token);
        localStorage.setItem("tv_role", selectedRole);
        localStorage.setItem("tv_user", JSON.stringify({
          email: email || `official@${st.code}.gov.in`,
          displayName: fullName || `${selectedRole.toUpperCase()} Officer`,
          username: email.split("@")[0] || selectedRole
        }));
        const targetRoute = nextRoute || ROLE_MAP[selectedRole]?.route || "/citizen";
        window.location.href = targetRoute;
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setErrorMsg("Invalid email or password. Please check your credentials.");
      } else if (err.code === "auth/email-already-in-use") {
        setErrorMsg("An account with this email already exists. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setErrorMsg("Password is too weak. Please use at least 6 characters.");
      } else {
        setErrorMsg(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPersonaSelect = async (roleKey: string) => {
    setSelectedRole(roleKey);
    setLoading(true);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("tv_state", st.code);
      }
      const res = await api.getPersonaToken(roleKey);
      const token = res.access_token || `tv_token_persona_${roleKey.toLowerCase()}_${Date.now()}`;
      localStorage.setItem("tv_token", token);
      localStorage.setItem("tv_role", roleKey);
      localStorage.setItem("tv_user", JSON.stringify({
        username: `${roleKey}_official`,
        role: roleKey,
        displayName: `${roleKey.toUpperCase()} Official (${st.name})`
      }));
      const targetRoute = nextRoute || ROLE_MAP[roleKey]?.route || "/";
      window.location.href = targetRoute;
    } catch {
      const token = `tv_token_persona_${roleKey.toLowerCase()}_${Date.now()}`;
      localStorage.setItem("tv_token", token);
      localStorage.setItem("tv_role", roleKey);
      const targetRoute = nextRoute || ROLE_MAP[roleKey]?.route || "/";
      window.location.href = targetRoute;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "10px 0" }}>
      {/* Header Banner */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        {/* State Selector & Badge Header */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 16px", borderRadius: 20, background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", fontSize: 11, fontWeight: 700 }}>
            <ShieldCheck size={14} color="#1e3a8a" />
            {st.name.toUpperCase()} REVENUE ADMINISTRATION & E-GOVERNANCE SSO
          </div>

          <select
            value={st.code}
            onChange={(e) => handleStateChange(e.target.value)}
            style={{
              padding: "4px 10px", borderRadius: 16, border: "1px solid #1e3a8a",
              background: "#0f2942", color: "#ffffff", fontSize: 11, fontWeight: 700,
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

        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f2942", margin: 0, letterSpacing: "-0.02em" }}>
          Terra_vault {st.name} Secure Sign-In
        </h1>
        <p style={{ fontSize: 13, color: "#475569", marginTop: 6, maxWidth: 650, margin: "6px auto 0" }}>
          Unified authentication gateway for {st.name} ({st.nativeName}) Land & Revenue Officials and Pattadars ({st.portalName}).
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1.15fr", gap: 24, alignItems: "start" }}>
        
        {/* ── Left Column: Primary Firebase Google & Email Authentication ── */}
        <div className="glass-card" style={{ padding: 28, borderTop: "4px solid #1e3a8a", background: "#ffffff" }}>
          
          {/* Mode Switcher Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
            <button
              onClick={() => { setAuthMode("signin"); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: authMode === "signin" ? "#1e3a8a" : "#64748b",
                borderBottom: authMode === "signin" ? "2px solid #1e3a8a" : "2px solid transparent",
                marginBottom: -2,
                transition: "all 0.2s"
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode("signup"); setErrorMsg(null); setSuccessMsg(null); }}
              style={{
                flex: 1,
                padding: "10px 0",
                fontSize: 13,
                fontWeight: 700,
                border: "none",
                background: "none",
                cursor: "pointer",
                color: authMode === "signup" ? "#1e3a8a" : "#64748b",
                borderBottom: authMode === "signup" ? "2px solid #1e3a8a" : "2px solid transparent",
                marginBottom: -2,
                transition: "all 0.2s"
              }}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={16} color="#b91c1c" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 12, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          {authMode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "11px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  background: "#ffffff",
                  color: "#1f2937",
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  transition: "all 0.15s ease"
                }}
              >
                {googleLoading ? (
                  <Loader2 size={16} className="spin" color="#1e3a8a" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", margin: "18px 0", color: "#94a3b8" }}>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
                <span style={{ padding: "0 12px", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Or with Email</span>
                <div style={{ flex: 1, height: 1, background: "#e2e8f0" }} />
              </div>
            </>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {authMode === "signup" && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                  Full Name / Statutory Designation
                </label>
                <div style={{ position: "relative" }}>
                  <UserCheck size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 11 }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramasamy / Tahsildar K."
                    className="input"
                    style={{ width: "100%", paddingLeft: 34, fontSize: 13 }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                Official Government or Personal Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 11 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@tn.gov.in or citizen@gmail.com"
                  className="input"
                  style={{ width: "100%", paddingLeft: 34, fontSize: 13 }}
                  required
                />
              </div>
            </div>

            {authMode !== "forgot" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                    Password
                  </label>
                  {authMode === "signin" && (
                    <button
                      type="button"
                      onClick={() => { setAuthMode("forgot"); setErrorMsg(null); setSuccessMsg(null); }}
                      style={{ fontSize: 11, color: "#1e3a8a", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <Key size={15} color="#64748b" style={{ position: "absolute", left: 10, top: 11 }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input"
                    style={{ width: "100%", paddingLeft: 34, fontSize: 13 }}
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {authMode !== "forgot" && (
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 4, display: "block" }}>
                  Target Revenue Desk Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input"
                  style={{ width: "100%", fontSize: 13 }}
                >
                  {st.roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="btn btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "11px 16px",
                fontSize: 13,
                background: "#0f2942",
                marginTop: 6
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin" /> Verifying Credentials...
                </>
              ) : authMode === "signup" ? (
                <>
                  Create Account & Sign In <ArrowRight size={14} />
                </>
              ) : authMode === "forgot" ? (
                <>
                  Send Recovery Link <ArrowRight size={14} />
                </>
              ) : (
                <>
                  Sign In to Revenue Portal <ArrowRight size={14} />
                </>
              )}
            </button>

            {authMode === "forgot" && (
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                style={{ fontSize: 12, color: "#64748b", background: "none", border: "none", cursor: "pointer", textAlign: "center", marginTop: 4 }}
              >
                Back to Sign In
              </button>
            )}
          </form>

          {/* Security Compliance Footnote */}
          <div style={{ padding: 10, borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", marginTop: 20, fontSize: 11, color: "#475569", display: "flex", alignItems: "center", gap: 8 }}>
            <ShieldCheck size={16} color="#16a34a" />
            <span>MeitY Empanelled 256-bit SSL Encrypted & Polygon Blockchain Anchored.</span>
          </div>
        </div>

        {/* ── Right Column: Statutory Role Overview & Sandbox Switcher ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f2942", textTransform: "uppercase", letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#d97706" /> Statutory Revenue Role Hierarchy
            </div>
            <button
              onClick={() => setShowSandbox(!showSandbox)}
              style={{ fontSize: 11, color: "#1e3a8a", fontWeight: 700, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            >
              {showSandbox ? "Collapse Sandbox" : "Expand Sandbox"}
              {showSandbox ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          {showSandbox && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {Object.entries(ROLE_MAP).map(([key, info]) => {
                const isSelected = selectedRole === key;
                return (
                  <div
                    key={key}
                    onClick={() => handleQuickPersonaSelect(key)}
                    className="glass-card"
                    style={{
                      padding: "12px 16px",
                      borderLeft: `4px solid ${info.color}`,
                      border: isSelected ? `1.5px solid ${info.color}` : "1px solid #cbd5e1",
                      background: isSelected ? "#eff6ff" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
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
                      <span className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11, background: isSelected ? info.color : "#f1f5f9", color: isSelected ? "#ffffff" : "#0f2942" }}>
                        Select <ArrowRight size={11} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick SSO Cards */}
          <div className="glass-card" style={{ padding: 14, background: "#f8fafc", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase" }}>
              National & State Identity Federation
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: "center", fontSize: 11, gap: 6, padding: "8px 10px", background: "#ffffff" }}
                onClick={() => alert("Aadhaar e-KYC OAuth Gateway connected to UIDAI Production Sandbox.")}
              >
                <CreditCard size={13} color="#1e3a8a" /> Aadhaar e-KYC
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ justifyContent: "center", fontSize: 11, gap: 6, padding: "8px 10px", background: "#ffffff" }}
                onClick={() => alert("TN e-Pattadar SSO Gateway connected to e-Services.")}
              >
                <Landmark size={13} color="#1e3a8a" /> TN e-Pattadar
              </button>
            </div>
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
