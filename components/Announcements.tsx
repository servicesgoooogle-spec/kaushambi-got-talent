'use client';

import { Megaphone, Sparkles } from 'lucide-react';
import type { Announcement } from '@/lib/api';

interface Props {
  announcements: Announcement[];
}

export default function Announcements({ announcements }: Props) {
  // Hide the whole section if there's nothing to show
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <section className="px-4 max-w-4xl mx-auto">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <Megaphone size={16} className="text-brand-amber" />
        <h3 className="font-display text-lg md:text-xl tracking-[0.3em] text-brand-gold">
          ANNOUNCEMENTS
        </h3>
        <span className="flex-1 h-px bg-gradient-to-r from-brand-gold/40 to-transparent" />
        <span className="text-[10px] uppercase tracking-widest text-brand-gold/50">
          {announcements.length}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((a, i) => (
          <AnnouncementCard key={a.id} announcement={a} highlight={i === 0} />
        ))}
      </div>
    </section>
  );
}

function AnnouncementCard({
  announcement: a,
  highlight,
}: {
  announcement: Announcement;
  highlight: boolean;
}) {
  return (
    <div
      className={[
        'group relative overflow-hidden rounded-2xl p-5',
        'border backdrop-blur transition-all duration-300',
        'hover:scale-[1.01]',
        highlight
          ? 'border-brand-gold/60 bg-gradient-to-br from-brand-red/30 via-black/70 to-brand-gold/10 glow-gold'
          : 'border-brand-gold/25 bg-gradient-to-br from-brand-red/15 to-black/70 hover:border-brand-gold/60',
      ].join(' ')}
    >
      {/* Top accent line */}
      <div
        className={[
          'absolute top-0 left-0 right-0 h-[2px]',
          highlight
            ? 'bg-gradient-to-r from-transparent via-brand-gold to-transparent'
            : 'bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent',
        ].join(' ')}
      />

      {/* Floating orb for the newest one */}
      {highlight && (
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-brand-gold/15 blur-3xl pointer-events-none animate-float" />
      )}

      {/* Latest badge */}
      {highlight && (
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={11} className="text-brand-gold" />
          <span className="text-[9px] font-bold tracking-[0.25em] text-brand-gold">
            LATEST
          </span>
        </div>
      )}

      {/* Title (optional) */}
      {a.title && (
        <h4 className="font-display text-xl md:text-2xl text-gold-gradient tracking-wide mb-1 leading-tight">
          {a.title.toUpperCase()}
        </h4>
      )}

      {/* Body — preserves line breaks the admin types */}
      <p className="text-sm md:text-base text-brand-gold/90 whitespace-pre-line leading-relaxed">
        {a.body}
      </p>

      {/* Timestamp */}
      <p className="mt-3 text-[10px] uppercase tracking-widest text-brand-gold/40">
        {formatTime(a.createdAt)}
      </p>
    </div>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = Date.now();
    const diffMin = Math.floor((now - d.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} hr ago`;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}