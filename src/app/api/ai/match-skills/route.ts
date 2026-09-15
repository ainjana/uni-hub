import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { matchMentorsForQuery } from '@/lib/ai/skill-matcher';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const matches = await matchMentorsForQuery(query.trim(), session?.userId);

    return NextResponse.json({
      success: true,
      query,
      count: matches.length,
      matches,
    });
  } catch (error: any) {
    console.error('Skill match error:', error);
    return NextResponse.json({ error: 'Failed to process skill matching' }, { status: 500 });
  }
}
