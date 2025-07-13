import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanSummary } from '@/lib/text-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    const entry = await prisma.changelog.findUnique({
      where: { id: params.id },
      include: {
        project: true,
        commits: true,
      },
    });
    
    if (!entry) {
      return NextResponse.json(
        { error: 'Changelog entry not found' },
        { status: 404 }
      );
    }
    
    // Validate project ID if provided
    if (projectId && entry.projectId !== projectId) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Verify the changelog exists
    const existing = await prisma.changelog.findUnique({
      where: { id: params.id },
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Changelog entry not found' },
        { status: 404 }
      );
    }
    
    // Build update data object to only update provided fields
    const updateData: any = {};
    
    if (body.date !== undefined) {
      // Parse the date string and add time to ensure it's treated as local midnight
      // This prevents timezone shifts
      updateData.date = new Date(body.date + 'T00:00:00');
    }
    if (body.version !== undefined) {
      updateData.version = body.version;
    }
    if (body.summary !== undefined) {
      updateData.summary = cleanSummary(body.summary);
    }
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    if (body.author !== undefined) {
      updateData.author = body.author;
    }
    if (body.published !== undefined) {
      updateData.published = body.published;
    }
    
    // Update the changelog
    const updated = await prisma.changelog.update({
      where: { id: params.id },
      data: updateData,
    });
    
    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error('Error updating changelog entry:', error);
    return NextResponse.json(
      { error: 'Failed to update changelog entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.changelog.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting changelog entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete changelog entry' },
      { status: 500 }
    );
  }
}