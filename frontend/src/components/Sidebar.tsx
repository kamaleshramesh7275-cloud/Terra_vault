"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Upload, FileText, ClipboardCheck,
  Map, BarChart3, Users, Shield, Leaf,
} from "lucide-react";

const NAV = [
  { href: "/",          icon: LayoutDashboard, label: "Dashboard" },
  { href: "/upload",    icon: Upload,          label: "Upload" },
  { href: "/records",   icon: FileText,        label: "Records" },
  { href: "/review",    icon: ClipboardCheck,  label: "Review Queue" },
  { href: "/map",       icon: Map,             label: "GIS Map" },
  { href: "/analytics", icon: BarChart3,       label: "Analytics" },
  { href: "/citizen",   icon: Users,           label: "Citizen Portal" },
  { href: "/admin",     icon: Shield,          label: "Admin" },
];

export function Sidebar() {
  const path = usePathname();
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
        {NAV.map(({ href, icon: Icon, label }) => (
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

      <div style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border)" }}>
        <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
          Polygon Amoy Testnet
        </div>
        <div style={{ fontSize: 11, color: "var(--color-primary)", marginTop: 2 }}>
          ● Network Active
        </div>
      </div>
    </nav>
  );
}
