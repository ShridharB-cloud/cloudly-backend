import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true,
    maxlength: [100, 'Artist name cannot exceed 100 characters']
  },
  album: {
    type: String,
    trim: true,
    maxlength: [100, 'Album name cannot exceed 100 characters'],
    default: 'Unknown Album'
  },
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required']
  },
  audioPublicId: {
    type: String,
    required: true
  },
  coverUrl: {
    type: String,
    default: null
  },
  coverPublicId: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
songSchema.index({ uploadedBy: 1, createdAt: -1 });
songSchema.index({ title: 'text', artist: 'text', album: 'text' });

export default mongoose.model('Song', songSchema);
