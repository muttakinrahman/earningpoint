const User = require('../models/User');
const Article = require('../models/Article');
const Transaction = require('../models/Transaction');
const GlobalSetting = require('../models/GlobalSetting');
const CartProduct = require('../models/CartProduct');
const WeeklyMission = require('../models/WeeklyMission');
const AdminNotification = require('../models/AdminNotification');
const MissionCompletion = require('../models/MissionCompletion');
const { createNotification } = require('./notificationController');

// ── GlobalSettings in-memory cache (5 min TTL) ───────────────────────────────
// GlobalSettings is fetched on every EarningPage open — cache it to avoid DB hit every time
let settingsCache = null;
let settingsCacheTime = 0;
const SETTINGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getSettings = async () => {
  const now = Date.now();
  if (settingsCache && (now - settingsCacheTime) < SETTINGS_CACHE_TTL) {
    return settingsCache;
  }
  let settings = await GlobalSetting.findOne({ configKey: 'main_config' }).lean();
  if (!settings) {
    settings = await GlobalSetting.create({ configKey: 'main_config' });
    settings = settings.toObject();
  }
  settingsCache = settings;
  settingsCacheTime = now;
  return settings;
};

// Call this when admin updates settings to invalidate the cache
exports.invalidateSettingsCache = () => {
  settingsCache = null;
  settingsCacheTime = 0;
};

const processPoints = (user, reward) => {
  user.points = (user.points || 0) + reward;
  user.lifetimePoints = (user.lifetimePoints || 0) + reward;
  return false; // Auto-conversion disabled, user must convert manually
};

