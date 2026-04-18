import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getBroadsheet = async (req: any, res: Response) => {
  const { class: className, term, session } = req.query;
  try {
    // Get all students in the class
    const students = await prisma.student.findMany({
      where: { class: className as string },
      include: {
        results: {
          where: { term: term as string, session: session as string },
          include: { subject: true }
        }
      }
    });

    // Get all subjects that have results in this class/term/session
    const subjectIds = new Set<number>();
    students.forEach(s => s.results.forEach(r => subjectIds.add(r.subjectId)));
    
    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } }
    });

    // Format data for a grid
    const broadsheet = students.map(student => {
      const studentResults: any = {};
      student.results.forEach(r => {
        studentResults[r.subjectId] = {
          total: r.total,
          grade: r.grade
        };
      });

      const totalScore = student.results.reduce((sum, r) => sum + r.total, 0);
      const average = student.results.length > 0 ? totalScore / student.results.length : 0;

      return {
        id: student.id,
        regNo: student.regNo,
        fullName: `${student.firstName} ${student.lastName}`,
        results: studentResults,
        totalScore,
        average
      };
    }).sort((a, b) => b.totalScore - a.totalScore); // Sort by total score (ranking)

    res.json({ broadsheet, subjects });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const exportBroadsheet = async (req: any, res: Response) => {
  // ... existing code
};

export const getCumulativeBroadsheet = async (req: any, res: Response) => {
  const { class: className, session } = req.query;
  
  try {
    const students = await prisma.student.findMany({
      where: { class: className as string, schoolId: req.school.id },
      include: {
        results: {
          where: { session: session as string },
          include: { subject: true }
        }
      }
    });

    const subjectIds = new Set<number>();
    students.forEach(s => s.results.forEach(r => subjectIds.add(r.subjectId)));
    
    const subjects = await prisma.subject.findMany({
      where: { id: { in: Array.from(subjectIds) } }
    });

    const cumulativeData = students.map(student => {
      const studentResults: any = {};
      
      // Group results by subject
      const resultsBySubject: any = {};
      student.results.forEach(r => {
        if (!resultsBySubject[r.subjectId]) resultsBySubject[r.subjectId] = [];
        resultsBySubject[r.subjectId].push(r);
      });

      subjects.forEach(subject => {
        const subjectResults = resultsBySubject[subject.id] || [];
        const first = subjectResults.find(r => r.term === 'First')?.total || 0;
        const second = subjectResults.find(r => r.term === 'Second')?.total || 0;
        const third = subjectResults.find(r => r.term === 'Third')?.total || 0;
        const average = (first + second + third) / 3;
        
        studentResults[subject.id] = {
          first, second, third, average
        };
      });

      const totalAverage = Object.values(studentResults).reduce((sum: number, r: any) => sum + r.average, 0);
      const sessionAverage = Object.values(studentResults).length > 0 ? totalAverage / Object.values(studentResults).length : 0;

      return {
        id: student.id,
        regNo: student.regNo,
        fullName: `${student.firstName} ${student.lastName}`,
        subjectData: studentResults,
        sessionAverage
      };
    }).sort((a, b) => b.sessionAverage - a.sessionAverage);

    res.json({ cumulativeData, subjects });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
