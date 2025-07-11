'use client';

import { ChangelogEntry as ChangelogEntryType } from '@/lib/storage';
import { format } from 'date-fns';

interface ChangelogEntryProps {
  entry: ChangelogEntryType;
  onDelete?: (id: string) => void;
}

export default function ChangelogEntry({ entry, onDelete }: ChangelogEntryProps) {
  return (
    <article className="py-6 last:pb-0">
      <div className="flex items-baseline justify-between mb-3">
        <time className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {format(new Date(entry.date), 'MMM d, yyyy')}
          {entry.version && <span className="ml-2 text-gray-500">v{entry.version}</span>}
        </time>
        {onDelete && (
          <button
            onClick={() => onDelete(entry.id)}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
      
      {entry.summary && (
        <h3 className="text-sm text-gray-800 dark:text-gray-200 mb-2">
          {entry.summary}
        </h3>
      )}
      
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {entry.content.split('\n').map((line, i) => (
          line.trim() && <p key={i} className="mb-1">{line}</p>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        {entry.author} • {entry.commits.length} commits
      </div>
    </article>
  );
}