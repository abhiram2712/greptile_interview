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
        .map((cl: Changelog) => changelogToEntry(cl))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Changelog</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            All notable changes to {project.name} will be documented here.
          </p>
        </header>

        {/* Project Summary */}
        {project.showSummary && project.context?.summary && (
          <section className="mb-16 pb-16 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Summary</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap max-w-3xl">
              {project.context.summary}
            </p>
          </section>
        )}

        {/* Changelog Entries */}
        <section>
          {changelogs.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-500">No changelog entries available.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {changelogs.map((entry, index) => (
                <article key={entry.id} className={`group ${index === 0 ? 'pb-8' : 'py-8'}`}>
                  <Link href={`/p/${params.slug}/${entry.id}`} className="block -mx-4 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                      {/* Date */}
                      <time className="flex-shrink-0 text-sm font-medium text-gray-500 dark:text-gray-400 sm:pt-1 sm:w-32">
                        {format(new Date(entry.date), 'MMM d, yyyy')}
                      </time>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {entry.summary || 'Changelog Update'}
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-1">
                          {entry.version && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              v{entry.version}
                            </span>
                          )}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            by {entry.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

