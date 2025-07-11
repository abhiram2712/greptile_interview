'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChangelogEntry } from '@/lib/storage';
import { format } from 'date-fns';
import Link from 'next/link';

export default function ChangelogDetailPage({ 
  params 
}: { 
  params: { projectId: string; entryId: string } 
}) {
  const router = useRouter();
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.projectId, params.entryId]);

  const fetchData = async () => {
    try {
      // Fetch from API instead of direct file access
      const response = await fetch(`/api/changelog/${params.entryId}?projectId=${params.projectId}`);
      if (response.ok) {
        const data = await response.json();
        setEntry(data.entry);
      }

      const projectResponse = await fetch(`/api/projects/${params.projectId}`);
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        setProjectName(projectData.project.name);
      }
    } catch (error) {
      console.error('Error fetching changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-500">Changelog entry not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Breadcrumb */}
        <div className="max-w-3xl mb-8">
          <nav>
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300">
                Changelog
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2">
              <Link href={`/?project=${params.projectId}`} className="hover:text-gray-700 dark:hover:text-gray-300">
                {projectName}
              </Link>
            </li>
            <li className="before:content-['/'] before:mx-2 text-gray-900 dark:text-gray-100">
              {format(new Date(entry.date), 'yyyy-MM-dd')}
            </li>
            </ol>
          </nav>
        </div>

        {/* Header */}
        <header className="max-w-3xl mb-12">
          <div className="flex items-baseline justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {entry.summary || 'Changelog Update'}
            </h1>
            {entry.version && (
              <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                v{entry.version}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <time>{format(new Date(entry.date), 'MMMM d, yyyy')}</time>
            <span>•</span>
            <span>{entry.author}</span>
            <span>•</span>
            <span>{entry.commits.length} commits</span>
          </div>
        </header>

        {/* Main content container */}
        <div className="grid grid-cols-12 gap-8">
          {/* Content area - takes up 8 columns */}
          <article className="col-span-12 lg:col-span-8">
            <div className="max-w-3xl">
              <ChangelogContent content={entry.content} />
            </div>
          </article>
          
          {/* Table of Contents Sidebar - takes up 4 columns */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24">
              <TableOfContents content={entry.content} />
            </div>
          </aside>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back to changelog
          </Link>
        </div>
      </div>
    </div>
  );
}

// Component to render markdown content
function ChangelogContent({ content }: { content: string }) {
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let currentList: string[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushList = () => {
      if (currentList.length > 0 && listType) {
        const ListComponent = listType === 'ul' ? 'ul' : 'ol';
        elements.push(
          <ListComponent key={elements.length} className={listType === 'ul' ? 'list-disc' : 'list-decimal'} style={{ paddingLeft: '1.5rem' }}>
            {currentList.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300 mb-1">
                {item}
              </li>
            ))}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        flushList();
        const id = line.replace('### ', '').toLowerCase().replace(/\s+/g, '-');
        elements.push(
          <h3 key={i} id={id} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        flushList();
        const id = line.replace('## ', '').toLowerCase().replace(/\s+/g, '-');
        elements.push(
          <h2 key={i} id={id} className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        flushList();
        const id = line.replace('# ', '').toLowerCase().replace(/\s+/g, '-');
        elements.push(
          <h1 key={i} id={id} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
      }
      // Lists
      else if (line.trim().startsWith('- ')) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        currentList.push(line.trim().replace(/^-\s*/, ''));
      } else if (line.trim().match(/^\d+\.\s/)) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        currentList.push(line.trim().replace(/^\d+\.\s*/, ''));
      }
      // Code blocks
      else if (line.trim().startsWith('```')) {
        flushList();
        // Skip code block markers
      }
      // Paragraphs
      else if (line.trim() !== '') {
        flushList();
        // Check for bold text
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Check for italic text
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Check for inline code
        processedLine = processedLine.replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm">$1</code>');
        
        elements.push(
          <p key={i} className="text-gray-700 dark:text-gray-300 mb-4" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      }
    });

    flushList();
    return elements;
  };

  return <div className="space-y-2">{parseMarkdown(content)}</div>;
}

// Table of Contents component
function TableOfContents({ content }: { content: string }) {
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Extract headers from content
  const headers = content.split('\n')
    .filter(line => line.match(/^#{1,3}\s/))
    .map(line => {
      const level = line.match(/^#+/)?.[0].length || 0;
      const text = line.replace(/^#+\s/, '');
      const id = text.toLowerCase().replace(/\s+/g, '-');
      return { level, text, id };
    });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      // Find the current section
      for (let i = headers.length - 1; i >= 0; i--) {
        const element = document.getElementById(headers[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(headers[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headers]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (headers.length === 0) return null;

  return (
    <div className="pl-8">
      <div className="border-l-2 border-gray-200 dark:border-gray-800 pl-6">
        <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-4">
          On this page
        </h4>
        <nav className="space-y-2">
          {headers.map((header, i) => (
            <button
              key={i}
              onClick={() => scrollToSection(header.id)}
              className={`
                block w-full text-left text-sm py-1 transition-all duration-200
                ${header.level === 1 ? 'font-medium' : ''}
                ${header.level === 2 ? 'pl-3' : ''}
                ${header.level === 3 ? 'pl-6' : ''}
                ${activeSection === header.id 
                  ? 'text-gray-900 dark:text-gray-100 font-medium' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }
              `}
            >
              <span className="relative">
                {activeSection === header.id && (
                  <span className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-gray-900 dark:bg-gray-100 rounded-full" />
                )}
                {header.text}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}