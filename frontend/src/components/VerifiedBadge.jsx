import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import verifiedBadgeImg from '../assets/user_verified_badge.jpeg';

const resolveBadgeSize = (sz) => {
  if (!sz) return "w-[18px] h-[18px]";
  if (sz === 'xs') return "w-3 h-3";
  if (sz === 'sm') return "w-3.5 h-3.5";
  if (sz === 'md') return "w-4.5 h-4.5";
  if (sz === 'lg') return "w-5 h-5";
  if (sz === 'xl') return "w-6 h-6";
  return sz;
};

// Standardized Verification Check Across Entire Application
// ONLY users who received a verificationBadge (golden, purple, blue) from Admin or ID verification get the badge next to their name.
export const isUserVerified = (user) => {
  if (!user) return false;
  const badge = user.verificationBadge;
  if (badge && badge !== 'none') return true;
  if (user.isVerified) return true;
  return false;
};

export const getUserBadgeType = (user) => {
  if (!user) return 'purple';
  if (user.verificationBadge === 'golden') return 'golden';
  return user.verificationBadge || 'purple';
};

const VerifiedBadge = ({ className = "", size, iconClassName, type = "purple" }) => {
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = (e) => {
    e.stopPropagation();
    setShowPopup(!showPopup);
  };

  const isSvgBadge = type !== 'user';
  const isGolden = type === 'golden';
  // Project brand purple (#7c3aed) or golden (#EAB308)
  const badgeColor = isGolden ? '#EAB308' : '#7c3aed';
  const resolvedSize = resolveBadgeSize(size);
  const userBadgeSize = resolvedSize;
  const companyBadgeSize = iconClassName || `${resolvedSize} flex-shrink-0`;

  return (
    <>
      <button
        onClick={togglePopup}
        className={`inline-flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 cursor-pointer ${className}`}
        aria-label="Verified Account Information"
        type="button"
      >
        {isSvgBadge ? (
          <svg viewBox="0 0 24 24" aria-label="Verified account" className={companyBadgeSize} fill="currentColor">
            <g>
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill={badgeColor}/>
              <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
            </g>
          </svg>
        ) : (
          <img
            src={verifiedBadgeImg}
            alt="Verified"
            className={`${userBadgeSize} object-contain rounded-full`}
          />
        )}
      </button>

      {showPopup && createPortal(
        <AnimatePresence>
          {showPopup && (
            <div className="fixed inset-0 z-[100000] flex items-end justify-center sm:items-center p-0 sm:p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPopup(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center z-10 mx-auto border border-slate-100 dark:border-slate-800"
              >
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mb-6 sm:hidden" />
                
                {isSvgBadge ? (
                  <svg viewBox="0 0 24 24" className="w-16 h-16 mb-4 drop-shadow-md" fill="currentColor">
                    <g>
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.79-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.827 2.766 2.057 3.435-.032.227-.057.452-.057.682 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25.52 1.334 1.816 2.25 3.337 2.25s2.816-.916 3.337-2.25c.416.164.866.25 1.336.25 2.21 0 3.918-1.79 3.918-4 0-.23-.025-.455-.057-.682 1.23-.67 2.057-1.976 2.057-3.435z" fill={badgeColor}/>
                      <path d="M14.496 9.613l-3.393 3.393-1.614-1.615c-.293-.293-.768-.293-1.06 0-.294.293-.294.768 0 1.06l2.144 2.146c.146.146.338.22.53.22s.384-.073.53-.22l3.923-3.924c.294-.293.294-.768 0-1.06-.293-.293-.768-.293-1.06 0z" fill="#fff"/>
                    </g>
                  </svg>
                ) : (
                  <img
                    src={verifiedBadgeImg}
                    alt="Verified Badge"
                    className="w-16 h-16 object-contain rounded-full mb-4 shadow-md"
                  />
                )}

                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">
                  {isGolden ? 'Golden Verified Account' : 'Verified Account'}
                </h3>
                <p className="text-[#536471] dark:text-slate-400 text-[15px] text-center mb-8 leading-relaxed">
                  {isGolden
                    ? 'This account has been awarded a Golden Verified Badge by Zenivio in recognition of its premium status and elite standing.'
                    : 'This account has been verified by Zenivio in recognition of its authentic, trustworthy, and verified status.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-[15px] rounded-full transition-colors active:scale-[0.98] cursor-pointer"
                >
                  Got it
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default VerifiedBadge;


