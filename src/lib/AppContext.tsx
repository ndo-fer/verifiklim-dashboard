/**
 * AppContext.tsx
 * --------------
 * Global state management for VerifiKlaim.
 * Wraps API calls and provides data to all pages via context.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "./api";
import { mapClaim, mapBatch, mapAuditEvent, mapUser, mapHistoryRecord, normalizePriority, parseCsvBatch } from "./mappers";

// ── Types (mirrored from App.tsx for compatibility) ───────────────
export type Priority = "High" | "Medium" | "Low";
export type ReviewStatus = "New" | "Needs Review" | "In Review" | "Escalated" | "Resolved" | "Dismissed";
export type Role = "verifier" | "auditor" | "admin";

export interface Claim {
  id: string; facility: string; org: string; patientCategory: string;
  claimType: string; amount: number; diagnosisGroup: string;
  riskScore: number; priority: Priority; status: ReviewStatus;
  reviewer: string; batchId: string | null; submittedAt: string;
  updatedAt: string; topFactors: string[]; los: number;
}
export interface AuditEvent {
  id: string; actor: string; actorRole: string; action: string;
  entity: string; entityId: string; timestamp: string; detail: string;
  category: "claim" | "batch" | "user" | "system" | "review";
}
export interface BatchRecord {
  id: string; filename: string; uploadedBy: string; uploadedAt: string;
  total: number; high: number; medium: number; low: number;
  status: "Processed" | "Processing" | "Failed" | "Pending";
}
export interface AppUser {
  id: string; name: string; email: string; role: Role;
  org: string; status: "Active" | "Inactive" | "Pending"; lastActive: string;
}
export interface ScoringResult {
  riskScore: number; riskPercent: number; priority: Priority;
  modelVersion: string | null; thresholdReference: string | null;
  topFactors: api.TopFactor[];
}

// ── Context definition ────────────────────────────────────────────
interface AppContextValue {
  // Data
  claims: Claim[];
  batches: BatchRecord[];
  auditEvents: AuditEvent[];
  users: AppUser[];
  history: ReturnType<typeof mapHistoryRecord>[];
  modelVersion: string;
  threshold: number;

  // Loading states
  claimsLoading: boolean;
  batchesLoading: boolean;
  auditLoading: boolean;
  usersLoading: boolean;
  historyLoading: boolean;
  apiOnline: boolean;

  // Mutations
  scoreSingle: (input: api.SingleScoreInput) => Promise<ScoringResult>;
  scoringLoading: boolean;
  scoreBatchFile: (file: File, uploadedBy: string) => Promise<api.BatchScoreResponse>;
  batchScoringLoading: boolean;
  updateStatus: (id: string, status: string, reviewer?: string, note?: string) => Promise<void>;
  refetchClaims: () => void;
  refetchHistory: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// ── Helper: normalize API claim → local Claim ─────────────────────
function toClaim(r: api.ClaimRecord): Claim {
  const mapped = mapClaim(r);
  return {
    ...mapped,
    priority: normalizePriority(mapped.priority) as Priority,
    status: (mapped.status || "New") as ReviewStatus,
    topFactors: Array.isArray(mapped.topFactors) ? mapped.topFactors.map(String) : [],
  };
}

// ── Provider ──────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [history, setHistory] = useState<ReturnType<typeof mapHistoryRecord>[]>([]);
  const [modelVersion, setModelVersion] = useState("—");
  const [threshold, setThreshold] = useState(0.70);
  const [apiOnline, setApiOnline] = useState(false);

  const [claimsLoading, setClaimsLoading] = useState(true);
  const [batchesLoading, setBatchesLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [batchScoringLoading, setBatchScoringLoading] = useState(false);

  const fetchClaims = useCallback(async () => {
    setClaimsLoading(true);
    try {
      const res = await api.getClaims(500);
      setClaims(res.records.map(toClaim));
    } catch (e) { console.warn("[claims]", e); }
    finally { setClaimsLoading(false); }
  }, []);

  const fetchBatches = useCallback(async () => {
    setBatchesLoading(true);
    try {
      const res = await api.getBatches(50);
      setBatches(res.records.map(r => mapBatch(r) as BatchRecord));
    } catch (e) { console.warn("[batches]", e); }
    finally { setBatchesLoading(false); }
  }, []);

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await api.getAuditLog(200);
      setAuditEvents(res.events.map(e => mapAuditEvent(e) as AuditEvent));
    } catch (e) { console.warn("[audit]", e); }
    finally { setAuditLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.records.map(u => mapUser(u) as AppUser));
    } catch (e) { console.warn("[users]", e); }
    finally { setUsersLoading(false); }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await api.getHistory(500);
      setHistory(res.records.map(mapHistoryRecord));
    } catch (e) { console.warn("[history]", e); }
    finally { setHistoryLoading(false); }
  }, []);

  // Health check + initial data load
  useEffect(() => {
    api.getHealth()
      .then(h => {
        setApiOnline(true);
        setModelVersion(h.model_version || "—");
        setThreshold(h.winner_threshold || 0.70);
      })
      .catch(() => setApiOnline(false));

    fetchClaims();
    fetchBatches();
    fetchAudit();
    fetchUsers();
    fetchHistory();
  }, [fetchClaims, fetchBatches, fetchAudit, fetchUsers, fetchHistory]);

  const scoreSingle = useCallback(async (input: api.SingleScoreInput): Promise<ScoringResult> => {
    setScoringLoading(true);
    try {
      const res = await api.scoreSingleClaim(input);
      // Refetch claims to include the new scored claim
      setTimeout(fetchClaims, 500);
      return {
        riskScore: res.risk_score,
        riskPercent: res.risk_percent,
        priority: normalizePriority(res.priority) as Priority,
        modelVersion: res.model_version,
        thresholdReference: res.threshold_reference,
        topFactors: res.top_factors,
      };
    } finally {
      setScoringLoading(false);
    }
  }, [fetchClaims]);

  const scoreBatchFile = useCallback(async (file: File, uploadedBy: string): Promise<api.BatchScoreResponse> => {
    setBatchScoringLoading(true);
    try {
      const text = await file.text();
      const claims = parseCsvBatch(text);
      const res = await api.scoreBatch({ filename: file.name, uploaded_by: uploadedBy, claims });
      setTimeout(() => { fetchClaims(); fetchBatches(); }, 500);
      return res;
    } finally {
      setBatchScoringLoading(false);
    }
  }, [fetchClaims, fetchBatches]);

  const updateStatus = useCallback(async (id: string, status: string, reviewer?: string, note?: string) => {
    await api.updateClaimStatus(id, status, note);
    // Optimistic update
    setClaims(prev => prev.map(c => c.id === id
      ? { ...c, status: status as ReviewStatus, reviewer: reviewer || c.reviewer, updatedAt: new Date().toISOString() }
      : c
    ));
    // Log audit event
    if (reviewer) {
      api.createAuditEvent({
        actor: reviewer, actor_role: "verifier",
        action: "Review status changed", entity: "Claim", entity_id: id,
        timestamp: new Date().toISOString(),
        detail: `Status changed to ${status}${note ? ` — ${note}` : ""}`,
        category: "review",
      }).catch(console.warn);
    }
    setTimeout(fetchAudit, 300);
  }, [fetchAudit]);

  return (
    <AppContext.Provider value={{
      claims, batches, auditEvents, users, history,
      modelVersion, threshold, apiOnline,
      claimsLoading, batchesLoading, auditLoading,
      usersLoading, historyLoading,
      scoreSingle, scoringLoading,
      scoreBatchFile, batchScoringLoading,
      updateStatus,
      refetchClaims: fetchClaims,
      refetchHistory: fetchHistory,
    }}>
      {children}
    </AppContext.Provider>
  );
}
