import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function PublicChangelogPage({ params }: PageProps) {
  const project = await prisma.project.findUnique({
    where: { 
      slug: params.slug,
      isPublic: true,
    },
    include: {
      changelogs: {
        where: { published: true },
        orderBy: { date: 'desc' },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {project.name}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Changelog
        </p>
        <a 
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-2 inline-block"
        >
          View on GitHub →
        </a>
      </div>

      {/* Changelog entries */}
      <div className="space-y-16">
        {project.changelogs.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No changelog entries yet.
          </p>
        ) : (
          project.changelogs.map((entry) => (
            <article key={entry.id} className="relative">
              {/* Date */}
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(entry.date), 'MMMM d, yyyy')}
              </time>
              
              {/* Version */}
              {entry.version && (
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  v{entry.version}
                </span>
              )}
              
              {/* Summary */}
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                <Link 
                  href={`/p/${params.slug}/${entry.id}`}
                  className="hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {entry.summary}
                </Link>
              </h2>
              
              {/* Content preview */}
              <div className="mt-3 text-gray-600 dark:text-gray-300 prose prose-sm dark:prose-invert max-w-none">
                <p className="line-clamp-3">
                  {entry.content.split('\n')[0]}
                </p>
              </div>
              
              {/* Read more link */}
              <Link 
                href={`/p/${params.slug}/${entry.id}`}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 inline-block"
              >
                Read more →
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}