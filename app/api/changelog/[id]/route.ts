import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    // Update the changelog
    const updated = await prisma.changelog.update({
      where: { id: params.id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        version: body.version,
        summary: body.summary,
        content: body.content,
        author: body.author,
        published: body.published !== undefined ? body.published : undefined,
      },
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