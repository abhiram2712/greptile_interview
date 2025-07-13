'use client';

import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import ChangelogDetailView from '@/components/ChangelogDetailView';
import { useProject } from '@/hooks/useProject';
import { useChangelog } from '@/hooks/useChangelog';
import { useEffect, useState } from 'react';

export default function PublicChangelogDetailPage({ 
  params 
}: { 
  params: { slug: string; entryId: string } 
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const { project, loading: projectLoading, error: projectError } = useProject(params.slug);
  const { entry, loading: entryLoading, error: entryError } = useChangelog(
    params.entryId, 
    project?.id || null,
    true // requirePublished
  );


  const loading = projectLoading || entryLoading;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entry || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Not Found</h1>
          <p className="text-sm text-gray-500 mb-4">
            {!project && 'Project not found'}
            {project && !entry && (entryError || 'Changelog entry not found')}
          </p>
          <a href={`/p/${params.slug}`} className="text-blue-600 hover:underline">
            Back to changelog
          </a>
        </div>
      </div>
    );
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