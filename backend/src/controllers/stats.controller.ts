import { Response } from 'express';
import prisma from '../utils/prisma.js';

export const getStats = async (req: any, res: Response) => {
  const [studentCount, teacherCount, subjectCount, resultCount] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.subject.count(),
    prisma.result.count(),
  ]);

  // Get recent activities or other stats if needed
  const recentResults = await prisma.result.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      student: { select: { firstName: true, lastName: true } },
      subject: { select: { name: true } },
    },
  });

  res.json({
    summary: {
      students: studentCount,
      teachers: teacherCount,
      subjects: subjectCount,
      results: resultCount,
    },
    recentResults,
  });
};
