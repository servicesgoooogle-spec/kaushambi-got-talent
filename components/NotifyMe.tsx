'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, Check, X } from 'lucide-react';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(os: OneSignalLike) => void | Promise<void>>;
    OneSignal?: OneSignalLike;
  }
}

interface OneSignalLike {
  User: {
    PushSubscription: {
      id?: string | null;
      optedIn?: boolean;
      optIn: () => Promise<void>;
    };
  };
  login: (externalId: string) => Promise<void>;
  logout: () => Promise<void>;
  Notifications: {
    requestPermission: () => Promise<void>;
    permission: boolean;
  };
}

export default function NotifyMe() {
  const [ready, setReady] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [contestantId, setContestantId] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  // Wait for OneSignal to be ready
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (os) => {
      window.OneSignal = os;
      setReady(true);
      try {
        if (os.User?.PushSubscription?.optedIn) setOptedIn(true);
      } catch {
        // ignore
      }
    });
  }, []);

  // Check if this device is already subscribed to a contestant ID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('kgt_contestant_id');
    if (saved) setContestantId(saved);
  }, []);

  async function handleSubscribe() {
    const os = window.OneSignal;
    if (!os) {
      setMsg('Notification service loading — try again in a moment.');
      setStatus('error');
      return;
    }

    const id = contestantId.trim().toUpperCase();
    if (!id) {
      setMsg('Please enter your contestant ID (e.g., C042).');
      setStatus('error');
      return;
    }

    setStatus('busy');
    setMsg('');

    try {
      // 1. Ask for browser permission
      await os.Notifications.requestPermission();

      // 2. Wait a moment for opt-in to take effect
      await new Promise((r) => setTimeout(r, 600));

      // 3. Link this device to the contestant ID on OneSignal's servers
      await os.login(id);

      localStorage.setItem('kgt_contestant_id', id);
      setOptedIn(true);
      setShowInput(false);
      setStatus('done');
      setMsg(`You're all set! We'll notify you when #${id} is up.`);
    } catch (e) {
      setStatus('error');
      setMsg(String(e).slice(0, 120));
    }
  }

  async function handleUnsubscribe() {
    const os = window.OneSignal;
    try {
      if (os) await os.logout();
      localStorage.removeItem('kgt_contestant_id');
      setOptedIn(false);
      setStatus('idle');
      setMsg('');
      setContestantId('');
    } catch (e) {
      setMsg(String(e).slice(0, 120));
    }
  }

  return (
    <section className="px-4 max-w-4xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-brand-neon/40 bg-gradient-to-br from-brand-neon/10 via-black/70 to-brand-gold/10 p-5 md:p-6 backdrop-blur">
        <div className="absolute inset-0 stripes-bg opacity-30" />

        <div className="relative flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {optedIn ? (
                <BellRing size={18} className="text-brand-neon" />
              ) : (
                <Bell size={18} className="text-brand-neon" />
              )}
              <h3 className="font-display tracking-[0.2em] text-brand-gold text-lg md:text-xl">
                {optedIn ? "YOU'RE SUBSCRIBED" : 'GET NOTIFIED'}
              </h3>
            </div>
            <p className="text-xs md:text-sm text-brand-gold/70">
              {optedIn
                ? 'We will send you a push when your turn is coming up.'
                : 'Tap the bell to get a push notification when your performance is next.'}
            </p>
          </div>

          <div className="shrink-0">
            {optedIn ? (
              <button
                onClick={handleUnsubscribe}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/50 bg-red-600/20 hover:bg-red-600/30 text-red-200 text-sm font-bold px-4 py-2.5 transition hover:scale-105 active:scale-95"
              >
                <X size={14} />
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={() => setShowInput((s) => !s)}
                disabled={!ready}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-neon to-cyan-500 text-black text-sm font-bold px-4 py-2.5 transition hover:scale-105 hover:glow-neon active:scale-95 disabled:opacity-50"
              >
                <Bell size={14} />
                {ready ? 'Notify Me' : 'Loading…'}
              </button>
            )}
          </div>
        </div>

        {/* Input area */}
        {!optedIn && showInput && (
          <div className="relative mt-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={contestantId}
              onChange={(e) => setContestantId(e.target.value)}
              placeholder="Your contestant ID (e.g., C042)"
              className="flex-1 rounded-full border border-brand-gold/40 bg-black/60 px-4 py-2.5 text-brand-goldbright placeholder-brand-gold/40 outline-none focus:border-brand-neon focus:ring-2 focus:ring-brand-neon/30 transition"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubscribe();
              }}
            />
            <button
              onClick={handleSubscribe}
              disabled={status === 'busy' || !contestantId.trim()}
              className="rounded-full bg-gradient-to-br from-brand-gold to-brand-amber text-black font-bold px-5 py-2.5 transition hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {status === 'busy' ? 'Enabling…' : 'Enable'}
            </button>
          </div>
        )}

        {/* Status message */}
        {msg && (
          <div
            className={[
              'relative mt-3 rounded-lg px-3 py-2 text-xs flex items-start gap-2',
              status === 'done'
                ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-200'
                : status === 'error'
                ? 'bg-red-500/15 border border-red-500/40 text-red-200'
                : 'bg-brand-gold/10 border border-brand-gold/30 text-brand-gold',
            ].join(' ')}
          >
            {status === 'done' && <Check size={14} className="shrink-0 mt-0.5" />}
            <span>{msg}</span>
          </div>
        )}

        {/* Small tip for iOS */}
        {!optedIn && (
          <p className="relative mt-3 text-[10px] text-brand-gold/50">
            📱 <strong>iPhone users:</strong> tap <em>Share</em> → <em>Add to Home Screen</em>, then open the app from your home screen to enable notifications.
          </p>
        )}
      </div>
    </section>
  );
}