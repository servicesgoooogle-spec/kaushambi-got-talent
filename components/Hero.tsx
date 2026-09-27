import { Star, Calendar, MapPin, Trophy } from 'lucide-react';
import Countdown from './Countdown';

export default function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[720px] flex items-center">
      {/* Layered backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-darkred via-brand-deep to-brand-black" />
      <div className="absolute inset-0 stripes-bg" />
      <div className="absolute inset-0 noise-overlay" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-[10%] h-40 w-40 rounded-full bg-red-600/20 blur-3xl animate-float" />
      <div className="absolute top-40 right-[15%] h-56 w-56 rounded-full bg-amber-500/20 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-[40%] h-32 w-32 rounded-full bg-amber-400/10 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Big radial spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(251,191,36,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(185,28,28,0.25),_transparent_60%)]" />

      {/* Content */}
      <div className="relative w-full px-4 py-12 md:py-20 max-w-5xl mx-auto text-center">

        {/* Top ribbon */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-brand-red/40 via-brand-gold/20 to-brand-red/40 border border-brand-gold/40 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
          <span className="text-[10px] md:text-xs uppercase tracking-[0.35em] text-brand-gold/90 font-semibold">
            ABC Dance Studio &amp; Sachin Pop Present
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-brand-gold animate-pulse" />
        </div>

        {/* Title — poster style */}
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight">
          <span className="block text-fire-gradient drop-shadow-[0_0_30px_rgba(185,28,28,0.6)]">
            KAUSHAMBI
          </span>
          <span className="block text-gold-gradient text-glow-gold">
            GOT TALENT
          </span>
        </h1>

        {/* Season badge */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-brand-gold/60" />
          <span className="font-display text-2xl md:text-3xl text-brand-gold tracking-[0.2em] text-glow-gold">
            SEASON 2
          </span>
          <span className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-brand-gold/60" />
        </div>

        <p className="mt-3 text-sm md:text-base uppercase tracking-[0.4em] text-brand-gold/70">
          Grand Finale
        </p>

        {/* Celebrity judge pill */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-brand-gold/40 bg-gradient-to-r from-brand-red/30 via-black/60 to-brand-red/30 backdrop-blur px-5 py-3 glow-red">
          <Star size={20} className="text-brand-gold fill-brand-gold drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest text-brand-gold/70">
              Celebrity Judge
            </p>
            <p className="font-bold text-brand-goldbright text-base md:text-lg">
              Vaishnavi Patil
            </p>
          </div>
        </div>

        {/* Event info */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
          <InfoChip icon={<Calendar size={16} />} label="Date" value="2 Oct 2026" />
          <InfoChip icon={<MapPin size={16} />} label="Venue" value="Lakhan Lal Resort, Bharwari" />
          <InfoChip icon={<Trophy size={16} />} label="Prize Pool" value="Up to ₹50,000" />
        </div>

        {/* Countdown */}
        <div className="mt-10">
          <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-brand-gold/60 mb-4">
            ⚡ Countdown to Grand Finale ⚡
          </p>
          <Countdown />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-black to-transparent pointer-events-none" />
    </section>
  );
}

function InfoChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-brand-gold/25 bg-gradient-to-br from-brand-red/20 to-black/60 backdrop-blur px-4 py-3 transition-all duration-300 hover:border-brand-gold/60 hover:scale-[1.03] hover:glow-red">
      <span className="text-brand-amber transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <div className="text-left min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-brand-gold/60">
          {label}
        </p>
        <p className="text-sm md:text-base font-semibold text-brand-goldbright truncate">
          {value}
        </p>
      </div>
    </div>
  );
}