const Post = require('../models/Post');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const enrichComments = (comments = []) => {
  return comments.map(c => {
    const u = c.user;
    const isUserPopulated = u && typeof u === 'object';
    const verificationBadge = (isUserPopulated && u.verificationBadge && u.verificationBadge !== 'none') 
      ? u.verificationBadge 
      : (c.verificationBadge && c.verificationBadge !== 'none' ? c.verificationBadge : 'none');
    const isEmailVerified = Boolean(isUserPopulated ? u.isEmailVerified : c.isEmailVerified);

    const replies = (c.replies || []).map(r => {
      const ru = r.user;
      const isRuPopulated = ru && typeof ru === 'object';
      const rBadge = (isRuPopulated && ru.verificationBadge && ru.verificationBadge !== 'none')
        ? ru.verificationBadge
        : (r.verificationBadge && r.verificationBadge !== 'none' ? r.verificationBadge : 'none');
      const rVerified = Boolean(isRuPopulated ? ru.isEmailVerified : r.isEmailVerified);
      return {
        ...r,
        verificationBadge: rBadge,
        isEmailVerified: rVerified
      };
    });

    return {
      ...c,
      verificationBadge,
      isEmailVerified,
      replies
    };
  });
};

// @desc    Get all posts (Public)
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const query = {};
    const isAdminOnly = req.query.adminOnly === 'true';
    if (isAdminOnly) {
      query.authorId = null;
    } else {
      query.isHidden = { $ne: true };
    }
    
    let postQuery = Post.find(query);
    if (isAdminOnly) {
      postQuery = postQuery.select('_id title content image video category customTime authorName isVerified createdAt');
    } else {
      postQuery = postQuery
        .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
        .populate('comments.user', 'name username profilePic isEmailVerified verificationBadge')
        .populate('comments.replies.user', 'name username profilePic isEmailVerified verificationBadge')
        .populate({
          path: 'sharedPostId',
          populate: {
            path: 'authorId',
            select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
          }
        });
    }

    const posts = await postQuery.sort({ createdAt: -1 }).limit(30).lean();
    const mapped = posts.map(post => {
      const authorObj = post.authorId;
      return {
        ...post,
        comments: enrichComments(post.comments || []),
        authorId: authorObj ? (typeof authorObj === 'object' ? authorObj._id.toString() : authorObj.toString()) : null,
        authorDetails: (authorObj && typeof authorObj === 'object') ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .populate('comments.user', 'name username profilePic isEmailVerified verificationBadge')
      .populate('comments.replies.user', 'name username profilePic isEmailVerified verificationBadge')
      .populate({
        path: 'sharedPostId',
        populate: {
          path: 'authorId',
          select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
        }
      });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const postObj = post.toObject();
    const authorObj = postObj.authorId;
    res.json({
      ...postObj,
      comments: enrichComments(postObj.comments || []),
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFormattedCurrentTime = () => {
  const now = new Date();
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${weekday}, ${month} ${day}, ${time}`;
};

// @desc    Create a new post (Admin)
// @route   POST /api/admin/posts
// @access  Private/Admin
exports.createPost = async (req, res) => {
  try {
    const { content, title, image, video, authorName, isVerified, category, customTime, createdAt } = req.body;
    
    if (!content && !image && !video) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    const autoTime = getFormattedCurrentTime();

    const postData = {
      content,
      title: title || null,
      image: image || null,
      video: video || null,
      authorName: authorName || 'Zenivio',
      isVerified: isVerified !== undefined ? isVerified : true,
      category: category || 'Latest',
      customTime: (customTime && customTime.trim()) ? customTime.trim() : autoTime
    };

    if (createdAt) {
      postData.createdAt = new Date(createdAt);
    }

    const post = await Post.create(postData);

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a post (Admin)
// @route   PUT /api/admin/posts/:id
// @access  Private/Admin
exports.updatePost = async (req, res) => {
  try {
    const { content, title, image, video, authorName, isVerified, category, customTime, createdAt } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (content !== undefined) post.content = content;
    if (title !== undefined) post.title = title;
    if (image !== undefined) post.image = image;
    if (video !== undefined) post.video = video;
    if (authorName !== undefined) post.authorName = authorName;
    if (isVerified !== undefined) post.isVerified = isVerified;
    if (category !== undefined) post.category = category;
    if (customTime !== undefined) post.customTime = customTime;
    if (createdAt !== undefined && createdAt) post.createdAt = new Date(createdAt);

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a post (Admin)
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get custom home page feed for authenticated user (Followed posts + Recommended posts)
// @route   GET /api/posts/feed
// @access  Private
exports.getPostsFeed = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const followingSet = new Set((req.user.following || []).map(id => id.toString()));
    const savedPostsSet = new Set(req.user.savedPosts ? req.user.savedPosts.map(id => id.toString()) : []);
    const blockedUserIds = req.user.blockedUsers || [];
    const includeNews = req.query.includeNews === 'true';

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const skip = (page - 1) * limit;

    // Fetch the 15 most recent community posts with populated likers (paginated)
    const feedPostsPromise = Post.find({
      authorId: { $ne: null, $nin: blockedUserIds }, // Exclude admin updates and blocked users
      'reports.user': { $ne: currentUserId }, // Exclude posts reported by the current user
      isHidden: { $ne: true }
    })
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .populate('likes', 'name profilePic googleAvatar facebookAvatar')
      .populate('comments.user', 'name username profilePic isEmailVerified verificationBadge')
      .populate('comments.replies.user', 'name username profilePic isEmailVerified verificationBadge')
      .populate({
        path: 'sharedPostId',
        populate: {
          path: 'authorId',
          select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Optionally fetch news posts in parallel in 1 roundtrip
    const newsPostsPromise = includeNews 
      ? Post.find({ authorId: null })
          .select('_id title content image video category customTime authorName isVerified createdAt')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()
      : Promise.resolve(null);

    const [feedPosts, newsPosts] = await Promise.all([feedPostsPromise, newsPostsPromise]);

    // Map following and own post indicators in-memory
    const postsWithStatus = feedPosts.map(post => {
      const authorObj = post.authorId;
      const authorIdStr = authorObj ? authorObj._id.toString() : null;
      const isFollowing = authorIdStr ? followingSet.has(authorIdStr) : false;
      const isOwnPost = authorIdStr ? authorIdStr === currentUserId.toString() : false;
      const isSaved = savedPostsSet.has(post._id.toString());
      
      const likersList = Array.isArray(post.likes) ? post.likes : [];
      const recentLikers = likersList.slice(-3).map(u => ({
        _id: u._id ? u._id.toString() : u.toString(),
        name: u.name || 'User',
        profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || ''
      }));

      return {
        ...post,
        comments: enrichComments(post.comments || []),
        authorId: authorIdStr,
        authorDetails: authorObj ? {
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null,
        recentLikers,
        isFollowing,
        isOwnPost,
        isSaved
      };
    });

    if (includeNews) {
      return res.json({
        feedPosts: postsWithStatus,
        newsPosts: newsPosts || []
      });
    }

    res.json(postsWithStatus);
  } catch (error) {
    console.error('Error fetching posts feed:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new post by user
// @route   POST /api/posts
// @access  Private
exports.createUserPost = async (req, res) => {
  try {
    const { content, title, privacy, feeling, location, taggedFriends, bgGradient } = req.body;
    let imageUrl = null;
    let imageUrls = [];
    let videoUrl = null;

    const { optimizeUploadedFileToWebp } = require('../utils/imageOptimizer');

    const filesToProcess = [];
    if (req.files && Array.isArray(req.files)) {
      const imagesFiles = req.files.filter(f => f.fieldname === 'images');
      if (imagesFiles.length > 0) {
        filesToProcess.push(...imagesFiles);
      } else {
        filesToProcess.push(...req.files);
      }
    } else if (req.files && typeof req.files === 'object') {
      if (req.files.images && Array.isArray(req.files.images)) {
        filesToProcess.push(...req.files.images);
      } else {
        Object.values(req.files).forEach(fArr => {
          if (Array.isArray(fArr)) filesToProcess.push(...fArr);
        });
      }
    } else if (req.file) {
      filesToProcess.push(req.file);
    }

    for (const f of filesToProcess) {
      if (f.mimetype && f.mimetype.startsWith('video/')) {
        return res.status(400).json({ 
          message: 'The video option is currently unavailable. However, it will be available very soon.' 
        });
      }
      const webpFilename = await optimizeUploadedFileToWebp(f.path, 2048, 2048, 92);
      const url = `/api/image?file=${webpFilename || f.filename}`;
      imageUrls.push(url);
    }

    imageUrls = Array.from(new Set(imageUrls));

    if (imageUrls.length > 0) {
      imageUrl = imageUrls[0];
    }

    if (!content && imageUrls.length === 0 && !videoUrl) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    let parsedFriends = [];
    if (taggedFriends) {
      try {
        parsedFriends = typeof taggedFriends === 'string' ? JSON.parse(taggedFriends) : taggedFriends;
      } catch (e) {
        parsedFriends = typeof taggedFriends === 'string' ? taggedFriends.split(',').map(f => f.trim()) : taggedFriends;
      }
    }

    const post = await Post.create({
      content,
      title: title || null,
      image: imageUrl,
      images: imageUrls,
      video: videoUrl,
      authorId: req.user._id,
      authorName: req.user.name || 'User',
      isVerified: Boolean(req.user.isVerified || (req.user.verificationBadge && req.user.verificationBadge !== 'none')),
      privacy: privacy || 'public',
      feeling: feeling || null,
      location: location || null,
      taggedFriends: parsedFriends,
      bgGradient: bgGradient || null
    });

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge');
    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;

    // Send notifications to followers and @mentioned users
    try {
      const followers = await User.find({ following: req.user._id }, '_id');
      const notifiedUserIds = new Set();
      const authorNameStr = req.user.name || 'A user';
      const snippet = content ? (content.length > 40 ? `${content.substring(0, 40)}...` : content) : 'a new photo';

      // 1. Notify followers
      for (const f of followers) {
        if (f._id.toString() !== req.user._id.toString()) {
          notifiedUserIds.add(f._id.toString());
          createNotification(
            f._id,
            `${authorNameStr} shared a new post 📸`,
            `${authorNameStr} posted: "${snippet}"`,
            'post',
            post._id,
            req.user._id
          ).catch(e => console.error('Follower notification failed:', e));
        }
      }

      // 2. Notify @mentioned users in post content
      const mentionMatches = (content || '').match(/@([a-zA-Z0-9_]+)/g);
      if (mentionMatches) {
        const usernames = [...new Set(mentionMatches.map(m => m.substring(1).toLowerCase()))];
        const mentionedUsers = await User.find({
          username: { $in: usernames },
          _id: { $ne: req.user._id }
        }, '_id');

        for (const mu of mentionedUsers) {
          if (!notifiedUserIds.has(mu._id.toString())) {
            notifiedUserIds.add(mu._id.toString());
            createNotification(
              mu._id,
              'You were mentioned! 💬',
              `${authorNameStr} mentioned you in a post.`,
              'mention',
              post._id,
              req.user._id
            ).catch(e => console.error('Mention notification failed:', e));
          }
        }
      }
    } catch (notifyErr) {
      console.error('Error dispatching post notifications:', notifyErr);
    }
 
    res.status(201).json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    console.error('Error creating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all video posts (reels)
// @route   GET /api/posts/videos
// @access  Public
exports.getVideoPosts = async (req, res) => {
  try {
    let blockedUserIds = [];
    let currentUserId = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          blockedUserIds = user.blockedUsers || [];
          currentUserId = user._id;
        }
      } catch (err) {
        // Ignore token validation issues for compatibility
      }
    }

    const query = { video: { $ne: null } };
    if (blockedUserIds.length > 0) {
      query.authorId = { $nin: blockedUserIds };
    }
    if (currentUserId) {
      query['reports.user'] = { $ne: currentUserId };
    }

    const posts = await Post.find(query)
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .sort({ createdAt: -1 })
      .limit(20)  // Limit to 20 most recent reels
      .lean();
    const mapped = posts.map(post => {
      const authorObj = post.authorId;
      return {
        ...post,
        authorId: authorObj ? authorObj._id.toString() : null,
        authorDetails: authorObj ? {
          _id: authorObj._id.toString(),
          name: authorObj.name,
          profilePic: authorObj.profilePic,
          googleAvatar: authorObj.googleAvatar,
          facebookAvatar: authorObj.facebookAvatar,
          isEmailVerified: authorObj.isEmailVerified,
          verificationBadge: authorObj.verificationBadge || 'none'
        } : null
      };
    });
    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on a post
// @route   POST /api/posts/:id/like
// @access  Private
exports.toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    if (!post.likes) post.likes = [];
    if (!post.reactions) post.reactions = [];

    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    if (isLiked) {
      // Remove like
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
      post.reactions = post.reactions.filter(r => r.user.toString() !== userId.toString());
    } else {
      // Add like
      post.likes.push(userId);
      const existingReaction = post.reactions.find(r => r.user.toString() === userId.toString());
      if (existingReaction) {
        existingReaction.type = 'love';
      } else {
        post.reactions.push({ user: userId, type: 'love' });
      }

      // Trigger notification for post author (if not own post)
      if (post.authorId && post.authorId.toString() !== userId.toString()) {
        try {
          await createNotification(
            post.authorId,
            'New Like! ❤️',
            `${req.user.name || 'A user'} reacted ❤️ to your post: "${post.content ? post.content.substring(0, 30) : 'post'}${post.content && post.content.length > 30 ? '...' : ''}"`,
            'like',
            post._id,
            userId
          );
        } catch (err) {
          console.error('Failed to create like notification:', err);
        }
      }
    }

    await post.save();
    
    res.json({ 
      likesCount: post.likes.length, 
      isLiked: !isLiked 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: req.user._id,
      userName: req.user.name || 'User',
      userAvatar: req.user.profilePic || req.user.googleAvatar || req.user.facebookAvatar || '',
      verificationBadge: req.user.verificationBadge || 'none',
      isEmailVerified: Boolean(req.user.isEmailVerified),
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Trigger notification for post author (if not own post)
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      try {
        await createNotification(
          post.authorId,
          'New Comment! 💬',
          `${req.user.name || 'A user'} commented: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          'comment',
          post._id,
          req.user._id
        );
      } catch (err) {
        console.error('Failed to create comment notification:', err);
      }
    }

    // Check for @mentions in comment text
    const commentMentions = text.match(/@([a-zA-Z0-9_]+)/g);
    if (commentMentions) {
      try {
        const usernames = [...new Set(commentMentions.map(m => m.substring(1).toLowerCase()))];
        const mentionedUsers = await User.find({
          username: { $in: usernames },
          _id: { $ne: req.user._id }
        }, '_id');
        for (const mu of mentionedUsers) {
          if (!post.authorId || post.authorId.toString() !== mu._id.toString()) {
            createNotification(
              mu._id,
              'Mentioned in Comment! 💬',
              `@${req.user.username || req.user.name} mentioned you in a comment.`,
              'mention',
              post._id,
              req.user._id
            ).catch(e => console.error('Comment mention notification failed:', e));
          }
        }
      } catch (mErr) {
        console.error('Mention comment notification error:', mErr);
      }
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to a comment on a post (Facebook style nested reply & mention notification)
// @route   POST /api/posts/:id/comment/:commentId/reply
// @access  Private
exports.replyComment = async (req, res) => {
  try {
    const { text, replyToUser, replyToUserId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    const newReply = {
      user: req.user._id,
      userName: req.user.name || 'User',
      userAvatar: req.user.profilePic || req.user.googleAvatar || req.user.facebookAvatar || '',
      verificationBadge: req.user.verificationBadge || 'none',
      isEmailVerified: Boolean(req.user.isEmailVerified),
      text,
      replyToUser: replyToUser || comment.userName || '',
      createdAt: new Date()
    };

    comment.replies.push(newReply);
    await post.save();

    // Trigger notification for target user (either replyToUserId or comment owner)
    const notifyUserId = replyToUserId || (comment.user ? comment.user.toString() : null);
    if (notifyUserId && notifyUserId.toString() !== req.user._id.toString()) {
      try {
        await createNotification(
          notifyUserId,
          'New Comment Reply! 💬',
          `${req.user.name || 'A user'} replied to your comment: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
          'comment',
          post._id,
          req.user._id
        );
      } catch (err) {
        console.error('Failed to create reply notification:', err);
      }
    }

    // Check for @mentions in reply text
    const replyMentions = text.match(/@([a-zA-Z0-9_]+)/g);
    if (replyMentions) {
      try {
        const usernames = [...new Set(replyMentions.map(m => m.substring(1).toLowerCase()))];
        const mentionedUsers = await User.find({
          username: { $in: usernames },
          _id: { $ne: req.user._id }
        }, '_id');
        for (const mu of mentionedUsers) {
          if (!notifyUserId || notifyUserId.toString() !== mu._id.toString()) {
            createNotification(
              mu._id,
              'Mentioned in Reply! 💬',
              `@${req.user.username || req.user.name} mentioned you in a comment reply.`,
              'mention',
              post._id,
              req.user._id
            ).catch(e => console.error('Reply mention notification failed:', e));
          }
        }
      } catch (mErr) {
        console.error('Mention reply notification error:', mErr);
      }
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle reaction on a post (like, love, haha, wow, sad, angry)
// @route   POST /api/posts/:id/react
// @access  Private
exports.toggleReactionPost = async (req, res) => {
  try {
    const { type = 'love' } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;

    if (!post.reactions) post.reactions = [];
    if (!post.likes) post.likes = [];

    const existingIndex = post.reactions.findIndex(r => r.user.toString() === userId.toString());
    const isLiked = post.likes.some(id => id.toString() === userId.toString());

    let activeReaction = type;

    if (existingIndex > -1) {
      if (post.reactions[existingIndex].type === type) {
        // Remove reaction if same reaction clicked
        post.reactions.splice(existingIndex, 1);
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        activeReaction = null;
      } else {
        // Change reaction type
        post.reactions[existingIndex].type = type;
      }
    } else {
      // Add reaction
      post.reactions.push({ user: userId, type });
      if (!isLiked) post.likes.push(userId);

      // Trigger notification for post author
      if (post.authorId && post.authorId.toString() !== userId.toString()) {
        const emojiMap = { like: '👍', love: '❤️', haha: '😆', wow: '😮', sad: '😢', angry: '😡' };
        const emoji = emojiMap[type] || '❤️';
        try {
          await createNotification(
            post.authorId,
            `New Reaction! ${emoji}`,
            `${req.user.name || 'A user'} reacted ${emoji} to your post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
            'post',
            post._id
          );
        } catch (err) {
          console.error('Failed to create reaction notification:', err);
        }
      }
    }

    await post.save();

    res.json({
      likesCount: post.likes.length,
      userReaction: activeReaction,
      isLiked: activeReaction !== null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reactions/likes list for a post (Who reacted)
// @route   GET /api/posts/:id/reactions
// @access  Public
exports.getPostReactions = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('likes', 'name username profilePic googleAvatar facebookAvatar verificationBadge isEmailVerified')
      .populate('reactions.user', 'name username profilePic googleAvatar facebookAvatar verificationBadge isEmailVerified');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const emojiMap = {
      like: '👍',
      love: '❤️',
      haha: '😆',
      wow: '😮',
      sad: '😢',
      angry: '😡'
    };

    let reactionsList = [];

    if (post.reactions && post.reactions.length > 0) {
      reactionsList = post.reactions.map(r => {
        const u = r.user;
        if (!u) return null;
        const badge = (u.verificationBadge && u.verificationBadge !== 'none') ? u.verificationBadge : 'none';
        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
          verificationBadge: badge,
          isEmailVerified: !!u.isEmailVerified,
          reactionType: r.type || 'love',
          emoji: emojiMap[r.type] || '❤️'
        };
      }).filter(Boolean);
    } else {
      reactionsList = (post.likes || []).map(u => {
        if (!u) return null;
        const badge = (u.verificationBadge && u.verificationBadge !== 'none') ? u.verificationBadge : 'none';
        return {
          _id: u._id,
          name: u.name,
          username: u.username,
          profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
          verificationBadge: badge,
          isEmailVerified: !!u.isEmailVerified,
          reactionType: 'love',
          emoji: '❤️'
        };
      }).filter(Boolean);
    }

    res.json(reactionsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle save post
// @route   POST /api/posts/:id/save
// @access  Private
exports.toggleSavePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    const isSaved = user.savedPosts.includes(post._id);
    if (isSaved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== post._id.toString());
    } else {
      user.savedPosts.push(post._id);
    }

    await user.save();
    res.json({ isSaved: !isSaved });
  } catch (error) {
    res.status(550).json({ message: error.message });
  }
};

// @desc    Get saved posts for authenticated user
// @route   GET /api/posts/saved
// @access  Private
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'authorId',
        select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Map populated saved posts
    const savedPosts = (user.savedPosts || [])
      .filter(post => post !== null)
      .map(post => {
        const postObj = post.toObject();
        const authorObj = postObj.authorId;
        
        return {
          ...postObj,
          authorId: authorObj ? authorObj._id.toString() : null,
          authorDetails: authorObj ? {
            name: authorObj.name,
            profilePic: authorObj.profilePic,
            googleAvatar: authorObj.googleAvatar,
            facebookAvatar: authorObj.facebookAvatar,
            isEmailVerified: authorObj.isEmailVerified,
            verificationBadge: authorObj.verificationBadge || 'none'
          } : null,
          isSaved: true
        };
      });

    res.json(savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:id — Delete a post (User-facing)
exports.deleteUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if current user is the author
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a post by user
// @route   PUT /api/posts/:id
// @access  Private
exports.updateUserPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if current user is the author
    if (post.authorId && post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to edit this post' });
    }

    const { content, title, privacy, feeling, location, taggedFriends, bgGradient } = req.body;

    let imageUrl = post.image;
    let imageUrls = post.images && post.images.length > 0 ? [...post.images] : (post.image ? [post.image] : []);
    let videoUrl = post.video;

    const filesToProcess = [];
    if (req.files && Array.isArray(req.files)) {
      const imagesFiles = req.files.filter(f => f.fieldname === 'images');
      if (imagesFiles.length > 0) {
        filesToProcess.push(...imagesFiles);
      } else {
        filesToProcess.push(...req.files);
      }
    } else if (req.files && typeof req.files === 'object') {
      if (req.files.images && Array.isArray(req.files.images)) {
        filesToProcess.push(...req.files.images);
      } else {
        Object.values(req.files).forEach(fArr => {
          if (Array.isArray(fArr)) filesToProcess.push(...fArr);
        });
      }
    } else if (req.file) {
      filesToProcess.push(req.file);
    }

    if (filesToProcess.length > 0) {
      const { optimizeUploadedFileToWebp } = require('../utils/imageOptimizer');
      const newUrls = [];
      for (const f of filesToProcess) {
        if (f.mimetype && f.mimetype.startsWith('video/')) {
          videoUrl = `/api/image?file=${f.filename}`;
        } else {
          const webpFilename = await optimizeUploadedFileToWebp(f.path, 2048, 2048, 92);
          newUrls.push(`/api/image?file=${webpFilename || f.filename}`);
        }
      }
      if (newUrls.length > 0) {
        imageUrls = Array.from(new Set(newUrls));
        imageUrl = imageUrls[0];
        videoUrl = null;
      }
    }

    // Also support clearing media
    if (req.body.clearImage === 'true') {
      imageUrl = null;
      imageUrls = [];
    }
    if (req.body.clearVideo === 'true') {
      videoUrl = null;
    }

    if (!content && imageUrls.length === 0 && !videoUrl) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    let parsedFriends = post.taggedFriends;
    if (taggedFriends) {
      try {
        parsedFriends = typeof taggedFriends === 'string' ? JSON.parse(taggedFriends) : taggedFriends;
      } catch (e) {
        parsedFriends = typeof taggedFriends === 'string' ? taggedFriends.split(',').map(f => f.trim()) : taggedFriends;
      }
    }

    post.content = content;
    post.title = title || null;
    post.image = imageUrl;
    post.images = imageUrls;
    post.video = videoUrl;
    post.privacy = privacy || 'public';
    post.feeling = feeling || null;
    post.location = location || null;
    post.taggedFriends = parsedFriends;
    post.bgGradient = bgGradient || null;

    await post.save();

    const populatedPost = await Post.findById(post._id).populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge');
    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;

    res.json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    console.error('Error updating user post:', error);
    res.status(500).json({ message: error.message });
  }
};

// POST /api/posts/:id/report — Report a post (UGC Content Moderation)
exports.reportPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { reason } = req.body;
    const userId = req.user._id;

    // Check if already reported
    const alreadyReported = post.reports && post.reports.some(r => r.user.toString() === userId.toString());
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this post.' });
    }

    if (!post.reports) post.reports = [];
    post.reports.push({
      user: userId,
      reason: reason || 'Inappropriate Content'
    });

    await post.save();

    // Log the report in the Admin Notifications list
    const AdminNotification = require('../models/AdminNotification');
    await AdminNotification.create({
      title: 'Post Reported ⚠️',
      message: `Post by ${post.authorName} was reported by user ID ${userId}. Reason: ${reason || 'Inappropriate content'}`,
      type: 'support',
      referenceId: post._id.toString()
    });

    res.json({ message: 'Post reported successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/posts/:postId/comment/:commentId — Delete a comment (User-facing)
exports.deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId.toString());
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];

    // Check authorization: must be comment owner or post owner
    const isCommentAuthor = comment.user && comment.user.toString() === req.user._id.toString();
    const isPostAuthor = post.authorId && post.authorId.toString() === req.user._id.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Admin Post Management ──────────────────────────────────────────────────

// @desc    Get paginated posts for admin management with search & filter
// @route   GET /api/admin/posts/admin-manage
// @access  Private/Admin
exports.getAdminPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const filter = req.query.filter || 'all'; // 'all', 'user_only', 'official', 'hidden', 'visible', 'reported'

    const query = {};

    if (filter === 'user_only') {
      query.authorId = { $ne: null };
    } else if (filter === 'official') {
      query.authorId = null;
    } else if (filter === 'hidden') {
      query.isHidden = true;
    } else if (filter === 'visible') {
      query.isHidden = { $ne: true };
    } else if (filter === 'reported') {
      query['reports.0'] = { $exists: true };
    }

    if (search) {
      // Find matching users by name or email/phone
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phoneOrEmail: { $regex: search, $options: 'i' } },
        ]
      }).select('_id');
      const matchingUserIds = matchingUsers.map(u => u._id);

      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { authorName: { $regex: search, $options: 'i' } },
        { authorId: { $in: matchingUserIds } }
      ];
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .populate('authorId', 'name phoneOrEmail profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalPosts / limit) || 1;

    res.json({
      success: true,
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('getAdminPosts error:', error);
    res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
  }
};

// @desc    Toggle hide / unhide a post (Admin)
// @route   PUT /api/admin/posts/:id/toggle-hide
// @access  Private/Admin
exports.toggleHidePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isHidden = !post.isHidden;
    if (req.body.reason) {
      post.hiddenReason = req.body.reason;
    }
    await post.save();

    res.json({
      success: true,
      message: post.isHidden ? 'Post is now hidden from the community feed.' : 'Post has been unhidden and restored to the feed.',
      post
    });
  } catch (error) {
    console.error('toggleHidePost error:', error);
    res.status(500).json({ message: 'Failed to toggle post visibility', error: error.message });
  }
};

