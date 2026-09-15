import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { roleId, pitch } = body;

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { creator: true },
    });

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    if (project.creatorId === session.userId) {
      return NextResponse.json({ error: 'You cannot apply to your own project' }, { status: 400 });
    }

    const application = await prisma.projectApplication.create({
      data: {
        roleId,
        applicantId: session.userId,
        pitch: pitch || 'Excited to collaborate on this project!',
        status: 'PENDING',
      },
    });

    // Notify project creator
    await prisma.notification.create({
      data: {
        recipientId: project.creatorId,
        title: 'New Project Applicant',
        message: `${session.fullName} applied to join "${project.title}".`,
        link: `/projects/${project.id}`,
        type: 'PROJECT',
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
  }
}
