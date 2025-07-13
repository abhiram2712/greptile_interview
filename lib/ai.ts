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