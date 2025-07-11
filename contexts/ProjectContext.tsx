'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ProjectContextType {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const savedProjectId = localStorage.getItem('selectedProjectId');
    if (savedProjectId) {
      setSelectedProjectId(savedProjectId);
    }
  }, []);

  const handleSetSelectedProjectId = (id: string) => {
    setSelectedProjectId(id);
    localStorage.setItem('selectedProjectId', id);
  };

  return (
    <ProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId: handleSetSelectedProjectId }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}