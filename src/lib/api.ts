/**
 * api.ts
 * -------
 * Centralized API client for dashboard-figma.
 * All calls go through the FastAPI backend (dashboard-v2/api).
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API error");
  }
  return res.json();
}

// ── Health ─────────────────────────────────────────────────────────
export interface HealthResponse {
  status: string;
  model: string;
  domain: string;
  n_features: number;
  winner_threshold: number;
  model_version: string;
  threshold_reference: string;
}
export const getHealth = () => request<HealthResponse>("GET", "/health");

// ── Claims ─────────────────────────────────────────────────────────
export interface ClaimRecord {
  id: string;
  facility: string;
  org: string;
  patientCategory: string;
  claimType: string;
  amount: number;
  diagnosisGroup: string;
  riskScore: number;
  riskPercent: number;
  priority: "High" | "Medium" | "Low";
  status: string;
  reviewer: string;
  batchId: string | null;
  submittedAt: string;
  updatedAt: string;
  topFactors: string[];
  los: number;
  source: "single" | "batch";
}

export interface ClaimsResponse {
  total: number;
  records: ClaimRecord[];
}

export const getClaims = (limit = 200) =>
  request<ClaimsResponse>("GET", `/claims?limit=${limit}`);

export const getClaim = (id: string) =>
  request<ClaimRecord>("GET", `/claims/${id}`);

export const updateClaimStatus = (id: string, status: string, note?: string) =>
  request<ClaimRecord>("PATCH", `/claims/${id}/status`, { status, note });

// ── Single Claim Scoring ───────────────────────────────────────────
export interface SingleScoreInput {
  claim_id?: string;
  facility?: string;
  claim_type?: string;
  patient_category?: string;
  diagnosis_group?: string;
  amount?: number;
  los?: number;
  batch_id?: string;
  // core BPJS features (optional — defaults applied server-side)
  usia?: number;
  tarif_disetujui?: number;
  lama_rawat_hari?: number;
  severity_level_num?: number;
  jumlah_diagnosis_sekunder?: number;
  flag_rawat_inap?: number;
  flag_kelas_upgrade?: number;
  flag_status_nonaktif?: number;
  flag_meninggal?: number;
  flag_special_cmg?: number;
  total_special_cmg?: number;
  fktp_hist_count_before?: number;
  nonkap_hist_count_before?: number;
  grup_diagnosis_utama?: string;
  kode_diagnosis_utama?: string;
}

export interface TopFactor {
  feature: string;
  feature_value: number | string;
  contribution: number;
  abs_contribution: number;
  direction: "up" | "down" | "neutral";
}

export interface ScoreResult {
  risk_score: number;
  risk_percent: number;
  priority: string;
  threshold_used: number | null;
  model_version: string | null;
  threshold_reference: string | null;
  top_factors: TopFactor[];
  explanation_metadata: Record<string, unknown> | null;
  raw_response: Record<string, unknown> | null;
  input: Record<string, unknown>;
}

export const scoreSingleClaim = (input: SingleScoreInput) =>
  request<ScoreResult>("POST", "/predict", input);

// ── Batch ──────────────────────────────────────────────────────────
export interface BatchRecord {
  id: string;
  filename: string;
  uploadedBy: string;
  uploadedAt: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  status: "Processed" | "Processing" | "Failed" | "Pending";
}
export interface BatchesResponse {
  total: number;
  records: BatchRecord[];
}
export const getBatches = (limit = 50) =>
  request<BatchesResponse>("GET", `/batches?limit=${limit}`);

export interface BatchScoreInput {
  filename: string;
  uploaded_by: string;
  claims: Array<Record<string, unknown>>;
}
export interface BatchScoreResponse {
  batch_id: string;
  total: number;
  high: number;
  medium: number;
  low: number;
  results: ScoreResult[];
}
export const scoreBatch = (input: BatchScoreInput) =>
  request<BatchScoreResponse>("POST", "/batch-score", input);

// ── History ────────────────────────────────────────────────────────
export interface HistoryRecord {
  id: string;
  claim_id: string;
  facility: string;
  risk_score: number;
  risk_percent: number;
  priority: string;
  source: string;
  created_at: string;
  threshold_used: number;
  model_domain: string;
  iforest_score: number;
}
export interface HistoryResponse {
  total: number;
  records: HistoryRecord[];
}
export const getHistory = (limit = 200) =>
  request<HistoryResponse>("GET", `/history?limit=${limit}`);

// ── Audit Log ──────────────────────────────────────────────────────
export interface AuditEvent {
  id: string;
  actor: string;
  actor_role: string;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
  detail: string;
  category: "claim" | "batch" | "user" | "system" | "review";
}
export interface AuditResponse {
  total: number;
  events: AuditEvent[];
}
export const getAuditLog = (limit = 200) =>
  request<AuditResponse>("GET", `/audit?limit=${limit}`);

export const createAuditEvent = (event: Omit<AuditEvent, "id">) =>
  request<AuditEvent>("POST", "/audit", event);

// ── Users ──────────────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "verifier" | "auditor" | "admin";
  org: string;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
}
export interface UsersResponse {
  total: number;
  records: AppUser[];
}
export const getUsers = () => request<UsersResponse>("GET", "/users");

// ── Model Artifacts ────────────────────────────────────────────────
export const getModelInfo = () => request<HealthResponse>("GET", "/health");
