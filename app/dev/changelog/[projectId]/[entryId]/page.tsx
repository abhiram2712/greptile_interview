'use client';

import { useState, useEffect } from 'react';
import { ChangelogEntry } from '@/lib/storage';
import { format } from 'date-fns';
import ChangelogDetailView from '@/components/ChangelogDetailView';

export default function ChangelogDetailPage({ 
  params 
}: { 
  params: { projectId: string; entryId: string } 
}) {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.projectId, params.entryId]);

  const fetchData = async () => {
    try {
      // Fetch from API instead of direct file access
      const response = await fetch(`/api/changelog/${params.entryId}?projectId=${params.projectId}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data.entry);
      }

      const projectResponse = await fetch(`/api/projects/${params.projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProjectName(projectData.project.name);
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

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Changelog entry not found</p>
      </div>
    );
  }

  return (
    <ChangelogDetailView
      entry={entry}
      projectName={projectName}
      backLink="/"
      breadcrumbs={[
        { label: 'Changelog', href: '/' },
        { label: projectName, href: `/?project=${params.projectId}` },
        { label: format(new Date(entry.date), 'yyyy-MM-dd') }
      ]}
    />
  );
}