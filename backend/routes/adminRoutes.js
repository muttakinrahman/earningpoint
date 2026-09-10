const express = require('express');
const router = express.Router();
const { adminProtect, requireSuperAdmin, requirePermission } = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const postController = require('../controllers/postController');

// ─── Authentication & Profile ────────────────────────────────────────────────
router.post('/login', adminController.adminLogin);
router.get('/profile', adminProtect, adminController.getAdminProfile);
router.post('/change-password', adminProtect, adminController.changeAdminPassword);

// ─── Sub-Admin Management (Super Admin only) ──────────────────────────────────
router.get('/sub-admins', adminProtect, requireSuperAdmin, adminController.getSubAdmins);
router.post('/sub-admins', adminProtect, requireSuperAdmin, adminController.createSubAdmin);
router.put('/sub-admins/:id', adminProtect, requireSuperAdmin, adminController.updateSubAdmin);
router.delete('/sub-admins/:id', adminProtect, requireSuperAdmin, adminController.deleteSubAdmin);

// Dashboard
router.get('/stats', adminProtect, requirePermission('dashboard'), adminController.getDashboardStats);

// Users & Activity
router.get('/activity', adminProtect, adminController.getActivityReports);
router.get('/activity/user/:id', adminProtect, adminController.getUserActivityDetail);
router.get('/users', adminProtect, requirePermission('users'), adminController.getUsers);
router.get('/users/:id', adminProtect, requirePermission('users'), adminController.getUser);
router.put('/users/:id', adminProtect, requirePermission('users'), adminController.updateUser);
router.delete('/users/:id', adminProtect, requirePermission('users'), adminController.deleteUser);

// Transactions
router.get('/transactions', adminProtect, requirePermission('transactions'), adminController.getTransactions);
router.get('/withdrawals', adminProtect, requirePermission('transactions'), adminController.getAllWithdrawals);
router.put('/transactions/:id', adminProtect, requirePermission('transactions'), adminController.updateTransaction);

// Support
router.get('/support', adminProtect, requirePermission('support'), adminController.getSupportTickets);
router.get('/support/:id', adminProtect, requirePermission('support'), adminController.getSupportTicket);
router.put('/support/:id', adminProtect, requirePermission('support'), adminController.replyToTicket);

// Live Chat Sessions
router.get('/chat-sessions', adminProtect, requirePermission('support'), adminController.getChatSessions);
router.get('/chat-sessions/:id', adminProtect, requirePermission('support'), adminController.getChatSession);

// Referrals
router.get('/referrals', adminProtect, requirePermission('referrals'), adminController.getReferrals);

// Premium Orders
router.get('/premium-orders', adminProtect, requirePermission('users'), adminController.getPremiumOrders);
router.put('/premium-orders/:id', adminProtect, requirePermission('users'), adminController.updatePremiumOrder);

// Verifications (email status only)
router.get('/verifications', adminProtect, requirePermission('verifications'), adminController.getVerifications);
router.get('/verifications/:id', adminProtect, requirePermission('verifications'), adminController.getVerificationById);
router.put('/verifications/:id', adminProtect, requirePermission('verifications'), adminController.updateVerificationStatus);

// Posts Management
router.get('/posts', adminProtect, requirePermission('posts'), postController.getPosts);
router.get('/posts/manage', adminProtect, requirePermission('posts'), postController.getAdminPosts);
router.put('/posts/:id/toggle-hide', adminProtect, requirePermission('posts'), postController.toggleHidePost);
router.post('/posts/:id/warn', adminProtect, requirePermission('posts'), postController.sendPostWarning);
router.post('/posts', adminProtect, requirePermission('posts'), postController.createPost);
router.put('/posts/:id', adminProtect, requirePermission('posts'), postController.updatePost);
router.delete('/posts/:id', adminProtect, requirePermission('posts'), postController.deletePost);

// Articles Management
router.get('/articles', adminProtect, requirePermission('articles'), adminController.getArticles);
router.post('/articles', adminProtect, requirePermission('articles'), adminController.createArticle);
router.put('/articles/:id', adminProtect, requirePermission('articles'), adminController.updateArticle);
router.delete('/articles/:id', adminProtect, requirePermission('articles'), adminController.deleteArticle);

// Global App Settings
router.get('/settings/global', adminProtect, requirePermission('settings'), adminController.getGlobalSettings);
router.put('/settings/global', adminProtect, requirePermission('settings'), adminController.updateGlobalSettings);

// Weekly Missions Management
router.get('/weekly-missions', adminProtect, requirePermission('missions'), adminController.getWeeklyMissions);
router.post('/weekly-missions', adminProtect, requirePermission('missions'), adminController.createWeeklyMission);
router.put('/weekly-missions/:id', adminProtect, requirePermission('missions'), adminController.updateWeeklyMission);
router.delete('/weekly-missions/:id', adminProtect, requirePermission('missions'), adminController.deleteWeeklyMission);

// Announcements Management
router.post('/announcements', adminProtect, requirePermission('announcements'), adminController.sendAnnouncement);

// Notifications Management (all authenticated admins can view notifications)
router.get('/notifications', adminProtect, adminController.getAdminNotifications);
router.put('/notifications/:id/read', adminProtect, adminController.markAdminNotificationRead);
router.put('/notifications/read-all', adminProtect, adminController.markAllAdminNotificationsRead);
router.delete('/notifications/:id', adminProtect, adminController.deleteAdminNotification);

const upload = require('../middleware/uploadMiddleware');

// Products Management
const uploadMiddleware = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return upload.single('imageFile')(req, res, (err) => {
      if (err) {
        console.error('Multer Error:', err);
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  }
  next();
};

router.get('/products', adminProtect, requirePermission('products'), adminController.getProducts);
router.post('/products', adminProtect, requirePermission('products'), uploadMiddleware, adminController.createProduct);
router.put('/products/:id', adminProtect, requirePermission('products'), uploadMiddleware, adminController.updateProduct);
router.delete('/products/:id', adminProtect, requirePermission('products'), adminController.deleteProduct);

// Database Backup & Migration Management
router.get('/database/stats', adminProtect, requirePermission('database'), adminController.getDatabaseStats);
router.get('/database/export', adminProtect, requirePermission('database'), adminController.exportDatabase);
router.post('/database/import', adminProtect, requirePermission('database'), adminController.importDatabase);
router.post('/database/sync-media', adminProtect, requirePermission('database'), adminController.syncMediaFromServer);
router.post('/database/clear', adminProtect, requirePermission('database'), adminController.clearDatabase);

module.exports = router;
