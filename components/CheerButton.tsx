'use client';

import { useState } from 'react';
import { Hand, PartyPopper } from 'lucide-react';
import { api } from '@/lib/api';

interface Props {
  contestantId: string;
  initialCount?: number;
  size?: 'sm' | 'lg';
}

export default function CheerButton({ contestantId, initialCount = 0, size = 'lg' }: Props) {
  const [count, setCount] = useState(initialCount);
  const [popping, setPopping] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleCheer() {
    setCount((c) => c + 1);
    setPopping(true);
    setTimeout(() => setPopping(false), 400);

    if (sending) return;
    setSending(true);
    try {
      const res = await api.cheer(contestantId);
      setCount(res.count);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Cheer failed:', err);
    } finally {
      setSending(false);
    }
  }

  const isLarge = size === 'lg';

  return (
    <button
      type="button"
      onClick={handleCheer}
      aria-label={`Cheer for contestant ${contestantId}`}
      className={[
        'group relative inline-flex items-center gap-2 font-bold rounded-full overflow-hidden',
        'bg-gradient-to-br from-brand-goldbright via-brand-gold to-brand-amber text-black',
        'shadow-lg shadow-brand-gold/30',
        'transition-all duration-200 ease-out',
        'hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-brand-gold/60',
        'focus:outline-none focus:ring-2 focus:ring-brand-neon',
        isLarge ? 'px-7 py-3.5 text-lg' : 'px-4 py-2 text-sm',
      ].join(' ')}
    >
      {/* Shine sweep */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <span className={popping ? 'animate-cheer-pop inline-block' : 'inline-block relative'}>
        <Hand size={isLarge ? 22 : 16} strokeWidth={2.5} />
      </span>

      <span className="relative font-display tracking-[0.15em]">CHEER</span>

      <span className="relative inline-flex items-center gap-1 tabular-nums bg-black/25 rounded-full px-2.5 py-0.5 text-sm">
        <PartyPopper size={12} strokeWidth={2.5} />
        {count}
      </span>
    </button>
  );
}