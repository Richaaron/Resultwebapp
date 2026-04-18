import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany({
      include: { results: true },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { regNo, firstName, lastName, category, class: studentClass } = req.body;
  try {
    const student = await prisma.student.create({
      data: { regNo, firstName, lastName, category, class: studentClass },
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: 'Registration number must be unique' });
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: { id: parseInt(id) },
      include: { results: { include: { subject: true } } },
    });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, category, class: studentClass } = req.body;
  try {
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, category, class: studentClass },
    });
    res.json(student);
  } catch (error) {
    res.status(404).json({ error: 'Student not found' });
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.student.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: 'Student not found' });
  }
};
