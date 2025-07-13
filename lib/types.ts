import { Prisma } from '@prisma/client';

// Re-export Prisma types for convenience
export type Project = Prisma.ProjectGetPayload<{}>;
export type Changelog = Prisma.ChangelogGetPayload<{}>;
export type Commit = Prisma.CommitGetPayload<{}>;
export type FileSnapshot = Prisma.FileSnapshotGetPayload<{}>;
export type ProjectContext = Prisma.ProjectContextGetPayload<{}>;

// Include types with relations
export type ChangelogWithRelations = Prisma.ChangelogGetPayload<{
  include: {
    project: true;
    commits: true;
  };
}>;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: {
    changelogs: true;
    commits: true;
    context: true;
  };
}>;

// Legacy types for compatibility
export interface ChangelogEntry {
  id: string;
  projectId: string;
  date: string;
  version?: string;
  summary: string;
  content: string;
  commits: string[];
  author: string;
  published?: boolean;
  createdAt: string;
}

// Transform functions
export function changelogToEntry(changelog: any): ChangelogEntry {
  // Helper to format date without timezone conversion
  const formatLocalDate = (date: Date | string) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    id: changelog.id,
    projectId: changelog.projectId,
    date: typeof changelog.date === 'string' 
      ? changelog.date.split('T')[0] 
      : formatLocalDate(changelog.date),
    version: changelog.version || undefined,
    summary: changelog.summary,
    content: changelog.content,
    commits: [], // We'll need to fetch commits separately if needed
    author: changelog.author,
    published: changelog.published || false,
    createdAt: typeof changelog.createdAt === 'string' 
      ? changelog.createdAt 
      : new Date(changelog.createdAt).toISOString(),
  };
}