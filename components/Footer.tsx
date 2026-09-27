import { Phone, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-brand-gold/25 bg-gradient-to-b from-black to-brand-darkred overflow-hidden">
      <div className="absolute inset-0 stripes-bg opacity-30" />
      <div className="relative max-w-4xl mx-auto px-4 py-10 text-center space-y-4">

        <div className="flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-brand-gold" />
          <span className="font-display tracking-[0.3em] text-brand-gold/80 text-sm">
            STAY TUNED
          </span>
          <Sparkles size={16} className="text-brand-gold" />
        </div>

        <p className="text-sm text-brand-gold/80">
          For queries and backstage coordination
        </p>

        <a
          href="tel:+917408751569"
          className="inline-flex items-center gap-2 rounded-full border border-brand-gold/40 bg-gradient-to-r from-brand-red/30 via-black/60 to-brand-red/30 px-5 py-2.5 font-bold text-brand-goldbright text-lg transition-all duration-300 hover:scale-105 hover:glow-gold"
        >
          <Phone size={18} />
          +91 7408751569
        </a>

        <p className="text-xs text-brand-gold/50 pt-4">
          © 2026 ABC Dance Studio &amp; Sachin Pop · Kaushambi Got Talent Season 2
        </p>
      </div>
    </footer>
  );
}