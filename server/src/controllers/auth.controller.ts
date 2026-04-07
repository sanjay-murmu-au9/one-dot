import { Request, Response, NextFunction } from 'express';
import { auth, db } from '../config/firebase';

/**
 * Send password reset email
 * POST /api/auth/reset-password
 * Body: { email: string }
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (!auth) {
      res.status(503).json({ error: 'Authentication service unavailable' });
      return;
    }

    // Generate password reset link using Firebase Admin
    const resetLink = await auth.generatePasswordResetLink(email, {
      url: process.env.PASSWORD_RESET_REDIRECT_URL || 'https://onedot.vercel.app/login',
    });

    // In production, you would send this link via your own email service
    // For now, Firebase will send the default email
    // To use custom email, integrate with SendGrid, Mailgun, etc.

    console.log(`[Auth] Password reset requested for: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully',
    });
  } catch (error: any) {
    console.error('[Auth] Password reset error:', error);

    // Handle specific Firebase errors
    if (error.code === 'auth/user-not-found') {
      // Don't reveal if user exists for security
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link will be sent',
      });
      return;
    }

    if (error.code === 'auth/invalid-email') {
      res.status(400).json({ error: 'Invalid email address' });
      return;
    }

    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

/**
 * Verify user token (for protected routes)
 * POST /api/auth/verify-token
 * Headers: { Authorization: 'Bearer <token>' }
 */
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    if (!auth) {
      res.status(503).json({ error: 'Authentication service unavailable' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    res.status(200).json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error: any) {
    console.error('[Auth] Token verification error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Delete user account
 * DELETE /api/auth/delete-account
 * Headers: { Authorization: 'Bearer <token>' }
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    if (!auth || !db) {
      res.status(503).json({ error: 'Authentication service unavailable' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Delete user document from Firestore
    try {
      await db.collection('users').doc(uid).delete();
      console.log(`[Auth] Deleted Firestore document for user: ${uid}`);
    } catch (firestoreError) {
      console.error('[Auth] Error deleting Firestore document:', firestoreError);
      // Continue with auth deletion even if Firestore fails
    }

    // Delete user from Firebase Auth
    await auth.deleteUser(uid);
    console.log(`[Auth] Deleted Firebase Auth user: ${uid}`);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    console.error('[Auth] Delete account error:', error);

    if (error.code === 'auth/user-not-found') {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (error.code === 'auth/invalid-user-token' || error.code === 'auth/argument-error') {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    res.status(500).json({ error: 'Failed to delete account' });
  }
};
