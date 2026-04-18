import { Router } from 'express';
import { getSubjects, createSubject, getSubjectById, updateSubject, deleteSubject } from '../controllers/subject.controller';

const router = Router();

router.get('/', getSubjects);
router.post('/', createSubject);
router.get('/:id', getSubjectById);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

export default router;
