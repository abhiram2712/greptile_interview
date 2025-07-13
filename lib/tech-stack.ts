import { fetchFileContent } from '@/lib/github';
import { TechStack, RepositoryFile } from '@/lib/types';

export async function detectTechStack(
  owner: string, 
  repo: string, 
  structure: RepositoryFile[]
): Promise<TechStack> {
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