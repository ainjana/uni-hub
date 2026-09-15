import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'upcoming', 'completed', 'all'

    const whereClause: any = { userId: session.userId };
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    if (status === 'completed') {
      whereClause.isCompleted = true;
    } else if (status === 'upcoming') {
      whereClause.isCompleted = false;
    }

    const events = await prisma.timelineEvent.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Fetch timeline error:', error);
    return NextResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, time, location, category } = body;

    if (!title || !date || !category) {
      return NextResponse.json({ error: 'Title, date, and category are required' }, { status: 400 });
    }

    const event = await prisma.timelineEvent.create({
      data: {
        userId: session.userId,
        title,
        description,
        date,
        time,
        location,
        category,
        source: 'Manual',
        isCompleted: false,
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error('Create timeline event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
