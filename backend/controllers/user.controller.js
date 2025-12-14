import { validationResult } from 'express-validator';
import User from '../models/User.js';
import Song from '../models/Song.js';
import Playlist from '../models/Playlist.js';
import LikedSong from '../models/LikedSong.js';
import cloudinary from '../config/cloudinary.js';

// Helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    uploadStream.end(buffer);
  });
};

// Get user profile with stats
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts in parallel
    const [songsUploaded, playlistsCreated, likedCount] = await Promise.all([
      Song.countDocuments({ uploadedBy: userId }),
      Playlist.countDocuments({ createdBy: userId }),
      LikedSong.countDocuments({ user: userId })
    ]);

    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatarUrl: req.user.avatarUrl,
        createdAt: req.user.createdAt
      },
      stats: {
        songsUploaded,
        playlistsCreated,
        likedSongs: likedCount
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const user = req.user;

    if (name) {
      user.name = name;
    }

    // Handle avatar upload if provided
    if (req.file) {
      // Delete old avatar if exists
      if (user.avatarUrl) {
        const publicId = user.avatarUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`cloudly/avatars/${publicId}`).catch(() => {});
      }

      // Upload new avatar
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'cloudly/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }]
      });

      user.avatarUrl = result.secure_url;
    }

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Get home data (dashboard)
export const getHomeData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get data in parallel
    const [recentPlays, userPlaylists, likedSongs, newUploads] = await Promise.all([
      // Recently played
      (async () => {
        const ListeningHistory = (await import('../models/ListeningHistory.js')).default;
        const history = await ListeningHistory.aggregate([
          { $match: { user: userId } },
          { $sort: { playedAt: -1 } },
          { $group: { _id: '$song', lastPlayed: { $first: '$playedAt' } } },
          { $sort: { lastPlayed: -1 } },
          { $limit: 10 }
        ]);
        
        const songIds = history.map(h => h._id);
        const songs = await Song.find({ _id: { $in: songIds } })
          .populate('uploadedBy', 'name');
        
        return history.map(h => {
          const song = songs.find(s => s._id.toString() === h._id.toString());
          return song ? { ...song.toObject(), lastPlayed: h.lastPlayed } : null;
        }).filter(Boolean);
      })(),

      // User's playlists
      Playlist.find({ createdBy: userId })
        .select('name coverUrl songCount')
        .sort({ updatedAt: -1 })
        .limit(10),

      // Liked songs
      (async () => {
        const liked = await LikedSong.find({ user: userId })
          .populate({
            path: 'song',
            populate: { path: 'uploadedBy', select: 'name' }
          })
          .sort({ createdAt: -1 })
          .limit(10);
        return liked.filter(l => l.song).map(l => ({
          ...l.song.toObject(),
          liked: true
        }));
      })(),

      // New uploads (from all users)
      Song.find()
        .populate('uploadedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      recentlyPlayed: recentPlays,
      playlists: userPlaylists,
      likedSongs,
      newUploads
    });
  } catch (error) {
    console.error('Get home data error:', error);
    res.status(500).json({ error: 'Failed to get home data' });
  }
};

// Get library summary
export const getLibrary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [songs, playlists, likedCount] = await Promise.all([
      Song.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(50),
      Playlist.find({ createdBy: userId })
        .sort({ updatedAt: -1 }),
      LikedSong.countDocuments({ user: userId })
    ]);

    res.json({
      uploadedSongs: songs,
      playlists,
      likedSongsCount: likedCount
    });
  } catch (error) {
    console.error('Get library error:', error);
    res.status(500).json({ error: 'Failed to get library' });
  }
};
