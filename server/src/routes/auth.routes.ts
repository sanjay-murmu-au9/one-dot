import { Router } from 'express';
import { resetPassword, verifyToken, deleteAccount } from '../controllers/auth.controller';

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

/**
 * @route   DELETE /api/auth/delete-account
 * @desc    Delete user account
 * @access  Private (requires valid token)
 */
router.delete('/delete-account', deleteAccount);

export default router;
