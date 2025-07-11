'use client';

import { ChangelogEntry } from '@/lib/storage';
import { format } from 'date-fns';
import Link from 'next/link';

interface ChangelogListProps {
  entries: ChangelogEntry[];
  projectId: string;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
}

export default function ChangelogList({ entries, projectId, onDelete, onTogglePublish }: ChangelogListProps) {
  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id} className="group relative">
          <Link
            href={`/changelog/${projectId}/${entry.id}`}
            className="block"
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
                <span className={`text-xs px-2 py-0.5 rounded ${
                  entry.published 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {entry.published ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </Link>
          {(onDelete || onTogglePublish) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
              {onTogglePublish && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onTogglePublish(entry.id, !entry.published);
                  }}
                  className={`p-1.5 transition-colors ${
                    entry.published 
                      ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' 
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                  title={entry.published ? 'Unpublish' : 'Publish'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {entry.published ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    )}
                  </svg>
                </button>
              )}
              <Link
                href={`/changelog/${projectId}/${entry.id}/edit`}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                title="Edit"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Link>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(entry.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}