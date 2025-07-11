import { PrismaClient } from '@prisma/client';
import { generateProjectSlug } from '../lib/utils';

const prisma = new PrismaClient();

async function updateSlugs() {
  console.log('Updating project slugs...');
  
  const projects = await prisma.project.findMany({
    where: { slug: null },
  });
  
  for (const project of projects) {
    const slug = generateProjectSlug(project.owner, project.repo);
    
    try {
      await prisma.project.update({
        where: { id: project.id },
        data: { slug },
      });
      console.log(`✓ Updated ${project.name} with slug: ${slug}`);
    } catch (error) {
      console.error(`✗ Failed to update ${project.name}:`, error);
    }
  }
  
  console.log('Done!');
}

updateSlugs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());