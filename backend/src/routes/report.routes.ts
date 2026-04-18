import { Router } from 'express';
import { getAssessment, upsertAssessment } from '../controllers/assessment.controller.js';
import { getBroadsheet, exportBroadsheet, getCumulativeBroadsheet } from '../controllers/broadsheet.controller.js';
import { authMiddleware } from '../utils/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/assessment/:studentId/:term/:session', getAssessment);
router.post('/assessment', upsertAssessment);
router.get('/broadsheet', getBroadsheet);
router.get('/broadsheet/cumulative', getCumulativeBroadsheet);
router.get('/broadsheet/export', exportBroadsheet);

export default router;
