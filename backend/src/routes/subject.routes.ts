import { Router } from 'express';
import { getSubjects, createSubject, getSubjectById, updateSubject, deleteSubject } from '../controllers/subject.controller.js';
import { authMiddleware, adminOnly } from '../utils/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getSubjects);
router.post('/', adminOnly, createSubject);
router.get('/:id', getSubjectById);
router.put('/:id', adminOnly, updateSubject);
router.delete('/:id', adminOnly, deleteSubject);

export default router;
