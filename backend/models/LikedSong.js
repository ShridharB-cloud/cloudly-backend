import mongoose from 'mongoose';

const likedSongSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only like a song once
likedSongSchema.index({ user: 1, song: 1 }, { unique: true });

// Index for faster lookups
likedSongSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('LikedSong', likedSongSchema);
