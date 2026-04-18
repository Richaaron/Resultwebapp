import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      fullName: 'System Administrator',
    },
  });
  console.log('Admin user created');

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
