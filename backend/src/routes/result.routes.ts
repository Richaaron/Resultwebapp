import { Router } from 'express';
import { getResults, upsertResult, getStudentResultByTerm } from '../controllers/result.controller';

const router = Router();

router.get('/', getResults);
router.post('/', upsertResult);
router.get('/student/:studentId/term/:term/session/:session', getStudentResultByTerm);

export default router;
