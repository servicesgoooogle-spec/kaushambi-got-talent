'use client';

import { useEffect, useState } from 'react';

const TARGET = new Date('2026-10-02T16:00:00+05:30').getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function calc(): TimeLeft {
  const now = Date.now();
  const diff = TARGET - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: false,
  };
}

export default function Countdown() {
  const [t, setT] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t === null) {
    return (
      <div className="flex gap-2 md:gap-4 justify-center">
        {['Days', 'Hours', 'Mins', 'Secs'].map((l) => (
          <TimeBox key={l} value="--" label={l} muted />
        ))}
      </div>
    );
  }

  if (t.done) {
    return (
      <div className="text-center text-2xl md:text-3xl font-display tracking-widest text-gold-gradient animate-pulse-slow">
        🎉 THE SHOW HAS BEGUN 🎉
      </div>
    );
  }

  return (
    <div className="flex gap-2 md:gap-4 justify-center">
      <TimeBox value={t.days} label="Days" />
      <TimeBox value={t.hours} label="Hours" />
      <TimeBox value={t.minutes} label="Mins" />
      <TimeBox value={t.seconds} label="Secs" highlight />
    </div>
  );
}

function TimeBox({
  value,
  label,
  muted = false,
  highlight = false,
}: {
  value: number | string;
  label: string;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'group relative rounded-2xl overflow-hidden',
        'w-[70px] md:w-[100px] py-3 md:py-4',
        'border bg-gradient-to-b from-brand-red/30 to-black/80 backdrop-blur',
        highlight
          ? 'border-brand-gold glow-pulse'
          : 'border-brand-gold/30',
        'transition-all duration-300 hover:scale-110 hover:border-brand-goldbright',
      ].join(' ')}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />

      <div
        className={[
          'font-display text-3xl md:text-5xl leading-none tracking-wider',
          muted ? 'text-brand-gold/30' : 'text-gold-gradient',
        ].join(' ')}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {typeof value === 'number' ? String(value).padStart(2, '0') : value}
      </div>

      <div className="mt-1 text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-brand-gold/70">
        {label}
      </div>

      {/* Bottom glow on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-brand-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}