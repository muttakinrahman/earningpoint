const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', postController.getPosts);

// @route   GET /api/posts/videos
// @desc    Get all video posts (reels)
// @access  Public
router.get('/videos', postController.getVideoPosts);

// @route   GET /api/posts/feed
// @desc    Get follow-aware homepage feed
// @access  Private
router.get('/feed', protect, postController.getPostsFeed);

// @route   GET /api/posts/saved
// @desc    Get saved posts for authenticated user
// @access  Private
router.get('/saved', protect, postController.getSavedPosts);

router.get('/:id', postController.getPostById);

// @route   POST /api/posts
// @desc    Create a user post (with optional image(s) or video)
// @access  Private
router.post('/', protect, upload.any(), postController.createUserPost);

// @route   POST /api/posts/:id/like
// @desc    Toggle like on a post
// @access  Private
router.post('/:id/like', protect, postController.toggleLikePost);

// @route   POST /api/posts/:id/react
// @desc    Toggle reaction on a post
// @access  Private
router.post('/:id/react', protect, postController.toggleReactionPost);

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', protect, postController.commentPost);

// @route   POST /api/posts/:id/comment/:commentId/reply
// @desc    Reply to a comment on a post
// @access  Private
router.post('/:id/comment/:commentId/reply', protect, postController.replyComment);

// @route   GET /api/posts/:id/reactions
// @desc    Get reactions list for a post
// @access  Public
router.get('/:id/reactions', postController.getPostReactions);

// @route   POST /api/posts/:id/save
// @desc    Toggle save post
// @access  Private
router.post('/:id/save', protect, postController.toggleSavePost);

// @route   POST /api/posts/:id/share-to-feed
// @desc    Share a post to user's feed/timeline (Repost)
// @access  Private
router.post('/:id/share-to-feed', protect, postController.sharePostToFeed);

// @route   DELETE /api/posts/:id
// @desc    Delete a post by user
// @access  Private
router.delete('/:id', protect, postController.deleteUserPost);

// @route   PUT /api/posts/:id
// @desc    Update a post by user
// @access  Private
router.put('/:id', protect, upload.any(), postController.updateUserPost);

// @route   POST /api/posts/:id/report
// @desc    Report a post (UGC)
// @access  Private
router.post('/:id/report', protect, postController.reportPost);

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment on a post
// @access  Private
router.delete('/:postId/comment/:commentId', protect, postController.deleteComment);

module.exports = router;
