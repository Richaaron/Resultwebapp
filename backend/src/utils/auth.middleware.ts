import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';
import { AppError } from './error.middleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
    schoolId: number;
  };
  school?: {
    id: number;
    slug: string;
    name: string;
  };
}

export const schoolMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const schoolSlug = req.headers['x-school-slug'] as string;

  if (!schoolSlug) {
    return next();
  }

  try {
    const school = await prisma.school.findUnique({
      where: { slug: schoolSlug },
    });

    if (!school) {
      // Don't throw AppError here as it might break the creation flow if a slug is accidentally sent
      return next();
    }

    req.school = school;
    next();
  } catch (error) {
    next(error);
  }
};

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;

    // Security check: Ensure user belongs to the current school
    if (req.school && req.user?.schoolId !== req.school.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this school' });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access only' });
  }
  next();
};
