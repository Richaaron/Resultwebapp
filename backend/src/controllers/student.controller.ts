import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { studentSchema } from '../utils/validation.js';
import { AppError } from '../utils/error.middleware.js';
import { logActivity } from '../utils/logger.js';

export const getStudents = async (req: any, res: Response) => {
  const { search, page = '1', limit = '10' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  let where: any = {};
  
  // Search filter
  if (search) {
    where.OR = [
      { firstName: { contains: search as string } },
      { lastName: { contains: search as string } },
      { regNo: { contains: search as string } },
    ];
  }

  // Teacher Access Check (RBAC)
  if (req.user.role === 'TEACHER') {
    const assignments = await prisma.assignment.findMany({
      where: { teacherId: req.user.id }
    });
    
    const assignedClasses = assignments.map(a => a.class).filter(Boolean);
    const assignedCategories = assignments.map(a => a.category).filter(Boolean);

    const teacherFilter = {
      OR: [
        { class: { in: assignedClasses as string[] } },
        { category: { in: assignedCategories as string[] } }
      ]
    };

    if (where.OR) {
      where = { AND: [where, teacherFilter] };
    } else {
      where = teacherFilter;
    }
  }

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take,
      include: { results: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({
    students,
    pagination: {
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
};

export const createStudent = async (req: any, res: Response) => {
  const validatedData = studentSchema.parse(req.body);
  const { regNo, firstName, lastName, category, class: studentClass, image } = validatedData;
  
  try {
    const student = await prisma.student.create({
      data: { regNo, firstName, lastName, category, class: studentClass, image: image || null },
    });

    await logActivity(req.user.id, 'CREATE_STUDENT', { studentId: student.id, regNo }, req.ip);

    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new AppError('Registration number must be unique', 400);
    }
    throw error;
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new AppError('Invalid student ID', 400);
  }

  const student = await prisma.student.findUnique({
    where: { id: parsedId },
    include: { results: { include: { subject: true } } },
  });
  if (!student) throw new AppError('Student not found', 404);
  res.json(student);
};

export const updateStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = studentSchema.partial().parse(req.body);
  const { firstName, lastName, category, class: studentClass } = validatedData;

  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new AppError('Invalid student ID', 400);
  }

  try {
    const student = await prisma.student.update({
      where: { id: parsedId },
      data: { firstName, lastName, category, class: studentClass },
    });
    res.json(student);
  } catch (error) {
    throw new AppError('Student not found', 404);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new AppError('Invalid student ID', 400);
  }

  try {
    await prisma.student.delete({ where: { id: parsedId } });
    res.status(204).send();
  } catch (error) {
    throw new AppError('Student not found', 404);
  }
};
