'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { useProject } from '@/contexts/ProjectContext';

interface PageProps {
  params: {
    projectId: string;
    entryId: string;
  };
}

export default function EditChangelogPage({ params }: PageProps) {
  const router = useRouter();
  const { selectedProjectId } = useProject();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    version: '',
    summary: '',
    content: '',
    author: '',
  });

  useEffect(() => {
    fetchChangelog();
  }, [params.entryId]);

  const fetchChangelog = async () => {
    try {
      const response = await fetch(`/api/changelog/${params.entryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch changelog');
      }
      const data = await response.json();
      const entry = data.entry;
      
      setFormData({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        version: entry.version || '',
        summary: entry.summary || '',
        content: entry.content || '',
        author: entry.author || '',
      });
    } catch (error) {
      console.error('Error fetching changelog:', error);
      alert('Failed to load changelog');
      router.push('/dev');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/changelog/${params.entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update changelog');
      }

      router.push(`/dev/changelog/${params.projectId}/${params.entryId}`);
    } catch (error) {
      console.error('Error updating changelog:', error);
      alert('Failed to update changelog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Edit Changelog</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="1.0.0"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Summary
            </label>
            <input
              type="text"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary of changes"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={15}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 font-mono"
              placeholder="### Added&#10;- New feature&#10;&#10;### Changed&#10;- Updated feature&#10;&#10;### Fixed&#10;- Bug fix"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}