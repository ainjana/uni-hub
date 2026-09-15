import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordKarmaTransaction } from '@/lib/karma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const skillName = searchParams.get('skill');
    const myClasses = searchParams.get('my'); // 'teaching' | 'registered'

    const session = await getCurrentUser();

    const whereClause: any = { status: 'UPCOMING' };

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skill: { name: { contains: search } } },
      ];
    }

    if (skillName && skillName !== 'All') {
      whereClause.skill = { name: skillName };
    }

    if (myClasses === 'teaching' && session) {
      whereClause.teacherId = session.userId;
      delete whereClause.status; // allow completed too
    }

    const classes = await prisma.classSession.findMany({
      where: whereClause,
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
      },
      orderBy: { dateTime: 'asc' },
    });

    return NextResponse.json({ classes });
  } catch (error: any) {
    console.error('Fetch classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      title,
      skillName,
      description,
      dateTime,
      durationMinutes,
      seatsTotal,
      isOnline,
      locationUrl,
      requirements,
      resourcesUrl,
    } = body;

    if (!title || !skillName || !dateTime || !seatsTotal) {
      return NextResponse.json({ error: 'Missing required class fields' }, { status: 400 });
    }

    // Find or create skill
    let skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) {
      skill = await prisma.skill.create({ data: { name: skillName, category: 'General' } });
    }

    const sessionDate = new Date(dateTime);
    const parsedSeats = parseInt(seatsTotal, 10) || 5;

    const newClass = await prisma.classSession.create({
      data: {
        teacherId: session.userId,
        title,
        skillId: skill.id,
        description: description || '',
        dateTime: sessionDate,
        durationMinutes: parseInt(durationMinutes, 10) || 60,
        seatsTotal: parsedSeats,
        seatsAvailable: parsedSeats,
        isOnline: isOnline ?? true,
        locationUrl: locationUrl || '',
        requirements: requirements || '',
        resourcesUrl: resourcesUrl || '',
        status: 'UPCOMING',
      },
      include: {
        skill: true,
      },
    });

    // Also add to teacher's personal timeline!
    await prisma.timelineEvent.create({
      data: {
        userId: session.userId,
        title: `[Teaching] ${title}`,
        description: `Your hosted class session on ${skillName}.`,
        date: sessionDate.toISOString().split('T')[0],
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: locationUrl || 'Online',
        category: 'Class',
        source: 'ClassCreation',
        isCompleted: false,
      },
    });

    return NextResponse.json({ success: true, classSession: newClass });
  } catch (error: any) {
    console.error('Create class error:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
