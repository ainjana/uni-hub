import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateVerificationToken, validateCollegeEmail } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, collegeId, course, semester, skills, interests } = body;

    if (!fullName || !email || !password || !collegeId || !course || !semester) {
      return NextResponse.json(
        { error: 'Missing required registration fields' },
        { status: 400 }
      );
    }

    // Check college existence and email domain
    const college = await prisma.college.findUnique({
      where: { id: collegeId },
    });

    if (!college) {
      return NextResponse.json({ error: 'Selected college does not exist' }, { status: 400 });
    }

    if (!validateCollegeEmail(email, college.domain)) {
      return NextResponse.json(
        {
          error: `Please use your valid university email ending with @${college.domain}`,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this university email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = generateVerificationToken();

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        collegeId: college.id,
        isVerified: false, // Requires email verification
        verificationToken,
        role: 'STUDENT',
        profile: {
          create: {
            fullName,
            course,
            semester: parseInt(semester, 10) || 1,
            totalKarma: 10, // Starter karma
            rating: 5.0,
            ratingCount: 0,
            studentsHelped: 0,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Attach skills if provided
    if (Array.isArray(skills) && skills.length > 0 && user.profile) {
      for (const skillName of skills) {
        if (!skillName) continue;
        let skill = await prisma.skill.findUnique({ where: { name: skillName } });
        if (!skill) {
          skill = await prisma.skill.create({ data: { name: skillName, category: 'General' } });
        }
        await prisma.studentSkill.create({
          data: {
            profileId: user.profile.id,
            skillId: skill.id,
            proficiency: 'INTERMEDIATE',
            isTeaching: false,
          },
        }).catch(() => {});
      }
    }

    // Attach interests if provided
    if (Array.isArray(interests) && interests.length > 0 && user.profile) {
      for (const interestName of interests) {
        if (!interestName) continue;
        let interest = await prisma.interest.findUnique({ where: { name: interestName } });
        if (!interest) {
          interest = await prisma.interest.create({ data: { name: interestName } });
        }
        await prisma.studentInterest.create({
          data: {
            profileId: user.profile.id,
            interestId: interest.id,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please verify your university email.',
      verificationToken, // Provided for instant simulation/testing
      verificationUrl: `/verify-email?token=${verificationToken}`,
      userId: user.id,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
