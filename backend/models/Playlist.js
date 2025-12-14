import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Playlist name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  coverUrl: {
    type: String,
    default: null
  },
  coverPublicId: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  songs: [{
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song'
    },
    position: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for song count
playlistSchema.virtual('songCount').get(function() {
  return this.songs.length;
});

// Ensure virtuals are included in JSON
playlistSchema.set('toJSON', { virtuals: true });
playlistSchema.set('toObject', { virtuals: true });

// Index for faster queries
playlistSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model('Playlist', playlistSchema);
