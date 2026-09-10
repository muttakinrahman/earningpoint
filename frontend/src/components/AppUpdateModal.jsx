import React from 'react';
import { Rocket, Sparkles, Download, X, AlertTriangle } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const AppUpdateModal = ({ updateConfig, onClose }) => {
  if (!updateConfig) return null;
  const { latestAppVersion, forceUpdate, updateNotes } = updateConfig;

  const handleUpdateClick = () => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.zenivio.app';
    const marketUrl = 'market://details?id=com.zenivio.app';

    if (Capacitor.isNativePlatform()) {
      try {
        window.location.href = marketUrl;
        setTimeout(() => {
          window.open(playStoreUrl, '_system');
        }, 500);
      } catch (e) {
        window.open(playStoreUrl, '_system');
      }
    } else {
      window.open(playStoreUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-all" 
        onClick={() => !forceUpdate && onClose && onClose()} 
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
        {!forceUpdate && (
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Animated Icon */}
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl mb-4 ${
          forceUpdate 
            ? 'bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 shadow-rose-500/25 animate-pulse' 
            : 'bg-gradient-to-tr from-brand-500 to-indigo-600 shadow-brand-500/30 animate-bounce'
        }`}>
          {forceUpdate ? <AlertTriangle className="w-8 h-8" /> : <Rocket className="w-8 h-8" />}
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black mb-2.5 ${
          forceUpdate
            ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
            : 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
        }`}>
          {forceUpdate ? <AlertTriangle className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
          {forceUpdate ? `Update Required (v${latestAppVersion || '1.1.9'})` : `New Update (v${latestAppVersion || '1.1.9'})`}
        </div>

        {/* Title */}
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {forceUpdate ? 'Update Required 🚀' : 'New Update Available 🚀'}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
          {forceUpdate 
            ? 'You are using an older version of Zenivio. Please update the app from Google Play Store to continue.' 
            : (updateNotes || 'A new update is available on Google Play Store with new features, speed improvements and bug fixes!')}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleUpdateClick}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm tracking-wide uppercase rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4.5 h-4.5" />
            <span>Update Now on Google Play</span>
          </button>

          {!forceUpdate && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppUpdateModal;
