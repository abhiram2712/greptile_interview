'use client';

import { useState, useEffect } from 'react';
import { ChangelogEntry } from '@/lib/storage';
import { formatDisplayDate } from '@/lib/date-utils';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChangelogDetailViewProps {
  entry: ChangelogEntry;
  projectName: string;
  backLink: string;
  backLinkText?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  isDevView?: boolean;
  onDelete?: () => void;
  onTogglePublish?: (published: boolean) => void;
  editLink?: string;
}

export default function ChangelogDetailView({ 
  entry, 
  projectName, 
  backLink,
  backLinkText = 'Back to changelog',
  breadcrumbs,
  isDevView = false,
  onDelete,
  onTogglePublish,
  editLink
}: ChangelogDetailViewProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-12 relative">
        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="max-w-3xl mb-8">
            <nav>
              <ol className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className={index > 0 ? "before:content-['/'] before:mx-2" : ""}>
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-300">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        )}

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
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <time>{formatDisplayDate(entry.date, 'MMMM d, yyyy')}</time>
              <span>•</span>
              <span>{entry.author}</span>
              <span>•</span>
              <span>{entry.commits.length} commits</span>
            </div>
            
            {isDevView && (
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  entry.published 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {entry.published ? 'Published' : 'Draft'}
                </span>
                
                {onTogglePublish && (
                  <button
                    onClick={() => onTogglePublish(!entry.published)}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {entry.published ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                
                {editLink && (
                  <Link
                    href={editLink}
                    className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </Link>
                )}
                
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main content container */}
        <div className="grid grid-cols-12 gap-8">
          {/* Content area - takes up 8 columns */}
          <article className="col-span-12 lg:col-span-8">
            <div className="max-w-3xl prose prose-gray dark:prose-invert">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => {
                    const id = children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h1 id={id} className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">{children}</h1>;
                  },
                  h2: ({children}) => {
                    const id = children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h2 id={id} className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-4">{children}</h2>;
                  },
                  h3: ({children}) => {
                    const id = children?.toString().toLowerCase().replace(/\s+/g, '-') || '';
                    return <h3 id={id} className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-3">{children}</h3>;
                  },
                  p: ({children}) => <p className="text-gray-700 dark:text-gray-300 mb-4">{children}</p>,
                  ul: ({children}) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                  ol: ({children}) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                  li: ({children}) => <li className="text-gray-700 dark:text-gray-300">{children}</li>,
                  code: ({inline, className, children}) => {
                    if (inline) {
                      return <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">{children}</code>;
                    }
                    return (
                      <code className={`${className || ''} block text-sm font-mono`}>{children}</code>
                    );
                  },
                  pre: ({children}) => (
                    <pre className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic text-gray-700 dark:text-gray-300">
                      {children}
                    </blockquote>
                  ),
                  strong: ({children}) => <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>,
                  em: ({children}) => <em className="italic">{children}</em>,
                  a: ({href, children}) => (
                    <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="my-8 border-gray-200 dark:border-gray-700" />,
                }}
              >
                {entry.content}
              </ReactMarkdown>
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
            href={backLink}
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← {backLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
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