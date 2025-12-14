import mongoose from 'mongoose';

const listeningHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

// Index for recent plays query
listeningHistorySchema.index({ user: 1, playedAt: -1 });

// TTL index to auto-delete history older than 30 days (optional)
// listeningHistorySchema.index({ playedAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model('ListeningHistory', listeningHistorySchema);
