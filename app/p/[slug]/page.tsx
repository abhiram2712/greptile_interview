import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PublicChangelogList from '@/components/PublicChangelogList';

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {project.name} Changelog
        </h1>
      </div>

      {project.changelogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            No changelog entries available.
          </p>
        </div>
      ) : (
        <PublicChangelogList 
          entries={project.changelogs} 
          projectSlug={params.slug} 
        />
      )}
    </div>
  );
}