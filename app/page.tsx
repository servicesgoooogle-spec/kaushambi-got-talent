'use client';

import { useEffect, useState } from 'react';
import { api, PublicState } from '@/lib/api';
import { startSmartPoll } from '@/lib/poll';

import Hero from '@/components/Hero';
import NowPerforming from '@/components/NowPerforming';
import UpNext from '@/components/UpNext';
import SponsorStrip from '@/components/SponsorStrip';
import QuickLinks from '@/components/QuickLinks';
import Footer from '@/components/Footer';
import NotifyMe from '@/components/NotifyMe';
import Announcements from '@/components/Announcements';

export default function Home() {
  const [state, setState] = useState<PublicState | null>(null);
  const [err, setErr] = useState<string>('');
  const [announcements, setAnnouncements] = useState<import('@/lib/api').Announcement[]>([]);

  async function load() {
    try {
      const [s, anns] = await Promise.all([
        api.publicState(),
        api.announcements(),
      ]);
      setState(s);
      setAnnouncements(anns);
      setErr('');
    } catch (e) {
      setErr(String(e));
    }
  }

  useEffect(() => {
    const stop = startSmartPoll(load);
    return stop;
  }, []);

  const nowId = state?.nowPerforming?.id;
  const nowCheers = nowId ? state?.cheers?.[nowId] ?? 0 : 0;

  return (
    <main className="min-h-screen pb-4">
      <Hero />

      <div className="mt-10 md:mt-14 space-y-10">
        <NowPerforming contestant={state?.nowPerforming ?? null} cheerCount={nowCheers} />

        <Announcements announcements={announcements} />

        <UpNext contestants={state?.upNext ?? []} />

        <NotifyMe />

        <SponsorStrip />

        <QuickLinks />
      </div>

      <Footer />

      {err && (
        <div className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:max-w-sm rounded-lg bg-red-900/90 border border-red-500/50 p-3 text-xs text-red-100">
          ⚠️ {err}
        </div>
      )}
    </main>
  );
}