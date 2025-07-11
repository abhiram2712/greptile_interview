import fs from 'fs';
import path from 'path';

export interface Project {
  id: string;
  name: string;
  githubUrl: string;
  owner: string;
  repo: string;
  createdAt: string;
  lastUpdated: string;
}

const PROJECTS_FILE = path.join(process.cwd(), 'public', 'projects.json');

export async function getAllProjects(): Promise<Project[]> {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      return [];
    }
    
    const content = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading projects:', error);
    return [];
  }
}

export async function getProject(id: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find(p => p.id === id) || null;
}

export async function saveProject(project: Omit<Project, 'id' | 'createdAt' | 'lastUpdated'>): Promise<Project> {
  const projects = await getAllProjects();
  
  const newProject: Project = {
    ...project,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  };
  
  projects.push(newProject);
  
  // Ensure directory exists
  const dir = path.dirname(PROJECTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const projects = await getAllProjects();
  const index = projects.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  projects[index] = {
    ...projects[index],
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2));
  
  return projects[index];
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getAllProjects();
  const filtered = projects.filter(p => p.id !== id);
  
  if (filtered.length === projects.length) {
    return false;
  }
  
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(filtered, null, 2));
  
  // Also delete associated changelogs
  const changelogDir = path.join(process.cwd(), 'public', 'changelogs');
  if (fs.existsSync(changelogDir)) {
    const files = fs.readdirSync(changelogDir);
    files.forEach(file => {
      if (file.startsWith(`${id}-`)) {
        fs.unlinkSync(path.join(changelogDir, file));
      }
    });
  }
  
  return true;
}