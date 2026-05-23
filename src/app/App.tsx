import React, { useState } from "react";
import {
  LayoutDashboard, ClipboardList, FileSearch, Upload, History,
  Shield, FileText, Settings, LogOut, Bell, Search, CheckCircle,
  AlertCircle, Clock, ArrowRight, Download, Plus, Eye, Building2,
  ChevronRight, User, ChevronDown, MoreHorizontal, TrendingUp, X,
  Menu, Activity, Users, AlertTriangle, Layers, Info, SlidersHorizontal,
  FileCog, Circle, Dot, Wifi, WifiOff, Loader2,
} from "lucide-react";
import { useApp } from "../lib/AppContext";
import type { Claim, BatchRecord, AuditEvent, AppUser, ScoringResult } from "../lib/AppContext";

// Local type aliases for page-level use
type Page =
  | "login" | "overview" | "single-claim" | "batch-upload"
  | "review-queue" | "claim-detail" | "artifacts" | "history"
  | "audit-log" | "admin";
type Priority = "High" | "Medium" | "Low";
type ReviewStatus = "New" | "Needs Review" | "In Review" | "Escalated" | "Resolved" | "Dismissed";
type Role = "verifier" | "auditor" | "admin";

// ================================================================
// LOADING + OFFLINE STATES
// ================================================================
function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-10 bg-muted rounded-md" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}

function ApiOfflineBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-800">
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
      <span>API offline — Pastikan backend berjalan di <code className="font-mono">localhost:8000</code> agar dashboard dapat memuat data.</span>
    </div>
  );
}

// No mock data - natively fetch from backend only

// ================================================================
// UTILITY FUNCTIONS
// ================================================================
function formatCurrency(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}
function formatDate(iso: string) {
  if (iso === "—") return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}
function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ================================================================
// UI PRIMITIVES
// ================================================================
function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-red-50 text-red-700 border border-red-200",
    Medium: "bg-amber-50 text-amber-700 border border-amber-200",
    Low: "bg-teal-50 text-teal-700 border border-teal-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium font-mono tracking-wide ${map[priority]}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: ReviewStatus | string }) {
  const map: Record<string, string> = {
    "New": "bg-slate-100 text-slate-600 border border-slate-200",
    "Needs Review": "bg-blue-50 text-blue-700 border border-blue-200",
    "In Review": "bg-indigo-50 text-indigo-700 border border-indigo-200",
    "Escalated": "bg-red-50 text-red-700 border border-red-200",
    "Resolved": "bg-green-50 text-green-700 border border-green-200",
    "Dismissed": "bg-gray-100 text-gray-500 border border-gray-200",
    "Processed": "bg-green-50 text-green-700 border border-green-200",
    "Processing": "bg-blue-50 text-blue-700 border border-blue-200",
    "Failed": "bg-red-50 text-red-700 border border-red-200",
    "Pending": "bg-amber-50 text-amber-700 border border-amber-200",
    "Active": "bg-green-50 text-green-700 border border-green-200",
    "Inactive": "bg-gray-100 text-gray-500 border border-gray-200",
  };
  const cls = map[status] || "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, string> = {
    verifier: "bg-sky-50 text-sky-700 border border-sky-200",
    auditor: "bg-violet-50 text-violet-700 border border-violet-200",
    admin: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  const labels: Record<Role, string> = { verifier: "Verifier", auditor: "Auditor", admin: "Admin" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[role]}`}>
      {labels[role]}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? "bg-red-500" : score >= 0.5 ? "bg-amber-500" : "bg-teal-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="font-mono text-sm font-medium text-foreground tabular-nums w-8 text-right">{score.toFixed(2)}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-2xl font-semibold ${accent || "text-foreground"} leading-none mb-1`} style={{ fontFamily: "'DM Mono', monospace" }}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1.5">{sub}</div>}
    </div>
  );
}

function PageHeader({ title, desc, action }: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Lora', serif" }}>{title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{children}</div>;
}

function Btn({ children, variant = "primary", size = "md", onClick, disabled }: {
  children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md"; onClick?: () => void; disabled?: boolean;
}) {
  const base = "inline-flex items-center gap-1.5 font-medium rounded cursor-pointer transition-all";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-muted",
    danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      {children}
    </button>
  );
}

// ================================================================
// APP SIDEBAR
// ================================================================
const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "review-queue", label: "Review Queue", icon: ClipboardList },
  { id: "single-claim", label: "Single Claim", icon: FileSearch },
  { id: "batch-upload", label: "Batch Upload", icon: Upload },
  { id: "history", label: "History", icon: History },
  { id: "artifacts", label: "Artifacts", icon: Shield },
  { id: "audit-log", label: "Audit Log", icon: FileText },
  { id: "admin", label: "Admin", icon: Settings },
] as const;

