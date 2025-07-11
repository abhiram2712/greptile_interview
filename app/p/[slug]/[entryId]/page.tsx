import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-8">
            <header className="mb-8">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                <time>{format(new Date(entry.date), 'MMMM d, yyyy')}</time>
                {entry.version && (
                  <span className="ml-3 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    v{entry.version}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {entry.summary}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                by {entry.author}
              </p>
            </header>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Empty space for consistency with dev portal layout */}
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}