const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phoneOrEmail: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  googleAvatar: {
    type: String,
    default: '',
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookAvatar: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  location: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: 'Dream Big. Stay Positive. ✨',
  },
  country: {
    type: String,
    default: '',
  },
  hideFollowersList: {
    type: Boolean,
    default: false,
  },
  profilePic: {
    type: String,
    default: '',
  },
  coverPic: {
    type: String,
    default: '',
  },
  website: {
    type: String,
    default: '',
  },
  note: {
    type: String,
    default: '',
  },
  noteCreatedAt: {
    type: Date,
    default: null,
  },
  stories: [{
    text: { type: String, default: '' },
    emoji: { type: String, default: '' },
    image: { type: String, default: '' },
    bgGradient: { type: String, default: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)' },
    textColor: { type: String, default: '#ffffff' },
    fontStyle: { type: String, default: 'normal' },
    music: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      url: { type: String, default: '' },
      coverUrl: { type: String, default: '' }
    },
    viewers: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      viewedAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  highlights: [{
    title: { type: String, default: 'Highlight' },
    cover: { type: String, default: '' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
  }],
  darkMode: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 0,
  },
  points: {
    type: Number,
    default: 0,
  },
  lifetimePoints: {
    type: Number,
    default: 0,
  },
  lastDailyCheckin: {
    type: Date,
    default: null,
  },
  dailyCheckinCount: {
    type: Number,
    default: 0,
  },
  lastVideoAd: {
    type: Date,
    default: null,
  },
  videoAdCount: {
    type: Number,
    default: 0,
  },
  lastViewAdsAd: {
    type: Date,
    default: null,
  },
  viewAdsCount: {
    type: Number,
    default: 0,
  },
  lastSpinDate: {
    type: Date,
    default: null,
  },
  spinCount: {
    type: Number,
    default: 0,
  },
  lastScratchDate: {
    type: Date,
    default: null,
  },
  scratchCount: {
    type: Number,
    default: 0,
  },
  lastQuizDate: {
    type: Date,
    default: null,
  },
  quizCount: {
    type: Number,
    default: 0,
  },
  lastGkQuizDate: {
    type: Date,
    default: null,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
  },
  isBanned: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
    default: null,
  },
  premiumCountry: {
    type: String,
    default: '',
  },
  premiumPackageName: {
    type: String,
    default: '',
  },
  lastArticleReadDate: {
    type: Date,
    default: null,
  },
  articleReadCount: {
    type: Number,
    default: 0,
  },
  lastMysteryBoxDate: {
    type: Date,
    default: null,
  },
  // Email Verification
  verifiedEmail: {
    type: String,
    default: '',
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  verificationBadge: {
    type: String,
    enum: ['none', 'blue', 'purple', 'golden'],
    default: 'none',
  },
  level: {
    type: Number,
    default: 1,
  },
  levelName: {
    type: String,
    default: 'Bronze',
  },
  emailVerificationCode: {
    type: String,
    default: null,
  },
  emailVerificationExpiry: {
    type: Date,
    default: null,
  },
  // Phone Verification (Verify in 2 minutes)
  verifiedPhone: {
    type: String,
    default: '',
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerificationCode: {
    type: String,
    default: null,
  },
  phoneVerificationExpiry: {
    type: Date,
    default: null,
  },
  // Verified Account Status (Both Email & Phone verified)
  isAccountVerified: {
    type: Boolean,
    default: false,
  },
  // Screen Time & Activity Tracking
  totalScreenTimeSeconds: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
  lastPlatform: {
    type: String,
    enum: ['web', 'android', 'ios'],
    default: 'web',
  },
  // Push Notification Device Tokens (FCM)
  fcmTokens: [{
    token: { type: String, required: true },
    platform: { type: String, default: 'android' },
    lastUpdated: { type: Date, default: Date.now }
  }],
  // Password Reset
  passwordResetCode: {
    type: String,
    default: null,
  },
  passwordResetCodeExpiry: {
    type: Date,
    default: null,
  },
  passwordResetToken: {
    type: String,
    default: null,
  },
  passwordResetExpiry: {
    type: Date,
    default: null,
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  dob: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    default: '',
  },
  dobPrivacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  genderPrivacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: []
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
}, { timestamps: true });

// Auto-generate referral code before saving if not set
UserSchema.pre('save', function () {
  if (!this.referralCode) {
    this.referralCode = 'ZNV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
});

// ── Indexes for fast query performance ────────────────────────────────────────
// Sort by newest user (admin panel, leaderboard)
UserSchema.index({ createdAt: -1 });
// Filter premium users (admin + referral)
UserSchema.index({ isPremium: 1 });
// Filter banned users (admin panel)
UserSchema.index({ isBanned: 1 });
// Leaderboard sort by lifetimePoints
UserSchema.index({ lifetimePoints: -1 });

module.exports = mongoose.model('User', UserSchema);
