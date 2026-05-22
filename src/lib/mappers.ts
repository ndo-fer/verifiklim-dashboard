/**
 * mappers.ts
 * -----------
 * Convert API response shapes → frontend Claim/Batch/AuditEvent types.
 * This keeps App.tsx types stable while backend evolves.
 */

import type { ClaimRecord, BatchRecord, AuditEvent, AppUser, HistoryRecord } from "./api";

// ── Priority normalization ────────────────────────────────────────
export function normalizePriority(raw: string): "High" | "Medium" | "Low" {
  const clean = raw.replace(" Priority", "").trim();
  if (clean === "High") return "High";
  if (clean === "Medium") return "Medium";
  return "Low";
}

// ── Claim mapper ──────────────────────────────────────────────────
export function mapClaim(r: ClaimRecord) {
  return {
    id: r.id,
    facility: r.facility || "—",
    org: r.org || "—",
    patientCategory: r.patientCategory || "—",
    claimType: r.claimType || "—",
    amount: r.amount || 0,
    diagnosisGroup: r.diagnosisGroup || "—",
    riskScore: r.riskScore || 0,
    priority: normalizePriority(r.priority || "Low") as "High" | "Medium" | "Low",
    status: r.status || "New",
    reviewer: r.reviewer || "—",
    batchId: r.batchId || null,
    submittedAt: r.submittedAt || new Date().toISOString(),
    updatedAt: r.updatedAt || new Date().toISOString(),
    topFactors: Array.isArray(r.topFactors) ? r.topFactors : [],
    los: r.los || 0,
    source: r.source || "single",
  };
}

// ── History mapper ────────────────────────────────────────────────
export function mapHistoryRecord(r: HistoryRecord) {
  return {
    id: r.id || String(Math.random()),
    claimId: r.claim_id || "—",
    facility: r.facility || "—",
    riskScore: r.risk_score || 0,
    riskPercent: r.risk_percent || 0,
    priority: normalizePriority(r.priority || "Low"),
    source: r.source || "single",
    createdAt: r.created_at || new Date().toISOString(),
    thresholdUsed: r.threshold_used || 0,
    modelDomain: r.model_domain || "reguler",
    iforestScore: r.iforest_score || 0,
  };
}

// ── Batch mapper ──────────────────────────────────────────────────
export function mapBatch(r: BatchRecord) {
  return {
    id: r.id,
    filename: r.filename || "—",
    uploadedBy: r.uploadedBy || "system",
    uploadedAt: r.uploadedAt || new Date().toISOString(),
    total: r.total || 0,
    high: r.high || 0,
    medium: r.medium || 0,
    low: r.low || 0,
    status: r.status || "Pending",
  };
}

// ── Audit mapper ──────────────────────────────────────────────────
export function mapAuditEvent(e: AuditEvent) {
  return {
    id: e.id,
    actor: e.actor,
    actorRole: e.actor_role,
    action: e.action,
    entity: e.entity,
    entityId: e.entity_id,
    timestamp: e.timestamp,
    detail: e.detail,
    category: e.category as "claim" | "batch" | "user" | "system" | "review",
  };
}

// ── User mapper ───────────────────────────────────────────────────
export function mapUser(u: AppUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as "verifier" | "auditor" | "admin",
    org: u.org || "—",
    status: u.status as "Active" | "Inactive" | "Pending",
    lastActive: u.lastActive || "—",
  };
}

// ── CSV parser for batch upload ────────────────────────────────────
export function parseCsvBatch(text: string): Record<string, unknown>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/"/g, ""));
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const val = values[i] ?? "";
      // Try numeric parse
      const num = Number(val);
      row[h] = val === "" ? "" : isNaN(num) ? val : num;
    });
    return row;
  });
}
