const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: false,
  },
  title: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: null,
  },
  images: [{
    type: String,
    default: [],
  }],
  video: {
    type: String,
    default: null,
  },
  postType: {
    type: String,
    enum: ['standard', 'profile_picture', 'cover_photo'],
    default: 'standard',
  },
  sharedPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  shareCount: {
    type: Number,
    default: 0,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  authorName: {
    type: String,
    default: 'Zenivio',
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  customTime: {
    type: String,
    default: null,
  },
  privacy: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'public',
  },
  feeling: {
    type: String,
    default: null,
  },
  location: {
    type: String,
    default: null,
  },
  taggedFriends: [{
    type: String,
    default: [],
  }],
  bgGradient: {
    type: String,
    default: null,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      default: 'love'
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userAvatar: {
      type: String,
      default: ''
    },
    verificationBadge: {
      type: String,
      enum: ['none', 'blue', 'golden'],
      default: 'none'
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    replies: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userName: {
        type: String,
        required: true
      },
      userAvatar: {
        type: String,
        default: ''
      },
      verificationBadge: {
        type: String,
        enum: ['none', 'blue', 'golden'],
        default: 'none'
      },
      isEmailVerified: {
        type: Boolean,
        default: false
      },
      text: {
        type: String,
        required: true
      },
      replyToUser: {
        type: String,
        default: ''
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  reports: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      default: 'Inappropriate content'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isHidden: {
    type: Boolean,
    default: false,
  },
  hiddenReason: {
    type: String,
    default: null,
  }
}, { timestamps: true });

// Optimize query performance for loading posts and video reels instantly
PostSchema.index({ video: 1, createdAt: -1 });
PostSchema.index({ authorId: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ isHidden: 1, createdAt: -1 });

module.exports = mongoose.model('Post', PostSchema);