exports.getDailyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastDailyCheckin dailyCheckinCount');
    res.json({
      lastCheckin: user.lastDailyCheckin,
      count: user.dailyCheckinCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimDailyCheckin = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const TWO_HOURS = 2 * 60 * 60 * 1000;

    // Determine if we are in a new 2-hour window
    const isNewWindow = !user.lastDailyCheckin || (now - user.lastDailyCheckin >= TWO_HOURS);

    if (isNewWindow) {
      // Start a new window
      user.dailyCheckinCount = 0;
    } else if (user.dailyCheckinCount >= 2) {
      // Window is still active but ads are exhausted
      const waitTime = Math.ceil((TWO_HOURS - (now - user.lastDailyCheckin)) / (60 * 1000));
      return res.status(400).json({ message: `Please wait ${waitTime} minutes for the next checkin session.` });
    }

    // Process the claim
    const converted = processPoints(user, 20);
    user.dailyCheckinCount += 1;
    user.lastDailyCheckin = now; // Track the time of the last successful claim

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: 20,
      description: `Daily Checkin Ad Reward`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Reward Earned! 💰', 'You just earned 20 points from Daily Checkin!', 'earning');

    res.json({ 
      message: `Rewarded 20 points! (${user.dailyCheckinCount}/2 ads completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.dailyCheckinCount,
      lastCheckin: user.lastDailyCheckin
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getVideoAdStatus = async (req, res) => {
  try {
    const { type } = req.query;
    const isViewAds = type === 'view_ads';
    
    const selectFields = isViewAds ? 'lastViewAdsAd viewAdsCount' : 'lastVideoAd videoAdCount';
    const user = await User.findById(req.user._id).select(selectFields);
    
    const lastAdField = isViewAds ? 'lastViewAdsAd' : 'lastVideoAd';
    const countField = isViewAds ? 'viewAdsCount' : 'videoAdCount';

    // Check if it's a new day to reset the count
    const now = new Date();
    let count = user[countField] || 0;
    
    if (user[lastAdField]) {
      const lastAdDate = new Date(user[lastAdField]);
      if (lastAdDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastAd: user[lastAdField],
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimVideoAd = async (req, res) => {
  try {
    const { type } = req.body;
    const isViewAds = type === 'view_ads';
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    const countField = isViewAds ? 'viewAdsCount' : 'videoAdCount';
    const lastAdField = isViewAds ? 'lastViewAdsAd' : 'lastVideoAd';

    // Check if it's a new day
    let currentCount = user[countField] || 0;
    if (user[lastAdField]) {
      const lastAdDate = new Date(user[lastAdField]);
      if (lastAdDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 5) {
      return res.status(400).json({ message: `You have reached the daily limit of 5 ${isViewAds ? 'View Ads' : 'Videos'}. Please come back tomorrow.` });
    }

    // Determine reward amount: video = 25, view_ads = 10
    const rewardedAmount = isViewAds ? 10 : 25;
    const typeLabel = isViewAds ? 'View Ads' : 'Videos';

    // Process the claim
    const converted = processPoints(user, rewardedAmount);
    user[countField] = currentCount + 1;
    user[lastAdField] = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: rewardedAmount,
      description: `${typeLabel} Reward (${user[countField]}/5)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Video Reward! 📺', `You earned ${rewardedAmount} points for watching ${typeLabel} ${user[countField]}/5 today.`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${rewardedAmount} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${rewardedAmount} points! (${user[countField]}/5 completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user[countField],
      lastAd: user[lastAdField]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getSpinStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastSpinDate spinCount');
    const now = new Date();
    let count = user.spinCount || 0;
    
    if (user.lastSpinDate) {
      const lastDate = new Date(user.lastSpinDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastSpinDate: user.lastSpinDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimSpin = async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.spinCount || 0;
    if (user.lastSpinDate) {
      const lastDate = new Date(user.lastSpinDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 spins. Please come back tomorrow.` });
    }

    // Validate points (should be 10..100)
    const validPoints = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const reward = validPoints.includes(Number(points)) ? Number(points) : 10; // Default to 10 if invalid

    const converted = processPoints(user, reward);
    user.spinCount = currentCount + 1;
    user.lastSpinDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Spin Wheel Reward (${user.spinCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Lucky Spin! 🎡', `Congratulations! You won ${reward} points from the Fortune Wheel!`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points! (${user.spinCount}/10 spins completed)`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.spinCount,
      lastSpinDate: user.lastSpinDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.claimTask = async (req, res) => {
  try {
    const { points, name } = req.body;
    const user = await User.findById(req.user._id);
    
    const reward = Number(points) > 0 ? Number(points) : 10;
    const taskName = name || 'Ad Task';

    const converted = processPoints(user, reward);

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `${taskName} Reward`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Task Completed! ✅', `Congratulations! You earned ${reward} points from ${taskName}!`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points!`,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getScratchStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastScratchDate scratchCount');
    const now = new Date();
    let count = user.scratchCount || 0;
    
    if (user.lastScratchDate) {
      const lastDate = new Date(user.lastScratchDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastScratchDate: user.lastScratchDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimScratch = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.scratchCount || 0;
    if (user.lastScratchDate) {
      const lastDate = new Date(user.lastScratchDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 scratch cards. Please come back tomorrow.` });
    }

    const reward = Math.floor(Math.random() * 99) + 1; // Random points under 100
    const converted = processPoints(user, reward);
    user.scratchCount = currentCount + 1;
    user.lastScratchDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Scratch Card Reward (${user.scratchCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Scratch Reward! 🎟️', `Amazing! You scratched and won ${reward} points.`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points! (${user.scratchCount}/10 cards completed)`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.scratchCount,
      lastScratchDate: user.lastScratchDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getQuizStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastQuizDate quizCount');
    const now = new Date();
    let count = user.quizCount || 0;
    
    if (user.lastQuizDate) {
      const lastDate = new Date(user.lastQuizDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        count = 0;
      }
    }
    
    res.json({
      lastQuizDate: user.lastQuizDate,
      count: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    let currentCount = user.quizCount || 0;
    if (user.lastQuizDate) {
      const lastDate = new Date(user.lastQuizDate);
      if (lastDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 10) {
      return res.status(400).json({ message: `You have reached the daily limit of 10 quizzes. Please come back tomorrow.` });
    }

    const reward = 20;
    const converted = processPoints(user, reward);
    user.quizCount = currentCount + 1;
    user.lastQuizDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Math Quiz Reward (${user.quizCount}/10)`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Brain Power! 🧠', `Correct answer! You earned ${reward} points from Math Quiz.`, 'earning');

    res.json({ 
      message: `Rewarded ${reward} points! (${user.quizCount}/10 quizzes completed)`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      count: user.quizCount,
      lastQuizDate: user.lastQuizDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.claimGkQuiz = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    if (user.lastGkQuizDate) {
      if (user.lastGkQuizDate.toDateString() === now.toDateString()) {
        return res.status(400).json({ message: "You already claimed your Daily GK reward today! Come back tomorrow." });
      }
    }

    const reward = 40;
    processPoints(user, reward);
    user.lastGkQuizDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Daily GK Quiz Reward`,
      status: 'completed'
    });

    createNotification(user._id, 'Knowledge is Power! 📚', `Correct! You earned ${reward} points from Daily GK Quiz.`, 'earning');

    res.json({ 
      message: `Rewarded ${reward} points! Daily GK Quiz completed!`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      lastGkQuizDate: user.lastGkQuizDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getMysteryBoxStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('lastMysteryBoxDate');
    const now = new Date();
    let claimed = false;
    
    if (user.lastMysteryBoxDate) {
      if (user.lastMysteryBoxDate.toDateString() === now.toDateString()) {
        claimed = true;
      }
    }
    
    res.json({
      lastMysteryBoxDate: user.lastMysteryBoxDate,
      claimed: claimed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.claimMysteryBox = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    
    if (user.lastMysteryBoxDate) {
      if (user.lastMysteryBoxDate.toDateString() === now.toDateString()) {
        return res.status(400).json({ message: "You already claimed your Mystery Box today! Come back tomorrow." });
      }
    }

    const reward = Math.floor(Math.random() * 45) + 1; // 1 to 45
    const converted = processPoints(user, reward);
    user.lastMysteryBoxDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Mystery Box Reward`,
      status: 'completed'
    });

    createNotification(user._id, 'Mystery Box Opened! 🎁', `You got ${reward} points from the Mystery Box!`, 'earning');

    res.json({ 
      message: converted ? `Rewarded ${reward} points! You reached 1000+ points and got 50৳ converted!` : `Rewarded ${reward} points!`,
      reward: reward,
      balance: user.balance,
      points: user.points,
      lifetimePoints: user.lifetimePoints,
      lastMysteryBoxDate: user.lastMysteryBoxDate
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ─── Withdrawal ───────────────────────────────────────────────────────────────
exports.submitWithdrawal = async (req, res) => {
  try {
    const { amount, phone, method } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const amt = parseFloat(amount);
    if (!amt || amt < 1000) return res.status(400).json({ message: 'Minimum withdrawal is 1000৳' });
    if (amt > user.balance) return res.status(400).json({ message: 'Insufficient balance' });
    if (!phone || phone.length < 10) return res.status(400).json({ message: 'Invalid phone number' });
    if (!method) return res.status(400).json({ message: 'Payment method required' });

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'withdrawal',
      amount: amt,
      description: `Withdrawal via ${method} to ${phone}`,
      status: 'pending',
    });

    // Notify admin
    await AdminNotification.create({
      title: 'New Withdrawal Request 🏦',
      message: `User ${user.name || 'User'} requested a withdrawal of ${amt}৳ via ${method} to ${phone}.`,
      type: 'withdrawal',
      referenceId: transaction._id.toString()
    });

    // Notify user
    createNotification(user._id, 'Withdrawal Requested! 🏦', `Your request for ${amt}৳ via ${method} has been received and is under review.`, 'withdrawal');

    res.json({ message: 'Withdrawal request submitted! Admin will process within 24 hours.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ─── Get Withdrawals ─────────────────────────────────────────────────────────────
exports.getWithdrawals = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const withdrawals = await Transaction.find({ 
      userId: req.user._id, 
      type: 'withdrawal' 
    }).sort({ createdAt: -1 }).limit(20);
    
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      name: req.user.name || 'User',
      phone: w.description?.replace(/Withdrawal via .* to /, '') || '',
      amount: w.amount,
      method: w.description?.replace(/Withdrawal via /, '').replace(/ to .*/, '') || 'Unknown',
      date: w.createdAt.toISOString().split('T')[0],
      status: w.status
    }));
    
    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getAllWithdrawals = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const User = require('../models/User');
    
    const withdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('userId', 'name phoneOrEmail')
      .sort({ createdAt: -1 })
      .limit(50);
    
    const formattedWithdrawals = withdrawals.map(w => ({
      id: w._id,
      userId: w.userId?._id,
      name: w.userId?.name || 'User',
      phone: w.description?.replace(/Withdrawal via .* to /, '') || '',
      amount: w.amount,
      method: w.description?.replace(/Withdrawal via /, '').replace(/ to .*/, '') || 'Unknown',
      date: w.createdAt.toISOString().split('T')[0],
      status: w.status
    }));
    
    res.json({ withdrawals: formattedWithdrawals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

// ─── Premium IP Order ─────────────────────────────────────────────────────────
exports.submitPremiumOrder = async (req, res) => {
  try {
    const PremiumOrder = require('../models/PremiumOrder');
    const User = require('../models/User');
    const Transaction = require('../models/Transaction');
    const { packageId, packageName, country, division, district, thana, village, postalCode, paymentMethod, transactionId, amount } = req.body;

    if (!packageId || !paymentMethod || !amount) {
      return res.status(400).json({ message: 'Package, payment method, and amount are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let finalTxId = transactionId;

    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod)) {
      if (!transactionId) return res.status(400).json({ message: 'Transaction ID is required for mobile banking' });
    } else if (paymentMethod === 'earning') {
       if (user.balance < Number(amount)) {
          return res.status(400).json({ message: 'Insufficient earning balance! Please earn more or use another method.' });
       }
       // Deduct immediately
       user.balance -= Number(amount);
       await user.save();
       
       await Transaction.create({
         userId: user._id,
         type: 'withdrawal', // generic type for deduction
         amount: Number(amount),
         description: `Store Purchase: ${packageName || packageId}`,
         status: 'completed'
       });
       
       finalTxId = 'EARNING_BALANCE';
    } else if (paymentMethod === 'cod') {
       finalTxId = 'CASH_ON_DELIVERY';
    } else {
       return res.status(400).json({ message: 'Invalid payment method' });
    }

    const order = await PremiumOrder.create({
      userId: req.user._id,
      packageId,
      packageName: packageName || packageId,
      country: country || '',
      division: division || '',
      district: district || '',
      thana: thana || '',
      village: village || '',
      postalCode: postalCode || '',
      paymentMethod,
      transactionId: finalTxId,
      amount: Number(amount),
      status: 'pending',
    });

    // Notify admin
    await AdminNotification.create({
      title: 'New Premium Order 🚀',
      message: `User ${req.user.name || 'User'} ordered package "${packageName || packageId}" for ${amount}৳.`,
      type: 'premium',
      referenceId: order._id.toString()
    });

    // Notify user
    let notifyMsg = `Your order for ${packageName || packageId} is pending. Activation/Delivery takes some time.`;
    if (paymentMethod === 'earning') notifyMsg = `Your order for ${packageName || packageId} is placed and ${amount}৳ was deducted from your wallet!`;
    
    createNotification(req.user._id, 'Order Submitted! 🚀', notifyMsg, 'premium');

    res.status(201).json({ message: 'Order submitted! Admin will process it soon.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.convertCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (user.points < 1000) {
      return res.status(400).json({ message: 'Insufficient coins. You need at least 1000 coins to convert.' });
    }
    
    // Convert all possible multiples of 1000 coins
    const conversionCount = Math.floor(user.points / 1000);
    const convertedTk = conversionCount * 50;
    const usedCoins = conversionCount * 1000;
    
    user.balance = (user.balance || 0) + convertedTk;
    user.points -= usedCoins;
    
    await user.save();
    
    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: convertedTk,
      description: `Converted ${usedCoins} coins to ${convertedTk}৳`,
      status: 'completed'
    });

    // Notify user
    createNotification(user._id, 'Coins Converted! 💎', `Successfully converted ${usedCoins} coins to ${convertedTk}৳ balance.`, 'conversion');
    
    res.json({
      message: `Successfully converted ${usedCoins} coins to ${convertedTk}৳!`,
      balance: user.balance,
      points: user.points
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

exports.getGlobalSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    // Return only public fields
    res.json({
      premiumIpPrice: settings.premiumIpPrice,
      premiumIpDuration: settings.premiumIpDuration,
      bkashNumber: settings.bkashNumber,
      nagadNumber: settings.nagadNumber,
      rocketNumber: settings.rocketNumber,
      premiumIpPackages: settings.premiumIpPackages,
      promoBanner: settings.promoBanner,
      promoBanners: settings.promoBanners,
      nativeAdsConfig: settings.nativeAdsConfig,
      fortuneWheelConfig: settings.fortuneWheelConfig,
      admobConfig: settings.admobConfig,
      appUpdateConfig: (settings.appUpdateConfig && settings.appUpdateConfig.latestAppVersion) ? settings.appUpdateConfig : {
        latestAppVersion: '1.1.9',
        minAppVersion: '1.1.9',
        forceUpdate: true,
        updateNotes: 'New high-speed updates, curved screen layout fix, and performance enhancements are available! Please update now from Google Play Store.'
      },
      referralCampaignTarget: settings.referralCampaignTarget,
      referralCampaignReward: settings.referralCampaignReward,
      zinipayEnabled: settings.zinipayEnabled !== false
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await CartProduct.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Articles ────────────────────────────────────────────────────────────────
exports.getArticles = async (req, res) => {
  try {
    // Fetch articles + user status in parallel (saves one round-trip)
    const [articles, user] = await Promise.all([
      Article.find({ active: true }).sort({ createdAt: -1 }).lean(),
      User.findById(req.user._id).select('articleReadCount lastArticleReadDate').lean()
    ]);
    
    const now = new Date();
    let currentCount = user.articleReadCount || 0;
    if (user.lastArticleReadDate) {
      if (new Date(user.lastArticleReadDate).toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    res.json({ articles, dailyCount: currentCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Dashboard: All earning status in ONE request ───────────────────────────────
// Previously the frontend made 6-8 separate API calls on page load.
// This endpoint returns everything at once, reducing load time significantly.
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const user = await User.findById(userId).select(
      'lastDailyCheckin dailyCheckinCount lastVideoAd videoAdCount lastViewAdsAd viewAdsCount ' +
      'lastSpinDate spinCount lastScratchDate scratchCount lastQuizDate quizCount ' +
      'lastGkQuizDate lastMysteryBoxDate articleReadCount lastArticleReadDate ' +
      'balance points lifetimePoints'
    ).lean();

    const getCount = (countField, dateField, periodHours = 24) => {
      let count = user[countField] || 0;
      if (user[dateField]) {
        const last = new Date(user[dateField]);
        if (periodHours === 24) {
          if (last.toDateString() !== now.toDateString()) count = 0;
        } else {
          if ((now - last) >= periodHours * 60 * 60 * 1000) count = 0;
        }
      }
      return count;
    };

    res.json({
      dailyCheckin: {
        lastCheckin: user.lastDailyCheckin,
        count: getCount('dailyCheckinCount', 'lastDailyCheckin', 2) // 2-hour window
      },
      videoAd: {
        lastAd: user.lastVideoAd,
        count: getCount('videoAdCount', 'lastVideoAd')
      },
      viewAds: {
        lastAd: user.lastViewAdsAd,
        count: getCount('viewAdsCount', 'lastViewAdsAd')
      },
      spin: {
        lastSpinDate: user.lastSpinDate,
        count: getCount('spinCount', 'lastSpinDate')
      },
      scratch: {
        lastScratchDate: user.lastScratchDate,
        count: getCount('scratchCount', 'lastScratchDate')
      },
      quiz: {
        lastQuizDate: user.lastQuizDate,
        count: getCount('quizCount', 'lastQuizDate')
      },
      gkQuiz: {
        lastGkQuizDate: user.lastGkQuizDate,
        claimed: user.lastGkQuizDate ? new Date(user.lastGkQuizDate).toDateString() === now.toDateString() : false
      },
      mysteryBox: {
        lastMysteryBoxDate: user.lastMysteryBoxDate,
        claimed: user.lastMysteryBoxDate ? new Date(user.lastMysteryBoxDate).toDateString() === now.toDateString() : false
      },
      article: {
        count: getCount('articleReadCount', 'lastArticleReadDate')
      },
      wallet: {
        balance: user.balance,
        points: user.points,
        lifetimePoints: user.lifetimePoints
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


exports.claimArticleReward = async (req, res) => {
  try {
    const { articleId } = req.body;
    const user = await User.findById(req.user._id);
    const article = await Article.findById(articleId);

    if (!article) return res.status(404).json({ message: 'Article not found' });

    // Check if daily limit reached
    const now = new Date();
    let currentCount = user.articleReadCount || 0;
    if (user.lastArticleReadDate) {
      if (user.lastArticleReadDate.toDateString() !== now.toDateString()) {
        currentCount = 0;
      }
    }

    if (currentCount >= 5) {
      return res.status(400).json({ message: 'Daily article reading limit reached. Try again tomorrow.' });
    }

    const reward = article.coins || 15;
    processPoints(user, reward);
    
    user.articleReadCount = currentCount + 1;
    user.lastArticleReadDate = now;

    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'earning',
      amount: reward,
      description: `Read Article: ${article.title}`,
      status: 'completed'
    });

    createNotification(user._id, 'Knowledge Reward! 📚', `You earned ${reward} coins for reading "${article.title}"`, 'earning');

    res.json({
      message: `Rewarded ${reward} coins!`,
      balance: user.balance,
      points: user.points,
      count: user.articleReadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Weekly Missions ────────────────────────────────────────────────────────
exports.getWeeklyMissions = async (req, res) => {
  try {
    const Referral = require('../models/Referral');
    const missions = await WeeklyMission.find({ isActive: true }).sort({ createdAt: -1 });
    const completions = await MissionCompletion.find({ userId: req.user._id });
    
    const completedMissionIds = completions.map(c => c.missionId.toString());

    // Count user's VPN-activated referrals (for refer-type mission progress)
    const userCompletedReferrals = await Referral.countDocuments({
      referrerId: req.user._id,
      status: 'completed',
    });
    
    // Add completed flag and referral progress to missions for the current user
    const missionsWithStatus = missions.map(mission => {
      const missionObj = mission.toObject();
      const isCompleted = completedMissionIds.includes(mission._id.toString());
      
      // For refer-type missions, include progress info
      if (missionObj.missionType === 'refer') {
        return {
          ...missionObj,
          isCompleted,
          currentProgress: userCompletedReferrals,
          canClaim: !isCompleted && userCompletedReferrals >= (missionObj.targetCount || 5),
        };
      }
      
      return { ...missionObj, isCompleted, currentProgress: null, canClaim: !isCompleted };
    });

    res.json(missionsWithStatus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.completeWeeklyMission = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.user._id);
    
    const mission = await WeeklyMission.findById(id);
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    if (!mission.isActive) return res.status(400).json({ message: 'This mission is no longer active' });

    // Check if already completed
    const existingCompletion = await MissionCompletion.findOne({ userId: user._id, missionId: mission._id });
    if (existingCompletion) {
      return res.status(400).json({ message: 'You have already completed this mission' });
    }

    // Mark as completed
    await MissionCompletion.create({ userId: user._id, missionId: mission._id });

    // Grant reward
    const reward = mission.rewardCoins || 0;
    if (reward > 0) {
      processPoints(user, reward);
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: 'earning',
        amount: reward,
        description: `Weekly Mission: ${mission.title}`,
        status: 'completed'
      });

      createNotification(user._id, 'Mission Complete! 🎯', `You earned ${reward} points for completing "${mission.title}"`, 'earning');
    }

    res.json({
      message: `Mission completed! Rewarded ${reward} coins.`,
      balance: user.balance,
      points: user.points,
      missionId: mission._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Level tiers for coin-based level upgrades
const LEVEL_TIERS = [
  { level: 1, name: 'Bronze', cost: 0, icon: '🥉', title: 'Bronze Member' },
  { level: 2, name: 'Silver', cost: 500, icon: '🥈', title: 'Silver VIP' },
  { level: 3, name: 'Gold', cost: 1500, icon: '🥇', title: 'Gold VIP' },
  { level: 4, name: 'Platinum', cost: 3500, icon: '💎', title: 'Platinum Elite' },
  { level: 5, name: 'Diamond', cost: 7500, icon: '👑', title: 'Diamond Legend' }
];

// @desc    Upgrade user level using Coins
// @route   POST /api/earning/upgrade-level
// @access  Private
exports.upgradeLevel = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentLevel = user.level || 1;
    if (currentLevel >= 5) {
      return res.status(400).json({ message: 'You have already reached the maximum Level 5 (Diamond Legend)!' });
    }

    const nextTier = LEVEL_TIERS.find(t => t.level === currentLevel + 1);
    if (!nextTier) {
      return res.status(400).json({ message: 'Invalid next level tier' });
    }

    const currentPoints = user.points || 0;
    if (currentPoints < nextTier.cost) {
      return res.status(400).json({
        message: `Insufficient Coins! You need ${nextTier.cost} Coins to upgrade to Level ${nextTier.level} (${nextTier.name}). You currently have ${currentPoints} Coins.`
      });
    }

    user.points -= nextTier.cost;
    user.level = nextTier.level;
    user.levelName = nextTier.name;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'spending',
      amount: nextTier.cost,
      description: `Level Upgrade: Upgraded to Level ${nextTier.level} (${nextTier.name})`,
      status: 'completed'
    });

    createNotification(
      user._id,
      `Level Upgraded! ${nextTier.icon}`,
      `Congratulations! You have successfully upgraded to Level ${nextTier.level} (${nextTier.name}). Enjoy your exclusive VIP perks!`,
      'level_up'
    );

    res.json({
      message: `Congratulations! Upgraded to Level ${nextTier.level} (${nextTier.name})!`,
      level: user.level,
      levelName: user.levelName,
      points: user.points
    });
  } catch (error) {
    console.error('Level upgrade error:', error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
