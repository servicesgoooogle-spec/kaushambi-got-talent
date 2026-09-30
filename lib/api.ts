/**
 * lib/api.ts
 * Typed wrapper around the KGT-S2 Apps Script backend.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

if (!API_URL) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ NEXT_PUBLIC_API_URL is missing in .env.local');
}

// ---------- Types ----------

export type Status =
  | 'PENDING'
  | 'ON_STAGE'
  | 'UP_NEXT'
  | 'COMPLETED'
  | 'SKIPPED';

export interface Contestant {
  id: string;
  name: string;
  seq: number;
  category: string;
  city: string;
  phone: string;
  status: Status;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  pushed: boolean;
}

export interface PublicState {
  settings: Record<string, string>;
  nowPerforming: Contestant | null;
  upNext: Contestant[];
  contestants: Contestant[];
  cheers: Record<string, number>;
  updatedAt: string;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ---------- Core fetch ----------

async function getJson<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(API_URL);
  url.searchParams.set('action', action);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), { method: 'GET', cache: 'no-store' });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok || json.data === undefined) {
    throw new Error(json.error || 'API error');
  }
  return json.data;
}

async function postJson<T>(body: Record<string, unknown>): Promise<T> {
  // Apps Script POST needs text/plain to avoid CORS preflight
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.ok || json.data === undefined) {
    throw new Error(json.error || 'API error');
  }
  return json.data;
}

// ---------- Public endpoints ----------

export const api = {
  ping: () => getJson<{ ok: boolean; ts: string }>('ping'),

  publicState: () => getJson<PublicState>('publicState'),

  schedule: (category?: string) =>
    getJson<Contestant[]>('schedule', category ? { category } : {}),

  contestant: (id: string) => getJson<Contestant>('contestant', { id }),

  cheers: () => getJson<Record<string, number>>('cheers'),

 announcements: () => getJson<Announcement[]>('announcements'),

  addAnnouncement: (token: string, title: string, body: string) =>
    postJson<{
      ok: boolean;
      id: string;
      pushed: boolean;
      announcement: Announcement;
    }>({
      action: 'addAnnouncement',
      token,
      title,
      body,
    }),

  deleteAnnouncement: (token: string, id: string) =>
    postJson<{ ok: boolean; deleted: string }>({
      action: 'deleteAnnouncement',
      token,
      id,
    }),

  cheer: (contestantId: string) =>
    postJson<{ contestantId: string; count: number }>({
      action: 'cheer',
      contestantId,
    }),

  login: (username: string, password: string) =>
    postJson<{ token: string; username: string; expiresIn: number }>({
      action: 'login',
      username,
      password,
    }),

  startPerformance: (token: string, contestantId: string) =>
    postJson<PublicState>({ action: 'startPerformance', token, contestantId }),

  markCompleted: (token: string, contestantId: string) =>
    postJson<PublicState>({ action: 'markCompleted', token, contestantId }),

  skipContestant: (token: string, contestantId: string) =>
    postJson<PublicState>({ action: 'skipContestant', token, contestantId }),

  requeueContestant: (token: string, contestantId: string) =>
    postJson<PublicState>({ action: 'requeueContestant', token, contestantId }),

  setSetting: (token: string, key: string, value: string) =>
    postJson<{ ok: boolean }>({ action: 'setSetting', token, key, value }),

  resetAll: (token: string) =>
    postJson<{ ok: boolean }>({ action: 'resetAll', token }),
};