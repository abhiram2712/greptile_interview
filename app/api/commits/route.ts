import { NextRequest, NextResponse } from 'next/server';
import { fetchGitHubCommits, transformGitHubCommit } from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const since = searchParams.get('since') || undefined;
    const until = searchParams.get('until') || undefined;


    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const githubCommits = await fetchGitHubCommits(
      project.owner,
      project.repo,
      since,
      until
    );

    const commits = githubCommits.map(transformGitHubCommit);

    return NextResponse.json({ commits });
  } catch (error: any) {
    console.error('Error in commits API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch commits' },
      { status: 500 }
    );
  }
}