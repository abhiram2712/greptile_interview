import { NextRequest, NextResponse } from 'next/server';
import { fetchCommitDetails } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { sha: string } }
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

    // First check if we have the commit in our database
    const existingCommit = await prisma.commit.findFirst({
      where: {
        projectId,
        sha: params.sha,
      },
    });

    if (existingCommit?.diff) {
      return NextResponse.json({ commit: existingCommit });
    }

    // If not, fetch from GitHub
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const githubCommit = await fetchCommitDetails(
      project.owner,
      project.repo,
      params.sha
    );

    // Update or create the commit with full details
    const commit = await prisma.commit.upsert({
      where: {
        projectId_sha: {
          projectId,
          sha: params.sha,
        },
      },
      update: {
        diff: githubCommit.files?.map(f => f.patch).filter(Boolean).join('\n\n'),
        filesChanged: githubCommit.files?.map(f => f.filename) || [],
        additions: githubCommit.stats?.additions || 0,
        deletions: githubCommit.stats?.deletions || 0,
      },
      create: {
        projectId,
        sha: params.sha,
        message: githubCommit.commit.message,
        author: githubCommit.author?.login || githubCommit.commit.author.name,
        date: new Date(githubCommit.commit.author.date),
        diff: githubCommit.files?.map(f => f.patch).filter(Boolean).join('\n\n'),
        filesChanged: githubCommit.files?.map(f => f.filename) || [],
        additions: githubCommit.stats?.additions || 0,
        deletions: githubCommit.stats?.deletions || 0,
      },
    });

    return NextResponse.json({ commit });
  } catch (error: any) {
    console.error('Error fetching commit details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commit details' },
      { status: 500 }
    );
  }
}