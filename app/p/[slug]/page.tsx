'use client';

import { useEffect, useState } from 'react';
import { ChangelogEntry } from '@/lib/storage';
import { changelogToEntry, Changelog } from '@/lib/types';
import { notFound } from 'next/navigation';
import ChangelogListView from '@/components/ChangelogListView';
import { format } from 'date-fns';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function PublicChangelogPage({ params }: PageProps) {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const fetchData = async () => {
    try {
      // Get all projects first
      const projectsResponse = await fetch('/api/projects');
      const projectsData = await projectsResponse.json();
      
      // Find the project by slug
      const foundProject = projectsData.projects?.find((p: any) => 
        p.slug === params.slug && p.isPublic
      );
      
      if (!foundProject) {
        setProject(null);
        setLoading(false);
        return;
      }
      
      setProject(foundProject);
      
      // Fetch changelogs for this project
      const changelogResponse = await fetch(`/api/changelog?projectId=${foundProject.id}`);
      const changelogData = await changelogResponse.json();
      
      // Filter only published entries and convert them
      const publishedEntries = (changelogData.changelogs || [])
        .filter((cl: Changelog) => cl.published)
        .map((cl: Changelog) => changelogToEntry(cl));
      
      setChangelogs(publishedEntries);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Changelog</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              All notable changes to {project.name} will be documented here.
            </p>
            
            {project.showSummary && project.context?.summary && (
              <div className="mt-6 prose prose-sm dark:prose-invert max-w-none">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-3">About {project.name}</h2>
                  <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {project.context.summary}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800">
          {changelogs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-500">No changelog entries available.</p>
            </div>
          ) : (
            <div className="px-6">
              <ChangelogListView 
                entries={changelogs} 
                projectSlug={params.slug}
                isPublicView={true}
                title=""
                emptyMessage="No changelog entries available."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}