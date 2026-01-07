import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { forgotPassword, resetPassword, verifyResetToken } from '../controllers/passwordReset.controller';
import { getTrustedDevices, removeTrustedDevice, removeAllTrustedDevices } from '../controllers/trustedDevices.controller';
import { signupValidation, loginValidation } from '../middleware/validators';
import { protect } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signupValidation, authController.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, authController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   GET /api/auth/verify-reset-token/:token
 * @desc    Verify reset token validity
 * @access  Public
 */
router.get('/verify-reset-token/:token', verifyResetToken);

/**
 * @route   GET /api/auth/trusted-devices
 * @desc    Get list of trusted devices
 * @access  Private
 */
router.get('/trusted-devices', protect, getTrustedDevices);

/**
 * @route   DELETE /api/auth/trusted-devices/:fingerprint
 * @desc    Remove a trusted device
 * @access  Private
 */
router.delete('/trusted-devices/:fingerprint', protect, removeTrustedDevice);

/**
 * @route   DELETE /api/auth/trusted-devices
 * @desc    Remove all trusted devices
 * @access  Private
 */
router.delete('/trusted-devices', protect, removeAllTrustedDevices);

export default router;
