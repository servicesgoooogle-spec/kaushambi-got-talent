import Link from 'next/link';
import { Calendar, Search, Settings } from 'lucide-react';

const LINKS = [
  { href: '/schedule', label: 'Schedule', Icon: Calendar, accent: 'from-brand-gold/30 to-brand-amber/10', ring: 'group-hover:ring-brand-gold' },
  { href: '/search', label: 'Find Me', Icon: Search, accent: 'from-brand-neon/20 to-brand-gold/10', ring: 'group-hover:ring-brand-neon' },
  { href: '/admin', label: 'Admin', Icon: Settings, accent: 'from-brand-red/30 to-black/60', ring: 'group-hover:ring-brand-red' },
];

export default function QuickLinks() {
  return (
    <section className="px-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {LINKS.map(({ href, label, Icon, accent, ring }) => (
          <Link
            key={href}
            href={href}
            className={[
              'group relative overflow-hidden flex flex-col items-center justify-center gap-3',
              'rounded-2xl border border-brand-gold/30 bg-gradient-to-br',
              accent,
              'py-6 md:py-8 px-3',
              'ring-2 ring-transparent',
              'transition-all duration-300',
              'hover:scale-105 hover:border-brand-goldbright',
              'active:scale-95',
              ring,
            ].join(' ')}
          >
            {/* Shine sweep on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <Icon
              size={30}
              strokeWidth={2}
              className="text-brand-goldbright transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6"
            />
            <span className="font-display text-xs md:text-sm tracking-[0.2em] text-brand-gold group-hover:text-brand-goldbright">
              {label.toUpperCase()}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}