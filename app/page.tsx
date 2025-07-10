'use client';

import { useEffect, useState } from 'react';
import ChangelogEntry from '@/components/ChangelogEntry';
import { ChangelogEntry as ChangelogEntryType } from '@/lib/storage';

export default function Home() {
  const [changelogs, setChangelogs] = useState<ChangelogEntryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChangelogs();
  }, []);

  const fetchChangelogs = async () => {
    try {
      const response = await fetch('/api/changelog');
      const data = await response.json();
      setChangelogs(data.changelogs || []);
    } catch (error) {
      console.error('Error fetching changelogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }

    try {
      await fetch(`/api/changelog?id=${id}`, { method: 'DELETE' });
      await fetchChangelogs();
    } catch (error) {
      console.error('Error deleting changelog:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500">Loading changelogs...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Changelog</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay up to date with the latest changes and improvements.
        </p>
      </div>

      {changelogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No changelog entries yet.</p>
          <a
            href="/generate"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Generate your first changelog →
          </a>
        </div>
      ) : (
        <div>
          {changelogs.map(entry => (
            <ChangelogEntry
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}