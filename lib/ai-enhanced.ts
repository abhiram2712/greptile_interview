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

export async function generateChangelogWithContext(
  commits: CommitWithDiff[],
  projectContext?: ProjectContext | null,
  previousChangelog?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  // Build context about the project
  let contextSection = '';
  if (projectContext) {
    const techStack = projectContext.techStack as any;
    contextSection = `
Project Context:
- Technologies: ${techStack?.languages?.join(', ') || 'Unknown'}
- Frameworks: ${techStack?.frameworks?.join(', ') || 'Unknown'}
- Tools: ${techStack?.tools?.join(', ') || 'Unknown'}

${projectContext.readme ? `README Summary:\n${projectContext.readme.substring(0, 500)}...\n` : ''}
`;
  }

  // Build detailed commit information
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
      // Truncate very long diffs
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

  try {
    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error('Error generating changelog summary:', error);
    throw error;
  }
}