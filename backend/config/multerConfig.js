const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`); // Changed from 'audio' to 'video'
  }
});

// File filter to accept video files (includes audio track)
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/webm',
    'video/mp4',
    'video/ogg',
    'video/x-matroska',
    // Also accept audio for backward compatibility
    'audio/webm',
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video/audio files are allowed.'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size (increased for video)
  }
});

module.exports = upload;
