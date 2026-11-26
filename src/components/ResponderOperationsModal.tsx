import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  ClipboardCheck,
  Loader2,
  Lock,
  LogOut,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { LanguageCode, UI_TRANSLATIONS } from '../i18n';
import {
  CaseStatus,
  HARAM_ZONES,
  HaramZone,
  mapServerRecordToTriageResult,
  ServerTriageCaseRecord,
  TriageLevel,
  TriageResult,
} from '../triageEngine';

export interface AuthUser {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'responder';
}

interface ResponderAccount {
  id: string;
  username: string;
  displayName: string;
  role: 'admin' | 'responder';
  createdAt: string;
}

interface ResponderOperationsModalProps {
  open: boolean;
  onClose: () => void;
  language: LanguageCode;
  authToken: string | null;
  authUser: AuthUser | null;
  onAuthSuccess: (token: string, user: AuthUser) => void;
  onLogout: () => void;
  onLoadCaseToWorkspace: (result: TriageResult) => void;
  onCaseUpdated: (result: TriageResult) => void;
  onCaseDeleted: (id: string) => void;
}

const LEVEL_BADGE: Record<TriageLevel, string> = {
  critical: 'bg-red-700 text-white border-red-800',
  urgent: 'bg-amber-500 text-slate-950 border-amber-600',
  stable: 'bg-[#082D23] text-white border-[#082D23]',
};

const STATUS_BADGE: Record<CaseStatus, string> = {
  open: 'bg-red-50 text-red-900 border-red-300',
  dispatched: 'bg-amber-50 text-amber-950 border-amber-300',
  resolved: 'bg-emerald-50 text-[#082D23] border-emerald-300',
};

