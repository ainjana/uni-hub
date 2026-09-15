import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetUserId, sessionId, requestId, rating, comment } = body;

    if (!targetUserId || !rating || !comment) {
      return NextResponse.json({ error: 'Target student, rating, and comment are required' }, { status: 400 });
    }

    if (targetUserId === session.userId) {
      return NextResponse.json({ error: 'You cannot review yourself' }, { status: 400 });
    }

    const numericRating = Math.max(1, Math.min(5, parseInt(rating, 10)));

    // Prevent duplicate reviews for the same session/request
    if (sessionId) {
      const existing = await prisma.review.findFirst({
        where: { reviewerId: session.userId, sessionId },
      });
      if (existing) {
        return NextResponse.json({ error: 'You have already reviewed this class session' }, { status: 400 });
      }
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: session.userId,
        targetUserId,
        sessionId: sessionId || null,
        requestId: requestId || null,
        rating: numericRating,
        comment: comment.trim(),
      },
    });

    // Recompute target student's aggregate rating
    const allReviews = await prisma.review.findMany({
      where: { targetUserId },
      select: { rating: true },
    });

    const sumRatings = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const newAverage = parseFloat((sumRatings / allReviews.length).toFixed(2));

    await prisma.profile.updateMany({
      where: { userId: targetUserId },
      data: {
        rating: newAverage,
        ratingCount: allReviews.length,
      },
    });

    // Notify target student
    await prisma.notification.create({
      data: {
        recipientId: targetUserId,
        title: `New ${numericRating}★ Review Received`,
        message: `${session.fullName} left a review: "${comment.substring(0, 50)}..."`,
        link: `/profile/${targetUserId}`,
        type: 'REVIEW',
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Create review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
