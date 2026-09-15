import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordKarmaTransaction } from '@/lib/karma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const request = await prisma.skillRequest.findUnique({
      where: { id: params.id },
      include: {
        author: {
          include: { profile: true, college: true },
        },
        responses: {
          include: {
            helper: {
              include: { profile: true, college: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    return NextResponse.json({ request });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const request = await prisma.skillRequest.findUnique({
      where: { id: params.id },
    });

    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.authorId === session.userId) {
      return NextResponse.json({ error: 'You cannot respond to your own help request' }, { status: 400 });
    }

    const { message } = await req.json();

    // Create response
    const response = await prisma.skillRequestResponse.create({
      data: {
        requestId: request.id,
        helperId: session.userId,
        message: message || 'I can help you with this! Let’s coordinate.',
        status: 'PENDING',
      },
      include: { helper: { include: { profile: true } } },
    });

    // Move status to IN_PROGRESS if OPEN
    if (request.status === 'OPEN') {
      await prisma.skillRequest.update({
        where: { id: request.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    // Notify author
    await prisma.notification.create({
      data: {
        recipientId: request.authorId,
        title: 'New Help Offer Received',
        message: `${session.fullName} offered to help with "${request.title}".`,
        link: `/requests/${request.id}`,
        type: 'HELP_REQUEST',
      },
    });

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Respond request error:', error);
    return NextResponse.json({ error: 'Failed to submit response' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const request = await prisma.skillRequest.findUnique({
      where: { id: params.id },
      include: { responses: true },
    });

    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.authorId !== session.userId) {
      return NextResponse.json({ error: 'Only the request author can complete this request' }, { status: 403 });
    }

    const { helperId } = await req.json();

    // Update status to COMPLETED
    await prisma.skillRequest.update({
      where: { id: request.id },
      data: { status: 'COMPLETED' },
    });

    // If helperId was specified or there is a helper, award +30 Karma to helper
    const targetHelperId = helperId || request.responses[0]?.helperId;
    if (targetHelperId) {
      await recordKarmaTransaction({
        userId: targetHelperId,
        amount: 30,
        reason: `Helped peer solve request: ${request.title}`,
        category: 'Helping',
        relatedActivityId: request.id,
      });

      // Also award student learner +10 Karma for completing their inquiry
      await recordKarmaTransaction({
        userId: request.authorId,
        amount: 10,
        reason: `Completed resolution of inquiry: ${request.title}`,
        category: 'Learning',
        relatedActivityId: request.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Request marked as completed! Karma distributed to helper and student.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}
