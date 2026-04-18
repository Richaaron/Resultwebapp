export const calculateGrade = (total: number, category: string): string => {
  // Automatic grading from A to F for all levels as requested
  if (total >= 70) return 'A';
  if (total >= 60) return 'B';
  if (total >= 50) return 'C';
  if (total >= 45) return 'D';
  if (total >= 40) return 'E';
  return 'F';
};

