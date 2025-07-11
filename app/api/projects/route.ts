import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl } from '@/lib/github';
import { prisma } from '@/lib/prisma';
import { generateProjectSlug } from '@/lib/utils';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUrl } = body;
    
    if (!githubUrl) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 }
      );
    }
    
    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid GitHub URL' },
        { status: 400 }
      );
    }
    
    const slug = generateProjectSlug(parsed.owner, parsed.repo);
    
    // Check if slug already exists
    const existing = await prisma.project.findUnique({
      where: { slug },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Project already exists' },
        { status: 409 }
      );
    }
    
    const project = await prisma.project.create({
      data: {
        name: body.name || `${parsed.owner}/${parsed.repo}`,
        githubUrl: parsed.url,
        owner: parsed.owner,
        repo: parsed.repo,
        slug,
      },
    });
    
    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
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
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }
    
    const project = await prisma.project.delete({
      where: { id },
    }).catch(() => null);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}