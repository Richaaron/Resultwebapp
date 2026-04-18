export interface Student {
  id: number;
  regNo: string;
  firstName: string;
  lastName: string;
  category: 'PRE-NURSERY' | 'NURSERY' | 'PRIMARY' | 'SECONDARY';
  class: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: number;
  name: string;
}

export interface Result {
  id?: number;
  studentId: number;
  subjectId: number;
  ca1: number;
  ca2: number;
  exam: number;
  total: number;
  grade: string;
  term: string;
  session: string;
  subject?: Subject;
}

export interface ResultSummary {
  results: Result[];
  totalScore: number;
  average: number;
}
