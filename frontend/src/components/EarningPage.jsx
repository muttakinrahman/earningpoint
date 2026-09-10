import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AdMobService } from '../utils/admob';
import { Capacitor } from '@capacitor/core';
import { API_BASE } from '../config';
import MultiAdViewPage from './MultiAdViewPage';
import BannerAd from './BannerAd';
import {
  DailyCheckinIcon,
  MysteryBoxIcon,
  WeeklyMissionsIcon,
  ReferEarnIcon,
  WalletIcon,
  HistoryIcon,
  TutorialIcon,
  ArticlesIcon,
  VideosIcon,
  GamesIcon,
  FortuneWheelIcon,
  ViewAdsIcon,
  ScratchCardIcon,
  QuizzesIcon,
  DailyQuizIcon,
  MathQuizIcon,
  BinaryQuizIcon,
  WordQuizIcon,
  GkQuizIcon,
  YouTubeIcon,
  TikTokIcon,
  FacebookIcon,
  RewardVideoIcon,
  InterstitialAdIcon,
  NativeAdClickIcon,
  BonusAdIcon,
  HourlyAdIcon,
  MetaIcon,
  SurpriseBonusIcon,
  RikSurveyIcon,
  WebRegIcon,
  EmailSubmitIcon,
  AppInstallIcon,
  AffiliateMarketIcon,
  TrialSignupIcon
} from './EarningIcons';
import { 
  Check, 
  ArrowLeft,
  ArrowRight, 
  ChevronRight, 
  Clock, 
  Medal, 
  Wallet, 
  Shield, 
  Globe, 
  Gift, 
  Flame, 
  Film, 
  X, 
  Crown, 
  AlertCircle,
  History,
  TrendingUp,
  Star,
  Calculator, 
  Binary, 
  Type, 
  HelpCircle,
  Users,
  CalendarCheck,
  Newspaper, 
  Video, 
  BookOpen,
  Aperture, 
  Search,
  ChevronDown, 
  ChevronUp, 
  Menu, 
  Home, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Radio, 
  Tv,
  RefreshCw,
  Gamepad2,
  MonitorPlay,
  Music2,
  Zap,
  Pointer,
  Hash,
  Facebook,
  Youtube,
  Mail,
  Download,
  ClipboardList,
  ShoppingBag,
  Key,
  Lock
} from 'lucide-react';

