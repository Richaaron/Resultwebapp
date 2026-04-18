import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createSubject = async (req: Request, res: Response) => {
  const { name } = req.body;
  try {
    const subject = await prisma.subject.create({ data: { name } });
    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ error: 'Subject name must be unique' });
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid subject ID' });
    }
    const subject = await prisma.subject.findUnique({ where: { id: parsedId } });
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
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
