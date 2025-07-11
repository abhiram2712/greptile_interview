import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface OldProject {
  id: string;
  name: string;
  githubUrl: string;
  owner: string;
  repo: string;
  createdAt: string;
  lastUpdated: string;
}

interface OldChangelog {
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

async function migrateProjects() {
  console.log('Migrating projects...');
  
  const projectsFile = path.join(process.cwd(), 'public', 'projects.json');
  if (!fs.existsSync(projectsFile)) {
    console.log('No projects file found');
    return;
  }
  
  const projectsData = JSON.parse(fs.readFileSync(projectsFile, 'utf-8')) as OldProject[];
  
  for (const oldProject of projectsData) {
    try {
      const project = await prisma.project.create({
        data: {
          id: oldProject.id,
          name: oldProject.name,
          githubUrl: oldProject.githubUrl,
          owner: oldProject.owner,
          repo: oldProject.repo,
          createdAt: new Date(oldProject.createdAt),
          updatedAt: new Date(oldProject.lastUpdated),
        },
      });
      console.log(`✓ Migrated project: ${project.name}`);
    } catch (error) {
      console.error(`✗ Failed to migrate project ${oldProject.name}:`, error);
    }
  }
}

async function migrateChangelogs() {
  console.log('\nMigrating changelogs...');
  
  const changelogsDir = path.join(process.cwd(), 'public', 'changelogs');
  if (!fs.existsSync(changelogsDir)) {
    console.log('No changelogs directory found');
    return;
  }
  
  const files = fs.readdirSync(changelogsDir).filter(f => f.endsWith('.json'));
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(changelogsDir, file), 'utf-8');
      const oldChangelog = JSON.parse(content) as OldChangelog;
      
      // Create changelog
      const changelog = await prisma.changelog.create({
        data: {
          id: oldChangelog.id,
          projectId: oldChangelog.projectId,
          date: new Date(oldChangelog.date),
          version: oldChangelog.version,
          summary: oldChangelog.summary,
          content: oldChangelog.content,
          author: oldChangelog.author,
          createdAt: new Date(oldChangelog.createdAt),
        },
      });
      
      console.log(`✓ Migrated changelog: ${changelog.summary}`);
      
      // Note: We'll need to create actual commit records when we implement
      // the enhanced GitHub integration. For now, we're just storing the changelog.
      
    } catch (error) {
      console.error(`✗ Failed to migrate changelog from ${file}:`, error);
    }
  }
}

async function main() {
  console.log('Starting migration to database...\n');
  
  try {
    await migrateProjects();
    await migrateChangelogs();
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();