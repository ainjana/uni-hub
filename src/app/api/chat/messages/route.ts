import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.participant1Id !== session.userId && conversation.participant2Id !== session.userId)
    ) {
      return NextResponse.json({ error: 'Unauthorized access to conversation' }, { status: 403 });
    }

    // Mark unread messages from other user as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          include: { profile: true },
        },
      },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { conversationId, text } = body;

    if (!conversationId || !text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Conversation ID and message text required' }, { status: 400 });
    }

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv || (conv.participant1Id !== session.userId && conv.participant2Id !== session.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const recipientId = conv.participant1Id === session.userId ? conv.participant2Id : conv.participant1Id;

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.userId,
        text: text.trim(),
        isRead: false,
      },
      include: {
        sender: { include: { profile: true } },
      },
    });

    // Update conversation last message time
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    // Notify recipient
    await prisma.notification.create({
      data: {
        recipientId,
        title: `Message from ${session.fullName}`,
        message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
        link: '/chat',
        type: 'CONNECTION',
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
