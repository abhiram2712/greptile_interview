import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    
    const changelogs = projectId 
      ? await prisma.changelog.findMany({
          where: { projectId },
          orderBy: { date: 'desc' },
        })
      : await prisma.changelog.findMany({
          orderBy: { date: 'desc' },
          include: { project: true },
        });
      
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
    
    if (!body.projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const entry = await prisma.changelog.create({
      data: {
        projectId: body.projectId,
        date: body.date ? new Date(body.date) : new Date(),
        version: body.version || '',
        summary: body.summary || '',
        content: body.content || '',
        author: body.author || 'Unknown',
        published: false, // Start as draft
      },
    });

    // Link commits to changelog if provided
    if (body.commits && body.commits.length > 0) {
      // body.commits contains SHA hashes
      const commitShas = body.commits;
      
      // Find existing commits in the database
      const existingCommits = await prisma.commit.findMany({
        where: {
          projectId: body.projectId,
          sha: { in: commitShas },
        },
      });
      
      // Create changelog-commit relations
      if (existingCommits.length > 0) {
        await prisma.changelogCommit.createMany({
          data: existingCommits.map(commit => ({
            changelogId: entry.id,
            commitId: commit.id,
          })),
        });
      }
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error saving changelog:', error);
    return NextResponse.json(
      { error: 'Failed to save changelog' },
      { status: 500 }
    );
  }
}

