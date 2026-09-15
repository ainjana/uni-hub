import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: {
          include: {
            skills: { include: { skill: true } },
            interests: { include: { interest: true } },
          },
        },
        college: true,
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const studentCourse = user.profile.course;
    const studentSemester = user.profile.semester;
    const studentSkillNames = user.profile.skills.map((s) => s.skill.name);

    // 1. Upcoming Timeline Events for this Student (Exams, Classes, Deadlines)
    const upcomingEvents = await prisma.timelineEvent.findMany({
      where: {
        userId: user.id,
        isCompleted: false,
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      take: 6,
    });

    const upcomingExams = upcomingEvents.filter((e) => e.category === 'Exam');
    const upcomingDeadlines = upcomingEvents.filter((e) => e.category === 'Deadline');

    // 2. Registered Classes & Today's Classes
    const registeredSessions = await prisma.sessionRegistration.findMany({
      where: {
        studentId: user.id,
        status: 'REGISTERED',
        session: { status: 'UPCOMING' },
      },
      include: {
        session: {
          include: {
            skill: true,
            teacher: { include: { profile: true, college: true } },
          },
        },
      },
      take: 4,
    });

    // 3. Recommended Learning Opportunities (Classes matching student's interest/course, not taught by self)
    const recommendedClasses = await prisma.classSession.findMany({
      where: {
        teacherId: { not: user.id },
        status: 'UPCOMING',
        seatsAvailable: { gt: 0 },
        // Don't show already registered classes
        registrations: {
          none: { studentId: user.id, status: 'REGISTERED' },
        },
      },
      include: {
        skill: true,
        teacher: { include: { profile: true, college: true } },
      },
      take: 4,
      orderBy: { dateTime: 'asc' },
    });

    // 4. Relevant Skill / Help Requests from Peers (in user's skills or college)
    const relevantRequests = await prisma.skillRequest.findMany({
      where: {
        authorId: { not: user.id },
        status: 'OPEN',
      },
      include: {
        author: { include: { profile: true, college: true } },
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    // 5. Recent Verified Campus Notices
    const relevantNotices = await prisma.notice.findMany({
      where: { isVerified: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { extractions: true },
    });

    // 6. Suggested Student Connections (Same college or complementary skills)
    const suggestedConnections = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        isVerified: true,
        collegeId: user.collegeId,
        sentConnections: { none: { receiverId: user.id } },
        receivedConnections: { none: { requesterId: user.id } },
      },
      include: {
        profile: {
          include: { skills: { include: { skill: true } } },
        },
        college: true,
      },
      take: 4,
    });

    return NextResponse.json({
      student: {
        fullName: user.profile.fullName,
        collegeName: user.college.name,
        course: user.profile.course,
        semester: user.profile.semester,
        totalKarma: user.profile.totalKarma,
        rating: user.profile.rating,
        studentsHelped: user.profile.studentsHelped,
        isVerified: user.isVerified,
      },
      upcomingEvents,
      upcomingExams,
      upcomingDeadlines,
      registeredClasses: registeredSessions.map((r) => r.session),
      recommendedClasses,
      relevantRequests,
      relevantNotices,
      suggestedConnections,
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
