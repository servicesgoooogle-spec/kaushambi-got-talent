import { MapPin, Mic2 } from 'lucide-react';
import CheerButton from './CheerButton';
import type { Contestant } from '@/lib/api';

interface Props {
  contestant: Contestant | null;
  cheerCount?: number;
}

export default function NowPerforming({ contestant, cheerCount = 0 }: Props) {
  if (!contestant) {
    return (
      <section className="px-4 max-w-4xl mx-auto">
        <div className="relative card-gold p-8 md:p-12 text-center glow-red">
          <div className="absolute inset-0 noise-overlay" />
          <Mic2 size={40} className="mx-auto text-brand-gold/60 mb-3" />
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-brand-gold/60 mb-2">
            Live Stage
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-gold-gradient">
            STAGE IS WARMING UP
          </h2>
          <p className="mt-3 text-sm text-brand-gold/70">
            Performances will appear here once the show begins.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 max-w-4xl mx-auto">
      <div className="relative card-gold p-6 md:p-12 text-center overflow-hidden glow-gold">
        {/* Decorative layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/30 via-transparent to-brand-gold/10" />
        <div className="absolute inset-0 stripes-bg opacity-50" />
        <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-brand-gold/20 blur-3xl animate-float" />

        {/* LIVE badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/50 px-3 py-1 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-red-300">
            LIVE
          </span>
        </div>

        {/* Seq badge */}
        <div className="absolute top-4 right-4 font-display text-xs md:text-sm tracking-[0.2em] text-brand-gold/80 bg-black/50 border border-brand-gold/30 rounded-full px-3 py-1">
          #{String(contestant.seq).padStart(3, '0')}
        </div>

        <p className="relative text-[10px] md:text-xs uppercase tracking-[0.5em] text-brand-gold/70 mb-3 mt-6">
          Now Performing
        </p>

        <h2 className="relative font-display text-4xl md:text-6xl lg:text-7xl leading-none text-gold-gradient text-glow-gold break-words px-2">
          {contestant.name.toUpperCase()}
        </h2>

        <div className="relative mt-5 flex flex-wrap gap-2 justify-center text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/40 border border-brand-gold/40 px-4 py-1.5 text-brand-goldbright backdrop-blur font-semibold tracking-wide">
            <Mic2 size={12} />
            {contestant.category.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/40 border border-brand-gold/40 px-4 py-1.5 text-brand-goldbright backdrop-blur font-semibold tracking-wide">
            <MapPin size={12} />
            {contestant.city.toUpperCase()}
          </span>
        </div>

        <div className="relative mt-8">
          <CheerButton contestantId={contestant.id} initialCount={cheerCount} />
        </div>
      </div>
    </section>
  );
}