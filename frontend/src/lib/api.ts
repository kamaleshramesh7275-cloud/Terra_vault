// Terra_vault — API client utility
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("tv_token") : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

export const api = {
  // ── Records ──────────────────────────────────────────────────────────────
  listRecords: (params: Record<string, string | number>) =>
    apiFetch<any>(`/api/records?${new URLSearchParams(params as any)}`),

  getRecord: (id: string) => apiFetch<any>(`/api/records/${id}`),

  verifyBlockchain: (id: string) => apiFetch<any>(`/api/records/${id}/verify`),

  // ── Ingest ────────────────────────────────────────────────────────────────
  uploadDocument: (file: File, state?: string, district?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (state) form.append("state", state);
    if (district) form.append("district", district);
    const token = typeof window !== "undefined" ? localStorage.getItem("tv_token") : null;
    return fetch(`${API_BASE}/api/ingest/upload`, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json());
  },

  qualityCheck: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return fetch(`${API_BASE}/api/ingest/quality-check`, { method: "POST", body: form }).then((r) => r.json());
  },

  // ── Review ────────────────────────────────────────────────────────────────
  getReviewQueue: (limit = 20) => apiFetch<any>(`/api/review/queue?limit=${limit}`),
  getReviewTask: (id: string) => apiFetch<any>(`/api/review/queue/${id}`),
  submitCorrection: (taskId: string, corrections: any, reviewerId: string) =>
    apiFetch<any>(`/api/review/queue/${taskId}/correct?reviewer_id=${reviewerId}`, {
      method: "POST",
      body: JSON.stringify(corrections),
    }),
  getReviewStats: () => apiFetch<any>("/api/review/stats"),

  // ── Maturity ──────────────────────────────────────────────────────────────
  getMaturityScores: (geoLevel = "village") =>
    apiFetch<any>(`/api/maturity?geo_level=${geoLevel}&limit=200&order=asc`),
  getMaturitySummary: () => apiFetch<any>("/api/maturity/summary"),

  // ── Blockchain ────────────────────────────────────────────────────────────
  anchorRecord: (id: string, verifierId: string) =>
    apiFetch<any>(`/api/blockchain/${id}/anchor?verifier_id=${verifierId}`, { method: "POST" }),

  // ── GIS ───────────────────────────────────────────────────────────────────
  getMaturityGeoJSON: () => apiFetch<any>("/api/gis/maturity-geojson"),
  getPlotsGeoJSON: (options?: { district?: string; taluk?: string; land_type?: string; q?: string; state?: string }) => {
    const params = new URLSearchParams();
    const state = options?.state || "Tamil Nadu";
    if (state) params.append("state", state);
    if (options?.district && options.district !== "All") params.append("district", options.district);
    if (options?.taluk && options.taluk !== "All") params.append("taluk", options.taluk);
    if (options?.land_type && options.land_type !== "All") params.append("land_type", options.land_type);
    if (options?.q) params.append("q", options.q);
    return apiFetch<any>(`/api/gis/plots?${params.toString()}`);
  },
  getPlotDetails: (surveyOrId: string) =>
    apiFetch<any>(`/api/gis/plot-details?survey_no=${encodeURIComponent(surveyOrId)}`),

  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (username: string, password: string) => {
    const form = new URLSearchParams({ username, password });
    return fetch(`${API_BASE}/api/auth/token`, {
      method: "POST",
      body: form,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }).then((r) => r.json());
  },
};
