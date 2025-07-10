import OpenAI from 'openai';
import { GitCommit } from './git';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChangelogSummary(
  commits: GitCommit[],
  previousContext?: string
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const commitMessages = commits.map(c => `- ${c.message} (by ${c.author})`).join('\n');

  const prompt = `You are a technical writer creating a changelog for developer tools. Analyze these git commits and create a user-friendly changelog summary.

${previousContext ? `Previous context: ${previousContext}\n` : ''}

Git commits:
${commitMessages}

Create a changelog entry with:
1. A brief summary (1-2 sentences)
2. Categorized changes (Added, Changed, Fixed, Removed)
3. Focus on user-facing changes, not internal refactoring
4. Use clear, concise language
5. Group related changes together

Format the output in Markdown.`;

  try {
    const response = await openai.chat.completions.create({
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
  } catch (error) {
    console.error('Error generating changelog summary:', error);
    throw error;
  }
}