import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateShowSummary() {
  try {
    // First, count how many projects have showSummary = true
    const projectsWithShowSummary = await prisma.project.count({
      where: {
        showSummary: true
      }
    });
    
    console.log(`Found ${projectsWithShowSummary} projects with showSummary = true`);
    
    // Update ALL projects to have showSummary = false
    const result = await prisma.project.updateMany({
      where: {}, // No filter - update all projects
      data: {
        showSummary: false
      }
    });
    
    console.log(`Updated ${result.count} total projects to have showSummary = false`);
    
    // Verify the update
    const remainingTrue = await prisma.project.count({
      where: {
        showSummary: true
      }
    });
    
    console.log(`Verification: ${remainingTrue} projects still have showSummary = true`);
  } catch (error) {
    console.error('Error updating projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateShowSummary();