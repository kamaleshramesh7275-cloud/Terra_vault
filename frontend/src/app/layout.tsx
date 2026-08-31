import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Terra_vault — AI Land Record Digitization",
  description:
    "End-to-end AI platform for digitizing legacy Indian land records with multilingual OCR, blockchain-anchored audit trails, and GIS integration.",
  keywords: "land records, digitization, OCR, India, blockchain, Bhu-Naksha, DILRMP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
