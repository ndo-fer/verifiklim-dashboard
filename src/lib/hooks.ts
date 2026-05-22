/**
 * hooks.ts
 * ---------
 * React hooks for fetching data from the VerifiKlaim API.
 * Uses simple useState/useEffect pattern — no external library needed.
 */

import { useState, useEffect, useCallback } from "react";
import * as api from "./api";

// Generic hook factory
function useQuery<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── Claims ────────────────────────────────────────────────────────
export function useClaims(limit = 200) {
  return useQuery(() => api.getClaims(limit), [limit]);
}

export function useClaim(id: string) {
  return useQuery(() => api.getClaim(id), [id]);
}

// ── Batches ───────────────────────────────────────────────────────
export function useBatches(limit = 50) {
  return useQuery(() => api.getBatches(limit), [limit]);
}

// ── History ───────────────────────────────────────────────────────
export function useHistory(limit = 200) {
  return useQuery(() => api.getHistory(limit), [limit]);
}

// ── Audit Log ─────────────────────────────────────────────────────
export function useAuditLog(limit = 200) {
  return useQuery(() => api.getAuditLog(limit), [limit]);
}

// ── Users ─────────────────────────────────────────────────────────
export function useUsers() {
  return useQuery(() => api.getUsers(), []);
}

// ── Health / Model Info ───────────────────────────────────────────
export function useHealth() {
  return useQuery(() => api.getHealth(), []);
}

// ── Single claim scoring (mutation) ──────────────────────────────
export function useScoreClaim() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<api.ScoreResult | null>(null);

  const score = useCallback(async (input: api.SingleScoreInput) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.scoreSingleClaim(input);
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Scoring gagal";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { score, loading, error, result };
}

// ── Batch scoring (mutation) ──────────────────────────────────────
export function useScoreBatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<api.BatchScoreResponse | null>(null);

  const scoreBatch = useCallback(async (input: api.BatchScoreInput) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.scoreBatch(input);
      setResult(res);
      return res;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Batch scoring gagal";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { scoreBatch, loading, error, result };
}

// ── Update claim status (mutation) ───────────────────────────────
export function useUpdateClaimStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(async (id: string, status: string, note?: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.updateClaimStatus(id, status, note);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update gagal";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error };
}
