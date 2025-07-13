import OpenAI from 'openai';
import { GitCommit } from '@/lib/git';
import { ProjectContext, TechStack, RepositoryFile } from '@/lib/types';

interface CommitWithDiff {
  id: string;
  projectId: string;
  sha: string;
  message: string;
  author: string;
  date: Date;
  diff?: string | null;
  filesChanged?: string[] | null;
  additions?: number | null;
  deletions?: number | null;
}

interface ChangelogOptions {
  useContext?: boolean;
  includeProjectSummary?: boolean;
  quickMode?: boolean;
  previousContext?: string;
}

interface ChangelogResult {
  summary: string;
  content: string;
  projectSummary?: string;
}

interface CommitAnalysis {
  authors: string[];
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
}

export class AIChangelogService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateChangelog(
    commits: CommitWithDiff[] | GitCommit[],
    projectContext?: ProjectContext | null,
    options: ChangelogOptions = {}
  ): Promise<ChangelogResult> {
    if (options.quickMode || !projectContext) {
      const summary = await this.generateQuickChangelog(
        commits as GitCommit[],
        options.previousContext
      );
      return { summary, content: summary };
    }

    if (options.useContext === false) {
      const summary = await this.generateBasicChangelog(
        commits as CommitWithDiff[],
        projectContext,
        options.previousContext
      );
      return { summary, content: summary };
    }

    return this.generateEnhancedChangelog(
      commits as CommitWithDiff[],
      projectContext,
      options.previousContext
    );
  }

  async generateProjectSummary(
    projectContext: ProjectContext | null,
    readme?: string
  ): Promise<string> {
    if (!projectContext) {
      return 'Project summary not available.';
    }

    const techStack = projectContext?.techStack as TechStack | null;
    const structure = projectContext?.structure as RepositoryFile[] | null;

    const prompt = `Analyze this project and create a concise, professional project summary suitable for a changelog page.

Project Information:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}

${readme ? `README Content:\n${readme}\n` : ''}

${structure ? `Key Files:\n${structure.filter((f) => !f.type || f.type === 'file').slice(0, 20).map((f) => f.name).join(', ')}\n` : ''}

Create a 2-3 paragraph project summary that:
1. First paragraph: Explain what the project is and its primary purpose
2. Second paragraph: Highlight key features and technical architecture
3. Optional third paragraph: Mention any notable integrations or unique aspects

Keep it professional, concise, and developer-focused. Write in plain text without any markdown formatting. Do not include installation instructions or getting started info.`;

    try {
      const response = await this.openai.chat.completions.create({
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

  private async generateQuickChangelog(
    commits: GitCommit[],
    previousContext?: string
  ): Promise<string> {
    const commitMessages = commits.map(c => `- ${c.message} (by ${c.author})`).join('\n');

    const prompt = `You are a technical writer creating a changelog in the style of Stripe's documentation. Analyze these git commits and create a concise, developer-friendly changelog.

${previousContext ? `Previous context: ${previousContext}\n` : ''}

Git commits:
${commitMessages}

Create a changelog following this structure:

# [Clear, action-oriented title]

[1-2 sentence summary explaining what changed and why it matters]

## What's new
- [Bullet points of new features/capabilities]
- [Use inline \`code\` for technical terms]

## Changes
- [Technical changes grouped logically]
- [Be specific but concise]

## Bug fixes (if any)
- [Fixed issues with brief descriptions]

Guidelines:
- Use present tense ("adds" not "added")
- Focus on what developers need to know
- Omit empty sections
- Be concise - one line per change when possible

Example:
# Adds flexible webhook retry configuration

You can now configure custom retry policies for webhook endpoints. This allows better handling of transient failures and reduces unnecessary retries.

## What's new
- Custom retry policies with exponential backoff
- Per-endpoint timeout configuration
- New \`webhook.retry\` API methods

## Changes
- Default retry attempts increased from 3 to 5
- Webhook logs now include retry attempt number`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer specializing in developer documentation and changelogs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Failed to generate summary';
  }

  private async generateBasicChangelog(
    commits: CommitWithDiff[],
    projectContext?: ProjectContext | null,
    previousChangelog?: string
  ): Promise<string> {
    let contextSection = '';
    if (projectContext) {
      const techStack = projectContext.techStack as TechStack | null;
      contextSection = `
Project Context:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}

${projectContext.readme ? `README Summary:\n${projectContext.readme.substring(0, 500)}...\n` : ''}
`;
    }

    const commitDetails = commits.map(c => {
      let details = `Commit: ${c.message} (by ${c.author})`;
      if (c.filesChanged) {
        const files = c.filesChanged as string[];
        details += `\nFiles changed: ${files.join(', ')}`;
      }
      if (c.additions || c.deletions) {
        details += `\nChanges: +${c.additions || 0} -${c.deletions || 0}`;
      }
      if (c.diff && c.diff.length > 0) {
        const truncatedDiff = c.diff.length > 1000 
          ? c.diff.substring(0, 1000) + '...[truncated]'
          : c.diff;
        details += `\nDiff preview:\n${truncatedDiff}`;
      }
      return details;
    }).join('\n\n---\n\n');

    const prompt = `You are a technical writer creating a changelog for developer tools. Analyze these code changes and create a user-friendly changelog summary.

${contextSection}

${previousChangelog ? `Previous changelog entry:\n${previousChangelog}\n` : ''}

Detailed commit information:
${commitDetails}

Create a changelog entry with:
1. FIRST LINE: A single, concise summary sentence (max 80 characters) that captures the main change
2. BLANK LINE
3. Detailed changes organized by category (### Added, ### Changed, ### Fixed, ### Removed)
4. Focus on user-facing changes and API changes
5. Use clear, concise language
6. Group related changes together
7. Analyze the actual code changes (diffs) to understand what really changed, not just commit messages
8. Mention specific features, components, or APIs that were affected

Example format:
Improved authentication flow and added OAuth support

### Added
- OAuth 2.0 support for Google and GitHub providers
- New \`useAuth\` hook for React components
- Session persistence with secure cookie storage

### Changed
- Migrated authentication state to Context API
- Updated login UI with provider selection
- Improved error messages for failed authentication

### Fixed
- Session timeout not clearing user data properly
- Email validation accepting invalid formats`;

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a technical writer specializing in developer documentation and changelogs. You analyze code changes to create accurate, helpful changelogs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || 'Failed to generate summary';
  }

  private async generateEnhancedChangelog(
    commits: CommitWithDiff[],
    projectContext?: ProjectContext | null,
    previousChangelog?: string
  ): Promise<ChangelogResult> {
    const techStack = projectContext?.techStack as TechStack | null;
    const contextSection = projectContext ? `
Project Context:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}
${projectContext.readme ? `\nProject Description:\n${projectContext.readme.substring(0, 800)}...\n` : ''}
` : '';

    const commitAnalysis = this.analyzeCommits(commits);
    
    const commitDetails = commits.map(c => {
      const files = c.filesChanged as string[] || [];
      const componentChanges = this.categorizeFileChanges(files);
      
      return `
### Commit: ${c.sha.substring(0, 7)}
**Message:** ${c.message}
**Author:** ${c.author}
**Impact:** +${c.additions || 0} -${c.deletions || 0} lines

${componentChanges.length > 0 ? `**Components affected:**\n${componentChanges.map(c => `- ${c}`).join('\n')}` : ''}

${c.diff && c.diff.length > 0 ? `**Key changes:**\n\`\`\`diff\n${c.diff.substring(0, 800)}${c.diff.length > 800 ? '\n...[truncated]' : ''}\n\`\`\`` : ''}
`;
    }).join('\n---\n');

    const prompt = `You are creating a professional changelog entry in the style of Stripe's documentation. Analyze these commits and create a focused, developer-friendly changelog.

${contextSection}

${previousChangelog ? `Previous changelog:\n${previousChangelog}\n` : ''}

Commit Analysis:
- Total commits: ${commits.length}
- Main contributors: ${commitAnalysis.authors.join(', ')}
- Files changed: ${commitAnalysis.totalFiles}
- Lines added: ${commitAnalysis.totalAdditions}
- Lines removed: ${commitAnalysis.totalDeletions}

${commitDetails}

Create a changelog following this structure:

# [Clear, action-oriented title describing the main change]

[2-3 sentence summary explaining what was changed and why it matters to developers]

## What's new
- [Concise bullet points of new features or capabilities]
- [Focus on user-facing changes and benefits]
- [Use inline code for method names, parameters, etc.]

## Impact
Explain who this affects and how they can benefit from these changes.

## Changes
[Group by component or logical area if multiple changes]
- [Specific technical change with brief explanation]
- [Include code snippets only if they clarify usage]

## Bug fixes (if any)
- [Brief description of fixed issues]

## Breaking changes (if any)
- [Clear description of what breaks and why]

## Upgrade (if breaking changes)
[Version-specific upgrade instructions if needed]

Guidelines:
- Use present tense ("adds" not "added")
- Be concise - one line per change when possible  
- Use inline \`code\` for technical terms
- Only include code blocks if they demonstrate usage
- Focus on what developers need to know
- Omit sections that don't apply

Example of good style:
"Adds support for webhook endpoint configuration. You can now configure multiple webhook endpoints with custom retry policies."`;

    const response = await this.openai.chat.completions.create({
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
      max_tokens: 2000,
    });

    const generatedContent = response.choices[0]?.message?.content || 'Failed to generate changelog';
    
    const lines = generatedContent.split('\n');
    const titleMatch = lines[0].match(/^#\s+(.+)$/);
    const summary = titleMatch ? titleMatch[1] : lines[0];

    return {
      summary,
      content: generatedContent,
      projectSummary: projectContext?.summary || undefined
    };
  }

  private analyzeCommits(commits: CommitWithDiff[]): CommitAnalysis {
    const authors = new Set<string>();
    let totalAdditions = 0;
    let totalDeletions = 0;
    const filesChanged = new Set<string>();

    commits.forEach(commit => {
      authors.add(commit.author);
      totalAdditions += commit.additions || 0;
      totalDeletions += commit.deletions || 0;
      
      if (commit.filesChanged) {
        const files = commit.filesChanged as string[];
        files.forEach(f => filesChanged.add(f));
      }
    });

    return {
      authors: Array.from(authors),
      totalFiles: filesChanged.size,
      totalAdditions,
      totalDeletions,
    };
  }

  private categorizeFileChanges(files: string[]): string[] {
    const categories = new Map<string, Set<string>>();
    
    files.forEach(file => {
      let category = 'Other';
      
      if (file.includes('components/')) category = 'Components';
      else if (file.includes('pages/') || file.includes('app/')) category = 'Pages/Routes';
      else if (file.includes('lib/') || file.includes('utils/')) category = 'Libraries/Utilities';
      else if (file.includes('styles/') || file.includes('.css')) category = 'Styles';
      else if (file.includes('public/')) category = 'Assets';
      else if (file.includes('api/')) category = 'API';
      else if (file.includes('.config.') || file.includes('package.json')) category = 'Configuration';
      else if (file.includes('test') || file.includes('spec')) category = 'Tests';
      
      if (!categories.has(category)) {
        categories.set(category, new Set());
      }
      categories.get(category)!.add(file);
    });
    
    const result: string[] = [];
    categories.forEach((files, category) => {
      if (files.size > 0) {
        result.push(`${category} (${files.size} files)`);
      }
    });
    
    return result;
  }
}

// Export singleton instance
export const aiChangelogService = new AIChangelogService();