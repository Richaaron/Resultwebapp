import { Router } from 'express';
import { getTeachers, createTeacher, assignTeacher, deleteAssignment, deleteTeacher } from '../controllers/teacher.controller.js';
import { authMiddleware, adminOnly } from '../utils/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', getTeachers);
router.post('/', createTeacher);
router.post('/assign', assignTeacher);
router.delete('/assign/:id', deleteAssignment);
router.delete('/:id', deleteTeacher);

export default router;
