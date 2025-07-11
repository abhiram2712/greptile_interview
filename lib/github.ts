export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
  } | null;
  stats?: {
    total: number;
    additions: number;
    deletions: number;
  };
  files?: GitHubFile[];
}

export interface GitHubFile {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  url: string;
}

export function parseGitHubUrl(url: string): GitHubRepo | null {
  const patterns = [
    /github\.com\/([^\/]+)\/([^\/]+)/,
    /github\.com\/([^\/]+)\/([^\/]+)\.git$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace('.git', ''),
        url: `https://github.com/${match[1]}/${match[2].replace('.git', '')}`
      };
    }
  }
  
  return null;
}

export async function fetchGitHubCommits(
  owner: string,
  repo: string,
  since?: string,
  until?: string,
  page: number = 1,
  perPage: number = 100
): Promise<GitHubCommit[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });
  
  // GitHub API expects ISO 8601 format with time
  // 'since' is inclusive - commits after or equal to this time
  // 'until' is exclusive - commits before this time
  if (since) {
    const sinceDate = new Date(since);
    sinceDate.setHours(0, 0, 0, 0);
    params.append('since', sinceDate.toISOString());
  }
  
  if (until) {
    // Add 1 day to include commits from the 'until' date
    // Parse the date string and add time to ensure we get the right date
    const [year, month, day] = until.split('-').map(Number);
    const untilDate = new Date(year, month - 1, day + 1, 0, 0, 0, 0);
    console.log('Original until date:', until);
    console.log('Adjusted until date (should be next day):', untilDate.toISOString());
    params.append('until', untilDate.toISOString());
  }
  
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?${params}`;
  console.log('GitHub API URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      // Add token if available in env
      ...(process.env.GITHUB_TOKEN && {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      })
    }
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    console.error('GitHub API error response:', errorBody);
    throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  
  const data = await response.json();
  console.log('GitHub API response:', data.length, 'commits');
  return data;
}

export function transformGitHubCommit(ghCommit: GitHubCommit) {
  return {
    hash: ghCommit.sha,
    author: ghCommit.author?.login || ghCommit.commit.author.name,
    date: new Date(ghCommit.commit.author.date),
    message: ghCommit.commit.message.split('\n')[0], // First line only
  };
}

export async function fetchCommitDetails(
  owner: string,
  repo: string,
  sha: string
): Promise<GitHubCommit> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      ...(process.env.GITHUB_TOKEN && {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      })
    }
  });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchRepositoryReadme(
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/readme`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.text();
  } catch (error) {
    console.error('Error fetching README:', error);
    return null;
  }
}

export async function fetchRepositoryStructure(
  owner: string,
  repo: string,
  path: string = ''
): Promise<any[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching repository structure:', error);
    return [];
  }
}

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref?: string
): Promise<string | null> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${ref ? `?ref=${ref}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw',
        ...(process.env.GITHUB_TOKEN && {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
        })
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.text();
  } catch (error) {
    console.error('Error fetching file content:', error);
    return null;
  }
}