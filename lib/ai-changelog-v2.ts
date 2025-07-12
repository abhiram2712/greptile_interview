import OpenAI from 'openai';
import { Commit, ProjectContext } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CommitWithDiff {
  id: string;
  projectId: string;
  sha: string;
  message: string;
  author: string;
  date: Date;
  diff?: string | null;
  filesChanged?: any;
  additions?: number | null;
  deletions?: number | null;
}

interface EnhancedChangelogOptions {
  includeProjectSummary?: boolean;
  summaryOnly?: boolean;
}

interface ChangelogResult {
  summary: string;
  content: string;
  projectSummary?: string;
}

export async function generateProjectSummary(
  projectContext: ProjectContext | null,
  readme?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  if (!projectContext) {
    return 'Project summary not available.';
  }

  const techStack = projectContext?.techStack as any;
  const structure = projectContext?.structure as any;

  const prompt = `Analyze this project and create a concise, professional project summary suitable for a changelog page.

Project Information:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}

${readme ? `README Content:\n${readme}\n` : ''}

${structure ? `Key Files:\n${structure.filter((f: any) => !f.type || f.type === 'file').slice(0, 20).map((f: any) => f.name).join(', ')}\n` : ''}

Create a 2-3 paragraph project summary that:
1. First paragraph: Explain what the project is and its primary purpose
2. Second paragraph: Highlight key features and technical architecture
3. Optional third paragraph: Mention any notable integrations or unique aspects

Keep it professional, concise, and developer-focused. Write in plain text without any markdown formatting. Do not include installation instructions or getting started info.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer creating project descriptions for developer documentation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || 'Unable to generate project summary.';
  } catch (error) {
    console.error('Error generating project summary:', error);
    throw error;
  }
}

export async function generateEnhancedChangelog(
  commits: CommitWithDiff[],
  projectContext?: ProjectContext | null,
  previousChangelog?: string,
  options: EnhancedChangelogOptions = {}
): Promise<ChangelogResult> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Build enhanced context
  const techStack = projectContext?.techStack as any;
  const contextSection = projectContext ? `
Project Context:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}
${projectContext.readme ? `\nProject Description:\n${projectContext.readme.substring(0, 800)}...\n` : ''}
` : '';

  // Analyze commits for patterns
  const commitAnalysis = analyzeCommits(commits);
  
  // Build detailed commit information with better structure
  const commitDetails = commits.map(c => {
    const files = c.filesChanged as string[] || [];
    const componentChanges = categorizeFileChanges(files);
    
    return `
### Commit: ${c.sha.substring(0, 7)}
**Message:** ${c.message}
**Author:** ${c.author}
**Impact:** +${c.additions || 0} -${c.deletions || 0} lines

${componentChanges.length > 0 ? `**Components affected:**\n${componentChanges.map(c => `- ${c}`).join('\n')}` : ''}

${c.diff && c.diff.length > 0 ? `**Key changes:**\n\`\`\`diff\n${c.diff.substring(0, 800)}${c.diff.length > 800 ? '\n...[truncated]' : ''}\n\`\`\`` : ''}
`;
  }).join('\n---\n');

  const prompt = `You are creating a professional changelog entry in the style of Stripe's documentation. Analyze these commits and create a comprehensive changelog.

${contextSection}

${previousChangelog ? `Previous changelog:\n${previousChangelog}\n` : ''}

Commit Analysis:
- Total commits: ${commits.length}
- Main contributors: ${commitAnalysis.authors.join(', ')}
- Files changed: ${commitAnalysis.totalFiles}
- Lines added: ${commitAnalysis.totalAdditions}
- Lines removed: ${commitAnalysis.totalDeletions}

${commitDetails}

Create a changelog with this EXACT structure:

1. TITLE: A clear, action-oriented title (e.g., "Enhanced Authentication with OAuth Support")

2. VERSION & DATE: Include if available

3. OVERVIEW: 2-3 sentences explaining the overall impact of these changes

4. ## What's New
Brief introduction followed by bullet points of new features/capabilities