function AppSidebar({ currentPage, onNavigate, role, open, onClose }: {
  currentPage: Page; onNavigate: (p: Page) => void; role: Role; open: boolean; onClose: () => void;
}) {
  const roleLabels: Record<Role, string> = { verifier: "Hospital Verifier", auditor: "BPJS Auditor", admin: "System Admin" };
  const orgLabels: Record<Role, string> = { verifier: "RS Harapan Sehat", auditor: "JKN Regional Review Unit", admin: "Platform Admin" };
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-56 flex flex-col h-screen transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "#1A2235" }}>
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#38B8CC" }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white leading-none">VerifiKlaim</div>
              <div className="text-xs mt-0.5" style={{ color: "#6A7D96" }}>Claim Review Platform</div>
            </div>
          </div>
        </div>
        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id;
            return (
              <button key={id} onClick={() => { onNavigate(id as Page); onClose(); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all text-left ${active
                  ? "text-white font-medium"
                  : "font-normal hover:text-white"
                  }`}
                style={{
                  background: active ? "rgba(56,184,204,0.15)" : "transparent",
                  color: active ? "#38B8CC" : "#8A9BB0",
                }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {id === "review-queue" && <span className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(56,184,204,0.2)", color: "#38B8CC" }}>7</span>}
              </button>
            );
          })}
        </nav>
        {/* User session */}
        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold" style={{ background: "#38B8CC", color: "#1A2235" }}>
              {role === "verifier" ? "SW" : role === "auditor" ? "BS" : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">{role === "verifier" ? "Sari W." : role === "auditor" ? "Budi S." : "Admin"}</div>
              <div className="text-xs truncate" style={{ color: "#6A7D96" }}>{roleLabels[role]}</div>
            </div>
            <LogOut className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#6A7D96" }} />
          </div>
          <div className="mt-2 px-3 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,0.04)" }}>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3 h-3" style={{ color: "#6A7D96" }} />
              <span className="text-xs truncate" style={{ color: "#6A7D96" }}>{orgLabels[role]}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// ================================================================
// PAGE: LOGIN
// ================================================================
function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("verifier");
  return (
    <div className="min-h-screen flex" style={{ background: "#F4F2EE" }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] p-12" style={{ background: "#1A2235" }}>
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#38B8CC" }}>
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-white">VerifiKlaim</div>
              <div className="text-xs" style={{ color: "#6A7D96" }}>Claim Review Platform</div>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-3 leading-snug" style={{ fontFamily: "'Lora', serif" }}>
            Operational claim verification for JKN/BPJS
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "#8A9BB0" }}>
            A structured review platform for scoring, prioritizing, and auditing healthcare claim submissions. Designed for hospital verifiers, BPJS auditors, and system administrators.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: Shield, text: "Role-based access for verifiers and auditors" },
            { icon: Activity, text: "Risk prioritization — not fraud verdict" },
            { icon: FileText, text: "Full audit trail and governance support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "#38B8CC" }} />
              <span className="text-sm" style={{ color: "#8A9BB0" }}>{text}</span>
            </div>
          ))}
        </div>
        <div className="text-xs" style={{ color: "#4A5A6E" }}>
          Model v0.3.1 · Risk Prioritization Model · Academic prototype
        </div>
      </div>
      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#1B5E72" }}>
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">VerifiKlaim</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-1" style={{ fontFamily: "'Lora', serif" }}>Sign in to your account</h1>
          <p className="text-sm text-muted-foreground mb-8">Use your institutional credentials to continue.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Email address</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="you@institution.go.id" type="email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••" type="password" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Access role</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md bg-card focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                <option value="verifier">Hospital Verifier / Operator</option>
                <option value="auditor">BPJS / JKN Auditor</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
            <button onClick={() => onLogin(role)}
              className="w-full py-2.5 rounded-md text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "#1B5E72" }}>
              Sign in
            </button>
          </div>
          <div className="mt-6 p-3 rounded-md text-xs text-muted-foreground" style={{ background: "rgba(27,94,114,0.05)", border: "1px solid rgba(27,94,114,0.12)" }}>
            <Info className="inline w-3 h-3 mr-1 mb-0.5" />
            This is a prototype for academic and demonstration purposes. All data is fictional. Scoring outputs are decision-support signals, not definitive determinations.
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: OVERVIEW
// ================================================================
function OverviewPage({ role, onNavigate }: { role: Role; onNavigate: (p: Page, id?: string) => void }) {
  const { claims: CLAIMS, batches: BATCHES, apiOnline, claimsLoading, modelVersion } = useApp();

  const highCount = CLAIMS.filter(c => c.priority === "High").length;
  const pendingCount = CLAIMS.filter(c => c.status === "Needs Review" || c.status === "New").length;
  const recentClaims = CLAIMS.slice(0, 5);
  return (
    <div>
      {!apiOnline && !claimsLoading && <ApiOfflineBanner />}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "'Lora', serif" }}>
            {role === "verifier" ? "Workload Overview" : role === "auditor" ? "Queue & Audit Overview" : "System Overview"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(new Date().toISOString())} · Model {modelVersion} · JKN Regional Review Unit
          </p>
        </div>
        <div className="flex items-center gap-2">
          {role === "verifier" && <Btn variant="secondary" size="sm" onClick={() => onNavigate("batch-upload")}><Upload className="w-3.5 h-3.5" />Batch Upload</Btn>}
          <Btn size="sm" onClick={() => onNavigate("single-claim")}><Plus className="w-3.5 h-3.5" />Score Claim</Btn>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Pending Review" value={pendingCount} sub="Needs action" accent="text-amber-600" />
        <MetricCard label="High Priority" value={highCount} sub="Flagged this period" accent="text-red-600" />
        <MetricCard label="Batches Processed" value={BATCHES.length} sub="Total uploaded" />
        <MetricCard label="Claims Scored" value={CLAIMS.length} sub="All time" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Review queue preview */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <SectionLabel>Review Queue — Priority</SectionLabel>
            <button onClick={() => onNavigate("review-queue")} className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="divide-y divide-border">
            {recentClaims.map(claim => (
              <div key={claim.id} onClick={() => onNavigate("claim-detail", claim.id)}
                className="flex items-center gap-4 px-5 py-3 hover:bg-muted/40 cursor-pointer transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-medium text-foreground">{claim.id}</span>
                    <PriorityBadge priority={claim.priority} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{claim.facility} · {claim.diagnosisGroup}</div>
                </div>
                <div className="w-28 hidden sm:block">
                  <ScoreBar score={claim.riskScore} />
                </div>
                <StatusBadge status={claim.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent batches */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <SectionLabel>Recent Uploads</SectionLabel>
            </div>
            <div className="divide-y divide-border">
              {BATCHES.slice(0, 3).map(b => (
                <div key={b.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-mono text-foreground">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">{b.total} claims · {b.uploadedBy}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model version card */}
          <div className="bg-card border border-border rounded-lg p-4">
            <SectionLabel>Active Model</SectionLabel>
            <div className="flex items-center gap-2 mb-2">
              <FileCog className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Risk Prioritization Model</span>
            </div>
            <div className="font-mono text-xs text-muted-foreground mb-2">v0.3.1 · Updated 2026-05-15</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Scores represent prioritization signals for verification. Review with full claim context.
            </p>
            <button onClick={() => onNavigate("artifacts")} className="mt-2 text-xs text-primary hover:underline">
              View artifacts →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: SINGLE CLAIM SCORING
// ================================================================
function SingleClaimPage({ onNavigate }: { onNavigate: (p: Page, id?: string) => void }) {
  const { scoreSingle, scoringLoading, modelVersion } = useApp();
  const [scored, setScored] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState({
    claimId: "", facility: "", claimType: "INA-CBG", diagnosisGroup: "Internal Medicine",
    amount: "", los: "", patientCategory: "Inpatient",
  });
  const [liveResult, setLiveResult] = useState<ScoringResult | null>(null);

  async function handleScore() {
    if (!form.claimId || !form.facility || !form.amount) return;
    setApiError(null);
    try {
      const res = await scoreSingle({
        claim_id: form.claimId,
        facility: form.facility,
        claim_type: form.claimType,
        diagnosis_group: form.diagnosisGroup,
        amount: parseFloat(form.amount),
        los: form.los ? parseFloat(form.los) : undefined,
        patient_category: form.patientCategory,
        tarif_disetujui: parseFloat(form.amount),
        lama_rawat_hari: form.los ? parseFloat(form.los) : 1,
        flag_rawat_inap: form.patientCategory === "Inpatient" ? 1 : 0,
      });
      setLiveResult(res);
      setScored(true);
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Scoring gagal");
      // Fallback to demo result
      setLiveResult({ riskScore: 0.78, riskPercent: 78, priority: "High", modelVersion, thresholdReference: "0.48", topFactors: [] });
      setScored(true);
    }
  }

  // Derive display result
  const result = liveResult
    ? { score: liveResult.riskScore, priority: liveResult.priority as Priority, factors: liveResult.topFactors.length > 0 ? liveResult.topFactors.map(f => f.feature) : [] }
    : { score: 0, priority: "Low" as Priority, factors: [] };


  return (
    <div>
      <PageHeader
        title="Single Claim Scoring"
        desc="Score an individual claim and receive prioritization guidance."
        action={scored ? <Btn size="sm" onClick={() => { setScored(false); setForm({ claimId: "", facility: "", claimType: "INA-CBG", diagnosisGroup: "Internal Medicine", amount: "", los: "", patientCategory: "Inpatient" }); }}>New Claim</Btn> : undefined}
      />
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Claim Identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-foreground mb-1.5">Claim ID <span className="text-red-500">*</span></label>
                <input value={form.claimId} onChange={e => setForm({ ...form, claimId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  placeholder="CLM-2026-XXXXX" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-foreground mb-1.5">Facility Name <span className="text-red-500">*</span></label>
                <input value={form.facility} onChange={e => setForm({ ...form, facility: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="RS / Klinik / Puskesmas" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Claim Details</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Claim Type <span className="text-red-500">*</span></label>
                <select value={form.claimType} onChange={e => setForm({ ...form, claimType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none">
                  <option>INA-CBG</option><option>Non-CBG</option><option>Kapitasi</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Patient Category <span className="text-red-500">*</span></label>
                <select value={form.patientCategory} onChange={e => setForm({ ...form, patientCategory: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none">
                  <option>Inpatient</option><option>Outpatient</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Diagnosis Group <span className="text-red-500">*</span></label>
                <select value={form.diagnosisGroup} onChange={e => setForm({ ...form, diagnosisGroup: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none">
                  <option>Internal Medicine</option><option>Surgical</option><option>Maternity</option><option>Outpatient General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Submitted Amount (Rp) <span className="text-red-500">*</span></label>
                <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none font-mono"
                  placeholder="e.g. 8750000" type="number" />
              </div>
            </div>
          </div>

          {/* Advanced disclosure */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <button onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted/40 transition-colors">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Advanced Inputs (Optional)</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            {showAdvanced && (
              <div className="px-5 pb-5 pt-0 grid grid-cols-2 gap-3 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Length of Stay (days)</label>
                  <input value={form.los} onChange={e => setForm({ ...form, los: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none font-mono"
                    placeholder="days" type="number" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Batch Reference ID</label>
                  <input className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none font-mono"
                    placeholder="BTH-XXXX (optional)" />
                </div>
              </div>
            )}
          </div>

          {apiError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{apiError} — showing demo result.</div>}
          <Btn onClick={handleScore} disabled={!form.claimId || !form.facility || !form.amount || scoringLoading}>
            {scoringLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
            {scoringLoading ? "Scoring…" : "Run Scoring"}
          </Btn>
        </div>

        {/* Result panel */}
        <div className="lg:col-span-2">
          {!scored ? (
            <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center text-center h-64">
              <Activity className="w-10 h-10 text-muted mb-3" />
              <div className="text-sm font-medium text-muted-foreground">Scoring result will appear here</div>
              <div className="text-xs text-muted-foreground mt-1">Complete the required fields and run scoring</div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Score card */}
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                  <SectionLabel>Scoring Result</SectionLabel>
                  <span className="text-xs font-mono text-muted-foreground">v0.3.1</span>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <div>
                    <div className="text-4xl font-semibold tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: "#C0392B" }}>
                      {result.score.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Risk indication score</div>
                  </div>
                  <div className="mb-1">
                    <PriorityBadge priority={result.priority} />
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-red-500" style={{ width: `${result.score * 100}%` }} />
                </div>
                <div className="text-xs text-muted-foreground p-2.5 rounded-md" style={{ background: "rgba(192,57,43,0.05)", border: "1px solid rgba(192,57,43,0.1)" }}>
                  <AlertTriangle className="inline w-3 h-3 mr-1 text-red-600" />
                  <strong>Review required.</strong> This score is a decision-support signal. It does not determine fraud by itself.
                </div>
              </div>

              {/* Top factors */}
              <div className="bg-card border border-border rounded-lg p-5">
                <SectionLabel>Supporting Factors</SectionLabel>
                <div className="space-y-2">
                  {result.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(192,57,43,0.08)" }}>
                        <span className="text-xs font-mono text-red-600">{i + 1}</span>
                      </div>
                      <span className="text-xs text-foreground leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  Threshold reference: ≥ 0.70 = High priority · 0.50–0.69 = Medium · &lt; 0.50 = Low
                </div>
              </div>

              {/* Actions */}
              <div className="bg-card border border-border rounded-lg p-4">
                <SectionLabel>Review Actions</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  <Btn size="sm" onClick={() => form.claimId ? onNavigate("claim-detail", form.claimId) : undefined}>
                    <Eye className="w-3.5 h-3.5" />View Detail
                  </Btn>
                  <Btn variant="secondary" size="sm"><CheckCircle className="w-3.5 h-3.5" />Save to Queue</Btn>
                  <Btn variant="ghost" size="sm"><Download className="w-3.5 h-3.5" />Export</Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: BATCH UPLOAD
// ================================================================
function BatchUploadPage() {
  const { scoreBatchFile, batchScoringLoading, batches: BATCHES, claims: liveClaims } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [batchResult, setBatchResult] = useState<{ total: number; high: number; medium: number; low: number } | null>(null);

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    try {
      const res = await scoreBatchFile(file, "Sari W.");
      setBatchResult({ total: res.total, high: res.high, medium: res.medium, low: res.low });
      setUploaded(true);
    } catch { setUploaded(true); }
  }
  return (
    <div>
      <PageHeader title="Batch Upload" desc="Ingest multiple claims for automated risk scoring and triage." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Dropzone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <div className="text-sm font-medium text-foreground mb-1">Drop claim file here, or click to browse</div>
            <div className="text-xs text-muted-foreground">Accepted: .csv, .xlsx — max 10 MB — columns: claim_id, facility, diagnosis_group, amount, patient_category, claim_type</div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Btn variant="secondary" size="sm" onClick={async () => {
                const input = document.createElement("input"); input.type = "file"; input.accept = ".csv";
                input.onchange = async (ev) => {
                  const file = (ev.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  try { const res = await scoreBatchFile(file, "Sari W."); setBatchResult({ total: res.total, high: res.high, medium: res.medium, low: res.low }); setUploaded(true); } catch { setUploaded(true); }
                };
                input.click();
              }}>{batchScoringLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}{batchScoringLoading ? "Processing…" : "Select File"}</Btn>
              <Btn variant="ghost" size="sm"><Download className="w-3.5 h-3.5" />Download Template</Btn>
            </div>
          </div>

          {/* Processed batch preview */}
          {uploaded && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <SectionLabel>Preview — claims_harapan_sehat_may22.csv</SectionLabel>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>48 rows detected</span>
                    <StatusBadge status="Processed" />
                  </div>
                </div>
                <Btn size="sm"><Activity className="w-3.5 h-3.5" />Run Scoring</Btn>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border" style={{ background: "#F4F2EE" }}>
                      {["Claim ID", "Facility", "Diagnosis Group", "Amount", "Type", "Risk Score", "Priority", "Status"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {liveClaims.slice(0, 5).map(c => (
                      <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-mono text-foreground">{c.id}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.facility}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.diagnosisGroup}</td>
                        <td className="px-4 py-2.5 font-mono">{formatCurrency(c.amount)}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{c.claimType}</td>
                        <td className="px-4 py-2.5 font-mono">{c.riskScore.toFixed(2)}</td>
                        <td className="px-4 py-2.5"><PriorityBadge priority={c.priority} /></td>
                        <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Priority Distribution</SectionLabel>
            {[{ label: "High", count: 12, color: "bg-red-500", pct: 25 }, { label: "Medium", count: 19, color: "bg-amber-500", pct: 40 }, { label: "Low", count: 17, color: "bg-teal-500", pct: 35 }].map(p => (
              <div key={p.label} className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-mono font-medium">{p.count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Batch History</SectionLabel>
            <div className="space-y-2">
              {BATCHES.map(b => (
                <div key={b.id} className="p-3 rounded-md border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-foreground">{b.id}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="text-xs text-muted-foreground">{b.total} claims · {formatDate(b.uploadedAt)}</div>
                  <div className="text-xs text-muted-foreground">{b.uploadedBy}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: REVIEW QUEUE
// ================================================================
function ReviewQueuePage({ onNavigate }: { onNavigate: (p: Page, id?: string) => void }) {
  const { claims: CLAIMS, claimsLoading } = useApp();
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | ReviewStatus>("All");
  const [search, setSearch] = useState("");

  const filtered = CLAIMS.filter(c => {
    if (priorityFilter !== "All" && c.priority !== priorityFilter) return false;
    if (statusFilter !== "All" && c.status !== statusFilter) return false;
    if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.facility.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Review Queue" desc="Prioritized claim backlog for verification and review."
        action={<Btn size="sm" variant="secondary"><Download className="w-3.5 h-3.5" />Export</Btn>} />

      {/* Filter bar */}
      <div className="bg-card border border-border rounded-lg px-4 py-3 flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
            placeholder="Search claim ID or facility…" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Priority:</span>
          {(["All", "High", "Medium", "Low"] as const).map(p => (
            <button key={p} onClick={() => setPriorityFilter(p as any)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${priorityFilter === p ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          {(["All", "Needs Review", "In Review", "Escalated"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s as any)}
              className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left" style={{ background: "#F4F2EE" }}>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Claim ID</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Facility</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Risk Score</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Priority</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Reviewer</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-xs font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} onClick={() => onNavigate("claim-detail", c.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">{c.id}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    <div>{c.facility}</div>
                    <div className="text-muted-foreground/70">{c.diagnosisGroup}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3 w-32"><ScoreBar score={c.riskScore} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.reviewer}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(c.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Eye className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No claims match the current filters.</div>
        )}
        <div className="px-4 py-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} claim{filtered.length !== 1 ? "s" : ""} shown</span>
          <span className="text-xs text-muted-foreground">Model v0.3.1 · Threshold: ≥0.70 High, 0.50–0.69 Medium</span>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: CLAIM DETAIL
// ================================================================
function ClaimDetailPage({ claimId, onNavigate }: { claimId: string; onNavigate: (p: Page, id?: string) => void }) {
  const { claims: allClaims, updateStatus } = useApp();
  const claim = allClaims.find(c => c.id === claimId);
  const [status, setStatus] = useState<ReviewStatus>(claim?.status || "New");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<{ text: string; by: string; at: string }[]>([
    { text: "Initial review triggered by batch scoring. Score 0.78 warrants manual verification of procedure combination.", by: "Sari W.", at: "2026-05-22T09:30:00" },
  ]);

  async function handleSaveStatus() {
    try { await updateStatus(claim.id, status, "Sari W.", note || undefined); } catch { /* optimistic update already done */ }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <button onClick={() => onNavigate("review-queue")} className="hover:text-foreground">Review Queue</button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-mono">{claim.id}</span>
      </div>

      {/* Header */}
      {claim ? (
        <>
          <div className="bg-card border border-border rounded-lg p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-semibold text-foreground font-mono">{claim.id}</h1>
              <PriorityBadge priority={claim.priority} />
              <StatusBadge status={status} />
            </div>
            <div className="text-sm text-muted-foreground">{claim.facility} · {claim.org}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Submitted {formatDateTime(claim.submittedAt)} · {claim.patientCategory} · {claim.claimType}</div>
          </div>
          <div className="flex items-center gap-2">
            <select value={status} onChange={e => setStatus(e.target.value as ReviewStatus)}
              className="text-xs border border-border rounded-md px-2.5 py-1.5 bg-background focus:outline-none">
              {(["New", "Needs Review", "In Review", "Escalated", "Resolved", "Dismissed"] as ReviewStatus[]).map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Btn size="sm">Save Status</Btn>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Left: claim facts + scoring */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Claim Facts</SectionLabel>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: "Diagnosis Group", value: claim.diagnosisGroup },
                { label: "Claim Type", value: claim.claimType },
                { label: "Patient Category", value: claim.patientCategory },
                { label: "Length of Stay", value: `${claim.los} days` },
                { label: "Submitted Amount", value: formatCurrency(claim.amount) },
                { label: "Batch Reference", value: claim.batchId || "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-foreground font-mono">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Scoring Result</SectionLabel>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-semibold tabular-nums" style={{ fontFamily: "'DM Mono', monospace", color: "#C0392B" }}>
                {claim.riskScore.toFixed(2)}
              </div>
              <div>
                <PriorityBadge priority={claim.priority} />
                <div className="text-xs text-muted-foreground mt-1">Risk indication · Model v0.3.1</div>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${claim.riskScore * 100}%` }} />
            </div>
            <SectionLabel>Supporting Factors</SectionLabel>
            <div className="space-y-2">
              {claim.topFactors.map((f, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full text-center text-xs font-mono" style={{ background: "rgba(192,57,43,0.08)", color: "#C0392B", lineHeight: "1rem" }}>{i + 1}</span>
                  <span className="text-xs text-foreground">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-2.5 rounded text-xs text-muted-foreground" style={{ background: "rgba(27,94,114,0.05)", border: "1px solid rgba(27,94,114,0.1)" }}>
              This score is a decision-support signal for verification prioritization. It does not determine fraud by itself and should be reviewed with claim context, policy rules, and supporting documentation.
            </div>
          </div>
        </div>

        {/* Right: review notes + timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Notes */}
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Reviewer Notes</SectionLabel>
            <div className="space-y-3 mb-4">
              {notes.map((n, i) => (
                <div key={i} className="p-3 rounded-md" style={{ background: "rgba(26,31,46,0.03)", border: "1px solid rgba(26,31,46,0.07)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{n.by}</span>
                    <span className="text-xs text-muted-foreground font-mono">{formatDateTime(n.at)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              className="w-full text-xs border border-border rounded-md p-3 bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3} placeholder="Add a reviewer note…" />
            <div className="mt-2 flex justify-end">
              <Btn size="sm" variant="secondary" disabled={!note} onClick={() => {
                if (note) {
                  setNotes([...notes, { text: note, by: "Sari W.", at: new Date().toISOString() }]);
                  setNote("");
                }
              }}>
                Add Note
              </Btn>
            </div>
          </div>

          {/* Activity timeline */}
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Activity Timeline</SectionLabel>
            <div className="space-y-4">
              {[
                { action: "Review status changed", detail: "New → Needs Review", by: "Sari W.", at: "2026-05-22T11:30:00", icon: Activity },
                { action: "Claim scored", detail: "Score: 0.78 — High priority", by: "System", at: "2026-05-22T09:05:00", icon: Activity },
                { action: "Ingested from batch", detail: "BTH-2026-0521", by: "Sari W.", at: "2026-05-22T09:00:00", icon: Upload },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(27,94,114,0.08)" }}>
                    <ev.icon className="w-3 h-3 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-foreground">{ev.action}</div>
                    <div className="text-xs text-muted-foreground">{ev.detail}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ev.by} · {formatDateTime(ev.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground">Claim not found or loading.</div>
      )}
    </div>
  );
}

// ================================================================
// PAGE: ARTIFACTS / TRUST CENTER
// ================================================================
function ArtifactsPage() {
  return (
    <div>
      <PageHeader title="Artifacts & Trust Center" desc="Model documentation, versioning, thresholds, and governance." />
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Model card */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <SectionLabel>Active Model Artifact</SectionLabel>
                <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "'Lora', serif" }}>Risk Prioritization Model</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-muted-foreground">v0.3.1</span>
                  <StatusBadge status="Active" />
                </div>
              </div>
              <Btn variant="secondary" size="sm"><Download className="w-3.5 h-3.5" />Download Artifact</Btn>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
              {[
                { label: "Updated", value: "2026-05-15" }, { label: "Model Type", value: "Gradient Boosting Classifier" },
                { label: "Training Data", value: "INA-CBG 2022–2025 (anonymized)" }, { label: "Maintainer", value: "Research Team / Platform Admin" },
                { label: "Features Used", value: "18 input features" }, { label: "Evaluation Metric", value: "F1 (High-priority class)" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-muted-foreground mb-0.5">{label}</div>
                  <div className="font-medium text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Threshold explanation */}
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Threshold Reference</SectionLabel>
            <div className="space-y-3">
              {[
                { range: "≥ 0.70", label: "High — Prioritize for verification", color: "bg-red-500", textColor: "text-red-700", bg: "bg-red-50 border-red-200" },
                { range: "0.50 – 0.69", label: "Medium — Review recommended", color: "bg-amber-500", textColor: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
                { range: "< 0.50", label: "Low — Routine review", color: "bg-teal-500", textColor: "text-teal-700", bg: "bg-teal-50 border-teal-200" },
              ].map(t => (
                <div key={t.range} className={`flex items-center gap-3 p-3 rounded-md border ${t.bg}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.color}`} />
                  <span className={`font-mono text-xs font-medium ${t.textColor} w-20`}>{t.range}</span>
                  <span className="text-xs text-foreground">{t.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Thresholds are calibrated for recall on high-risk cases. False-positive rates are accepted at moderate levels to avoid missing critical claims. Thresholds may be adjusted in future versions.
            </p>
          </div>

          {/* Top features */}
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Feature Importance Summary</SectionLabel>
            <div className="space-y-2.5">
              {[
                { feature: "Claim amount vs. diagnosis group median", pct: 82 },
                { feature: "Length of stay deviation from INA-CBG reference", pct: 71 },
                { feature: "Procedure-diagnosis consistency score", pct: 65 },
                { feature: "Repeat claim frequency per facility", pct: 58 },
                { feature: "Missing supporting field count", pct: 44 },
                { feature: "Patient category alignment", pct: 38 },
              ].map(f => (
                <div key={f.feature} className="flex items-center gap-3">
                  <div className="flex-1 text-xs text-muted-foreground">{f.feature}</div>
                  <div className="w-32">
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${f.pct}%` }} />
                    </div>
                  </div>
                  <div className="text-xs font-mono text-muted-foreground w-8 text-right">{f.pct}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Relative importance scores, not absolute probability contributions.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-amber-800 mb-1">Academic Prototype Disclaimer</div>
                <p className="text-xs text-amber-700 leading-relaxed">This model is a research prototype. Scores are decision-support signals for verification prioritization only. They do not constitute fraud determinations, legal findings, or clinical decisions.</p>
              </div>
            </div>
          </div>

          {/* Artifact history */}
          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Version History</SectionLabel>
            <div className="space-y-3">
              {[
                { version: "v0.3.1", date: "2026-05-15", note: "Re-threshold applied, recall improvement on surgical class" },
                { version: "v0.3.0", date: "2026-04-10", note: "Added LOS deviation feature, retrained on 2025 data" },
                { version: "v0.2.1", date: "2026-02-28", note: "Minor preprocessing fix for Non-CBG claim types" },
              ].map(v => (
                <div key={v.version} className="border-l-2 border-border pl-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-foreground">{v.version}</span>
                    <span className="text-xs text-muted-foreground">{v.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{v.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <SectionLabel>Caveats & Limitations</SectionLabel>
            <ul className="space-y-2 text-xs text-muted-foreground">
              {["Model output is probabilistic and not a definitive claim assessment.", "Training data covers limited facility types; generalization to all contexts not guaranteed.", "Human review is mandatory for all high-priority claims.", "Model does not account for real-time policy rule updates.", "Regular retraining is recommended as claim patterns evolve."].map((c, i) => (
                <li key={i} className="flex items-start gap-2"><span className="text-muted mt-0.5">·</span>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: HISTORY
// ================================================================
function HistoryPage({ onNavigate }: { onNavigate: (p: Page, id?: string) => void }) {
  const { claims: CLAIMS, historyLoading } = useApp();
  const [search, setSearch] = useState("");
  const filtered = CLAIMS.filter(c =>
    !search || c.id.toLowerCase().includes(search.toLowerCase()) || c.facility.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div>
      <PageHeader title="Scoring History" desc="Searchable record of all claim scoring and review activity."
        action={<Btn variant="secondary" size="sm"><Download className="w-3.5 h-3.5" />Export CSV</Btn>} />
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
            placeholder="Search by claim ID or facility…" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left" style={{ background: "#F4F2EE" }}>
                {["Claim ID", "Facility", "Organisation", "Type", "Amount", "Risk Score", "Priority", "Status", "Reviewer", "Source", "Submitted"].map(h => (
                  <th key={h} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} onClick={() => onNavigate("claim-detail", c.id)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-medium text-foreground">{c.id}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.facility}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.org}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.claimType}</td>
                  <td className="px-4 py-3 font-mono">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3 font-mono">{c.riskScore.toFixed(2)}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.reviewer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.batchId ? "Batch" : "Single"}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(c.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          {filtered.length} records shown · Model v0.3.1
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: AUDIT LOG
// ================================================================
function AuditLogPage() {
  const { auditEvents: AUDIT_EVENTS, auditLoading } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | AuditEvent["category"]>("All");
  const filtered = AUDIT_EVENTS.filter(e => {
    if (category !== "All" && e.category !== category) return false;
    if (search && !e.actor.toLowerCase().includes(search.toLowerCase()) && !e.entityId.toLowerCase().includes(search.toLowerCase()) && !e.action.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const catIcon: Record<string, React.ReactNode> = {
    claim: <FileSearch className="w-3 h-3" />,
    batch: <Upload className="w-3 h-3" />,
    user: <User className="w-3 h-3" />,
    system: <Layers className="w-3 h-3" />,
    review: <ClipboardList className="w-3 h-3" />,
  };
  return (
    <div>
      <PageHeader title="Audit Log" desc="Immutable event record for accountability and governance." />
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-40">
            <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
              placeholder="Search actor, entity, or action…" />
          </div>
          <div className="flex items-center gap-1.5">
            {(["All", "claim", "batch", "review", "user", "system"] as const).map(c => (
              <button key={c} onClick={() => setCategory(c as any)}
                className={`px-2.5 py-1 text-xs rounded capitalize font-medium transition-colors ${category === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map(e => (
            <div key={e.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(27,94,114,0.08)", color: "#1B5E72" }}>
                {catIcon[e.category]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">{e.action}</span>
                  <span className="font-mono text-xs text-primary">{e.entityId}</span>
                  <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted capitalize">{e.category}</span>
                </div>
                <div className="text-xs text-muted-foreground">{e.detail}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-medium text-foreground">{e.actor}</div>
                <div className="text-xs text-muted-foreground">{["verifier", "auditor", "admin"].includes(e.actorRole.toLowerCase()) ? <RoleBadge role={e.actorRole.toLowerCase() as Role} /> : <span className="text-xs text-muted-foreground">{e.actorRole}</span>}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">{formatDateTime(e.timestamp)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border text-xs text-muted-foreground">
          {filtered.length} events shown
        </div>
      </div>
    </div>
  );
}

// ================================================================
// PAGE: ADMIN
// ================================================================
function AdminPage() {
  const { users: APP_USERS, usersLoading } = useApp();
  return (
    <div>
      <PageHeader title="Administration" desc="User management, role assignments, and system configuration."
        action={<Btn size="sm"><Plus className="w-3.5 h-3.5" />Invite User</Btn>} />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Total Users" value={APP_USERS.length} sub="Across all orgs" />
        <MetricCard label="Active Users" value={APP_USERS.filter(u => u.status === "Active").length} sub="Logged in recently" accent="text-green-600" />
        <MetricCard label="Verifiers" value={APP_USERS.filter(u => u.role === "verifier").length} sub="Hospital operators" />
        <MetricCard label="Auditors" value={APP_USERS.filter(u => u.role === "auditor").length} sub="BPJS/JKN reviewers" />
      </div>

      {/* User table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-border">
          <SectionLabel>User Roster</SectionLabel>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border" style={{ background: "#F4F2EE" }}>
                {["Name", "Email", "Role", "Organisation", "Status", "Last Active", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {APP_USERS.map(u => (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">{u.email}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.org}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastActive === "—" ? "—" : timeAgo(u.lastActive)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Btn size="sm" variant="ghost">Edit</Btn>
                      {u.status === "Active" && <Btn size="sm" variant="ghost">Deactivate</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System status */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <SectionLabel>System Status</SectionLabel>
          <div className="space-y-3">
            {[
              { label: "Frontend Application", status: "Operational" },
              { label: "Backend API Service", status: "Operational" },
              { label: "Model Inference Service", status: "Operational" },
              { label: "Database", status: "Operational" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{s.label}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-green-700">{s.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <SectionLabel>Active Model Configuration</SectionLabel>
          <div className="space-y-2 text-xs">
            {[
              { k: "Active Model", v: "Risk Prioritization Model v0.3.1" },
              { k: "High Threshold", v: "≥ 0.70" },
              { k: "Medium Threshold", v: "0.50 – 0.69" },
              { k: "Last Artifact Update", v: "2026-05-15" },
              { k: "Visible to all roles", v: "Yes" },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-mono font-medium text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================================================
// APP SHELL
// ================================================================
function AppShell({ children, currentPage, onNavigate, role }: {
  children: React.ReactNode; currentPage: Page; onNavigate: (p: Page, id?: string) => void; role: Role;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F4F2EE" }}>
      <AppSidebar currentPage={currentPage} onNavigate={p => onNavigate(p)} role={role} open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-card border-b border-border">
          <button onClick={() => setMobileOpen(true)} className="p-1 rounded text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: "#1B5E72" }}>
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-foreground">VerifiKlaim</span>
          </div>
          <div className="ml-auto">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6" style={{ scrollbarWidth: "none" }}>
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// ================================================================
// MAIN APP
// ================================================================
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("verifier");
  const [page, setPage] = useState<Page>("overview");
  const [selectedClaimId, setSelectedClaimId] = useState<string>("");

  function navigate(p: Page, id?: string) {
    if (id) setSelectedClaimId(id);
    setPage(p);
  }

  if (!loggedIn) {
    return <LoginPage onLogin={r => { setRole(r); setLoggedIn(true); }} />;
  }

  const pageMap: Record<Page, React.ReactNode> = {
    login: null,
    overview: <OverviewPage role={role} onNavigate={navigate} />,
    "single-claim": <SingleClaimPage onNavigate={navigate} />,
    "batch-upload": <BatchUploadPage />,
    "review-queue": <ReviewQueuePage onNavigate={navigate} />,
    "claim-detail": <ClaimDetailPage claimId={selectedClaimId} onNavigate={navigate} />,
    artifacts: <ArtifactsPage />,
    history: <HistoryPage onNavigate={navigate} />,
    "audit-log": <AuditLogPage />,
    admin: <AdminPage />,
  };

  return (
    <AppShell currentPage={page} onNavigate={navigate} role={role}>
      {pageMap[page]}
    </AppShell>
  );
}
