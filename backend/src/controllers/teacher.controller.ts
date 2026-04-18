import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      include: { assignments: { include: { subject: true } } },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { fullName, image } = req.body;
  
  // Auto-generate username and password
  const nameParts = fullName.toLowerCase().split(' ');
  const username = `${nameParts[0]}${Math.floor(Math.random() * 1000)}`;
  const password = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const teacher = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'TEACHER',
        fullName,
        image: image || null,
      },
    });
    
    // Return the generated credentials only once
    res.status(201).json({ teacher, generatedPassword: password });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create teacher' });
  }
};

export const assignTeacher = async (req: Request, res: Response) => {
  const { teacherId, class: className, subjectId, category } = req.body;
  try {
    const assignment = await prisma.assignment.create({
      data: {
        teacherId: parseInt(teacherId),
        class: className,
        subjectId: subjectId ? parseInt(subjectId) : null,
        category,
      },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create assignment' });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return res.status(400).json({ error: 'Invalid assignment ID' });
    }
    await prisma.assignment.delete({ where: { id: parsedId } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Assignment not found' });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Also deletes assignments due to relation if needed, or handle manually
    await prisma.assignment.deleteMany({ where: { teacherId: parseInt(id) } });
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Teacher not found' });
  }
};
