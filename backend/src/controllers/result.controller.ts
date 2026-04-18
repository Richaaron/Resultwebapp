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
  const grade = await calculateGrade(total, req.school.id, student.category);

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

export const bulkUpsertResults = async (req: any, res: Response) => {
  const { results, term, session } = req.body;

  if (!Array.isArray(results)) {
    throw new AppError('Results must be an array', 400);
  }

  const resultsToProcess = [];
  
  for (const item of results) {
    const { regNo, subjectName, ca1, ca2, exam } = item;
    
    // Find student
    const student = await prisma.student.findUnique({
      where: { regNo_schoolId: { regNo, schoolId: req.school.id } }
    });
    if (!student) continue;

    // Find subject
    const subject = await prisma.subject.findUnique({
      where: { name_schoolId: { name: subjectName, schoolId: req.school.id } }
    });
    if (!subject) continue;

    const total = (parseFloat(ca1) || 0) + (parseFloat(ca2) || 0) + (parseFloat(exam) || 0);
    const grade = await calculateGrade(total, req.school.id, student.category);

    resultsToProcess.push(
      prisma.result.upsert({
        where: {
          studentId_subjectId_term_session: {
            studentId: student.id,
            subjectId: subject.id,
            term,
            session,
          },
        },
        update: { ca1: parseFloat(ca1) || 0, ca2: parseFloat(ca2) || 0, exam: parseFloat(exam) || 0, total, grade },
        create: {
          studentId: student.id,
          subjectId: subject.id,
          ca1: parseFloat(ca1) || 0,
          ca2: parseFloat(ca2) || 0,
          exam: parseFloat(exam) || 0,
          total,
          grade,
          term,
          session,
        },
      })
    );
  }

  await prisma.$transaction(resultsToProcess);
  
  await logActivity(req.user.id, 'BULK_UPSERT_RESULTS', { 
    count: resultsToProcess.length,
    term, 
    session 
  }, req.ip);

  res.json({ message: `Successfully processed ${resultsToProcess.length} results` });
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

export const publicCheckResult = async (req: any, res: Response) => {
  const { regNo, term, session } = req.body;
  
  if (!req.school.isPublic) {
    throw new AppError('Online result checking is disabled for this school', 403);
  }

  const student = await prisma.student.findUnique({
    where: { regNo_schoolId: { regNo, schoolId: req.school.id } },
  });

  if (!student) {
    throw new AppError('Student record not found', 404);
  }

  // Reuse the logic from getStudentResultByTerm but without full auth
  const results = await prisma.result.findMany({
    where: {
      studentId: student.id,
      term,
      session,
    },
    include: { subject: true },
  });

  if (results.length === 0) {
    throw new AppError('No results found for the specified term/session', 404);
  }

  const totalScore = results.reduce((sum, res) => sum + res.total, 0);
  const average = results.length > 0 ? totalScore / results.length : 0;

  // Position in class
  const allStudentsInClass = await prisma.student.findMany({
    where: { class: student.class, category: student.category, schoolId: req.school.id },
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

  const position = classScores.findIndex(s => s.studentId === student.id) + 1;
  const assessment = await prisma.assessment.findUnique({
    where: { studentId_term_session: { studentId: student.id, term, session } }
  });

  res.json({
    student,
    school: req.school,
    results,
    totalScore,
    average,
    position,
    totalInClass: allStudentsInClass.length,
    assessment
  });
};
