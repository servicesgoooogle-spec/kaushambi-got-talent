'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, LogOut, Play, Check, SkipForward, RotateCcw,
  MessageCircle, AlertTriangle, Shield, Mic2, MapPin, RefreshCw,
} from 'lucide-react';
import { api, Contestant, PublicState, Status } from '@/lib/api';
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
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'ACTIVE' | 'DONE'>('all');

  async function load() {
    try {
      const s = await api.publicState();
      setState(s);
      setErr('');
    } catch (e) {
      setErr(String(e));
    }
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

        {/* Contestant rows */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <p className="text-center text-brand-gold/50 text-sm py-10">
              Nothing to show.
            </p>
          )}

          {filtered.map((c) => (
            <Row
              key={c.id}
              contestant={c}
              busy={busyId === c.id}
              onStart={() => doAction(c.id, () => api.startPerformance(token, c.id))}
              onComplete={() => doAction(c.id, () => api.markCompleted(token, c.id))}
              onSkip={() => doAction(c.id, () => api.skipContestant(token, c.id))}
              onRequeue={() => doAction(c.id, () => api.requeueContestant(token, c.id))}
            />
          ))}
        </div>
      </div>

      {err && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-md rounded-lg bg-red-900/90 border border-red-500/50 p-3 text-xs text-red-100 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
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
}: {
  contestant: Contestant;
  busy: boolean;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
  onRequeue: () => void;
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
            onClick={onStart}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-brand-gold to-brand-amber text-black text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Play size={12} /> Start
          </button>

          <button
            onClick={onComplete}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600/80 text-white text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Check size={12} /> Done
          </button>

          <button
            onClick={onSkip}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg bg-zinc-700/80 text-white text-xs font-bold px-3 py-1.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <SkipForward size={12} /> Skip
          </button>

          <button
            onClick={onRequeue}
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-gold/40 text-brand-gold text-xs font-bold px-3 py-1.5 transition hover:scale-105 hover:bg-brand-gold/10 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={12} /> Requeue
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