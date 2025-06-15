import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  resetAdminPassword,
  getUsers
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/reset-admin', resetAdminPassword);
router.get('/users', protect, getUsers);

export default router;