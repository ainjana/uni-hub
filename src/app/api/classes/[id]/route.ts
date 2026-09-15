import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordKarmaTransaction } from '@/lib/karma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const classSession = await prisma.classSession.findUnique({
      where: { id: params.id },
      include: {
        skill: true,
        teacher: {
          include: {
            profile: true,
            college: true,
          },
        },
        registrations: {
          include: {
            student: {
              include: { profile: true },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!classSession) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ classSession });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch class details' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body; // 'register' | 'cancel'

    const classSession = await prisma.classSession.findUnique({
      where: { id: params.id },
      include: { registrations: true, teacher: true },
    });

    if (!classSession) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (classSession.teacherId === session.userId) {
      return NextResponse.json({ error: 'You cannot register for your own class' }, { status: 400 });
    }

    if (action === 'register') {
      // Check if already registered
      const isAlready = classSession.registrations.some((r) => r.studentId === session.userId && r.status === 'REGISTERED');
      if (isAlready) {
        return NextResponse.json({ error: 'You are already registered for this session' }, { status: 400 });
      }

      // Check seat availability
      if (classSession.seatsAvailable <= 0) {
        return NextResponse.json({ error: 'This class session is fully booked' }, { status: 400 });
      }

      // Decrement available seats and register
      await prisma.$transaction([
        prisma.classSession.update({
          where: { id: classSession.id },
          data: { seatsAvailable: { decrement: 1 } },
        }),
        prisma.sessionRegistration.upsert({
          where: {
            sessionId_studentId: {
              sessionId: classSession.id,
              studentId: session.userId,
            },
          },
          update: { status: 'REGISTERED' },
          create: {
            sessionId: classSession.id,
            studentId: session.userId,
            status: 'REGISTERED',
          },
        }),
        // Add to student's timeline
        prisma.timelineEvent.create({
          data: {
            userId: session.userId,
            title: `[Class] ${classSession.title}`,
            description: `Registered student peer-learning session.`,
            date: classSession.dateTime.toISOString().split('T')[0],
            time: classSession.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            location: classSession.locationUrl || 'Online',
            category: 'Class',
            source: 'ClassRegistration',
            isCompleted: false,
          },
        }),
        // Notify teacher
        prisma.notification.create({
          data: {
            recipientId: classSession.teacherId,
            title: 'New Student Registered',
            message: `${session.fullName} registered for "${classSession.title}".`,
            link: `/classes/${classSession.id}`,
            type: 'CLASS',
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Successfully registered for class!' });
    } else if (action === 'cancel') {
      const reg = classSession.registrations.find((r) => r.studentId === session.userId && r.status === 'REGISTERED');
      if (!reg) {
        return NextResponse.json({ error: 'You do not have an active registration' }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.classSession.update({
          where: { id: classSession.id },
          data: { seatsAvailable: { increment: 1 } },
        }),
        prisma.sessionRegistration.update({
          where: { id: reg.id },
          data: { status: 'CANCELLED' },
        }),
      ]);

      return NextResponse.json({ success: true, message: 'Registration cancelled.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Class action error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const classSession = await prisma.classSession.findUnique({
      where: { id: params.id },
      include: {
        registrations: { where: { status: 'REGISTERED' } },
      },
    });

    if (!classSession) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

    if (classSession.teacherId !== session.userId) {
      return NextResponse.json({ error: 'Only the session host can complete this class' }, { status: 403 });
    }

    if (classSession.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Class is already marked as completed' }, { status: 400 });
    }

    // Mark completed
    await prisma.classSession.update({
      where: { id: classSession.id },
      data: { status: 'COMPLETED' },
    });

    // 1. Award Karma to Teacher (+50)
    await recordKarmaTransaction({
      userId: classSession.teacherId,
      amount: 50,
      reason: `Taught Class: ${classSession.title}`,
      category: 'Teaching',
      relatedActivityId: classSession.id,
    });

    // 2. Award Karma to all registered attendees (+20 each)
    for (const reg of classSession.registrations) {
      await recordKarmaTransaction({
        userId: reg.studentId,
        amount: 20,
        reason: `Completed Learning Class: ${classSession.title}`,
        category: 'Learning',
        relatedActivityId: classSession.id,
      });

      // Update registration status to attended
      await prisma.sessionRegistration.update({
        where: { id: reg.id },
        data: { status: 'ATTENDED' },
      });

      // Prompt review
      await prisma.notification.create({
        data: {
          recipientId: reg.studentId,
          title: 'Class Completed - Leave a Review',
          message: `How was "${classSession.title}"? Leave a rating and short review for your peer teacher.`,
          link: `/classes/${classSession.id}`,
          type: 'REVIEW',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Class completed! Awarded +50 Karma to teacher and +20 Karma to ${classSession.registrations.length} learners.`,
    });
  } catch (error: any) {
    console.error('Complete class error:', error);
    return NextResponse.json({ error: 'Failed to complete class' }, { status: 500 });
  }
}
