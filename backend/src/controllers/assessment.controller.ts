import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';

export const getAssessment = async (req: any, res: Response) => {
  const { studentId, term, session } = req.params;
  try {
    const assessment = await prisma.assessment.findUnique({
      where: {
        studentId_term_session: {
          studentId: parseInt(studentId),
          term,
          session,
        },
      },
    });
    res.json(assessment || {});
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const upsertAssessment = async (req: any, res: Response) => {
  const { studentId, term, session, ...data } = req.body;
  try {
    const assessment = await prisma.assessment.upsert({
      where: {
        studentId_term_session: {
          studentId: parseInt(studentId),
          term,
          session,
        },
      },
      update: data,
      create: {
        studentId: parseInt(studentId),
        term,
        session,
        ...data,
      },
    });
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assessment' });
  }
};
