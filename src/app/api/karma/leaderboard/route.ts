import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboards } from '@/lib/karma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'weekly'; // 'weekly' (7) | 'monthly' (30)
    const days = period === 'monthly' ? 30 : 7;

    const data = await getLeaderboards(days);
    return NextResponse.json({ period, ...data });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
