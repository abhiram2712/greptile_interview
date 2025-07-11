'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChangelogForm from '@/components/ChangelogForm';
import { GitCommit } from '@/lib/git';
import { format, subDays } from 'date-fns';
import { useProject } from '@/contexts/ProjectContext';

export default function GeneratePage() {
  const { selectedProjectId } = useProject();
  const router = useRouter();
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    since: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    until: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchCommits = async () => {
    if (!selectedProjectId) {
      console.error('No project selected');
      return;
    }
    
    setLoading(true);
    setCommits([]); // Clear previous commits
    try {
      console.log('Fetching commits for project:', selectedProjectId, dateRange);
      const response = await fetch(
        `/api/commits?projectId=${selectedProjectId}&since=${dateRange.since}&until=${dateRange.until}`
      );
      
      if (!response.ok) {
        const error = await response.json();
        console.error('API Error:', error);
        alert(error.error || 'Failed to fetch commits');
        return;
      }
      
      const data = await response.json();
      console.log('Fetched commits:', data);
      setCommits(data.commits || []);
    } catch (error) {
      console.error('Error fetching commits:', error);
      alert('Failed to fetch commits. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (selectedCommits: GitCommit[]) => {
    setIsGenerating(true);
    setGeneratedContent(''); // Clear previous content
    
    try {
      const response = await fetch('/api/changelog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          commits: selectedCommits,
          projectId: selectedProjectId
        }),
      });
      const data = await response.json();
      setGeneratedContent(data.summary);
    } catch (error) {
      console.error('Error generating changelog:', error);
      alert('Failed to generate changelog. Please check your OpenAI API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (data: any) => {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch('/api/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId: selectedProjectId }),
      });
      
      if (response.ok) {
        router.push('/');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving changelog:', error);
      alert('Failed to save changelog');
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Select a project from the sidebar to generate changelogs
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Generate Changelog</h1>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Date Range</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
            <input
              type="date"
              value={dateRange.since}
              onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
            <input
              type="date"
              value={dateRange.until}
              onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            />
          </div>
        </div>
        <button
          onClick={fetchCommits}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Fetching...' : 'Fetch Commits'}
        </button>
      </div>

      {commits.length > 0 && (
        <ChangelogForm
          commits={commits}
          onGenerate={handleGenerate}
          onSave={handleSave}
          generatedContent={generatedContent}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}