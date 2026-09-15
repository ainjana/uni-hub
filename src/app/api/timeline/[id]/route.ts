import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const eventId = params.id;
    const existing = await prisma.timelineEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    const body = await req.json();
    const updated = await prisma.timelineEvent.update({
      where: { id: eventId },
      data: {
        ...(typeof body.isCompleted === 'boolean' ? { isCompleted: body.isCompleted } : {}),
        ...(body.title ? { title: body.title } : {}),
        ...(body.date ? { date: body.date } : {}),
        ...(body.time !== undefined ? { time: body.time } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.category ? { category: body.category } : {}),
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const eventId = params.id;
    const existing = await prisma.timelineEvent.findUnique({
      where: { id: eventId },
    });

    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: 'Event not found or unauthorized' }, { status: 404 });
    }

    await prisma.timelineEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
