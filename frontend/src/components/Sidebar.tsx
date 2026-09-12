"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map, FileText, CheckSquare, BarChart2, Shield, Upload,
  Landmark, User as UserIcon, LogOut, Cpu, Database, Eye, Layers,
  User, Sprout, Search, FileCheck, Scale, Building2
} from "lucide-react";
import { useAuth } from "@/components/AuthGuard";
import { useLanguage } from "@/context/LanguageContext";

const NAV = [
  { href: "/citizen", icon: User, label: "Citizen / Pattadar Desk" },
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

const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  citizen: [
    "/citizen",
    "/map",
    "/records",
    "/blockchain",
  ],
  vao: [
    "/portal/vao",
    "/map",
    "/records",
    "/map/digital-twin",
    "/upload",
    "/blockchain",
  ],
  ri: [
    "/portal/ri",
    "/portal/vao",
    "/map",
    "/records",
    "/review",
    "/map/digital-twin",
    "/upload",
    "/blockchain",
  ],
  tahsildar: [
    "/portal/tahsildar",
    "/portal/ri",
    "/portal/vao",
    "/map",
    "/records",
    "/review",
    "/analytics",
    "/blockchain",
    "/map/digital-twin",
    "/upload",
  ],
  rdo: [
    "/portal/rdo",
    "/portal/tahsildar",
    "/map",
    "/records",
    "/review",
    "/analytics",
    "/blockchain",
    "/map/digital-twin",
  ],
  collector: [
    "/portal/collector",
    "/portal/rdo",
    "/portal/tahsildar",
    "/portal/ri",
    "/portal/vao",
    "/map",
    "/records",
    "/review",
    "/analytics",
    "/blockchain",
    "/map/digital-twin",
    "/upload",
    "/admin",
  ],
  business: [
    "/business",
    "/map",
    "/records",
    "/blockchain",
  ],
  admin: [
    "/portal/collector",
    "/portal/rdo",
    "/portal/tahsildar",
    "/portal/ri",
    "/portal/vao",
    "/map",
    "/records",
    "/review",
    "/analytics",
    "/blockchain",
    "/map/digital-twin",
    "/upload",
    "/admin",
    "/business",
    "/citizen",
  ],
};

export function Sidebar() {
  const path = usePathname();
  const { role, username, logout } = useAuth();
  const { t } = useLanguage();

  const userRole = role?.toLowerCase() || "citizen";
  const allowed = ROLE_ALLOWED_ROUTES[userRole] || ROLE_ALLOWED_ROUTES.citizen;
  const filteredNav = NAV.filter((item) => allowed.includes(item.href));

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
      {/* Sidebar Header Logo: Terra_vault Clean Branding (No Emblem) */}
      <div className="sidebar-logo" style={{ padding: "16px 18px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#14b8a6", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: "#134e4a", letterSpacing: "-0.02em", fontFamily: "var(--font-head)" }}>
              Terra_vault
            </div>
            <div style={{ fontSize: 9.5, color: "#64748b", letterSpacing: "0.04em", fontWeight: 700 }}>
              REVENUE & GIS WORKSPACE
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
                background: isActive ? "#134e4a" : "transparent",
                borderLeft: isActive ? "3px solid #14b8a6" : "3px solid transparent",
                marginBottom: 3,
                textDecoration: "none",
                transition: "all 0.15s"
              }}
            >
              <Icon size={15} color={isActive ? "#2dd4bf" : "#64748b"} />
              {t(label)}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer User Box */}
      <div style={{ padding: "12px 14px 28px 14px", borderTop: "1px solid #e2e8f0", background: "#f8fafc", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "#0f2942",
              display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #1e293b",
              flexShrink: 0
            }}>
              <UserIcon size={14} color="#ffffff" />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#0f2942", lineHeight: 1.2, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {username}
              </div>
              <div style={{ fontSize: 10, color: "#1e3a8a", textTransform: "uppercase", fontWeight: 700 }}>
                {role}
              </div>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Log Out"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "#dc2626", padding: 4, borderRadius: 6, display: "flex", alignItems: "center"
            }}
          >
            <LogOut size={14} />
          </button>
        </div>

        <div style={{ fontSize: 10, color: "#475569", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid #cbd5e1" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16a34a", fontWeight: 700 }}><span>●</span> SSO Verified</span>
          <select
            style={{ background: "#ffffff", color: "#0f2942", fontSize: 10, borderRadius: 4, border: "1px solid #cbd5e1", padding: "2px 4px", fontWeight: 600 }}
            value={userRole}
            onChange={(e) => {
              const newRole = e.target.value.toLowerCase();
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
            <option value="collector">District Collector</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
