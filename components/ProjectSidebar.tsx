'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Project } from '@/lib/projects';
import { useToast } from '@/contexts/ToastContext';

interface ProjectSidebarProps {
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function ProjectSidebar({ selectedProjectId, onProjectSelect, isCollapsed, onToggleCollapse }: ProjectSidebarProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectUrl, setNewProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectUrl.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ githubUrl: newProjectUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        await fetchProjects();
        setNewProjectUrl('');
        setIsAddingProject(false);
        onProjectSelect(data.project.id);
        showSuccess('Project added successfully!');
      } else {
        const error = await response.json();
        // Show user-friendly error message
        if (error.error && error.error.includes('private repository')) {
          showError(error.error + '\n\nThis app only supports public GitHub repositories. Please make your repository public or choose a different repository.');
        } else {
          showError(error.error || 'Failed to add project');
        }
      }
    } catch (error) {
      console.error('Error adding project:', error);
      showError('Failed to add project. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this project and all its changelogs?')) return;

    try {
      const response = await fetch(`/api/projects?id=${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProjects();
        if (selectedProjectId === projectId) {
          onProjectSelect('');
        }
        showSuccess('Project deleted successfully');
      } else {
        showError('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full flex flex-col transition-all duration-300`}>
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {!isCollapsed && (
          <button
            onClick={() => setIsAddingProject(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {projects.map((project) => (
          <button
            key={project.id}
            onClick={() => onProjectSelect(project.id)}
            className={`w-full text-left rounded-lg transition-colors group ${
              selectedProjectId === project.id
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
            title={isCollapsed ? project.name : undefined}
          >
            <div className={`${isCollapsed ? 'p-3' : 'p-3'} flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              {isCollapsed ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    {project.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-200 truncate">
                      {project.name}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all rounded"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </button>
        ))}
      </div>

      {!isCollapsed && isAddingProject && (
        <div className="p-4">
          <form onSubmit={handleAddProject} className="space-y-2">
            <input
              type="text"
              value={newProjectUrl}
              onChange={(e) => setNewProjectUrl(e.target.value)}
              placeholder="GitHub URL"
              className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              autoFocus
              disabled={loading}
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingProject(false);
                  setNewProjectUrl('');
                }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}