import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';

interface UseProjectResult {
  project: Project | null;
  loading: boolean;
  error: string | null;
}

export function useProject(slug: string): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        
        const foundProject = data.projects?.find((p: Project) => 
          p.slug === slug && p.isPublic
        );
        
        if (foundProject) {
          setProject(foundProject);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to fetch project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [slug]);

  return { project, loading, error };
}

export function useProjectById(projectId: string | null): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
        } else {
          setError('Project not found');
        }
      } catch (err) {
        setError('Failed to fetch project');
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  return { project, loading, error };
}