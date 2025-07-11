import { NextRequest, NextResponse } from 'next/server';
import { 
  fetchRepositoryReadme, 
  fetchRepositoryStructure, 
  fetchFileContent 
} from '@/lib/github';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find the project
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

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

    // Update or create project context
    const context = await prisma.projectContext.upsert({
      where: { projectId: params.id },
      update: {
        readme,
        structure,
        mainFiles: keyFiles,
        techStack,
      },
      create: {
        projectId: params.id,
        readme,
        structure,
        mainFiles: keyFiles,
        techStack,
      },
    });


    return NextResponse.json({ context });
  } catch (error: any) {
    console.error('Error updating project context:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update project context' },
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