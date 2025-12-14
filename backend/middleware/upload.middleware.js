import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Audio file storage
const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cloudly/audio',
    resource_type: 'video', // Cloudinary uses 'video' for audio files
    allowed_formats: ['mp3', 'wav', 'm4a', 'ogg', 'flac'],
    transformation: [{ audio_codec: 'mp3' }]
  }
});

// Image storage (for covers)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cloudly/covers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'center' }
    ]
  }
});

// File filter for audio
const audioFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/mp4',
    'audio/ogg',
    'audio/flac'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio file type. Allowed: mp3, wav, m4a, ogg, flac'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file type. Allowed: jpg, png, webp'), false);
  }
};

// Upload handlers
export const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Combined upload for song (audio + cover)
export const uploadSongFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);
