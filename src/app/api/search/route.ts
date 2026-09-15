import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({
        students: [],
        classes: [],
        resources: [],
        requests: [],
        projects: [],
        communities: [],
      });
    }

    const [students, classes, resources, requests, projects, communities] = await Promise.all([
      // Students
      prisma.user.findMany({
        where: {
          isVerified: true,
          OR: [
            { profile: { fullName: { contains: q } } },
            { profile: { course: { contains: q } } },
            { college: { name: { contains: q } } },
          ],
        },
        include: { profile: true, college: true },
        take: 5,
      }),
      // Classes
      prisma.classSession.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { skill: { name: { contains: q } } },
          ],
        },
        include: { skill: true, teacher: { include: { profile: true } } },
        take: 5,
      }),
      // Resources
      prisma.resource.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { skillName: { contains: q } },
          ],
        },
        include: { author: { include: { profile: true } } },
        take: 5,
      }),
      // Help Requests
      prisma.skillRequest.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
            { skillName: { contains: q } },
          ],
        },
        include: { author: { include: { profile: true } } },
        take: 5,
      }),
      // Projects
      prisma.project.findMany({
        where: {
          OR: [{ title: { contains: q } }, { description: { contains: q } }],
        },
        include: { creator: { include: { profile: true } }, roles: true },
        take: 5,
      }),
      // Communities
      prisma.community.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { topic: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      students,
      classes,
      resources,
      requests,
      projects,
      communities,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to execute search' }, { status: 500 });
  }
}
