import { prisma } from '@/lib/prisma';
import { fetchCommitDetails } from '@/lib/github';
import { GitCommit } from '@/lib/git';

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

export class CommitService {
  async getOrFetchCommits(
    projectId: string,
    projectOwner: string,
    projectRepo: string,
    commits: GitCommit[],
    limit: number = 5
  ): Promise<CommitWithDiff[]> {
    const commitHashes = commits.slice(0, limit).map(c => c.hash);
    
    // Check which commits we already have
    const existingCommits = await prisma.commit.findMany({
      where: {
        projectId,
        sha: { in: commitHashes },
        diff: { not: null }, // Only get commits with diffs
      },
    });
    
    const existingCommitMap = new Map(existingCommits.map(c => [c.sha, c]));
    const commitsToFetch = commits.slice(0, limit).filter(c => !existingCommitMap.has(c.hash));
    
    // Fetch missing commits in parallel
    const fetchPromises = commitsToFetch.map(async (commit) => {
      try {
        const githubCommit = await fetchCommitDetails(projectOwner, projectRepo, commit.hash);

        return prisma.commit.upsert({
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
        return prisma.commit.upsert({
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
    });
    
    const newCommits = await Promise.all(fetchPromises);
    
    // Combine existing and new commits in the correct order
    return commits.slice(0, limit).map(c => 
      existingCommitMap.get(c.hash) || newCommits.find(nc => nc.sha === c.hash)
    ).filter(Boolean) as CommitWithDiff[];
  }
}

export const commitService = new CommitService();