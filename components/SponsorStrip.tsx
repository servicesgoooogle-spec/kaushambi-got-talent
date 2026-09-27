'use client';

import { Award } from 'lucide-react';

interface Sponsor {
  name: string;
  tagline?: string;
}

const SPONSORS: Sponsor[] = [
  { name: 'Welco', tagline: 'Official Partner' },
  { name: 'Bholanath Sarraf', tagline: 'Jewellery Partner' },
  { name: 'ABC Dance Studio', tagline: 'Organizer' },
  { name: 'Lakhan Lal Resort', tagline: 'Venue Partner' },
  { name: 'Sachin Pop', tagline: 'Presented by' },
];

export default function SponsorStrip() {
  const loop = [...SPONSORS, ...SPONSORS];

  return (
    <section className="relative my-12 md:my-16 py-8 border-y border-brand-gold/20 bg-gradient-to-r from-black via-brand-darkred/40 to-black overflow-hidden">
      <div className="absolute inset-0 stripes-bg opacity-40" />

      <div className="relative flex items-center justify-center gap-3 mb-5">
        <Award size={14} className="text-brand-gold" />
        <p className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-brand-gold/80">
          Our Sponsors &amp; Partners
        </p>
        <Award size={14} className="text-brand-gold" />
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-black to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-black to-transparent z-10" />

        <div className="flex w-max animate-[sponsorScroll_35s_linear_infinite] hover:[animation-play-state:paused]">
          {loop.map((s, i) => (
            <div key={`${s.name}-${i}`} className="mx-3 md:mx-4 shrink-0">
              <div className="group flex flex-col items-center justify-center min-w-[160px] md:min-w-[200px] h-24 md:h-28 px-5 rounded-2xl border border-brand-gold/25 bg-gradient-to-br from-brand-red/20 to-black/70 backdrop-blur transition-all duration-300 hover:border-brand-goldbright hover:scale-105 hover:glow-gold">
                <span className="font-display text-lg md:text-xl text-gold-gradient tracking-wider text-center">
                  {s.name.toUpperCase()}
                </span>
                {s.tagline && (
                  <span className="text-[10px] md:text-xs text-brand-gold/60 mt-1 uppercase tracking-widest">
                    {s.tagline}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes sponsorScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}