const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String, // 'YYYY-MM-DD' in Asia/Dhaka
    required: true,
    index: true
  },
  activeSeconds: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPingAt: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web'
  }
}, {
  timestamps: true
});

UserActivitySchema.index({ userId: 1, date: 1 }, { unique: true });
UserActivitySchema.index({ date: 1, activeSeconds: -1 });

module.exports = mongoose.model('UserActivity', UserActivitySchema);
