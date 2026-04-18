import prisma from './prisma.js';

export const calculateGrade = async (score: number, schoolId: number, category?: string) => {
  // Try to find a custom scale for this school and category
  const customScales = await prisma.gradingScale.findMany({
    where: {
      schoolId,
      OR: [
        { category: category || null },
        { category: null }
      ]
    },
    orderBy: { minScore: 'desc' }
  });

  if (customScales.length > 0) {
    const matched = customScales.find(s => score >= s.minScore && score <= s.maxScore);
    if (matched) return matched.grade;
  }

  // Default Fallback
  if (score >= 70) return 'A';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C';
  if (score >= 45) return 'D';
  if (score >= 40) return 'E';
  return 'F';
};

