/**
 * lib/poll.ts
 * Jittered polling that pauses when the tab is hidden.
 * Longer interval in dev to prevent laptop crashes.
 */

const IS_DEV = process.env.NODE_ENV !== 'production';

const BASE_INTERVAL = IS_DEV ? 20000 : 8000; // 20s dev, 8s prod
const JITTER = IS_DEV ? 6000 : 4000;         // ±6s dev, ±4s prod

export function nextPollDelay(): number {
  return BASE_INTERVAL + Math.floor(Math.random() * JITTER * 2) - JITTER;
}

export function startSmartPoll(fn: () => void | Promise<void>): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  async function tick() {
    if (stopped) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      try {
        await fn();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[poll] error:', err);
      }
    }
    if (stopped) return;
    timer = setTimeout(tick, nextPollDelay());
  }

  tick();

  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}