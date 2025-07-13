'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProjectSidebar from '@/components/ProjectSidebar';
import { useProject } from '@/contexts/ProjectContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedProjectId, setSelectedProjectId } = useProject();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsCollapsed(savedCollapsed);
  }, []);

  const handleToggleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ProjectSidebar
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-950">
        <nav className="px-6 py-3">
          <div className="flex items-center space-x-1">
            <Link 
              href="/dev" 
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === '/dev' 
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Changelog
            </Link>
            <Link 
              href="/dev/generate" 
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === '/dev/generate'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Generate
            </Link>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto px-6">
          <div className="max-w-3xl mx-auto py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}