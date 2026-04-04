import { Router } from 'express';
import { resetPassword, verifyToken } from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/reset-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify Firebase ID token
 * @access  Public
 */
router.post('/verify-token', verifyToken);

export default router;
