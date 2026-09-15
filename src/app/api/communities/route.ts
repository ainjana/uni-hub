import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();

    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: { posts: true, members: true },
        },
        members: session ? { where: { userId: session.userId } } : false,
      },
      orderBy: { memberCount: 'desc' },
    });

    const mapped = communities.map((c) => ({
      ...c,
      isJoined: session ? c.members.length > 0 : false,
    }));

    return NextResponse.json({ communities: mapped });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch communities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { communityId, action } = await req.json(); // action: 'JOIN' | 'LEAVE'

    if (action === 'JOIN') {
      await prisma.communityMember.upsert({
        where: {
          communityId_userId: {
            communityId,
            userId: session.userId,
          },
        },
        create: {
          communityId,
          userId: session.userId,
        },
        update: {},
      });

      await prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { increment: 1 } },
      });

      return NextResponse.json({ success: true, message: 'Joined community' });
    } else {
      await prisma.communityMember.deleteMany({
        where: { communityId, userId: session.userId },
      });

      await prisma.community.update({
        where: { id: communityId },
        data: { memberCount: { decrement: 1 } },
      });

      return NextResponse.json({ success: true, message: 'Left community' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
  }
}
