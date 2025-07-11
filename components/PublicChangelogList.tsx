'use client';

import { format } from 'date-fns';
import Link from 'next/link';

interface ChangelogEntry {
  id: string;
  date: Date;
  version?: string | null;
  summary: string;
  content: string;
}

interface PublicChangelogListProps {
  entries: ChangelogEntry[];
  projectSlug: string;
}

export default function PublicChangelogList({ entries, projectSlug }: PublicChangelogListProps) {
  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <Link
          key={entry.id}
          href={`/p/${projectSlug}/${entry.id}`}
          className="block group"
        >
          <div className="flex items-baseline justify-between py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                {entry.summary || 'Changelog Update'}
              </h3>
            </div>
            <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
              {entry.version && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                  v{entry.version}
                </span>
              )}
              <time>{format(new Date(entry.date), 'MMM d, yyyy')}</time>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}