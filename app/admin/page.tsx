'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmModal, { ConfirmOptions } from '@/components/ConfirmModal';
import {
  ArrowLeft, LogOut, Play, Check, SkipForward, RotateCcw,
  MessageCircle, AlertTriangle, Shield, Mic2, MapPin, RefreshCw,
  Megaphone, Send, Trash2, UserCheck, UserX,
} from 'lucide-react';
import { api, Contestant, PublicState, Status, Announcement } from '@/lib/api';
import { startSmartPoll } from '@/lib/poll';

const STORAGE_KEY = 'kgt_admin_token';
const STORAGE_USER = 'kgt_admin_user';

const WHATSAPP_TEMPLATE = (name: string) =>
  `Hi ${name}, this is Kaushambi Got Talent. Your performance is coming up — please be ready backstage. 🎤`;

function whatsappLink(phone: string, name: string) {
  const clean = phone.replace(/\D/g, '');
  const withCC = clean.length === 10 ? '91' + clean : clean;
  return `https://wa.me/${withCC}?text=${encodeURIComponent(WHATSAPP_TEMPLATE(name))}`;
}

const STATUS_STYLES: Record<Status, string> = {
  ON_STAGE: 'border-red-500/60 text-red-300 bg-red-500/10',
  UP_NEXT: 'border-brand-neon/60 text-brand-neon bg-brand-neon/10',
  COMPLETED: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
  SKIPPED: 'border-gray-500/40 text-gray-300 bg-gray-500/10',
  PENDING: 'border-brand-gold/30 text-brand-gold/80 bg-brand-gold/5',
};

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [ready, setReady] = useState(false);

  // restore session
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const u = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_USER) : null;
    if (t) setToken(t);
    if (u) setUsername(u);
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!token) {
    return (
      <LoginScreen
        onLogin={(tk, un) => {
          localStorage.setItem(STORAGE_KEY, tk);
          localStorage.setItem(STORAGE_USER, un);
          setToken(tk);
          setUsername(un);
        }}
      />
    );
  }

  return (
    <Dashboard
      token={token}
      username={username}
      onLogout={() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_USER);
        setToken(null);
        setUsername('');
      }}
    />
  );
}

