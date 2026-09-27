'use client';

import { useEffect, useState } from 'react';
import { api, PublicState } from '@/lib/api';

export default function TestApiPage() {
  const [state, setState] = useState<PublicState | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .publicState()
      .then((s) => {
        setState(s);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  if (loading) return <pre className="p-8 text-brand-gold">Loading...</pre>;
  if (error) return <pre className="p-8 text-red-400">ERROR: {error}</pre>;

  return (
    <pre className="p-8 text-xs text-brand-gold overflow-auto">
      {JSON.stringify(state, null, 2)}
    </pre>
  );
}