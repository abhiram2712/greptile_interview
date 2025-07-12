'use client';

import { useEffect, useState } from 'react';
import ChangelogListView from '@/components/ChangelogListView';
import { ChangelogEntry as ChangelogEntryType, changelogToEntry, Changelog } from '@/lib/types';
import { useProject } from '@/contexts/ProjectContext';

export default function Home() {
  const { selectedProjectId } = useProject();
  const [changelogs, setChangelogs] = useState<ChangelogEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleToggleSummary = async () => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showSummary: !currentProject.showSummary }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentProject(data.project);
        alert(`Project summary ${data.project.showSummary ? 'enabled' : 'disabled'} on public page`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update project settings');
      }
    } catch (error) {
      console.error('Error updating project settings:', error);
      alert('Failed to update project settings');
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
      {currentProject?.slug && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleSummary}
                className={`text-sm px-3 py-1 rounded-md transition-colors ${
                  currentProject.showSummary 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                } hover:opacity-80`}
                title={currentProject.showSummary ? 'Click to hide project summary on public page' : 'Click to show project summary on public page'}
              >
                Project Summary: {currentProject.showSummary ? 'Visible' : 'Hidden'}
              </button>
            </div>
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
          </div>
        </div>
      )}

      <ChangelogListView 
        entries={changelogs} 
        projectId={selectedProjectId} 
        onDelete={handleDelete}
        onTogglePublish={handleTogglePublish}
        emptyActionLink="/dev/generate"
      />
    </div>
  );
}