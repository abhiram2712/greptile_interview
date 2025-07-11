import fs from 'fs';
import path from 'path';

export interface ChangelogEntry {
  id: string;
  projectId: string;
  date: string;
  version?: string;
  summary: string;
  content: string;
  commits: string[];
  author: string;
  createdAt: string;
}

const CHANGELOG_DIR = path.join(process.cwd(), 'public', 'changelogs');

export async function getAllChangelogs(): Promise<ChangelogEntry[]> {
  try {
    if (!fs.existsSync(CHANGELOG_DIR)) {
      fs.mkdirSync(CHANGELOG_DIR, { recursive: true });
      return [];
    }

    const files = fs.readdirSync(CHANGELOG_DIR)
      .filter(file => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a));

    const changelogs = files.map(file => {
      const content = fs.readFileSync(path.join(CHANGELOG_DIR, file), 'utf-8');
      return JSON.parse(content) as ChangelogEntry;
    });

    return changelogs;
  } catch (error) {
    console.error('Error reading changelogs:', error);
    return [];
  }
}

export async function getChangelog(id: string): Promise<ChangelogEntry | null> {
  try {
    const filePath = path.join(CHANGELOG_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as ChangelogEntry;
  } catch (error) {
    console.error('Error reading changelog:', error);
    return null;
  }
}

export async function saveChangelog(entry: ChangelogEntry): Promise<void> {
  try {
    if (!fs.existsSync(CHANGELOG_DIR)) {
      fs.mkdirSync(CHANGELOG_DIR, { recursive: true });
    }

    const filePath = path.join(CHANGELOG_DIR, `${entry.projectId}-${entry.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
  } catch (error) {
    console.error('Error saving changelog:', error);
    throw error;
  }
}

export async function getChangelogsByProject(projectId: string): Promise<ChangelogEntry[]> {
  try {
    const allChangelogs = await getAllChangelogs();
    return allChangelogs.filter(entry => entry.projectId === projectId);
  } catch (error) {
    console.error('Error fetching project changelogs:', error);
    return [];
  }
}

export async function deleteChangelog(id: string, projectId: string): Promise<void> {
  try {
    const filePath = path.join(CHANGELOG_DIR, `${projectId}-${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting changelog:', error);
    throw error;
  }
}