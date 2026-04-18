import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { AppError } from '../utils/error.middleware.js';
import bcrypt from 'bcryptjs';

export const createSchool = async (req: Request, res: Response) => {
  try {
    const { schoolName, adminName, username, password } = req.body;

    if (!schoolName || !adminName || !username || !password) {
      throw new AppError('All fields are required', 400);
    }

    const slug = schoolName.toLowerCase().trim().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // Check if slug exists
    const existingSchool = await prisma.school.findUnique({ where: { slug } });
    if (existingSchool) {
      throw new AppError('A school with a similar name already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const school = await prisma.school.create({
      data: {
        name: schoolName,
        slug,
        users: {
          create: {
            username,
            password: hashedPassword,
            fullName: adminName,
            role: 'ADMIN',
          },
        },
        // Create some default subjects for the new school
        subjects: {
          create: [
            { name: 'Mathematics' },
            { name: 'English Language' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Biology' },
          ],
        },
      },
      include: {
        users: true,
      },
    });

    res.status(201).json({
      message: 'School created successfully',
      school: {
        id: school.id,
        name: school.name,
        slug: school.slug,
      },
      admin: {
        username: school.users[0].username,
      },
    });
  } catch (error: any) {
    console.error('School Creation Error:', error);
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A school or user with these details already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error during school creation' });
  }
};

export const getSchoolBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const school = await prisma.school.findUnique({
    where: { slug },
    select: { id: true, name: true, slug: true },
  });

  if (!school) {
    throw new AppError('School not found', 404);
  }

  res.json(school);
};

export const updateSchool = async (req: any, res: Response) => {
  const { name, motto, address, logo, isPublic } = req.body;
  
  const school = await prisma.school.update({
    where: { id: req.school.id },
    data: { name, motto, address, logo, isPublic },
  });

  res.json(school);
};

export const getGradingScales = async (req: any, res: Response) => {
  const scales = await prisma.gradingScale.findMany({
    where: { schoolId: req.school.id },
    orderBy: { minScore: 'desc' },
  });
  res.json(scales);
};

export const updateGradingScales = async (req: any, res: Response) => {
  const { scales } = req.body;

  // Transaction to replace all scales
  await prisma.$transaction([
    prisma.gradingScale.deleteMany({ where: { schoolId: req.school.id } }),
    prisma.gradingScale.createMany({
      data: scales.map((s: any) => ({
        ...s,
        schoolId: req.school.id,
        id: undefined, // Let DB generate new IDs
      })),
    }),
  ]);

  res.json({ message: 'Grading scales updated successfully' });
};
