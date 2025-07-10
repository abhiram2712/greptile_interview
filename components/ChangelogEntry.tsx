'use client';

import { ChangelogEntry as ChangelogEntryType } from '@/lib/storage';
import { format } from 'date-fns';

interface ChangelogEntryProps {
  entry: ChangelogEntryType;
  onDelete?: (id: string) => void;
}

export default function ChangelogEntry({ entry, onDelete }: ChangelogEntryProps) {
  return (
    <article className="py-8 border-b border-gray-100 dark:border-gray-900 last:border-0">
      <div className="flex items-baseline justify-between mb-4">
        <time className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {format(new Date(entry.date), 'MMM d, yyyy')}
          {entry.version && <span className="ml-2 text-gray-500 dark:text-gray-500">v{entry.version}</span>}
        </time>
        {onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      
      {entry.summary && (
        <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">
          {entry.summary}
        </h3>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
        {entry.content.split('\n').map((line, i) => (
          line.trim() && <p key={i}>{line}</p>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 dark:text-gray-600">
        {entry.author} • {entry.commits.length} commits
      </div>
    </article>
  );
}