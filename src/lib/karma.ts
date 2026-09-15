import prisma from './prisma';
import { KarmaCategory } from '@/types';

export interface KarmaRecordInput {
  userId: string;
  amount: number;
  reason: string;
  category: KarmaCategory;
  relatedActivityId?: string;
}

export async function recordKarmaTransaction(input: KarmaRecordInput) {
  const { userId, amount, reason, category, relatedActivityId } = input;

  // 1. Create transaction record in the ledger
  const transaction = await prisma.karmaTransaction.create({
    data: {
      userId,
      amount,
      reason,
      category,
      relatedActivityId,
    },
  });

  // 2. Increment totalKarma on student profile
  await prisma.profile.updateMany({
    where: { userId },
    data: {
      totalKarma: {
        increment: amount,
      },
      ...(category === 'Helping' ? { studentsHelped: { increment: 1 } } : {}),
    },
  });

  // 3. Create notification for student
  await prisma.notification.create({
    data: {
      recipientId: userId,
      title: `+${amount} Karma Earned`,
      message: reason,
      link: '/karma',
      type: 'KARMA',
    },
  });

  // 4. Progress relevant challenges if applicable
  await evaluateChallengesForActivity(userId, category);

  return transaction;
}

async function evaluateChallengesForActivity(userId: string, category: KarmaCategory) {
  let challengeType: string | null = null;
  if (category === 'Teaching' || category === 'Learning') challengeType = 'TEACH_ONE_LEARN_ONE';
  else if (category === 'Helping') challengeType = 'HELP_STUDENTS';
  else if (category === 'ResourceShare') challengeType = 'RESOURCE_CONTRIBUTION';

  if (!challengeType) return;

  const activeChallenges = await prisma.karmaChallenge.findMany({
    where: { challengeType, isActive: true },
  });

  for (const ch of activeChallenges) {
    let progress = await prisma.challengeProgress.findUnique({
      where: {
        challengeId_userId: {
          challengeId: ch.id,
          userId,
        },
      },
    });

    if (!progress) {
      progress = await prisma.challengeProgress.create({
        data: {
          challengeId: ch.id,
          userId,
          currentCount: 1,
          isCompleted: 1 >= ch.targetCount,
        },
      });
    } else if (!progress.isCompleted) {
      const newCount = progress.currentCount + 1;
      const completed = newCount >= ch.targetCount;
      await prisma.challengeProgress.update({
        where: { id: progress.id },
        data: {
          currentCount: newCount,
          isCompleted: completed,
        },
      });

      if (completed && !progress.claimedAt) {
        // Auto-award challenge bonus
        await prisma.karmaTransaction.create({
          data: {
            userId,
            amount: ch.rewardKarma,
            reason: `Completed Challenge: ${ch.title}`,
            category: 'ChallengeReward',
            relatedActivityId: ch.id,
          },
        });
        await prisma.profile.updateMany({
          where: { userId },
          data: { totalKarma: { increment: ch.rewardKarma } },
        });
        await prisma.challengeProgress.update({
          where: { id: progress.id },
          data: { claimedAt: new Date() },
        });
        await prisma.notification.create({
          data: {
            recipientId: userId,
            title: `Challenge Completed: ${ch.title}!`,
            message: `You earned +${ch.rewardKarma} bonus Karma for completing "${ch.title}".`,
            link: '/karma/challenges',
            type: 'KARMA',
          },
        });
      }
    }
  }
}

export async function getLeaderboards(periodDays: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - periodDays);

  const transactions = await prisma.karmaTransaction.findMany({
    where: {
      createdAt: { gte: startDate },
    },
    include: {
      user: {
        include: {
          profile: true,
          college: true,
        },
      },
    },
  });

  // Aggregators
  const overallMap: Record<string, { user: any; karma: number }> = {};
  const teacherMap: Record<string, { user: any; karma: number }> = {};
  const helperMap: Record<string, { user: any; karma: number }> = {};
  const learnerMap: Record<string, { user: any; karma: number }> = {};

  for (const t of transactions) {
    const uid = t.userId;
    const u = t.user;

    // Overall
    if (!overallMap[uid]) overallMap[uid] = { user: u, karma: 0 };
    overallMap[uid].karma += t.amount;

    // Categories
    if (t.category === 'Teaching') {
      if (!teacherMap[uid]) teacherMap[uid] = { user: u, karma: 0 };
      teacherMap[uid].karma += t.amount;
    } else if (t.category === 'Helping') {
      if (!helperMap[uid]) helperMap[uid] = { user: u, karma: 0 };
      helperMap[uid].karma += t.amount;
    } else if (t.category === 'Learning') {
      if (!learnerMap[uid]) learnerMap[uid] = { user: u, karma: 0 };
      learnerMap[uid].karma += t.amount;
    }
  }

  const toSortedArray = (map: Record<string, { user: any; karma: number }>) => {
    return Object.values(map)
      .sort((a, b) => b.karma - a.karma)
      .slice(0, 10)
      .map((entry, index) => ({
        rank: index + 1,
        studentId: entry.user.id,
        fullName: entry.user.profile?.fullName || 'Student',
        avatarUrl: entry.user.profile?.avatarUrl,
        collegeName: entry.user.college?.name || 'University',
        course: entry.user.profile?.course || 'General',
        semester: entry.user.profile?.semester || 1,
        karma: entry.karma,
      }));
  };

  return {
    overall: toSortedArray(overallMap),
    teachers: toSortedArray(teacherMap),
    helpers: toSortedArray(helperMap),
    learners: toSortedArray(learnerMap),
  };
}
