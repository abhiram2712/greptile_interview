'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChangelogEntry } from '@/lib/types';
import { formatDisplayDate } from '@/lib/date-utils';
import ChangelogDetailView from '@/components/ChangelogDetailView';
import { useToast } from '@/contexts/ToastContext';

export default function ChangelogDetailPage({ 
  params 
}: { 
  params: { projectId: string; entryId: string } 
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/changelog/${params.entryId}`, { method: 'DELETE' });
      if (response.ok) {
        showSuccess('Changelog entry deleted successfully');
        router.push('/dev');
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to delete changelog');
      }
    } catch (error) {
      console.error('Error deleting changelog:', error);
      showError('Failed to delete changelog');
    }
  };

  const handleTogglePublish = async (published: boolean) => {
    try {
      const response = await fetch(`/api/changelog/${params.entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      
      if (response.ok) {
        showSuccess(`Changelog ${published ? 'published' : 'unpublished'} successfully`);
        await fetchData(); // Refresh the data
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update changelog');
      }
    } catch (error) {
      console.error('Error updating changelog:', error);
      showError('Failed to update changelog');
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
      backLink="/dev"
      breadcrumbs={[
        { label: 'Changelog', href: '/dev' },
        { label: projectName, href: '/dev' },
        { label: formatDisplayDate(entry.date, 'yyyy-MM-dd') }
      ]}
      isDevView={true}
      onDelete={handleDelete}
      onTogglePublish={handleTogglePublish}
      editLink={`/dev/changelog/${params.projectId}/${params.entryId}/edit`}
    />
  );
}