'use client';

import { useState, useEffect } from 'react';
import { ChangelogEntry } from '@/lib/types';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import ChangelogDetailView from '@/components/ChangelogDetailView';

export default function PublicChangelogDetailPage({ 
  params 
}: { 
  params: { slug: string; entryId: string } 
}) {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.slug, params.entryId]);

  const fetchData = async () => {
    try {
      // Get all projects first to find the one by slug
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      
      // Find the project by slug
      const foundProject = projectsData.projects?.find((p: any) => 
        p.slug === params.slug && p.isPublic
      );
      
      if (!foundProject) {
        setLoading(false);
        return;
      }
      
      setProjectName(foundProject.name);
      setProjectId(foundProject.id);
      
      // Fetch the changelog entry
      const response = await fetch(`/api/changelog/${params.entryId}?projectId=${foundProject.id}`);
      if (response.ok) {
        const data = await response.json();
        // Only show if published
        if (data.entry?.published) {
          setEntry(data.entry);
        }
      }
    } catch (error) {
      console.error('Error fetching changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entry || !projectId) {
    notFound();
  }

  return (
    <ChangelogDetailView
      entry={entry}
      projectName={projectName}
      backLink={`/p/${params.slug}`}
      breadcrumbs={[
        { label: 'Changelog', href: `/p/${params.slug}` },
        { label: projectName, href: `/p/${params.slug}` },
        { label: format(new Date(entry.date), 'yyyy-MM-dd') }
      ]}
    />
  );
}