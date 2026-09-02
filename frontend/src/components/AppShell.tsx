"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { GovHeader } from "@/components/GovHeader";
import { AuthGuard } from "@/components/AuthGuard";
import { LanguageProvider } from "@/context/LanguageContext";
import { FontProvider } from "@/context/FontContext";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/" || pathname.startsWith("/state") || pathname === "/citizen" || pathname === "/login" || pathname === "/business";

  return (
    <FontProvider>
      <LanguageProvider>
        <AuthGuard>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg)" }}>
            <GovHeader />
            {isLandingPage ? (
              <main style={{ flex: 1, padding: "24px 32px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>{children}</main>
            ) : (
              <div style={{ display: "flex", flex: 1 }}>
                <Sidebar />
                <main className="main-content" style={{ flex: 1, padding: "24px 32px" }}>{children}</main>
              </div>
            )}
          </div>
        </AuthGuard>
      </LanguageProvider>
    </FontProvider>
  );
}

