'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChangelogListView from '@/components/ChangelogListView';
import { ChangelogEntry as ChangelogEntryType, changelogToEntry, Changelog } from '@/lib/types';
import { useProject } from '@/contexts/ProjectContext';

export default function Home() {
  const { selectedProjectId } = useProject();
  const [changelogs, setChangelogs] = useState<ChangelogEntryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [regeneratingSummary, setRegeneratingSummary] = useState(false);

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
      const response = await fetch(`/api/projects/${selectedProjectId}`);
      const data = await response.json();
      setCurrentProject(data.project);
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

  const handleQuickRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentProject || !confirm('Regenerate project summary using AI?')) return;
    
    setRegeneratingSummary(true);
    try {
      const response = await fetch(`/api/projects/${currentProject.id}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateSummary: true }),
      });
      
      if (response.ok) {
        await fetchProject();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to regenerate project summary');
      }
    } catch (error) {
      console.error('Error regenerating project summary:', error);
      alert('Failed to regenerate project summary');
    } finally {
      setRegeneratingSummary(false);
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
          <div className="flex items-center justify-end">
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

      {/* Project Summary Row */}
      {currentProject && (
        <div className="mb-6">
          <div className="space-y-1">
            <div className="group">
              <div className="flex items-center gap-4 py-3 px-4 -mx-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Link
                  href={`/dev/summary/${selectedProjectId}`}
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-baseline justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                        Project Summary
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 overflow-hidden" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {regeneratingSummary ? (
                          <span className="text-gray-500 italic">Regenerating summary with AI...</span>
                        ) : (
                          currentProject?.context?.summary || 'No summary available. Click to add one.'
                        )}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded">
                        Summary
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        currentProject.showSummary 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {currentProject.showSummary ? 'Published' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleSummary();
                    }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      currentProject.showSummary 
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                    title={currentProject.showSummary ? 'Hide from public page' : 'Show on public page'}
                  >
                    {currentProject.showSummary ? 'Hide' : 'Show'}
                  </button>
                  {!currentProject?.context?.summary && !regeneratingSummary && (
                    <button
                      onClick={handleQuickRegenerate}
                      className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                      title="Generate summary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  <Link
                    href={`/dev/summary/${selectedProjectId}`}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>
                </div>
              </div>
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