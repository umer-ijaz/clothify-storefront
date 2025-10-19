'use client';

import { Analytics } from '@vercel/analytics/react';
import { useEffect, useState } from 'react';

export default function AnalyticsWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <Analytics />;
}