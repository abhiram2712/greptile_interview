import { useState, useEffect } from 'react';
import { ChangelogEntry, Changelog, changelogToEntry } from '@/lib/types';

interface UseChangelogsResult {
  changelogs: ChangelogEntry[];
  loading: boolean;
  error: string | null;
}

export function useChangelogs(
  projectId: string | null,
  publishedOnly: boolean = false
): UseChangelogsResult {
  const [changelogs, setChangelogs] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchChangelogs = async () => {
      try {
        const response = await fetch(`/api/changelog?projectId=${projectId}`);
        
        if (response.ok) {
          const data = await response.json();
          let entries = data.changelogs || [];
          
          if (publishedOnly) {
            entries = entries.filter((cl: Changelog) => cl.published);
          }
          
          const converted = entries
            .map((cl: Changelog) => changelogToEntry(cl))
            .sort((a: ChangelogEntry, b: ChangelogEntry) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          
          setChangelogs(converted);
        } else {
          setError('Failed to fetch changelogs');
        }
      } catch (err) {
        setError('Failed to fetch changelogs');
        console.error('Error fetching changelogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChangelogs();
  }, [projectId, publishedOnly]);

  return { changelogs, loading, error };
}