import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { loginSchema } from '../utils/validation.js';
import { AppError } from '../utils/error.middleware.js';
import { logActivity } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const login = async (req: any, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    if (!req.school) {
      throw new AppError('School not found or slug missing', 404);
    }

    const user = await prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
        },
        schoolId: req.school.id
      },
    });

    if (!user) {
      throw new AppError('Invalid username or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid username or password', 401);
    }

    const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          schoolId: user.schoolId
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

    await logActivity(user.id, 'LOGIN', { username: user.username }, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (error: any) {
    console.error('Login Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.statusCode) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal Server Error during login' });
  }
};

export const getMe = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      role: true,
      fullName: true,
      schoolId: true,
      school: true,
      assignments: {
        include: {
          subject: true,
        },
      },
    },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json(user);
};
