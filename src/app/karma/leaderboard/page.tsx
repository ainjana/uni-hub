'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LeaderboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/karma?tab=leaderboard');
  }, [router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0A0C0E]">
      <div className="h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin" />
    </div>
  );
}
