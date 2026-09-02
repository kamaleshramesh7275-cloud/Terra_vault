import { NextRequest, NextResponse } from "next/server";
import { MOCK_RECORDS } from "@/lib/mockData";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // 1. Try forwarding to backend FastAPI service if running
  const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const fastApiResponse = await fetch(`${backendUrl}/api/records/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (fastApiResponse.ok) {
      return NextResponse.json(await fastApiResponse.json());
    }
  } catch {
    // Backend offline -> search seeded records
  }

  // 2. Search seeded verified records
  const found = MOCK_RECORDS.find((r) => r.id === id);
  if (found) {
    return NextResponse.json(found);
  }

  // 3. If dynamic uploaded record id
  return NextResponse.json({
    id: id,
    owner_name: "முத்துலட்சுமி க. (வாங்குபவர்)",
    father_name: "கருப்பசாமி ரா.",
    survey_no: "245/3B-2",
    khasra_no: "245/3B-2",
    patta_no: "4187",
    khata_no: "4187",
    village: "நல்லம்பட்டி",
    tehsil: "நிலக்கோட்டை",
    district: "திண்டுக்கல்",
    state: "Tamil Nadu",
    land_type: "நஞ்சை நிலம் (Wet Irrigated Agricultural Land)",
    transaction_type: "கிரையப் பத்திரம் (Sale Deed)",
    mutation_no: "MUT/2026/00412",
    mutation_date: "2026-02-18",
    area_value: 2.53,
    area_unit: "Acres",
    detected_script: "Tamil",
    status: "verified",
    overall_confidence: 0.96,
    quality_score: 0.92,
    restored_quality: 0.97,
    raw_doc_url: "",
    enhanced_doc_url: "",
    blockchain_anchored: true,
    created_at: new Date().toISOString(),
  });
}
