import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'connected' | 'pending' | 'discover'

    // Fetch all connections involving user
    const userConnections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: session.userId }, { receiverId: session.userId }],
      },
      include: {
        requester: { include: { profile: { include: { skills: { include: { skill: true } } } }, college: true } },
        receiver: { include: { profile: { include: { skills: { include: { skill: true } } } }, college: true } },
      },
    });

    if (filter === 'connected') {
      const accepted = userConnections.filter((c) => c.status === 'ACCEPTED');
      const peers = accepted.map((c) => {
        const isRequester = c.requesterId === session.userId;
        const peer = isRequester ? c.receiver : c.requester;
        return {
          connectionId: c.id,
          student: peer,
          status: 'ACCEPTED',
        };
      });
      return NextResponse.json({ peers });
    }

    if (filter === 'pending') {
      const pendingReceived = userConnections.filter(
        (c) => c.receiverId === session.userId && c.status === 'PENDING'
      );
      const pendingSent = userConnections.filter(
        (c) => c.requesterId === session.userId && c.status === 'PENDING'
      );
      return NextResponse.json({
        received: pendingReceived.map((c) => ({ connectionId: c.id, student: c.requester })),
        sent: pendingSent.map((c) => ({ connectionId: c.id, student: c.receiver })),
      });
    }

    // Discover: all verified students except self, mapped with connection status
    const allStudents = await prisma.user.findMany({
      where: {
        id: { not: session.userId },
        isVerified: true,
        profile: { isNot: null },
      },
      include: {
        profile: {
          include: {
            skills: { include: { skill: true } },
            interests: { include: { interest: true } },
          },
        },
        college: true,
      },
    });

    const statusMap = new Map<string, { status: string; connectionId?: string; isSender: boolean }>();
    userConnections.forEach((c) => {
      const otherId = c.requesterId === session.userId ? c.receiverId : c.requesterId;
      statusMap.set(otherId, {
        status: c.status,
        connectionId: c.id,
        isSender: c.requesterId === session.userId,
      });
    });

    const discovered = allStudents.map((s) => {
      const conn = statusMap.get(s.id);
      let relationship = 'NOT_CONNECTED';
      if (conn) {
        if (conn.status === 'ACCEPTED') relationship = 'CONNECTED';
        else if (conn.status === 'PENDING') {
          relationship = conn.isSender ? 'REQUEST_SENT' : 'REQUEST_RECEIVED';
        }
      }
      return {
        ...s,
        relationship,
        connectionId: conn?.connectionId,
      };
    });

    return NextResponse.json({ students: discovered });
  } catch (error: any) {
    console.error('Fetch connections error:', error);
    return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === session.userId) {
      return NextResponse.json({ error: 'Invalid target student' }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: session.userId, receiverId: targetUserId },
          { requesterId: targetUserId, receiverId: session.userId },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Connection already requested or active' }, { status: 400 });
    }

    const conn = await prisma.connection.create({
      data: {
        requesterId: session.userId,
        receiverId: targetUserId,
        status: 'PENDING',
      },
    });

    // Notify receiver
    await prisma.notification.create({
      data: {
        recipientId: targetUserId,
        title: 'New Connection Request',
        message: `${session.fullName} from ${session.collegeName} wants to connect with you.`,
        link: '/connections',
        type: 'CONNECTION',
      },
    });

    return NextResponse.json({ success: true, connection: conn });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { connectionId, action } = await req.json(); // action: 'ACCEPT' | 'DECLINE'

    const conn = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!conn || conn.receiverId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized or connection not found' }, { status: 404 });
    }

    if (action === 'ACCEPT') {
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'ACCEPTED' },
      });

      // Notify requester
      await prisma.notification.create({
        data: {
          recipientId: conn.requesterId,
          title: 'Connection Accepted',
          message: `${session.fullName} accepted your connection request.`,
          link: '/connections',
          type: 'CONNECTION',
        },
      });

      return NextResponse.json({ success: true, message: 'Connection accepted' });
    } else {
      await prisma.connection.update({
        where: { id: connectionId },
        data: { status: 'DECLINED' },
      });
      return NextResponse.json({ success: true, message: 'Connection declined' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
  }
}
