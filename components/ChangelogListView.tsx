'use client';

import { ChangelogEntry } from '@/lib/storage';
import { format } from 'date-fns';
import Link from 'next/link';

interface ChangelogListViewProps {
  entries: ChangelogEntry[];
  projectId?: string;
  projectSlug?: string;
  onDelete?: (id: string) => void;
  onTogglePublish?: (id: string, published: boolean) => void;
  isPublicView?: boolean;
  title?: string;
  emptyMessage?: string;
  emptyActionLink?: string;
  emptyActionText?: string;
}

export default function ChangelogListView({ 
  entries, 
  projectId,
  projectSlug,
  onDelete, 
  onTogglePublish,
  isPublicView = false,
  title = 'Changelog',
  emptyMessage = 'No changelog entries yet.',
  emptyActionLink,
  emptyActionText = 'Generate your first changelog'
}: ChangelogListViewProps) {
  const getEntryLink = (entryId: string) => {
    if (isPublicView && projectSlug) {
      return `/p/${projectSlug}/${entryId}`;
    } else if (projectId) {
      return `/dev/changelog/${projectId}/${entryId}`;
    }
    return '#';
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h1>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">{emptyMessage}</p>
          {emptyActionLink && (
            <a
              href={emptyActionLink}
              className="text-sm text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 underline underline-offset-4 transition-colors"
            >
              {emptyActionText}
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => (
            <div key={entry.id} className="group">
              <div className="flex items-center gap-4 py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Link
                  href={getEntryLink(entry.id)}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-baseline justify-between">
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
                      {!isPublicView && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          entry.published 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {entry.published ? 'Published' : 'Draft'}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                {!isPublicView && (onDelete || onTogglePublish) && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 flex-shrink-0">
                    {onTogglePublish && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onTogglePublish(entry.id, !entry.published);
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          entry.published 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        title={entry.published ? 'Unpublish' : 'Publish'}
                      >
                        {entry.published ? 'Unpublish' : 'Publish'}
                      </button>
                    )}
                    {onDelete && projectId && (
                      <Link
                        href={`/dev/changelog/${projectId}/${entry.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        title="Edit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDelete(entry.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}