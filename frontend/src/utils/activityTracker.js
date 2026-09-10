import { API_BASE } from '../config';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

let timerId = null;
let appStateListener = null;
let accumulatedSeconds = 0;
let lastInteractionTime = Date.now();
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes idle threshold

const isUserActive = () => {
  const isVisible = typeof document !== 'undefined' && document.visibilityState === 'visible';
  const isNotIdle = (Date.now() - lastInteractionTime) < IDLE_TIMEOUT_MS;
  return isVisible && isNotIdle;
};

const sendHeartbeat = async (secondsToSend) => {
  if (!secondsToSend || secondsToSend <= 0) return;
  const token = localStorage.getItem('token');
  if (!token) return;

  const platform = Capacitor.isNativePlatform() ? 'android' : 'web';

  try {
    const payload = JSON.stringify({ seconds: secondsToSend, platform });
    if (typeof navigator !== 'undefined' && navigator.sendBeacon && document.visibilityState === 'hidden') {
      const blob = new Blob([payload], { type: 'application/json' });
      // SendBeacon doesn't allow custom auth headers easily, so fall back to fetch with keepalive
    }
    
    await fetch(`${API_BASE}/api/activity/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: payload,
      keepalive: true
    });
  } catch (err) {
    // Silently ignore background ping errors
  }
};

const flushAccumulated = () => {
  if (accumulatedSeconds > 0) {
    const toSend = accumulatedSeconds;
    accumulatedSeconds = 0;
    sendHeartbeat(toSend);
  }
};

const handleUserInteraction = () => {
  lastInteractionTime = Date.now();
};

export const initActivityTracker = () => {
  if (timerId) return; // already running

  lastInteractionTime = Date.now();
  accumulatedSeconds = 0;

  // Interaction listeners to detect genuine activity
  const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
  events.forEach(ev => window.addEventListener(ev, handleUserInteraction, { passive: true }));

  // Flush on visibility change / unload
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      flushAccumulated();
    } else {
      lastInteractionTime = Date.now();
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', flushAccumulated);
  window.addEventListener('beforeunload', flushAccumulated);

  // Native Capacitor App State Change
  if (Capacitor.isNativePlatform()) {
    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (!isActive) {
        flushAccumulated();
      } else {
        lastInteractionTime = Date.now();
      }
    }).then(l => { appStateListener = l; });
  }

  // 1-second interval accumulator
  timerId = setInterval(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (isUserActive()) {
      accumulatedSeconds += 1;
      if (accumulatedSeconds >= 30) {
        flushAccumulated();
      }
    }
  }, 1000);

  return () => {
    stopActivityTracker();
    events.forEach(ev => window.removeEventListener(ev, handleUserInteraction));
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', flushAccumulated);
    window.removeEventListener('beforeunload', flushAccumulated);
    if (appStateListener) appStateListener.remove();
  };
};

export const stopActivityTracker = () => {
  flushAccumulated();
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
};
