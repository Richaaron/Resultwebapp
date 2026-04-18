export const calculateGrade = (total: number, category: string): string => {
  if (category === 'NURSERY') {
    if (total >= 80) return 'EXCELLENT';
    if (total >= 70) return 'VERY GOOD';
    if (total >= 60) return 'GOOD';
    if (total >= 50) return 'PASS';
    return 'FAIL';
  } else if (category === 'PRIMARY') {
    if (total >= 70) return 'A';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    if (total >= 40) return 'E';
    return 'F';
  } else { // SECONDARY (WASSCE Standard)
    if (total >= 75) return 'A1';
    if (total >= 70) return 'B2';
    if (total >= 65) return 'B3';
    if (total >= 60) return 'C4';
    if (total >= 55) return 'C5';
    if (total >= 50) return 'C6';
    if (total >= 45) return 'D7';
    if (total >= 40) return 'E8';
    return 'F9';
  }
};
