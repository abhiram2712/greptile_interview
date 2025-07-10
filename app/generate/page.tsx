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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate Changelog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Select a date range to fetch commits and generate an AI-powered changelog.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-medium mb-4">Date Range</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">From</label>
            <input
              type="date"
              value={dateRange.since}
              onChange={(e) => setDateRange({ ...dateRange, since: e.target.value })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">To</label>
            <input
              type="date"
              value={dateRange.until}
              onChange={(e) => setDateRange({ ...dateRange, until: e.target.value })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </div>
        <button
          onClick={fetchCommits}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
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