import { NextRequest, NextResponse } from 'next/server';
import { getChangelog } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const filePath = `${projectId}-${params.id}`;
    const entry = await getChangelog(filePath);
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Changelog entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching changelog entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelog entry' },
      { status: 500 }
    );
  }
}