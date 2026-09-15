import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { recordKarmaTransaction } from '@/lib/karma';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
      include: { profile: true, college: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired verification token' }, { status: 400 });
    }

    // Mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });

    // Record welcome Karma for verification
    await recordKarmaTransaction({
      userId: user.id,
      amount: 25,
      reason: 'College Email Verified (+25 Karma)',
      category: 'ChallengeReward',
    });

    // Issue updated session token
    const sessionToken = await createSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.profile?.fullName || 'Student',
      collegeId: user.collegeId,
      collegeName: user.college.name,
      isVerified: true,
      role: user.role as any,
      avatarUrl: user.profile?.avatarUrl,
      totalKarma: (user.profile?.totalKarma || 0) + 25,
    });

    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'Collegiate verification complete! Welcome to University Hub.',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.profile?.fullName,
        isVerified: true,
      },
    });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
