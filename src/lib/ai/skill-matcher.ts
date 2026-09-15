import prisma from '../prisma';
import { getGeminiClient } from './service';
import { MentorMatch } from '@/types';

export async function matchMentorsForQuery(
  query: string,
  currentStudentId?: string
): Promise<MentorMatch[]> {
  const gemini = getGeminiClient();

  // Fetch all students who are actively offering to teach or have high skills
  const mentors = await prisma.user.findMany({
    where: {
      id: { not: currentStudentId },
      isVerified: true,
      profile: { isNot: null },
    },
    include: {
      profile: {
        include: {
          skills: {
            include: { skill: true },
          },
        },
      },
      college: true,
      taughtClasses: {
        where: { status: { in: ['UPCOMING', 'COMPLETED'] } },
        include: { skill: true },
      },
    },
  });

  const queryLower = query.toLowerCase();

  // Calculate scores and extract structured reasons
  const matchedMentors: MentorMatch[] = mentors.map((user) => {
    const prof = user.profile!;
    const skillsList = prof.skills.map((s) => s.skill.name);
    const teachingSkills = prof.skills.filter((s) => s.isTeaching).map((s) => s.skill.name);
    const taughtClassTitles = user.taughtClasses.map((c) => c.title);

    let matchScore = 40;
    const strengths: string[] = [];
    const reasons: string[] = [];

    // 1. Skill keyword matching
    const matchingSkills = skillsList.filter((s) =>
      queryLower.includes(s.toLowerCase()) || s.toLowerCase().includes(queryLower)
    );

    if (matchingSkills.length > 0) {
      matchScore += 35;
      strengths.push(`Expertise in ${matchingSkills.join(', ')}`);
      reasons.push(`Direct skill alignment with your request: ${matchingSkills.join(', ')}`);
    } else {
      // Related concepts check
      if (queryLower.includes('dsa') || queryLower.includes('algorithm') || queryLower.includes('tree')) {
        if (skillsList.some((s) => s.toLowerCase().includes('algorithm') || s.toLowerCase().includes('data structure'))) {
          matchScore += 30;
          strengths.push('Specialized in Algorithms & Data Structures');
          reasons.push('Demonstrated deep problem-solving expertise in DSA');
        }
      }
      if (queryLower.includes('web') || queryLower.includes('frontend') || queryLower.includes('ui')) {
        if (skillsList.some((s) => s.toLowerCase().includes('react') || s.toLowerCase().includes('design') || s.toLowerCase().includes('typescript'))) {
          matchScore += 30;
          strengths.push('Modern Full-Stack & UI Architecture');
          reasons.push('Active practitioner in React, Next.js, and design tokens');
        }
      }
      if (queryLower.includes('ml') || queryLower.includes('ai') || queryLower.includes('data')) {
        if (skillsList.some((s) => s.toLowerCase().includes('machine learning') || s.toLowerCase().includes('python'))) {
          matchScore += 30;
          strengths.push('Machine Learning & Scientific Python');
          reasons.push('Hands-on research experience in ML model architectures');
        }
      }
    }

    // 2. Rating quality factor
    if (prof.rating >= 4.8) {
      matchScore += 10;
      strengths.push(`${prof.rating.toFixed(1)} ★ Student Rating (${prof.ratingCount} reviews)`);
    }

    // 3. Past teaching sessions
    if (user.taughtClasses.length > 0) {
      matchScore += 10;
      strengths.push(`Taught ${user.taughtClasses.length} university classes`);
      reasons.push(`Has active teaching experience: "${user.taughtClasses[0].title}"`);
    }

    // 4. Students helped
    if (prof.studentsHelped >= 10) {
      strengths.push(`${prof.studentsHelped} peers helped`);
    }

    // Cap score at 99
    const finalScore = Math.min(99, Math.max(30, matchScore));

    const finalReason =
      reasons.length > 0
        ? reasons.join('. ') + '.'
        : `Strong academic reputation in ${prof.course} with verified collegiate credentials.`;

    return {
      mentorId: user.id,
      fullName: prof.fullName,
      avatarUrl: prof.avatarUrl,
      course: prof.course,
      semester: prof.semester,
      collegeName: user.college.name,
      rating: prof.rating,
      ratingCount: prof.ratingCount,
      totalKarma: prof.totalKarma,
      skills: skillsList,
      matchScore: finalScore,
      matchReason: finalReason,
      strengths,
      availability: 'Flexible (Evenings & Weekends)',
    };
  });

  // Sort by matchScore descending
  return matchedMentors.sort((a, b) => b.matchScore - a.matchScore);
}
