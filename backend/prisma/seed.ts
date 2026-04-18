import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const subjects = [
    'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
    'Civic Education', 'Economics', 'Agricultural Science', 'Geography',
    'Literature in English', 'History', 'CRS', 'IRS', 'Yoruba', 'Igbo', 'Hausa'
  ];

  for (const name of subjects) {
    await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed subjects created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
