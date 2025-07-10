'use client';

import { GitCommit } from '@/lib/git';
import { format } from 'date-fns';

interface CommitListProps {
  commits: GitCommit[];
  selectedCommits: string[];
  onToggleCommit: (hash: string) => void;
}

export default function CommitList({ commits, selectedCommits, onToggleCommit }: CommitListProps) {
  return (
    <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
      {commits.length === 0 ? (
        <p className="text-gray-500 text-center">No commits found in the specified range</p>
      ) : (
        commits.map((commit) => (
          <label
            key={commit.hash}
            className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedCommits.includes(commit.hash)}
              onChange={() => onToggleCommit(commit.hash)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium">{commit.message}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {commit.author} • {format(commit.date, 'MMM d, yyyy HH:mm')}
              </p>
              <p className="text-xs text-gray-500 font-mono">{commit.hash.substring(0, 7)}</p>
            </div>
          </label>
        ))
      )}
    </div>
  );
}