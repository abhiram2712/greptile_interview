'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/types';

interface PageProps {
  params: {
    projectId: string;
  };
}

export default function SummaryDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [params.projectId]);

  // Remove this useEffect as we're setting summaryText in fetchProject

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched project data:', data.project);
        setProject(data.project);
        if (data.project?.context?.summary) {
          setSummaryText(data.project.context.summary);
        }
      } else {
        console.error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${params.projectId}/context`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary: summaryText }),
      });
      
      if (response.ok) {
        setEditing(false);
        await fetchProject();
        alert('Project summary updated successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update project summary');
      }
    } catch (error) {
      console.error('Error updating project summary:', error);
      alert('Failed to update project summary');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('This will regenerate the project summary using AI. Continue?')) return;
    
    setRegenerating(true);
    try {
      const response = await fetch(`/api/projects/${params.projectId}/context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerateSummary: true }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.context?.summary) {
          setSummaryText(data.context.summary);
        }
        await fetchProject();
        alert('Project summary regenerated successfully');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to regenerate project summary');
      }
    } catch (error) {
      console.error('Error regenerating project summary:', error);
      alert('Failed to regenerate project summary');
    } finally {
      setRegenerating(false);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await fetch(`/api/projects/${params.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showSummary: !project.showSummary }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Breadcrumb */}
        <div className="max-w-3xl mb-8">
          <nav>
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/dev" className="hover:text-gray-700 dark:hover:text-gray-300">
                  {project.name}
                </Link>
              </li>
              <li className="before:content-['/'] before:mx-2">
                <span className="text-gray-900 dark:text-gray-100">Project Summary</span>
              </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <header className="max-w-3xl mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Project Summary
            </h1>
            <div className="flex items-center gap-2">
              <span className={`text-sm px-3 py-1 rounded-full ${
                project.showSummary 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {project.showSummary ? 'Visible on public page' : 'Hidden from public page'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!editing && !regenerating && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 transition-colors"
                >
                  Edit Summary
                </button>
                <button
                  onClick={handleRegenerate}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Regenerate with AI
                </button>
                <button
                  onClick={handleToggleVisibility}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {project.showSummary ? 'Hide from Public' : 'Show on Public'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main content container */}
        <div className="max-w-3xl">
          {regenerating ? (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Regenerating Project Summary</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    AI is analyzing your repository to generate a comprehensive summary...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
                    This may take 10-30 seconds depending on repository size
                  </p>
                </div>
              </div>
            </div>
          ) : editing ? (
            <div className="space-y-6">
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full h-64 px-6 py-4 text-sm rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 resize-none"
                placeholder="Enter project summary..."
                autoFocus
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Summary'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setSummaryText(project?.context?.summary || '');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {summaryText ? (
                  summaryText
                ) : (
                  <p className="text-gray-500 dark:text-gray-500 italic">
                    No project summary available. Click "Regenerate with AI" to generate one.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/dev"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to changelog
          </Link>
        </div>
      </div>
    </div>
  );
}