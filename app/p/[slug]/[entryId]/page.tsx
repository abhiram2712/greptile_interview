'use client';

import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import ChangelogDetailView from '@/components/ChangelogDetailView';
import { useProject } from '@/hooks/useProject';
import { useChangelog } from '@/hooks/useChangelog';

export default function PublicChangelogDetailPage({ 
  params 
}: { 
  params: { slug: string; entryId: string } 
}) {
  const { project, loading: projectLoading } = useProject(params.slug);
  const { entry, loading: entryLoading } = useChangelog(
    params.entryId, 
    project?.id || null,
    true // requirePublished
  );

  const loading = projectLoading || entryLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entry || !project) {
    notFound();
  }

  return (
    <ChangelogDetailView
      entry={entry}
      projectName={project.name}
      backLink={`/p/${params.slug}`}
      breadcrumbs={[
        { label: 'Changelog', href: `/p/${params.slug}` },
        { label: project.name, href: `/p/${params.slug}` },
        { label: format(new Date(entry.date), 'yyyy-MM-dd') }
      ]}
    />
  );
}