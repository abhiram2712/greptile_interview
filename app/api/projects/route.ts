import { NextRequest, NextResponse } from 'next/server';
import { parseGitHubUrl, checkRepositoryAccess } from '@/lib/github';
import { prisma } from '@/lib/prisma';
import { generateProjectSlug } from '@/lib/utils';
import { createApiRoute, ApiError } from '@/lib/api-utils';

export const GET = createApiRoute(async () => {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      context: true,
    },
  });
  return NextResponse.json({ projects });
});

export const POST = createApiRoute(async (request: NextRequest) => {
  const body = await request.json();
  const { githubUrl } = body;
  
  if (!githubUrl) {
    throw new ApiError('GitHub URL is required', 400);
  }
  
  const parsed = parseGitHubUrl(githubUrl);
  if (!parsed) {
    throw new ApiError('Invalid GitHub URL', 400);
  }
  
  // Check if repository is public
  const accessCheck = await checkRepositoryAccess(parsed.owner, parsed.repo);
  if (!accessCheck.isPublic) {
    throw new ApiError(accessCheck.error || 'Repository is not accessible', 403);
  }
  
  const slug = generateProjectSlug(parsed.owner, parsed.repo);
  
  // Check if slug already exists
  const existing = await prisma.project.findUnique({
    where: { slug },
  });
  
  if (existing) {
    throw new ApiError('Project already exists', 409);
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
  
  // Trigger background context fetching
  // We don't await this - let it run in the background
  fetch(`${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/api/projects/${project.id}/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  }).catch(error => {
    console.error('Background context fetch failed:', error);
  });
  
  return NextResponse.json({ project });
});

export const DELETE = createApiRoute(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  
  if (!id) {
    throw new ApiError('Project ID is required', 400);
  }
  
  const project = await prisma.project.delete({
    where: { id },
  }).catch(() => null);
  
  if (!project) {
    throw new ApiError('Project not found', 404);
  }
  
  return NextResponse.json({ success: true });
});