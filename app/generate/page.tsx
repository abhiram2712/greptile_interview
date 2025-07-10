'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChangelogForm from '@/components/ChangelogForm';
import { GitCommit } from '@/lib/git';
import { format, subDays } from 'date-fns';

export default function GeneratePage() {
  const router = useRouter();
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    since: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    until: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchCommits = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/commits?since=${dateRange.since}&until=${dateRange.until}`
      );
      const data = await response.json();
      setCommits(data.commits || []);
    } catch (error) {
      console.error('Error fetching commits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (selectedCommits: GitCommit[]) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/changelog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commits: selectedCommits }),
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
    try {
      const response = await fetch('/api/changelog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Generate Changelog</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a date range to fetch commits and generate an AI-powered changelog.
        </p>
      </div>

      <div className="border border-gray-200 dark:border-gray-800 rounded-md p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Date Range</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
            <input
              type="date"
              value={dateRange.since}
              onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
            <input
              type="date"
              value={dateRange.until}
              onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
          </div>
        </div>
        <button
          onClick={fetchCommits}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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