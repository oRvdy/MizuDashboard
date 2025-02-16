
import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  discord: {
    id: String,
    tag: String,
    avatar: String
  },
  isPremium: { type: Boolean, default: false },
  musicUrl: String,
  musicName: String,
  bio: String,
  bannerUrl: String,
  stats: {
    views: { type: Number, default: 0 },
    lastUpdated: Date
  },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Profile', profileSchema)