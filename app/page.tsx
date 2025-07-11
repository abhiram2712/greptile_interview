'use client';

import { useEffect, useState } from 'react';
import ChangelogList from '@/components/ChangelogList';
import { ChangelogEntry as ChangelogEntryType, changelogToEntry, Changelog } from '@/lib/types';
import { useProject } from '@/contexts/ProjectContext';

export default function Home() {
  const { selectedProjectId } = useProject();
  const [changelogs, setChangelogs] = useState<ChangelogEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<any>(null);

  useEffect(() => {
    if (selectedProjectId) {
      fetchChangelogs();
      fetchProject();
    } else {
      setLoading(false);
      setChangelogs([]);
      setCurrentProject(null);
    }
  }, [selectedProjectId]);

  const fetchProject = async () => {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      const project = data.projects?.find((p: any) => p.id === selectedProjectId);
      setCurrentProject(project);
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  const fetchChangelogs = async () => {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch(`/api/changelog?projectId=${selectedProjectId}`);
      const data = await response.json();
      const entries = (data.changelogs || []).map((cl: Changelog) => changelogToEntry(cl));
      setChangelogs(entries);
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

    try {
      const response = await fetch(`/api/changelog/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchChangelogs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete changelog');
      }
    } catch (error) {
      console.error('Error deleting changelog:', error);
      alert('Failed to delete changelog');
    }
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      const response = await fetch(`/api/changelog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });
      
      if (response.ok) {
        await fetchChangelogs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update changelog');
      }
    } catch (error) {
      console.error('Error updating changelog:', error);
      alert('Failed to update changelog');
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
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Changelog</h1>
          {currentProject?.slug && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Public URL:</span>
              <a
                href={`/p/${currentProject.slug}`}
                target="_blank"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
              >
                /p/{currentProject.slug}
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/p/${currentProject.slug}`);
                  alert('Public URL copied to clipboard!');
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Copy URL"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
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
        <ChangelogList 
          entries={changelogs} 
          projectId={selectedProjectId} 
          onDelete={handleDelete}
          onTogglePublish={handleTogglePublish}
        />
      )}
    </div>
  );
}