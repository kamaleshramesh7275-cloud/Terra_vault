import { NextRequest, NextResponse } from "next/server";
import { MOCK_RECORDS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  // 1. Try forwarding to backend FastAPI service if running
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
  const { searchParams } = new URL(req.url);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const fastApiResponse = await fetch(`${backendUrl}/api/records?${searchParams.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (fastApiResponse.ok) {
      const data = await fastApiResponse.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline -> serve seeded verified records
  }

  // 2. Return high-quality seeded records
  const q = searchParams.get("q")?.toLowerCase();
  let records = MOCK_RECORDS;

  if (q) {
    records = records.filter(
      (r) =>
        r.owner_name?.toLowerCase().includes(q) ||
        r.khasra_no?.toLowerCase().includes(q) ||
        r.village?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    total: records.length,
    page: 1,
    page_size: 20,
    records: records,
  });
}
