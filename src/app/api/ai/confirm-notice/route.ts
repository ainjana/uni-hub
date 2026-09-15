import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { recordKarmaTransaction } from '@/lib/karma';
import { NoticeExtractedEvent } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, fileName, fileUrl, rawText, docType, summary, events } = body;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json({ error: 'Events array is required' }, { status: 400 });
    }

    // 1. Create Notice Record
    const notice = await prisma.notice.create({
      data: {
        userId: session.userId,
        title: title || fileName || 'Campus Notice',
        originalFileName: fileName || 'Notice.pdf',
        fileUrl: fileUrl || '',
        rawText: rawText || '',
        docType: docType || 'GeneralNotice',
        summary: summary || '',
        isVerified: true,
        extractions: {
          create: {
            structuredJson: JSON.stringify(events),
            confidence: 0.95,
            relevanceScore: 0.92,
          },
        },
      },
    });

    // 2. Add confirmed events into personal Timeline
    const createdEvents = [];
    for (const ev of events as NoticeExtractedEvent[]) {
      if (!ev.title || !ev.date) continue;
      const tEvent = await prisma.timelineEvent.create({
        data: {
          userId: session.userId,
          title: ev.title,
          description: ev.description || '',
          date: ev.date,
          time: ev.time || null,
          location: ev.location || null,
          category: ev.category || 'Notice',
          source: 'NoticeScanner',
          isCompleted: false,
          relevanceScore: ev.relevanceScore || 0.9,
        },
      });
      createdEvents.push(tEvent);
    }

    // 3. Award student Karma for scanning & confirming notice
    await recordKarmaTransaction({
      userId: session.userId,
      amount: 15,
      reason: `AI Notice Processed: ${notice.title}`,
      category: 'ResourceShare',
      relatedActivityId: notice.id,
    });

    return NextResponse.json({
      success: true,
      noticeId: notice.id,
      eventsAdded: createdEvents.length,
      message: `Successfully added ${createdEvents.length} events to your timeline (+15 Karma awarded)!`,
    });
  } catch (error: any) {
    console.error('Confirm notice error:', error);
    return NextResponse.json({ error: 'Failed to confirm notice' }, { status: 500 });
  }
}
