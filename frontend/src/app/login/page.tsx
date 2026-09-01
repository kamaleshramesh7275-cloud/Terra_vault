"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Leaf, Lock, User, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.access_token) {
        localStorage.setItem("tv_token", res.access_token);
        localStorage.setItem(
          "tv_user",
          JSON.stringify({
            username: username || "admin",
            role: res.role || "admin",
          })
        );
        router.push("/");
      } else {
        setError(res.detail || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string = "admin") => {
    localStorage.setItem("tv_token", `demo_${role}_token`);
    localStorage.setItem(
      "tv_user",
      JSON.stringify({
        username: `demo_${role}`,
        role: role,
      })
    );
    router.push("/");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        padding: 20,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: 440,
          padding: 36,
          borderRadius: 16,
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "linear-gradient(135deg,#10b981,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
              boxShadow: "0 8px 16px rgba(16,185,129,0.3)",
            }}
          >
            <Leaf size={28} color="white" />
          </div>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Terra_vault
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            AI-Powered Indian Land Record Digitization Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#f87171",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Username
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                className="input"
                style={{ paddingLeft: 38 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                required
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--color-text-muted)",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 12,
                  color: "var(--color-text-muted)",
                }}
              />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: 38 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "11px 0",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            {loading ? "Authenticating..." : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid var(--color-border)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              marginBottom: 12,
              fontWeight: 500,
            }}
          >
            Quick Demo Quick Start
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => handleDemoLogin("admin")}
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              <ShieldCheck size={14} /> Admin Mode
            </button>
            <button
              onClick={() => handleDemoLogin("reviewer")}
              className="btn-secondary"
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              Reviewer Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
