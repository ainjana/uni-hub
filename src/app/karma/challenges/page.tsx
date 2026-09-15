'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChallengesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/karma?tab=challenges');
  }, [router]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-[#0A0C0E]">
      <div className="h-8 w-8 border-2 border-accentLime border-t-transparent animate-spin" />
    </div>
  );
}
