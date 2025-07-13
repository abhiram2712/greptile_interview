'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChangelogForm from '@/components/ChangelogForm';
import DateRangePicker from '@/components/DateRangePicker';
import { GitCommit } from '@/lib/git';
import { subDays, format } from 'date-fns';
import { formatDateString } from '@/lib/date-utils';
import { useProject } from '@/contexts/ProjectContext';
import { useToast } from '@/contexts/ToastContext';

export default function GeneratePage() {
  const { selectedProjectId } = useProject();
  const router = useRouter();
  const { showError } = useToast();
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateRange, setDateRange] = useState({
    since: formatDateString(subDays(new Date(), 30)),
    until: formatDateString(new Date()),
  });
  const [quickMode, setQuickMode] = useState(true); // Default to quick mode for speed

  // Reset state when project changes
  useEffect(() => {
    if (selectedProjectId) {
      // Reset all form state
      setCommits([]);
      setGeneratedContent('');
      setIsGenerating(false);
      setLoading(false);
      // Reset date range to default
      setDateRange({
        since: formatDateString(subDays(new Date(), 30)),
        until: formatDateString(new Date()),
      });
    }
  }, [selectedProjectId]);

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
        showError(error.error || 'Failed to fetch commits');
        return;
      }
      
      const data = await response.json();
      console.log('Fetched commits:', data);
      setCommits(data.commits || []);
    } catch (error) {
      console.error('Error fetching commits:', error);
      showError('Failed to fetch commits. Please check your repository settings.');
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
          projectId: selectedProjectId,
          useEnhanced: true,
          quickMode: quickMode
        }),
      });
      const data = await response.json();
      // Use the enhanced content if available, otherwise fall back to summary
      setGeneratedContent(data.content || data.summary);
    } catch (error) {
      console.error('Error generating changelog:', error);
      showError('Failed to generate changelog. Please check your OpenAI API key.');
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
        router.push('/dev');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving changelog:', error);
      showError('Failed to save changelog');
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
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Select Date Range</h2>
        <div className="mb-4">
          <DateRangePicker
            startDate={dateRange.since}
            endDate={dateRange.until}
            onStartDateChange={(date) => setDateRange({ ...dateRange, since: date })}
            onEndDateChange={(date) => setDateRange({ ...dateRange, until: date })}
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={quickMode}
              onChange={(e) => setQuickMode(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:ring-gray-500"
            />
            <span>Quick mode (faster generation)</span>
          </label>
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
          key={selectedProjectId} // Force remount when project changes
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