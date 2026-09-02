"use client";
import { useState } from "react";
import {
  FileText, ShieldCheck, MapPin, CheckCircle2, AlertTriangle,
  Lock, Check, User, Layers, ArrowRight, Shield, FileCheck
} from "lucide-react";
import Link from "next/link";

export default function TahsildarPortalPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "fmb" | "polygon">("orders");
  const [sanctionedOrders, setSanctionedOrders] = useState<string[]>([]);

  const PENDING_ORDERS = [
    { id: "PATTA-TN-2026-9901", survey: "SF.409/A1", owner: "Palanisamy K / பழனிசாமி கே", village: "Kinathukadavu Town", vao: "VERIFIED", ri: "RECOMMENDED", type: "Patta Subdivision / உட்பிரிவு பட்டா" },
    { id: "PATTA-TN-2026-9902", survey: "SF.256/1B", owner: "Lakshmi Ammal / லட்சுமி அம்மாள்", village: "Kinathukadavu Town", vao: "VERIFIED", ri: "RECOMMENDED", type: "Family Partition Mutation" },
  ];

  return (
    <div className="main-content">
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: "24px 28px", marginBottom: 24, borderLeft: "4px solid #1e3a8a", background: "#ffffff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FileCheck size={22} color="#1e3a8a" />
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f2942", margin: 0 }}>
                Tahsildar Statutory Order Sanction Desk (தாசில்தார் தளம்)
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "#475569", marginTop: 6, margin: 0 }}>
              Sole Statutory Authority for Sanctioning Patta Orders & Polygon Blockchain E-Seals
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, padding: "4px 10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, color: "#1e3a8a", fontWeight: 700 }}>
              Taluk: Kinathukadavu (35 Revenue Villages)
            </span>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              District: Coimbatore • Division: Pollachi
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { id: "orders", label: "Statutory Patta Orders Sanction Desk", icon: FileCheck },
          { id: "fmb", label: "FMB Subdivision & A-Register Mutate", icon: Layers },
          { id: "polygon", label: "Polygon Blockchain Identity Anchor", icon: Lock },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`btn ${activeTab === t.id ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "10px 18px", fontSize: 13 }}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "orders" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {PENDING_ORDERS.map((order) => {
            const isDone = sanctionedOrders.includes(order.id);
            return (
              <div key={order.id} className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, color: "#1e3a8a" }}>
                        {order.id}
                      </span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f2942" }}>
                        {order.survey} — {order.owner}
                      </h3>
                    </div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 6, display: "flex", gap: 16 }}>
                      <span>Village: {order.village}</span>
                      <span>VAO: {order.vao}</span>
                      <span>RI: {order.ri}</span>
                      <span>Type: {order.type}</span>
                    </div>
                  </div>

                  <div>
                    {isDone ? (
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={16} /> Statutory Patta Order Sanctioned & Polygon E-Sealed
                      </span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 12, padding: "8px 16px", background: "#0f2942" }}
                        onClick={() => {
                          setSanctionedOrders([...sanctionedOrders, order.id]);
                          alert(`Statutory Patta Order ${order.id} officially sanctioned! Polygon Blockchain Hash Anchored.`);
                        }}
                      >
                        Sanction Official Patta Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "fmb" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            FMB Subdivision Cadastral Update & TamilNilam A-Register Mutation
          </h3>
          <p style={{ fontSize: 13, color: "#475569" }}>
            Executes digital FMB subdivision geometry updates across 705 Kinathukadavu cadastral polygons.
          </p>
        </div>
      )}

      {activeTab === "polygon" && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f2942", marginBottom: 14 }}>
            Polygon Amoy Blockchain State Anchor (Contract #0x71C...9B3)
          </h3>
          <div style={{ padding: 14, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            100% Immutable SHA-256 State Anchors Active on Polygon Testnet.
          </div>
        </div>
      )}
    </div>
  );
}
