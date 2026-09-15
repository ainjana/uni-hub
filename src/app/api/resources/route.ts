import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { storageService } from '@/lib/storage/service';
import { recordKarmaTransaction } from '@/lib/karma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const skillName = searchParams.get('skill');
    const type = searchParams.get('type');

    const whereClause: any = {};

    if (skillName && skillName !== 'All') {
      whereClause.skillName = skillName;
    }
    if (type && type !== 'All') {
      whereClause.resourceType = type;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { skillName: { contains: search } },
      ];
    }

    const resources = await prisma.resource.findMany({
      where: whereClause,
      include: {
        author: {
          include: { profile: true, college: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ resources });
  } catch (error: any) {
    console.error('Fetch resources error:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const skillName = formData.get('skillName') as string;
    const resourceType = formData.get('resourceType') as string || 'Notes';
    const visibility = formData.get('visibility') as string || 'PUBLIC';
    const price = parseFloat(formData.get('price') as string || '0');
    const file = formData.get('file') as File | null;
    const linkUrl = formData.get('linkUrl') as string | null;

    if (!title || !skillName) {
      return NextResponse.json({ error: 'Title and skill are required' }, { status: 400 });
    }

    let fileUrl = linkUrl || '';

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await storageService.saveFile(buffer, file.name, file.type || 'application/pdf');
      fileUrl = saved.url;
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'Please upload a resource file or provide a link' }, { status: 400 });
    }

    const resource = await prisma.resource.create({
      data: {
        authorId: session.userId,
        title,
        description: description || '',
        skillName,
        resourceType,
        fileUrl,
        visibility,
        price: isNaN(price) ? 0 : price,
        downloadsCount: 0,
      },
    });

    // Award Karma for sharing knowledge! (+25)
    await recordKarmaTransaction({
      userId: session.userId,
      amount: 25,
      reason: `Shared Resource: ${title}`,
      category: 'ResourceShare',
      relatedActivityId: resource.id,
    });

    return NextResponse.json({
      success: true,
      resource,
      message: 'Resource shared successfully (+25 Karma awarded)!',
    });
  } catch (error: any) {
    console.error('Create resource error:', error);
    return NextResponse.json({ error: error.message || 'Failed to upload resource' }, { status: 500 });
  }
}
