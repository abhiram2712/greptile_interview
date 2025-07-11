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
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Select Commits</h3>
        <CommitList
          commits={commits}
          selectedCommits={selectedCommits}
          onToggleCommit={toggleCommit}
        />
      </div>

      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {selectedCommits.length} commits selected
        </p>
        <button
          onClick={handleGenerate}
          disabled={selectedCommits.length === 0 || isGenerating}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? 'Generating...' : 'Generate Changelog'}
        </button>
      </div>

      {(generatedContent || content) && (
        <div className="space-y-6 border-t border-gray-200 dark:border-gray-800 pt-8">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Changelog Details</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Version (optional)</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.2.3"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Brief summary of changes"
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Content (Markdown)</label>
            <textarea
              value={content || generatedContent}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-200 dark:border-gray-800 rounded-md bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-gray-900 dark:focus:ring-gray-100 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 dark:bg-gray-300 dark:text-gray-900 rounded-md hover:bg-gray-600 dark:hover:bg-gray-400 transition-colors"
          >
            Save Changelog
          </button>
        </div>
      )}
    </div>
  );
}