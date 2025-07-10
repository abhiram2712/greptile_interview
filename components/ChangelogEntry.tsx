'use client';

import { ChangelogEntry as ChangelogEntryType } from '@/lib/storage';
import { format } from 'date-fns';

interface ChangelogEntryProps {
  entry: ChangelogEntryType;
  onDelete?: (id: string) => void;
}

export default function ChangelogEntry({ entry, onDelete }: ChangelogEntryProps) {
  return (
    <article className="border-b border-gray-200 dark:border-gray-700 pb-8 mb-8 last:border-0">
      <header className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-2xl font-semibold mb-1">
            {format(new Date(entry.date), 'MMMM d, yyyy')}
            {entry.version && <span className="ml-2 text-gray-600 dark:text-gray-400">v{entry.version}</span>}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            By {entry.author} • {entry.commits.length} commits
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </header>
      
      {entry.summary && (
        <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
          {entry.summary}
        </p>
      )}
      
      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
        {entry.content}
      </div>
    </article>
  );
}