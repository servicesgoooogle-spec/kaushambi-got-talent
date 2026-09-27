import type { Contestant } from '@/lib/api';

interface Props {
  contestants: Contestant[];
}

export default function UpNext({ contestants }: Props) {
  if (!contestants || contestants.length === 0) {
    return null;
  }

  return (
    <section className="px-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm uppercase tracking-[0.3em] text-brand-gold/70">
          On Deck
        </h3>
        <span className="text-xs text-brand-gold/50">
          Next {contestants.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {contestants.map((c, i) => (
          <div
            key={c.id}
            className={[
              'rounded-xl border border-brand-gold/25 bg-black/40 p-4',
              'transition-all duration-200 ease-out',
              'hover:border-brand-gold/60 hover:bg-black/60 hover:scale-[1.02]',
            ].join(' ')}
          >
            <div className="flex items-center gap-3">
              <span
                className={[
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  'text-sm font-bold',
                  i === 0
                    ? 'bg-brand-gold text-black'
                    : 'bg-brand-gold/20 text-brand-gold border border-brand-gold/40',
                ].join(' ')}
              >
                {String(c.seq).padStart(2, '0')}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-gold truncate">
                  {c.name}
                </p>
                <p className="text-xs text-brand-gold/60 truncate">
                  {c.category} · {c.city}
                </p>
              </div>
              {i === 0 && (
                <span className="text-[10px] font-bold tracking-widest text-brand-neon">
                  NEXT
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}