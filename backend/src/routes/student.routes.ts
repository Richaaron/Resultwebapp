import { Router } from 'express';
import { getStudents, createStudent, getStudentById, updateStudent, deleteStudent } from '../controllers/student.controller.js';
import { authMiddleware, adminOnly } from '../utils/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getStudents);
router.post('/', adminOnly, createStudent);
router.get('/:id', getStudentById);
router.put('/:id', adminOnly, updateStudent);
router.delete('/:id', adminOnly, deleteStudent);

export default router;
