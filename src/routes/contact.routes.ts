import { Router } from 'express';
import contactController from '../controllers/contact.controller';

const router = Router();

/**
 * POST /identify
 * Identifies and reconciles contact information
 */
router.post('/identify', contactController.identify.bind(contactController));

export default router;
