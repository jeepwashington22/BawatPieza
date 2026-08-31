import { Router } from 'express';
import { sendNotification, testConnection } from '../controllers/emailController.js';

const router = Router();

router.post('/send', sendNotification);
router.get('/test', testConnection);

export default router;