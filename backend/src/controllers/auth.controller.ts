import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import { loginSchema } from '../utils/validation.js';
import { AppError } from '../utils/error.middleware.js';
import { logActivity } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export const login = async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const { username, password } = validatedData;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new AppError('Invalid username or password', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid username or password', 401);
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
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
};

export const getMe = async (req: any, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      username: true,
      role: true,
      fullName: true,
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
