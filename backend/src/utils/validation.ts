import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const studentSchema = z.object({
  regNo: z.string().min(1, 'Registration number is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  category: z.enum(['NURSERY', 'PRIMARY', 'SECONDARY']),
  class: z.string().min(1, 'Class is required'),
  image: z.string().optional(),
});

export const resultSchema = z.object({
  studentId: z.number(),
  subjectId: z.number(),
  ca1: z.number().min(0).max(20).default(0),
  ca2: z.number().min(0).max(20).default(0),
  exam: z.number().min(0).max(60).default(0),
  term: z.string(),
  session: z.string(),
});

export const assessmentSchema = z.object({
  studentId: z.number(),
  term: z.string(),
  session: z.string(),
  punctuality: z.number().min(1).max(5).default(5),
  neatness: z.number().min(1).max(5).default(5),
  honesty: z.number().min(1).max(5).default(5),
  leadership: z.number().min(1).max(5).default(5),
  creativity: z.number().min(1).max(5).default(5),
  teacherComment: z.string().optional(),
  principalComment: z.string().optional(),
  attendance: z.number().optional(),
  totalDays: z.number().optional(),
});
