import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import {
  getProfile,
  updateProfile,
  getHomeData,
  getLibrary
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// All routes require authentication
router.use(protect);

// Validation
const updateValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Name must be 1-50 characters')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', upload.single('avatar'), updateValidation, updateProfile);
router.get('/home', getHomeData);
router.get('/library', getLibrary);

export default router;
