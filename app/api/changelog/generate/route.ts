import { NextRequest, NextResponse } from 'next/server';
import { generateChangelogSummary } from '@/lib/ai';
import { GitCommit } from '@/lib/git';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commits, previousContext } = body;

    if (!commits || !Array.isArray(commits)) {
      return NextResponse.json(
        { error: 'Invalid commits data' },
        { status: 400 }
      );
    }

    const summary = await generateChangelogSummary(
      commits as GitCommit[],
      previousContext
    );

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to generate changelog summary' },
      { status: 500 }
    );
  }
}