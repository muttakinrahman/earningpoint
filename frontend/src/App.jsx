import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { io } from 'socket.io-client';
import AuthLayout from './components/AuthLayout';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { API_BASE } from './config';

import { Check, Loader2, X } from 'lucide-react';
import { AdMob } from '@capacitor-community/admob';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';
import { AdMobService } from './utils/admob';
import AppUpdateModal from './components/AppUpdateModal';
import OfflineScreen from './components/OfflineScreen';
import DesktopSidebarLeft from './components/DesktopSidebarLeft';
import DesktopSidebarRight from './components/DesktopSidebarRight';
import { playNotificationSound, triggerSystemNotification, triggerMessageNotification, requestNotificationPermissions } from './utils/sound';
import { initPushNotifications, sendTokenToBackend, unregisterPushToken } from './utils/pushNotifications';
import { initActivityTracker, stopActivityTracker } from './utils/activityTracker';

// Lazy load other sub-pages/components to split bundle size and make initial load super fast
const CartPage = lazy(() => import('./components/CartPage'));
const CheckoutPage = lazy(() => import('./components/CheckoutPage'));
const VerificationPage = lazy(() => import('./components/VerificationPage'));
const LanguagePage = lazy(() => import('./components/LanguagePage'));
const ChangePasswordPage = lazy(() => import('./components/ChangePasswordPage'));
const ReferralsPage = lazy(() => import('./components/ReferralsPage'));
const LeaderboardPage = lazy(() => import('./components/LeaderboardPage'));
const TermsPrivacyPage = lazy(() => import('./components/TermsPrivacyPage'));
const DeleteAccountPage = lazy(() => import('./components/DeleteAccountPage'));
const PublicDeleteAccountPage = lazy(() => import('./components/PublicDeleteAccountPage'));
const EarningPage = lazy(() => import('./components/EarningPage'));
const NotificationPage = lazy(() => import('./components/NotificationPage'));
const PaymentSuccess = lazy(() => import('./components/PaymentSuccess'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const SupportPage = lazy(() => import('./components/SupportPage'));
const MessengerPage = lazy(() => import('./components/MessengerPage'));
const UpdatesPage = lazy(() => import('./components/UpdatesPage'));
const TransactionHistoryPage = lazy(() => import('./components/TransactionHistoryPage'));
const ForgotPasswordPage = lazy(() => import('./components/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./components/ResetPasswordPage'));
const VideoReelsPage = lazy(() => import('./components/VideoReelsPage'));
const PublicProfilePage = lazy(() => import('./components/PublicProfilePage'));
const CreatePostPage = lazy(() => import('./components/CreatePostPage'));
import { updatePageSEO } from './utils/seo';

// Ultra-fast loader fallback — uses inline styles so it renders before CSS parses
const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: '12px' }}>
    <div style={{ width: 32, height: 32, border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);


function App() {
  // Check if URL has a password reset token, reelId, profileId, or post
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get('token');
  const reelIdFromUrl = urlParams.get('reelId');
  const profileIdFromUrl = urlParams.get('profileId');
  const postIdFromUrl = urlParams.get('post');
  const pageFromUrl = urlParams.get('page');
  const [resetPasswordToken, setResetPasswordToken] = useState(resetToken || null);
  const [postUploadState, setPostUploadState] = useState(null);

  const [termsPrivacyInitialTab, setTermsPrivacyInitialTab] = useState(() => {
    if (pageFromUrl && ['about', 'features', 'contact', 'terms', 'privacy'].includes(pageFromUrl)) {
      return pageFromUrl;
    }
    return 'terms';
  });

  const [showSplash, setShowSplash] = useState(true);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [activeTab, _setActiveTab] = useState(() => {
    if (reelIdFromUrl) return 'Video';
    if (profileIdFromUrl) return 'PublicProfile';
    if (pageFromUrl) {
      if (['about', 'features', 'contact', 'terms', 'privacy'].includes(pageFromUrl)) return 'TermsPrivacy';
      if (['support', 'help'].includes(pageFromUrl)) return 'Support';
      if (['posts', 'create-post'].includes(pageFromUrl)) return 'CreatePost';
      if (pageFromUrl === 'social-network') return 'Home';
    }
    return localStorage.getItem('active_tab') || 'Home';
  });
  const [navigationHistory, setNavigationHistory] = useState([
    reelIdFromUrl ? 'Video' : (profileIdFromUrl ? 'PublicProfile' : (localStorage.getItem('active_tab') || 'Home'))
  ]);

  useEffect(() => {
    if (activeTab === 'Home') updatePageSEO('home');
    else if (activeTab === 'CreatePost') updatePageSEO('posts');
    else if (activeTab === 'Support') updatePageSEO('support');
    else if (activeTab === 'TermsPrivacy') {
      if (termsPrivacyInitialTab === 'about') updatePageSEO('about');
      else if (termsPrivacyInitialTab === 'features') updatePageSEO('features');
      else if (termsPrivacyInitialTab === 'contact') updatePageSEO('contact');
      else updatePageSEO('home');
    }
  }, [activeTab, termsPrivacyInitialTab]);

  const setActiveTab = (tab) => {
    localStorage.setItem('active_tab', tab);
    setNavigationHistory(prev => {
      if (tab === 'Home') {
        return ['Home'];
      }
      if (prev[prev.length - 1] === tab) return prev;
      return [...prev, tab];
    });
    _setActiveTab(tab);
    if (tab !== 'CreatePost') {
      setPostToEdit(null);
    }
  };

  const handleBackNavigation = () => {
    setNavigationHistory(prev => {
      if (prev.length <= 1) {
        localStorage.setItem('active_tab', 'Home');
        _setActiveTab('Home');
        setPostToEdit(null);
        return ['Home'];
      }
      const newHistory = prev.slice(0, -1);
      const targetTab = newHistory[newHistory.length - 1] || 'Home';
      localStorage.setItem('active_tab', targetTab);
      _setActiveTab(targetTab);
      if (targetTab !== 'CreatePost') {
        setPostToEdit(null);
      }
      return newHistory;
    });
  };

  const [appUpdateConfig, setAppUpdateConfig] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const showUpdateModalRef = React.useRef(false);
  const appUpdateConfigRef = React.useRef(null);
  useEffect(() => {
    showUpdateModalRef.current = showUpdateModal;
    appUpdateConfigRef.current = appUpdateConfig;
  }, [showUpdateModal, appUpdateConfig]);

  // Native back button listener
  const navigationHistoryRef = React.useRef(navigationHistory);
  useEffect(() => {
    navigationHistoryRef.current = navigationHistory;
  }, [navigationHistory]);

  useEffect(() => {
    let handler;
    const registerListener = async () => {
      try {
        handler = await CapacitorApp.addListener('backButton', () => {
          // If a force update is required, exit app immediately on back button press
          if (showUpdateModalRef.current && appUpdateConfigRef.current?.forceUpdate) {
            CapacitorApp.exitApp();
            return;
          }

          const customEvent = new CustomEvent('appBackButton', {
            cancelable: true,
            bubbles: true
          });
          document.dispatchEvent(customEvent);

          if (customEvent.defaultPrevented) {
            return;
          }

          if (navigationHistoryRef.current.length > 1) {
            handleBackNavigation();
          } else {
            CapacitorApp.exitApp();
          }
        });
      } catch (err) {
        console.error('Capacitor backButton listener failed:', err);
      }
    };

    registerListener();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []);

  const [selectedReelId, setSelectedReelId] = useState(reelIdFromUrl || null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [activeChatPartner, setActiveChatPartner] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [selectedNotificationPostId, setSelectedNotificationPostId] = useState(postIdFromUrl || null);
  const [activePublicProfileUserId, setActivePublicProfileUserId] = useState(profileIdFromUrl || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [initialSettingsSubMenu, setInitialSettingsSubMenu] = useState(null);
  const [postToEdit, setPostToEdit] = useState(null);

  const activeTabRef = React.useRef(activeTab);
  activeTabRef.current = activeTab;

  const activeChatPartnerRef = React.useRef(activeChatPartner);
  activeChatPartnerRef.current = activeChatPartner;

  // Listen for native notification clicks from phone status bar & proactively request permissions
  useEffect(() => {
    requestNotificationPermissions();

    // Initialize Native Remote Push Notifications (Firebase FCM)
    initPushNotifications({
      onNotificationAction: (data) => {
        if (data?.senderId) {
          const partner = {
            _id: data.senderId,
            name: data.senderName || 'Chat',
            isGroup: false,
            profilePic: ''
          };
          setActiveChatPartner(partner);
          setActiveTab('Messenger');
        } else if (data?.groupId) {
          const partner = {
            _id: data.groupId,
            name: data.groupName || 'Group Chat',
            isGroup: true,
            profilePic: ''
          };
          setActiveChatPartner(partner);
          setActiveTab('Messenger');
        } else {
          setActiveTab('Notification');
        }
      }
    });

    let actionSub = null;
    if (Capacitor.isNativePlatform()) {
      LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        const extra = notification.notification?.extra;
        if (extra?.senderId) {
          const partner = {
            _id: extra.senderId,
            name: (notification.notification.title || '').replace(' 💬', ''),
            isGroup: false,
            profilePic: ''
          };
          setActiveChatPartner(partner);
          setActiveTab('Messenger');
        } else if (extra?.groupId) {
          const partner = {
            _id: extra.groupId,
            name: (notification.notification.title || '').replace(' 💬', ''),
            isGroup: true,
            profilePic: ''
          };
          setActiveChatPartner(partner);
          setActiveTab('Messenger');
        }
      }).then(sub => { actionSub = sub; }).catch(() => {});
    }

    return () => {
      if (actionSub && actionSub.remove) actionSub.remove();
    };
  }, []);

  // Proactively send FCM device token to backend when authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      const token = localStorage.getItem('token');
      const fcmToken = localStorage.getItem('zenivio_fcm_token');
      if (token && fcmToken) {
        sendTokenToBackend(fcmToken, token);
      }
    }
  }, [isAuthenticated, currentUser]);

  // Track user screen time & active duration across web & mobile app
  useEffect(() => {
    if (isAuthenticated) {
      initActivityTracker();
    } else {
      stopActivityTracker();
    }
    return () => {
      stopActivityTracker();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Clean up URL query parameters so they don't persist on page reload/navigation
    if (window.location.search) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // ──────────────── INSTANT OFFLINE DETECTION ────────────────
  // Use state initializer to check synchronously on first render
  const [isOffline, setIsOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    // Capacitor Network plugin for instant native detection (Android/iOS)
    let networkListener = null;
    const setupNativeListener = async () => {
      try {
        // Get initial status right away
        const status = await Network.getStatus();
        const offline = !status.connected;
        setIsOffline(prev => prev !== offline ? offline : prev);

        // Listen for changes — fires instantly on Android when network drops
        networkListener = await Network.addListener('networkStatusChange', (status) => {
          const offline = !status.connected;
          setIsOffline(prev => prev !== offline ? offline : prev);
        });
      } catch {
        // Fallback to browser events on web
        const offline = !navigator.onLine;
        setIsOffline(prev => prev !== offline ? offline : prev);
      }
    };

    // Web browser fallback
    const handleOnline = () => setIsOffline(prev => prev ? false : prev);
    const handleOffline = () => setIsOffline(prev => !prev ? true : prev);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (Capacitor.isNativePlatform()) {
      setupNativeListener();
    } else {
      // Also poll every 5s on web to ensure accuracy
      const pollInterval = setInterval(() => {
        const offline = !navigator.onLine;
        setIsOffline(prev => prev !== offline ? offline : prev);
      }, 5000);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(pollInterval);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkListener) networkListener.remove();
    };
  }, []);




  useEffect(() => {
    if (isAuthenticated && currentUser?._id) {
      const newSocket = io(API_BASE, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnectionAttempts: Infinity,       // Never stop trying to reconnect
        reconnectionDelay: 1000,              // Start with 1s delay
        reconnectionDelayMax: 10000,          // Max 10s between attempts
        randomizationFactor: 0.3,
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        // Join user room on every (re)connect — group rooms are rejoined by MessengerPage
        newSocket.emit('join_user_room', { userId: currentUser._id });
      });

      newSocket.on('new_notification', (data) => {
        triggerSystemNotification(
          data?.title || 'Zenivio Notification',
          data?.message || 'You have a new update on Zenivio',
          data
        );
      });

      // Handle direct chat messages
      newSocket.on('receive_direct_message', (message) => {
        const msgSenderId = message.sender?._id ? message.sender._id.toString() : (message.sender ? message.sender.toString() : '');
        const currentUserId = currentUser._id.toString();
        const isFromOther = msgSenderId && msgSenderId !== currentUserId;

        if (isFromOther) {
          const curTab = activeTabRef.current;
          const curPartner = activeChatPartnerRef.current;
          const curPartnerId = curPartner?._id ? curPartner._id.toString() : '';
          const isCurrentlyInChat = curTab === 'Messenger' && curPartnerId === msgSenderId;

          if (!isCurrentlyInChat) {
            const senderName = (message.sender && typeof message.sender === 'object') ? (message.sender.name || 'Friend') : 'Friend';
            triggerMessageNotification(
              senderName,
              message.content,
              { senderId: msgSenderId, type: 'direct_message' }
            );

            window.dispatchEvent(new CustomEvent('new_unread_message', { detail: message }));
          }
        }
      });

      // Handle group chat messages
      newSocket.on('receive_group_message', (message) => {
        const msgSenderId = message.sender?._id ? message.sender._id.toString() : (message.sender ? message.sender.toString() : '');
        const currentUserId = currentUser._id.toString();
        const isFromOther = msgSenderId && msgSenderId !== currentUserId;

        if (isFromOther) {
          const curTab = activeTabRef.current;
          const curPartner = activeChatPartnerRef.current;
          const curGroupId = curPartner?._id ? curPartner._id.toString() : '';
          const msgGroupId = message.group?._id ? message.group._id.toString() : (message.group ? message.group.toString() : '');
          const isCurrentlyInChat = curTab === 'Messenger' && curGroupId === msgGroupId;

          if (!isCurrentlyInChat) {
            const senderName = (message.sender && typeof message.sender === 'object') ? (message.sender.name || 'Group Member') : 'Group Member';
            triggerMessageNotification(
              `Group: ${senderName}`,
              message.content,
              { groupId: msgGroupId, type: 'group_message' }
            );

            window.dispatchEvent(new CustomEvent('new_unread_message', { detail: message }));
          }
        }
      });

      newSocket.on('receive_message', (data) => {
        const curTab = activeTabRef.current;
        const curPartner = activeChatPartnerRef.current;
        const curPartnerId = curPartner?._id ? curPartner._id.toString() : '';
        const msgSenderId = data?.senderId ? data.senderId.toString() : '';
        const isCurrentlyInChat = curTab === 'Messenger' && msgSenderId && curPartnerId === msgSenderId;

        if (!isCurrentlyInChat) {
          triggerMessageNotification(
            data?.senderName || 'New Message',
            data?.text || 'Sent you a message',
            data
          );
          window.dispatchEvent(new CustomEvent('new_unread_message', { detail: data }));
        }
      });

      newSocket.on('online_users', (usersList) => {
        setOnlineUsers(usersList);
      });

      newSocket.on('incoming_call', (data) => {
        const callerPartner = {
          _id: data.callerId,
          name: data.callerName,
          isGroup: false,
          profilePic: ''
        };
        setActiveChatPartner(callerPartner);
        setIncomingCallData({ ...data, isGroup: false });
        _setActiveTab('Messenger');
      });

      newSocket.on('incoming_group_call', (data) => {
        const callerPartner = {
          _id: data.groupId,
          name: data.callerName + "'s Group",
          isGroup: true,
          profilePic: ''
        };
        setActiveChatPartner(callerPartner);
        setIncomingCallData({ ...data, isGroup: true });
        _setActiveTab('Messenger');
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setSocket(null);
    }
  }, [isAuthenticated, currentUser]);

  const navigateToSettingsSubMenu = (subMenuKey) => {
    setInitialSettingsSubMenu(subMenuKey);
    setActiveTab('Setting');
  };

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCurrentUser(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch profile in App:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    } else {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleAccountSwitched = () => {
      setIsAuthenticated(true);
      fetchCurrentUser();
      _setActiveTab('Home');
    };
    window.addEventListener('zenivio_account_switched', handleAccountSwitched);
    return () => window.removeEventListener('zenivio_account_switched', handleAccountSwitched);
  }, []);

  // Helper: compare version strings. Returns positive if versionA > versionB, 0 if equal, negative if less
  const compareVersions = (versionA, versionB) => {
    const partsA = (versionA || '0').split('.').map(Number);
    const partsB = (versionB || '0').split('.').map(Number);
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const a = partsA[i] || 0;
      const b = partsB[i] || 0;
      if (a !== b) return a - b;
    }
    return 0;
  };

  // Reusable Play Store update checker (Native Android Only)
  const checkForAppUpdates = async (updateConfigFromSettings) => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      let config = updateConfigFromSettings;
      if (!config) {
        const res = await fetch(`${API_BASE}/api/earning/settings`);
        const settings = await res.json();
        config = settings?.appUpdateConfig;
      }
      if (!config) return;

      let currentVersion = '1.2.0';
      try {
        const appInfo = await CapacitorApp.getInfo();
        if (appInfo && appInfo.version) {
          currentVersion = appInfo.version;
        }
      } catch (e) {
        console.warn('Could not read native app version:', e);
      }

      const latest = config.latestAppVersion;
      const minVersion = config.minAppVersion;

      const isOlderThanLatest = latest && compareVersions(currentVersion, latest) < 0;
      const isOlderThanMin = minVersion && compareVersions(currentVersion, minVersion) < 0;
      const shouldForce = Boolean(isOlderThanMin || (config.forceUpdate && isOlderThanLatest));

      if (isOlderThanLatest || isOlderThanMin) {
        setAppUpdateConfig({
          ...config,
          currentVersion,
          forceUpdate: shouldForce
        });
        setShowUpdateModal(true);
      }
    } catch (err) {
      console.error('Check for app updates failed:', err);
    }
  };

  // Initialize AdMob & check for Play Store App updates (Native Android Only)
  useEffect(() => {
    const initAdMob = async () => {
      // Fetch global settings dynamically
      try {
        const res = await fetch(`${API_BASE}/api/earning/settings`);
        const settings = await res.json();
        if (settings && settings.admobConfig) {
          AdMobService.setConfig(settings.admobConfig);
        } else if (Capacitor.isNativePlatform()) {
          try {
            await AdMob.initialize({
              initializeForTesting: false
            });
            console.log('AdMob Initialized');
          } catch (err) {
            console.error('AdMob initialization failed:', err);
          }
        }
        
        // Play Store App Updates: ONLY check on Native Mobile App
        if (Capacitor.isNativePlatform() && settings && settings.appUpdateConfig) {
          checkForAppUpdates(settings.appUpdateConfig);
        }
      } catch (settingsErr) {
        console.error('Failed to load dynamic settings:', settingsErr);
      }
    };
    initAdMob();

    // Re-check updates whenever app is resumed from background
    let stateListener;
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          checkForAppUpdates();
        }
      }).then(l => { stateListener = l; });
    }

    return () => {
      if (stateListener) stateListener.remove();
    };
  }, []);


  // Back navigation — directly navigate without showing ads
  const showBackAd = (callback) => {
    if (callback) callback();
  };

  // Apply/remove dark class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleToggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('darkMode', String(newVal));

    // Sync with backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE}/api/profile/darkmode`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.error('Failed to sync dark mode:', err);
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      unregisterPushToken(token);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('darkMode');
    setDarkMode(false);
    setIsAuthenticated(false);
    setActiveTab('Home');
  };

  const handleBuyNow = (product) => {
    setSelectedProduct(product);
    setActiveTab('Checkout');
  };

  // If user clicked a password reset link from email, show reset page immediately
  if (resetPasswordToken) {
    return (
      <ResetPasswordPage
        token={resetPasswordToken}
        onDone={() => {
          setResetPasswordToken(null);
          setIsLogin(true);
        }}
      />
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show offline screen instantly when network is lost (after splash so animation still plays)
  if (isOffline) {
    return (
      <OfflineScreen
        onRetrySuccess={() => setIsOffline(false)}
      />
    );
  }

  const path = window.location.pathname.toLowerCase();
  const isPrivacyPath = path === '/privacy-policy' || path === '/privacy';
  const isTermsPath = path === '/terms-and-conditions' || path === '/terms-conditions' || path === '/terms';
  const isDeletePath = path === '/delete-account' || path === '/delete';

  if (isPrivacyPath || isTermsPath) {
    return (
      <Suspense fallback={<PageLoader />}>
        <TermsPrivacyPage 
          onBack={() => {
            if (isAuthenticated) {
              setActiveTab('Home');
              window.history.pushState({}, '', '/');
            } else {
              window.location.href = '/';
            }
          }} 
          initialTab={isPrivacyPath ? 'privacy' : 'terms'} 
          standalone={true}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </Suspense>
    );
  }

  if (isDeletePath) {
    return (
      <Suspense fallback={<PageLoader />}>
        <PublicDeleteAccountPage 
          onBack={() => {
            if (isAuthenticated) {
              setActiveTab('Home');
              window.history.pushState({}, '', '/');
            } else {
              window.location.href = '/';
            }
          }} 
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />
      </Suspense>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="fixed inset-0 h-[100dvh] w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-between overflow-hidden">
        <div className="relative w-full h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
          
          {/* Global Facebook-style Animated Post Upload Banner */}
          {postUploadState && (
            <div className="fixed top-0 left-0 right-0 z-[10000] bg-slate-900/95 text-white backdrop-blur-md px-5 py-3.5 flex items-center justify-between shadow-2xl animate-fade-in-down border-b border-indigo-500/40 max-w-xl mx-auto">
              <div className="flex items-center gap-3">
                {postUploadState.status === 'uploading' ? (
                  <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/50 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin" />
                  </div>
                ) : postUploadState.status === 'success' ? (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center flex-shrink-0 text-rose-400">
                    <X className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    {postUploadState.status === 'uploading' ? 'Posting to Zenivio...' : postUploadState.status === 'success' ? 'Post Published!' : 'Upload Failed'}
                    {postUploadState.status === 'uploading' && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                    )}
                  </h4>
                  <p className="text-[10.5px] font-bold text-slate-400">
                    {postUploadState.message || 'Uploading post and media...'}
                  </p>
                </div>
              </div>
              {postUploadState.status === 'uploading' && (
                <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-[#7C3AED] to-pink-500 h-full transition-all duration-300 rounded-full animate-pulse"
                    style={{ width: `${postUploadState.progress || 80}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <Navbar 
            onLogout={handleLogout} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            currentUser={currentUser} 
            activePublicProfileUserId={activePublicProfileUserId} 
            darkMode={darkMode}
            onToggleDarkMode={handleToggleDarkMode}
            navigateToSettingsSubMenu={navigateToSettingsSubMenu}
          />

          {/* MessengerPage is always mounted outside main to overlay top/bottom navbars when active */}
          <div className={activeTab === 'Messenger' ? 'absolute inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col overflow-hidden' : 'hidden'}>
            <Suspense fallback={<PageLoader />}>
              <MessengerPage 
                currentUser={currentUser} 
                onBack={() => {
                  setActiveTab('Home');
                  setActiveChatPartner(null);
                }} 
                activeChatPartner={activeChatPartner}
                setActiveChatPartner={setActiveChatPartner}
                socket={socket}
                onlineUsers={onlineUsers}
                incomingCallData={incomingCallData}
                setIncomingCallData={setIncomingCallData}
                setActiveTab={setActiveTab}
                setActivePublicProfileUserId={setActivePublicProfileUserId}
              />
            </Suspense>
          </div>

          {/* SupportPage is mounted outside main for full screen chat view with back button and bottom input field */}
          <div className={activeTab === 'Support' ? 'absolute inset-0 z-[9999] bg-white dark:bg-slate-950 flex flex-col overflow-hidden' : 'hidden'}>
            <Suspense fallback={<PageLoader />}>
              <SupportPage onBack={() => handleBackNavigation()} />
            </Suspense>
          </div>

          {/* VideoReelsPage is rendered outside main for full screen immersive view with back button */}
          <div className={activeTab === 'Video' ? 'absolute inset-0 z-[9999] bg-black flex flex-col overflow-hidden' : 'hidden'}>
            <Suspense fallback={<PageLoader />}>
              <VideoReelsPage selectedReelId={selectedReelId} onBack={() => handleBackNavigation()} />
            </Suspense>
          </div>

          {/* Main Responsive Body Container (3-Column on Desktop, 1-Column on Mobile & Tablet) */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden pt-[calc(3.5rem+max(4px,env(safe-area-inset-top,4px)))] lg:pt-[calc(4.5rem+max(4px,env(safe-area-inset-top,4px)))] pb-[calc(76px+max(14px,env(safe-area-inset-bottom,14px)))] lg:pb-8 relative no-scrollbar">
            <div className="w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1440px] mx-auto px-1.5 sm:px-4 lg:px-6 flex justify-center lg:justify-between gap-6">
              
              {/* Desktop Left Sidebar (Facebook Style) */}
              <DesktopSidebarLeft 
                currentUser={currentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onLogout={handleLogout}
                darkMode={darkMode}
                onToggleDarkMode={handleToggleDarkMode}
                navigateToSettingsSubMenu={navigateToSettingsSubMenu}
              />

              {/* Center Feed / Active Page Column */}
              <main className="w-full max-w-2xl md:max-w-3xl lg:max-w-xl xl:max-w-2xl min-h-[calc(100vh-120px)] flex-shrink-0 mx-auto lg:mx-0">
                <Suspense fallback={<PageLoader />}>
                  {/* HomePage is always mounted but hidden when not active — prevents re-fetching on every tab switch */}
                  <div style={{ display: activeTab === 'Home' ? 'block' : 'none' }}>
                    <HomePage 
                      onBuyNow={handleBuyNow} 
                      setActiveTab={setActiveTab} 
                      setSelectedNewsId={setSelectedNewsId}
                      setActiveChatPartner={setActiveChatPartner}
                      setSelectedReelId={setSelectedReelId}
                      highlightedPostId={selectedNotificationPostId}
                      setHighlightedPostId={setSelectedNotificationPostId}
                      setPostToEdit={setPostToEdit}
                      onUserClick={(uid) => {
                        setActivePublicProfileUserId(uid);
                        setActiveTab('PublicProfile');
                      }}
                    />
                  </div>

                  {activeTab === 'CreatePost' && (
                    <CreatePostPage currentUser={currentUser} onBack={() => handleBackNavigation()} setActiveTab={setActiveTab} postToEdit={postToEdit} setPostUploadState={setPostUploadState} />
                  )}
                  {activeTab === 'Cart' && <CartPage onBuyNow={handleBuyNow} />}
                  {activeTab === 'Checkout' && <CheckoutPage product={selectedProduct} onBack={() => handleBackNavigation()} onSuccess={(method) => { setSelectedPaymentMethod(method); setActiveTab('PaymentSuccess'); }} />}
                  {activeTab === 'Notification' && (
                    <NotificationPage 
                      onBack={() => handleBackNavigation()} 
                      setActiveTab={setActiveTab}
                      setSelectedNotificationPostId={setSelectedNotificationPostId}
                      setActivePublicProfileUserId={setActivePublicProfileUserId}
                    />
                  )}
                  {activeTab === 'PublicProfile' && (
                    <PublicProfilePage 
                      userId={activePublicProfileUserId}
                      currentUser={currentUser}
                      onBack={() => handleBackNavigation()}
                      setActiveTab={setActiveTab}
                      setSelectedReelId={setSelectedReelId}
                      setActiveChatPartner={setActiveChatPartner}
                      onlineUsers={onlineUsers}
                      socket={socket}
                      onUserClick={(uid) => {
                        setActivePublicProfileUserId(uid);
                        setActiveTab('PublicProfile');
                      }}
                    />
                  )}
                  {activeTab === 'MyProfile' && (
                    <PublicProfilePage 
                      userId="me"
                      currentUser={currentUser}
                      isOwnProfile={true}
                      onBack={() => handleBackNavigation()}
                      setActiveTab={setActiveTab}
                      setSelectedReelId={setSelectedReelId}
                      setActiveChatPartner={setActiveChatPartner}
                      onlineUsers={onlineUsers}
                      socket={socket}
                      onUserClick={(uid) => {
                        setActivePublicProfileUserId(uid);
                        setActiveTab('PublicProfile');
                      }}
                    />
                  )}
                  {activeTab === 'PaymentSuccess' && <PaymentSuccess paymentMethod={selectedPaymentMethod} onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'EditProfile' && (
                    <PublicProfilePage 
                      userId="me"
                      currentUser={currentUser}
                      isOwnProfile={true}
                      startEditing={true}
                      onBack={() => handleBackNavigation()}
                      setActiveTab={setActiveTab}
                      setSelectedReelId={setSelectedReelId}
                      setActiveChatPartner={setActiveChatPartner}
                      onlineUsers={onlineUsers}
                      socket={socket}
                      onUserClick={(uid) => {
                        setActivePublicProfileUserId(uid);
                        setActiveTab('PublicProfile');
                      }}
                    />
                  )}
                  {activeTab === 'Verify' && <VerificationPage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'Language' && <LanguagePage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'ChangePassword' && <ChangePasswordPage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'Referrals' && <ReferralsPage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'Leaderboard' && <LeaderboardPage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'TransactionHistory' && <TransactionHistoryPage onBack={() => showBackAd(() => handleBackNavigation())} />}
                  {activeTab === 'TermsPrivacy' && (
                    <TermsPrivacyPage 
                      onBack={() => showBackAd(() => handleBackNavigation())} 
                      initialTab={termsPrivacyInitialTab}
                      darkMode={darkMode}
                      onToggleDarkMode={handleToggleDarkMode}
                    />
                  )}
                  {activeTab === 'DeleteAccount' && <DeleteAccountPage onBack={() => showBackAd(() => handleBackNavigation())} onLogout={handleLogout} />}
                  {activeTab === 'Earning' && <EarningPage onReferralsClick={() => setActiveTab('Referrals')} setActiveTab={setActiveTab} />}
                  
                  {activeTab === 'Setting' && (
                    <SettingsPage 
                      darkMode={darkMode} 
                      onToggleDarkMode={handleToggleDarkMode} 
                      onLogout={handleLogout}
                      onBack={() => handleBackNavigation()}
                      onPasswordClick={() => setActiveTab('ChangePassword')}
                      onLanguageClick={() => setActiveTab('Language')}
                      onTermsClick={() => setActiveTab('TermsPrivacy')}
                      onDeleteClick={() => setActiveTab('DeleteAccount')}
                      onNotificationClick={() => setActiveTab('Notification')}
                      onSupportClick={() => setActiveTab('Support')}
                      onVerifyClick={() => setActiveTab('Verify')}
                      initialSubMenuKey={initialSettingsSubMenu}
                      onCloseSubMenu={() => setInitialSettingsSubMenu(null)}
                    />
                  )}
                  
                  {activeTab === 'Updates' && (
                    <UpdatesPage 
                      onBack={() => {
                        setSelectedNewsId(null);
                        handleBackNavigation();
                      }} 
                      selectedPostId={selectedNewsId}
                      setSelectedPostId={setSelectedNewsId}
                    />
                  )}
                </Suspense>
              </main>

              {/* Desktop Right Sidebar (Facebook Style) */}
              <DesktopSidebarRight 
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                setSelectedNewsId={setSelectedNewsId}
              />
            </div>
          </div>

          {/* In-App Update Prompt Modal */}
          {showUpdateModal && (
            <AppUpdateModal 
              updateConfig={appUpdateConfig} 
              onClose={() => {
                if (!appUpdateConfig?.forceUpdate) {
                  setShowUpdateModal(false);
                }
              }} 
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {showUpdateModal && (
        <AppUpdateModal 
          updateConfig={appUpdateConfig} 
          onClose={() => {
            if (!appUpdateConfig?.forceUpdate) {
              setShowUpdateModal(false);
            }
          }} 
        />
      )}
      {showForgotPassword ? (
        <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />
      ) : isLogin ? (
        <LoginForm
          onToggleForm={() => setIsLogin(false)}
          onLoginSuccess={() => setIsAuthenticated(true)}
          onForgotPassword={() => setShowForgotPassword(true)}
        />
      ) : (
        <RegistrationForm
          onToggleForm={() => setIsLogin(true)}
          onRegisterSuccess={() => setIsLogin(true)}
        />
      )}
    </Suspense>
  );
}

export default App;
