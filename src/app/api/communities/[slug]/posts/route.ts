import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { recordKarmaTransaction } from '@/lib/karma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
      include: {
        posts: {
          include: {
            author: { include: { profile: true, college: true } },
            comments: {
              include: { author: { include: { profile: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    return NextResponse.json({ community, posts: community.posts });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const community = await prisma.community.findUnique({
      where: { slug: params.slug },
    });

    if (!community) return NextResponse.json({ error: 'Community not found' }, { status: 404 });

    const body = await req.json();
    const { title, content, postId } = body;

    if (postId) {
      // Create comment on post
      const comment = await prisma.communityComment.create({
        data: {
          postId,
          authorId: session.userId,
          content,
        },
        include: { author: { include: { profile: true } } },
      });

      return NextResponse.json({ success: true, comment });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        communityId: community.id,
        authorId: session.userId,
        title,
        content,
      },
      include: {
        author: { include: { profile: true } },
        comments: true,
      },
    });

    // Award small Karma for community contribution (+10)
    await recordKarmaTransaction({
      userId: session.userId,
      amount: 10,
      reason: `Started Community Discussion: ${title}`,
      category: 'Helping',
      relatedActivityId: post.id,
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