// @desc    Send warning notification to post owner (Admin)
// @route   POST /api/admin/posts/:id/warn
// @access  Private/Admin
exports.sendPostWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { warningMessage, reason } = req.body;
    if (!warningMessage || !warningMessage.trim()) {
      return res.status(400).json({ message: 'Warning message is required' });
    }

    const post = await Post.findById(id).populate('authorId', 'name phoneOrEmail');
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.authorId) {
      return res.status(400).json({ message: 'This is an official system post without an author user.' });
    }

    const recipientUserId = post.authorId._id || post.authorId;
    const notifTitle = reason ? `Community Guidelines Warning: ${reason}` : 'Content Warning from Admin ⚠️';
    const finalMsg = warningMessage.trim();

    await createNotification(
      recipientUserId,
      notifTitle,
      finalMsg,
      'system',
      post._id
    );

    res.json({
      success: true,
      message: `Warning notification successfully sent to ${post.authorId.name || 'user'}.`,
    });
  } catch (error) {
    console.error('sendPostWarning error:', error);
    res.status(500).json({ message: 'Failed to send warning', error: error.message });
  }
};

// @desc    Share a post to user's feed/timeline (Repost)
// @route   POST /api/posts/:id/share-to-feed
// @access  Private
exports.sharePostToFeed = async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const { caption } = req.body;
    // If the post being shared is itself already a shared post, link to the root original post
    const targetPostId = originalPost.sharedPostId || originalPost._id;

    const newPost = await Post.create({
      content: caption || '',
      sharedPostId: targetPostId,
      authorId: req.user._id,
      authorName: req.user.name || 'User',
      isVerified: Boolean(req.user.isVerified || (req.user.verificationBadge && req.user.verificationBadge !== 'none')),
      postType: 'standard'
    });

    // Increment shareCount on the target post and the post being directly shared
    await Post.findByIdAndUpdate(targetPostId, { $inc: { shareCount: 1 } });
    if (originalPost._id.toString() !== targetPostId.toString()) {
      await Post.findByIdAndUpdate(originalPost._id, { $inc: { shareCount: 1 } });
    }

    // Populate post with author and shared post details
    const populatedPost = await Post.findById(newPost._id)
      .populate('authorId', 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge')
      .populate({
        path: 'sharedPostId',
        populate: {
          path: 'authorId',
          select: 'name profilePic googleAvatar facebookAvatar isEmailVerified verificationBadge'
        }
      });

    // Notify original post author if different user
    if (originalPost.authorId && originalPost.authorId.toString() !== req.user._id.toString()) {
      try {
        const authorNameStr = req.user.name || 'A user';
        createNotification(
          originalPost.authorId,
          `${authorNameStr} shared your post! 🔁`,
          `${authorNameStr} shared your post to their timeline.`,
          'share',
          newPost._id,
          req.user._id
        ).catch(e => console.error('Share notification error:', e));
      } catch (notifyErr) {
        console.error('Error dispatching share notification:', notifyErr);
      }
    }

    const postObj = populatedPost.toObject();
    const authorObj = postObj.authorId;
    res.status(201).json({
      ...postObj,
      authorId: authorObj ? authorObj._id.toString() : null,
      authorDetails: authorObj ? {
        name: authorObj.name,
        profilePic: authorObj.profilePic,
        googleAvatar: authorObj.googleAvatar,
        facebookAvatar: authorObj.facebookAvatar,
        isEmailVerified: authorObj.isEmailVerified,
        verificationBadge: authorObj.verificationBadge || 'none'
      } : null
    });
  } catch (error) {
    console.error('Error sharing post to feed:', error);
    res.status(500).json({ message: error.message });
  }
};


