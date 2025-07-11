import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: {
    slug: string;
    entryId: string;
  };
}

export default async function PublicChangelogEntryPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({
    where: { 
      slug: params.slug,
      isPublic: true,
    },
  });

  if (!project) {
    notFound();
  }

  const entry = await prisma.changelog.findFirst({
    where: { 
      id: params.entryId,
      projectId: project.id,
      published: true,
    },
  });

  if (!entry) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Back link */}
      <Link 
        href={`/p/${params.slug}`}
        className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-8 inline-block"
      >
        ← Back to changelog
      </Link>

      {/* Header */}
      <header className="mb-8">
        <time className="text-sm text-gray-500 dark:text-gray-400">
          {format(new Date(entry.date), 'MMMM d, yyyy')}
        </time>
        
        {entry.version && (
          <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
            v{entry.version}
          </span>
        )}
        
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          {entry.summary}
        </h1>
      </header>

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown>
          {entry.content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Published by {entry.author}
        </p>
      </footer>
    </div>
  );
}