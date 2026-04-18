import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/error.middleware.js';

export const getSubjects = async (req: any, res: Response) => {
  const subjects = await prisma.subject.findMany({
    where: { schoolId: req.school.id }
  });
  res.json(subjects);
};

export const createSubject = async (req: any, res: Response) => {
  const { name } = req.body;
  try {
    const subject = await prisma.subject.create({ 
      data: { name, schoolId: req.school.id } 
    });
    res.status(201).json(subject);
  } catch (error) {
    throw new AppError('Subject name must be unique in this school', 400);
  }
};

export const getSubjectById = async (req: any, res: Response) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new AppError('Invalid subject ID', 400);
  }
  const subject = await prisma.subject.findUnique({ where: { id: parsedId } });
  if (!subject || subject.schoolId !== req.school.id) {
    throw new AppError('Subject not found', 404);
  }
  res.json(subject);
};

export const updateSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }
    const subject = await prisma.subject.update({ where: { id: parsedId }, data: { name } });
    res.json(subject);
  } catch (error) {
    res.status(404).json({ error: 'Subject not found' });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.subject.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Subject not found' });
  }
};
