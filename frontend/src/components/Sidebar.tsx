"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Upload, FileText, ClipboardCheck,
  Map, BarChart3, Users, Shield, Leaf, Sparkles, Lock
} from "lucide-react";

const NAV = [
  { href: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/features",  icon: Sparkles,        label: "AI Features" },
  { href: "/upload",    icon: Upload,          label: "Upload" },
  { href: "/records",   icon: FileText,        label: "Records" },
  { href: "/review",    icon: ClipboardCheck,  label: "Review Queue" },
  { href: "/map",       icon: Map,             label: "GIS Map" },
  { href: "/analytics", icon: BarChart3,       label: "Analytics" },
  { href: "/blockchain",icon: Lock,            label: "ZK Blockchain" },
  { href: "/citizen",   icon: Users,           label: "Citizen Portal" },
  { href: "/admin",     icon: Shield,          label: "Admin" },
];

import { useAuth } from "@/components/AuthGuard";
import { LogOut, User as UserIcon } from "lucide-react";

export function Sidebar() {
  const path = usePathname();
  const { username, role, logout } = useAuth();

  const filteredNav = NAV.filter((item) => item.href !== "/admin" || role === "admin");

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#10b981,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Leaf size={18} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15 }}>
              Terra_vault
            </div>
            <div style={{ fontSize: 10, color: "var(--color-text-muted)", letterSpacing: "0.06em" }}>
              AI LAND RECORDS
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {filteredNav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-nav-item${path === href ? " active" : ""}`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </div>

      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%", background: "var(--color-surface)",
              display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--color-border)"
            }}>
              <UserIcon size={14} color="var(--color-text-muted)" />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text)", lineHeight: 1.2 }}>
                {username}
              </div>
              <div style={{ fontSize: 10, color: role === "admin" ? "#10b981" : "var(--color-text-muted)", textTransform: "capitalize" }}>
                {role}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              color: "var(--color-text-muted)", padding: 4, borderRadius: 6, display: "flex", alignItems: "center"
            }}
          >
            <LogOut size={15} />
          </button>
        </div>

        <div style={{ fontSize: 10, color: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span>●</span> Polygon Amoy</span>
          <select
            style={{ background: "rgba(0,0,0,0.3)", color: "#a5b4fc", fontSize: 10, borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)", padding: "1px 4px" }}
            value={role}
            onChange={(e) => {
              const newRole = e.target.value;
              localStorage.setItem("tv_role", newRole);
              // Request JWT token for persona
              fetch(`/api/auth/persona-token?role=${encodeURIComponent(newRole)}`, { method: "POST" })
                .then(r => r.json())
                .then(d => {
                  if (d.access_token) {
                    localStorage.setItem("tv_token", d.access_token);
                  }
                })
                .catch(() => {})
                .finally(() => window.location.reload());
            }}
          >
            <option value="citizen">👤 Citizen (பொதுமக்கள்)</option>
            <option value="vao">🌾 VAO (கிராம நிர்வாக அலுவலர்)</option>
            <option value="ri">🔍 RI (வருவாய் ஆய்வாளர்)</option>
            <option value="tahsildar">📜 Tahsildar (தாசில்தார்)</option>
            <option value="rdo">🏢 RDO (வருவாய் கோட்டாட்சியர்)</option>
            <option value="admin">🏛️ District Collector (மாவட்ட ஆட்சியர்)</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