// ============================================================
// LOGIN
// ============================================================
function LoginScreen({ onLogin }: { onLogin: (t: string, u: string) => void }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const res = await api.login(u.trim(), p);
      onLogin(res.token, res.username);
    } catch (e) {
      setErr(String(e).replace(/^Error:\s*/, ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="relative w-full max-w-sm card-gold p-8 glow-gold">
        <div className="absolute inset-0 noise-overlay" />
        <div className="relative text-center mb-6">
          <Shield size={36} className="mx-auto text-brand-gold mb-3" />
          <h1 className="font-display text-2xl md:text-3xl tracking-[0.25em] text-gold-gradient">
            STAGE MANAGER
          </h1>
          <p className="text-xs text-brand-gold/60 mt-1">
            Authorised access only
          </p>
        </div>

        <form onSubmit={submit} className="relative space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1 block">
              Username
            </label>
            <input
              type="text"
              autoComplete="username"
              value={u}
              onChange={(e) => setU(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-gold/30 bg-black/60 px-3 py-2.5 text-brand-goldbright outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-brand-gold/70 mb-1 block">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={p}
              onChange={(e) => setP(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-gold/30 bg-black/60 px-3 py-2.5 text-brand-goldbright outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
            />
          </div>

          {err && (
            <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg p-2">
              ⚠️ {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-gradient-to-br from-brand-goldbright via-brand-gold to-brand-amber text-black font-bold py-3 tracking-wider disabled:opacity-50 transition hover:scale-[1.02] active:scale-[0.98] glow-gold"
          >
            {busy ? 'Signing in…' : 'SIGN IN'}
          </button>
        </form>

        <Link
          href="/"
          className="relative mt-6 flex items-center justify-center gap-1 text-xs text-brand-gold/60 hover:text-brand-gold transition"
        >
          <ArrowLeft size={12} /> Back to public site
        </Link>
      </div>
    </main>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({
  token,
  username,
  onLogout,
}: {
  token: string;
  username: string;
  onLogout: () => void;
}) {
  const [state, setState] = useState<PublicState | null>(null);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { onConfirm: () => void }) | null>(null);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'ACTIVE' | 'DONE'>('all');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annBusy, setAnnBusy] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);



  async function load() {
    try {
      const [s, anns] = await Promise.all([
        api.publicState(),
        api.announcements(),
      ]);
      setState(s);
      setAnnouncements(anns);
      setErr('');
    } catch (e) {
      setErr(String(e));
    } finally {
      setFirstLoad(false);
    }
  }

    function askConfirm(
    options: ConfirmOptions,
    onConfirm: () => void,
  ) {
    setConfirmState({ ...options, onConfirm });
  }

  useEffect(() => {
    const stop = startSmartPoll(load);
    return stop;
  }, []);


  async function doAction(id: string, fn: () => Promise<PublicState>) {
    setBusyId(id);
    try {
      const next = await fn();
      setState(next);
      setErr('');
    } catch (e) {
      setErr(String(e).replace(/^Error:\s*/, ''));
      // Token expired?
      if (String(e).includes('token')) onLogout();
    } finally {
      setBusyId(null);
    }
  }

    async function toggleCheckIn(c: Contestant) {
    setBusyId(c.id);
    try {
      const res = await api.setCheckedIn(token, c.id, !c.checkedIn);
      // optimistic update
      setState((s) =>
        s
          ? {
              ...s,
              contestants: s.contestants.map((x) =>
                x.id === c.id ? { ...x, checkedIn: res.checkedIn } : x,
              ),
            }
          : s,
      );
    } catch (e) {
      setErr(String(e).replace(/^Error:\s*/, ''));
    } finally {
      setBusyId(null);
    }
  }

    async function sendAnnouncement() {
    if (!annBody.trim()) {
      setErr('Message body is required');
      return;
    }
    setAnnBusy(true);
    try {
      const res = await api.addAnnouncement(token, annTitle.trim(), annBody.trim());
      setAnnTitle('');
      setAnnBody('');
      await load();
      if (res.pushed) {
        alert('✅ Announcement posted and push sent to all subscribed devices.');
      } else {
        alert('✅ Announcement posted. (Push was not sent — check OneSignal keys.)');
      }
    } catch (e) {
      setErr(String(e).replace(/^Error:\s*/, ''));
    } finally {
      setAnnBusy(false);
    }
  }

  async function deleteAnnouncementById(id: string) {
    askConfirm(
      {
        title: 'Delete Announcement',
        message: `Delete announcement ${id}?`,
        details: [
          'This removes it from the home page immediately',
          'Push notification (if any) cannot be undone',
          'This cannot be undone',
        ],
        confirmLabel: 'Delete',
        variant: 'danger',
      },
      async () => {
        setAnnBusy(true);
        try {
          await api.deleteAnnouncement(token, id);
          await load();
        } catch (e) {
          setErr(String(e).replace(/^Error:\s*/, ''));
        } finally {
          setAnnBusy(false);
        }
      },
    );
  }

    const totalCount = state?.contestants?.length ?? 0;
  const checkedInCount = (state?.contestants ?? []).filter(
    (c) => c.checkedIn === true,
  ).length;
  const doneCount = (state?.contestants ?? []).filter(
    (c) => c.status === 'COMPLETED',
  ).length;

  const filtered = (state?.contestants ?? []).filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'PENDING') return c.status === 'PENDING';
    if (filter === 'ACTIVE') return c.status === 'ON_STAGE' || c.status === 'UP_NEXT';
    if (filter === 'DONE') return c.status === 'COMPLETED' || c.status === 'SKIPPED';
    return true;
  }).sort((a, b) => a.seq - b.seq);

  const now = state?.nowPerforming;

  return (
    <main className="min-h-screen pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/80 border-b border-brand-gold/25">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-brand-gold/40 p-2 text-brand-gold transition hover:bg-brand-gold/10"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-brand-gold" />
            <h1 className="font-display text-lg md:text-xl tracking-[0.25em] text-gold-gradient">
              STAGE MANAGER
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={load}
              className="rounded-full border border-brand-gold/30 p-2 text-brand-gold transition hover:bg-brand-gold/10 hover:rotate-90"
              aria-label="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <span className="hidden sm:inline text-xs text-brand-gold/60">
              {username}
            </span>
            <button
              onClick={onLogout}
              className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 transition inline-flex items-center gap-1"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

        {/* Now performing banner */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-gold/40 bg-gradient-to-br from-brand-red/30 to-black/70 p-5 md:p-6">
          <div className="absolute inset-0 stripes-bg opacity-40" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-300 font-bold">
                Now Performing
              </span>
            </div>
            {now ? (
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="font-display text-3xl md:text-4xl text-gold-gradient tracking-wide">
                  {now.name.toUpperCase()}
                </p>
                <span className="text-xs text-brand-gold/60">
                  #{String(now.seq).padStart(3, '0')} · {now.category} · {now.city}
                </span>
              </div>
            ) : (
              <p className="text-brand-gold/60 text-sm">
                No one on stage right now.
              </p>
            )}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <div className="rounded-xl border border-brand-gold/30 bg-gradient-to-br from-brand-red/20 to-black/60 px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-brand-gold/60">
              Total
            </p>
            <p className="font-display text-2xl md:text-3xl text-gold-gradient leading-none mt-1">
              {totalCount}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-600/15 to-black/60 px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-emerald-300/80">
              Checked In
            </p>
            <p className="font-display text-2xl md:text-3xl text-emerald-300 leading-none mt-1">
              {checkedInCount}
            </p>
          </div>
          <div className="rounded-xl border border-brand-neon/40 bg-gradient-to-br from-brand-neon/15 to-black/60 px-3 py-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-brand-neon/80">
              Done
            </p>
            <p className="font-display text-2xl md:text-3xl text-brand-neon leading-none mt-1">
              {doneCount}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'ACTIVE', 'PENDING', 'DONE'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wider transition',
                filter === f
                  ? 'border-brand-gold bg-brand-gold text-black'
                  : 'border-brand-gold/30 text-brand-gold/80 hover:border-brand-gold/60 hover:scale-105',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : f === 'ACTIVE' ? 'On Stage / Next' : f === 'PENDING' ? 'Waiting' : 'Completed / Skipped'}
            </button>
          ))}
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-red-300/80 font-bold">
              Danger Zone
            </p>
            <p className="text-xs text-red-200/70">
              Reset every contestant back to PENDING and clear Now Performing. Use this after a test run.
            </p>
          </div>
          <button
            onClick={() =>
              askConfirm(
                {
                  title: 'Reset All Statuses',
                  message: `You are about to reset ALL contestants back to PENDING.`,
                  details: [
                    'Every contestant → PENDING',
                    'All check-in marks will be cleared',
                    'Now Performing will be cleared',
                    'No push notifications will be sent',
                    'This cannot be undone',
                  ],
                  confirmLabel: 'Reset Everything',
                  variant: 'danger',
                },
                () => {
                  setBusyId('__reset__');
                  api
                    .resetAll(token)
                    .then(() => load())
                    .catch((e) => setErr(String(e).replace(/^Error:\s*/, '')))
                    .finally(() => setBusyId(null));
                },
              )
            }
            disabled={busyId === '__reset__'}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-600/20 hover:bg-red-600/40 text-red-200 text-xs font-bold px-3 py-2 transition hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            <AlertTriangle size={14} />
            {busyId === '__reset__' ? 'Resetting…' : 'Reset All Statuses'}
          </button>
        </div>

              {/* Contestant rows */}
        <div className="space-y-2">
          {firstLoad && !state ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-brand-gold/30 border-t-brand-gold animate-spin" />
              <p className="text-brand-gold/70 text-sm">Loading contestants…</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-brand-gold/50 text-sm py-10">
              Nothing to show.
            </p>
          ) : null}

          {filtered.map((c) => (
                        <Row
              key={c.id}
              contestant={c}
              busy={busyId === c.id}
              onStart={() => doAction(c.id, () => api.startPerformance(token, c.id))}
              onComplete={() => doAction(c.id, () => api.markCompleted(token, c.id))}
              onSkip={() => doAction(c.id, () => api.skipContestant(token, c.id))}
              onRequeue={() => doAction(c.id, () => api.requeueContestant(token, c.id))}
              onToggleCheckIn={() => toggleCheckIn(c)}
              askConfirm={askConfirm}
            />
          ))}
        </div>

        {/* === Announcements Panel === */}
        <div className="rounded-2xl border border-brand-neon/40 bg-gradient-to-br from-brand-neon/5 via-black/70 to-brand-gold/5 p-5 md:p-6 backdrop-blur">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={18} className="text-brand-neon" />
            <h3 className="font-display text-lg md:text-xl tracking-[0.25em] text-brand-neon">
              ANNOUNCEMENTS
            </h3>
            <span className="flex-1 h-px bg-gradient-to-r from-brand-neon/50 to-transparent" />
            <span className="text-[10px] uppercase tracking-widest text-brand-gold/60">
              {announcements.length} active
            </span>
          </div>

          {/* Write form */}
          <div className="space-y-3 mb-6">
            <input
              type="text"
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="Title (optional) — e.g. 🏆 Winners Announced"
              maxLength={80}
              className="w-full rounded-lg border border-brand-gold/30 bg-black/60 px-3 py-2.5 text-brand-goldbright placeholder-brand-gold/40 outline-none focus:border-brand-neon focus:ring-2 focus:ring-brand-neon/30 transition"
            />
            <textarea
              value={annBody}
              onChange={(e) => setAnnBody(e.target.value)}
              placeholder="Write your announcement here. Line breaks are preserved on the home page."
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-brand-gold/30 bg-black/60 px-3 py-2.5 text-brand-goldbright placeholder-brand-gold/40 outline-none focus:border-brand-neon focus:ring-2 focus:ring-brand-neon/30 transition resize-y"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-[10px] text-brand-gold/50 sm:mr-auto">
                {annBody.length}/500 characters · A push will be sent to all subscribers
              </span>
              <button
                onClick={sendAnnouncement}
                disabled={annBusy || !annBody.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-brand-neon to-cyan-500 text-black text-sm font-bold px-5 py-2.5 transition hover:scale-105 hover:glow-neon active:scale-95 disabled:opacity-50"
              >
                <Send size={14} />
                {annBusy ? 'Sending…' : 'Send to All'}
              </button>
            </div>
          </div>

          {/* Existing announcements */}
          {announcements.length === 0 ? (
            <p className="text-center text-xs text-brand-gold/50 py-6">
              No announcements yet. Send your first one above.
            </p>
          ) : (
            <div className="space-y-2">
              {announcements.map((a, i) => (
                <div
                  key={a.id}
                  className={[
                    'flex items-start gap-3 rounded-xl border p-3',
                    i === 0
                      ? 'border-brand-gold/60 bg-brand-gold/5'
                      : 'border-brand-gold/20 bg-black/40',
                  ].join(' ')}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-[10px] font-mono text-brand-gold/50">
                        {a.id}
                      </span>
                      {i === 0 && (
                        <span className="text-[9px] font-bold tracking-widest text-brand-gold bg-brand-gold/10 border border-brand-gold/40 rounded px-1.5 py-0.5">
                          LATEST
                        </span>
                      )}
                      {a.pushed && (
                        <span className="text-[9px] text-brand-neon/80">
                          🔔 push sent
                        </span>
                      )}
                    </div>
                    {a.title && (
                      <p className="font-semibold text-brand-goldbright text-sm truncate">
                        {a.title}
                      </p>
                    )}
                    <p className="text-xs text-brand-gold/70 whitespace-pre-line line-clamp-3">
                      {a.body}
                    </p>
                    <p className="text-[10px] text-brand-gold/40 mt-1">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAnnouncementById(a.id)}
                    disabled={annBusy}
                    className="shrink-0 rounded-lg border border-red-500/40 bg-red-600/10 hover:bg-red-600/30 text-red-300 p-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    aria-label={`Delete ${a.id}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Placeholder — keeps grid layout consistent */}
        <div className="h-0" />

      </div>

      {err && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-md rounded-lg bg-red-900/90 border border-red-500/50 p-3 text-xs text-red-100 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

            {confirmState && (
        <ConfirmModal
          open={true}
          title={confirmState.title}
          message={confirmState.message}
          details={confirmState.details}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          variant={confirmState.variant}
          busy={busyId === '__reset__'}
          onCancel={() => setConfirmState(null)}
          onConfirm={() => {
            const fn = confirmState.onConfirm;
            setConfirmState(null);
            fn();
          }}
        />
      )}
    </main>
  );
}

function Row({
  contestant: c,
  busy,
  onStart,
  onComplete,
  onSkip,
  onRequeue,
  onToggleCheckIn,
  askConfirm,
}: {
  contestant: Contestant;
  busy: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onRequeue: () => void;
  onToggleCheckIn: () => void;
  askConfirm: (opts: ConfirmOptions, fn: () => void) => void;
}) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl border p-3 md:p-4 backdrop-blur',
        'bg-gradient-to-br from-black/60 to-brand-darkred/20',
        'transition-all duration-200',
        busy ? 'opacity-60' : 'hover:border-brand-gold/60',
        c.status === 'ON_STAGE' ? 'border-red-500/60 glow-red' :
        c.status === 'UP_NEXT' ? 'border-brand-neon/50' :
        'border-brand-gold/25',
      ].join(' ')}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Left: seq + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-black/60 font-display text-lg text-brand-goldbright">
            {String(c.seq).padStart(2, '0')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-brand-goldbright truncate">
              {c.name}
            </p>
            <p className="text-xs text-brand-gold/60 truncate flex items-center gap-2">
              <Mic2 size={10} /> {c.category}
              <MapPin size={10} /> {c.city}
            </p>
          </div>
          <span
            className={[
              'shrink-0 rounded-full border px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase',
              STATUS_STYLES[c.status],
            ].join(' ')}
          >
            {c.status.replace('_', ' ')}
          </span>
        </div>

        {/* Right: actions */}
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
          <button
                        onClick={() =>
              askConfirm(
                {
                  title: 'Start Performance',
                  message: `#${String(c.seq).padStart(3, '0')}  ${c.name}\n${c.category} · ${c.city}`,
                  details: [
                    'Any current performer will be marked COMPLETED',
                    `${c.name} will be set ON STAGE`,
                    'Next 2 acts auto-promote to UP NEXT',
                    'A push notification will be sent (if subscribed)',
                  ],
                  confirmLabel: 'Start Now',
                  variant: 'default',
                },
                onStart,
              )
            }
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-brand-gold to-brand-amber text-black text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play size={12} /> Start
          </button>

          <button
           onClick={() =>
              askConfirm(
                {
                  title: 'Mark Completed',
                  message: `#${String(c.seq).padStart(3, '0')}  ${c.name}`,
                  details: [
                    `${c.name} status → COMPLETED`,
                    'Now Performing banner clears if it was them',
                    'Next 2 acts auto-promote to UP NEXT',
                  ],
                  confirmLabel: 'Mark Done',
                  variant: 'success',
                },
                onComplete,
              )
            }
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/80 text-white text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Check size={12} /> Done
          </button>

          <button
            onClick={() =>
              askConfirm(
                {
                  title: 'Skip Contestant',
                  message: `#${String(c.seq).padStart(3, '0')}  ${c.name}`,
                  details: [
                    `${c.name} status → SKIPPED`,
                    'Removed from the live queue',
                    'Can be requeued later via the Requeue button',
                  ],
                  confirmLabel: 'Skip',
                  variant: 'danger',
                },
                onSkip,
              )
            }
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-700/80 text-white text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <SkipForward size={12} /> Skip
          </button>

          <button
            onClick={() =>
              askConfirm(
                {
                  title: 'Requeue Contestant',
                  message: `#${String(c.seq).padStart(3, '0')}  ${c.name}`,
                  details: [
                    `${c.name} status → PENDING`,
                    'Rejoins the queue at their original sequence',
                  ],
                  confirmLabel: 'Requeue',
                  variant: 'info',
                },
                onRequeue,
              )
            }
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-gold/40 text-brand-gold text-xs font-bold px-3 py-1.5 transition hover:scale-105 hover:bg-brand-gold/10 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={12} /> Requeue
          </button>

                    <button
            onClick={onToggleCheckIn}
            disabled={busy}
            className={[
              'inline-flex items-center gap-1 rounded-lg text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50 border',
              c.checkedIn
                ? 'border-emerald-500/60 bg-emerald-600/30 text-emerald-100 hover:bg-emerald-600/50'
                : 'border-brand-gold/40 text-brand-gold/80 hover:bg-brand-gold/10',
            ].join(' ')}
            title={c.checkedIn ? 'Mark as NOT arrived' : 'Mark as arrived backstage'}
          >
            {c.checkedIn ? <UserCheck size={12} /> : <UserX size={12} />}
            {c.checkedIn ? 'Arrived' : 'Check In'}
          </button>

          {c.phone && (
            <a
              href={whatsappLink(c.phone, c.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-green-600/90 text-white text-xs font-bold px-3 py-1.5 transition hover:scale-105 hover:bg-green-500 active:scale-95"
            >
              <MessageCircle size={12} /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