5. ## Changes
Organized by component or area:
### [Component/Area Name]
- Specific change with technical details
- Include relevant code snippets where helpful

6. ## Improvements
Performance, developer experience, or other enhancements

7. ## Bug Fixes
List of resolved issues with brief descriptions

8. ## Breaking Changes (if any)
Clear documentation of any breaking changes

9. ## Migration Guide (if needed)
Step-by-step migration instructions

Use:
- Clear, technical language
- Code blocks with syntax highlighting
- Specific component and API names
- Present tense for current state
- Links to related documentation (use placeholder [docs])

Example snippet:
### API Client
- Added new \`createPaymentIntent\` method with enhanced error handling
- Improved request retry logic with exponential backoff

\`\`\`typescript
const intent = await client.createPaymentIntent({
  amount: 2000,
  currency: 'usd',
  payment_method_types: ['card', 'us_bank_account']
});
\`\`\``;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a senior technical writer at a developer tools company. Create changelogs that are informative, well-structured, and developer-friendly. Focus on clarity and technical accuracy.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0]?.message?.content || 'Failed to generate changelog';
    
    // Extract summary (first line or overview section)
    const summaryMatch = content.match(/^(.+?)(\n|$)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : 'Changelog update';

    let result: ChangelogResult = {
      summary,
      content
    };

    // Generate project summary if requested
    if (options.includeProjectSummary && projectContext) {
      result.projectSummary = await generateProjectSummary(projectContext, projectContext.readme || undefined);
    }

    return result;
  } catch (error) {
    console.error('Error generating enhanced changelog:', error);
    throw error;
  }
}

function analyzeCommits(commits: CommitWithDiff[]) {
  const authors = [...new Set(commits.map(c => c.author))];
  const allFiles = commits.flatMap(c => (c.filesChanged as string[]) || []);
  const uniqueFiles = [...new Set(allFiles)];
  
  return {
    authors,
    totalFiles: uniqueFiles.length,
    totalAdditions: commits.reduce((sum, c) => sum + (c.additions || 0), 0),
    totalDeletions: commits.reduce((sum, c) => sum + (c.deletions || 0), 0),
    filesByType: categorizeFiles(uniqueFiles)
  };
}

function categorizeFiles(files: string[]): Record<string, string[]> {
  const categories: Record<string, string[]> = {
    components: [],
    api: [],
    config: [],
    tests: [],
    docs: [],
    styles: [],
    other: []
  };

  files.forEach(file => {
    if (file.includes('/components/') || file.endsWith('.tsx') || file.endsWith('.jsx')) {
      categories.components.push(file);
    } else if (file.includes('/api/') || file.includes('/pages/api/') || file.includes('/app/api/')) {
      categories.api.push(file);
    } else if (file.includes('config') || file.endsWith('.json') || file.endsWith('.yml') || file.endsWith('.yaml')) {
      categories.config.push(file);
    } else if (file.includes('test') || file.includes('spec')) {
      categories.tests.push(file);
    } else if (file.endsWith('.md') || file.includes('docs/')) {
      categories.docs.push(file);
    } else if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.sass')) {
      categories.styles.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

function categorizeFileChanges(files: string[]): string[] {
  const components = new Set<string>();
  
  files.forEach(file => {
    // Extract component or module name
    if (file.includes('/components/')) {
      const match = file.match(/\/components\/(.+?)\//);
      if (match) components.add(`Component: ${match[1]}`);
    } else if (file.includes('/api/')) {
      const match = file.match(/\/api\/(.+?)(\/|\.)/);
      if (match) components.add(`API: ${match[1]}`);
    } else if (file.includes('/lib/')) {
      const match = file.match(/\/lib\/(.+?)\./);
      if (match) components.add(`Library: ${match[1]}`);
    } else if (file.includes('/pages/')) {
      const match = file.match(/\/pages\/(.+?)(\/|\.)/);
      if (match) components.add(`Page: ${match[1]}`);
    }
  });
  
  return Array.from(components);
}