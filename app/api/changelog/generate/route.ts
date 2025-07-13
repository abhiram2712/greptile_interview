import { NextRequest, NextResponse } from 'next/server';
import { GitCommit } from '@/lib/git';
import { prisma } from '@/lib/prisma';
import { 
  fetchRepositoryReadme,
  fetchRepositoryStructure
} from '@/lib/github';
import { detectTechStack } from '@/lib/tech-stack';
import { aiChangelogService } from '@/lib/services/ai-service';
import { commitService } from '@/lib/services/commit-service';
import { createApiRoute, ApiError } from '@/lib/api-utils';

export const POST = createApiRoute(async (request: NextRequest) => {
    const body = await request.json();
    const { commits, previousContext, projectId, useEnhanced = true } = body;

    if (!commits || !Array.isArray(commits)) {
      throw new ApiError('Invalid commits data', 400);
    }

    // If no projectId, fall back to simple version
    if (!projectId) {
      const result = await aiChangelogService.generateChangelog(
        commits as GitCommit[],
        null,
        { previousContext }
      );
      return NextResponse.json({ summary: result.summary });
    }

    // Fetch project with context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { context: true },
    });

    if (!project) {
      throw new ApiError('Project not found', 404);
    }

    // Use the commit service to get or fetch commits
    const detailedCommits = await commitService.getOrFetchCommits(
      projectId,
      project.owner,
      project.repo,
      commits,
      5
    );

    // Check if context needs updating (older than 30 days or missing)
    const contextAge = project.context?.updatedAt 
      ? (Date.now() - new Date(project.context.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    
    // Only update context if it's really old or missing key data
    if (!project.context || contextAge > 30 || (!project.context.summary && !project.context.readme)) {
      try {
        // Fetch README
        const readme = await fetchRepositoryReadme(project.owner, project.repo);
        
        // Fetch repository structure
        const structure = await fetchRepositoryStructure(project.owner, project.repo);
        
        // Detect tech stack
        const techStack = await detectTechStack(project.owner, project.repo, structure);
        
        // Generate project summary if missing
        let summary = project.context?.summary;
        if (!summary && readme) {
          try {
            const tempContext = { readme, structure, techStack, projectId: '', id: '', updatedAt: new Date() };
            summary = await aiChangelogService.generateProjectSummary(tempContext, readme);
          } catch (summaryError) {
            console.error('Error generating project summary:', summaryError);
            // Continue without summary
          }
        }
        
        // Update or create project context
        project.context = await prisma.projectContext.upsert({
          where: { projectId },
          update: {
            readme,
            structure,
            techStack,
            status: 'ready',
            ...(summary && { summary }),
          },
          create: {
            projectId,
            readme,
            structure,
            techStack,
            status: 'ready',
            ...(summary && { summary }),
          },
        });
      } catch (error) {
        console.error('Error updating project context:', error);
        // Continue without context if it fails
      }
    }
    
    // Generate changelog using the unified service
    const result = await aiChangelogService.generateChangelog(
      detailedCommits,
      project.context,
      {
        useContext: useEnhanced,
        previousContext,
        includeProjectSummary: false
      }
    );
    
    return NextResponse.json({ 
      summary: result.summary,
      content: result.content,
      projectSummary: project.context?.summary 
    });
});

