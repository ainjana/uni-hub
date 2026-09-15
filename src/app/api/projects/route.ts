import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        creator: {
          include: { profile: true, college: true },
        },
        roles: {
          include: {
            applications: {
              include: { applicant: { include: { profile: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, description, teamSize, roles, deadline } = body;

    if (!title || !description || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json({ error: 'Title, description, and at least one role required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        creatorId: session.userId,
        title,
        description,
        teamSize: parseInt(teamSize, 10) || 3,
        status: 'RECRUITING',
        deadline: deadline ? new Date(deadline) : null,
        roles: {
          create: roles.map((r: any) => ({
            roleName: r.roleName,
            skillsRequired: r.skillsRequired || 'General',
            openSeats: parseInt(r.openSeats, 10) || 1,
            filledSeats: 0,
          })),
        },
      },
      include: {
        roles: true,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
