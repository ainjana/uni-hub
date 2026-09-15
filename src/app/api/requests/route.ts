import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const urgency = searchParams.get('urgency');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const whereClause: any = {};

    if (urgency && urgency !== 'All') {
      whereClause.urgency = urgency;
    }
    if (status && status !== 'All') {
      whereClause.status = status;
    } else {
      whereClause.status = { in: ['OPEN', 'IN_PROGRESS'] };
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skillName: { contains: search } },
      ];
    }

    const requests = await prisma.skillRequest.findMany({
      where: whereClause,
      include: {
        author: {
          include: {
            profile: true,
            college: true,
          },
        },
        responses: {
          include: {
            helper: {
              include: { profile: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, skillName, urgency, availability, deadline } = body;

    if (!title || !description || !skillName) {
      return NextResponse.json({ error: 'Title, description, and skill are required' }, { status: 400 });
    }

    const newRequest = await prisma.skillRequest.create({
      data: {
        authorId: session.userId,
        title,
        description,
        skillName,
        urgency: urgency || 'MEDIUM',
        availability: availability || null,
        deadline: deadline ? new Date(deadline) : null,
        status: 'OPEN',
      },
      include: {
        author: {
          include: { profile: true, college: true },
        },
      },
    });

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Failed to create help request' }, { status: 500 });
  }
}
