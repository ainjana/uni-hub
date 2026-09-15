import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        profile: {
          include: {
            skills: { include: { skill: true } },
            interests: { include: { interest: true } },
          },
        },
        college: true,
        taughtClasses: {
          include: { skill: true },
          orderBy: { dateTime: 'desc' },
        },
        resources: {
          orderBy: { createdAt: 'desc' },
        },
        receivedReviews: {
          include: {
            reviewer: { include: { profile: true } },
            session: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        karmaTransactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });

    return NextResponse.json({ student: user });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch student profile' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.userId !== params.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this profile' }, { status: 403 });
    }

    const body = await req.json();
    const { bio, avatarUrl, course, semester, skills } = body;

    const updatedProfile = await prisma.profile.update({
      where: { userId: session.userId },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(course ? { course } : {}),
        ...(semester ? { semester: parseInt(semester, 10) } : {}),
      },
      include: {
        skills: { include: { skill: true } },
      },
    });

    // Update skills if provided
    if (Array.isArray(skills)) {
      await prisma.studentSkill.deleteMany({ where: { profileId: updatedProfile.id } });
      for (const s of skills) {
        let skillRecord = await prisma.skill.findUnique({ where: { name: s.name } });
        if (!skillRecord) {
          skillRecord = await prisma.skill.create({ data: { name: s.name, category: 'General' } });
        }
        await prisma.studentSkill.create({
          data: {
            profileId: updatedProfile.id,
            skillId: skillRecord.id,
            proficiency: s.proficiency || 'INTERMEDIATE',
            isTeaching: !!s.isTeaching,
          },
        });
      }
    }

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
