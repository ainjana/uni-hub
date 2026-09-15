import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participant1Id: session.userId }, { participant2Id: session.userId }],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Populate participant profiles
    const populated = await Promise.all(
      conversations.map(async (c) => {
        const otherId = c.participant1Id === session.userId ? c.participant2Id : c.participant1Id;
        const otherUser = await prisma.user.findUnique({
          where: { id: otherId },
          include: { profile: true, college: true },
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: c.id,
            senderId: otherId,
            isRead: false,
          },
        });

        return {
          id: c.id,
          lastMessageAt: c.lastMessageAt,
          lastMessage: c.messages[0] || null,
          unreadCount,
          peer: otherUser,
        };
      })
    );

    return NextResponse.json({ conversations: populated });
  } catch (error: any) {
    console.error('Fetch conversations error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === session.userId) {
      return NextResponse.json({ error: 'Invalid participant' }, { status: 400 });
    }

    // Find or create conversation (ordering participant IDs deterministically)
    const [p1, p2] = [session.userId, targetUserId].sort();

    let conv = await prisma.conversation.findUnique({
      where: {
        participant1Id_participant2Id: {
          participant1Id: p1,
          participant2Id: p2,
        },
      },
    });

    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
        },
      });
    }

    return NextResponse.json({ success: true, conversation: conv });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to start conversation' }, { status: 500 });
  }
}