export const ResponderOperationsModal: React.FC<ResponderOperationsModalProps> = ({
  open,
  onClose,
  language,
  authToken,
  authUser,
  onAuthSuccess,
  onLogout,
  onLoadCaseToWorkspace,
  onCaseUpdated,
  onCaseDeleted,
}) => {
  const t = UI_TRANSLATIONS[language];

  // Auth / First-run setup state
  const [setupRequired, setSetupRequired] = useState(false);
  const [authStatusLoading, setAuthStatusLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'admin' | 'responder'>('admin');
  const [passcode, setPasscode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Cases CRUD state
  const [cases, setCases] = useState<ServerTriageCaseRecord[]>([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesError, setCasesError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | TriageLevel>('all');
  const [zoneFilter, setZoneFilter] = useState<'all' | HaramZone>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CaseStatus>('all');

  // Inline case editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<CaseStatus>('open');
  const [editLevel, setEditLevel] = useState<TriageLevel>('urgent');
  const [editNotes, setEditNotes] = useState('');
  const [savingCaseId, setSavingCaseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);

  // Admin Team management state
  const [teamOpen, setTeamOpen] = useState(false);
  const [responders, setResponders] = useState<ResponderAccount[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'responder' | 'admin'>('responder');
  const [teamError, setTeamError] = useState<string | null>(null);
  const [addingResponder, setAddingResponder] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    setAuthStatusLoading(true);
    try {
      const res = await fetch('/api/auth/status');
      const data = (await res.json().catch(() => null)) as {
        setupRequired?: boolean;
      } | null;
      if (res.ok && data) {
        setSetupRequired(Boolean(data.setupRequired));
      }
    } catch {
      // Ignore check failure; login form remains usable
    } finally {
      setAuthStatusLoading(false);
    }
  }, []);

  const fetchCases = useCallback(async () => {
    if (!authToken) return;
    setCasesLoading(true);
    setCasesError(null);
    try {
      const params = new URLSearchParams();
      if (levelFilter !== 'all') params.set('level', levelFilter);
      if (zoneFilter !== 'all') params.set('zone', zoneFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());

      const qs = params.toString();
      const res = await fetch(`/api/triage/cases${qs ? `?${qs}` : ''}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        cases?: ServerTriageCaseRecord[];
        error?: string;
      } | null;
      if (!res.ok || !data?.cases) {
        setCasesError(data?.error || t.aiFallbackError);
        return;
      }
      setCases(data.cases);
    } catch {
      setCasesError(t.aiFallbackError);
    } finally {
      setCasesLoading(false);
    }
  }, [authToken, levelFilter, zoneFilter, statusFilter, searchQuery, onLogout, t.aiFallbackError]);

  const fetchResponders = useCallback(async () => {
    if (!authToken || authUser?.role !== 'admin') return;
    setTeamLoading(true);
    try {
      const res = await fetch('/api/auth/responders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = (await res.json().catch(() => null)) as {
        responders?: ResponderAccount[];
      } | null;
      if (res.ok && data?.responders) {
        setResponders(data.responders);
      }
    } catch {
      // Ignore transient error
    } finally {
      setTeamLoading(false);
    }
  }, [authToken, authUser?.role]);

  useEffect(() => {
    if (!open) return;
    if (!authToken) {
      void checkAuthStatus();
    } else {
      void fetchCases();
    }
  }, [open, authToken, checkAuthStatus, fetchCases]);

  useEffect(() => {
    if (open && authToken && teamOpen && authUser?.role === 'admin') {
      void fetchResponders();
    }
  }, [open, authToken, teamOpen, authUser?.role, fetchResponders]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authSubmitting) return;
    setAuthError(null);
    setAuthSubmitting(true);

    try {
      const endpoint = setupRequired ? '/api/auth/setup' : '/api/auth/login';
      const body = setupRequired
        ? { passcode }
        : loginMode === 'admin'
        ? { mode: 'admin', passcode }
        : { mode: 'responder', username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as {
        token?: string;
        user?: AuthUser;
        error?: string;
      } | null;

      if (!res.ok || !data?.token || !data.user) {
        setAuthError(data?.error || t.opsAuthError);
        return;
      }

      setPasscode('');
      setPassword('');
      setSetupRequired(false);
      onAuthSuccess(data.token, data.user);
    } catch {
      setAuthError(t.opsAuthError);
    } finally {
      setAuthSubmitting(false);
    }
  };

  const beginEdit = (rec: ServerTriageCaseRecord) => {
    setEditingId(rec.id);
    setEditStatus(rec.status);
    setEditLevel(rec.level);
    setEditNotes(rec.responderNotes || '');
    setConfirmDeleteId(null);
  };

  const handleSaveCaseEdit = async (id: string) => {
    if (!authToken || savingCaseId) return;
    setSavingCaseId(id);
    setCasesError(null);

    try {
      const res = await fetch(`/api/triage/cases/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: editStatus,
          level: editLevel,
          responderNotes: editNotes,
        }),
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = (await res.json().catch(() => null)) as {
        caseRecord?: ServerTriageCaseRecord;
        error?: string;
      } | null;
      if (!res.ok || !data?.caseRecord) {
        setCasesError(data?.error || t.aiFallbackError);
        return;
      }

      setCases((prev) => prev.map((c) => (c.id === id ? data.caseRecord! : c)));
      setEditingId(null);
      onCaseUpdated(mapServerRecordToTriageResult(data.caseRecord, language));
    } catch {
      setCasesError(t.aiFallbackError);
    } finally {
      setSavingCaseId(null);
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!authToken || deletingCaseId) return;
    setDeletingCaseId(id);
    setCasesError(null);
    try {
      const res = await fetch(`/api/triage/cases/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setCasesError(data?.error || t.aiFallbackError);
        return;
      }
      setCases((prev) => prev.filter((c) => c.id !== id));
      setConfirmDeleteId(null);
      if (editingId === id) setEditingId(null);
      onCaseDeleted(id);
    } catch {
      setCasesError(t.aiFallbackError);
    } finally {
      setDeletingCaseId(null);
    }
  };

  const handleAddResponder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || addingResponder) return;
    setTeamError(null);
    setAddingResponder(true);
    try {
      const res = await fetch('/api/auth/responders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: newUsername,
          displayName: newDisplayName,
          password: newPassword,
          role: newRole,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        responder?: ResponderAccount;
        error?: string;
      } | null;
      if (!res.ok || !data?.responder) {
        setTeamError(data?.error || t.opsAuthError);
        return;
      }
      setResponders((prev) => [data.responder!, ...prev]);
      setNewUsername('');
      setNewDisplayName('');
      setNewPassword('');
    } catch {
      setTeamError(t.opsAuthError);
    } finally {
      setAddingResponder(false);
    }
  };

  const handleDeleteResponder = async (id: string) => {
    if (!authToken) return;
    try {
      const res = await fetch(`/api/auth/responders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        setResponders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // Ignore error
    }
  };

  const statusText = (status: CaseStatus) =>
    status === 'open'
      ? t.statusOpen
      : status === 'dispatched'
      ? t.statusDispatched
      : t.statusResolved;

  const totalCount = cases.length;
  const criticalCount = cases.filter((c) => c.level === 'critical').length;
  const openCount = cases.filter((c) => c.status === 'open').length;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ops-modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="no-print fixed inset-0 z-50 bg-black/65 flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="a11y-surface bg-[#FAF8F4] w-full sm:max-w-4xl max-h-[92vh] rounded-t-2xl sm:rounded-xl border-2 border-[#0D5240] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#0D5240] text-white border-b-2 border-[#B58E46] flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Shield className="w-5 h-5 text-[#E6C77A] shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <h2
                    id="ops-modal-title"
                    className="font-display text-base sm:text-lg font-extrabold truncate"
                  >
                    {t.opsTitle}
                  </h2>
                  <p className="text-xs text-[#E6C77A] truncate">{t.opsSubtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {authUser && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="btn-interactive min-h-[38px] px-3 py-1.5 rounded-lg bg-[#06221A] hover:bg-red-800 border border-[#C59B43]/50 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">{t.opsLogoutBtn}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.modalClose}
                  className="btn-interactive min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {!authToken ? (
                <div className="max-w-md mx-auto bg-white border-2 border-slate-300 rounded-xl p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#082D23] text-[#E6C77A] flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-extrabold text-[#082D23]">
                        {setupRequired ? t.opsSetupTitle : t.opsLoginTitle}
                      </h3>
                      {authStatusLoading && (
                        <p className="text-xs text-slate-500">...</p>
                      )}
                    </div>
                  </div>

                  {setupRequired && (
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50 border border-amber-300 rounded-lg p-3">
                      {t.opsSetupDesc}
                    </p>
                  )}

                  {!setupRequired && (
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200 rounded-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('admin');
                          setAuthError(null);
                        }}
                        className={`min-h-[38px] rounded-md text-xs font-bold cursor-pointer transition-colors ${
                          loginMode === 'admin'
                            ? 'bg-[#082D23] text-white'
                            : 'text-slate-800 hover:bg-white/70'
                        }`}
                      >
                        {t.opsAdminTab}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginMode('responder');
                          setAuthError(null);
                        }}
                        className={`min-h-[38px] rounded-md text-xs font-bold cursor-pointer transition-colors ${
                          loginMode === 'responder'
                            ? 'bg-[#082D23] text-white'
                            : 'text-slate-800 hover:bg-white/70'
                        }`}
                      >
                        {t.opsResponderTab}
                      </button>
                    </div>
                  )}

                  {authError && (
                    <div
                      role="alert"
                      className="bg-red-50 border border-red-400 text-red-900 rounded-lg p-3 text-xs font-semibold flex items-start gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {setupRequired || loginMode === 'admin' ? (
                      <div className="space-y-1.5">
                        <label
                          htmlFor="ops-passcode"
                          className="block text-xs font-bold text-slate-800"
                        >
                          {t.opsPasscodeLabel}
                        </label>
                        <input
                          id="ops-passcode"
                          type="password"
                          value={passcode}
                          onChange={(e) => setPasscode(e.target.value)}
                          placeholder={t.opsPasscodePlaceholder}
                          required
                          minLength={setupRequired ? 8 : 1}
                          className="w-full min-h-[44px] rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#082D23]"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="ops-username"
                            className="block text-xs font-bold text-slate-800"
                          >
                            {t.opsUsernameLabel}
                          </label>
                          <input
                            id="ops-username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full min-h-[44px] rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#082D23]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label
                            htmlFor="ops-password"
                            className="block text-xs font-bold text-slate-800"
                          >
                            {t.opsPasswordLabel}
                          </label>
                          <input
                            id="ops-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full min-h-[44px] rounded-lg border-2 border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-[#082D23]"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={authSubmitting}
                      className="btn-interactive w-full min-h-[46px] px-4 py-2.5 bg-[#082D23] hover:bg-[#0E4A3A] disabled:opacity-65 text-white font-bold text-sm rounded-lg border-2 border-[#C59B43] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {authSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>{setupRequired ? t.opsSetupBtn : t.opsLoginBtn}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* Signed-in Bar & Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-300 rounded-xl p-3.5 flex items-center justify-between sm:col-span-1">
                      <div>
                        <p className="text-[11px] font-bold text-slate-500">
                          {authUser?.role === 'admin' ? t.opsRoleAdmin : t.opsRoleResponder}
                        </p>
                        <p className="text-sm font-extrabold text-[#082D23] truncate">
                          {authUser?.displayName}
                        </p>
                      </div>
                      {authUser?.role === 'admin' && (
                        <button
                          type="button"
                          onClick={() => setTeamOpen((prev) => !prev)}
                          className="btn-interactive min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#082D23] hover:text-white border border-slate-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title={t.opsTeamTitle}
                        >
                          <Users className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>

                    <div className="bg-white border border-slate-300 rounded-xl p-3.5">
                      <p className="text-[11px] font-bold text-slate-500">{t.opsStatsTotal}</p>
                      <p className="text-xl font-extrabold text-[#082D23] tabular-nums">
                        {totalCount}
                      </p>
                    </div>
                    <div className="bg-white border border-red-300 rounded-xl p-3.5">
                      <p className="text-[11px] font-bold text-red-700">{t.opsStatsCritical}</p>
                      <p className="text-xl font-extrabold text-red-800 tabular-nums">
                        {criticalCount}
                      </p>
                    </div>
                    <div className="bg-white border border-amber-300 rounded-xl p-3.5">
                      <p className="text-[11px] font-bold text-amber-800">{t.opsStatsOpen}</p>
                      <p className="text-xl font-extrabold text-amber-900 tabular-nums">
                        {openCount}
                      </p>
                    </div>
                  </div>

                  {/* Admin Responder Team Management */}
                  {authUser?.role === 'admin' && teamOpen && (
                    <div className="bg-white border-2 border-[#C59B43] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-sm font-extrabold text-[#082D23] flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-[#B88A2E]" />
                          <span>{t.opsTeamTitle}</span>
                        </h3>
                      </div>

                      {teamError && (
                        <p className="text-xs font-bold text-red-700">{teamError}</p>
                      )}

                      <form
                        onSubmit={handleAddResponder}
                        className="grid grid-cols-1 sm:grid-cols-5 gap-2.5"
                      >
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder={t.opsUsernameLabel}
                          required
                          className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-xs"
                        />
                        <input
                          type="text"
                          value={newDisplayName}
                          onChange={(e) => setNewDisplayName(e.target.value)}
                          placeholder={t.opsDisplayNameLabel}
                          required
                          className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-xs"
                        />
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t.opsPasswordLabel}
                          minLength={8}
                          required
                          className="min-h-[40px] rounded-lg border border-slate-300 px-3 text-xs"
                        />
                        <select
                          value={newRole}
                          onChange={(e) =>
                            setNewRole(e.target.value as 'responder' | 'admin')
                          }
                          className="min-h-[40px] rounded-lg border border-slate-300 px-2.5 text-xs bg-white"
                        >
                          <option value="responder">{t.opsRoleResponder}</option>
                          <option value="admin">{t.opsRoleAdmin}</option>
                        </select>
                        <button
                          type="submit"
                          disabled={addingResponder}
                          className="btn-interactive min-h-[40px] px-3 rounded-lg bg-[#082D23] text-white text-xs font-bold cursor-pointer"
                        >
                          {t.opsAddResponderBtn}
                        </button>
                      </form>

                      {teamLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#082D23]" />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {responders.map((r) => (
                            <div
                              key={r.id}
                              className="inline-flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                            >
                              <span className="font-bold text-[#082D23]">
                                {r.displayName}
                              </span>
                              <span className="text-slate-500">({r.username})</span>
                              <button
                                type="button"
                                onClick={() => void handleDeleteResponder(r.id)}
                                className="text-red-700 hover:text-red-900 cursor-pointer"
                                aria-label={t.deleteCaseBtn}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search & Filters */}
                  <div className="bg-white border border-slate-300 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-4 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 start-3 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t.opsSearchPlaceholder}
                        className="w-full min-h-[40px] rounded-lg border border-slate-300 ps-9 pe-3 text-xs font-medium focus:outline-none focus:border-[#082D23]"
                      />
                    </div>

                    <select
                      value={levelFilter}
                      onChange={(e) => setLevelFilter(e.target.value as 'all' | TriageLevel)}
                      className="sm:col-span-2 min-h-[40px] rounded-lg border border-slate-300 px-2.5 text-xs font-semibold bg-white"
                    >
                      <option value="all">{t.opsAllLevels}</option>
                      <option value="critical">Critical / أحمر</option>
                      <option value="urgent">Urgent / أصفر</option>
                      <option value="stable">Stable / أخضر</option>
                    </select>

                    <select
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value as 'all' | HaramZone)}
                      className="sm:col-span-2 min-h-[40px] rounded-lg border border-slate-300 px-2.5 text-xs font-semibold bg-white"
                    >
                      <option value="all">{t.opsAllZones}</option>
                      {Object.entries(HARAM_ZONES).map(([k, info]) => (
                        <option key={k} value={k}>
                          {info.labels[language]}
                        </option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as 'all' | CaseStatus)}
                      className="sm:col-span-2 min-h-[40px] rounded-lg border border-slate-300 px-2.5 text-xs font-semibold bg-white"
                    >
                      <option value="all">{t.opsAllStatuses}</option>
                      <option value="open">{t.statusOpen}</option>
                      <option value="dispatched">{t.statusDispatched}</option>
                      <option value="resolved">{t.statusResolved}</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => void fetchCases()}
                      disabled={casesLoading}
                      className="sm:col-span-2 btn-interactive min-h-[40px] px-3 rounded-lg bg-[#082D23] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${casesLoading ? 'animate-spin' : ''}`}
                      />
                      <span>{t.opsRefreshBtn}</span>
                    </button>
                  </div>

                  {casesError && (
                    <div
                      role="alert"
                      className="bg-red-50 border border-red-400 text-red-900 rounded-lg p-3 text-xs font-bold"
                    >
                      {casesError}
                    </div>
                  )}

                  {/* Cases List */}
                  {casesLoading && cases.length === 0 ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-7 h-7 animate-spin text-[#082D23]" />
                    </div>
                  ) : cases.length === 0 ? (
                    <div className="bg-white border border-slate-300 rounded-xl p-8 text-center text-sm font-semibold text-slate-600">
                      {t.opsNoCases}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cases.map((rec) => {
                        const isEditing = editingId === rec.id;
                        const isConfirmingDel = confirmDeleteId === rec.id;
                        return (
                          <div
                            key={rec.id}
                            className="bg-white border-2 border-slate-300 rounded-xl p-4 space-y-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-extrabold tabular-nums text-[#082D23]">
                                    {rec.id}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded border text-[11px] font-extrabold ${LEVEL_BADGE[rec.level]}`}
                                  >
                                    {rec.level.toUpperCase()}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded border text-[11px] font-bold ${STATUS_BADGE[rec.status]}`}
                                  >
                                    {statusText(rec.status)}
                                  </span>
                                  <span className="text-slate-500 font-semibold">
                                    {HARAM_ZONES[rec.zone].labels[language]}
                                    {rec.locationDetail ? ` (${rec.locationDetail})` : ''}
                                  </span>
                                  <span className="text-slate-400 tabular-nums">
                                    {new Date(rec.createdAt).toLocaleString()}
                                  </span>
                                </div>

                                <h4 className="font-display text-sm sm:text-base font-extrabold text-[#111D18]">
                                  {rec.categoryTitle}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                  {rec.symptoms}
                                </p>
                                {rec.gpsLocation && (
                                  <p className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D5240] bg-[#F2EDE2] border border-[#DDD4C2] rounded-md px-2.5 py-1 tabular-nums">
                                    <MapPin className="w-3.5 h-3.5 text-[#B58E46]" aria-hidden="true" />
                                    <span>
                                      {t.gpsLabelShort}: {rec.gpsLocation.lat.toFixed(5)},{' '}
                                      {rec.gpsLocation.lng.toFixed(5)}
                                      {rec.gpsLocation.accuracy !== null
                                        ? ` (±${rec.gpsLocation.accuracy}m)`
                                        : ''}
                                    </span>
                                  </p>
                                )}
                                {rec.responderNotes && !isEditing && (
                                  <p className="text-xs bg-slate-100 border border-slate-200 rounded-md px-3 py-1.5 text-slate-800 font-medium">
                                    <strong>{t.responderNotesLabel}: </strong>
                                    {rec.responderNotes}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    onLoadCaseToWorkspace(
                                      mapServerRecordToTriageResult(rec, language)
                                    );
                                    onClose();
                                  }}
                                  className="btn-interactive min-h-[36px] px-3 py-1.5 rounded-lg bg-[#082D23] hover:bg-[#0E4A3A] text-white text-xs font-bold cursor-pointer"
                                >
                                  {t.opsLoadToCardBtn}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    isEditing ? setEditingId(null) : beginEdit(rec)
                                  }
                                  className="btn-interactive min-h-[36px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <ClipboardCheck className="w-3.5 h-3.5" />
                                  <span>{t.statusLabel}</span>
                                </button>

                                {isConfirmingDel ? (
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={deletingCaseId === rec.id}
                                      onClick={() => void handleDeleteCase(rec.id)}
                                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-red-700 text-white text-xs font-bold cursor-pointer"
                                    >
                                      {t.confirmDeleteText}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                                    >
                                      {t.cancelBtn}
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteId(rec.id)}
                                    aria-label={t.deleteCaseBtn}
                                    className="btn-interactive min-h-[36px] min-w-[36px] px-2 rounded-lg bg-red-50 hover:bg-red-700 text-red-700 hover:text-white border border-red-200 flex items-center justify-center cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {isEditing && (
                              <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                <div className="sm:col-span-3 space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    {t.statusLabel}
                                  </label>
                                  <select
                                    value={editStatus}
                                    onChange={(e) =>
                                      setEditStatus(e.target.value as CaseStatus)
                                    }
                                    className="w-full min-h-[38px] rounded-lg border border-slate-300 px-2.5 text-xs font-semibold bg-white"
                                  >
                                    <option value="open">{t.statusOpen}</option>
                                    <option value="dispatched">{t.statusDispatched}</option>
                                    <option value="resolved">{t.statusResolved}</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-3 space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    {t.printCardPriority}
                                  </label>
                                  <select
                                    value={editLevel}
                                    onChange={(e) =>
                                      setEditLevel(e.target.value as TriageLevel)
                                    }
                                    className="w-full min-h-[38px] rounded-lg border border-slate-300 px-2.5 text-xs font-semibold bg-white"
                                  >
                                    <option value="critical">Critical</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="stable">Stable</option>
                                  </select>
                                </div>

                                <div className="sm:col-span-4 space-y-1">
                                  <label className="block text-[11px] font-bold text-slate-700">
                                    {t.responderNotesLabel}
                                  </label>
                                  <input
                                    type="text"
                                    value={editNotes}
                                    onChange={(e) => setEditNotes(e.target.value)}
                                    placeholder={t.opsNotesPlaceholder}
                                    maxLength={1000}
                                    className="w-full min-h-[38px] rounded-lg border border-slate-300 px-3 text-xs"
                                  />
                                </div>

                                <div className="sm:col-span-2 flex items-end">
                                  <button
                                    type="button"
                                    disabled={savingCaseId === rec.id}
                                    onClick={() => void handleSaveCaseEdit(rec.id)}
                                    className="btn-interactive w-full min-h-[38px] px-3 rounded-lg bg-[#082D23] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    {savingCaseId === rec.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5 text-[#E6C77A]" />
                                    )}
                                    <span>
                                      {savingCaseId === rec.id
                                        ? t.opsSavingBtn
                                        : t.opsSaveBtn}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
