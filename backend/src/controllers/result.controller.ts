import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { calculateGrade } from '../utils/grading';

export const getResults = async (req: Request, res: Response) => {
  try {
    const results = await prisma.result.findMany({
      include: { student: true, subject: true },
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const upsertResult = async (req: Request, res: Response) => {
  const { studentId, subjectId, ca1, ca2, exam, term, session } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { id: parseInt(studentId) } });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const total = (ca1 || 0) + (ca2 || 0) + (exam || 0);
    const grade = calculateGrade(total, student.category);

    const result = await prisma.result.upsert({
      where: {
        studentId_subjectId_term_session: {
          studentId: parseInt(studentId),
          subjectId: parseInt(subjectId),
          term,
          session,
        },
      },
      update: { ca1, ca2, exam, total, grade },
      create: {
        studentId: parseInt(studentId),
        subjectId: parseInt(subjectId),
        ca1,
        ca2,
        exam,
        total,
        grade,
        term,
        session,
      },
    });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update result' });
  }
};

export const getStudentResultByTerm = async (req: Request, res: Response) => {
  const { studentId, term, session } = req.params;
  try {
    const results = await prisma.result.findMany({
      where: {
        studentId: parseInt(studentId),
        term,
        session,
      },
      include: { subject: true },
    });

    const totalScore = results.reduce((sum, res) => sum + res.total, 0);
    const average = results.length > 0 ? totalScore / results.length : 0;

    res.json({ results, totalScore, average });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
