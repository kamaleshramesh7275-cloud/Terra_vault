"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map, FileText, CheckSquare, BarChart2, Shield, Upload,
  Landmark, User as UserIcon, LogOut, Cpu, Database, Eye, Layers,
  User, Sprout, Search, FileCheck, Scale, Building2
} from "lucide-react";
import { useAuth } from "@/components/AuthGuard";

const NAV = [
  { href: "/map", icon: Map, label: "Cadastral GIS Map" },
  { href: "/records", icon: FileText, label: "Land Records RoR" },
  { href: "/business", icon: Building2, label: "G2B Commercial & Banks" },
  { href: "/portal/vao", icon: Sprout, label: "VAO Ground Desk" },
  { href: "/portal/ri", icon: Search, label: "RI Firka Scrutiny" },
  { href: "/portal/tahsildar", icon: FileCheck, label: "Tahsildar Portal" },
  { href: "/portal/rdo", icon: Scale, label: "RDO Tribunal Desk" },
  { href: "/portal/collector", icon: Building2, label: "Collector Command" },
  { href: "/review", icon: CheckSquare, label: "Human-in-Loop Verification" },
  { href: "/analytics", icon: BarChart2, label: "Revenue Analytics" },
  { href: "/blockchain", icon: Shield, label: "Polygon Audit Trail" },
  { href: "/map/digital-twin", icon: Eye, label: "3D Digital Twin" },
  { href: "/upload", icon: Upload, label: "Record Ingestion" },
  { href: "/admin", icon: Landmark, label: "System Admin" },
];


export function Sidebar() {
  const path = usePathname();
  const { role, username, logout } = useAuth();

  const filteredNav = NAV.filter((item) => item.href !== "/admin" || role === "admin" || role === "collector");

  const ROLE_REDIRECT_MAP: Record<string, string> = {
    citizen: "/citizen",
    vao: "/portal/vao",
    ri: "/portal/ri",
    tahsildar: "/portal/tahsildar",
    rdo: "/portal/rdo",
    admin: "/portal/collector",
    collector: "/portal/collector",
  };

  return (
    <nav className="sidebar" style={{ width: 240, background: "#ffffff", borderRight: "1px solid #cbd5e1", color: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* Sidebar Header Logo */}
      <div className="sidebar-logo" style={{ padding: "14px 18px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "#0f2942", border: "1px solid #1e293b",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#ffffff"
          }}>
            <Landmark size={17} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#0f2942", letterSpacing: "-0.01em" }}>
              Revenue Portal
            </div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: "0.04em", fontWeight: 700 }}>
              STATE NAVIGATION DESK
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 8px" }}>
        {filteredNav.map(({ href, icon: Icon, label }) => {
          const isActive = path === href;
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: isActive ? 700 : 600,
                color: isActive ? "#ffffff" : "#334155",
                background: isActive ? "#0f2942" : "transparent",
                borderLeft: isActive ? "3px solid #d97706" : "3px solid transparent",
                marginBottom: 3,
                textDecoration: "none",
                transition: "all 0.15s"
              }}
            >
              <Icon size={15} color={isActive ? "#ffffff" : "#475569"} />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer User Box */}
      <div style={{ padding: "12px 14px 28px 14px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%", background: "#0f2942",
              display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b"
            }}>
              <UserIcon size={13} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0f2942", lineHeight: 1.2 }}>
                {username}
              </div>
              <div style={{ fontSize: 10, color: "#1e3a8a", textTransform: "capitalize", fontWeight: 700 }}>
                {role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#475569", padding: 4, borderRadius: 6, display: "flex", alignItems: "center"
            }}
          >
            <LogOut size={14} />
          </button>
        </div>

        <div style={{ fontSize: 10, color: "#475569", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid #cbd5e1" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16a34a", fontWeight: 700 }}><span>●</span> Polygon Seal</span>
          <select
            style={{ background: "#ffffff", color: "#0f2942", fontSize: 10, borderRadius: 4, border: "1px solid #cbd5e1", padding: "2px 4px", fontWeight: 600 }}
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              localStorage.setItem("tv_role", newRole);
              const targetUrl = ROLE_REDIRECT_MAP[newRole] || "/";
              fetch(`/api/auth/persona-token?role=${encodeURIComponent(newRole)}`, { method: "POST" })
                .then(r => r.json())
                .then(d => {
                  if (d.access_token) {
                    localStorage.setItem("tv_token", d.access_token);
                  }
                })
                .catch(() => {})
                .finally(() => {
                  window.location.href = targetUrl;
                });
            }}
          >
            <option value="citizen">Citizen Portal</option>
            <option value="vao">VAO Ground Desk</option>
            <option value="ri">RI Firka Desk</option>
            <option value="tahsildar">Tahsildar Portal</option>
            <option value="rdo">RDO Tribunal</option>
            <option value="admin">District Collector</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
