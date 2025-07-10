'use client';

import { useState } from 'react';
import { GitCommit } from '@/lib/git';
import CommitList from './CommitList';
import { format } from 'date-fns';

interface ChangelogFormProps {
  commits: GitCommit[];
  onGenerate: (selectedCommits: GitCommit[]) => void;
  onSave: (data: {
    date: string;
    version: string;
    summary: string;
    content: string;
    commits: string[];
    author: string;
  }) => void;
  generatedContent: string;
  isGenerating: boolean;
}

export default function ChangelogForm({ 
  commits, 
  onGenerate, 
  onSave, 
  generatedContent,
  isGenerating 
}: ChangelogFormProps) {
  const [selectedCommits, setSelectedCommits] = useState<string[]>([]);
  const [version, setVersion] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [author, setAuthor] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');

  const toggleCommit = (hash: string) => {
    setSelectedCommits(prev =>
      prev.includes(hash)
        ? prev.filter(h => h !== hash)
        : [...prev, hash]
    );
  };

  const handleGenerate = () => {
    const selected = commits.filter(c => selectedCommits.includes(c.hash));
    onGenerate(selected);
  };

  const handleSave = () => {
    onSave({
      date,
      version,
      summary: summary || content.split('\n')[0],
      content: content || generatedContent,
      commits: selectedCommits,
      author: author || 'AI Generated',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Select Commits</h3>
        <CommitList
          commits={commits}
          selectedCommits={selectedCommits}
          onToggleCommit={toggleCommit}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {selectedCommits.length} commits selected
        </p>
        <button
          onClick={handleGenerate}
          disabled={selectedCommits.length === 0 || isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isGenerating ? 'Generating...' : 'Generate Changelog'}
        </button>
      </div>

      {(generatedContent || content) && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Changelog Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Version (optional)</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.2.3"
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of changes"
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
            <textarea
              value={content || generatedContent}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Changelog
          </button>
        </div>
      )}
    </div>
  );
}