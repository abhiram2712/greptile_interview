'use client';

import { useEffect, useState } from 'react';
import { changelogToEntry, Changelog, ChangelogEntry } from '@/lib/types';
import { notFound } from 'next/navigation';
import ChangelogListView from '@/components/ChangelogListView';
import { formatDisplayDate } from '@/lib/date-utils';
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
        .sort((a: ChangelogEntry, b: ChangelogEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
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
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Changelog</h1>
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
              </a>
            )}
          </div>
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
                        {formatDisplayDate(entry.date)}
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

