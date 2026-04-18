import { Router } from 'express';
import { getResults, upsertResult, getStudentResultByTerm, publicCheckResult, bulkUpsertResults } from '../controllers/result.controller.js';
import { authMiddleware } from '../utils/auth.middleware.js';

const router = Router();

router.post('/check', publicCheckResult);

router.use(authMiddleware);
router.get('/', getResults);
router.post('/', upsertResult);
router.post('/bulk', bulkUpsertResults);
router.get('/student/:studentId/term/:term/session/:session', getStudentResultByTerm);

export default router;
