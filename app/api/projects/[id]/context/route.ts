import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchRepositoryReadme, 
  fetchRepositoryStructure
} from '@/lib/github';
import { detectTechStack } from '@/lib/tech-stack';
import { prisma } from '@/lib/prisma';
import { aiChangelogService } from '@/lib/services/ai-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { regenerateSummary } = body;

    // Find the project with context
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { context: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (regenerateSummary) {
      // Just regenerate the summary
      if (!project.context) {
        return NextResponse.json(
          { error: 'Project context not found. Please fetch context first.' },
          { status: 400 }
        );
      }

      const summary = await aiChangelogService.generateProjectSummary(project.context, project.context.readme || undefined);
      
      const updatedContext = await prisma.projectContext.update({
        where: { projectId: params.id },
        data: { summary },
      });

      return NextResponse.json({ context: updatedContext });
    }

    // Create or update context to indexing status
    await prisma.projectContext.upsert({
      where: { projectId: params.id },
      update: { status: 'indexing' },
      create: { 
        projectId: params.id,
        status: 'indexing'
      },
    });

    // Full context update
    // Fetch README
    const readme = await fetchRepositoryReadme(project.owner, project.repo);

    // Fetch repository structure
    const structure = await fetchRepositoryStructure(project.owner, project.repo);

    // Identify key files (package.json, tsconfig.json, etc.)
    const keyFiles = structure.filter(item => 
      item.type === 'file' && 
      ['package.json', 'tsconfig.json', 'README.md', '.env.example'].includes(item.name)
    );

    // Detect tech stack from files
    const techStack = await detectTechStack(project.owner, project.repo, structure);

    // Generate summary
    const tempContext = { readme, structure, techStack, projectId: params.id, id: '', updatedAt: new Date() };
    const summary = await aiChangelogService.generateProjectSummary(tempContext, readme);

    // Update or create project context
    const context = await prisma.projectContext.upsert({
      where: { projectId: params.id },
      update: {
        readme,
        structure,
        mainFiles: keyFiles,
        techStack,
        summary,
        status: 'ready',
      },
      create: {
        projectId: params.id,
        readme,
        structure,
        mainFiles: keyFiles,
        techStack,
        summary,
        status: 'ready',
      },
    });

    return NextResponse.json({ context });
  } catch (error: any) {
    console.error('Error updating project context:', error);
    
    // Mark context as failed
    try {
      await prisma.projectContext.upsert({
        where: { projectId: params.id },
        update: { status: 'failed' },
        create: { 
          projectId: params.id,
          status: 'failed'
        },
      });
    } catch (e) {
      console.error('Failed to update context status:', e);
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to update project context' },
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
    const { summary } = body;

    if (!summary || typeof summary !== 'string') {
      return NextResponse.json(
        { error: 'Summary is required' },
        { status: 400 }
      );
    }

    // Update the summary
    const context = await prisma.projectContext.update({
      where: { projectId: params.id },
      data: { summary },
    });

    return NextResponse.json({ context });
  } catch (error: any) {
    console.error('Error updating project summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project summary' },
      { status: 500 }
    );
  }
}

