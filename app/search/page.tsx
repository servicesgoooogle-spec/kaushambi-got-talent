'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search as SearchIcon, Clock, Hash, MapPin, Mic2 } from 'lucide-react';
import { api, Contestant, PublicState, Status } from '@/lib/api';
import { startSmartPoll } from '@/lib/poll';

const MIN_PER_ACT = 3; // assumed minutes per performance for ETA

const STATUS_LABELS: Record<Status, { text: string; color: string }> = {
  ON_STAGE: { text: 'On Stage Now 🔴', color: 'text-red-300' },
  UP_NEXT: { text: 'Up Next 🟡', color: 'text-brand-neon' },
  COMPLETED: { text: 'Completed ✅', color: 'text-emerald-300' },
  SKIPPED: { text: 'Skipped ⚪', color: 'text-gray-300' },
  PENDING: { text: 'Waiting ⏳', color: 'text-brand-gold/80' },
};

export default function SearchPage() {
  const [state, setState] = useState<PublicState | null>(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');

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

  const results = useMemo(() => {
    if (!state) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return state.contestants
      .filter(
        (c) =>
          c.name.toLowerCase().includes(needle) ||
          String(c.seq).includes(needle),
      )
      .sort((a, b) => a.seq - b.seq)
      .slice(0, 20);
  }, [state, q]);

  return (
    <main className="min-h-screen pb-16">
      <div className="sticky top-0 z-30 backdrop-blur-md bg-black/70 border-b border-brand-gold/25">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="rounded-full border border-brand-gold/40 p-2 text-brand-gold transition hover:bg-brand-gold/10 hover:scale-105"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-2">
            <SearchIcon size={18} className="text-brand-neon" />
            <h1 className="font-display text-xl md:text-2xl tracking-[0.25em] text-gold-gradient">
              FIND ME
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">

        <div className="text-center space-y-2">
          <p className="font-display text-3xl md:text-5xl text-fire-gradient leading-none">
            WHERE AM I IN THE QUEUE?
          </p>
          <p className="text-xs md:text-sm text-brand-gold/70">
            Type your name or sequence number
          </p>
        </div>

        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gold/60" />
          <input
            type="text"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Riya or 24"
            className="w-full rounded-full border-2 border-brand-gold/40 bg-black/60 backdrop-blur pl-12 pr-4 py-4 text-lg text-brand-goldbright placeholder-brand-gold/40 outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/20 transition"
          />
        </div>

        {q.trim() && results.length === 0 && (
          <p className="text-center text-brand-gold/60 text-sm py-8">
            No match found. Try another spelling or sequence number.
          </p>
        )}

        <div className="space-y-3">
          {results.map((c) => (
            <ResultCard key={c.id} contestant={c} state={state!} />
          ))}
        </div>
      </div>

      {err && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-sm rounded-lg bg-red-900/90 border border-red-500/50 p-3 text-xs text-red-100">
          ⚠️ {err}
        </div>
      )}
    </main>
  );
}

function ResultCard({ contestant, state }: { contestant: Contestant; state: PublicState }) {
  const status = STATUS_LABELS[contestant.status];
  const nowSeq = state.nowPerforming?.seq ?? 0;
  const ahead = Math.max(0, contestant.seq - nowSeq - 1);
  const etaMinutes = ahead * MIN_PER_ACT;
  const isNow = contestant.status === 'ON_STAGE';
  const isNext = contestant.status === 'UP_NEXT';

  return (
    <div
      className={[
        'relative overflow-hidden rounded-2xl p-5 border backdrop-blur',
        'bg-gradient-to-br from-brand-red/15 to-black/70',
        isNow ? 'border-red-500/60 glow-red' :
        isNext ? 'border-brand-neon/60 glow-neon' :
        'border-brand-gold/30',
      ].join(' ')}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brand-gold/50 bg-black/60 font-display text-2xl text-brand-goldbright">
          {String(contestant.seq).padStart(2, '0')}
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-display text-2xl md:text-3xl text-gold-gradient tracking-wide truncate">
            {contestant.name.toUpperCase()}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-brand-gold/70">
            <span className="inline-flex items-center gap-1">
              <Mic2 size={11} /> {contestant.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={11} /> {contestant.city}
            </span>
          </div>

          <p className={`mt-2 font-semibold text-sm ${status.color}`}>
            {status.text}
          </p>

          {!isNow && !isNext && contestant.status === 'PENDING' && (
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-brand-gold/25 bg-black/40 px-3 py-2">
                <p className="text-brand-gold/60 text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Hash size={10} /> Queue pos
                </p>
                <p className="text-brand-goldbright font-bold text-base">
                  {ahead === 0 ? 'You are next!' : `${ahead} ahead`}
                </p>
              </div>
              <div className="rounded-lg border border-brand-gold/25 bg-black/40 px-3 py-2">
                <p className="text-brand-gold/60 text-[10px] uppercase tracking-widest flex items-center gap-1">
                  <Clock size={10} /> Rough ETA
                </p>
                <p className="text-brand-goldbright font-bold text-base">
                  {etaMinutes === 0 ? 'Now' : `~${etaMinutes} min`}
                </p>
              </div>
            </div>
          )}

          {isNext && (
            <p className="mt-3 text-xs text-brand-neon font-semibold">
              🎤 Get ready backstage — you're on deck!
            </p>
          )}

          {isNow && (
            <p className="mt-3 text-xs text-red-300 font-semibold">
              🎉 You are on stage right now — go rock it!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}