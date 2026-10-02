'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Search as SearchIcon, Filter } from 'lucide-react';
import { api, Contestant, Status } from '@/lib/api';
import { startSmartPoll } from '@/lib/poll';

const CATEGORIES = ['all', 'Solo Junior', 'Solo Senior', 'Group/Duet', 'Modelling'] as const;
type Cat = (typeof CATEGORIES)[number];

const STATUS_STYLES: Record<Status, { label: string; dot: string; text: string; border: string }> = {
  ON_STAGE: { label: 'ON STAGE', dot: 'bg-red-500', text: 'text-red-300', border: 'border-red-500/60' },
  UP_NEXT: { label: 'UP NEXT', dot: 'bg-brand-neon', text: 'text-brand-neon', border: 'border-brand-neon/50' },
  COMPLETED: { label: 'COMPLETED', dot: 'bg-emerald-500', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  SKIPPED: { label: 'SKIPPED', dot: 'bg-gray-500', text: 'text-gray-300', border: 'border-gray-500/40' },
  PENDING: { label: 'PENDING', dot: 'bg-brand-gold/70', text: 'text-brand-gold/80', border: 'border-brand-gold/30' },
};

export default function SchedulePage() {
  const [list, setList] = useState<Contestant[]>([]);
  const [cat, setCat] = useState<Cat>('all');
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const liveRowRef = useRef<HTMLDivElement | null>(null);
  const [showJumpBtn, setShowJumpBtn] = useState(false);

    async function load() {
    try {
      const data = await api.schedule(cat === 'all' ? undefined : cat);
      setList(data);
      setErr('');
    } catch (e) {
      setErr(String(e));
    } finally {
      setLoading(false);
    }
  }
    useEffect(() => {
    setLoading(true);
    const stop = startSmartPoll(load);
    return stop;
  }, [cat]);

    // Find the contestant who is currently ON_STAGE
  const liveContestant = useMemo(
    () => list.find((c) => c.status === 'ON_STAGE') ?? null,
    [list],
  );

  // Show the jump button only when there IS a live contestant AND they're not in view
  useEffect(() => {
    if (!liveContestant) {
      setShowJumpBtn(false);
      return;
    }

    function checkVisible() {
      const el = liveRowRef.current;
      if (!el) {
        setShowJumpBtn(true);
        return;
      }
      const rect = el.getBoundingClientRect();
      const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
      setShowJumpBtn(!inView);
    }

    checkVisible();
    window.addEventListener('scroll', checkVisible, { passive: true });
    return () => window.removeEventListener('scroll', checkVisible);
  }, [liveContestant, list]);

  function jumpToLive() {
    liveRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(needle) ||
        String(c.seq).includes(needle) ||
        c.city.toLowerCase().includes(needle),
    );
  }, [list, q]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    list.forEach((c) => {
      map[c.status] = (map[c.status] || 0) + 1;
    });
    return map;
  }, [list]);

  return (
    <main className="min-h-screen pb-16">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-brand-gold/25">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-brand-gold/40 p-2 text-brand-gold transition hover:bg-brand-gold/10 hover:scale-105"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-amber" />
            <h1 className="font-display text-xl md:text-2xl tracking-[0.25em] text-gold-gradient">
              SCHEDULE
            </h1>
          </div>
          {liveContestant && (
            <button
              onClick={jumpToLive}
              className="flex items-center gap-1.5 rounded-full border border-red-500/60 bg-red-600/20 px-3 py-1 text-[10px] font-bold tracking-widest text-red-200 transition hover:bg-red-600/40 hover:scale-105"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </button>
          )}
          <div className="ml-auto text-[10px] uppercase tracking-widest text-brand-gold/60">
            {filtered.length} shown
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-5">

        {/* Search */}
        <div className="relative">
          <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, seq, or city…"
            className="w-full rounded-full border border-brand-gold/30 bg-black/50 backdrop-blur pl-11 pr-4 py-3 text-brand-goldbright placeholder-brand-gold/40 outline-none focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30 transition"
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <Filter size={14} className="text-brand-gold/60 shrink-0" />
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={[
                  'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide whitespace-nowrap',
                  'transition-all duration-200',
                  active
                    ? 'border-brand-gold bg-gradient-to-br from-brand-gold to-brand-amber text-black glow-gold'
                    : 'border-brand-gold/30 bg-black/40 text-brand-gold/80 hover:border-brand-gold/60 hover:scale-105',
                ].join(' ')}
              >
                {c === 'all' ? 'All' : c}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest">
          {Object.entries(counts).map(([k, v]) => (
            <span
              key={k}
              className={[
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 border bg-black/40',
                STATUS_STYLES[k as Status]?.border ?? 'border-brand-gold/30',
                STATUS_STYLES[k as Status]?.text ?? 'text-brand-gold',
              ].join(' ')}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[k as Status]?.dot ?? 'bg-brand-gold'}`} />
              {STATUS_STYLES[k as Status]?.label ?? k} · {v}
            </span>
          ))}
        </div>

        {/* List */}
               {loading && list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-brand-gold/30 border-t-brand-gold animate-spin" />
            <p className="text-brand-gold/70 text-sm">Loading contestants…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-brand-gold/60 text-sm">
            {list.length === 0 ? 'No contestants yet.' : 'No matches for your search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((c) => {
              const s = STATUS_STYLES[c.status];
              const isLive = c.status === 'ON_STAGE';
              return (
                <div
                  key={c.id}
                  ref={isLive ? liveRowRef : null}
                  className={[
                    'group relative overflow-hidden rounded-2xl p-4 border backdrop-blur',
                    'bg-gradient-to-br from-brand-red/15 to-black/70',
                    'transition-all duration-300 hover:scale-[1.03]',
                    isLive
                      ? 'border-red-500/70 glow-red animate-pulse-slow'
                      : c.status === 'UP_NEXT'
                      ? 'border-brand-neon/50 glow-neon'
                      : 'border-brand-gold/25 hover:border-brand-gold/60',
                  ].join(' ')}
                >
                  {isLive && (
                    <span className="absolute top-2 right-2 rounded-full bg-red-600 text-white text-[9px] font-bold tracking-widest px-2 py-0.5 animate-pulse">
                      LIVE
                    </span>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />

                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-brand-gold/40 bg-black/60 font-display text-lg text-brand-goldbright">
                      {String(c.seq).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-goldbright truncate text-base">
                        {c.name}
                      </p>
                      <p className="text-xs text-brand-gold/60 truncate">
                        {c.category} · {c.city}
                      </p>
                    </div>
                    <span
                      className={[
                        'shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold tracking-widest border',
                        s.border, s.text, 'bg-black/50',
                      ].join(' ')}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${c.status === 'ON_STAGE' ? 'animate-pulse' : ''}`} />
                      {s.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Jump-to-Live button */}
      {showJumpBtn && liveContestant && (
        <button
          onClick={jumpToLive}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white text-xs font-bold tracking-widest px-4 py-2.5 shadow-[0_0_24px_rgba(239,68,68,0.6)] transition hover:scale-105 active:scale-95"
        >
          <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
          JUMP TO LIVE
        </button>
      )}

      {err && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-sm rounded-lg bg-red-900/90 border border-red-500/50 p-3 text-xs text-red-100">
          ⚠️ {err}
        </div>
      )}
    </main>
  );
}