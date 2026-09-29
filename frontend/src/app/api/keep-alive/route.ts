import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "alive",
    service: "terra_vault",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
}
