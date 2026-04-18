import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { calculateGrade } from '../utils/grading.js';
import { resultSchema } from '../utils/validation.js';
import { AppError } from '../utils/error.middleware.js';
import { logActivity } from '../utils/logger.js';

export const getResults = async (req: Request, res: Response) => {
  const results = await prisma.result.findMany({
    include: { student: true, subject: true },
  });
  res.json(results);
};

export const upsertResult = async (req: any, res: Response) => {
  const validatedData = resultSchema.parse(req.body);
  const { studentId, subjectId, ca1, ca2, exam, term, session } = validatedData;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw new AppError('Student not found', 404);

  // Teacher Access Check
  if (req.user.role === 'TEACHER') {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: req.user.id }
    });

    const hasAccess = assignments.some(a => {
      const classMatch = !a.class || a.class === student.class;
      const subjectMatch = !a.subjectId || a.subjectId === subjectId;
      const categoryMatch = !a.category || a.category === student.category;
      return classMatch && subjectMatch && categoryMatch;
    });

    if (!hasAccess) {
      throw new AppError('Forbidden: You are not assigned to this student/subject', 403);
    }
  }

  const total = (ca1 || 0) + (ca2 || 0) + (exam || 0);
  const grade = calculateGrade(total, student.category);

  const result = await prisma.result.upsert({
    where: {
      studentId_subjectId_term_session: {
        studentId,
        subjectId,
        term,
        session,
      },
    },
    update: { ca1, ca2, exam, total, grade },
    create: {
      studentId,
      subjectId,
      ca1,
      ca2,
      exam,
      total,
      grade,
      term,
      session,
    },
  });

  await logActivity(req.user.id, 'UPSERT_RESULT', { 
    studentId, 
    subjectId, 
    total, 
    term, 
    session 
  }, req.ip);

  res.json(result);
};

export const getStudentResultByTerm = async (req: any, res: Response) => {
  const { studentId, term, session } = req.params;
  const parsedStudentId = parseInt(studentId);
  if (isNaN(parsedStudentId)) {
    throw new AppError('Invalid student ID', 400);
  }

  const student = await prisma.student.findUnique({ where: { id: parsedStudentId } });
  if (!student) throw new AppError('Student not found', 404);

  // Teacher Access Check
  if (req.user.role === 'TEACHER') {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: req.user.id }
    });

    const hasAccess = assignments.some(a => {
      const classMatch = !a.class || a.class === student.class;
      const categoryMatch = !a.category || a.category === student.category;
      return classMatch && categoryMatch;
    });

    if (!hasAccess) {
      throw new AppError('Forbidden: You are not assigned to this student class', 403);
    }
  }

  // 1. Get current student's results
  const results = await prisma.result.findMany({
    where: {
      studentId: parsedStudentId,
      term,
      session,
    },
    include: { subject: true },
  });

  const totalScore = results.reduce((sum, res) => sum + res.total, 0);
  const average = results.length > 0 ? totalScore / results.length : 0;

  // 2. Calculate Rank/Position in Class
  const allStudentsInClass = await prisma.student.findMany({
    where: { class: student.class, category: student.category },
    include: {
      results: {
        where: { term, session }
      }
    }
  });

  const classScores = allStudentsInClass.map(s => ({
    studentId: s.id,
    total: s.results.reduce((sum, r) => sum + r.total, 0)
  })).sort((a, b) => b.total - a.total);

  const position = classScores.findIndex(s => s.studentId === parsedStudentId) + 1;
  const totalStudentsInClass = allStudentsInClass.length;

  // 3. Get Subject Statistics (Highest, Lowest, Average)
  const subjectStats = await Promise.all(results.map(async (res) => {
    const allScoresForSubject = await prisma.result.findMany({
      where: {
        subjectId: res.subjectId,
        term,
        session,
        student: { class: student.class }
      }
    });

    const scores = allScoresForSubject.map(s => s.total);
    return {
      subjectId: res.subjectId,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    };
  }));

  res.json({ 
    results, 
    totalScore, 
    average, 
    position, 
    totalInClass: totalStudentsInClass,
    subjectStats 
  });
};