const gkQuizDB = [
  { id: 1, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-FIFA-World-Cup_%28cropped%29.jpg', answer: 'Lionel Messi', options: ['Lionel Messi', 'Cristiano Ronaldo', 'Neymar Jr', 'Angel Di Maria'] },
  { id: 2, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg', answer: 'Cristiano Ronaldo', options: ['Lionel Messi', 'Cristiano Ronaldo', 'Gareth Bale', 'Karim Benzema'] },
  { id: 3, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Virat_Kohli_in_PMO_New_Delhi.jpg/500px-Virat_Kohli_in_PMO_New_Delhi.jpg', answer: 'Virat Kohli', options: ['Virat Kohli', 'MS Dhoni', 'Rohit Sharma', 'Steve Smith'] },
  { id: 4, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg/500px-MS_Dhoni_%28Prabhav_%2723_-_RiGI_2023%29.jpg', answer: 'MS Dhoni', options: ['Virat Kohli', 'MS Dhoni', 'Sachin Tendulkar', 'Gautam Gambhir'] },
  { id: 5, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/b/bb/Neymar_Jr._with_Al_Hilal%2C_3_October_2023_-_03_%28cropped%29.jpg', answer: 'Neymar Jr', options: ['Lionel Messi', 'Neymar Jr', 'Vinicius Jr', 'Rodrygo'] },
  { id: 6, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg/500px-Prime_Minister_Of_Bharat_Shri_Narendra_Damodardas_Modi_with_Shri_Rohit_Gurunath_Sharma_%28Cropped%29.jpg', answer: 'Rohit Sharma', options: ['Shikhar Dhawan', 'KL Rahul', 'Rohit Sharma', 'Hardik Pandya'] },
  { id: 7, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Shakib_Al_Hasan_%284%29_%28cropped%29.jpg/500px-Shakib_Al_Hasan_%284%29_%28cropped%29.jpg', answer: 'Shakib Al Hasan', options: ['Mashrafe Mortaza', 'Tamim Iqbal', 'Shakib Al Hasan', 'Mushfiqur Rahim'] },
  { id: 8, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg/500px-The_cricket_legend_Sachin_Tendulkar_at_the_Oval_Maidan_in_Mumbai_During_the_Duke_and_Duchess_of_Cambridge_Visit%2826271019082%29.jpg', answer: 'Sachin Tendulkar', options: ['Virender Sehwag', 'Sachin Tendulkar', 'Rahul Dravid', 'VVS Laxman'] },
  { id: 9, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg/500px-Ofrenda_de_la_Liga_y_la_Champions-57-L.Mill%C3%A1n_%2852109310843%29_%28Luka_Modri%C4%87%29.jpg', answer: 'Luka Modric', options: ['Toni Kroos', 'Casemiro', 'Luka Modric', 'Federico Valverde'] },
  { id: 10, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg/500px-Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg', answer: 'Kylian Mbappe', options: ['Ousmane Dembele', 'Kylian Mbappe', 'Antoine Griezmann', 'Olivier Giroud'] },
  { id: 11, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Babar_Azam_%28cropped%29.jpg/500px-Babar_Azam_%28cropped%29.jpg', answer: 'Babar Azam', options: ['Babar Azam', 'Mohammad Rizwan', 'Shaheen Afridi', 'Fakhar Zaman'] },
  { id: 12, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Kevin_De_Bruyne_in_2019.jpg/500px-Kevin_De_Bruyne_in_2019.jpg', answer: 'Kevin De Bruyne', options: ['Erling Haaland', 'Phil Foden', 'Bernardo Silva', 'Kevin De Bruyne'] },
  { id: 13, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/A_small_cup_of_coffee.JPG/640px-A_small_cup_of_coffee.JPG', answer: 'Coffee', options: ['Tea', 'Coffee', 'Cocoa', 'Espresso'] },
  { id: 14, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/640px-Camponotus_flavomarginatus_ant.jpg', answer: 'Ant', options: ['Bee', 'Wasp', 'Ant', 'Beetle'] },
  { id: 15, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dog_Breeds.jpg/640px-Dog_Breeds.jpg', answer: 'Dog', options: ['Wolf', 'Fox', 'Cat', 'Dog'] },
  { id: 16, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/640px-Cat03.jpg', answer: 'Cat', options: ['Cat', 'Rabbit', 'Fox', 'Ferret'] },
  { id: 17, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/640px-24701-nature-natural-beauty.jpg', answer: 'Mountain', options: ['Valley', 'Hill', 'Mountain', 'Cliff'] },
  { id: 18, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Empire_State_Building_%28aerial_view%29.jpg/500px-Empire_State_Building_%28aerial_view%29.jpg', answer: 'Empire State Building', options: ['Burj Khalifa', 'Empire State Building', 'Eiffel Tower', 'Big Ben'] },
  { id: 19, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Eiffel_Tower%2C_Paris%2C_01_October_2010.jpg/500px-Eiffel_Tower%2C_Paris%2C_01_October_2010.jpg', answer: 'Eiffel Tower', options: ['Burj Khalifa', 'Empire State Building', 'Eiffel Tower', 'Big Ben'] },
  { id: 20, image: 'https://wsrv.nl/?url=https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/640px-Colosseo_2020.jpg', answer: 'Colosseum', options: ['Parthenon', 'Colosseum', 'Pantheon', 'Acropolis'] },
];


import { countries } from '../utils/countries';
import PullToRefresh from './PullToRefresh';

const ipPackages = [
  { id: 'month-1', name: '1 Month', price: 600, freeInfo: '7 Days free', label: '1 Month (+7 Days free)' },
  { id: 'month-3', name: '3 Month', price: 1300, freeInfo: '15 Days free', label: '3 Months (+15 Days free)' },
  { id: 'month-6', name: '6 Month', price: 2200, freeInfo: '1 Month free', label: '6 Months (+1 Month free)' },
  { id: 'year-1', name: '1 Year', price: 4200, freeInfo: '2 Month free', bestValue: true, label: '1 Year (+2 Months free)' },
];




const BigAdBanner = ({ globalSettings }) => {
  return <BannerAd size="big" globalSettings={globalSettings} />;
};


const EarningPage = ({ onReferralsClick, setActiveTab }) => {
  const [balance, setBalance] = React.useState(0);
  const [coins, setCoins] = React.useState(0);
  const [lifetimeCoins, setLifetimeCoins] = React.useState(0);
  const [showCoinsDetails, setShowCoinsDetails] = React.useState(false);
  const [showLevelView, setShowLevelView] = React.useState(false);
  const [activeEarningTab, setActiveEarningTab] = React.useState('rewards');
  const isAdLoading = useRef(false);

  const [toast, setToast] = React.useState({ visible: false, message: '', type: 'success' });
  const [refreshing, setRefreshing] = React.useState(false);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const [withdrawAmount, setWithdrawAmount] = React.useState('');
  const [withdrawPhone, setWithdrawPhone] = React.useState('');
  const [withdrawMethod, setWithdrawMethod] = React.useState('');
  const [withdrawLoading, setWithdrawLoading] = React.useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = React.useState(false);
  const [withdrawHistory, setWithdrawHistory] = React.useState([]);
  const [globalWithdrawals, setGlobalWithdrawals] = React.useState([]);

  const blurPhone = (phone = '') => {
    if (!phone || phone.length < 6) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  };

  const demoWithdrawHistory = [
    { id: 1, name: 'Sayed Muttakin', phone: '01711234567', amount: 1500, method: 'bKash', date: '2025-03-28', status: 'completed' },
    { id: 2, name: 'Rahim Uddin', phone: '01819876543', amount: 2000, method: 'Nagad', date: '2025-03-25', status: 'completed' },
    { id: 3, name: 'Karim Hossain', phone: '01612345678', amount: 1000, method: 'Rocket', date: '2025-03-22', status: 'completed' },
    { id: 4, name: 'Al Hasan', phone: '01912345678', amount: 500, method: 'bKash', date: '2025-03-20', status: 'completed' },
    { id: 5, name: 'Jewel Mia', phone: '01512345678', amount: 2500, method: 'Nagad', date: '2025-03-18', status: 'completed' },
    { id: 6, name: 'Ripon Khan', phone: '01722334455', amount: 800, method: 'Rocket', date: '2025-03-15', status: 'completed' },
    { id: 7, name: 'Monir Hossain', phone: '01812345678', amount: 1200, method: 'bKash', date: '2025-03-12', status: 'completed' },
    { id: 8, name: 'Sobuj Sarker', phone: '01612344321', amount: 3500, method: 'Nagad', date: '2025-03-10', status: 'completed' },
    { id: 9, name: 'Tonmoy Roy', phone: '01987654321', amount: 700, method: 'Rocket', date: '2025-03-08', status: 'completed' },
    { id: 10, name: 'Parvez Hasan', phone: '01711223344', amount: 1800, method: 'bKash', date: '2025-03-05', status: 'completed' },
  ];

  const displayWithdrawals = globalWithdrawals.length > 0 ? globalWithdrawals : (withdrawHistory.length > 0 ? withdrawHistory : demoWithdrawHistory);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1000) {
      showToast('Minimum withdrawal amount is ৳1,000', 'error');
      return;
    }
    if (!withdrawPhone || withdrawPhone.length < 11) {
      showToast('Please enter a valid phone number', 'error');
      return;
    }
    if (!withdrawMethod) {
      showToast('Please select a payment method', 'error');
      return;
    }
    if (balance < parseFloat(withdrawAmount)) {
      showToast('Insufficient balance', 'error');
      return;
    }
    setWithdrawLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: parseFloat(withdrawAmount), phone: withdrawPhone, method: withdrawMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        setWithdrawSuccess(true);
        setBalance(data.balance ?? balance);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const newWithdrawal = {
          id: Date.now(),
          name: user.name || 'User',
          phone: withdrawPhone,
          amount: parseFloat(withdrawAmount),
          method: withdrawMethod.charAt(0).toUpperCase() + withdrawMethod.slice(1),
          date: new Date().toISOString().split('T')[0],
          status: 'pending'
        };
        setWithdrawHistory(prev => [newWithdrawal, ...prev]);
        showToast('Withdrawal request submitted successfully!', 'success');
        setWithdrawAmount('');
        setWithdrawPhone('');
        setWithdrawMethod('');
        setTimeout(() => setWithdrawSuccess(false), 5000);
      } else {
        showToast(data.message || 'Withdrawal failed. Try again.', 'error');
      }
    } catch (_) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setWithdrawLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const withdrawMethods = useMemo(() => [
    { id: 'bkash', name: 'bKash', logo: '/logos/bkash.png', available: true },
    { id: 'nagad', name: 'Nagad', logo: '/logos/nagad.png', available: true },
    { id: 'rocket', name: 'Rocket', logo: '/logos/rocket.png', available: false },
    { id: 'upay', name: 'Upay', logo: 'https://freelogopng.com/images/all_img/1656235105upay-logo.png', available: false },
    { id: 'binance', name: 'Binance', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.svg', available: false },
    { id: 'bybit', name: 'Bybit', logo: 'https://seeklogo.com/images/B/bybit-logo-4C31FD6A08-seeklogo.com.png', available: false },
    { id: 'paypal', name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', available: false },
    { id: 'card', name: 'Bank Card', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg', available: false },
  ], []);

  const [showCheckinView, setShowCheckinView] = React.useState(false);

  const [showMysteryBoxView, setShowMysteryBoxView] = React.useState(false);
  const [mysteryBoxStatus, setMysteryBoxStatus] = React.useState({ lastClaimDate: null, claimedToday: false });
  const [mysteryBoxReward, setMysteryBoxReward] = React.useState(null);
  const [isOpeningBox, setIsOpeningBox] = React.useState(false);

  const [showWeeklyMissionsView, setShowWeeklyMissionsView] = React.useState(false);
  const [weeklyMissions, setWeeklyMissions] = React.useState([]);

  const [showAdOverlay, setShowAdOverlay] = React.useState(false);
  const [adCountdown, setAdCountdown] = React.useState(40);
  const [canCloseAd, setCanCloseAd] = React.useState(false);
  const [checkinStatus, setCheckinStatus] = React.useState({ lastCheckin: null, count: 0 });
  const [isLoading, setIsLoading] = React.useState(false);
  const [adType, setAdType] = React.useState('daily');

  const [showVideoView, setShowVideoView] = React.useState(false);
  const [videoStatus, setVideoStatus] = React.useState({ lastVideoDate: null, count: 0 });
  const [viewAdsStatus, setViewAdsStatus] = React.useState({ lastAdDate: null, count: 0 });
  const [videoType, setVideoType] = React.useState('video');

  const [showWheelView, setShowWheelView] = React.useState(false);
  const [wheelStatus, setWheelStatus] = React.useState({ lastSpinDate: null, count: 0 });
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [spinReward, setSpinReward] = React.useState(null);

  const [showScratchView, setShowScratchView] = React.useState(false);
  const [scratchStatus, setScratchStatus] = React.useState({ lastScratchDate: null, count: 0 });
  const [activeScratchCard, setActiveScratchCard] = React.useState(null);

  const [showGamesView, setShowGamesView] = React.useState(false);

  const [showQuizSelection, setShowQuizSelection] = React.useState(false);
  const [showQuizView, setShowQuizView] = React.useState(false);
  const [quizType, setQuizType] = React.useState('math');
  const [quizStatus, setQuizStatus] = React.useState({ lastQuizDate: null, count: 0 });
  const [quizQuestion, setQuizQuestion] = React.useState(null);
  const [quizSelected, setQuizSelected] = React.useState(null);
  const [quizAnswered, setQuizAnswered] = React.useState(false);
  const [quizScore, setQuizScore] = React.useState(0);
  const [quizTimer, setQuizTimer] = React.useState(30);
  const [quizTimerActive, setQuizTimerActive] = React.useState(false);

  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [premiumExpiryDate, setPremiumExpiryDate] = React.useState(null);
  const [premiumCountry, setPremiumCountry] = React.useState('');
  const [premiumPackageName, setPremiumPackageName] = React.useState('');
  const [searchCountry, setSearchCountry] = React.useState('');

  const [showGkQuizView, setShowGkQuizView] = React.useState(false);
  const [gkQuizQuestions, setGkQuizQuestions] = React.useState([]);
  const [currentGkIndex, setCurrentGkIndex] = React.useState(0);
  const [gkQuizScore, setGkQuizScore] = React.useState(0);

  // Featured options shown at top (Daily Checkin, Mystery Box, Refer)
  const mainOptions = useMemo(() => [
    {
      id: 'feat-checkin',
      name: 'Daily Checkin',
      icon: <DailyCheckinIcon className="w-6 h-6" />,
      coins: 5,
      color: 'from-emerald-400 to-teal-400',
      action: () => setShowCheckinView(true)
    },
    {
      id: 'feat-mystery',
      name: 'Mystery Box',
      icon: <MysteryBoxIcon className="w-6 h-6" />,
      coins: '1-45',
      color: 'from-rose-400 to-pink-500',
      action: () => setShowMysteryBoxView(true)
    },
    {
      id: 'feat-weekly',
      name: 'Weekly Missions',
      icon: <WeeklyMissionsIcon className="w-6 h-6" />,
      coins: 'Extra',
      color: 'from-blue-400 to-indigo-500',
      action: () => { setShowWeeklyMissionsView(true); fetchWeeklyMissions(); }
    },
    {
      id: 'feat-refer',
      name: 'Refer & Earn',
      icon: <ReferEarnIcon className="w-6 h-6" />,
      coins: 50,
      color: 'from-amber-400 to-orange-500',
      action: () => { if (typeof onReferralsClick === 'function') onReferralsClick(); else if (typeof setActiveTab === 'function') setActiveTab('referrals'); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [onReferralsClick, setActiveTab]);

  const rewardOptions = useMemo(() => [
    { id: 'reward-wallet', name: 'Wallet', icon: <WalletIcon className="w-7 h-7" />, color: 'from-blue-500 to-indigo-600', action: () => setActiveEarningTab('wallet') },
    { id: 'reward-history', name: 'History', icon: <HistoryIcon className="w-7 h-7" />, color: 'from-purple-500 to-pink-600', action: () => setActiveEarningTab('history') },
    { id: 'reward-tutorial', name: 'Tutorial', icon: <TutorialIcon className="w-7 h-7" />, color: 'from-emerald-500 to-teal-600', action: () => setActiveEarningTab('tutorial') },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);
  const [gkSelected, setGkSelected] = React.useState(null);
  const [gkAnswered, setGkAnswered] = React.useState(false);

  const [showArticleView, setShowArticleView] = React.useState(false);
  const [articles, setArticles] = useState([]);
  const [currentArticle, setCurrentArticle] = useState(null);
  const [articleReadingTime, setArticleReadingTime] = useState(0);
  const [isReadingStarted, setIsReadingStarted] = useState(false);
  const [articleReadCount, setArticleReadCount] = useState(0);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/articles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setArticleReadCount(data.dailyCount || 0);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    }
  };
  const [articleStep, setArticleStep] = React.useState(1);
  const [showArticleReader, setShowArticleReader] = React.useState(false);
  const [showArticleListView, setShowArticleListView] = React.useState(false);

  const [showInterstitialAd, setShowInterstitialAd] = React.useState(false);
  const [showNativeAd, setShowNativeAd] = React.useState(false);
  const [showOfferwallAd, setShowOfferwallAd] = React.useState(false);
  const [currentAdInfo, setCurrentAdInfo] = React.useState({ name: '', type: '', coins: 0, time: 0 });

  const [globalSettings, setGlobalSettings] = React.useState({
    premiumIpPrice: 600,
    premiumIpDuration: '30 Days',
    bkashNumber: '01700-000000',
    nagadNumber: '01700-000000',
    rocketNumber: '01700-000000',
    premiumIpPackages: [],
    referralCampaignTarget: 5,
    referralCampaignReward: 300,
    nativeAdsConfig: [
      { id: 'ad-1', name: 'Native Ad Click Ad 1', icon: 'Tv', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-2', name: 'Native Ad Click Ad 2', icon: 'Video', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-3', name: 'Native Ad Click Ad 3', icon: 'Radio', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-4', name: 'Native Ad Click Ad 4', icon: 'Target', coins: 10, quizType: 'math', isActive: true },
      { id: 'ad-5', name: 'Native Ad Click Ad 5', icon: 'Zap', coins: 10, quizType: 'math', isActive: true }
    ],
    fortuneWheelConfig: {
      coins: [5, 10, 15, 20, 25, 30, 35, 50],
      adsPerSpin: 1,
      dailyLimit: 10
    },
    promoBanner: { imageUrl: '', linkUrl: '', isActive: false },
    promoBanners: [],
    admobConfig: {
      bannerAdUnitId: '',
      interstitialAdUnitId: '',
      rewardedAdUnitId: '',
      appOpenAdUnitId: ''
    }
  });

  const fetchGlobalSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/earning/settings`);
      const data = await res.json();
      if (res.ok && data) {
        if (data.admobConfig) {
          AdMobService.setConfig(data.admobConfig);
        }
        setGlobalSettings(prev => ({
          ...prev,
          premiumIpPrice: data.premiumIpPrice || 600,
          premiumIpDuration: data.premiumIpDuration || '30 Days',
          bkashNumber: data.bkashNumber || '01700-000000',
          nagadNumber: data.nagadNumber || '01700-000000',
          rocketNumber: data.rocketNumber || '01700-000000',
          referralCampaignTarget: data.referralCampaignTarget || 5,
          referralCampaignReward: data.referralCampaignReward || 300,
          premiumIpPackages: data.premiumIpPackages || [],
          nativeAdsConfig: data.nativeAdsConfig || prev.nativeAdsConfig,
          fortuneWheelConfig: data.fortuneWheelConfig ? {
            ...prev.fortuneWheelConfig,
            ...data.fortuneWheelConfig,
            // Ensure coins array is always valid
            coins: (Array.isArray(data.fortuneWheelConfig.coins) && data.fortuneWheelConfig.coins.length > 0)
              ? data.fortuneWheelConfig.coins
              : prev.fortuneWheelConfig.coins
          } : prev.fortuneWheelConfig,
          promoBanner: data.promoBanner || prev.promoBanner,
          promoBanners: data.promoBanners || prev.promoBanners,
          admobConfig: data.admobConfig || prev.admobConfig
        }));
      }
    } catch (error) {
      console.error('Error fetching global settings:', error);
    }
  };



  const [showIntroScreen, setShowIntroScreen] = React.useState(false);
  const [introSection, setIntroSection] = React.useState(null);

  const [activePromoBannerIndex, setActivePromoBannerIndex] = React.useState(0);
  
  const activeBanners = useMemo(() => {
    const banners = globalSettings?.promoBanners?.filter(b => b.isActive && b.imageUrl) || [];
    if (banners.length > 0) return banners;
    if (globalSettings?.promoBanner?.isActive && globalSettings?.promoBanner?.imageUrl) {
      return [globalSettings.promoBanner];
    }
    return [];
  }, [globalSettings?.promoBanners, globalSettings?.promoBanner]);

  const activeBannersLengthRef = React.useRef(activeBanners.length);
  activeBannersLengthRef.current = activeBanners.length;

  React.useEffect(() => {
    if (activeBannersLengthRef.current <= 1) return;
    const interval = setInterval(() => {
      if (activeBannersLengthRef.current > 1) {
        setActivePromoBannerIndex(prev => {
          const nextIndex = (prev + 1) % activeBannersLengthRef.current;
          return Number.isNaN(nextIndex) ? 0 : nextIndex;
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBanners.length]);

  const handleBannerClick = useCallback((linkUrl) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith('http')) {
      window.open(linkUrl, '_blank');
    } else {
      const tabName = linkUrl.replace('/', '');
      if (tabName && setActiveTab) {
         const formattedTab = tabName.charAt(0).toUpperCase() + tabName.slice(1);
         setActiveTab(formattedTab);
      }
    }
  }, [setActiveTab]);

  const [showMultiAdView, setShowMultiAdView] = React.useState(false);
  const [multiAdConfig, setMultiAdConfig] = React.useState(null);

  const getMultiAdCount = useCallback((key) => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(`multi_ad_${key}`) || '{"date":"","count":0}');
    if (stored.date !== today) return 0;
    return stored.count;
  }, []);

  const incrementMultiAdCount = useCallback((key) => {
    const today = new Date().toDateString();
    const newCount = getMultiAdCount(key) + 1;
    localStorage.setItem(`multi_ad_${key}`, JSON.stringify({ date: today, count: newCount }));
    return newCount;
  }, [getMultiAdCount]);

  const [showPremiumIPView, setShowPremiumIPView] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState(null);
  const [ipStep, setIpStep] = React.useState(1);
  const [selectedCountry, setSelectedCountry] = React.useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState('zinipay');
  const [transactionId, setTransactionId] = React.useState('');
  const [ipSubmitting, setIpSubmitting] = React.useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = React.useState(false);
  const [vpnOrderSuccess, setVpnOrderSuccess] = React.useState(false);
  const [vpnOrderDetails, setVpnOrderDetails] = React.useState(null);
  const [showVpnActivated, setShowVpnActivated] = React.useState(false);
  const [vpnActivatedShown, setVpnActivatedShown] = React.useState(() => localStorage.getItem('vpnActivatedShown') === 'true');
  const [showPremiumFeaturesWelcome, setShowPremiumFeaturesWelcome] = React.useState(false);
  const [showLockPopup, setShowLockPopup] = React.useState(false);
  const [lockPopupLevel, setLockPopupLevel] = React.useState(1);

  // Removed duplicate timer effect — single timer is at line ~728


  const [introItem, setIntroItem] = React.useState(null);

  const fetchBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance || 0);
        setCoins(data.coins || 0);
        setLifetimeCoins(data.lifetimeCoins || 0);
        setIsPremium(data.isPremium || false);
        setPremiumExpiryDate(data.premiumExpiry || null);
        setPremiumCountry(data.premiumCountry || '');
        setPremiumPackageName(data.premiumPackageName || '');
      }
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWithdrawHistory(data.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
    }
  };

  const fetchGlobalWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/all-withdrawals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGlobalWithdrawals(data.withdrawals || []);
      }
    } catch (err) {
      console.error('Failed to fetch all withdrawals:', err);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchBalance(),
        fetchCheckinStatus(),
        fetchMysteryBoxStatus(),
        fetchWeeklyMissions(),
        fetchVideoStatus(),
        fetchWheelStatus(),
        fetchScratchStatus(),
        fetchQuizStatus(),
        fetchGlobalSettings()
      ]);
      showToast('Data refreshed successfully!', 'success');
    } catch (error) {
      console.error('Refresh failed:', error);
      showToast('Refresh failed', 'error');
    } finally {
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  const fetchWeeklyMissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/weekly-missions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWeeklyMissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch weekly missions:', err);
    }
  };

  // ── Single dashboard fetch replaces 7 individual status calls ────────────────────────
  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = await response.json();

      // Populate all status states from single response
      if (data.dailyCheckin) setCheckinStatus({ lastCheckin: data.dailyCheckin.lastCheckin, count: data.dailyCheckin.count });
      if (data.mysteryBox) setMysteryBoxStatus({ lastMysteryBoxDate: data.mysteryBox.lastMysteryBoxDate, claimed: data.mysteryBox.claimed });
      if (data.videoAd) setVideoStatus({ lastVideoDate: data.videoAd.lastAd, count: data.videoAd.count });
      if (data.viewAds) setViewAdsStatus({ lastAdDate: data.viewAds.lastAd, count: data.viewAds.count });
      if (data.spin) setWheelStatus({ lastSpinDate: data.spin.lastSpinDate, count: data.spin.count });
      if (data.scratch) setScratchStatus({ lastScratchDate: data.scratch.lastScratchDate, count: data.scratch.count });
      if (data.quiz) setQuizStatus({ lastQuizDate: data.quiz.lastQuizDate, count: data.quiz.count });
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
    }
  };

  // Keep individual fetchers for post-action refresh (after claiming rewards)
  const fetchMysteryBoxStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/mystery-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMysteryBoxStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch mystery box status:', err);
    }
  };

  const fetchCheckinStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/daily-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCheckinStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch checkin status:', err);
    }
  };

  const fetchVideoStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const [videoResp, viewAdsResp] = await Promise.all([
        fetch(`${API_BASE}/api/earning/video-status?type=video`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/earning/video-status?type=view_ads`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [videoData, viewAdsData] = await Promise.all([videoResp.json(), viewAdsResp.json()]);
      if (videoResp.ok) setVideoStatus({ lastVideoDate: videoData.lastAd, count: videoData.count });
      if (viewAdsResp.ok) setViewAdsStatus({ lastAdDate: viewAdsData.lastAd, count: viewAdsData.count });
    } catch (err) {
      console.error('Failed to fetch video status:', err);
    }
  };

  const fetchWheelStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/spin-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setWheelStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch spin status:', err);
    }
  };

  const [showStatusOverlay, setShowStatusOverlay] = React.useState(false);
  const [statusData, setStatusData] = React.useState({ name: '', type: 'upcoming' });

  const handleStatusClick = useCallback((name, type) => {
    setStatusData({ name, type });
    setShowStatusOverlay(true);
    AdMobService.showInterstitial();
  }, []);

  React.useEffect(() => {
    // 🚀 Single dashboard call replaces 7 individual status API calls
    fetchDashboard();
    fetchBalance();
    fetchArticles();
    fetchGlobalSettings();
    fetchWithdrawHistory();
    fetchGlobalWithdrawals();
    fetchWeeklyMissions();
    AdMobService.preloadAll();

    // Check if returned from ZiniPay gateway redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_status') === 'completed') {
      showToast('Payment Verified! Your VPN subscription is now active. ✨', 'success');
      fetchBalance();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (urlParams.get('payment_status') === 'error') {
      showToast('Payment was cancelled or could not be verified.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  React.useEffect(() => {
    const handleHardwareBack = (e) => {
      if (showArticleReader) {
        e.preventDefault();
        setShowArticleReader(false);
        setIsReadingStarted(false);
      } else if (showArticleListView) {
        e.preventDefault();
        setShowArticleListView(false);
      } else if (showWheelView) {
        e.preventDefault();
        setShowWheelView(false);
      } else if (showScratchView) {
        e.preventDefault();
        setShowScratchView(false);
      } else if (showGamesView) {
        e.preventDefault();
        setShowGamesView(false);
      } else if (showQuizView) {
        e.preventDefault();
        setShowQuizView(false);
        setQuizTimerActive(false);
      } else if (showQuizSelection) {
        e.preventDefault();
        setShowQuizSelection(false);
      } else if (showCheckinView) {
        e.preventDefault();
        setShowCheckinView(false);
      } else if (showMysteryBoxView) {
        e.preventDefault();
        setShowMysteryBoxView(false);
      } else if (showWeeklyMissionsView) {
        e.preventDefault();
        setShowWeeklyMissionsView(false);
      } else if (showLevelView) {
        e.preventDefault();
        setShowLevelView(false);
      } else if (showCoinsDetails) {
        e.preventDefault();
        setShowCoinsDetails(false);
      } else if (showPremiumIPView) {
        e.preventDefault();
        setShowPremiumIPView(false);
      } else if (showGkQuizView) {
        e.preventDefault();
        setShowGkQuizView(false);
      } else if (activeScratchCard) {
        e.preventDefault();
        setActiveScratchCard(null);
      } else if (showStatusOverlay) {
        e.preventDefault();
        setShowStatusOverlay(false);
      } else if (showVpnActivated) {
        e.preventDefault();
        setShowVpnActivated(false);
      } else if (showNativeAd) {
        e.preventDefault();
        setShowNativeAd(false);
      } else if (showOfferwallAd) {
        e.preventDefault();
        setShowOfferwallAd(false);
      } else if (activeEarningTab !== 'rewards') {
        e.preventDefault();
        setActiveEarningTab('rewards');
      }
    };

    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [
    showArticleReader,
    showArticleListView,
    showWheelView,
    showScratchView,
    showGamesView,
    showQuizView,
    showQuizSelection,
    showCheckinView,
    showMysteryBoxView,
    showWeeklyMissionsView,
    showLevelView,
    showCoinsDetails,
    showPremiumIPView,
    showGkQuizView,
    activeScratchCard,
    showStatusOverlay,
    showVpnActivated,
    showNativeAd,
    showOfferwallAd,
    activeEarningTab
  ]);


  // Show VPN activated celebration when premium becomes active and user hasn't accepted yet
  useEffect(() => {
    if (isPremium && !vpnActivatedShown) {
      setShowVpnActivated(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium]);


  useEffect(() => {
    if (premiumExpiryDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(premiumExpiryDate).getTime();
        const distance = expiry - now;

        if (distance > 0) {
          const days = Math.floor(distance / (1000 * 60 * 60 * 24));
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);

          setTimeLeft({ days, hours, minutes, seconds });
          setIsPremium(true);
        } else {
          setIsPremium(false);
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    } else {
      setIsPremium(false);
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    }
  }, [premiumExpiryDate]);

  // Reset vpnActivatedShown when a new subscription is detected (expiry date changes)
  useEffect(() => {
    if (premiumExpiryDate) {
      const storedExpiry = localStorage.getItem('vpnActivatedExpiry');
      if (storedExpiry !== premiumExpiryDate) {
        localStorage.setItem('vpnActivatedExpiry', premiumExpiryDate);
        localStorage.removeItem('vpnActivatedShown');
        setVpnActivatedShown(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [premiumExpiryDate]);


  // Article Timer Logic
  // FIX: articleReadingTime removed from deps to prevent scroll-to-top bug.
  // Each second when articleReadingTime changed, this effect restarted,
  // causing re-render which reset the nested ArticleReader scroll position.
  // Using functional update (prev =>) so we don't need it in deps.
  useEffect(() => {
    let timer;
    if (showArticleReader && isReadingStarted) {
      timer = setInterval(() => {
        setArticleReadingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArticleReader, isReadingStarted]);

  const scrollRef = React.useRef({ initialized: false });

  const startReadingArticle = (article) => {
    scrollRef.current.initialized = false;
    setCurrentArticle(null);
    setArticleReadingTime(article.readingTime || 60);
    setIsReadingStarted(true);
    setShowArticleReader(true);
    setShowArticleListView(false);
    
    // Set article after a delay
    setTimeout(() => {
      setCurrentArticle(article);
    }, 150);
  };

  const claimArticleReward = async () => {
    if (articleReadingTime > 0) {
      showToast(`Please wait ${articleReadingTime}s more.`, 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/article-claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ articleId: currentArticle._id })
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setCoins(data.coins);
        setArticleReadCount(data.dailyCount);
        showToast(`🎉 +${currentArticle.coins} Coins earned!`, 'success');
        setShowArticleReader(false);
        setIsReadingStarted(false);
      } else {
        showToast(data.message || 'Failed to claim reward.', 'error');
      }
    } catch (err) {
      console.error('Error claiming article reward:', err);
      showToast('Network error.', 'error');
    }
  };

  const ArticleListView = () => {
    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 pt-safe px-6 py-5 flex justify-between items-center shadow-lg shrink-0">
          <div className="flex items-center gap-3">
             <button onClick={() => setShowArticleListView(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <ArrowLeft className="w-6 h-6 text-white" />
             </button>
             <h3 className="text-xl font-bold text-white">Daily Articles</h3>
          </div>
          <div className="bg-white/20 px-4 py-1.5 rounded-full border border-white/20">
             <span className="text-white font-black text-sm">{articleReadCount}/5 Today</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
              <Newspaper className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-blue-900 dark:text-blue-200 font-bold text-sm">Read & Earn Coins</p>
              <p className="text-blue-700 dark:text-blue-400 text-xs">Tap each card to read an article and earn coins.</p>
            </div>
          </div>

          <div className="space-y-4">
            {articles.length > 0 ? (
              articles.map((art, idx) => (
                <div key={art._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-black text-slate-400">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">{art.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">+{art.coins} Coins</span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {art.readingTime}s
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => startReadingArticle(art)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-black text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-transform"
                  >
                    READ
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-20 px-10">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                  <BookOpen className="w-10 h-10 text-slate-400" />
                </div>
                <p className="text-slate-400 font-bold">No articles available yet.</p>
                <p className="text-slate-500 text-xs mt-1">Check back later for new content!</p>
              </div>
            )}
          </div>

          <div className="pt-6">
            <BannerAd globalSettings={globalSettings} />
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ArticleReader JSX is now inlined in the render below (not a nested component)
  // This prevents React from unmounting/remounting it on every parent re-render,
  // which was causing scroll position to reset to top every second.

  const goBackWithAd = useCallback((closeFn) => {
    if (closeFn) closeFn();
  }, []);

  const startAd = (type) => {
    const activeType = typeof type === 'string' ? type : 'daily';
    setAdType(activeType);
    let placement = 'rewarded';
    if (activeType === 'daily') placement = 'rewarded_daily';
    if (activeType === 'video') placement = 'rewarded_videos';
    if (activeType === 'view_ads') placement = 'rewarded_view_ads';

    if (isLoading) return;
    setIsLoading(true);

    const onError = (err) => {
      setIsLoading(false);
      showToast(err?.message || 'Ad was not completed or failed to load. No coins awarded.', 'error');
    };

    const onDismiss = () => {
      setIsLoading(false);
    };

    AdMobService.showRewarded((rewardItem) => {
      claimReward(activeType);
    }, placement, onError, onDismiss).catch(err => {
      setIsLoading(false);
      showToast('Ad was closed early or failed to play.', 'error');
    });
  };

  const claimReward = async (typeOverride, onSuccess) => {
    const activeType = typeOverride || adType;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const endpoint = activeType === 'daily' 
        ? `${API_BASE}/api/earning/daily-checkin`
        : `${API_BASE}/api/earning/video-claim`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: activeType })
      });

      const data = await response.json();
      
      if (response.ok) {
        setBalance(data.balance);
        if (data.coins !== undefined) setCoins(data.coins);
        else if (data.points !== undefined) setCoins(data.points);
        
        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
        else if (data.lifetimePoints !== undefined) setLifetimeCoins(data.lifetimePoints);
        
        if (activeType === 'view_ads') {
          setViewAdsStatus({ lastAdDate: data.lastAd, count: data.count });
          showToast(`🎉 Congratulations! You earned 10 Coins!`, "success");
        } else if (activeType === 'video') {
          setVideoStatus({ lastVideoDate: data.lastAd, count: data.count });
          showToast(`🎉 Congratulations! You earned 25 Coins!`, "success");
        } else if (activeType === 'daily') {
          setCheckinStatus({ lastCheckin: data.lastCheckin, count: data.count });
          showToast("🎉 Congratulations! You earned 50 Coins!", "success");
        }
        if (onSuccess) onSuccess();
      } else {
        showToast(data.message || "Failed to claim reward.", "error");
      }
    } catch (err) {
      showToast("Network error. Please check your connection.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const articleData = [
    {
      title: "গফুর মিয়ার গল্প",
      content: "গফুর মিয়ার গল্প তো আগেই শুনছো—কিন্তু আসল কাহিনি তখনই শুরু, যখন তার “স্মার্ট মুরগি” প্রজেক্ট ভাইরাল হয়ে গেল পুরো গ্রামে! গ্রামের নাম ছিল কাশিমপুর। আগে এই গ্রাম ছিল শান্ত—মানুষ কাজ করত, বিকালে চা খেত, রাতে ঘুমাত। কিন্তু গফুর মিয়ার “টেকনোলজি” আসার পর থেকে গ্রামের অবস্থা একদম বদলে গেল!"
    },
    {
      title: "📱 স্মার্ট মুরগির আপগ্রেড ভার্সন",
      content: "গফুর মিয়া এবার নতুন ঘোষণা দিল—\n—“Version 2.0 আসতেছে!”\nসবাই অবাক!\n—“এইটা আবার কী?”\nগফুর মিয়া বলল,\n—“এবার মুরগি শুধু অ্যালার্ম দিবে না, ‘ভয়েস কমান্ড’ও বুঝবে!”\n গ্রামের লোকজন চোখ বড় বড় করে তাকিয়ে রইল।\nএকজন জিজ্ঞেস করল,\n—“মানে?”\nগফুর মিয়া গম্ভীর হয়ে বলল,\n—“আপনি বলবেন—‘ডিম দাও’, মুরগি ডিম দিবে!”\nসবাই আবার হেসে উঠল। কিন্তু আগের ঘটনার পর কেউ আর পুরোপুরি সন্দেহও করতে পারছে না!"
    },
    {
      title: "🐔 পরীক্ষার দিন",
      content: "একদিন সবাইকে ডেকে গফুর মিয়া লাইভ ডেমো দিল।\nসে মুরগির সামনে দাঁড়িয়ে বলল,\n—“ডিম দাও!”\nমুরগি চুপচাপ দাঁড়িয়ে রইল… কিছুই করল না।\nসবাই হাসতে শুরু করল—\n—“এইটাই তোমার ভয়েস কমান্ড?”\nগফুর মিয়া একটু লজ্জা পেয়ে বলল,\n—“এইটা এখনো Beta Version… আপডেট লাগবে!” 😅"
    },
    {
      title: "💡 নতুন আইডিয়া—“মুরগি ব্যাংক”",
      content: "কিন্তু গফুর মিয়া হাল ছাড়ার লোক না।\nসে আবার নতুন প্ল্যান করল—\n—“মুরগি ব্যাংক খুলবো!”\nগ্রামের লোকজন বলল,\n—“এটা আবার কী জিনিস?”\nগফুর মিয়া বলল,\n—“আপনারা টাকা না রেখে মুরগি জমা রাখবেন। মাস শেষে সুদ হিসেবে ডিম পাবেন!”\nএই আইডিয়া শুনে গ্রামের মানুষ একটু সিরিয়াস হয়ে গেল।\nকারণ—ডিম তো প্রতিদিন দরকার!\nতাই অনেকেই তার “মুরগি ব্যাংক”-এ মুরগি জমা রাখতে শুরু করল."
    },
    {
      title: "🥚 বিপদ শুরু",
      content: "প্রথম কিছুদিন সব ঠিকঠাক ছিল।\nকিন্তু একদিন দেখা গেল—গফুর মিয়ার ঘরে এত মুরগি হয়ে গেছে যে হাঁটাচলা করা যায় না!\nমুরগির ডাক, ডিমের গন্ধ, আর ফোনের অ্যালার্ম—সব মিলে অবস্থা ভয়াবহ!\nতারপর একদিন বড় বিপদ হলো…\nএকটা মুরগি হঠাৎ “লাইভ” হয়ে পুরো ঘরে দৌড়াদৌড়ি শুরু করল, আর তার গলার ফোনে অ্যালার্ম বাজতে লাগল।\nএকটার পর একটা মুরগি ভয় পেয়ে দৌড়াতে লাগল…\nপুরো ঘর হয়ে গেল “মুরগি স্ট্যাম্পেড”! 🐔🐔🐔\nগফুর মিয়া চিৎকার করল,\n—“ওই! এইটা Bug! এইটা Bug!”"
    },
    {
      title: "🚨 গ্রামবাসী বিদ্রোহ",
      content: "পরদিন গ্রামবাসী একসাথে এসে বলল,\n—“আমাদের মুরগি ফেরত দেন! এই ব্যাংক আমরা চাই না!”\nগofur মিয়া একটু চিন্তা করে বলল,\n—“ঠিক আছে… কিন্তু আপনারা কি জানেন, এইটা দেশের প্রথম ‘ডিজিটাল মুরগি ব্যাংক’?”\nএকজন রাগ করে বলল,\n—“আমরা ডিজিটাল না, আমরা ডিম চাই!”\nসবাই হাসতে হাসতে লুটোপুটি!"
    },
    {
      title: "🤯 শেষ টুইস্ট",
      content: "শেষে গফুর মিয়া সব মুরগি ফেরত দিল।\nকিন্তু কিছুদিন পর দেখা গেল—সে আবার নতুন কিছু নিয়ে কাজ করছে。\nগ্রামের এক ছেলে জিজ্ঞেস করল,\n—“এবার কী বানাচ্ছেন?”\nগফুর মিয়া চোখ টিপে বলল,\n—\n“এবার বানাবো ‘স্মার্ট ছাগল’…\nযে নিজে নিজে ঘাস খুঁজে খাবে, আর মালিককে রিপোর্ট পাঠাবে!”\nছেলেটা বলল,\n—“এইটা কি সত্যি কাজ করবে?”\nগফুর মিয়া হেসে বলল,\n—\n“কাজ করুক বা না করুক…\nআইডিয়া থাকলে ইনকাম ঠিকই হবে!” 😎"
    },
    {
      title: "😄 গল্পের শিক্ষা (হালকা মজার)",
      content: "👉 আইডিয়া যতই পাগলামি হোক, বিশ্বাস আর মার্কেটিং থাকলে সেটাও ব্যবসা হয়ে যেতে পারে!\n👉 আর গ্রামের মানুষও কম না—একবার ঠকলে দ্বিতীয়বার সাবধান 😄"
    }
  ];

  const fetchQuizStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(`${API_BASE}/api/earning/quiz-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setQuizStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch quiz status:', err);
    }
  };

  const generateMathQuestion = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === '+') {
      a = Math.floor(Math.random() * 500) + 10;
      b = Math.floor(Math.random() * 500) + 10;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 500) + 10;
      b = Math.floor(Math.random() * 500) + 10;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 30) + 2;
      b = Math.floor(Math.random() * 30) + 2;
      answer = a * b;
    }
    const wrongSet = new Set();
    while (wrongSet.size < 3) {
      const offset = Math.floor(Math.random() * 10) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const wrong = answer + (offset * sign);
      if (wrong !== answer) wrongSet.add(wrong);
    }
    const options = [...wrongSet, answer].sort(() => Math.random() - 0.5);
    return { question: `${a} ${op} ${b} = ?`, answer, options };
  };

  const generateBinaryQuestion = () => {
    const dec = Math.floor(Math.random() * 256);
    const binary = dec.toString(2);
    const answer = dec;
    const wrongSet = new Set();
    while (wrongSet.size < 3) {
      const wrong = dec + (Math.floor(Math.random() * 20) - 10);
      if (wrong !== dec && wrong >= 0) wrongSet.add(wrong);
    }
    const options = [...wrongSet, answer].sort(() => Math.random() - 0.5);
    return { question: `Binary ${binary} = ?`, answer, options };
  };

  const generateWordQuestion = () => {
    const wordPairs = [
      { word: 'Happy', answer: 'Sad', wrong: ['Angry', 'Joyful', 'Excited'] },
      { word: 'Hot', answer: 'Cold', wrong: ['Warm', 'Cool', 'Mild'] },
      { word: 'Big', answer: 'Small', wrong: ['Large', 'Huge', 'Tall'] },
      { word: 'Fast', answer: 'Slow', wrong: ['Quick', 'Rapid', 'Swift'] },
      { word: 'Light', answer: 'Dark', wrong: ['Bright', 'Dim', 'Heavy'] },
      { word: 'Strong', answer: 'Weak', wrong: ['Tough', 'Firm', 'Bold'] },
      { word: 'Young', answer: 'Old', wrong: ['New', 'Fresh', 'Youthful'] },
      { word: 'Rich', answer: 'Poor', wrong: ['Wealthy', 'Luxury', 'Lavish'] },
      { word: 'Easy', answer: 'Hard', wrong: ['Simple', 'Plain', 'Clear'] },
      { word: 'Love', answer: 'Hate', wrong: ['Like', 'Adore', 'Care'] },
      { word: 'Peace', answer: 'War', wrong: ['Calm', 'Rest', 'Quiet'] },
      { word: 'Day', answer: 'Night', wrong: ['Morning', 'Noon', 'Dawn'] },
      { word: 'Win', answer: 'Lose', wrong: ['Gain', 'Earn', 'Score'] },
      { word: 'Begin', answer: 'End', wrong: ['Start', 'Open', 'Launch'] },
      { word: 'Smile', answer: 'Frown', wrong: ['Grin', 'Laugh', 'Beam'] },
    ];
    const pair = wordPairs[Math.floor(Math.random() * wordPairs.length)];
    const options = [...pair.wrong.slice(0, 3), pair.answer].sort(() => Math.random() - 0.5);
    return { question: `Opposite of "${pair.word}"?`, answer: pair.answer, options };
  };

  const generateTriviaQuestion = () => {
    const triviaPool = [
      { q: 'Capital of France?', a: 'Paris', w: ['London', 'Berlin', 'Madrid'] },
      { q: 'Largest planet?', a: 'Jupiter', w: ['Saturn', 'Mars', 'Earth'] },
      { q: 'H2O is?', a: 'Water', w: ['Oxygen', 'Hydrogen', 'Carbon'] },
      { q: 'Fastest land animal?', a: 'Cheetah', w: ['Lion', 'Horse', 'Tiger'] },
      { q: 'How many continents?', a: '7', w: ['5', '6', '8'] },
      { q: 'Smallest country?', a: 'Vatican City', w: ['Monaco', 'Malta', 'Nauru'] },
      { q: 'Sun is a?', a: 'Star', w: ['Planet', 'Moon', 'Comet'] },
      { q: 'Largest ocean?', a: 'Pacific', w: ['Atlantic', 'Indian', 'Arctic'] },
      { q: 'Speed of light?', a: '300,000 km/s', w: ['150,000 km/s', '500,000 km/s', '1,000 km/s'] },
      { q: 'Hardest natural substance?', a: 'Diamond', w: ['Gold', 'Iron', 'Steel'] },
      { q: 'How many bones in human body?', a: '206', w: ['208', '204', '210'] },
      { q: 'Largest desert?', a: 'Sahara', w: ['Gobi', 'Arctic', 'Kalahari'] },
      { q: 'First president of USA?', a: 'Washington', w: ['Lincoln', 'Jefferson', 'Adams'] },
      { q: 'Currency of Japan?', a: 'Yen', w: ['Won', 'Yuan', 'Rupee'] },
      { q: 'Boiling point of water?', a: '100°C', w: ['90°C', '110°C', '80°C'] },
    ];
    const t = triviaPool[Math.floor(Math.random() * triviaPool.length)];
    const options = [...t.w, t.a].sort(() => Math.random() - 0.5);
    return { question: t.q, answer: t.a, options };
  };

  const generateQuizQuestion = (type) => {
    switch (type) {
      case 'binary': return generateBinaryQuestion();
      case 'word': return generateWordQuestion();
      case 'trivia': return generateTriviaQuestion();
      default: return generateMathQuestion();
    }
  };

  const startNewQuiz = (type) => {
    const q = generateQuizQuestion(type || quizType);
    setQuizQuestion(q);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizTimer(30);
    setQuizTimerActive(true);
  };

  const startGkQuiz = () => {
    const lastPlayed = localStorage.getItem('gk_last_played');
    const today = new Date().toDateString();
    if (lastPlayed === today) {
      alert("You have already played the General Knowledge quiz today. Come back tomorrow!");
      return;
    }
    
    const shuffled = [...gkQuizDB].sort(() => Math.random() - 0.5).slice(0, 10);
    setGkQuizQuestions(shuffled);
    setCurrentGkIndex(0);
    setGkQuizScore(0);
    setGkSelected(null);
    setGkAnswered(false);
    setShowQuizSelection(false);
    setShowGkQuizView(true);
  };

  const handleGkAnswer = (option) => {
    if (gkAnswered) return;
    setGkSelected(option);
  };

  const handleGkSubmit = () => {
    if (!gkSelected || gkAnswered) return;
    setGkAnswered(true);

    const correct = gkSelected === gkQuizQuestions[currentGkIndex].answer;
    const newScore = correct ? gkQuizScore + 1 : gkQuizScore;
    if (correct) setGkQuizScore(newScore);

    const isLast = currentGkIndex >= 9;

    // Show ad first, then advance
    const advanceGk = () => {
      if (!isLast) {
        setCurrentGkIndex(prev => prev + 1);
        setGkSelected(null);
        setGkAnswered(false);
      } else {
        // Last question — check score and claim reward
        if (newScore >= 5) {
          (async () => {
            try {
              const token = localStorage.getItem('token');
              const response = await fetch(`${API_BASE}/api/earning/gk-claim`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await response.json();
              if (response.ok) {
                setBalance(data.balance);
                if (data.coins !== undefined) setCoins(data.coins);
                else if (data.points !== undefined) setCoins(data.points);
                showToast(`🎉 Congrats! GK Quiz done! You earned ${data.reward ?? 40} Coins! 🪙`, "success");
              } else {
                showToast(data.message || 'Failed to claim GK reward.', "error");
              }
            } catch (err) {
              showToast('Network error.', "error");
            }
          })();
        } else {
          showToast(`Quiz done! Score: ${newScore}/10. Need 5+ correct to earn Coins.`, 'error');
        }
        localStorage.setItem('gk_last_played', new Date().toDateString());
        setShowGkQuizView(false);
      }
    };

    AdMobService.showInterstitial(
      advanceGk,
      (errMsg) => {
        // On ad fail: if not last question, allow them to keep answering, but if last question with high score, alert them
        if (!isLast) {
          advanceGk();
        } else {
          showToast(errMsg || "Ad failed to load. Please try again to claim your reward.", "error");
          setGkAnswered(false);
        }
      }
    );
  };

  const handleMathQuizSubmit = () => {
    if (!quizSelected || quizAnswered) return;
    setQuizAnswered(true);
    setQuizTimerActive(false);

    const correct = quizSelected === quizQuestion.answer;
    const coinsPerQ = quizType === 'binary' ? 30 : quizType === 'word' ? 25 : 20;

    const claimAndAdvance = async () => {
      if (correct) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/api/earning/quiz-claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ type: quizType }),
          });
          const data = await response.json();
          if (response.ok) {
            setBalance(data.balance);
            if (data.coins !== undefined) setCoins(data.coins);
            else if (data.points !== undefined) setCoins(data.points);
            setQuizScore(prev => prev + 1);
            showToast(`🎉 Correct! You earned ${data.reward ?? coinsPerQ} Coins! 🪙`, "success");
          } else {
            showToast(data.message || 'Reward claimed failed.', "error");
          }
        } catch (err) {
          showToast('Network error.', "error");
        }
      } else {
        showToast(`❌ Wrong answer! The correct answer was: ${quizQuestion.answer}`, 'error');
      }

      // Fetch updated quiz status then next question
      fetchQuizStatus();
      setTimeout(() => {
        startNewQuiz(quizType);
      }, 800);
    };

    // Only attempt ad if correct answer
    if (correct) {
      AdMobService.showInterstitial(
        claimAndAdvance,
        (errMsg) => {
          showToast(errMsg || "Ad failed to load. Please try again.", "error");
          fetchQuizStatus();
          setTimeout(() => startNewQuiz(quizType), 800);
        }
      );
    } else {
      claimAndAdvance();
    }
  };

  const launchQuiz = (type) => {
    if (type === 'gk') {
      startGkQuiz();
      return;
    }
    setQuizType(type);
    setQuizScore(0);
    setShowQuizSelection(false);
    startNewQuiz(type);
    setShowQuizView(true);
  };

  React.useEffect(() => {
    if (!quizTimerActive || quizAnswered) return;
    if (quizTimer <= 0) {
      setQuizAnswered(true);
      setQuizTimerActive(false);
      setShowQuizView(false);
      showToast('Time is up!', 'error');
      return;
    }
    const timer = setTimeout(() => setQuizTimer(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [quizTimer, quizTimerActive, quizAnswered, showToast]);

  const handleAdOptionClick = async (adName, adType, coins) => {
    if (isLoading) return;
    setCurrentAdInfo({ name: adName, type: adType, coins, time: 0 });

    if (!Capacitor.isNativePlatform() && (adType === 'Rewarded Video' || adType === 'Rewarded Interstitial' || adType === 'App Open Ad' || adType === 'Interstitial')) {
      showToast('Ads are only available on our Android App. Please open the app to watch ads and earn coins!', 'info');
      return;
    }
    
    setIsLoading(true);
    const resetLoading = () => setIsLoading(false);

    try {
      if (adType === 'Rewarded Video') {
        await AdMobService.showRewarded(
          () => {
            handleCustomAdReward(coins, adName);
            resetLoading();
          },
          'rewarded',
          (err) => {
            resetLoading();
            showToast(err?.message || 'Ad was not completed or failed to load. No coins awarded.', 'error');
          },
          () => resetLoading()
        );
      } else if (adType === 'Rewarded Interstitial') {
        await AdMobService.showRewardedInterstitial(
          () => {
            handleCustomAdReward(coins, adName);
            resetLoading();
          },
          (err) => {
            resetLoading();
            showToast(err?.message || 'Ad was not completed or failed to load. No coins awarded.', 'error');
          },
          () => resetLoading()
        );
      } else if (adType === 'App Open Ad') {
        await AdMobService.showAppOpenAd(
          () => {
            handleCustomAdReward(coins, adName);
            resetLoading();
          },
          (err) => {
            resetLoading();
            showToast(err?.message || 'Ad was not completed or failed to load. No coins awarded.', 'error');
          },
          () => resetLoading()
        );
      } else if (adType === 'Interstitial') {
        await AdMobService.showInterstitial(
          () => {
            handleCustomAdReward(coins, adName);
            resetLoading();
          },
          (err) => {
            resetLoading();
            showToast(err?.message || 'Ad was not completed or failed to load. No coins awarded.', 'error');
          },
          () => resetLoading()
        );
      } else if (adType === 'Native Ad') {
        resetLoading();
        setShowNativeAd(true);
        setCurrentAdInfo({ name: adName, type: adType, coins, time: 5 });
      } else {
        resetLoading();
        setShowOfferwallAd(true);
      }
    } catch (e) {
      console.error('Ad option click error:', e);
      resetLoading();
      showToast('Ad failed to play. Please try again.', 'error');
    }
  };

  const handlePremiumSubmit = async () => {
    if (!selectedPackage || !selectedCountry) {
      showToast('Please select package and country!', 'error');
      return;
    }
    // Look up from admin settings packages first, then fallback to local
    const adminPkg = (globalSettings.premiumIpPackages || []).find(p => p.id === selectedPackage);
    const localPkg = ipPackages.find(p => p.id === selectedPackage);
    const pkg = adminPkg || localPkg;
    const amount = (pkg?.price || 0) + 25; // 25 Tk VAT added!
    if (!amount) {
      showToast('Invalid package selected. Please go back and choose again.', 'error');
      return;
    }
    const packageName = adminPkg?.duration || localPkg?.name || selectedPackage;
    
    setIpSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Permanent ZiniPay Auto Gateway Flow
      const response = await fetch(`${API_BASE}/api/payment/zinipay/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          packageId: selectedPackage,
          packageName,
          country: selectedCountry,
          amount
        })
      });
      const data = await response.json();
      if (response.ok && data.payment_url) {
        showToast('Redirecting to ZiniPay Gateway...', 'success');
        window.location.href = data.payment_url;
        return;
      } else {
        showToast(data.message || 'ZiniPay gateway error. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setIpSubmitting(false);
    }
  };
  const handleConvertCoins = async () => {
    if (coins < 1000) {
      alert('You need at least 1000 coins to convert to balance.');
      return;
    }
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/earning/convert-coins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
        setCoins(data.coins);
        alert(data.message);
        setShowCoinsDetails(false);
      } else {
        alert(data.message || 'Conversion failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Server Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomAdReward = async (pts, adName) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await fetch(`${API_BASE}/api/earning/task-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ points: pts, name: adName })
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.balance);
        if (data.coins !== undefined) setCoins(data.coins);
        showToast(`🎉 You earned ${pts} Coins from ${adName}!`, "success");
      } else {
        showToast(data.message || 'Failed to claim coins.', "error");
      }
    } catch (err) {
      showToast('Network error.', "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showSectionIntro = (section) => {
    setIntroSection(section);
    setShowIntroScreen(true);
  };

  const openMultiAdView = useCallback((config) => {
    setMultiAdConfig(config);
    setShowMultiAdView(true);
  }, []);

  const closeSectionIntro = (callback) => {
    setShowIntroScreen(false);
    setTimeout(callback, 300);
  };

  React.useEffect(() => {
    let adTmr;
    if (showNativeAd && currentAdInfo.time > 0) {
      adTmr = setInterval(() => {
        setCurrentAdInfo(prev => {
          if (prev.time - 1 === 0) {
            AdMobService.hideNativeSimulatedAd();
            setShowNativeAd(false);
            handleCustomAdReward(prev.coins, prev.name);
          }
          return {...prev, time: prev.time - 1};
        });
      }, 1000);
    }
    return () => clearInterval(adTmr);
  }, [showNativeAd, currentAdInfo.time]);

  const handleVerifiedAdAction = (title, onVerified) => {
    AdMobService.showInterstitial(
      () => {
        if (onVerified) onVerified();
      },
      (errMsg) => {
        showToast(errMsg || "Ad failed to load. Please try again to complete the task.", "error");
      }
    );
  };

  const itemsToSkipIntro = useMemo(() => new Set(['Premium IP', 'Refer & Earn', 'Wallet', 'History', 'Tutorial', 'Invite Friends', 'Daily Quiz', 'Math Quiz', 'Binary Quiz', 'Word Quiz', 'Meta']), []);

  const OptionCard = useCallback(({ item, isLarge = false, count = null, maxCount = null, skipIntro = false, isLocked = false, onLockedClick = null }) => {
    const isCompleted = count !== null && count >= maxCount;
    const shouldSkip = skipIntro || itemsToSkipIntro.has(item?.name);

    const handleClick = () => {
      if (isLocked) {
        if (onLockedClick) onLockedClick();
        return;
      }
      if (shouldSkip || !item.action) {
        if (item.action) item.action();
        return;
      }
      setIntroItem(item);
      setShowIntroScreen(true);
    };

    return (
      <button
        key={item.id}
        onClick={handleClick}
        className={`flex flex-col items-center group w-full transition-transform duration-150 active:scale-95 hover:scale-105 ${isLocked ? 'opacity-60' : ''}`}
        style={{ transform: 'translateZ(0)' }}
      >
        <div className={`w-14 h-14 ${isLarge ? 'md:w-20 md:h-20' : 'md:w-16 md:h-16'} rounded-2xl bg-gradient-to-br ${isLocked ? 'from-slate-500 to-slate-600' : (item.color || 'from-blue-500 to-indigo-600')} flex items-center justify-center shadow-lg relative overflow-hidden`}>
          {isLocked ? (
            <Lock className="w-7 h-7 text-white/80" strokeWidth={2.5} />
          ) : typeof item.icon === 'string' ? (
            <img src={item.icon} alt={item.name} className="w-7 h-7 md:w-10 md:h-10 object-contain drop-shadow-md" loading="lazy" />
          ) : React.isValidElement(item.icon) ? (
            <div className="text-white drop-shadow-md flex items-center justify-center">
              {React.cloneElement(item.icon, { 
                className: `${isLarge ? 'w-10 h-10' : 'w-7 h-7'}`,
                strokeWidth: 2.5
              })}
            </div>
          ) : item.logo ? (
            <img src={item.logo} alt={item.name} className="w-8 h-8 md:w-11 md:h-11 object-contain drop-shadow-md" loading="lazy" />
          ) : (
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg" />
          )}

          {count !== null && !isLocked && (
            <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-slate-800 rounded-full px-1.5 py-0.5 shadow-sm border border-slate-100 dark:border-slate-700 min-w-[20px] flex items-center justify-center">
              <span className={`text-[9px] font-black ${isCompleted ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-300'}`}>
                {count}/{maxCount}
              </span>
            </div>
          )}
        </div>
        <span className="mt-2.5 text-[10px] md:text-xs font-black text-slate-700 dark:text-slate-300 text-center leading-tight">
          {isLocked ? item.name : item.name}
        </span>
        {!isLocked && item.coins && (
          <span className="text-[10px] font-bold text-emerald-500 mt-0.5">
            +{item.coins} Coins
          </span>
        )}
        {isLocked && (
          <span className="text-[10px] font-bold text-slate-400 mt-0.5">Locked</span>
        )}
      </button>
    );
  }, [itemsToSkipIntro]);

  const OptionIntroScreen = () => {
    const [moreOpen, setMoreOpen] = React.useState(false);
    const item = introItem;
    if (!item) return null;

    const bgClass = item.color || 'from-blue-500 to-indigo-600';

    // Determine animation type from item name
    const getAnimType = (name = '') => {
      const n = name.toLowerCase();
      if (n.includes('video') || n.includes('film') || n.includes('mega')) return 'video';
      if (n.includes('spin') || n.includes('wheel') || n.includes('fortune')) return 'spin';
      if (n.includes('scratch')) return 'scratch';
      if (n.includes('checkin') || n.includes('daily')) return 'checkin';
      if (n.includes('quiz') || n.includes('math') || n.includes('binary') || n.includes('word') || n.includes('knowledge')) return 'quiz';
      if (n.includes('refer') || n.includes('invite') || n.includes('friend')) return 'refer';
      if (n.includes('article') || n.includes('read')) return 'article';
      if (n.includes('premium') || n.includes('ip')) return 'premium';
      if (n.includes('game') || n.includes('play')) return 'game';
      return 'generic';
    };
    const animType = getAnimType(item.name);

    // Duration label per type
    const durationLabel = {
      video: '30s (per video)',
      spin: '1 Spin',
      scratch: '1 Scratch',
      checkin: 'Daily',
      quiz: '30s (per question)',
      refer: 'Per Invite',
      article: '60s (per article)',
      premium: 'Monthly',
      game: 'Per Game',
      generic: 'Per Complete',
    }[animType] || 'Per Complete';

    // Emoji icon per type for the big glow circle
    const centerEmoji = {
      video: '🎬',
      spin: '🎡',
      scratch: '🃏',
      checkin: '📅',
      quiz: '🧠',
      refer: '👥',
      article: '📰',
      premium: '💎',
      game: '🎮',
      generic: '🎯',
    }[animType] || '🎯';

    const handlePlay = () => {
      setShowIntroScreen(false);
      setTimeout(() => { if (item.action) item.action(); }, 100);
    };

    return (
      <div className="fixed inset-0 z-[9998] flex flex-col overflow-hidden" style={{ background: 'linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)' }}>
        {/* Colour tint overlay matching item colour */}
        <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-15 pointer-events-none`} />

        {/* Floating ambient dots */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${8 + i * 4}px`,
              height: `${8 + i * 4}px`,
              background: 'white',
              left: `${(i * 13) % 100}%`,
              top: `${(i * 17 + 10) % 85}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}

        {/* ── Top Bar ── */}
        <div className="relative z-50 flex items-center justify-between px-4 pt-safe py-3">
          <button
            onClick={() => goBackWithAd(() => setShowIntroScreen(false))}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="text-white font-black text-base tracking-tight">{item.name}</h1>

          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-12 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl py-2 w-44 z-50">
                {[
                  { name: 'Home', icon: '🏠', action: () => { setShowIntroScreen(false); setActiveTab('Home'); } },
                  { name: 'Notification', icon: '🔔', action: () => { setShowIntroScreen(false); setActiveTab('Notification'); } },
                  { name: 'Profile', icon: '👤', action: () => { setShowIntroScreen(false); setActiveTab('Profile'); } },
                ].map((link, i) => (
                  <button
                    key={i}
                    onClick={() => { setMoreOpen(false); link.action(); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                  >
                    <span>{link.icon}</span>{link.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Balance Chip ── */}
        <div className="relative z-10 flex justify-center mt-1 mb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-1.5">
            <span className="text-amber-400 text-base">💰</span>
            <span className="text-white font-black text-sm">৳{balance.toFixed(2)}</span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-amber-300 text-xs font-bold">{coins} Coins</span>
          </div>
        </div>

        {/* ── Activity Identity Card ── */}
        <div className="relative z-10 mx-4 mb-4 flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bgClass} flex items-center justify-center shadow-lg flex-shrink-0`}>
            {typeof item.icon !== 'string' && React.isValidElement(item.icon)
              ? <div className="text-white">{React.cloneElement(item.icon, { className: 'w-6 h-6' })}</div>
              : typeof item.icon === 'string' && item.icon.startsWith('http')
                ? <img src={item.icon} alt={item.name} className="w-7 h-7 object-contain" />
                : <span className="text-2xl">{centerEmoji}</span>
            }
          </div>
          <div>
            <div className="text-white font-black text-sm leading-none">{item.name}</div>
            <div className="text-white/50 text-[10px] font-medium mt-0.5">Earning Activity</div>
          </div>
        </div>

        {/* ── Large Themed Center Icon ── */}
        <div className="relative z-10 flex items-center justify-center mb-6" style={{ minHeight: 160 }}>
          {/* Outer glow ring 1 */}
          <div className={`absolute w-40 h-40 rounded-full bg-gradient-to-br ${bgClass} opacity-10 animate-ping`} style={{ animationDuration: '3s' }} />
          {/* Outer ring 2 */}
          <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-br ${bgClass} opacity-15`} />
          {/* Main icon circle */}
          <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${bgClass} flex items-center justify-center shadow-2xl border-2 border-white/20`}>
            {typeof item.icon !== 'string' && React.isValidElement(item.icon)
              ? <div className="text-white drop-shadow-xl">{React.cloneElement(item.icon, { className: 'w-12 h-12' })}</div>
              : typeof item.icon === 'string' && item.icon.startsWith('http')
                ? <img src={item.icon} alt={item.name} className="w-14 h-14 object-contain drop-shadow-xl" />
                : <span className="text-5xl drop-shadow-xl" style={{ transform: 'translateZ(0)' }}>{centerEmoji}</span>
            }
          </div>
        </div>

        {/* ── Info Cards ── */}
        <div className="relative z-10 mx-4 space-y-2 mb-4">
          {/* Duration */}
          <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">⏱️</span>
            </div>
            <div>
              <div className="text-white font-black text-sm leading-none">
                Duration: <span className="text-blue-400">{durationLabel.split(' ')[0]}</span>
              </div>
              <div className="text-white/50 text-[10px] font-medium mt-0.5">
                {durationLabel.includes('(') ? durationLabel.substring(durationLabel.indexOf('(')) : ''}
              </div>
            </div>
          </div>

          {/* Prize */}
          {item.coins != null && (
            <div className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-2xl px-4 py-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🪙</span>
              </div>
              <div>
                <div className="text-white font-black text-sm leading-none">
                  Prize: <span className="text-amber-400">{item.coins} coins</span>
                </div>
                <div className="text-white/50 text-[10px] font-medium mt-0.5">
                  {animType === 'quiz' ? '(per answer)' : animType === 'video' ? '(per video)' : animType === 'refer' ? '(per invite)' : '(upon completion)'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Play Button ── */}
        <div className="relative z-10 px-4 pb-4">
          <button
            onClick={handlePlay}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r ${bgClass} text-white font-black text-lg shadow-xl relative overflow-hidden active:scale-95 transition-transform`}
          >
            {/* Shine sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
            <span className="relative z-10">
              ▶ {animType === 'article' ? 'Read' : animType === 'refer' ? 'Invite' : animType === 'premium' ? 'Get' : 'Play'} {item.name}
            </span>
          </button>

          {/* Ad Banner */}
          <div className="mt-4 flex flex-col items-center">
            <BigAdBanner globalSettings={globalSettings} />
          </div>
        </div>
      </div>
    );
  };


  const levelInfo = useMemo(() => {
    const pts = lifetimeCoins;
    if (pts < 1500) return { level: 1, current: pts, target: 1500, label: 'Level 1' };
    if (pts < 3500) return { level: 2, prev: 1500, current: pts, target: 3500, label: 'Level 2' };
    if (pts < 6000) return { level: 3, prev: 3500, current: pts, target: 6000, label: 'Level 3' };
    if (pts < 10000) return { level: 4, prev: 6000, current: pts, target: 10000, label: 'Level 4' };
    return { level: 5, prev: 10000, current: pts, target: 10000, label: 'Max Level', isMax: true };
  }, [lifetimeCoins]);

  const progressPercent = useMemo(() => levelInfo.isMax ? 100 : Math.min(100, Math.max(0, ((levelInfo.current - (levelInfo.prev || 0)) / (levelInfo.target - (levelInfo.prev || 0))) * 100)), [levelInfo]);

  return (
    <>
      {toast.visible && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_8px_30px_rgba(139,92,246,0.3)] font-bold text-sm bg-violet-600 text-white animate-fade-in whitespace-nowrap border border-white/20 backdrop-blur-md">
            <span>{toast.type === 'error' ? '✖' : '🎉'}</span>
            <span>{toast.message}</span>
          </div>
        )}

      {showIntroScreen && introItem && <OptionIntroScreen />}

      {/* ══════ LOCK POPUP ══════ */}
      {showLockPopup && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-end justify-center"
          onClick={() => setShowLockPopup(false)}
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm mx-4 mb-6 bg-[#0d1117] rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-amber-600/20 to-transparent pointer-events-none" />
            <button
              onClick={() => setShowLockPopup(false)}
              className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-colors z-20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center pt-7 pb-3 px-5 relative z-10">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-amber-500 blur-xl opacity-25 scale-125" />
                <div
                  className="relative w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25"
                >
                  <Lock className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-xl font-black text-white mb-1">Level {lockPopupLevel} Locked</h2>

              {(() => {
                const targetCoinsMap = { 1: 0, 2: 1500, 3: 3500, 4: 6000, 5: 10000 };
                const target = targetCoinsMap[lockPopupLevel] || 1500;
                const needed = Math.max(0, target - lifetimeCoins);
                const progress = Math.min(100, Math.round((lifetimeCoins / target) * 100));
                return (
                  <div className="w-full bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 my-3 text-center">
                    <p className="text-white text-sm font-black mb-1">
                      {target.toLocaleString()} Coins Required
                    </p>
                    <p className="text-xs text-slate-400 mb-2.5">
                      You have <span className="text-amber-400 font-bold">{lifetimeCoins.toLocaleString()}</span> • Need <span className="text-emerald-400 font-bold">{needed.toLocaleString()} more</span>
                    </p>
                    {/* Compact progress bar */}
                    <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden border border-white/5">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-1.5 inline-block">
                      {progress}% Progress to Level {lockPopupLevel}
                    </span>
                  </div>
                );
              })()}

              <button
                onClick={() => setShowLockPopup(false)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-sm shadow-md shadow-amber-500/20 active:scale-95 transition-transform mb-1.5"
              >
                Keep Earning to Level Up 🚀
              </button>
              <button onClick={() => setShowLockPopup(false)} className="text-slate-500 text-xs font-bold py-1">
                Dismiss
              </button>
            </div>
            <div className="px-4 pb-5 relative z-10">
              <div className="text-[9px] font-black text-slate-700 uppercase tracking-widest text-center mb-2">Sponsored Ad</div>
              <BigAdBanner globalSettings={globalSettings} />
            </div>
          </div>
        </div>,
        document.body
      )}

      
      {showArticleListView && <ArticleListView />}
      {showArticleReader && currentArticle && createPortal(
        <div className="fixed inset-0 z-[10000] bg-white dark:bg-slate-950 flex flex-col w-full overflow-hidden">
          {/* Header - re-renders every second but scroll area below does NOT remount */}
          <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-safe px-6 py-4 flex justify-between items-center shrink-0">
            <button 
              onClick={() => {
                if (articleReadingTime > 0) {
                  showToast(`Please wait ${articleReadingTime}s to finish reading!`, 'error');
                  return;
                }
                setShowArticleReader(false);
              }} 
              className={`p-2 rounded-lg ${articleReadingTime > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ArrowLeft className="w-6 h-6 text-slate-500" />
            </button>
            <div className="flex flex-col items-center flex-1 mx-4">
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-full border-2 border-brand-500/30 flex items-center justify-center overflow-hidden">
                  <div className="h-full bg-brand-500" style={{ width: `${((currentArticle.readingTime - articleReadingTime) / currentArticle.readingTime) * 100}%` }} />
                </div>
                <span className="font-black text-slate-800 dark:text-white text-sm">
                  {articleReadingTime > 0 ? `${articleReadingTime}s remaining` : 'Reading Complete!'}
                </span>
              </div>
            </div>
            <div className="w-10" />
          </div>

          {/* Content Scroll Area - stable DOM node, scroll preserved */}
          <div className="flex-1 overflow-y-auto min-h-0 p-6 sm:p-10 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
              {currentArticle.title}
            </h1>
            <div className="space-y-6">
              {currentArticle.content.split(/\n\n|\r\n\r\n/).filter(p => p.trim() !== '').map((para, idx) => (
                <React.Fragment key={idx}>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-base sm:text-lg">{para}</p>
                  {(idx + 1) % 2 === 0 && (
                    <div className="py-4 flex flex-col items-center">
                      <BannerAd globalSettings={globalSettings} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="mt-12 mb-20">
              <BannerAd globalSettings={globalSettings} />
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-center shrink-0">
            <button
              onClick={claimArticleReward}
              disabled={articleReadingTime > 0}
              className={`w-full max-w-sm py-4 rounded-2xl font-black text-lg transition-all transform-gpu shadow-xl ${
                articleReadingTime > 0
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white animate-bounce-subtle'
              }`}
            >
              {articleReadingTime > 0 ? `READING... (${articleReadingTime}s)` : 'CLAIM REWARD 🎉'}
            </button>
          </div>
        </div>,
        document.body
      )}
      
      {showMultiAdView && multiAdConfig && (
        <MultiAdViewPage
          config={multiAdConfig}
          onClose={() => setShowMultiAdView(false)}
          onCoinsEarned={(amount, label, data) => {
            if (data?.balance !== undefined) setBalance(data.balance);
            if (data?.coins !== undefined) setCoins(data.coins);
            else setCoins(prev => prev + amount);
            showToast(`🎉 +${amount} Coins from ${label}!`, 'success');
          }}
        />
      )}

      {showQuizView && quizQuestion && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
            <div className="bg-[#1a362d] text-white pt-safe px-6 py-5 flex justify-between items-center shadow-lg shrink-0">
              <button onClick={() => goBackWithAd(() => { setShowQuizView(false); setQuizTimerActive(false); })} className="p-2 hover:bg-white/10 rounded-lg shrink-0">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-lg font-bold truncate mx-4 capitalize">{quizType.replace('-', ' ')} Quiz</h3>
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="white" strokeWidth="3"
                    strokeDasharray={`${(quizTimer / 30) * 125.66} 125.66`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{quizTimer}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8">
              <div className="w-full max-w-lg bg-gradient-to-br from-[#2d8a5e] to-[#1a6b42] rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <p className="text-white text-center text-3xl font-black leading-tight drop-shadow-sm relative z-10">{quizQuestion.question}</p>
              </div>

              <div className="w-full max-w-lg space-y-4">
                {quizQuestion.options.map((option, idx) => {
                  const isSelected = quizSelected === option;
                  const showResult = quizAnswered;
                  const isCorrectOpt = option === quizQuestion.answer;
                  const isWrongOpt = showResult && isSelected && !isCorrectOpt;
                  return (
                    <button 
                      key={idx} 
                      disabled={quizAnswered} 
                      onClick={() => !quizAnswered && setQuizSelected(option)}
                      className={`w-full py-5 px-8 rounded-2xl text-center text-xl font-black transition-all border-4 transform-gpu active:scale-95 ${
                        showResult && isCorrectOpt
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                          : showResult && isWrongOpt
                          ? 'border-rose-500 bg-rose-500 text-white'
                          : isSelected 
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-200 dark:hover:border-emerald-900/50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button */}
              {quizSelected && !quizAnswered && (
                <div className="w-full max-w-lg">
                  <button
                    onClick={handleMathQuizSubmit}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg shadow-xl shadow-emerald-500/30 active:scale-95 transition-transform relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
                    <span className="relative z-10">✅ Submit Answer</span>
                  </button>
                </div>
              )}

              <div className="mt-auto w-full max-w-lg">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Session Progress</p>
                  <p className="text-xl font-black text-slate-800 dark:text-white">{quizStatus.count} / 10 Games Complete</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <BigAdBanner globalSettings={globalSettings} />
              </div>
            </div>
          </div>
        )}

      {showWheelView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Fortune Wheel</h3>
              <button onClick={() => goBackWithAd(() => setShowWheelView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-8 relative">
              <div className="text-center space-y-1">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Spin the wheel to win Coins!</p>
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${wheelStatus.count > i ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{wheelStatus.count}/10 spins used today</p>
              </div>

              {/* Wheel Container */}
              <div className="relative w-full max-w-[320px] aspect-square transform-gpu">
                {/* Pointer */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 drop-shadow-2xl">
                  <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-rose-600"></div>
                </div>

                <div
                  className="w-full h-full rounded-full border-[10px] border-amber-400 dark:border-amber-500 shadow-2xl relative transition-transform duration-5000 ease-out flex items-center justify-center overflow-hidden"
                  style={{ 
                    transform: isSpinning ? `rotate(${spinReward?.totalRotation || 0}deg)` : 'rotate(0deg)',
                    background: `conic-gradient(${(Array.isArray(globalSettings.fortuneWheelConfig?.coins) && globalSettings.fortuneWheelConfig.coins.length > 0 ? globalSettings.fortuneWheelConfig.coins : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).map((_, i, arr) => {
                      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];
                      const size = 360 / (arr.length || 1);
                      return `${colors[i % colors.length]} ${i * size}deg ${(i + 1) * size}deg`;
                    }).join(', ')})` 
                  }}
                >
                  {(Array.isArray(globalSettings.fortuneWheelConfig?.coins) && globalSettings.fortuneWheelConfig.coins.length > 0 ? globalSettings.fortuneWheelConfig.coins : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]).map((pts, i, arr) => {
                    const segmentSize = 360 / (arr.length || 1);
                    const rotation = i * segmentSize + (segmentSize / 2);
                    return (
                      <div
                        key={i}
                        className="absolute font-black text-white text-base drop-shadow-md"
                        style={{
                          transform: `rotate(${rotation}deg) translateY(-100px) rotate(-${rotation}deg)`
                        }}
                      >
                        {pts}
                      </div>
                    );
                  })}
                  
                  {/* Center hub */}
                  <div className="absolute w-16 h-16 bg-white dark:bg-slate-900 rounded-full shadow-xl border-4 border-amber-400 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-800 rounded-full" />
                  </div>
                </div>
              </div>

              <button
                disabled={isSpinning || wheelStatus.count >= (globalSettings.fortuneWheelConfig?.dailyLimit || 10)}
                onClick={() => {
                  const maxSpins = globalSettings.fortuneWheelConfig?.dailyLimit || 10;
                  if (wheelStatus.count >= maxSpins) {
                    showToast(`You have used all ${maxSpins} spins today. Come back tomorrow!`, 'info');
                    return;
                  }
                  
                  const startSpinAction = () => {
                    const segments = globalSettings.fortuneWheelConfig?.coins || [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
                    const randomIdx = Math.floor(Math.random() * segments.length);
                    const segmentSize = 360 / segments.length;
                    const segmentAngle = randomIdx * segmentSize + (segmentSize / 2);
                    const landAngle = (360 - segmentAngle + 360) % 360;
                    const totalRotation = 3600 + landAngle; 
                    setSpinReward({ coins: segments[randomIdx], totalRotation });
                    setIsSpinning(true);
                    
                    // Delay for animation
                    setTimeout(async () => {
                        setIsSpinning(false);
                        const reward = segments[randomIdx];
                        try {
                          const token = localStorage.getItem('token');
                          const response = await fetch(`${API_BASE}/api/earning/spin-claim`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ coins: reward }),
                          });
                          const data = await response.json();
                          if (response.ok) {
                            setBalance(data.balance);
                            if (data.coins !== undefined) setCoins(data.coins);
                            setWheelStatus({ lastSpinDate: data.lastSpinDate, count: data.count });
                            showToast(`🎉 Congratulations! You won ${reward} Coins!`, "success");
                          } else {
                            showToast(data.message || 'Failed to claim spin.', "error");
                          }
                        } catch (err) {
                          showToast('Network error.', "error");
                        }
                    }, 5200);
                  };

                  AdMobService.showInterstitial(
                    () => {
                      startSpinAction();
                    },
                    (errMsg) => {
                      showToast(errMsg || "Ad failed to load. Please try again to spin.", "error");
                    }
                  );
                }}
                className="w-full max-w-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale uppercase tracking-widest text-lg"
              >
                {isSpinning ? 'Spinning...' : 'Spin Now!'}
              </button>

              <div className="mt-8 flex justify-center">
                <BigAdBanner globalSettings={globalSettings} />
              </div>
            </div>
          </div>
        )}

      {showGamesView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Games</h3>
              <button onClick={() => goBackWithAd(() => setShowGamesView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">Play games and earn bonus Coins!</p>
              {[
                { name: 'Puzzle Quest', desc: 'Solve puzzles to earn rewards', icon: '🧩', color: 'from-blue-500 to-indigo-600', pts: '5-50' },
                { name: 'Color Match', desc: 'Match colours and win big', icon: '🎨', color: 'from-pink-500 to-rose-600', pts: '10-30' },
                { name: 'Word Master', desc: 'Find hidden words for coins', icon: '📝', color: 'from-green-500 to-emerald-600', pts: '5-25' },
              ].map((game, i) => (
                <button
                  key={i}
                  onClick={() => alert('Coming soon! This game will be available in a future update.')}
                  className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-14 h-14 bg-gradient-to-br ${game.color} flex items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                      {game.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{game.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{game.desc}</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold shrink-0">
                    {game.pts} Coins
                  </div>
                </button>
              ))}
              <div className="text-center pt-4">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">More games coming soon! 🎮</span>
              </div>
            </div>
          </div>
        )}

      {showScratchView && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
            <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Scratch Cards</h3>
              <button onClick={() => goBackWithAd(() => setShowScratchView(false))} className="p-2 text-slate-400">
                <ArrowLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="text-center space-y-1 mb-2">
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Scratch to reveal your reward! 20 Coins each.</p>
                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${scratchStatus.count > i ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  ))}
                </div>
                <p className="text-xs text-slate-400">{scratchStatus.count}/10 scratched today</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 10 }).map((_, i) => {
                  const cardNum = i + 1;
                  const isScratched = scratchStatus.count >= cardNum;
                  const isNext = scratchStatus.count + 1 === cardNum;
                  const isLocked = !isScratched && !isNext;

                  return (
                    <button
                      key={i}
                      disabled={isLocked || isScratched || isLoading}
                      onClick={() => {
                        if (isLocked || isScratched) return;
                        setActiveScratchCard({ index: i, cardNum, isRevealed: false });
                      }}
                      className={`relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 transition-all overflow-hidden min-h-[140px] ${
                        isScratched
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : isNext
                          ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700 shadow-md hover:shadow-xl cursor-pointer group'
                          : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {isScratched ? (
                        <>
                          <span className="text-4xl mb-2 grayscale opacity-50">🎁</span>
                          <span className="font-bold text-slate-400 dark:text-slate-500 text-sm">Card {cardNum}</span>
                          <span className="absolute bottom-2 text-[10px] text-green-500 font-bold uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-full">Claimed!</span>
                        </>
                      ) : isNext ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex flex-col items-center justify-center gap-2 group-hover:opacity-90 transition-opacity z-10">
                            <div className="text-4xl animate-float">🎁</div>
                            <span className="font-black text-white text-sm drop-shadow">SCRATCH HERE!</span>
                            <span className="text-[10px] text-white/80 font-bold">Card {cardNum}</span>
                          </div>
                          <span className="text-3xl">🎁</span>
                          <span className="font-bold text-amber-700 text-sm">Reward!</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-slate-300 dark:bg-slate-700 rounded-xl flex items-center justify-center">
                            <Gift className="w-6 h-6 text-slate-500" />
                          </div>
                          <span className="font-bold text-slate-400 text-sm">Card {cardNum}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {activeScratchCard && (
          <div
            className="fixed inset-0 animate-fade-in z-[9999] bg-slate-100 flex flex-col h-screen w-full"
          >
            {/* Header */}
            <div className="bg-[#1a362d] text-white pt-safe px-4 py-4 flex items-center gap-4 shadow-md shrink-0">
              <button
                onClick={() => goBackWithAd(() => setActiveScratchCard(null))}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-medium">Scratch Card</h3>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center gap-6">

              {/* Scratch Area */}
              <button
                onClick={async () => {
                  if (activeScratchCard.isRevealed || isLoading) return;
                  
                  // Unified Verified Action logic
                  handleVerifiedAdAction("Scratch Reward", async () => {
                    setIsLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${API_BASE}/api/earning/scratch-claim`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await response.json();
                      if (response.ok) {
                        setBalance(data.balance);
                        if (data.coins !== undefined) setCoins(data.coins);
                        else if (data.points !== undefined) setCoins(data.points);
                        if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                        else if (data.lifetimePoints !== undefined) setLifetimeCoins(data.lifetimePoints);
                        setScratchStatus({ lastScratchDate: data.lastScratchDate, count: data.count });
                        setActiveScratchCard(prev => ({ ...prev, isRevealed: true, reward: data.reward }));
                        showToast(`🎉 Congratulations! You won ${data.reward} Coins!`, "success");
                      } else {
                        showToast(data.message || 'Failed to scratch.', "error");
                      }
                    } catch (err) {
                      showToast('Network error.', "error");
                    } finally {
                      setIsLoading(false);
                    }
                  });
                }}
                disabled={activeScratchCard.isRevealed || isLoading}
                className="relative w-full max-w-sm aspect-square max-h-[350px] overflow-hidden rounded-md shadow-sm border border-slate-300 bg-emerald-700"
              >
                {/* The Revealed Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#348756] p-6 text-center text-white">
                  <div className="relative z-20 flex flex-col items-center drop-shadow-lg scale-125 my-4">
                    <span className="text-6xl font-black leading-none">{activeScratchCard.reward || '?'}</span>
                    <span className="text-2xl font-bold leading-none mt-1">Coins</span>
                  </div>
                  {activeScratchCard.isRevealed && (
                    <div className="text-xs font-bold text-white uppercase tracking-widest mt-8 bg-black/30 px-4 py-2 rounded-full">
                      Successfully Claimed!
                    </div>
                  )}
                </div>

                {/* The Cover (animated away when revealed) */}
                {!activeScratchCard.isRevealed && (
                    <div
                      className="absolute inset-0 z-10 bg-[#c53232] flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                    >
                       {/* Text shadow/cut effect in center */}
                       <div className="relative z-20 flex flex-col items-center drop-shadow-lg">
                          <span className="text-4xl font-black text-white/90 leading-none mb-2">SCRATCH</span>
                          <span className="text-4xl font-black text-white/90 leading-none">HERE!</span>
                       </div>
                    </div>
                  )}
                
              </button>

              <div className="mt-6 min-h-[280px] flex items-center justify-center">
                <BigAdBanner globalSettings={globalSettings} />
              </div>

            </div>
          </div>
        )}

      {showQuizSelection && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
              <div className="bg-slate-50 dark:bg-slate-900 pt-safe px-8 py-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 shrink-0">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Choose a Quiz</h3>
                <button 
                  onClick={() => setShowQuizSelection(false)} 
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                </button>
              </div>
              
              <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
                <p className="text-center text-slate-500 dark:text-slate-400 font-medium mb-4">Complete 10 quizzes daily to earn maximum Coins!</p>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'math', name: 'Math Quiz', icon: '🔢', color: 'from-blue-500 to-indigo-600', pts: '+20 Coins', desc: 'Test your calculation speed' },
                    { id: 'binary', name: 'Binary Quiz', icon: '💻', color: 'from-purple-500 to-violet-600', pts: '+20 Coins', desc: 'Logic and computation puzzles' },
                    { id: 'word', name: 'Word Quiz', icon: '📝', color: 'from-amber-500 to-orange-600', pts: '+20 Coins', desc: 'Vocabulary and word finding' },
                    { id: 'gk', name: 'Daily Trivia', icon: '🌍', color: 'from-emerald-500 to-teal-600', pts: '+50 Coins', desc: 'General knowledge challenges' }
                  ].map((quiz) => (
                    <button
                      key={quiz.id}
                      onClick={() => {
                        setShowQuizSelection(false);
                        if (quiz.id === 'gk') {
                          startGkQuiz();
                        } else {
                          launchQuiz(quiz.id);
                        }
                      }}
                      className="flex items-center justify-between w-full p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-14 h-14 bg-gradient-to-br ${quiz.color} flex items-center justify-center rounded-2xl text-3xl shadow-lg group-hover:scale-110 transition-transform shrink-0`}>
                          {quiz.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{quiz.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{quiz.desc}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full text-xs font-bold shrink-0">
                        {quiz.pts}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="text-center pt-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Daily Limit: {quizStatus.count}/10 Complete</p>
                  <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-brand-500"
                      style={{ width: `${(quizStatus.count / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <BigAdBanner globalSettings={globalSettings} />
                </div>
              </div>
          </div>
        )}

      {showLevelView && (
          <div
            className="fixed inset-0 animate-fade-in z-[120] bg-[#050B14]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div
              className="bg-[#0F172A] w-full max-w-[400px] rounded-[2.5rem] shadow-2xl border border-slate-800 flex flex-col items-center relative overflow-hidden p-6 pb-8 my-auto"
            >
              {/* Back Button */}
              <button 
                onClick={() => setShowLevelView(false)}
                className="absolute top-5 left-5 text-slate-400 hover:text-white transition-colors z-20"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>

              {/* Level Badge */}
              <div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-xl shadow-orange-500/30 flex items-center justify-center border-4 border-amber-300/30 mt-6 mb-3 animate-float"
              >
                <span className="font-black text-white text-3xl">{levelInfo.level}</span>
              </div>
              <h2 className="text-2xl font-black text-white">{levelInfo.label}</h2>
              <p className="text-sm text-slate-400 font-medium mb-6">
                {lifetimeCoins.toLocaleString()} lifetime coins collected
              </p>
              
              {/* Current Level Progress */}
              <div className="w-full bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 mb-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                    {levelInfo.isMax ? 'Max Level Reached!' : `Progress to Level ${levelInfo.level + 1}`}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {levelInfo.isMax ? '✓' : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {!levelInfo.isMax && (
                  <p className="text-[11px] text-slate-500 mt-2 text-center">
                    {(levelInfo.target - levelInfo.current).toLocaleString()} coins to level up
                  </p>
                )}
              </div>

              {/* All Levels */}
              <div className="w-full space-y-2">
                {[
                  { lv: 1, from: 0, to: 1500 },
                  { lv: 2, from: 1500, to: 3500 },
                  { lv: 3, from: 3500, to: 6000 },
                  { lv: 4, from: 6000, to: 10000 },
                  { lv: 5, from: 10000, to: null },
                ].map((tier) => {
                  const isActive = levelInfo.level === tier.lv;
                  const isCompleted = levelInfo.level > tier.lv;
                  return (
                    <div key={tier.lv} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isActive ? 'bg-amber-500/10 border border-amber-500/30' 
                      : isCompleted ? 'bg-slate-800/40 border border-slate-700/30' 
                      : 'bg-slate-800/20 border border-slate-800/50'}
                    `}>
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm ${
                        isActive ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/20'
                        : isCompleted ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-700/50 text-slate-500'}
                      `}>
                        {isCompleted ? <Check className="w-4 h-4" /> : tier.lv}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${
                          isActive ? 'text-amber-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          Level {tier.lv} {tier.to === null && '(Max)'}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {tier.to !== null ? `${tier.from.toLocaleString()} — ${tier.to.toLocaleString()} Coins` : `${tier.from.toLocaleString()}+ Coins`}
                        </p>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">CURRENT</span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-black text-emerald-400">DONE</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => goBackWithAd(() => setShowLevelView(false))}
                className="mt-8 w-full py-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black shadow-lg shadow-orange-500/20 transform-gpu text-sm uppercase tracking-wide"
              >
                Continue Earning
              </button>
            </div>
          </div>
        )}

      {showMysteryBoxView && (
        <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
          <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Mystery Box</h3>
            <button onClick={() => goBackWithAd(() => setShowMysteryBoxView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 flex flex-col items-center">
            <div className="text-center space-y-2">
              <p className="text-slate-500 dark:text-slate-400 font-medium">Open the Mystery Box to earn random Coins (1-45)!</p>
              <p className="text-xs text-slate-400">Available once per day</p>
            </div>

            <button
              disabled={mysteryBoxStatus.claimedToday || isOpeningBox || isLoading}
              onClick={() => {
                if (mysteryBoxStatus.claimedToday || isOpeningBox || isLoading) return;
                
                AdMobService.showInterstitial(
                  async () => {
                    setIsOpeningBox(true);
                    setIsLoading(true);
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${API_BASE}/api/earning/mystery-claim`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      const data = await response.json();
                      
                      // Simulate box opening animation delay
                      setTimeout(() => {
                        setIsOpeningBox(false);
                        setIsLoading(false);
                        if (response.ok) {
                          setBalance(data.balance);
                          if (data.coins !== undefined) setCoins(data.coins);
                          if (data.lifetimeCoins !== undefined) setLifetimeCoins(data.lifetimeCoins);
                          setMysteryBoxStatus({ lastMysteryBoxDate: data.lastMysteryBoxDate, claimedToday: true });
                          setMysteryBoxReward(data.reward);
                          showToast(`🎉 Congratulations! You won ${data.reward} Coins!`, "success");
                        } else {
                          showToast(data.message || 'Failed to open Mystery Box.', "error");
                        }
                      }, 2000);
                    } catch (err) {
                      setIsOpeningBox(false);
                      setIsLoading(false);
                      showToast('Network error.', "error");
                    }
                  },
                  (errMsg) => {
                    showToast(errMsg || "Ad failed to load. Please try again to open Mystery Box.", "error");
                  }
                );
              }}
              className={`relative flex flex-col items-center justify-center p-8 rounded-3xl transition-all overflow-hidden ${
                mysteryBoxStatus.claimedToday
                  ? 'bg-slate-100 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-slate-700 opacity-70 cursor-not-allowed'
                  : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border-2 border-rose-300 dark:border-rose-700 shadow-xl cursor-pointer hover:scale-105 active:scale-95 group'
              }`}
            >
              {mysteryBoxStatus.claimedToday ? (
                <>
                  <div className="text-6xl mb-4 grayscale opacity-50">📤</div>
                  <span className="font-bold text-slate-400 dark:text-slate-500 text-lg">Already Claimed</span>
                  <span className="mt-2 text-xs text-rose-500 font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full">Come back tomorrow!</span>
                </>
              ) : mysteryBoxReward ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce-subtle">🎉</div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-2xl">+{mysteryBoxReward} Coins</span>
                  <span className="mt-2 text-xs text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full">Reward Claimed!</span>
                </>
              ) : isOpeningBox ? (
                <>
                  <div className="text-6xl mb-4 animate-bounce">🎁</div>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-lg animate-pulse">Opening...</span>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4 animate-wiggle group-hover:animate-shake">🎁</div>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-xl tracking-wide drop-shadow-sm">OPEN BOX</span>
                  <span className="text-xs font-bold text-slate-500 mt-2">Tap to reveal reward</span>
                </>
              )}
            </button>

            <div className="mt-auto pt-8">
              <BigAdBanner globalSettings={globalSettings} />
            </div>
          </div>
        </div>
      )}

      {showWeeklyMissionsView && (
        <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 pt-safe px-6 py-5 flex justify-between items-center shrink-0 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Weekly Missions</h3>
                <p className="text-indigo-200 text-xs font-medium">Complete missions to earn rewards!</p>
              </div>
            </div>
            <button onClick={() => goBackWithAd(() => setShowWeeklyMissionsView(false))} className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Progress bar showing missions cleared */}
          {weeklyMissions.length > 0 && (
            <div className="bg-indigo-600 px-6 pb-4 shrink-0">
              <div className="flex items-center justify-between text-indigo-200 text-xs font-bold mb-2">
                <span>MISSIONS CLEARED</span>
                <span>{weeklyMissions.filter(m => m.isCompleted).length}/{weeklyMissions.length}</span>
              </div>
              <div className="h-2 bg-indigo-800/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${weeklyMissions.length > 0 ? (weeklyMissions.filter(m => m.isCompleted).length / weeklyMissions.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {weeklyMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="w-10 h-10 text-indigo-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">No Active Missions</p>
                <p className="text-slate-400 text-sm mt-1">Check back later for new missions!</p>
              </div>
            ) : (
              weeklyMissions.map((mission, idx) => {
                const isReferType = mission.missionType === 'refer';
                const progress = isReferType ? (mission.currentProgress || 0) : 0;
                const target = isReferType ? (mission.targetCount || 5) : 1;
                const progressPct = isReferType ? Math.min((progress / target) * 100, 100) : (mission.isCompleted ? 100 : 0);
                const canClaim = mission.canClaim !== undefined ? mission.canClaim : !mission.isCompleted;

                return (
                  <div
                    key={mission._id}
                    className={`relative bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border transition-all ${
                      mission.isCompleted
                        ? 'border-emerald-300 dark:border-emerald-700/50 opacity-80'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Completed badge */}
                    {mission.isCompleted && (
                      <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3" /> Claimed
                      </div>
                    )}

                    <div className="p-5">
                      {/* Mission type badge */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl ${
                          isReferType
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30'
                            : 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-lg shadow-blue-500/30'
                        }`}>
                          {isReferType ? '👥' : '🎯'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              isReferType
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            }`}>
                              {isReferType ? '🔗 Refer Mission' : '📋 Task Mission'}
                            </span>
                          </div>
                          <h4 className="font-black text-slate-800 dark:text-white text-base leading-tight">{mission.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{mission.description}</p>
                        </div>
                      </div>

                      {/* Progress bar for refer-type missions */}
                      {isReferType && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs font-bold mb-2">
                            <span className="text-slate-500 dark:text-slate-400">Progress</span>
                            <span className={`${progress >= target ? 'text-emerald-500' : 'text-amber-500'} font-black`}>
                              {progress}/{target} Referrals with VPN
                            </span>
                          </div>
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                progressPct >= 100
                                  ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                                  : 'bg-gradient-to-r from-amber-400 to-orange-500'
                              }`}
                              style={{ width: `${Math.max(progressPct, 3)}%` }}
                            />
                          </div>
                          {progress < target && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-medium">
                              💡 Invite {target - progress} more friend{target - progress > 1 ? 's' : ''} who purchase a VPN plan
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bottom row: reward + action */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-3 py-2 rounded-2xl">
                          <span className="text-lg">💰</span>
                          <span className="font-black text-amber-600 dark:text-amber-400 text-sm">+{mission.rewardCoins} Coins</span>
                        </div>

                        {mission.isCompleted ? (
                          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl font-black text-sm">
                            <Check className="w-4 h-4" /> Claimed!
                          </div>
                        ) : isReferType ? (
                          <button
                            onClick={async () => {
                              if (!canClaim) return;
                              AdMobService.showInterstitial(
                                async () => {
                                  setIsLoading(true);
                                  try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(`${API_BASE}/api/earning/weekly-missions/complete/${mission._id}`, {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const data = await response.json();
                                    setIsLoading(false);
                                    if (response.ok) {
                                      showToast(data.message || 'Mission completed!', 'success');
                                      fetchBalance();
                                      fetchWeeklyMissions();
                                    } else {
                                      showToast(data.message || 'Failed', 'error');
                                    }
                                  } catch (err) {
                                    setIsLoading(false);
                                    showToast('Network error', 'error');
                                  }
                                },
                                (errMsg) => {
                                  showToast(errMsg || "Ad failed to load. Please try again.", "error");
                                }
                              );
                            }}
                            disabled={!canClaim || isLoading}
                            className={`px-5 py-2 rounded-2xl text-sm font-black transition-all active:scale-95 ${
                              canClaim
                                ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {canClaim ? '🎁 Claim Reward' : `${progress}/${target} Done`}
                          </button>
                        ) : (
                          <button
                            onClick={async () => {
                              if (mission.actionUrl) window.open(mission.actionUrl, '_blank');
                              AdMobService.showInterstitial(
                                async () => {
                                  setIsLoading(true);
                                  try {
                                    const token = localStorage.getItem('token');
                                    const response = await fetch(`${API_BASE}/api/earning/weekly-missions/complete/${mission._id}`, {
                                      method: 'POST',
                                      headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const data = await response.json();
                                    setIsLoading(false);
                                    if (response.ok) {
                                      showToast(data.message || 'Mission completed!', 'success');
                                      fetchBalance();
                                      fetchWeeklyMissions();
                                    } else {
                                      showToast(data.message || 'Failed', 'error');
                                    }
                                  } catch (err) {
                                    setIsLoading(false);
                                    showToast('Network error', 'error');
                                  }
                                },
                                (errMsg) => {
                                  showToast(errMsg || "Ad failed to load. Please try again.", "error");
                                }
                              );
                            }}
                            disabled={isLoading}
                            className="px-5 py-2 rounded-2xl text-sm font-black bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95 transition-all"
                          >
                            🎯 Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div className="mt-4 pb-6">
              <BigAdBanner globalSettings={globalSettings} />
            </div>
          </div>
        </div>
      )}


      {showCheckinView && !showAdOverlay && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full">
               <div className="bg-slate-50 dark:bg-slate-950 pt-safe px-6 py-5 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Daily Checkin</h3>
                  <button onClick={() => goBackWithAd(() => setShowCheckinView(false))} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                     <ArrowLeft className="w-6 h-6 hover:-translate-x-1 transition-transform" />
                  </button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 space-y-8">
                  <div className="text-center space-y-2">
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Watch 2 ads every 2 hours to earn Coins!</p>
                     <div className="flex items-center justify-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 1 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${checkinStatus.count >= 2 ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     {checkinStatus.count < 1 && (
                        <button
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl group shadow-sm transform-gpu"
                        >
                           <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-orange-700 dark:text-orange-400">Ad 1</span>
                        </button>
                     )}

                     {checkinStatus.count < 2 && (
                        <button
                           onClick={startAd}
                           className="flex flex-col items-center gap-4 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl group shadow-sm transform-gpu"
                        >
                           <div className="bg-blue-500 text-white p-4 rounded-xl shadow-lg group-hover:rotate-12 transition-transform">
                              <Film className="w-8 h-8" />
                           </div>
                           <span className="font-bold text-blue-700 dark:text-blue-400">Ad 2</span>
                        </button>
                     )}

                     {checkinStatus.count >= 2 && (
                        <div className="col-span-2 text-center py-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 dark:border-green-800">
                           <p className="text-green-600 dark:text-green-400 font-bold">Both ads completed! 🎉</p>
                        </div>
                     )}
                  </div>
               </div>
          </div>
      )}

      {showGkQuizView && gkQuizQuestions.length > 0 && (
          <div className="fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 flex flex-col h-screen w-full overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 pt-safe px-6 py-4 flex justify-between items-center shadow-lg shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6" /> Gen. Knowledge
              </h3>
              <div className="flex items-center gap-3">
                <div className="text-white font-bold bg-black/20 px-3 py-1 rounded-full text-sm">
                  {currentGkIndex + 1} / 10
                </div>
                <button onClick={() => goBackWithAd(() => setShowGkQuizView(false))} className="text-white p-1">
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="h-1.5 bg-amber-100 dark:bg-amber-900/30">
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${((currentGkIndex + 1) / 10) * 100}%` }}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <p className="text-center text-slate-500 dark:text-slate-400 font-semibold text-lg">
                Who or what is this? 🏆
              </p>

              <div className="flex justify-center">
                <div className="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 ring-8 ring-amber-500/10">
                  <img
                    src={gkQuizQuestions[currentGkIndex].image}
                    alt="Quiz"
                    className="w-full h-full object-cover object-center"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(gkQuizQuestions[currentGkIndex].answer)}&size=300&background=f59e0b&color=fff&bold=true`;
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gkQuizQuestions[currentGkIndex].options.map((option, idx) => {
                  const isSelected = gkSelected === option;
                  const isCorrect = gkAnswered && option === gkQuizQuestions[currentGkIndex].answer;
                  const isWrong = gkAnswered && isSelected && option !== gkQuizQuestions[currentGkIndex].answer;

                  let btnClass = "w-full px-6 py-4 rounded-2xl font-black text-base transition-all border-2 text-center ";
                  if (gkAnswered) {
                    if (isCorrect) {
                      btnClass += "bg-emerald-500 border-emerald-400 text-white scale-[1.02] shadow-emerald-500/20 shadow-lg";
                    } else if (isWrong) {
                      btnClass += "bg-rose-500 border-rose-400 text-white";
                    } else {
                      btnClass += "bg-slate-100 border-transparent text-slate-400 dark:bg-slate-800 dark:border-slate-700 opacity-40";
                    }
                  } else if (isSelected) {
                    btnClass += "bg-amber-500 border-amber-400 text-white scale-[1.02] shadow-amber-500/20 shadow-lg";
                  } else {
                    btnClass += "bg-white border-slate-200 hover:border-amber-400 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleGkAnswer(option)}
                      disabled={gkAnswered}
                      className={btnClass}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Submit Button for GK Quiz */}
              {gkSelected && !gkAnswered && (
                <div className="w-full">
                  <button
                    onClick={handleGkSubmit}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-lg shadow-xl shadow-amber-500/30 active:scale-95 transition-transform relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite]" />
                    <span className="relative z-10">✅ Submit Answer</span>
                  </button>
                </div>
              )}

              <div className="mt-auto pt-8">
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-center">
                  <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1">Current Progress</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">Score: {gkQuizScore} / {currentGkIndex} correct</p>
                  <p className="text-xs text-slate-400 font-medium mt-1">Need 5+ correct answers to earn 40 Coins</p>
                </div>
              </div>
              <div className="mt-8 flex justify-center">
                <BigAdBanner globalSettings={globalSettings} />
              </div>
            </div>
          </div>
        )}
      

    <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-24 md:pb-8">

      {/* Responsive Container */}
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 md:rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 mt-2">

        {/* Top Header - Total Points & MY WALLET buttons */}
        <div className="bg-[#f5f3ff] dark:bg-slate-900 text-slate-800 dark:text-white px-2 sm:px-6 py-3.5 sm:py-4 flex flex-col items-center gap-4 border-b border-purple-100 dark:border-slate-800">
            {/* Buttons Row */}
            <div className="flex justify-center items-center gap-3 sm:gap-4 w-full max-w-md">
              {/* Total Points Card - static info badge, does not navigate */}
              <div
                className="flex-1 py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 border-2 shadow-sm bg-gradient-to-r from-amber-400 to-orange-400 border-amber-400/40 text-white whitespace-nowrap min-w-0 select-none cursor-default"
              >
                <span className="text-base flex-shrink-0">🪙</span>
                <span className="text-xs font-bold uppercase tracking-wide opacity-90 flex-shrink-0">Points</span>
                <span className="text-sm font-black flex-shrink-0">{coins.toLocaleString()}</span>
                <span className="ml-1 bg-white/25 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white/30 flex-shrink-0">
                  Lv.{levelInfo.level}
                </span>
              </div>
              <button
                onClick={() => setActiveEarningTab('wallet')}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 py-3 px-4 rounded-2xl border-2 border-purple-500/30 shadow-md shadow-purple-500/20 transform-gpu text-white hover:opacity-90 transition-all duration-300"
              >
                 <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                 <span className="text-sm sm:text-base font-black uppercase tracking-tight">My Wallet</span>
              </button>
            </div>
        </div>


        {/* Content */}
        <div className="p-2 sm:p-5 md:p-10 space-y-8 md:space-y-10 bg-white dark:bg-slate-900">

        {/* ─── WALLET TAB ─── */}
        {activeEarningTab === 'wallet' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h2 className="text-xl font-black text-slate-800 dark:text-white">Wallet</h2>
            </div>
            {/* ═══ Professional Balance Dashboard ═══ */}
            <div className="grid grid-cols-2 gap-3">
               {/* Cash Balance Card */}
               <div className="relative rounded-[1.25rem] p-4 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md group">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-inner shadow-blue-500/20 transform group-hover:scale-105 transition-transform">
                       <Wallet className="w-4 h-4 text-white" />
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">Balance</p>
                   </div>
                 </div>
                 
                 <div className="flex items-baseline gap-1">
                   <span className="text-lg font-semibold text-slate-400 dark:text-slate-500">৳</span>
                   <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                     {balance.toLocaleString()}
                   </p>
                 </div>
                 
                 <div className="mt-2">
                   <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                     Min. Withdraw <span className="text-blue-500 dark:text-blue-400">1,000 ৳</span>
                   </p>
                 </div>
                 {withdrawSuccess && (
                   <div className="absolute top-4 right-4">
                     <span className="flex h-2.5 w-2.5">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                     </span>
                   </div>
                 )}
               </div>

               {/* Coin Balance Card */}
               <div className="relative rounded-[1.25rem] p-4 overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md group">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-inner shadow-orange-500/20 transform group-hover:scale-105 transition-transform">
                       <Medal className="w-4 h-4 text-white" />
                     </div>
                     <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">Coins</p>
                   </div>
                 </div>
                 
                 <div className="flex items-baseline gap-1">
                   <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                     {coins.toLocaleString()}
                   </p>
                 </div>
                 
                 <div className="mt-2">
                   <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                     Lifetime <span className="text-amber-500 dark:text-amber-400">{lifetimeCoins.toLocaleString()}</span>
                   </p>
                 </div>
               </div>
            </div>

            {/* ═══ Premium Coin Conversion Section ═══ */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/80 rounded-3xl p-1 shadow-inner border border-amber-100 dark:border-slate-700 mt-2">
               <div className="absolute inset-0 bg-white/40 dark:bg-white/5 backdrop-blur-xl" />
               <div className="relative bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-[1.35rem] p-5 border border-white/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20 transform-gpu transition-transform hover:rotate-12">
                       <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                    <div>
                       <p className="text-base font-black text-slate-800 dark:text-white tracking-tight">Convert Coins to Cash</p>
                       <div className="flex items-center gap-2 mt-1">
                         <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Rate</span>
                         <p className="text-xs text-slate-500 font-bold">1000 Coins = 50 ৳</p>
                       </div>
                    </div>
                 </div>
                 <button
                   onClick={handleConvertCoins}
                   disabled={coins < 1000 || isLoading}
                   className={`relative overflow-hidden px-8 py-3.5 rounded-xl font-black text-sm shadow-xl transition-all duration-300 transform-gpu group ${
                     coins < 1000 
                       ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                       : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-105 shadow-orange-500/30'
                   }`}
                 >
                   {coins >= 1000 && (
                     <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                   )}
                   <span className="relative z-10">{isLoading ? 'Converting...' : 'Convert Now'}</span>
                 </button>
               </div>
            </div>


            {/* ═══ Premium Inputs ═══ */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 space-y-6 mt-4">
              
              {/* Amount Input */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Withdrawal Amount</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <span className="text-slate-600 dark:text-slate-300 font-black text-sm">৳</span>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Min. 1,000 ৳"
                    className="w-full pl-16 pr-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white font-black text-xl focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-600 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Account Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={e => setWithdrawPhone(e.target.value)}
                    placeholder="01X XXXX XXXX"
                    className="w-full pl-16 pr-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-white font-black text-lg tracking-wide focus:outline-none focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm group-hover:border-slate-200 dark:group-hover:border-slate-600 placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {withdrawMethods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      if (m.available) setWithdrawMethod(m.id);
                      else showToast('Currently unavailable', 'error');
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-300 transform-gpu ${
                      !m.available
                        ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 opacity-60 hover:opacity-80'
                        : withdrawMethod === m.id
                          ? 'border-brand-500 bg-gradient-to-b from-brand-50 to-white dark:from-brand-900/30 dark:to-slate-800 shadow-xl shadow-brand-500/20 scale-105 z-10 ring-4 ring-brand-500/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md'
                    }`}
                  >
                    {!m.available && (
                      <div className="absolute inset-0 bg-slate-100/40 dark:bg-slate-900/40 rounded-xl backdrop-blur-[1px] flex items-center justify-center z-10">
                        <span className="bg-slate-800/80 text-white text-[8px] sm:text-[9px] font-black px-2 py-1 rounded-full backdrop-blur-md shadow-sm transform -rotate-12 whitespace-nowrap">UNAVAILABLE</span>
                      </div>
                    )}
                    
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mb-2 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-700 p-1.5 sm:p-2 transition-transform ${withdrawMethod === m.id ? 'scale-110 shadow-brand-500/30' : ''}`}>
                      {m.logo ? (
                        <img src={m.logo} alt={m.name} className="w-full h-full object-contain drop-shadow-sm" />
                      ) : (
                        <Wallet className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <span className={`text-[10px] sm:text-xs font-black tracking-tight text-center ${
                      !m.available ? 'text-slate-400' : withdrawMethod === m.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {m.name}
                    </span>
                    
                    {withdrawMethod === m.id && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 border-2 border-white dark:border-slate-900 animate-bounce-subtle">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleWithdraw}
                  disabled={withdrawLoading}
                  className="relative w-full overflow-hidden group rounded-2xl p-[2px] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-400 via-indigo-500 to-brand-600 rounded-2xl animate-gradient-xy opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-brand-600 to-indigo-600 py-4 px-6 rounded-[14px] flex items-center justify-center gap-2 shadow-xl">
                    {withdrawLoading ? (
                      <span className="flex items-center justify-center gap-2 text-white font-black text-base tracking-wide">
                        <span className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                        Processing...
                      </span>
                    ) : (
                      <span className="text-white font-black text-lg tracking-wide flex items-center gap-2">
                        Request Withdrawal <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </div>
                </button>
                <p className="text-center text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                  Secure & Encrypted • 1–3 Business Days
                </p>
              </div>
            </div>

            {/* ═══ Withdrawal History Section ═══ */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="font-black text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-brand-500" /> Recent Withdrawals
              </h3>
              <div className="space-y-3">
                {withdrawHistory && withdrawHistory.length > 0 ? withdrawHistory.map((item) => (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 text-white font-black text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{blurPhone(item.phone)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.date} • {item.method}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-800 dark:text-white">৳{item.amount.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>{item.status === 'completed' ? '✓ Completed' : '⏱ Pending'}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No withdrawal history yet</p>
                  </div>
                )}
                {withdrawHistory && withdrawHistory.length > 0 && (
                  <BannerAd globalSettings={globalSettings} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {activeEarningTab === 'history' && (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-2">
               <button
                 onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} 
                 className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 transform-gpu"
               >
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="font-black text-slate-800 dark:text-white text-lg">Withdrawal History</h3>
            </div>

            <div className="space-y-3">
              {displayWithdrawals.length > 0 ? displayWithdrawals.map((item, index) => (
                <React.Fragment key={item.id}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shrink-0 text-white font-black text-sm">
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{blurPhone(item.phone)}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.date} • {item.method}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-slate-800 dark:text-white">৳{item.amount.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                      }`}>{item.status === 'completed' ? 'Completed' : 'Pending'}</span>
                    </div>
                  </div>
                  {(index + 1) % 3 === 0 && index !== displayWithdrawals.length - 1 && (
                    <BannerAd globalSettings={globalSettings} />
                  )}
                </React.Fragment>
              )) : (
                <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <History className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No withdrawal history yet</p>
                </div>
              )}
            </div>
            {displayWithdrawals.length === 0 && (
              <p className="text-center text-xs text-slate-400 pt-2">No withdrawals yet. Make your first withdrawal to see it here.</p>
            )}
          </div>
        )}

        {/* ─── TUTORIAL TAB ─── */}
        {activeEarningTab === 'tutorial' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => goBackWithAd(() => setActiveEarningTab('rewards'))} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h3 className="font-black text-slate-800 dark:text-white text-lg">Tutorial</h3>
            </div>

            {/* Video Ad Placeholder - populated from Admin Panel */}
            <div className="w-full aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-purple-900/20" />
              <div className="relative flex flex-col items-center gap-3 text-center px-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p className="text-white font-bold text-base">Tutorial Video</p>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-center">
              <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">📹 Official video guide for the Zenivio ecosystem.</p>
            </div>
          </div>
        )}

        {/* ─── MY REWARDS TAB (existing content) ─── */}
        {activeEarningTab === 'rewards' && (
          <>

          {/* Featured Row: Daily Checkin + Refer */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto px-2">
            {(mainOptions || []).map((item) => (
              <OptionCard key={'feat-' + item.id} item={item} />
            ))}
          </div>

          {/* ═══════ LEVEL 1 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay when not Premium - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">1</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 1</h3>
                  <p className="text-[11px] text-slate-400 font-medium">0 — 1,500 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-amber-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 md:gap-6 justify-items-center">
                {[
                  { id: 'l1-article', name: 'Articles', icon: <ArticlesIcon className="w-7 h-7" />, coins: 15, color: 'from-blue-400 to-indigo-500', action: () => setShowArticleListView(true), count: articleReadCount, maxCount: 5 },
                  { id: 'l1-videos', name: 'Videos', icon: <VideosIcon className="w-7 h-7" />, coins: 25, color: 'from-purple-400 to-pink-500', action: () => openMultiAdView({ key: 'videos', name: 'Videos', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-purple-400 to-pink-500' }), count: getMultiAdCount('videos'), maxCount: 5 },
                  { id: 'l1-games', name: 'Games', icon: <GamesIcon className="w-7 h-7" />, coins: 50, color: 'from-emerald-400 to-teal-500', action: () => setShowGamesView(true) },
                  { id: 'l1-wheel', name: 'Fortune Wheel', icon: <FortuneWheelIcon className="w-7 h-7" />, coins: null, color: 'from-amber-400 to-orange-500', action: () => setShowWheelView(true) },
                  { id: 'l1-ads', name: 'View Ads', icon: <ViewAdsIcon className="w-7 h-7" />, coins: 10, color: 'from-sky-400 to-cyan-500', action: () => openMultiAdView({ key: 'view_ads', name: 'View Ads', adType: 'interstitial', coins: 10, logo: 'https://img.icons8.com/color/96/monitor.png', color: 'from-sky-400 to-cyan-500' }), count: getMultiAdCount('view_ads'), maxCount: 5 },
                ].map(item => <OptionCard key={item.id} item={item} count={item.count} maxCount={item.maxCount} isLocked={false} />)}
              </div>
            </div>
          </div>

          {/* Promotional Banner */}
          {activeBanners.length > 0 && (
            <div className="w-[calc(100%+2rem)] -ml-4 sm:w-full sm:ml-0 max-w-2xl sm:mx-auto mb-8">
              <div 
                className="w-full aspect-[468/200] max-h-[200px] overflow-hidden sm:rounded-2xl shadow-lg border-y sm:border-x border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative cursor-pointer group"
                onClick={() => handleBannerClick(activeBanners[activePromoBannerIndex]?.linkUrl)}
              >
                <AnimatePresence>
                  {activeBanners[activePromoBannerIndex]?.imageUrl && (
                    <motion.img 
                      key={activePromoBannerIndex}
                      src={(() => {
                        const url = activeBanners[activePromoBannerIndex].imageUrl;
                        if (!url) return '';
                        if (url.startsWith('http') || url.startsWith('data:')) return url;
                        return `${API_BASE}/api/image?file=${encodeURIComponent(url)}`;
                      })()}
                      alt={`Promotional Banner ${activePromoBannerIndex + 1}`} 
                      className="w-full h-full object-cover absolute inset-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Pagination Dots */}
                {activeBanners.length > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {activeBanners.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          idx === activePromoBannerIndex 
                            ? 'bg-white w-4' 
                            : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}



          {/* ═══════ LEVEL 2 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay for Level 2 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">2</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 2</h3>
                  <p className="text-[11px] text-slate-400 font-medium">1,500 — 3,500 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-sky-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 md:gap-5 justify-items-center">
                {[
                  { id: 'l2-scratch', name: 'Scratch Card', icon: <ScratchCardIcon className="w-7 h-7" />, coins: null, color: 'from-rose-400 to-pink-500', action: () => setShowScratchView(true) },
                  { id: 'l2-quiz', name: 'Quizzes', icon: <QuizzesIcon className="w-7 h-7" />, coins: 20, color: 'from-violet-400 to-purple-500', action: () => setShowQuizSelection(true) },
                  { id: 'l2-daily-quiz', name: 'Daily Quiz', icon: <DailyQuizIcon className="w-7 h-7" />, coins: 50, color: 'from-amber-500 to-orange-600', action: () => setShowQuizSelection(true) },
                  { id: 'l2-math', name: 'Math Quiz', icon: <MathQuizIcon className="w-7 h-7" />, coins: 20, color: 'from-blue-500 to-indigo-600', action: () => launchQuiz('math') },
                  { id: 'l2-binary', name: 'Binary Quiz', icon: <BinaryQuizIcon className="w-7 h-7" />, coins: 30, color: 'from-purple-500 to-pink-600', action: () => launchQuiz('binary') },
                  { id: 'l2-word', name: 'Word Quiz', icon: <WordQuizIcon className="w-7 h-7" />, coins: 25, color: 'from-emerald-500 to-teal-600', action: () => launchQuiz('word') },
                  { id: 'l2-gk', name: 'Gen. Knowledge', icon: <GkQuizIcon className="w-7 h-7" />, coins: 40, color: 'from-amber-500 to-orange-600', action: () => launchQuiz('gk') },
                ].map(item => <OptionCard key={item.id} item={item} isLocked={levelInfo.level < 2} onLockedClick={() => { setLockPopupLevel(2); setShowLockPopup(true); }} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd globalSettings={globalSettings} />

          {/* ═══════ LEVEL 3 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 3 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">3</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 3</h3>
                  <p className="text-[11px] text-slate-400 font-medium">3,500 — 6,000 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-emerald-400/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 gap-4 md:gap-6 justify-items-center">
                {[
                  { id: 'l3-youtube', name: 'YouTube', icon: <YouTubeIcon className="w-7 h-7" />, coins: 30, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'youtube', name: 'YouTube', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l3-tiktok', name: 'TikTok', icon: <TikTokIcon className="w-7 h-7" />, coins: 25, color: 'from-slate-800 to-slate-900', action: () => openMultiAdView({ key: 'tiktok', name: 'TikTok', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/tiktok.png', color: 'from-slate-800 to-slate-900' }) },
                  { id: 'l3-facebook', name: 'Facebook', icon: <FacebookIcon className="w-7 h-7" />, coins: 20, color: 'from-blue-500 to-blue-700', action: () => openMultiAdView({ key: 'facebook', name: 'Facebook', adType: 'rewarded', coins: 20, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-blue-500 to-blue-700' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l3-',''))} maxCount={5} isLocked={levelInfo.level < 3} onLockedClick={() => { setLockPopupLevel(3); setShowLockPopup(true); }} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd globalSettings={globalSettings} />

          {/* ═══════ LEVEL 4 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 4 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">4</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 4</h3>
                  <p className="text-[11px] text-slate-400 font-medium">6,000 — 10,000 Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4 justify-items-center">
                {[
                  { id: 'l4-reward-video', name: 'Reward Video', icon: <RewardVideoIcon className="w-7 h-7" />, coins: 25, color: 'from-red-500 to-rose-600', action: () => openMultiAdView({ key: 'reward_video', name: 'Reward Video', adType: 'rewarded', coins: 25, logo: 'https://img.icons8.com/color/96/youtube-play.png', color: 'from-red-500 to-rose-600' }) },
                  { id: 'l4-interstitial', name: 'Interstitial Ad', icon: <InterstitialAdIcon className="w-7 h-7" />, coins: 15, color: 'from-blue-500 to-indigo-600', action: () => openMultiAdView({ key: 'interstitial_ad', name: 'Interstitial Ad', adType: 'interstitial', coins: 15, logo: 'https://img.icons8.com/color/96/google-ads.png', color: 'from-blue-500 to-indigo-600' }) },
                  { id: 'l4-native', name: 'Native Ad Click', icon: <NativeAdClickIcon className="w-7 h-7" />, coins: 10, color: 'from-indigo-500 to-blue-600', action: () => openMultiAdView({ key: 'native_ad', name: 'Native Ad Click', adType: 'rewarded', coins: 10, logo: 'https://img.icons8.com/color/96/facebook-new.png', color: 'from-indigo-500 to-blue-600' }) },
                  { id: 'l4-bonus', name: 'Bonus Ad', icon: <BonusAdIcon className="w-7 h-7" />, coins: 30, color: 'from-amber-400 to-orange-500', action: () => openMultiAdView({ key: 'bonus_ad', name: 'Bonus Ad', adType: 'rewarded', coins: 30, logo: 'https://img.icons8.com/color/96/gift.png', color: 'from-amber-400 to-orange-500' }) },
                  { id: 'l4-hourly', name: 'Hourly Ad', icon: <HourlyAdIcon className="w-7 h-7" />, coins: 20, color: 'from-teal-400 to-emerald-500', action: () => openMultiAdView({ key: 'hourly_ad', name: 'Hourly Ad', adType: 'interstitial', coins: 20, logo: 'https://img.icons8.com/color/96/hourglass.png', color: 'from-teal-400 to-emerald-500' }) },
                  { id: 'l4-weekly-refer', name: 'Meta', icon: <MetaIcon className="w-7 h-7" />, coins: 50, color: 'from-purple-400 to-pink-500', action: () => openMultiAdView({ key: 'weekly_refer', name: 'Meta', adType: 'rewarded', coins: 50, logo: 'https://img.icons8.com/color/96/conference-call.png', color: 'from-purple-400 to-pink-500' }) },
                  { id: 'l4-surprise', name: 'Surprise Bonus', icon: <SurpriseBonusIcon className="w-7 h-7" />, coins: 50, color: 'from-pink-400 to-rose-500', action: () => openMultiAdView({ key: 'surprise_bonus', name: 'Surprise Bonus', adType: 'rewarded', coins: 50, logo: 'https://img.icons8.com/color/96/confetti.png', color: 'from-pink-400 to-rose-500' }) },
                ].map(item => <OptionCard key={item.id} item={item} count={getMultiAdCount(item.id.replace('l4-','').replace(/-/g,'_'))} maxCount={5} isLocked={levelInfo.level < 4} onLockedClick={() => { setLockPopupLevel(4); setShowLockPopup(true); }} />)}
              </div>
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd globalSettings={globalSettings} />

          {/* ═══════ LEVEL 5 ═══════ */}
          <div className="space-y-5 max-w-5xl mx-auto relative">
            {/* Lock Overlay Level 5 - REMOVED FOR TESTING */}
            <div className="">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shrink-0">
                  <span className="font-black text-white text-sm">5</span>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-black text-slate-800 dark:text-slate-200 text-lg md:text-xl leading-none mb-1">Level 5</h3>
                  <p className="text-[11px] text-slate-400 font-medium">10,000+ Coins</p>
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gradient-to-r from-rose-500/50 to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 justify-items-center">
                {[
                  { id: 'l5-rik-survey', name: 'Rik Survey', icon: <RikSurveyIcon />, coins: 1200, color: 'from-sky-400 to-blue-500', action: () => handleStatusClick('Rik Survey', 'unavailable') },
                  { id: 'l5-web-reg', name: 'Website Reg.', icon: <WebRegIcon />, coins: 30, color: 'from-violet-400 to-purple-500', action: () => handleStatusClick('Website Registration', 'upcoming') },
                  { id: 'l5-email', name: 'Email Submit', icon: <EmailSubmitIcon />, coins: 20, color: 'from-orange-400 to-red-500', action: () => handleStatusClick('Email Submit', 'upcoming') },
                  { id: 'l5-app', name: 'App Install', icon: <AppInstallIcon />, coins: 40, color: 'from-emerald-400 to-green-500', action: () => handleStatusClick('App Install', 'unavailable') },
                  { id: 'l5-affiliate', name: 'Affiliate Market', icon: <AffiliateMarketIcon />, coins: 75, color: 'from-amber-400 to-yellow-500', action: () => handleStatusClick('Affiliate Market', 'upcoming') },
                  { id: 'l5-trial', name: 'Trial Signup', icon: <TrialSignupIcon />, coins: 60, color: 'from-rose-400 to-pink-500', action: () => handleStatusClick('Trial Signup', 'upcoming') },
                ].map(item => <OptionCard key={item.id} item={item} isLocked={levelInfo.level < 5} onLockedClick={() => { setLockPopupLevel(5); setShowLockPopup(true); }} />)}
              </div>
            </div>
          </div>

          {/* Level Progress Overview Card */}
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setShowLevelView(true)}
              className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-amber-400/20 rounded-2xl p-4 md:p-6 flex items-center gap-4 transform-gpu"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                <span className="font-black text-white text-lg">{levelInfo.level}</span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-black text-slate-800 dark:text-slate-200">{levelInfo.label}</p>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  <span className="text-[11px] text-slate-500 font-bold shrink-0">
                    {levelInfo.isMax ? 'MAX' : `${Math.round(progressPercent)}%`}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500 shrink-0" />
            </button>
          </div>

          {/* My Rewards */}
          <div className="space-y-6 max-w-5xl mx-auto">
            <h3 className="text-center md:text-left font-bold text-slate-800 dark:text-slate-200 text-xl md:text-2xl">My Rewards</h3>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-14">
              {rewardOptions.map((item) => (
                <div key={'reward-' + item.id} className="w-24 md:w-32">
                  <OptionCard item={item} isLarge />
                </div>
              ))}
            </div>
          </div>

          {/* Ad Banner */}
          <BannerAd globalSettings={globalSettings} />

          {/* Custom Modals Down Here */}
          {/* Interstitial Ad / Rewarded Video Modal */}
          {showInterstitialAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-black flex flex-col items-center justify-center p-4"
              >
                {/* Simulated close/timer area */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                    {currentAdInfo.time > 0 ? `Reward in ${currentAdInfo.time}s` : 'Reward Ready!'}
                  </div>
                  {currentAdInfo.time === 0 && (
                    <button onClick={() => setShowInterstitialAd(false)} className="bg-white/20 backdrop-blur w-7 h-7 rounded-full flex items-center justify-center border border-white/10 hover:bg-white/40">
                      <span className="text-white text-xs font-bold">X</span>
                    </button>
                  )}
                </div>

                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-blue-500 rounded-2xl flex items-center justify-center mb-6 animate-pulse shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                    <MonitorPlay className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white">{currentAdInfo.name} ({currentAdInfo.type})</h2>
                  <p className="text-slate-400 max-w-sm mx-auto">This is a simulated AdMob {currentAdInfo.type}. Keep viewing to receive your {currentAdInfo.coins} Coins reward.</p>

                  {currentAdInfo.time === 0 && (
                    <button
                      onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                      className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black py-4 px-8 rounded-full shadow-[0_10px_30px_rgba(16,185,129,0.3)] transform-gpu"
                    >
                      {isLoading ? 'Claiming...' : `Claim ${currentAdInfo.coins} Coins`}
                    </button>
                  )}
                </div>
              </div>
            )}
          

          {/* Native Ad Modal */}
          {showNativeAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
              >
                <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm p-4 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <span className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[9px] px-1.5 py-0.5 font-bold rounded-bl-lg">Ad</span>

                  <div className="flex gap-3 mt-2">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
                       <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight leading-tight mb-1">{currentAdInfo.name} Native Preview</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">This simulates an inline Native Ad experience. Wait {currentAdInfo.time}s to interact.</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center">
                     <MonitorPlay className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                  </div>
                  
                  {currentAdInfo.time > 0 ? (
                    <div className="w-full mt-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-lg text-center font-bold text-sm">
                      Please wait {currentAdInfo.time}s...
                    </div>
                  ) : (
                    <button
                      disabled={isLoading} 
                      onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                      className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg text-center font-bold text-sm transform-gpu shadow-lg"
                    >
                      {isLoading ? 'Claiming...' : `Install & Claim ${currentAdInfo.coins} Coins`}
                    </button>
                  )}
                  {currentAdInfo.time === 0 && (
                     <button onClick={() => setShowNativeAd(false)} className="mt-2 w-full text-center text-[10px] bg-transparent text-slate-400 underline">Dismiss</button>
                  )}
                </div>
              </div>
            )}
          

          {/* Offerwall Ad Modal (For Surveys, Regs etc.) */}
          {showOfferwallAd && (
              <div
                className="fixed inset-0 animate-fade-in z-[200] bg-slate-100 dark:bg-slate-900 flex flex-col"
              >
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3">
                  <button onClick={() => setShowOfferwallAd(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                     <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h3 className="font-bold text-slate-800 dark:text-white">{currentAdInfo.name} - Offer Details</h3>
                </div>
                
                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
                  <div className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 text-center mt-8">
                     <div className="mx-auto w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mb-6">
                        <Gift className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                     </div>
                     <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2">{currentAdInfo.name}</h2>
                     <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                        Complete this {currentAdInfo.type.toLowerCase()} exactly as instructed to automatically receive your coins. 
                        Usually takes 2-3 minutes.
                     </p>
                     
                     <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 mb-8 text-left border border-slate-100 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-2">Instructions:</h4>
                        <ol className="list-decimal pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                           <li>Click the button below to start the task.</li>
                           <li>Follow all steps correctly on the destination page.</li>
                           <li>For surveys, answer honestly to avoid disqualification.</li>
                           <li>Once finished, come back here to claim your reward.</li>
                        </ol>
                     </div>
                     
                     {currentAdInfo.time > 0 ? (
                        <div className="font-bold text-slate-400 dark:text-slate-500">
                           Verifying session details... {currentAdInfo.time}s
                        </div>
                     ) : (
                        <div className="flex flex-col gap-3">
                          <button
                            disabled={isLoading} 
                            onClick={() => handleCustomAdReward(currentAdInfo.coins)}
                            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-indigo-500/30 w-full transform-gpu"
                          >
                            {isLoading ? 'Processing...' : `Complete Task (+${currentAdInfo.coins} Coins)`}
                          </button>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            )}
          

          </>
        )}
        </div>
      </div>

      </main>

      {/* ══════ VPN ORDER SUCCESS OVERLAY ══════ */}
      {vpnOrderSuccess && showPremiumIPView && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden" style={{background: 'linear-gradient(135deg, #070B14 0%, #0B101D 50%, #0A1838 100%)'}}>
          {/* Animated background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] rounded-full border border-[#FACC15]/5 animate-ping" style={{animationDuration:'3s'}}></div>
            <div className="absolute w-[350px] h-[350px] rounded-full border border-[#FACC15]/10 animate-ping" style={{animationDuration:'2s',animationDelay:'0.5s'}}></div>
            <div className="absolute w-[200px] h-[200px] rounded-full border border-[#FACC15]/20 animate-ping" style={{animationDuration:'1.5s',animationDelay:'0.2s'}}></div>
          </div>
          {/* Glow blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#FACC15] opacity-5 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center px-8 text-center">
            {/* Rocket icon with glow */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#FACC15] blur-3xl opacity-20 rounded-full scale-150"></div>
              <div className="relative w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-[#FACC15] to-[#F59E0B] flex items-center justify-center shadow-2xl shadow-[#FACC15]/20"
                   style={{animation: 'float 3s ease-in-out infinite'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              {/* Orbiting dots */}
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50"
                   style={{animation:'orbit 2s linear infinite'}}></div>
              <div className="absolute -bottom-2 -left-2 w-3 h-3 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"
                   style={{animation:'orbit 2s linear infinite',animationDelay:'-1s'}}></div>
            </div>

            <h1 className="text-3xl font-black text-white mb-2 tracking-tight leading-tight">
              Order Submitted! 🚀
            </h1>
            <p className="text-[#FACC15] font-bold text-base mb-6">
              Your VPN order is under review
            </p>

            {/* Order details card */}
            <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Package</span>
                <span className="text-white font-bold text-sm">{vpnOrderDetails?.packageName}</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Country</span>
                <span className="text-white font-bold text-sm">{vpnOrderDetails?.country}</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Amount</span>
                <span className="text-[#FACC15] font-black">৳{vpnOrderDetails?.amount}</span>
              </div>
              <div className="h-px bg-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Status</span>
                <span className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse inline-block"></span>
                  Pending Review
                </span>
              </div>
            </div>

            <div className="w-full max-w-xs bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8">
              <p className="text-emerald-400 text-sm font-bold text-center leading-relaxed">
                🔔 You'll receive a notification when admin approves your order and your VPN is activated!
              </p>
            </div>

            <button
              onClick={() => {
                setVpnOrderSuccess(false);
                setShowPremiumIPView(false);
              }}
              className="w-full max-w-xs py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform tracking-wider text-sm"
            >
              GOT IT! ✓
            </button>
          </div>

          <style>{`
            @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
            @keyframes orbit { 0%{transform:rotate(0deg) translateX(45px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(45px) rotate(-360deg)} }
          `}</style>
        </div>
      , document.body)}

      {/* ══════ VPN LEVEL 1 ACTIVATED CELEBRATION OVERLAY ══════ */}
      {showVpnActivated && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden" style={{background: 'linear-gradient(135deg, #020408 0%, #050C18 50%, #06101F 100%)'}}>
          {/* Particle stars */}
          {[...Array(20)].map((_,i) => (
            <div key={i} className="absolute rounded-full bg-[#FACC15]"
              style={{
                width: `${Math.random()*4+2}px`, height:`${Math.random()*4+2}px`,
                top:`${Math.random()*100}%`, left:`${Math.random()*100}%`,
                opacity: Math.random()*0.7+0.2,
                animation:`twinkle ${Math.random()*2+1}s ease-in-out infinite`,
                animationDelay:`${Math.random()*2}s`
              }}
            />
          ))}
          {/* Glow core */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FACC15] opacity-10 blur-[120px] rounded-full"></div>

          <div className="relative z-10 flex flex-col items-center px-8 text-center max-w-sm">
            {/* Level badge */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#FACC15] blur-[40px] opacity-30 rounded-full scale-125" style={{animation:'pulse 2s infinite'}}></div>
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#FACC15] via-[#F59E0B] to-[#D97706] flex flex-col items-center justify-center shadow-2xl shadow-[#FACC15]/30 border-4 border-[#FACC15]/30"
                   style={{animation:'scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)'}}>
                <Crown className="w-10 h-10 text-slate-900 fill-slate-900" />
                <span className="text-slate-900 font-black text-xs mt-1 uppercase tracking-widest">Level 1</span>
              </div>
            </div>

            <div className="mb-2" style={{animation:'slideUp 0.6s ease 0.2s both'}}>
              <span className="text-xs font-black text-[#FACC15] uppercase tracking-[0.3em] bg-[#FACC15]/10 px-4 py-1 rounded-full border border-[#FACC15]/20">
                🎉 Unlocked
              </span>
            </div>

            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter leading-none" style={{animation:'slideUp 0.6s ease 0.3s both'}}>
              VPN Activated!
            </h1>
            <p className="text-slate-400 font-medium text-base mb-2 leading-relaxed" style={{animation:'slideUp 0.6s ease 0.4s both'}}>
              Your Premium VPN is now active.<br/>Level 1 has been unlocked!
            </p>
            <p className="text-[#FACC15] font-bold text-sm mb-8" style={{animation:'slideUp 0.6s ease 0.45s both'}}>
              Enjoy access to all global servers 🌍
            </p>

            {/* Features unlocked */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 space-y-2.5 text-left" style={{animation:'slideUp 0.6s ease 0.5s both'}}>
              {[
                {icon:'🔒', text:'Secure encrypted connection'},
                {icon:'🌍', text:'30+ country servers unlocked'},
                {icon:'⚡', text:'Ultra-fast speeds'},
                {icon:'🛡️', text:'No-log privacy protection'},
              ].map((f,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{f.icon}</span>
                  <span className="text-white/80 font-bold text-sm">{f.text}</span>
                  <Check className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0" strokeWidth={3} />
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowVpnActivated(false);
                setShowPremiumFeaturesWelcome(true);
              }}
              className="w-full py-5 rounded-2xl font-black text-slate-900 tracking-wider text-base active:scale-95 transition-transform shadow-[0_8px_30px_rgba(250,204,21,0.4)]"
              style={{background:'linear-gradient(135deg,#FACC15,#EAB308)', animation:'slideUp 0.6s ease 0.6s both'}}
            >
              ✓ ACCEPT &amp; CONTINUE
            </button>
          </div>

          <style>{`
            @keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
            @keyframes scaleIn { from{transform:scale(0)} to{transform:scale(1)} }
            @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          `}</style>
        </div>
      , document.body)}

      {/* ══════ PREMIUM FEATURES WELCOME OVERLAY ══════ */}
      {showPremiumFeaturesWelcome && createPortal(
        <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center overflow-hidden" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)'}}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto px-6 py-8 flex flex-col items-center text-center animate-slide-up no-scrollbar">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.5)] mb-6">
              <Star className="w-10 h-10 text-white fill-white" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2">Premium Member!</h2>
            <p className="text-indigo-200 font-medium text-sm mb-8 leading-relaxed">
              As a Premium user, you can now unlock amazing high-paying tasks by leveling up. Here's your journey ahead:
            </p>

            <div className="w-full space-y-4 mb-8">
              {[
                { level: 2, coins: '1,500', title: 'Scratch & Quiz', desc: 'Unlock Scratch Cards and Quizzes', color: 'from-sky-400 to-blue-600' },
                { level: 3, coins: '3,500', title: 'Social Rewards', desc: 'YouTube, TikTok & Facebook Ads', color: 'from-emerald-400 to-green-600' },
                { level: 4, coins: '6,000', title: 'High Ads & Bonus', desc: 'Reward Videos & Big Surprises', color: 'from-purple-500 to-violet-600' },
                { level: 5, coins: '10,000+', title: 'Massive Payouts', desc: 'Surveys, App Installs & Trials', color: 'from-rose-500 to-pink-600' },
              ].map((lvl, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 text-left relative overflow-hidden" style={{animation: `slideUp 0.5s ease ${0.2 + i * 0.1}s both`}}>
                  <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${lvl.color}`} />
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lvl.color} flex flex-col items-center justify-center shrink-0 shadow-lg`}>
                    <span className="text-[10px] text-white/80 font-black leading-none uppercase">Lvl</span>
                    <span className="text-xl font-black text-white leading-none">{lvl.level}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm">{lvl.title}</h4>
                    <p className="text-slate-400 text-[11px]">{lvl.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-black text-xs block">{lvl.coins}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">Coins req.</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setShowPremiumFeaturesWelcome(false);
                setVpnActivatedShown(true);
                localStorage.setItem('vpnActivatedShown', 'true');
              }}
              className="w-full py-4 rounded-2xl font-black text-white tracking-wide text-sm active:scale-95 transition-transform shadow-[0_10px_30px_rgba(99,102,241,0.4)]"
              style={{background:'linear-gradient(to right, #6366f1, #a855f7)', animation: 'slideUp 0.5s ease 0.6s both'}}
            >
              Let's Start Earning! 🚀
            </button>
          </div>
        </div>
      , document.body)}

      {/* ══════ PREMIUM IP VIEW OVERLAY ══════ */}
      {showPremiumIPView && createPortal(
        <div className="fixed inset-0 z-[99999] bg-gradient-to-br from-[#070B14] via-[#0B101D] to-[#0A1838] flex flex-col animate-fade-in overflow-hidden">
          
          {/* Background decoration flares */}
          <div className="absolute top-0 left-0 right-0 h-96 bg-[#FACC15] opacity-[0.03] blur-[100px] pointer-events-none rounded-full transform -translate-y-1/2"></div>
          
          {/* Header area with back button */}
          <div className="p-4 shrink-0 flex items-center border-b border-white/5 relative z-10 bg-black/10 backdrop-blur-md">
            <button
              onClick={() => {
                if (ipStep === 3 || ipStep === 4 || (ipStep === 2 && isPremium)) {
                  setIpStep(ipStep - 1);
                } else {
                  setShowPremiumIPView(false);
                  setIpStep(1);
                }
              }}
              className="w-10 h-10 flex items-center justify-start text-slate-300 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#FACC15] font-bold ml-1 text-lg tracking-wide flex-1">Get VPN</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 scrollbar-hide flex flex-col relative z-10">
             <div className="flex-1 space-y-6">
             {/* If Premium Active Timer View (Step 1 when Premium) */}
             {isPremium && ipStep === 1 ? (
               <div className="flex flex-col items-center justify-center pt-6">
                  <Crown className="w-16 h-16 text-[#FACC15] fill-[#FACC15] mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                  <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Active VPN</h2>
                  <p className="text-slate-400 text-sm mb-6 text-center">
                     You currently have an active premium VPN.
                  </p>
                  
                  <div className="flex gap-4 p-5 bg-[#151A23] rounded-2xl border border-white/5 text-center w-full mb-8 shadow-xl">
                     <div className="flex-1">
                        <div className="text-2xl font-black text-white">{timeLeft.days}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Days</div>
                     </div>
                     <div className="flex-1 border-l border-slate-800">
                        <div className="text-2xl font-black text-white">{timeLeft.hours}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Hours</div>
                     </div>
                     <div className="flex-1 border-l border-slate-800">
                        <div className="text-2xl font-black text-white">{timeLeft.minutes}</div>
                        <div className="text-[10px] uppercase text-slate-500 mt-1 font-bold tracking-wider">Mins</div>
                     </div>
                  </div>

                  <button
                     onClick={() => setIpStep(2)}
                     className="px-8 py-4 bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 rounded-xl font-black active:scale-95 w-full uppercase tracking-wider shadow-[0_5px_20px_rgba(250,204,21,0.3)]"
                  >
                     Extend Membership
                  </button>
               </div>
             ) : null}

             {/* Package Selection (Step 1 or Step 2) */}
             {(!isPremium && ipStep === 1) || (isPremium && ipStep === 2) ? (
                <div className="flex flex-col items-center">
                   <Crown className="w-12 h-12 text-[#FACC15] fill-[#FACC15] mb-3 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)]" />
                   <h2 className="text-2xl font-black text-white mb-1 tracking-tight">Get VPN</h2>
                   <p className="text-slate-400 text-xs mb-4 text-center px-4 leading-relaxed">
                      Upgrade to Premium VPN to enjoy more<br/>features
                   </p>
                   
                   <div className="w-full space-y-3 mb-4 px-2 max-w-[280px]">
                      <div className="flex items-center gap-3 text-slate-300">
                         <Globe className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">All Global Services</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <Shield className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">Super fast Connections</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                         <Globe className="w-4 h-4 text-[#FACC15]" />
                         <span className="text-xs font-bold opacity-90">All 30+ country Server for VIP</span>
                      </div>
                   </div>
                   
                   <div className="w-full space-y-3">
                      {((globalSettings.premiumIpPackages && globalSettings.premiumIpPackages.length > 0) ? globalSettings.premiumIpPackages : [
                         {id: '1', duration: '1 Month', price: 700, freeBonus: '+7 Days free', promoTag: '', isActive: true},
                         {id: '2', duration: '3 Month', price: 1300, freeBonus: '+15 Days free', promoTag: 'POPULAR', isActive: true},
                         {id: '3', duration: '6 Month', price: 2200, freeBonus: '+1 Month free', promoTag: 'BEST VALUE', isActive: true},
                         {id: '4', duration: '1 Year', price: 4200, freeBonus: '+2 Month free', promoTag: 'PRO', isActive: true}
                      ])
                      .filter(pkg => pkg.isActive !== false)
                      .map(pkg => {
                         const displayBonus = pkg.freeBonus || (pkg.duration.includes('1 Month') ? '+7 Days free' : pkg.duration.includes('3 Month') ? '+15 Days free' : pkg.duration.includes('6 Month') ? '+1 Month free' : pkg.duration.includes('1 Year') ? '+2 Month free' : '');
                         
                         return (
                         <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`w-full relative px-3 py-3 rounded-2xl border flex items-center justify-between transition-all overflow-hidden ${
                               selectedPackage === pkg.id ? 'border-[#FACC15] bg-[#FACC15]/10 shadow-[0_0_15px_rgba(250,204,21,0.15)]' : 'border-white/10 bg-[#151A23]'
                            }`}
                         >
                            <div className="flex items-center gap-1.5 md:gap-2 z-10 w-full overflow-hidden">
                               <span className={`font-black text-[15px] sm:text-lg whitespace-nowrap ${selectedPackage === pkg.id ? 'text-[#FACC15]' : 'text-white'}`}>৳{Number(pkg.price) + 25}/-</span>
                               <span className="text-[9px] text-slate-400 font-normal whitespace-nowrap">(Incl. ৳25 VAT)</span>
                               <span className="text-white/20 h-4 w-px bg-white/20"></span>
                               <span className={`font-bold text-[11px] sm:text-sm tracking-wide whitespace-nowrap ${selectedPackage === pkg.id ? 'text-white' : 'text-slate-300'}`}>{pkg.duration}</span>
                               <span className="text-white/20 h-4 w-px bg-white/20"></span>
                               {displayBonus && (
                                  <span className="text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-emerald-400/10 px-1 py-0.5 rounded border border-emerald-400/20 whitespace-nowrap truncate">
                                     {displayBonus}
                                  </span>
                               )}
                            </div>
                            
                            <div className="flex flex-col items-end justify-center z-10 flex-shrink-0 ml-1">
                               <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center ${selectedPackage === pkg.id ? 'border-[#FACC15]' : 'border-slate-500'}`}>
                                  {selectedPackage === pkg.id && <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FACC15] drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />}
                               </div>
                            </div>
                            
                            {/* Subtle background glow for selected package */}
                            {selectedPackage === pkg.id && (
                               <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FACC15]/10 to-transparent"></div>
                            )}
                         </button>
                      )})}
                   </div>

                   {/* GET IP NOW Button - Moved Higher */}
                   <div className="w-full mt-4">
                      <button
                         disabled={!selectedPackage}
                         onClick={() => setIpStep(isPremium ? 3 : 2)}
                         className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm"
                      >
                         GET VPN NOW
                      </button>
                   </div>
                </div>
             ) : null}

             {/* Country Selection (Step 2 or 3) */}
             {((!isPremium && ipStep === 2) || (isPremium && ipStep === 3)) ? (
               <div className="flex flex-col items-center pt-4">
                  <h2 className="text-xl font-black text-white mb-2">Select Country</h2>
                  <p className="text-slate-400 text-xs mb-8 text-center">Choose the origin of your new IP</p>
                  
                  <div className="w-full relative">
                     <div 
                        className="bg-[#121A2B] border-2 border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                        onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                     >
                        {selectedCountry ? (
                           <div className="flex items-center gap-3">
                              <span className="text-2xl">{countries.find(c => c.name === selectedCountry)?.emoji}</span>
                              <span className="text-white font-bold">{selectedCountry}</span>
                           </div>
                        ) : (
                           <span className="text-slate-400 font-bold">Tap to select country...</span>
                        )}
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} />
                     </div>

                     {isCountryDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-3 bg-[#121A2B] border-2 border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[350px]">
                           <div className="p-3 border-b border-slate-800 shrink-0">
                              <div className="bg-slate-900 rounded-xl flex items-center px-4 py-2">
                                 <Search className="w-4 h-4 text-slate-500 mr-3" />
                                 <input 
                                    type="text" 
                                    placeholder="Search country..." 
                                    className="bg-transparent border-none outline-none text-white text-sm w-full h-8"
                                    value={searchCountry}
                                    onChange={(e) => setSearchCountry(e.target.value)}
                                 />
                              </div>
                           </div>
                           <div className="overflow-y-auto flex-1 p-2 scrollbar-none">
                              {countries.filter(c => c.name.toLowerCase().includes(searchCountry.toLowerCase())).map((c) => (
                                 <button
                                    key={c.code}
                                    onClick={() => { setSelectedCountry(c.name); setIsCountryDropdownOpen(false); }}
                                    className={`w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors ${selectedCountry === c.name ? 'bg-blue-600/20 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`}
                                 >
                                    <span className="text-3xl">{c.emoji}</span>
                                    <span className="font-bold">{c.name}</span>
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
             ) : null}

             {/* Payment Selection (Step 3 or 4) */}
              {((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) ? (
                <div className="flex flex-col gap-4 pt-2">

                   {/* Header */}
                   <div className="text-center">
                      <h2 className="text-lg font-black text-white mb-1 tracking-tight">Secure Checkout</h2>
                      <p className="text-slate-400 text-xs">Powered by ZiniPay Payment Gateway</p>
                   </div>

                   {/* Amount Card */}
                   <div className="flex items-center justify-between bg-gradient-to-r from-[#FACC15]/15 to-[#EAB308]/5 border border-[#FACC15]/30 rounded-2xl px-4 py-3">
                      <div>
                         <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Total Amount</p>
                         <p className="text-[#FACC15] text-2xl font-black tracking-tight">৳{(globalSettings.premiumIpPackages?.find(p => p.id === selectedPackage)?.price || (selectedPackage === '1' ? 700 : 0)) + 25}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">Includes</p>
                         <p className="text-emerald-400 text-xs font-bold">৳25 VAT</p>
                      </div>
                   </div>

                   {/* Gateway Card */}
                   <div className="relative bg-gradient-to-br from-[#0F1520] to-[#151A23] rounded-2xl border border-[#FACC15]/20 overflow-hidden">
                      {/* Glow */}
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>

                      <div className="relative z-10 p-5">
                         {/* Gateway Badge */}
                         <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                               <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                                  <Zap className="w-5 h-5 text-slate-900" />
                               </div>
                               <div>
                                  <p className="text-white font-black text-sm leading-tight">ZiniPay Gateway</p>
                                  <p className="text-amber-400 text-[10px] font-bold">Auto Verified</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                               <span className="text-emerald-400 text-[10px] font-black uppercase tracking-wide">Live</span>
                            </div>
                         </div>

                         {/* Description */}
                         <p className="text-slate-300 text-xs leading-relaxed mb-4">
                            Complete your payment on our secure gateway using any of the methods below. Your VPN subscription activates <span className="text-[#FACC15] font-bold">instantly</span> after payment.
                         </p>

                         {/* Payment Methods */}
                         <div className="grid grid-cols-4 gap-2 mb-4">
                            {[
                               { src: '/logos/bkash.png', label: 'bKash' },
                               { src: '/logos/nagad.png', label: 'Nagad' },
                               { src: '/logos/rocket.png', label: 'Rocket' },
                               { src: null, label: 'Cards' },
                            ].map((m) => (
                               <div key={m.label} className="flex flex-col items-center gap-1.5 bg-white/5 rounded-xl py-2.5 px-1 border border-white/8">
                                  {m.src ? (
                                     <img src={m.src} alt={m.label} className="h-7 w-auto object-contain" />
                                  ) : (
                                     <div className="h-7 w-10 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-400" fill="currentColor"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                                     </div>
                                  )}
                                  <span className="text-[9px] text-slate-400 font-bold">{m.label}</span>
                               </div>
                            ))}
                         </div>

                         {/* Features */}
                         <div className="grid grid-cols-3 gap-2">
                            {[
                               { icon: '🔒', text: 'Secure' },
                               { icon: '⚡', text: 'Instant' },
                               { icon: '🤖', text: 'Auto' },
                            ].map((f) => (
                               <div key={f.text} className="flex flex-col items-center gap-1 bg-black/20 rounded-xl py-2 border border-white/5">
                                  <span className="text-base leading-none">{f.icon}</span>
                                  <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">{f.text}</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   {/* Trust Line */}
                   <p className="text-center text-slate-500 text-[10px] flex items-center justify-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-slate-500 inline"><path d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3z"/></svg>
                      256-bit SSL Encrypted &bull; 100% Secure
                   </p>

                </div>
              ) : null}

             </div>

             {/* Action Buttons Container (Appended correctly beneath content) */}
             {(!isPremium || ipStep > 1) && (
                <div className="w-full pt-4 mt-auto">
                   {((!isPremium && ipStep === 2) || (isPremium && ipStep === 3)) && (
                      <button
                         disabled={!selectedCountry}
                         onClick={() => setIpStep(isPremium ? 4 : 3)}
                         className="w-full py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm"
                      >
                         CONTINUE TO PAYMENT
                      </button>
                   )}
                   {((!isPremium && ipStep === 3) || (isPremium && ipStep === 4)) && (
                      <button
                          disabled={ipSubmitting}
                         onClick={handlePremiumSubmit}
                         className="w-full flex items-center justify-center py-4 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#EAB308] text-slate-900 font-black shadow-[0_5px_20px_rgba(250,204,21,0.3)] active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none tracking-wider text-sm gap-2"
                      >
                         {ipSubmitting ? <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              CONNECTING GATEWAY...
                            </span> : (
                           <>
                             PAY VIA ZINIPAY AUTO GATEWAY
                           </>
                         )}
                      </button>
                   )}
                </div>
             )}
          </div>
        </div>
      , document.body)}

      {showStatusOverlay && createPortal(
        <div className="fixed inset-0 z-[99999] bg-[#070B14] flex flex-col animate-fade-in overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] animate-pulse"></div>
          </div>
          
          <div className="relative z-10 p-4 flex items-center border-b border-white/5 bg-black/40 backdrop-blur-md">
            <button
              onClick={() => setShowStatusOverlay(false)}
              className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-[#FACC15] font-black ml-2 text-lg uppercase tracking-tight flex-1">Status Update</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <div className={`relative mb-10`}>
                <div className={`absolute inset-0 blur-3xl opacity-30 ${statusData.type === 'upcoming' ? 'bg-amber-500' : 'bg-rose-500'} animate-pulse`}></div>
                <div className={`w-28 h-28 rounded-[2rem] bg-gradient-to-br ${statusData.type === 'upcoming' ? 'from-amber-400 to-orange-600 shadow-amber-500/20' : 'from-rose-500 to-pink-700 shadow-rose-500/20'} flex items-center justify-center shadow-2xl animate-float relative z-20`}>
                  {statusData.type === 'upcoming' ? (
                    <Clock className="w-14 h-14 text-white" strokeWidth={2.5} />
                  ) : (
                    <AlertCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
                  )}
                </div>
            </div>

            <div className="space-y-6 max-w-sm">
              <div className="space-y-2">
                <h2 className="text-4xl font-black text-white tracking-tighter leading-none">
                  {statusData.name}
                </h2>
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-widest ${statusData.type === 'upcoming' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>
                   {statusData.type === 'upcoming' ? 'Coming Soon' : 'Locked!'}
                </div>
              </div>

              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                {statusData.type === 'upcoming' 
                  ? 'Great things take time! We are polishing this feature to give you the best earning experience.' 
                  : 'This section is currently under maintenance or requires a higher level to unlock.'}
              </p>
              
              <button 
                onClick={() => setShowStatusOverlay(false)}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
              >
                Go Back
              </button>
            </div>

            <div className="mt-auto w-full pb-8 flex flex-col items-center gap-4">
               <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-full">Sponsored Ad</div>
               <BigAdBanner globalSettings={globalSettings} />
            </div>
          </div>
        </div>
      , document.body)}

    </PullToRefresh>
    </>
  );
};

export default EarningPage;
