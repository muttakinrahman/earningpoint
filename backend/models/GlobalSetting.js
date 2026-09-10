const mongoose = require('mongoose');

const GlobalSettingSchema = new mongoose.Schema({
  configKey: {
    type: String,
    required: true,
    unique: true,
    default: 'main_config'
  },
  premiumIpPrice: {
    type: Number,
    required: true,
    default: 600
  },
  premiumIpDuration: {
    type: String,
    required: true,
    default: '30 Days'
  },
  bkashNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  nagadNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  rocketNumber: {
    type: String,
    required: true,
    default: '01700-000000'
  },
  // New: Native Ad Click Configuration
  nativeAdsConfig: {
    type: [{
      id: String,
      name: String,
      icon: String, // e.g., 'Tv', 'Target', 'Zap', 'Video', 'Radio'
      coins: Number,
      quizType: { type: String, enum: ['math', 'simple'], default: 'math' },
      isActive: { type: Boolean, default: true }
    }],
    default: [
      { id: 'ad-1', name: 'Native Ad Click Ad 1', icon: 'Tv', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-2', name: 'Native Ad Click Ad 2', icon: 'Video', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-3', name: 'Native Ad Click Ad 3', icon: 'Radio', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-4', name: 'Native Ad Click Ad 4', icon: 'Target', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-5', name: 'Native Ad Click Ad 5', icon: 'Zap', coins: 10, quizType: 'math', isActive: true }
    ]
  },
  // New: Fortune Wheel Configuration
  fortuneWheelConfig: {
    coins: { type: [Number], default: [5, 10, 15, 20, 25, 30, 35, 50] },
    adsPerSpin: { type: Number, default: 1 },
    dailyLimit: { type: Number, default: 10 }
  },
  // Promotional Banner Configuration (Legacy)
  promoBanner: {
    imageUrl: { type: String, default: '' },
    linkUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: false }
  },
  // Multi-Banner Configuration
  promoBanners: {
    type: [{
      imageUrl: { type: String, default: '' },
      linkUrl: { type: String, default: '' },
      isActive: { type: Boolean, default: false }
    }],
    default: [
      { imageUrl: '', linkUrl: '', isActive: false },
      { imageUrl: '', linkUrl: '', isActive: false },
      { imageUrl: '', linkUrl: '', isActive: false }
    ]
  },
  premiumIpPackages: {
    type: [{
      id: String,
      price: Number,
      duration: String, // e.g. "30 Days"
      freeDays: String, // e.g. "+7 Days free"
      offTag: String,
      servers: [String], // e.g. ['USA', 'Germany', 'Canada', 'UK', 'Netherlands']
      isActive: { type: Boolean, default: true }
    }],
    default: [
      { id: '1-month', price: 600, duration: '1 Month', freeDays: '+7 Days free', offTag: '', servers: ['USA', 'Germany', 'Canada'], isActive: true },
      { id: '3-month', price: 1300, duration: '3 Month', freeDays: '+15 Days free', offTag: '', servers: ['USA', 'Germany', 'Canada', 'UK'], isActive: true },
      { id: '6-month', price: 2200, duration: '6 Month', freeDays: '+1 Month free', offTag: '', servers: ['USA', 'Germany', 'Canada', 'UK', 'Netherlands'], isActive: true },
      { id: '1-year', price: 4200, duration: '1 Year', freeDays: '+2 Month free', offTag: '15% OFF', servers: ['USA', 'Germany', 'Canada', 'UK', 'Netherlands', 'Singapore', 'Japan'], isActive: true }
    ]
  },
  admobConfig: {
    appId: { type: String, default: 'ca-app-pub-2974645883080760~7728677397' },
    bannerAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/1360864845' },
    interstitialAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/8840004811' },
    rewardedAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/8856211482' },
    rewardedInterstitialAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/3517013065' },
    appOpenAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/7526923147' },
    nativeAdUnitId: { type: String, default: 'ca-app-pub-2974645883080760/4061004201' },
    showAds: { type: Boolean, default: true },
    useTestAds: { type: Boolean, default: false }
  },
  // App Version & Force Update Configuration
  appUpdateConfig: {
    latestAppVersion: { type: String, default: '1.1.9' },
    minAppVersion: { type: String, default: '1.1.9' },
    forceUpdate: { type: Boolean, default: false },
    updateNotes: { type: String, default: 'New features, performance enhancements & bug fixes are available on Google Play Store!' }
  },
  // Referral Campaign Configuration
  referralCampaignTarget: {
    type: Number,
    required: true,
    default: 5
  },
  referralCampaignReward: {
    type: Number,
    required: true,
    default: 300
  },
  // ZiniPay Payment Gateway Configuration
  zinipayApiKey: {
    type: String,
    default: 'sandbox_test_8f4c9a2e7b31'
  },
  zinipayBaseUrl: {
    type: String,
    default: 'https://api.zinipay.com'
  },
  zinipayEnabled: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('GlobalSetting', GlobalSettingSchema);
