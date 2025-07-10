import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface GitCommit {
  hash: string;
  author: string;
  date: Date;
  message: string;
}

export async function getCommits(since?: string, until?: string): Promise<GitCommit[]> {
  try {
    let command = 'git log --pretty=format:"%H|%an|%ad|%s" --date=iso';
    
    if (since) {
      command += ` --since="${since}"`;
    }
    
    if (until) {
      command += ` --until="${until}"`;
    }

    const { stdout } = await execAsync(command);
    
    if (!stdout) {
      return [];
    }

    const commits = stdout.split('\n').map(line => {
      const [hash, author, date, message] = line.split('|');
      return {
        hash: hash.trim(),
        author: author.trim(),
        date: new Date(date.trim()),
        message: message.trim()
      };
    });

    return commits;
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

export async function getCommitDetails(hash: string): Promise<string> {
  try {
    const { stdout } = await execAsync(`git show --format=fuller --no-patch ${hash}`);
    return stdout;
  } catch (error) {
    console.error('Error fetching commit details:', error);
    return '';
  }
}