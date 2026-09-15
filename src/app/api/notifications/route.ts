import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { recipientId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await prisma.notification.updateMany({
        where: { id: notificationId, recipientId: session.userId },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { recipientId: session.userId, isRead: false },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
