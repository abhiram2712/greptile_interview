import { useState, useEffect } from 'react';
import { ChangelogEntry } from '@/lib/types';

interface UseChangelogResult {
  entry: ChangelogEntry | null;
  loading: boolean;
  error: string | null;
}

export function useChangelog(
  entryId: string, 
  projectId: string | null,
  requirePublished: boolean = false
): UseChangelogResult {
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!entryId || !projectId) {
      setLoading(false);
      return;
    }

    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/changelog/${entryId}?projectId=${projectId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (requirePublished && !data.entry?.published) {
            setError('Changelog not published');
          } else if (data.entry) {
            setEntry(data.entry);
          } else {
            setError('Changelog not found');
          }
        } else {
          setError('Failed to fetch changelog');
        }
      } catch (err) {
        setError('Failed to fetch changelog');
        console.error('Error fetching changelog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [entryId, projectId, requirePublished]);

  return { entry, loading, error };
}