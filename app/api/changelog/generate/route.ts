import { NextRequest, NextResponse } from 'next/server';
import { generateChangelogSummary } from '@/lib/ai';
import { generateChangelogWithContext } from '@/lib/ai-enhanced';
import { generateEnhancedChangelog, generateProjectSummary } from '@/lib/ai-changelog-v2';
import { GitCommit } from '@/lib/git';
import { prisma } from '@/lib/prisma';
import { 
  fetchCommitDetails,
  fetchRepositoryReadme,
  fetchRepositoryStructure,
  fetchFileContent
} from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { commits, previousContext, projectId, useEnhanced = true } = body;

    if (!commits || !Array.isArray(commits)) {
      return NextResponse.json(
        { error: 'Invalid commits data' },
        { status: 400 }
      );
    }

    // If no projectId, fall back to simple version
    if (!projectId) {
      const summary = await generateChangelogSummary(
        commits as GitCommit[],
        previousContext
      );
      return NextResponse.json({ summary });
    }

    // Fetch project with context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { context: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch or create detailed commit information
    const detailedCommits = await Promise.all(
      commits.slice(0, 10).map(async (commit: GitCommit) => {
        // Check if we already have this commit in the database
        let dbCommit = await prisma.commit.findFirst({
          where: {
            projectId,
            sha: commit.hash,
          },
        });

        // If not, or if we don't have the diff, fetch from GitHub
        if (!dbCommit || !dbCommit.diff) {
          try {
            const githubCommit = await fetchCommitDetails(
              project.owner,
              project.repo,
              commit.hash
            );

            dbCommit = await prisma.commit.upsert({
              where: {
                projectId_sha: {
                  projectId,
                  sha: commit.hash,
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
                sha: commit.hash,
                message: commit.message,
                author: commit.author,
                date: new Date(commit.date),
                diff: githubCommit.files?.map(f => f.patch).filter(Boolean).join('\n\n'),
                filesChanged: githubCommit.files?.map(f => f.filename) || [],
                additions: githubCommit.stats?.additions || 0,
                deletions: githubCommit.stats?.deletions || 0,
              },
            });
          } catch (error) {
            console.error(`Failed to fetch details for commit ${commit.hash}:`, error);
            // Create basic commit without diff
            dbCommit = await prisma.commit.upsert({
              where: {
                projectId_sha: {
                  projectId,
                  sha: commit.hash,
                },
              },
              update: {},
              create: {
                projectId,
                sha: commit.hash,
                message: commit.message,
                author: commit.author,
                date: new Date(commit.date),
              },
            });
          }
        }

        return dbCommit;
      })
    );

    // Check if context needs updating (older than 7 days or missing)
    const contextAge = project.context?.updatedAt 
      ? (Date.now() - new Date(project.context.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;
    
    if (!project.context || contextAge > 7 || !project.context.summary) {
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
            summary = await generateProjectSummary(tempContext, readme);
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
            ...(summary && { summary }),
          },
          create: {
            projectId,
            readme,
            structure,
            techStack,
            ...(summary && { summary }),
          },
        });
      } catch (error) {
        console.error('Error updating project context:', error);
        // Continue without context if it fails
      }
    }
    
    // Generate changelog based on the selected method
    if (useEnhanced) {
      const result = await generateEnhancedChangelog(
        detailedCommits,
        project.context,
        previousContext,
        { includeProjectSummary: false } // We'll handle summary separately
      );
      
      return NextResponse.json({ 
        summary: result.summary,
        content: result.content,
        projectSummary: project.context?.summary 
      });
    } else {
      // Fall back to original method
      const summary = await generateChangelogWithContext(
        detailedCommits,
        project.context,
        previousContext
      );

      return NextResponse.json({ summary });
    }
  } catch (error) {
    console.error('Error generating changelog:', error);
    return NextResponse.json(
      { error: 'Failed to generate changelog summary' },
      { status: 500 }
    );
  }
}

async function detectTechStack(owner: string, repo: string, structure: any[]) {
  const techStack = {
    languages: new Set<string>(),
    frameworks: new Set<string>(),
    tools: new Set<string>(),
  };

  // Check for package.json
  const hasPackageJson = structure.some(f => f.name === 'package.json');
  if (hasPackageJson) {
    try {
      const packageJsonContent = await fetchFileContent(owner, repo, 'package.json');
      if (packageJsonContent) {
        const packageJson = JSON.parse(packageJsonContent);
        
        // Detect frameworks
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        if (deps.next) techStack.frameworks.add('Next.js');
        if (deps.react) techStack.frameworks.add('React');
        if (deps.vue) techStack.frameworks.add('Vue');
        if (deps.express) techStack.frameworks.add('Express');
        if (deps.typescript) techStack.languages.add('TypeScript');
        if (deps.prisma) techStack.tools.add('Prisma');
        if (deps.tailwindcss) techStack.frameworks.add('Tailwind CSS');
        
        techStack.languages.add('JavaScript');
      }
    } catch (e) {
      console.error('Error parsing package.json:', e);
    }
  }

  // Check for other common files
  if (structure.some(f => f.name === 'Cargo.toml')) {
    techStack.languages.add('Rust');
  }
  if (structure.some(f => f.name === 'go.mod')) {
    techStack.languages.add('Go');
  }
  if (structure.some(f => f.name === 'requirements.txt' || f.name === 'setup.py')) {
    techStack.languages.add('Python');
  }
  if (structure.some(f => f.name === 'Gemfile')) {
    techStack.languages.add('Ruby');
  }

  return {
    languages: Array.from(techStack.languages),
    frameworks: Array.from(techStack.frameworks),
    tools: Array.from(techStack.tools),
  };
}