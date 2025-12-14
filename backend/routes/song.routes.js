import { Router } from 'express';
import { body } from 'express-validator';
import {
  uploadSong,
  getSongs,
  getSong,
  deleteSong,
  likeSong,
  unlikeSong,
  getLikedSongs,
  recordPlay,
  getRecentlyPlayed
} from '../controllers/song.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { uploadSongFiles } from '../middleware/upload.middleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Validation
const uploadValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('artist')
    .trim()
    .notEmpty().withMessage('Artist is required')
    .isLength({ max: 100 }).withMessage('Artist cannot exceed 100 characters'),
  body('album')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Album cannot exceed 100 characters')
];

// Song CRUD
router.post('/upload', uploadSongFiles, uploadValidation, uploadSong);
router.get('/', getSongs);
router.get('/liked', getLikedSongs);
router.get('/recent', getRecentlyPlayed);
router.get('/:id', getSong);
router.delete('/:id', deleteSong);

// Like/unlike
router.post('/:id/like', likeSong);
router.delete('/:id/like', unlikeSong);

// Play tracking
router.post('/:id/play', recordPlay);

export default router;
