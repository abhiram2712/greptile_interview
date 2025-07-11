'use client';

import { useEffect, useState } from 'react';
import ChangelogList from '@/components/ChangelogList';
import { ChangelogEntry as ChangelogEntryType } from '@/lib/storage';
import { useProject } from '@/contexts/ProjectContext';

export default function Home() {
  const { selectedProjectId } = useProject();
  const [changelogs, setChangelogs] = useState<ChangelogEntryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProjectId) {
      fetchChangelogs();
    } else {
      setLoading(false);
      setChangelogs([]);
    }
  }, [selectedProjectId]);

  const fetchChangelogs = async () => {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch(`/api/changelog?projectId=${selectedProjectId}`);
      const data = await response.json();
      setChangelogs(data.changelogs || []);
    } catch (error) {
      console.error('Error fetching changelogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }

    if (!selectedProjectId) return;

    try {
      await fetch(`/api/changelog?id=${id}&projectId=${selectedProjectId}`, { method: 'DELETE' });
      await fetchChangelogs();
    } catch (error) {
      console.error('Error deleting changelog:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!selectedProjectId) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Select a project from the sidebar to view its changelog
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Changelog</h1>
      </div>

      {changelogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">No changelog entries yet.</p>
          <a
            href="/generate"
            className="text-sm text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 underline underline-offset-4 transition-colors"
          >
            Generate your first changelog
          </a>
        </div>
      ) : (
        <ChangelogList entries={changelogs} projectId={selectedProjectId} />
      )}
    </div>
  );
}