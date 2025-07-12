import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyShowSummary() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        showSummary: true
      }
    });
    
    console.log('Project Summary Status:');
    console.log('=======================');
    
    projects.forEach(project => {
      console.log(`${project.name}: showSummary = ${project.showSummary}`);
    });
    
    const trueCount = projects.filter(p => p.showSummary).length;
    const falseCount = projects.filter(p => !p.showSummary).length;
    
    console.log('\nSummary:');
    console.log(`Total projects: ${projects.length}`);
    console.log(`Projects with showSummary = true: ${trueCount}`);
    console.log(`Projects with showSummary = false: ${falseCount}`);
    
  } catch (error) {
    console.error('Error verifying projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyShowSummary();