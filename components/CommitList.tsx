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
    <div className="border border-gray-200 dark:border-gray-800 rounded-md max-h-96 overflow-y-auto">
      {commits.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No commits found in the specified range</p>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-900">
          {commits.map((commit) => (
            <label
              key={commit.hash}
              className="flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-950 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCommits.includes(commit.hash)}
                onChange={() => onToggleCommit(commit.hash)}
                className="mt-0.5 mr-3 rounded border-gray-300 dark:border-gray-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {commit.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {commit.author} • {format(commit.date, 'MMM d, yyyy')} • {commit.hash.substring(0, 7)}
                </p>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}