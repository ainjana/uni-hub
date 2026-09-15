import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();

    const challenges = await prisma.karmaChallenge.findMany({
      where: { isActive: true },
      include: session
        ? {
            progress: {
              where: { userId: session.userId },
            },
          }
        : undefined,
    });

    const formatted = challenges.map((ch) => {
      const userProgress = (ch as any).progress?.[0];
      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        rewardKarma: ch.rewardKarma,
        durationDays: ch.durationDays,
        targetCount: ch.targetCount,
        challengeType: ch.challengeType,
        currentCount: userProgress?.currentCount || 0,
        isCompleted: userProgress?.isCompleted || false,
        claimedAt: userProgress?.claimedAt || null,
      };
    });

    return NextResponse.json({ challenges: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
