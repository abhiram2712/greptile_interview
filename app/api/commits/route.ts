import { NextRequest, NextResponse } from 'next/server';
import { getCommits } from '@/lib/git';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get('since') || undefined;
    const until = searchParams.get('until') || undefined;

    const commits = await getCommits(since, until);

    return NextResponse.json({ commits });
  } catch (error) {
    console.error('Error in commits API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}