import { Router } from 'express';
import { getResults, upsertResult, getStudentResultByTerm } from '../controllers/result.controller.js';
import { authMiddleware } from '../utils/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getResults);
router.post('/', upsertResult);
router.get('/student/:studentId/term/:term/session/:session', getStudentResultByTerm);

export default router;
