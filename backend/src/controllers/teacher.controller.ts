import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/error.middleware.js';

export const getTeachers = async (req: any, res: Response) => {
  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER', schoolId: req.school.id },
    include: { assignments: { include: { subject: true } } },
  });
  res.json(teachers);
};

export const createTeacher = async (req: any, res: Response) => {
  const { fullName, image } = req.body;
  
  // Auto-generate username and password
  const nameParts = fullName.toLowerCase().split(' ');
  const username = `${nameParts[0]}${Math.floor(Math.random() * 1000)}`;
  const password = Math.random().toString(36).slice(-8);
  const hashedPassword = await bcrypt.hash(password, 10);

  const teacher = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      role: 'TEACHER',
      fullName,
      image: image || null,
      schoolId: req.school.id,
    },
  });
  
  res.status(201).json({ teacher, generatedPassword: password });
};

export const assignTeacher = async (req: any, res: Response) => {
  const { teacherId, class: className, subjectId, category } = req.body;
  
  // Verify teacher belongs to the same school
  const teacher = await prisma.user.findUnique({ where: { id: parseInt(teacherId) } });
  if (!teacher || teacher.schoolId !== req.school.id) {
    throw new AppError('Teacher not found in this school', 404);
  }

  const assignment = await prisma.assignment.create({
    data: {
      teacherId: parseInt(teacherId),
      class: className,
      subjectId: subjectId ? parseInt(subjectId) : null,
      category,
    },
  });
  res.status(201).json(assignment);
};

export const deleteAssignment = async (req: any, res: Response) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) throw new AppError('Invalid assignment ID', 400);

  // Security check: ensure assignment belongs to a teacher in this school
  const assignment = await prisma.assignment.findUnique({
    where: { id: parsedId },
    include: { teacher: true }
  });

  if (!assignment || assignment.teacher.schoolId !== req.school.id) {
    throw new AppError('Assignment not found', 404);
  }

  await prisma.assignment.delete({ where: { id: parsedId } });
  res.status(204).send();
};

export const deleteTeacher = async (req: any, res: Response) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  const teacher = await prisma.user.findUnique({ where: { id: parsedId } });
  if (!teacher || teacher.schoolId !== req.school.id) {
    throw new AppError('Teacher not found', 404);
  }

  await prisma.$transaction([
    prisma.assignment.deleteMany({ where: { teacherId: parsedId } }),
    prisma.user.delete({ where: { id: parsedId } }),
  ]);
  
  res.status(204).send();
};
