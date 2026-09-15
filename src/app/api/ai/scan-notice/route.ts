import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { storageService } from '@/lib/storage/service';
import { parseNoticeWithAI } from '@/lib/ai/notice-scanner';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details for personalized relevance
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { profile: true },
    });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const directText = formData.get('text') as string | null;

    let contentToAnalyze = directText || '';
    let fileName = 'Academic Notice';
    let uploadedFileUrl: string | null = null;

    if (file && file.size > 0) {
      fileName = file.name;
      const buffer = Buffer.from(await file.arrayBuffer());

      // If it's a text/markdown file, read directly
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        contentToAnalyze = buffer.toString('utf-8');
      } else {
        // For PDF or image, save to storage
        const saved = await storageService.saveFile(buffer, file.name, file.type || 'application/pdf');
        uploadedFileUrl = saved.url;
        contentToAnalyze = contentToAnalyze || `Document: ${file.name}\nUploaded file format: ${file.type}`;
      }
    }

    if (!contentToAnalyze && !uploadedFileUrl) {
      return NextResponse.json({ error: 'Please provide a document file or notice text' }, { status: 400 });
    }

    // Run AI Extraction
    const extractionResult = await parseNoticeWithAI(contentToAnalyze, fileName, {
      course: user?.profile?.course || 'Computer Science',
      semester: user?.profile?.semester || 5,
    });

    return NextResponse.json({
      success: true,
      fileName,
      fileUrl: uploadedFileUrl,
      rawText: contentToAnalyze,
      extraction: extractionResult,
    });
  } catch (error: any) {
    console.error('Scan notice error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze notice' }, { status: 500 });
  }
}
