import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const unreadNotifications = await prisma.notification.count({
      where: { recipientId: user.id, isRead: false },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        role: user.role,
        college: user.college,
        profile: user.profile,
        unreadNotifications,
      },
    });
  } catch (error: any) {
    console.error('Fetch me error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
