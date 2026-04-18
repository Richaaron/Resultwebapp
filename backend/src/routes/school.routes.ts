import { Router } from 'express';
import { createSchool, getSchoolBySlug, updateSchool, getGradingScales, updateGradingScales } from '../controllers/school.controller.js';
import { authMiddleware, adminOnly } from '../utils/auth.middleware.js';

const router = Router();

router.post('/', createSchool);
router.get('/:slug', getSchoolBySlug);

router.use(authMiddleware);
router.patch('/', adminOnly, updateSchool);
router.get('/grading-scales', getGradingScales);
router.put('/grading-scales', adminOnly, updateGradingScales);

export default router;
