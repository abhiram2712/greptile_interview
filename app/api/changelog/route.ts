import { NextRequest, NextResponse } from 'next/server';
import { getAllChangelogs, saveChangelog, deleteChangelog } from '@/lib/storage';
import { ChangelogEntry } from '@/lib/storage';

export async function GET() {
  try {
    const changelogs = await getAllChangelogs();
    return NextResponse.json({ changelogs });
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch changelogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const entry: ChangelogEntry = {
      id: Date.now().toString(),
      date: body.date || new Date().toISOString().split('T')[0],
      version: body.version,
      summary: body.summary,
      content: body.content,
      commits: body.commits || [],
      author: body.author || 'Unknown',
      createdAt: new Date().toISOString(),
    };

    await saveChangelog(entry);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error saving changelog:', error);
    return NextResponse.json(
      { error: 'Failed to save changelog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Changelog ID required' },
        { status: 400 }
      );
    }

    await deleteChangelog(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting changelog:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog' },
      { status: 500 }
    );
  }
}