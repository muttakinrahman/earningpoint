const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const Article = require('../models/Article');
const Transaction = require('../models/Transaction');
const Referral = require('../models/Referral');
const SupportTicket = require('../models/SupportTicket');
const Verification = require('../models/Verification');
const PremiumOrder = require('../models/PremiumOrder');
const GlobalSetting = require('../models/GlobalSetting');
const CartProduct = require('../models/CartProduct');
const ChatSession = require('../models/ChatSession');
const WeeklyMission = require('../models/WeeklyMission');
const Notification = require('../models/Notification');
const AdminNotification = require('../models/AdminNotification');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { createNotification } = require('./notificationController');
const { activateReferralBonus } = require('./referralController');

const Admin = require('../models/Admin');
const { sendAdminInvitationEmail } = require('../utils/emailService');

// ─── Admin Login ──────────────────────────────────────────────────────────────
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'khalidhumayun25@gmail.com').toLowerCase().trim();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

    // Auto-seed Super Admin if no super admin exists in DB
    let superAdmin = await Admin.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        name: 'Khalid Humayun',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'super_admin',
        permissions: [
          'dashboard', 'users', 'transactions', 'support', 'referrals',
          'posts', 'articles', 'missions', 'products', 'announcements',
          'verifications', 'badges', 'database', 'settings', 'admins'
        ],
        isActive: true,
      });
      console.log('Default Super Admin seeded:', ADMIN_EMAIL);
    }

    // Find admin by email
    let admin = await Admin.findOne({ email: cleanEmail });

    if (admin) {
      if (!admin.isActive) {
        return res.status(403).json({ message: 'Your admin account has been deactivated. Please contact Super Admin.' });
      }

      let isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        // Check if master env password matches for super admin fallback
        if (admin.role === 'super_admin' && cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          admin.password = password;
          await admin.save();
          isMatch = true;
        } else {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwt.sign(
        {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions || [],
        },
      });
    }

    // Fallback if matching env admin directly
    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const newSuper = await Admin.create({
        name: 'Super Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'super_admin',
        permissions: [
          'dashboard', 'users', 'transactions', 'support', 'referrals',
          'posts', 'articles', 'missions', 'products', 'announcements',
          'verifications', 'badges', 'database', 'settings', 'admins'
        ],
        isActive: true,
      });

      const token = jwt.sign(
        {
          id: newSuper._id,
          name: newSuper.name,
          email: newSuper.email,
          role: newSuper.role,
          permissions: newSuper.permissions,
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        admin: {
          id: newSuper._id,
          name: newSuper.name,
          email: newSuper.email,
          role: newSuper.role,
          permissions: newSuper.permissions,
        },
      });
    }

    return res.status(401).json({ message: 'Invalid admin credentials' });
  } catch (error) {
    console.error('adminLogin error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalanceAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]);
    const totalTransactions = await Transaction.countDocuments();
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } });
    const totalReferrals = await Referral.countDocuments();
    const pendingPremiumOrders = await PremiumOrder.countDocuments({ status: 'pending' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const premiumUsers = await User.countDocuments({ isPremium: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUsers = await User.countDocuments({ createdAt: { $gte: today } });

    const revenueAgg = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Last 7 days chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const users = await User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } });
      const txns = await Transaction.countDocuments({ createdAt: { $gte: date, $lt: nextDate } });
      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users,
        transactions: txns,
      });
    }

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name phoneOrEmail balance coins isBanned isPremium createdAt');

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name phoneOrEmail');

    res.json({
      totalUsers,
      totalBalance: totalBalanceAgg[0]?.total || 0,
      totalTransactions,
      pendingWithdrawals,
      openTickets,
      totalReferrals,
      pendingPremiumOrders,
      bannedUsers,
      premiumUsers,
      todayUsers,
      revenue: revenueAgg[0]?.total || 0,
      last7Days,
      recentUsers,
      recentTransactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 15, filter } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phoneOrEmail: { $regex: search, $options: 'i' } },
        { referralCode: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'banned') query.isBanned = true;
    if (filter === 'premium') query.isPremium = true;
    if (filter === 'verified') {
      query.$or = [
        { isEmailVerified: true },
        { verificationBadge: { $in: ['blue', 'purple', 'golden'] } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const transactions = await Transaction.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(10);
    const referrals = await Referral.find({ referrerId: req.params.id })
      .populate('referredUserId', 'name phoneOrEmail')
      .limit(10);
    const verification = await Verification.findOne({ userId: req.params.id });
    const premiumOrders = await PremiumOrder.find({ userId: req.params.id }).sort({ createdAt: -1 }).limit(5);

    res.json({ user, transactions, referrals, verification, premiumOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { balance, coins, points, isBanned, isPremium, premiumExpiry, name, note, verificationBadge } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const oldBalance = user.balance;
    const oldBadge = user.verificationBadge;
    if (balance !== undefined) user.balance = Number(balance);
    if (points !== undefined) user.points = Number(points);
    if (coins !== undefined) user.points = Number(coins);
    if (isBanned !== undefined) user.isBanned = isBanned;
    if (isPremium !== undefined) user.isPremium = isPremium;
    if (premiumExpiry !== undefined) user.premiumExpiry = premiumExpiry;
    if (name !== undefined) user.name = name;
    if (verificationBadge !== undefined) {
      user.verificationBadge = verificationBadge;
      if (verificationBadge === 'blue' || verificationBadge === 'purple' || verificationBadge === 'golden') {
        user.isEmailVerified = true;
      } else if (verificationBadge === 'none') {
        user.isEmailVerified = false;
      }
    }

    await user.save();

    if (verificationBadge !== undefined && verificationBadge !== oldBadge) {
      let title = '';
      let msg = '';
      if (verificationBadge === 'blue' || verificationBadge === 'purple') {
        title = 'Purple Verified Badge';
        msg = 'Congratulations! Your account has been verified with the official Zenivio Purple Badge.';
      } else if (verificationBadge === 'golden') {
        title = 'Golden Verified Badge';
        msg = 'Congratulations! Your account has been awarded the official Zenivio Golden verification badge.';
      } else if (verificationBadge === 'none') {
        title = 'Verification Status Updated';
        msg = 'Your verification badge has been removed by the administrator.';
      }
      createNotification(user._id, title, msg, 'badge');
    }

    if (balance !== undefined && Number(balance) !== oldBalance) {
      const diff = Number(balance) - oldBalance;
      await Transaction.create({
        userId: user._id,
        type: 'earning',
        amount: Math.abs(diff),
        description: note || `Admin balance adjustment (${diff > 0 ? '+' : ''}${diff}৳)`,
        status: 'completed',
      });

      // Notify user about balance adjustment
      createNotification(
        user._id,
        `Balance Updated! 💰`,
        `Your account balance has been updated to ${balance}৳.`,
        'system'
      );
    }

    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Transactions ─────────────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const { type, status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { type: 'withdrawal' };
    
    const total = await Transaction.countDocuments(query);
    const withdrawals = await Transaction.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    
    const formatted = withdrawals.map(w => ({
      id: w._id,
      userId: w.userId._id,
      name: w.userId?.name || 'User',
      phone: w.description?.replace(/Withdrawal via .* to /, '') || '',
      amount: w.amount,
      method: w.description?.replace(/Withdrawal via /, '').replace(/ to .*/, '') || 'Unknown',
      date: w.createdAt.toISOString().split('T')[0],
      status: w.status
    }));
    
    res.json({ withdrawals: formatted, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('userId', 'name phoneOrEmail');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const oldStatus = transaction.status;
    transaction.status = status;
    await transaction.save();

    // If withdrawal approved and wasn't already, deduct balance
    if (transaction.type === 'withdrawal' && status === 'completed' && oldStatus === 'pending') {
      await User.findByIdAndUpdate(transaction.userId._id, { $inc: { balance: -transaction.amount } });
    }

    // Notify user about transaction status update
    createNotification(
      transaction.userId._id, 
      `Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}! 💸`, 
      `Your ${transaction.type} request of ${transaction.amount}৳ has been ${status}.`,
      transaction.type === 'withdrawal' ? 'withdrawal' : 'system'
    );

    res.json({ message: 'Transaction updated', transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Support Tickets ──────────────────────────────────────────────────────────
exports.getSupportTickets = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await SupportTicket.countDocuments(query);
    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('userId', 'name phoneOrEmail');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyToTicket = async (req, res) => {
  try {
    const { message, status } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (message && message.trim()) {
      ticket.replies.push({ message: message.trim(), isAdmin: true });
    }
    if (status) ticket.status = status;

    await ticket.save();
    await ticket.populate('userId', 'name phoneOrEmail');

    res.json({ message: 'Ticket updated', ticket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Referrals ────────────────────────────────────────────────────────────────
exports.getReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const total = await Referral.countDocuments();
    const referrals = await Referral.find()
      .populate('referrerId', 'name phoneOrEmail')
      .populate('referredUserId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const totalBonus = await Referral.aggregate([{ $group: { _id: null, total: { $sum: '$bonusAwarded' } } }]);

    res.json({ referrals, total, totalBonus: totalBonus[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Premium Orders ───────────────────────────────────────────────────────────
exports.getPremiumOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await PremiumOrder.countDocuments(query);
    const orders = await PremiumOrder.find(query)
      .populate('userId', 'name phoneOrEmail isPremium premiumExpiry')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePremiumOrder = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const order = await PremiumOrder.findById(req.params.id).populate('userId');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    if (adminNote !== undefined) order.adminNote = adminNote;
    await order.save();

    if (status === 'approved') {
      const settings = await GlobalSetting.findOne({ configKey: 'main_config' });
      const pkg = settings?.premiumIpPackages?.find(p => p.id === order.packageId);
      
      // Calculate days: Extract number from duration string (e.g. "1 Month" or "30 Days")
      let days = 30;
      if (pkg) {
        const durationMatch = pkg.duration.match(/(\d+)/);
        if (durationMatch) {
          const val = parseInt(durationMatch[1]);
          if (pkg.duration.toLowerCase().includes('month')) {
            days = val * 30;
          } else if (pkg.duration.toLowerCase().includes('year')) {
            days = val * 365;
          } else {
            days = val;
          }
        }
        
        // Add extra/free days if present
        if (pkg.freeDays) {
          const freeMatch = pkg.freeDays.match(/(\d+)/);
          if (freeMatch) {
            const freeVal = parseInt(freeMatch[1]);
            if (pkg.freeDays.toLowerCase().includes('month')) {
              days += freeVal * 30;
            } else {
              days += freeVal;
            }
          }
        }
      } else {
        // Fallback to old hardcoded map if package not found in settings
        const packageDays = { 'month-1': 37, 'month-3': 105, 'month-6': 210, 'year-1': 424 };
        days = packageDays[order.packageId] || 30;
      }
      
      let currentExpiry = order.userId.premiumExpiry ? new Date(order.userId.premiumExpiry) : new Date();
      if (currentExpiry < new Date()) {
        currentExpiry = new Date();
      }
      
      const premiumExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      
      await User.findByIdAndUpdate(order.userId._id, { 
        isPremium: true, 
        premiumExpiry,
        premiumCountry: order.country || '',
        premiumPackageName: order.packageName || ''
      });

      // Activate referral bonus for the user who purchased VPN (if they were referred)
      activateReferralBonus(order.userId._id);

      // Notify user about approval
      createNotification(
        order.userId._id, 
        'Premium Account Activated! ✨', 
        `Your order for ${order.packageName} has been approved! Your subscription is now active until ${premiumExpiry.toLocaleDateString()}. Added total of ${days} days to your account.`,
        'premium'
      );
    } else if (status === 'rejected') {
      // Notify user about rejection
      createNotification(
        order.userId._id, 
        'Order Rejected ❌', 
        `Your premium order for ${order.packageName} was rejected. Please contact support for details.`,
        'premium'
      );
    }

    const updated = await PremiumOrder.findById(req.params.id).populate('userId', 'name phoneOrEmail isPremium premiumExpiry');
    res.json({ message: 'Order updated', order: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Verifications (Email status only) ───────────────────────────────────────
exports.getVerifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await Verification.countDocuments(query);
    const verifications = await Verification.find(query)
      .select('-frontImage -backImage -selfieImage')
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ verifications, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVerificationById = async (req, res) => {
  try {
    const verification = await Verification.findById(req.params.id)
      .populate('userId', 'name phoneOrEmail');
    if (!verification) {
      return res.status(404).json({ message: 'Verification request not found' });
    }
    res.json(verification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVerificationStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const verification = await Verification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ message: 'Verification request not found' });
    }

    verification.status = status;
    if (reviewNote !== undefined) verification.reviewNote = reviewNote;
    await verification.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(verification.userId, { isEmailVerified: true, verificationBadge: 'purple' });
      createNotification(
        verification.userId,
        'Purple Verified Badge',
        'Congratulations! Your account has been verified with the official Zenivio Purple Badge.',
        'badge'
      );
    } else if (status === 'rejected') {
      await User.findByIdAndUpdate(verification.userId, { isEmailVerified: false, verificationBadge: 'none' });
      createNotification(
        verification.userId,
        'Verification Rejected ❌',
        `Your verification request was rejected. Reason: ${reviewNote || 'Documents were unclear'}`,
        'system'
      );
    }

    res.json({ message: `Verification status updated to ${status}`, verification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Live Support (ChatSessions) ─────────────────────────────────────────────
exports.getChatSessions = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;

    const total = await ChatSession.countDocuments(query);
    const sessions = await ChatSession.find(query)
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ 
      sessions, 
      total, 
      page: Number(page), 
      pages: Math.ceil(total / Number(limit)) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id)
      .populate('userId', 'name phoneOrEmail');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Global Settings ─────────────────────────────────────────────────────────
exports.getGlobalSettings = async (req, res) => {
  try {
    let settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (!settings) {
      settings = await GlobalSetting.create({ configKey: 'main_config' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const { 
      premiumIpPrice, 
      premiumIpDuration, 
      bkashNumber, 
      nagadNumber, 
      rocketNumber, 
      premiumIpPackages,
      nativeAdsConfig,
      fortuneWheelConfig,
      promoBanner,
      promoBanners,
      admobConfig,
      appUpdateConfig,
      referralCampaignTarget,
      referralCampaignReward,
      zinipayApiKey,
      zinipayBaseUrl,
      zinipayEnabled
    } = req.body;
    
    let settings = await GlobalSetting.findOne({ configKey: 'main_config' });
    if (!settings) {
      settings = new GlobalSetting({ configKey: 'main_config' });
    }

    if (premiumIpPrice !== undefined) settings.premiumIpPrice = Number(premiumIpPrice);
    if (premiumIpDuration !== undefined) settings.premiumIpDuration = premiumIpDuration;
    if (bkashNumber !== undefined) settings.bkashNumber = bkashNumber;
    if (nagadNumber !== undefined) settings.nagadNumber = nagadNumber;
    if (rocketNumber !== undefined) settings.rocketNumber = rocketNumber;
    if (premiumIpPackages !== undefined) settings.premiumIpPackages = premiumIpPackages;
    if (nativeAdsConfig !== undefined) settings.nativeAdsConfig = nativeAdsConfig;
    if (fortuneWheelConfig !== undefined) settings.fortuneWheelConfig = fortuneWheelConfig;
    if (promoBanner !== undefined) settings.promoBanner = promoBanner;
    if (promoBanners !== undefined) settings.promoBanners = promoBanners;
    if (admobConfig !== undefined) settings.admobConfig = admobConfig;
    if (appUpdateConfig !== undefined) settings.appUpdateConfig = appUpdateConfig;
    if (referralCampaignTarget !== undefined) settings.referralCampaignTarget = Number(referralCampaignTarget);
    if (referralCampaignReward !== undefined) settings.referralCampaignReward = Number(referralCampaignReward);
    if (zinipayApiKey !== undefined) settings.zinipayApiKey = zinipayApiKey;
    if (zinipayBaseUrl !== undefined) settings.zinipayBaseUrl = zinipayBaseUrl;
    if (zinipayEnabled !== undefined) settings.zinipayEnabled = Boolean(zinipayEnabled);

    await settings.save();
    try {
      const earningController = require('./earningController');
      if (earningController && typeof earningController.invalidateSettingsCache === 'function') {
        earningController.invalidateSettingsCache();
      }
    } catch (cacheErr) {
      console.error('Failed to invalidate settings cache:', cacheErr);
    }
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ARTICLES MANAGEMENT
exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, coins, readingTime, category } = req.body;
    const article = new Article({ title, content, coins, readingTime, category });
    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Products MANAGEMENT ───────────────────────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const products = await CartProduct.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, originalPrice, badge, inStock, isActive } = req.body;
    let imageUrl = req.body.image || '';

    if (req.file) {
      imageUrl = req.file.filename;
    }

    const product = new CartProduct({ 
      title, 
      description, 
      price: Number(price), 
      originalPrice: Number(originalPrice), 
      image: imageUrl, 
      badge, 
      inStock: inStock === 'true' || inStock === true, 
      isActive: isActive === 'true' || isActive === true 
    });
    
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create Product Error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Parse numeric and boolean fields from FormData strings
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.originalPrice !== undefined) updateData.originalPrice = Number(updateData.originalPrice);
    if (updateData.inStock !== undefined) updateData.inStock = updateData.inStock === 'true' || updateData.inStock === true;
    if (updateData.isActive !== undefined) updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;

    if (req.file) {
      updateData.image = req.file.filename;
    }

    const product = await CartProduct.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Update Product Error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await CartProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Weekly Missions MANAGEMENT ──────────────────────────────────────────────
exports.getWeeklyMissions = async (req, res) => {
  try {
    const missions = await WeeklyMission.find().sort({ createdAt: -1 });
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createWeeklyMission = async (req, res) => {
  try {
    const { title, description, rewardCoins, actionUrl, isActive, missionType, targetCount } = req.body;
    const mission = new WeeklyMission({ 
      title, description, rewardCoins, 
      actionUrl: actionUrl || '', 
      isActive,
      missionType: missionType || 'custom',
      targetCount: targetCount ? Number(targetCount) : 5
    });
    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateWeeklyMission = async (req, res) => {
  try {
    const mission = await WeeklyMission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json(mission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteWeeklyMission = async (req, res) => {
  try {
    const mission = await WeeklyMission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json({ message: 'Mission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Announcements ────────────────────────────────────────────────────────────
exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Fetch all user IDs
    const users = await User.find({}, '_id').lean();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found to send announcement' });
    }

    // Create notifications array
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type: 'announcement',
      isRead: false
    }));

    // Bulk insert
    await Notification.insertMany(notifications);

    res.status(201).json({ message: `Announcement sent to ${users.length} users successfully` });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ message: 'Failed to send announcement' });
  }
};

// ─── Admin Notifications ─────────────────────────────────────────────────────
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAdminNotificationRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAdminNotificationsRead = async (req, res) => {
  try {
    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAdminNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DATABASE BACKUP & RESTORE / MIGRATION CONTROLLER ────────────────────────

// Helper to deserialize MongoDB Extended JSON ($oid, $date, $numberLong, etc.)
const sanitizeDocForImport = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;
  if (Array.isArray(doc)) return doc.map(sanitizeDocForImport);
  
  const result = {};
  for (const [key, value] of Object.entries(doc)) {
    if (value && typeof value === 'object') {
      if ('$oid' in value && typeof value.$oid === 'string') {
        try {
          result[key] = new mongoose.Types.ObjectId(value.$oid);
        } catch {
          result[key] = value.$oid;
        }
      } else if ('$date' in value) {
        if (typeof value.$date === 'object' && value.$date.$numberLong) {
          result[key] = new Date(Number(value.$date.$numberLong));
        } else {
          result[key] = new Date(value.$date);
        }
      } else if ('$numberInt' in value) {
        result[key] = parseInt(value.$numberInt, 10);
      } else if ('$numberDouble' in value) {
        result[key] = parseFloat(value.$numberDouble);
      } else if ('$numberLong' in value) {
        result[key] = Number(value.$numberLong);
      } else {
        result[key] = sanitizeDocForImport(value);
      }
    } else if (key === '_id' && typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
      try {
        result[key] = new mongoose.Types.ObjectId(value);
      } catch {
        result[key] = value;
      }
    } else if (
      (key.toLowerCase().endsWith('id') || key === 'author' || key === 'sender' || key === 'receiver') &&
      typeof value === 'string' &&
      /^[0-9a-fA-F]{24}$/.test(value)
    ) {
      try {
        result[key] = new mongoose.Types.ObjectId(value);
      } catch {
        result[key] = value;
      }
    } else if (
      (key === 'createdAt' || key === 'updatedAt' || key === 'editedAt' || key === 'expiresAt' || key === 'timestamp') &&
      typeof value === 'string' &&
      !isNaN(Date.parse(value))
    ) {
      result[key] = new Date(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

// Helper to extract all media filenames from exported/imported collections
const extractMediaFilenamesFromCollections = (collections) => {
  const filenames = new Set();
  
  const scanValue = (val) => {
    if (!val) return;
    if (typeof val === 'string') {
      const clean = val.trim();
      if (clean.startsWith('data:')) return; // ignore raw base64
      
      let extracted = clean;
      if (extracted.includes('/api/image?file=')) {
        extracted = extracted.split('/api/image?file=')[1].split('&')[0];
      } else if (extracted.includes('/uploads/')) {
        extracted = extracted.split('/uploads/')[1].split('?')[0];
      } else if (extracted.startsWith('http://') || extracted.startsWith('https://')) {
        try {
          const u = new URL(extracted);
          if (u.pathname.includes('/api/image')) {
            extracted = u.searchParams.get('file') || '';
          } else {
            const parts = u.pathname.split('/');
            extracted = parts[parts.length - 1] || '';
          }
        } catch (e) {
          const parts = extracted.split('/');
          extracted = parts[parts.length - 1].split('?')[0];
        }
      }

      const safeName = path.basename(extracted);
      if (
        safeName &&
        safeName.length > 3 &&
        !safeName.includes('/') &&
        !safeName.includes('\\') &&
        (/\.(webp|jpg|jpeg|png|gif|webm|mp4|mp3|wav|m4a|svg|ico)$/i.test(safeName) ||
         safeName.startsWith('avatar-') ||
         safeName.startsWith('post-') ||
         safeName.startsWith('cover-') ||
         safeName.startsWith('id-') ||
         safeName.startsWith('voice-') ||
         safeName.startsWith('msg-') ||
         safeName.startsWith('banner-') ||
         safeName.startsWith('product-') ||
         safeName.startsWith('group-') ||
         safeName.startsWith('image-'))
      ) {
        filenames.add(safeName);
      }
    } else if (Array.isArray(val)) {
      for (const item of val) {
        scanValue(item);
      }
    } else if (typeof val === 'object') {
      for (const key of Object.keys(val)) {
        scanValue(val[key]);
      }
    }
  };

  scanValue(collections);
  return Array.from(filenames);
};

// 1. Get database summary & collection stats
exports.getDatabaseStats = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const collections = await db.listCollections().toArray();
    const stats = [];
    let totalDocs = 0;

    for (const col of collections) {
      const name = col.name;
      if (name.startsWith('system.')) continue;
      const count = await db.collection(name).countDocuments();
      totalDocs += count;
      stats.push({ name, count });
    }

    stats.sort((a, b) => b.count - a.count);

    // Count local uploads files
    const uploadsDir = path.join(__dirname, '../uploads');
    let totalUploadsCount = 0;
    if (fs.existsSync(uploadsDir)) {
      try {
        const files = fs.readdirSync(uploadsDir);
        totalUploadsCount = files.filter(f => f !== 'cache' && fs.statSync(path.join(uploadsDir, f)).isFile()).length;
      } catch (e) {}
    }

    res.json({
      dbName: db.databaseName,
      totalCollections: stats.length,
      totalDocuments: totalDocs,
      totalUploadsCount,
      collections: stats,
    });
  } catch (error) {
    console.error('getDatabaseStats error:', error);
    res.status(500).json({ message: 'Failed to fetch database stats', error: error.message });
  }
};

// 2. Export full database or specific collection as JSON with optional embedded media
exports.exportDatabase = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const { collection, download, includeMedia } = req.query;
    const collectionsList = await db.listCollections().toArray();
    
    const targetCollections = collection 
      ? collectionsList.filter(c => c.name.toLowerCase() === collection.toLowerCase())
      : collectionsList.filter(c => !c.name.startsWith('system.'));

    if (collection && targetCollections.length === 0) {
      return res.status(404).json({ message: `Collection '${collection}' not found` });
    }

    const exportedData = {};
    for (const col of targetCollections) {
      const docs = await db.collection(col.name).find({}).toArray();
      exportedData[col.name] = docs;
    }

    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      database: db.databaseName,
      collections: exportedData,
    };

    // If includeMedia is requested, embed all referenced image & audio files as Base64
    if (includeMedia === 'true' || includeMedia === true) {
      const referencedFiles = extractMediaFilenamesFromCollections(exportedData);
      const uploadsDir = path.join(__dirname, '../uploads');
      const mediaFiles = {};
      let embeddedCount = 0;

      const allFilesToExport = new Set(referencedFiles);
      if (fs.existsSync(uploadsDir)) {
        try {
          const diskFiles = fs.readdirSync(uploadsDir);
          for (const f of diskFiles) {
            if (f === 'cache' || f.startsWith('.')) continue;
            const fullP = path.join(uploadsDir, f);
            if (fs.statSync(fullP).isFile()) {
              allFilesToExport.add(f);
            }
          }
        } catch (e) {}
      }

      for (const filename of allFilesToExport) {
        const safeName = path.basename(filename);
        const filePath = path.join(uploadsDir, safeName);
        if (fs.existsSync(filePath)) {
          try {
            const fileBuffer = fs.readFileSync(filePath);
            const ext = path.extname(safeName).toLowerCase().replace('.', '');
            const mimeType = ext === 'png' ? 'image/png' 
              : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' 
              : ext === 'webp' ? 'image/webp'
              : ext === 'webm' ? 'audio/webm'
              : ext === 'mp4' ? 'video/mp4'
              : ext === 'mp3' ? 'audio/mpeg'
              : ext === 'wav' ? 'audio/wav'
              : ext === 'm4a' ? 'audio/mp4'
              : ext === 'svg' ? 'image/svg+xml'
              : 'application/octet-stream';
            mediaFiles[safeName] = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
            embeddedCount++;
          } catch (e) {
            console.warn(`Could not read file ${safeName}:`, e.message);
          }
        }
      }

      payload.includeMedia = true;
      payload.totalMediaFiles = embeddedCount;
      payload.mediaFiles = mediaFiles;
    }

    if (download === 'true') {
      const filename = `database_backup_${collection ? collection + '_' : ''}${new Date().toISOString().slice(0, 10)}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(JSON.stringify(payload, null, 2));
    }

    res.json(payload);
  } catch (error) {
    console.error('exportDatabase error:', error);
    res.status(500).json({ message: 'Failed to export database', error: error.message });
  }
};

// 3. Import / Restore / Paste JSON data into MongoDB + Auto-Restore Media Files
exports.importDatabase = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    let { data, mode = 'upsert', targetCollection, sourceServerUrl } = req.body;
    if (!data) {
      return res.status(400).json({ message: 'No database data provided to import' });
    }

    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid JSON format: ' + e.message });
      }
    }

    // ── 1. Restore Embedded Media Files (Base64) ──
    let mediaFilesRestored = 0;
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (parsedData.mediaFiles && typeof parsedData.mediaFiles === 'object') {
      for (const [filename, base64OrData] of Object.entries(parsedData.mediaFiles)) {
        if (!base64OrData || typeof base64OrData !== 'string') continue;
        try {
          const safeName = path.basename(filename);
          const base64Content = base64OrData.replace(/^data:[^;]+;base64,/, '');
          const buffer = Buffer.from(base64Content, 'base64');
          if (buffer.length > 0) {
            fs.writeFileSync(path.join(uploadsDir, safeName), buffer);
            mediaFilesRestored++;
          }
        } catch (e) {
          console.warn(`Could not restore media file ${filename}:`, e.message);
        }
      }
    }

    // ── 2. Process Collections ──
    let collectionsToProcess = {};

    if (parsedData.collections && typeof parsedData.collections === 'object' && !Array.isArray(parsedData.collections)) {
      collectionsToProcess = parsedData.collections;
    } else if (Array.isArray(parsedData)) {
      if (!targetCollection) {
        return res.status(400).json({ 
          message: 'Pasted data is an array of documents. Please select which collection this belongs to (e.g., users, posts, transactions, etc.).' 
        });
      }
      collectionsToProcess[targetCollection] = parsedData;
    } else if (typeof parsedData === 'object') {
      let hasArrayValues = false;
      for (const [k, v] of Object.entries(parsedData)) {
        if (Array.isArray(v)) {
          collectionsToProcess[k] = v;
          hasArrayValues = true;
        }
      }
      if (!hasArrayValues) {
        if (targetCollection) {
          collectionsToProcess[targetCollection] = [parsedData];
        } else {
          return res.status(400).json({ 
            message: 'Unrecognized JSON structure. Expected a backup object with { collections: { ... } } or an array of documents.' 
          });
        }
      }
    }

    const summary = {};
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const [rawColName, docs] of Object.entries(collectionsToProcess)) {
      if (!Array.isArray(docs)) continue;
      const colName = rawColName.toLowerCase().trim();
      const col = db.collection(colName);

      summary[colName] = {
        total: docs.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: [],
      };

      if (mode === 'replace') {
        try {
          await col.deleteMany({});
        } catch (err) {
          console.warn(`Could not clear collection ${colName}:`, err.message);
        }
      }

      for (let i = 0; i < docs.length; i++) {
        const rawDoc = docs[i];
        if (!rawDoc || typeof rawDoc !== 'object') continue;

        const doc = sanitizeDocForImport(rawDoc);

        try {
          if (mode === 'replace') {
            await col.insertOne(doc);
            summary[colName].inserted++;
            totalImported++;
          } else {
            // Upsert mode
            if (doc._id) {
              const res = await col.updateOne(
                { _id: doc._id },
                { $set: doc },
                { upsert: true }
              );
              if (res.upsertedCount > 0) {
                summary[colName].inserted++;
                totalImported++;
              } else if (res.matchedCount > 0) {
                summary[colName].updated++;
                totalUpdated++;
              } else {
                summary[colName].inserted++;
                totalImported++;
              }
            } else {
              await col.insertOne(doc);
              summary[colName].inserted++;
              totalImported++;
            }
          }
        } catch (err) {
          if (err.code === 11000) {
            try {
              if (doc._id) {
                await col.updateOne({ _id: doc._id }, { $set: doc });
                summary[colName].updated++;
                totalUpdated++;
              } else {
                summary[colName].skipped++;
                totalSkipped++;
              }
            } catch (e2) {
              summary[colName].skipped++;
              totalSkipped++;
            }
          } else {
            summary[colName].errors.push(`Item #${i + 1}: ${err.message}`);
            totalErrors++;
          }
        }
      }
    }

    // ── 3. Auto-Download Missing Images if sourceServerUrl provided ──
    let autoDownloadedMedia = 0;
    if (sourceServerUrl && typeof sourceServerUrl === 'string' && sourceServerUrl.trim()) {
      let cleanSourceUrl = sourceServerUrl.trim().replace(/\/+$/, '');
      if (!cleanSourceUrl.startsWith('http://') && !cleanSourceUrl.startsWith('https://')) {
        cleanSourceUrl = 'http://' + cleanSourceUrl;
      }

      const referencedFiles = extractMediaFilenamesFromCollections(collectionsToProcess);
      for (const filename of referencedFiles) {
        const safeName = path.basename(filename);
        const localPath = path.join(uploadsDir, safeName);
        if (!fs.existsSync(localPath)) {
          const possibleUrls = [
            `${cleanSourceUrl}/api/image?file=${encodeURIComponent(safeName)}`,
            `${cleanSourceUrl}/uploads/${encodeURIComponent(safeName)}`,
          ];
          for (const targetUrl of possibleUrls) {
            try {
              const response = await fetch(targetUrl, { signal: AbortSignal.timeout(6000) });
              if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                if (buffer.length > 0) {
                  fs.writeFileSync(localPath, buffer);
                  autoDownloadedMedia++;
                  break;
                }
              }
            } catch (e) {}
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Database import complete! ${totalImported} inserted, ${totalUpdated} updated, ${mediaFilesRestored + autoDownloadedMedia} media files restored.`,
      stats: { 
        totalImported, 
        totalUpdated, 
        totalSkipped, 
        totalErrors,
        mediaFilesRestored: mediaFilesRestored + autoDownloadedMedia
      },
      summary,
    });
  } catch (error) {
    console.error('importDatabase error:', error);
    res.status(500).json({ message: 'Failed to import database', error: error.message });
  }
};

// 4. Sync All Missing Media from Source Server
exports.syncMediaFromServer = async (req, res) => {
  try {
    let { sourceServerUrl } = req.body;
    if (!sourceServerUrl) {
      return res.status(400).json({ message: 'Please provide source server URL or IP (e.g. http://72.61.117.87:5010)' });
    }

    sourceServerUrl = sourceServerUrl.trim().replace(/\/+$/, '');
    if (!sourceServerUrl.startsWith('http://') && !sourceServerUrl.startsWith('https://')) {
      sourceServerUrl = 'http://' + sourceServerUrl;
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    const collectionsList = await db.listCollections().toArray();
    const allCollections = {};
    for (const col of collectionsList) {
      if (col.name.startsWith('system.')) continue;
      allCollections[col.name] = await db.collection(col.name).find({}).toArray();
    }

    const referencedFiles = extractMediaFilenamesFromCollections(allCollections);
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let downloadedCount = 0;
    let existingCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const filename of referencedFiles) {
      const safeFilename = path.basename(filename);
      const localPath = path.join(uploadsDir, safeFilename);

      if (fs.existsSync(localPath)) {
        existingCount++;
        continue;
      }

      const possibleUrls = [
        `${sourceServerUrl}/api/image?file=${encodeURIComponent(safeFilename)}`,
        `${sourceServerUrl}/uploads/${encodeURIComponent(safeFilename)}`,
      ];

      let downloaded = false;
      for (const targetUrl of possibleUrls) {
        try {
          const response = await fetch(targetUrl, { signal: AbortSignal.timeout(8000) });
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            if (buffer.length > 0) {
              fs.writeFileSync(localPath, buffer);
              downloadedCount++;
              downloaded = true;
              break;
            }
          }
        } catch (e) {}
      }

      if (!downloaded) {
        failedCount++;
        errors.push(safeFilename);
      }
    }

    res.json({
      success: true,
      message: `Media sync complete! Downloaded: ${downloadedCount}, Already Existed: ${existingCount}, Missing on source: ${failedCount}`,
      stats: {
        totalReferenced: referencedFiles.length,
        downloaded: downloadedCount,
        existing: existingCount,
        failed: failedCount,
        failedFiles: errors.slice(0, 30),
      },
    });
  } catch (error) {
    console.error('syncMediaFromServer error:', error);
    res.status(500).json({ message: 'Failed to sync media from server', error: error.message });
  }
};

// 5. Clear/Reset Collection(s)
exports.clearDatabase = async (req, res) => {
  try {
    const { confirmation, collection } = req.body;
    if (confirmation !== 'CONFIRM_RESET_DATABASE') {
      return res.status(400).json({ message: 'Please provide the exact confirmation code: CONFIRM_RESET_DATABASE' });
    }

    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ message: 'Database connection not established' });
    }

    if (collection && collection !== 'all') {
      await db.collection(collection).deleteMany({});
      return res.json({ success: true, message: `Collection '${collection}' cleared successfully` });
    }

    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      if (col.name.startsWith('system.')) continue;
      await db.collection(col.name).deleteMany({});
    }

    res.json({ success: true, message: 'All database collections cleared successfully' });
  } catch (error) {
    console.error('clearDatabase error:', error);
    res.status(500).json({ message: 'Failed to clear database', error: error.message });
  }
};

// ─── Admin Profile & Password Change ─────────────────────────────────────────
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin account not found' });
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    console.error('changeAdminPassword error:', error);
    res.status(500).json({ message: 'Failed to update password', error: error.message });
  }
};

// ─── Sub-Admin Management (Super Admin only) ──────────────────────────────────
exports.getSubAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    console.error('getSubAdmins error:', error);
    res.status(500).json({ message: 'Failed to fetch sub-admins', error: error.message });
  }
};

exports.createSubAdmin = async (req, res) => {
  try {
    const { name, email, password, permissions, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Admin.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ message: 'An admin with this email already exists' });
    }

    const assignedRole = role === 'super_admin' ? 'super_admin' : 'admin';
    const assignedPermissions = Array.isArray(permissions) ? permissions : [];

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: assignedRole,
      permissions: assignedPermissions,
      isActive: true,
      createdBy: req.admin.id || null,
    });

    // Send invitation email asynchronously
    sendAdminInvitationEmail({
      toEmail: cleanEmail,
      name: name.trim(),
      temporaryPassword: password,
      role: assignedRole,
      permissions: assignedPermissions,
      loginUrl: 'https://zenivio.it.com/admin',
    }).catch(err => console.error('Admin invitation email failed to send:', err));

    const sanitized = newAdmin.toObject();
    delete sanitized.password;

    res.status(201).json({
      success: true,
      message: `Admin created successfully and invitation email sent to ${cleanEmail}`,
      admin: sanitized,
    });
  } catch (error) {
    console.error('createSubAdmin error:', error);
    res.status(500).json({ message: 'Failed to create admin', error: error.message });
  }
};

exports.updateSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, permissions, isActive, password, role } = req.body;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Prevent deactivating or demoting the last active Super Admin
    if (admin.role === 'super_admin' && (isActive === false || (role && role !== 'super_admin'))) {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin', isActive: true });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot deactivate or demote the sole active Super Admin.' });
      }
    }

    if (name) admin.name = name.trim();
    if (Array.isArray(permissions)) admin.permissions = permissions;
    if (typeof isActive === 'boolean') admin.isActive = isActive;
    if (role && ['super_admin', 'admin'].includes(role)) admin.role = role;
    if (password && password.trim().length >= 6) {
      admin.password = password.trim();
    }

    await admin.save();

    const sanitized = admin.toObject();
    delete sanitized.password;

    res.json({
      success: true,
      message: 'Admin updated successfully',
      admin: sanitized,
    });
  } catch (error) {
    console.error('updateSubAdmin error:', error);
    res.status(500).json({ message: 'Failed to update admin', error: error.message });
  }
};

exports.deleteSubAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.admin.id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    if (admin.role === 'super_admin') {
      const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the only Super Admin.' });
      }
    }

    await Admin.findByIdAndDelete(id);
    res.json({ success: true, message: 'Admin removed successfully' });
  } catch (error) {
    console.error('deleteSubAdmin error:', error);
    res.status(500).json({ message: 'Failed to delete admin', error: error.message });
  }
};



// ─── Screen Time & Activity Reports ──────────────────────────────────────────

const formatSecondsToDuration = (seconds = 0) => {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs} hr ${mins} min ${secs} sec`;
  }
  if (mins > 0) {
    return `${mins} min ${secs} sec`;
  }
  return `${secs} sec`;
};

const getDhakaDate = (d = new Date()) => {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
};

// @desc    Get user screen time & activity reports
// @route   GET /api/admin/activity
// @access  Private (Admin)
exports.getActivityReports = async (req, res) => {
  try {
    const { 
      date, 
      range = 'today', 
      search = '', 
      platform = 'all', 
      verifiedOnly = 'false',
      sortBy = 'time_desc', 
      page = 1, 
      limit = 30 
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));

    const now = new Date();
    let targetDates = [];
    let selectedDateLabel = date || getDhakaDate(now);

    if (date) {
      targetDates = [date];
      selectedDateLabel = date;
    } else if (range === 'yesterday') {
      const yDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yStr = getDhakaDate(yDate);
      targetDates = [yStr];
      selectedDateLabel = yStr;
    } else if (range === '7days') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        targetDates.push(getDhakaDate(d));
      }
      selectedDateLabel = 'Last 7 Days';
    } else if (range === '30days') {
      for (let i = 0; i < 30; i++) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        targetDates.push(getDhakaDate(d));
      }
      selectedDateLabel = 'Last 30 Days';
    } else if (range === 'all') {
      targetDates = null;
      selectedDateLabel = 'All Time';
    } else {
      const todayStr = getDhakaDate(now);
      targetDates = [todayStr];
      selectedDateLabel = todayStr;
    }

    const matchQuery = {};
    if (targetDates && targetDates.length > 0) {
      if (targetDates.length === 1) {
        matchQuery.date = targetDates[0];
      } else {
        matchQuery.date = { $in: targetDates };
      }
    }
    if (platform && platform !== 'all') {
      matchQuery.platform = platform;
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: '$userId',
          totalActiveSeconds: { $sum: '$activeSeconds' },
          lastPingAt: { $max: '$lastPingAt' },
          platform: { $last: '$platform' },
          activeDaysCount: { $addToSet: '$date' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' }
    ];

    if (search && search.trim()) {
      const reg = new RegExp(search.trim(), 'i');
      pipeline.push({
        $match: {
          $or: [
            { 'userDetails.name': reg },
            { 'userDetails.username': reg },
            { 'userDetails.phoneOrEmail': reg }
          ]
        }
      });
    }

    if (verifiedOnly === 'true') {
      pipeline.push({
        $match: {
          $or: [
            { 'userDetails.verificationBadge': { $in: ['golden', 'purple', 'blue'] } },
            { 'userDetails.isVerified': true }
          ]
        }
      });
    }

    let sortStage = { totalActiveSeconds: -1 };
    if (sortBy === 'time_asc') sortStage = { totalActiveSeconds: 1 };
    else if (sortBy === 'recent') sortStage = { lastPingAt: -1 };
    else if (sortBy === 'name') sortStage = { 'userDetails.name': 1 };
    pipeline.push({ $sort: sortStage });

    const allResults = await UserActivity.aggregate(pipeline);
    const totalUsersCount = allResults.length;
    const totalCombinedSeconds = allResults.reduce((acc, curr) => acc + (curr.totalActiveSeconds || 0), 0);
    const avgSeconds = totalUsersCount > 0 ? Math.round(totalCombinedSeconds / totalUsersCount) : 0;

    const paginatedResults = allResults.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    const nowMs = Date.now();
    const formattedUsers = paginatedResults.map((item, idx) => {
      const u = item.userDetails;
      const isOnline = item.lastPingAt ? (nowMs - new Date(item.lastPingAt).getTime() < 3 * 60 * 1000) : false;
      const rank = (pageNum - 1) * limitNum + idx + 1;

      return {
        rank,
        userId: u._id,
        name: u.name || 'User',
        username: u.username || '',
        phoneOrEmail: u.phoneOrEmail || '',
        profilePic: u.profilePic || u.googleAvatar || u.facebookAvatar || '',
        verificationBadge: u.verificationBadge || (u.isVerified ? 'purple' : 'none'),
        isVerified: Boolean(u.isVerified || (u.verificationBadge && u.verificationBadge !== 'none')),
        activeSeconds: item.totalActiveSeconds,
        formattedTime: formatSecondsToDuration(item.totalActiveSeconds),
        totalLifetimeSeconds: u.totalScreenTimeSeconds || item.totalActiveSeconds,
        formattedLifetimeTime: formatSecondsToDuration(u.totalScreenTimeSeconds || item.totalActiveSeconds),
        platform: item.platform || 'web',
        lastPingAt: item.lastPingAt,
        isOnline,
        activeDays: item.activeDaysCount ? item.activeDaysCount.length : 1
      };
    });

    const topUser = allResults[0] ? {
      name: allResults[0].userDetails.name,
      username: allResults[0].userDetails.username,
      verificationBadge: allResults[0].userDetails.verificationBadge || 'none',
      formattedTime: formatSecondsToDuration(allResults[0].totalActiveSeconds)
    } : null;

    res.json({
      success: true,
      selectedDateLabel,
      summary: {
        totalActiveUsers: totalUsersCount,
        totalCombinedSeconds,
        formattedTotalTime: formatSecondsToDuration(totalCombinedSeconds),
        avgSeconds,
        formattedAvgTime: formatSecondsToDuration(avgSeconds),
        topUser
      },
      users: formattedUsers,
      pagination: {
        total: totalUsersCount,
        page: pageNum,
        pages: Math.ceil(totalUsersCount / limitNum) || 1,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('getActivityReports error:', err);
    res.status(500).json({ message: 'Failed to retrieve activity reports', error: err.message });
  }
};

// @desc    Get detailed user screen time history (last 30 days breakdown)
// @route   GET /api/admin/activity/user/:id
// @access  Private (Admin)
exports.getUserActivityDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username phoneOrEmail profilePic googleAvatar facebookAvatar verificationBadge isVerified totalScreenTimeSeconds lastActiveAt createdAt'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dailyLogs = await UserActivity.find({ userId: req.params.id })
      .sort({ date: -1 })
      .limit(30);

    const formattedLogs = dailyLogs.map(log => ({
      _id: log._id,
      date: log.date,
      activeSeconds: log.activeSeconds,
      formattedTime: formatSecondsToDuration(log.activeSeconds),
      platform: log.platform || 'web',
      lastPingAt: log.lastPingAt
    }));

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name || 'User',
        username: user.username,
        phoneOrEmail: user.phoneOrEmail,
        profilePic: user.profilePic || user.googleAvatar || user.facebookAvatar || '',
        verificationBadge: user.verificationBadge || (user.isVerified ? 'purple' : 'none'),
        isVerified: Boolean(user.isVerified || (user.verificationBadge && user.verificationBadge !== 'none')),
        totalLifetimeSeconds: user.totalScreenTimeSeconds || 0,
        formattedLifetimeTime: formatSecondsToDuration(user.totalScreenTimeSeconds || 0),
        lastActiveAt: user.lastActiveAt,
        joinedDate: user.createdAt
      },
      dailyLogs: formattedLogs
    });
  } catch (err) {
    console.error('getUserActivityDetail error:', err);
    res.status(500).json({ message: 'Failed to retrieve user activity details' });
  }
};
