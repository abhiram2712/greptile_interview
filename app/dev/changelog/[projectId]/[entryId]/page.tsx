'use client';

import { useRouter } from 'next/navigation';
import { formatDisplayDate } from '@/lib/date-utils';
import ChangelogDetailView from '@/components/ChangelogDetailView';
import { useToast } from '@/contexts/ToastContext';
import { useProjectById } from '@/hooks/useProject';
import { useChangelog } from '@/hooks/useChangelog';

export default function ChangelogDetailPage({ 
  params 
}: { 
  params: { projectId: string; entryId: string } 
}) {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const { project, loading: projectLoading } = useProjectById(params.projectId);
  const { entry, loading: entryLoading } = useChangelog(params.entryId, params.projectId);

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
        window.location.reload(); // Simple refresh
      } else {
        const error = await response.json();
        showError(error.error || 'Failed to update changelog');
      }
    } catch (error) {
      console.error('Error updating changelog:', error);
      showError('Failed to update changelog');
    }
  };

  const loading = projectLoading || entryLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entry || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Changelog entry not found</p>
      </div>
    );
  }

  return (
    <ChangelogDetailView
      entry={entry}
      projectName={project.name}
      backLink="/dev"
      breadcrumbs={[
        { label: 'Changelog', href: '/dev' },
        { label: project.name, href: '/dev' },
        { label: formatDisplayDate(entry.date, 'yyyy-MM-dd') }
      ]}
      isDevView={true}
      onDelete={handleDelete}
      onTogglePublish={handleTogglePublish}
      editLink={`/dev/changelog/${params.projectId}/${params.entryId}/edit`}
    />
  );
}