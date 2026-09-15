import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const transactions = await prisma.karmaTransaction.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({
      totalKarma: profile?.totalKarma || 0,
      studentsHelped: profile?.studentsHelped || 0,
      transactions,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
