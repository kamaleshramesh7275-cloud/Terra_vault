"use client";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <AuthGuard>
      {isLoginPage ? (
        <main style={{ minHeight: "100vh", background: "var(--color-bg)" }}>{children}</main>
      ) : (
        <>
          <Sidebar />
          <main className="main-content">{children}</main>
        </>
      )}
    </AuthGuard>
  );
}
