import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Share2, 
  ChevronDown, 
  Play, 
  Heart, 
  Loader2,
  FileText,
  MessageCircle,
  Globe,
  User,
  UserPlus,
  Camera,
  MapPin,
  Link as LinkIcon,
  Grid,
  Bookmark,
  ShoppingBag,
  Plus,
  X,
  Volume2,
  VolumeX,
  Calendar,
  Download,
  Search,
  Send,
  Trash2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Edit,
  Repeat
} from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import VerifiedBadge, { isUserVerified, getUserBadgeType } from './VerifiedBadge';
import ShareModal from './ShareModal';
import ImagePreviewModal from './ImagePreviewModal';
import ImageCropModal from './ImageCropModal';
import VerifyIn2MinutesModal from './VerifyIn2MinutesModal';
import PostMediaCarousel from './PostMediaCarousel';

// Reactions List Modal (Who Reacted / Liked on Profile Posts)
const ProfileReactionsModal = ({ postId, onClose, onUserClick }) => {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/posts/${postId}/reactions`);
        if (res.ok) {
          const data = await res.json();
          setReactions(data);
        }
      } catch (err) {
        console.error('Failed to fetch reactions:', err);
      } finally {
        setLoading(false);
      }
    };
    if (postId) fetchReactions();
  }, [postId]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800 animate-scale-pulse-glow max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <span className="text-rose-500">❤️</span> Reactions ({reactions.length})
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/40">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
            </div>
          ) : reactions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6 font-bold">No reactions yet</p>
          ) : (
            reactions.map((user) => (
              <div 
                key={user._id} 
                onClick={() => { onClose(); onUserClick && onUserClick(user._id); }}
                className="flex items-center justify-between pt-2.5 first:pt-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-2xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {user.profilePic ? (
                    <img src={getImageUrl(user.profilePic)} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black text-xs shrink-0">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                      <span className="truncate">{user.name}</span>
                      {isUserVerified(user) && (
                        <VerifiedBadge size="sm" type={getUserBadgeType(user)} />
                      )}
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm shrink-0 shadow-xs border border-slate-200 dark:border-slate-700">
                  {user.emoji || '❤️'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Comments Drawer Slide-up Component for Profile Posts
const ProfileCommentsDrawer = ({ post, onClose, onCommentSubmit, currentUserId, onUserClick }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const listRef = React.useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    if (replyingTo) {
      await onCommentSubmit(post._id, commentText.trim(), replyingTo.commentId, replyingTo.userName, replyingTo.userId);
      setReplyingTo(null);
    } else {
      await onCommentSubmit(post._id, commentText.trim());
    }
    setCommentText('');
    setIsSubmitting(false);

    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleReplyClick = (commentId, userName, userId) => {
    setReplyingTo({ commentId, userName, userId });
    setCommentText(`@${userName} `);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-md max-h-[85vh] sm:max-h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col animate-fade-in-up border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="w-12 h-1 bg-slate-250 dark:bg-slate-750 rounded-full mx-auto my-3 flex-shrink-0" />

        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-850 flex-shrink-0">
          <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">
            Comments ({post.comments?.length || post.commentsCount || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, i) => (
              <div key={i} className="space-y-2">
                <div className="flex gap-3 items-start">
                  <button
                    onClick={() => comment.user && onUserClick && onUserClick(comment.user)}
                    className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden active:scale-90 transition-transform"
                  >
                    {comment.userAvatar ? (
                      <img
                        src={getImageUrl(comment.userAvatar)}
                        alt={comment.userName}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span>{comment.userName ? comment.userName.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </button>
                  <div className="flex-1 bg-slate-50 dark:bg-slate-850 rounded-2xl px-4 py-2.5 relative">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => comment.user && onUserClick && onUserClick(typeof comment.user === 'object' ? comment.user._id : comment.user)}
                        className="font-black text-xs text-slate-750 dark:text-slate-350 hover:underline text-left flex items-center gap-1"
                      >
                        <span>{comment.userName || 'User'}</span>
                        {(isUserVerified(comment) || isUserVerified(comment.user)) && (
                          <VerifiedBadge type={getUserBadgeType(comment.user || comment)} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                        )}
                      </button>
                      <button
                        onClick={() => handleReplyClick(comment._id, comment.userName, comment.user)}
                        className="text-[10px] font-black text-[#7C3AED] hover:underline"
                      >
                        Reply
                      </button>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>

                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-10 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                    {comment.replies.map((reply, rIdx) => (
                      <div key={rIdx} className="flex gap-2.5 items-start">
                        <button
                          onClick={() => reply.user && onUserClick && onUserClick(reply.user)}
                          className="w-6.5 h-6.5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0 overflow-hidden"
                        >
                          {reply.userAvatar ? (
                            <img src={getImageUrl(reply.userAvatar)} alt={reply.userName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>{reply.userName ? reply.userName.charAt(0).toUpperCase() : 'U'}</span>
                          )}
                        </button>
                        <div className="flex-1 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl px-3 py-2 text-xs relative">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => reply.user && onUserClick && onUserClick(typeof reply.user === 'object' ? reply.user._id : reply.user)}
                              className="font-black text-[11px] text-slate-800 dark:text-slate-200 hover:underline flex items-center gap-1"
                            >
                              <span>{reply.userName}</span>
                              {(isUserVerified(reply) || isUserVerified(reply.user)) && (
                                <VerifiedBadge type={getUserBadgeType(reply.user || reply)} iconClassName="w-3 h-3 flex-shrink-0" />
                              )}
                            </button>
                            <button
                              onClick={() => handleReplyClick(comment._id, reply.userName, reply.user)}
                              className="text-[10px] font-black text-[#7C3AED] hover:underline"
                            >
                              Reply
                            </button>
                          </div>
                          <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-normal">
                            {reply.replyToUser && (
                              <span className="font-extrabold text-[#7C3AED] mr-1">@{reply.replyToUser}</span>
                            )}
                            {reply.text.replace(new RegExp(`^@${reply.replyToUser}\\s*`), '')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 space-y-2">
              <MessageCircle className="w-10 h-10 opacity-30 animate-bounce" />
              <p className="text-xs font-bold">No comments yet. Share your thoughts!</p>
            </div>
          )}
        </div>

        {replyingTo && (
          <div className="px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between text-xs text-[#7C3AED] font-bold flex-shrink-0">
            <span>Replying to <span className="underline">@{replyingTo.userName}</span></span>
            <button onClick={() => { setReplyingTo(null); setCommentText(''); }} className="p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 pb-safe flex-shrink-0">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={replyingTo ? `Reply to @${replyingTo.userName}...` : "Add a comment..."}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED] font-semibold"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-40 transition-opacity active:scale-95 flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

const formatCount = (num) => {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

const formatRelativeTime = (dateStr) => {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

const formatDob = (dobStr) => {
  if (!dobStr) return '';
  try {
    const d = new Date(dobStr);
    if (isNaN(d.getTime())) return dobStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dobStr;
  }
};

// Client-side image compression helper (WebP HD)
const compressImage = (base64Str, maxWidth = 1920, maxHeight = 1920, quality = 0.92) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let compressedBase64 = canvas.toDataURL('image/webp', quality);
      if (!compressedBase64.startsWith('data:image/webp')) {
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(compressedBase64);
    };
    img.onerror = () => {
      resolve(base64Str); // Fallback to original
    };
  });
};

const FollowListModal = ({ targetUserId, initialTab, onClose, onUserClick, setActiveChatPartner, setActiveTab }) => {
  const [activeTab, setActiveTabMode] = useState(initialTab || 'followers');
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsersList(activeTab);
  }, [activeTab]);

  const fetchUsersList = async (tab) => {
    setLoading(true);
    setIsPrivate(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/${targetUserId}/${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 403) {
        setIsPrivate(true);
        setUsersList([]);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.isPrivate) {
          setIsPrivate(true);
          setUsersList([]);
        } else {
          setUsersList(Array.isArray(data) ? data : []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch follow list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => {
          if (u._id === userId) {
            return { ...u, isFollowing: data.isFollowing };
          }
          return u;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const filteredUsers = usersList.filter(u => 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-md max-h-[85vh] h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col animate-fade-in-up border border-slate-100 dark:border-slate-800 overflow-hidden">
        
        {/* Header with Tabs */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTabMode('followers')}
              className={`text-sm font-black transition-colors ${activeTab === 'followers' ? 'text-[#7C3AED] dark:text-indigo-400 border-b-2 border-[#7C3AED] pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Followers
            </button>
            <button
              onClick={() => setActiveTabMode('following')}
              className={`text-sm font-black transition-colors ${activeTab === 'following' ? 'text-[#7C3AED] dark:text-indigo-400 border-b-2 border-[#7C3AED] pb-1' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Following
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/50 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 pl-9 pr-4 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#7C3AED]" />
              <span className="text-xs font-bold">Loading users...</span>
            </div>
          ) : isPrivate ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-[#7C3AED] dark:text-indigo-400">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">This List is Private</h4>
              <p className="text-xs text-slate-400 font-bold max-w-xs leading-relaxed">
                This user has hidden their followers and following list in their privacy settings.
              </p>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div 
                key={u._id} 
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
              >
                <div 
                  onClick={() => {
                    onClose();
                    if (onUserClick) onUserClick(u._id);
                  }}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 flex-shrink-0 overflow-hidden">
                    {u.profilePic ? (
                      <img src={getImageUrl(u.profilePic)} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{u.name ? u.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-1">
                      {u.name}
                      {u.verificationBadge && u.verificationBadge !== 'none' && (
                        <VerifiedBadge type={u.verificationBadge === 'golden' ? 'golden' : 'blue'} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                    </h4>
                  </div>
                </div>

                {!u.isSelf && (
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {/* Follow Toggle Button */}
                    <button
                      onClick={() => handleFollowToggle(u._id)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 ${
                        u.isFollowing
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-[#7C3AED] hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      {u.isFollowing ? 'Following' : '+ Follow'}
                    </button>

                    {/* Chat Button */}
                    <button
                      onClick={() => {
                        onClose();
                        if (setActiveChatPartner) setActiveChatPartner(u);
                        if (setActiveTab) setActiveTab('Messenger');
                      }}
                      className="p-2 rounded-xl bg-indigo-50 dark:bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-indigo-100 active:scale-95 transition-all"
                      title="Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              No {activeTab} found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PublicProfilePage = ({ userId, onBack, currentUser, isOwnProfile, setActiveTab, setSelectedReelId, setActiveChatPartner, startEditing, onUserClick, onlineUsers = [], socket = null }) => {
  const [liveOnlineUsers, setLiveOnlineUsers] = useState(onlineUsers || []);

  useEffect(() => {
    if (Array.isArray(onlineUsers)) {
      setLiveOnlineUsers(onlineUsers);
    }
  }, [onlineUsers]);

  useEffect(() => {
    if (!socket) return;
    const handleOnlineUsers = (usersList) => {
      if (Array.isArray(usersList)) {
        setLiveOnlineUsers(usersList);
      }
    };
    socket.on('online_users', handleOnlineUsers);
    return () => {
      socket.off('online_users', handleOnlineUsers);
    };
  }, [socket]);

  const [profile, setProfile] = useState(() => {
    if ((isOwnProfile || userId === 'me' || (currentUser && (userId === currentUser._id || userId === currentUser.id))) && currentUser) {
      return currentUser;
    }
    const cached = userId ? localStorage.getItem(`cached_profile_data_${userId}`) : null;
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed.user;
      } catch (e) {}
    }
    return null;
  });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', title: '', text: '' });
  const [followListModal, setFollowListModal] = useState(null); // null or 'followers' | 'following'
  const [videos, setVideos] = useState(() => {
    const cached = userId ? localStorage.getItem(`cached_profile_data_${userId}`) : null;
    if (cached) {
      try { return JSON.parse(cached).videos || []; } catch (e) {}
    }
    return [];
  });
  const [posts, setPosts] = useState(() => {
    const cached = userId ? localStorage.getItem(`cached_profile_data_${userId}`) : null;
    if (cached) {
      try { return JSON.parse(cached).posts || []; } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    if ((isOwnProfile || userId === 'me') && currentUser) return false;
    const cached = userId ? localStorage.getItem(`cached_profile_data_${userId}`) : null;
    return !cached;
  });

  // UGC Block & Report States
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [actionLoading, setActionLoading] = useState(false);
  const [imageCompressing, setImageCompressing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = React.useRef(null);

  // Own Post Management States
  const [postActionMenuOpen, setPostActionMenuOpen] = useState(false);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editingPostContent, setEditingPostContent] = useState('');
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  // Photo Upload Caption & Confirmation Modal State
  const [pendingUploadModal, setPendingUploadModal] = useState({
    isOpen: false,
    type: 'avatar',
    image: '',
    caption: ''
  });
  
  // 4-icon tabs navigation: 'grid', 'reels', 'shop', 'saved'
  const [activeSubTab, setActiveSubTab] = useState('grid');
  
  // Highlights Modal State
  const [showHighlightModal, setShowHighlightModal] = useState(false);
  const [hlTitle, setHlTitle] = useState('');
  const [hlCover, setHlCover] = useState('');
  const [hlSelectedPosts, setHlSelectedPosts] = useState([]);

  // Story Highlights Player State
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [hlActiveIndex, setHlActiveIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyMuted, setStoryMuted] = useState(true);

  // Post Detail Modal State
  const [selectedDetailPost, setSelectedDetailPost] = useState(null);
  const [savedPosts, setSavedPosts] = useState([]);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [showReactionsPostId, setShowReactionsPostId] = useState(null);
  const [activeCommentPost, setActiveCommentPost] = useState(null);

  // Edit Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showVerify2MinModal, setShowVerify2MinModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editDobPrivacy, setEditDobPrivacy] = useState('public');
  const [editGenderPrivacy, setEditGenderPrivacy] = useState('public');

  // Refs for File Uploads
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const highlightCoverInputRef = useRef(null);

  const isOwn = isOwnProfile || userId === 'me' || (profile && currentUser && (profile._id === currentUser._id || profile._id === currentUser.id));

  // Show a short-lived toast
  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    const handleReclick = (e) => {
      if (e.detail && (e.detail.tab === 'MyProfile' || e.detail.tab === 'Profile')) {
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTop = 0;
          mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (typeof fetchProfileData === 'function') fetchProfileData();
      }
    };
    window.addEventListener('tabReclickRefresh', handleReclick);
    return () => window.removeEventListener('tabReclickRefresh', handleReclick);
  }, []);

  useEffect(() => {
    if (activeSubTab === 'saved' && isOwn) {
      const fetchSavedPosts = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/posts/saved`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSavedPosts(data);
          }
        } catch (err) {
          console.error('Failed to fetch saved posts:', err);
        }
      };
      fetchSavedPosts();
    }
  }, [activeSubTab, isOwn]);

  // Open edit modal if startEditing is true
  useEffect(() => {
    if (startEditing) {
      setShowEditProfileModal(true);
    }
  }, [startEditing]);

  // Populate edit fields when profile changes
  useEffect(() => {
    if (profile) {
      setEditName(profile.name || '');
      setEditBio(profile.bio || '');
      setEditWebsite(profile.website || '');
      setEditLocation(profile.location || '');
      setEditDob(profile.dob || '');
      setEditGender(profile.gender || '');
      setEditDobPrivacy(profile.dobPrivacy || 'public');
      setEditGenderPrivacy(profile.genderPrivacy || 'public');
    }
  }, [profile, showEditProfileModal]);

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          website: editWebsite.trim(),
          location: editLocation.trim(),
          dob: editDob,
          gender: editGender,
          dobPrivacy: editDobPrivacy,
          genderPrivacy: editGenderPrivacy
        })
      });

      if (res.ok) {
        setShowEditProfileModal(false);
        fetchPublicProfile();
      }
    } catch (err) {
      console.error('Failed to update profile details:', err);
    }
  };

  const fetchPublicProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setVideos(data.videos || []);
        setPosts(data.posts || []);
        localStorage.setItem(`cached_profile_data_${userId}`, JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch public profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      // Try to load cached data for instant renders
      const cached = localStorage.getItem(`cached_profile_data_${userId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setProfile(parsed.user);
          setVideos(parsed.videos || []);
          setPosts(parsed.posts || []);
          setLoading(false);
        } catch (e) {
          console.error('Failed to parse cached profile data:', e);
        }
      } else {
        setLoading(true);
      }
      fetchPublicProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Listen for posts shared to feed to update profile grid instantly
  useEffect(() => {
    const handlePostShared = (e) => {
      const sharedPost = e.detail?.post || e.detail;
      if (sharedPost && sharedPost._id) {
        setPosts(prev => [sharedPost, ...(prev || [])]);
        setProfile(prev => prev ? { ...prev, postsCount: (prev.postsCount || (posts ? posts.length : 0)) + 1 } : prev);
      }
    };
    window.addEventListener('post_shared', handlePostShared);
    return () => window.removeEventListener('post_shared', handlePostShared);
  }, [posts]);

  // Handle auto-advancing story highlights
  useEffect(() => {
    if (!activeHighlight || !activeHighlight.posts || activeHighlight.posts.length === 0) {
      setStoryProgress(0);
      return;
    }

    const STORY_DURATION = 5000; // 5 seconds per story slide
    const intervalTime = 50; 
    const step = (intervalTime / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setStoryProgress(prev => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeHighlight, hlActiveIndex]);

  const handleNextStory = () => {
    if (!activeHighlight) return;
    setStoryProgress(0);
    if (hlActiveIndex < activeHighlight.posts.length - 1) {
      setHlActiveIndex(prev => prev + 1);
    } else {
      setActiveHighlight(null);
      setHlActiveIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (!activeHighlight) return;
    setStoryProgress(0);
    if (hlActiveIndex > 0) {
      setHlActiveIndex(prev => prev - 1);
    } else {
      setStoryProgress(0); // restart first story
    }
  };

  const handlePlayHighlight = (hl) => {
    if (!hl.posts || hl.posts.length === 0) return;
    setActiveHighlight(hl);
    setHlActiveIndex(0);
    setStoryProgress(0);
  };

  // Open post modal with real-time comments & like status
  const handleOpenPostDetail = async (post) => {
    const userIdStr = currentUser?._id ? currentUser._id.toString() : '';
    const isLiked = (post.likes || []).some(id => (typeof id === 'object' && id?._id ? id._id.toString() : id.toString()) === userIdStr);
    setSelectedDetailPost({ ...post, isLiked });

    try {
      const res = await fetch(`${API_BASE}/api/posts/${post._id}`);
      if (res.ok) {
        const fullPost = await res.json();
        const isLikedFresh = (fullPost.likes || []).some(id => (typeof id === 'object' && id?._id ? id._id.toString() : id.toString()) === userIdStr);
        setSelectedDetailPost(prev => prev && prev._id === post._id ? {
          ...prev,
          ...fullPost,
          isLiked: isLikedFresh,
          likesCount: fullPost.likes?.length || 0,
          commentsCount: fullPost.comments?.length || 0
        } : prev);
      }
    } catch (e) {
      console.error('Failed to fetch full post detail:', e);
    }
  };

  // Like / Unlike post directly from profile
  const handleLikeToggleDetail = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json(); // { likesCount, isLiked }
        const userIdStr = currentUser?._id ? currentUser._id.toString() : '';
        
        setSelectedDetailPost(prev => {
          if (!prev || prev._id !== postId) return prev;
          let newLikes = (prev.likes || []).map(id => typeof id === 'object' && id?._id ? id._id.toString() : id.toString());
          if (data.isLiked) {
            if (userIdStr && !newLikes.includes(userIdStr)) newLikes.push(userIdStr);
          } else {
            newLikes = newLikes.filter(id => id !== userIdStr);
          }
          return { ...prev, likesCount: data.likesCount, isLiked: data.isLiked, likes: newLikes };
        });

        setPosts(prev => prev.map(p => {
          if (p._id === postId) {
            let newLikes = (p.likes || []).map(id => typeof id === 'object' && id?._id ? id._id.toString() : id.toString());
            if (data.isLiked) {
              if (userIdStr && !newLikes.includes(userIdStr)) newLikes.push(userIdStr);
            } else {
              newLikes = newLikes.filter(id => id !== userIdStr);
            }
            return { ...p, likesCount: data.likesCount, isLiked: data.isLiked, likes: newLikes };
          }
          return p;
        }));

        setSavedPosts(prev => prev.map(p => {
          if (p._id === postId) {
            return { ...p, likesCount: data.likesCount, isLiked: data.isLiked };
          }
          return p;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle like on profile post:', err);
    }
  };

  // Submit comment / nested reply directly from profile
  const handleCommentSubmitDetail = async (postId, text, commentId = null, replyToUser = '', replyToUserId = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      let url = `${API_BASE}/api/posts/${postId}/comment`;
      let body = { text };

      if (commentId) {
        url = `${API_BASE}/api/posts/${postId}/comment/${commentId}/reply`;
        body = { text, replyToUser, replyToUserId };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const postRes = await fetch(`${API_BASE}/api/posts/${postId}`);
        if (postRes.ok) {
          const freshPost = await postRes.json();
          const count = freshPost.comments?.length || 0;
          setSelectedDetailPost(prev => prev && prev._id === postId ? { ...prev, comments: freshPost.comments, commentsCount: count } : prev);
          setActiveCommentPost(prev => prev && prev._id === postId ? { ...prev, comments: freshPost.comments, commentsCount: count } : prev);
          setPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: count, comments: freshPost.comments } : p));
          setSavedPosts(prev => prev.map(p => p._id === postId ? { ...p, commentsCount: count, comments: freshPost.comments } : p));
        }
      }
    } catch (err) {
      console.error('Failed to submit comment in profile:', err);
    }
  };

  // Image Framing & Crop State
  const [cropModalData, setCropModalData] = useState({ isOpen: false, imageSrc: '', type: 'avatar' });
  const [showLevelUpgradeModal, setShowLevelUpgradeModal] = useState(false);
  const [levelUpgradeLoading, setLevelUpgradeLoading] = useState(false);

  // Upload/Change Cover photo with interactive crop & framing
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropModalData({ isOpen: true, imageSrc: reader.result, type: 'cover' });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Upload/Change Profile photo with interactive crop & framing
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropModalData({ isOpen: true, imageSrc: reader.result, type: 'avatar' });
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Handle completed crop from ImageCropModal — open caption dialog
  const handleCropComplete = (croppedBase64) => {
    const isAvatar = cropModalData.type === 'avatar';
    setCropModalData({ isOpen: false, imageSrc: '', type: 'avatar' });
    setPendingUploadModal({
      isOpen: true,
      type: isAvatar ? 'avatar' : 'cover',
      image: croppedBase64,
      caption: ''
    });
  };

  // Confirm photo upload with custom caption
  const handleConfirmPhotoUpload = async () => {
    const isAvatar = pendingUploadModal.type === 'avatar';
    const imageToUpload = pendingUploadModal.image;
    const captionToUpload = pendingUploadModal.caption;
    setPendingUploadModal({ isOpen: false, type: 'avatar', image: '', caption: '' });
    setImageCompressing(true);

    try {
      if (isAvatar) {
        setProfile(prev => ({ ...prev, profilePic: imageToUpload }));
      } else {
        setProfile(prev => ({ ...prev, coverPic: imageToUpload }));
      }

      const token = localStorage.getItem('token');
      const payload = isAvatar 
        ? { profilePic: imageToUpload, profilePicCaption: captionToUpload.trim() || undefined }
        : { coverPic: imageToUpload, coverPicCaption: captionToUpload.trim() || undefined };

      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToastNotification(isAvatar ? 'Profile picture updated! ✨' : 'Cover photo updated! ✨');
        fetchPublicProfile();
      } else {
        const errorData = await res.json();
        showToastNotification(errorData.message || 'Failed to update photo');
      }
    } catch (err) {
      console.error('Failed to save cropped photo:', err);
      showToastNotification('Failed to update photo. Please try again.');
    } finally {
      setImageCompressing(false);
    }
  };

  // Handle Delete Post from Detail View
  const handleDeleteDetailPost = async () => {
    if (!selectedDetailPost?._id) return;
    setIsDeletingPost(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${selectedDetailPost._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setProfile(prev => prev ? {
          ...prev,
          posts: (prev.posts || []).filter(p => (p._id || p) !== selectedDetailPost._id),
          postsCount: Math.max(0, (prev.postsCount || 1) - 1)
        } : prev);
        setPosts(prev => (prev || []).filter(p => (p._id || p) !== selectedDetailPost._id));
        // Remove from cached feed if exists
        try {
          const cachedFeed = localStorage.getItem('cached_feed_posts');
          if (cachedFeed) {
            const list = JSON.parse(cachedFeed);
            const filtered = list.filter(p => p._id !== selectedDetailPost._id);
            localStorage.setItem('cached_feed_posts', JSON.stringify(filtered));
          }
        } catch (_) {}
        showToastNotification('Post deleted successfully! 🗑️');
        setShowDeletePostConfirm(false);
        setSelectedDetailPost(null);
      } else {
        const data = await res.json();
        showToastNotification(data.message || 'Failed to delete post');
      }
    } catch (err) {
      console.error('Delete post error:', err);
      showToastNotification('Network error while deleting post');
    } finally {
      setIsDeletingPost(false);
    }
  };

  // Handle Update Post Content from Detail View
  const handleUpdateDetailPost = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedDetailPost?._id) return;
    setIsUpdatingPost(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${selectedDetailPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: editingPostContent })
      });
      if (res.ok) {
        setSelectedDetailPost(prev => prev ? { ...prev, content: editingPostContent } : null);
        setProfile(prev => prev ? {
          ...prev,
          posts: (prev.posts || []).map(p => (p._id === selectedDetailPost._id ? { ...p, content: editingPostContent } : p))
        } : prev);
        setPosts(prev => (prev || []).map(p => (p._id === selectedDetailPost._id ? { ...p, content: editingPostContent } : p)));
        showToastNotification('Post updated successfully! ✨');
        setShowEditPostModal(false);
      } else {
        const data = await res.json();
        showToastNotification(data.message || 'Failed to update post');
      }
    } catch (err) {
      console.error('Update post error:', err);
      showToastNotification('Network error while updating post');
    } finally {
      setIsUpdatingPost(false);
    }
  };

  // Handle Level Upgrade with Coins
  const handleUpgradeLevel = async () => {
    setLevelUpgradeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/earning/upgrade-level`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(prev => ({
          ...prev,
          level: data.level,
          levelName: data.levelName,
          points: data.points
        }));
        showToastNotification(data.message || 'Level upgraded successfully! 🎉');
        setShowLevelUpgradeModal(false);
        fetchPublicProfile();
      } else {
        showToastNotification(data.message || 'Failed to upgrade level');
      }
    } catch (err) {
      console.error('Level upgrade failed:', err);
      showToastNotification('Network error during level upgrade');
    } finally {
      setLevelUpgradeLoading(false);
    }
  };

  // Upload highlight cover photo with compression
  const handleHighlightCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const originalBase64 = reader.result;
          const base64 = await compressImage(originalBase64, 1080, 1080, 0.92);
          setHlCover(base64);
        } catch (err) {
          console.error('Failed to compress highlight cover:', err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Select/Deselect post inside highlight modal
  const handleTogglePostSelect = (postId) => {
    setHlSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      } else {
        return [...prev, postId];
      }
    });
  };

  // Close creation highlight modal
  const handleCloseHighlightModal = () => {
    setShowHighlightModal(false);
    setHlTitle('');
    setHlCover('');
    setHlSelectedPosts([]);
  };

  // Create Highlight Submission with fallback cover
  const handleCreateHighlightSubmit = async () => {
    if (!hlTitle.trim() || hlSelectedPosts.length === 0) return;

    let coverToSave = hlCover;
    if (!coverToSave) {
      // Find the first selected post inside selectable list
      const firstPost = allSelectablePosts.find(p => p._id === hlSelectedPosts[0]);
      if (firstPost) {
        // Retrieve either image (community post attachment / reel cover) or video
        coverToSave = firstPost.image || firstPost.video || '';
      }
    }

    const newHighlight = {
      title: hlTitle.trim(),
      cover: coverToSave,
      posts: hlSelectedPosts
    };

    const updatedHighlights = [...(profile.highlights || []), newHighlight];
    handleCloseHighlightModal();

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlights: updatedHighlights })
      });
      if (res.ok) {
        fetchPublicProfile();
      }
    } catch (err) {
      console.error('Failed to save highlight:', err);
    }
  };

  // Delete Highlight (Owner only)
  const handleDeleteHighlight = async (indexToDelete) => {
    if (!window.confirm('Are you sure you want to delete this highlight?')) return;
    
    const updatedHighlights = (profile.highlights || []).filter((_, idx) => idx !== indexToDelete);
    setProfile(prev => ({ ...prev, highlights: updatedHighlights }));

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ highlights: updatedHighlights })
      });
    } catch (err) {
      console.error('Failed to delete highlight:', err);
    }
  };

  const handleSaveToggleDetail = async (post) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDetailPost(prev => prev ? { ...prev, isSaved: data.isSaved } : null);
        showToastNotification(data.isSaved ? 'Post saved! 💾' : 'Post unsaved! ❌');
        
        setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isSaved: data.isSaved } : p));
        setSavedPosts(prev => {
          if (data.isSaved) {
            if (!prev.some(p => p._id === post._id)) {
              return [...prev, { ...post, isSaved: true }];
            }
            return prev.map(p => p._id === post._id ? { ...p, isSaved: true } : p);
          } else {
            return prev.filter(p => p._id !== post._id);
          }
        });
      }
    } catch (err) {
      console.error('Failed to toggle save post:', err);
    }
  };

  const handleBlockUser = async () => {
    if (!profile) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${profile._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        showToastNotification(data.isBlocked ? '🚫 User Blocked successfully!' : '✅ User Unblocked!');
        setShowActionsMenu(false);
        setProfile(prev => ({ ...prev, isBlocked: data.isBlocked }));
        if (data.isBlocked) {
          setTimeout(() => { onBack(); }, 1200);
        }
      }
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleReportUser = async () => {
    if (!profile) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/report/${profile._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        showToastNotification('🚨 User Reported & Blocked!');
        setShowReportModal(false);
        setShowActionsMenu(false);
        setTimeout(() => { onBack(); }, 1200);
      }
    } catch (err) {
      console.error('Failed to report user:', err);
    }
  };

  const handleFollowToggle = async () => {
    if (actionLoading || !profile) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(prev => ({
          ...prev,
          isFollowing: data.isFollowing,
          followersCount: data.isFollowing ? prev.followersCount + 1 : Math.max(0, prev.followersCount - 1)
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!profile) return;
    if (setActiveChatPartner) {
      setActiveChatPartner({
        _id: profile._id,
        name: profile.name,
        profilePic: profile.profilePic || profile.googleAvatar || profile.facebookAvatar || ''
      });
    }
    if (setActiveTab) {
      setActiveTab('Messenger');
    }
  };

  // Combined posts and reels list for Selection in Highlight modal (Preserve image field)
  const allSelectablePosts = [
    ...posts,
    ...videos.map(v => ({ ...v, content: v.title || 'Video Reel' }))
  ];

  const totalPosts = (videos ? videos.length : 0) + (posts ? posts.length : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 animate-pulse">
        {/* Cover Skeleton */}
        <div className="w-full h-44 sm:h-52 bg-slate-200 dark:bg-slate-800" />
        
        <div className="max-w-2xl md:max-w-3xl lg:max-w-xl xl:max-w-2xl mx-auto px-2 sm:px-4 relative -mt-16 space-y-5">
          {/* Avatar Skeleton */}
          <div className="flex items-end justify-between">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-950 bg-slate-300 dark:bg-slate-800 shadow-md" />
            <div className="w-24 h-9 bg-slate-200 dark:bg-slate-800 rounded-full" />
          </div>

          {/* Name & Bio Skeleton */}
          <div className="space-y-2">
            <div className="w-40 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md mt-2" />
          </div>

          {/* Stats Bar Skeleton */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100 dark:border-slate-800">
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>

          {/* Grid Skeleton */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-4">
        <p className="text-slate-500 dark:text-slate-400 font-bold">User profile could not be loaded.</p>
        <button 
          onClick={onBack}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-850 dark:text-slate-100 flex flex-col no-scrollbar">
      {/* Main Cover Banner */}
      <div 
        onClick={() => profile.coverPic && setPreviewImageUrl(getImageUrl(profile.coverPic))}
        className={`relative w-full h-44 sm:h-52 bg-slate-200 dark:bg-slate-800 overflow-hidden group ${profile.coverPic ? 'cursor-pointer' : ''}`}
        title={profile.coverPic ? "Click to view and zoom cover banner" : ""}
      >
        {profile.coverPic ? (
          <img
            src={getImageUrl(profile.coverPic)}
            alt="Cover banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 flex items-center justify-center opacity-90">
            <span className="text-white/20 font-black tracking-widest text-lg select-none">ZENIVIO</span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onBack) {
              onBack();
            } else if (setActiveTab) {
              setActiveTab('Home');
            }
          }}
          className="absolute top-[max(16px,env(safe-area-inset-top))] left-4 p-2.5 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full z-50 transition-all active:scale-90 shadow-md border border-white/10 flex items-center justify-center cursor-pointer"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Centered Avatar and Info Overlap */}
      <div className="relative flex flex-col items-center px-4 -mt-14 sm:-mt-16">
        <div 
          onClick={() => profile.profilePic && setPreviewImageUrl(getImageUrl(profile.profilePic))}
          className={`relative group ${profile.profilePic ? 'cursor-pointer' : ''}`}
          title={profile.profilePic ? "Click to view and zoom profile photo" : ""}
        >
          {/* Glowing ring/border */}
          <div className="p-1 bg-gradient-to-tr from-[#00ffff] via-[#818cf8] to-[#c084fc] rounded-full shadow-xl">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-950 bg-slate-100 flex items-center justify-center relative hover:scale-105 active:scale-95 transition-transform duration-200">
              {profile.profilePic ? (
                <img
                  src={getImageUrl(profile.profilePic)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black">
                  {profile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
          </div>
          
          {!isOwn && profile?._id && Array.isArray(liveOnlineUsers) && liveOnlineUsers.some(id => id && id.toString() === profile._id.toString()) && (
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-950 shadow-md animate-pulse" title="Active Now" />
          )}
        </div>

        {/* User Details */}
        <div className="text-center mt-3.5 space-y-1 w-full max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
            {profile.name}
            {isUserVerified(profile) && (
              <VerifiedBadge type={getUserBadgeType(profile)} iconClassName="w-5 h-5 flex-shrink-0" />
            )}
          </h2>

          {/* Simple "Verified Account" text above bio (Account Security / Phone & Email verification) */}
          {Boolean(profile.isPhoneVerified && profile.isEmailVerified) ? (
            <div className="flex items-center justify-center pt-1 pb-0.5 select-none">
              {isOwn ? (
                <button
                  type="button"
                  onClick={() => setShowVerify2MinModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 px-3 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="View Account Verification Details"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Account</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVerify2MinModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50 px-3 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="View Account Verification Details"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Account</span>
                </button>
              )}
            </div>
          ) : isOwn ? (
            <div className="flex items-center justify-center pt-1.5 pb-0.5 select-none">
              <button
                type="button"
                onClick={() => setShowVerify2MinModal(true)}
                className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:to-purple-700 text-white text-[11px] font-black shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 active:scale-95 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-200 group-hover:scale-110 transition-transform" />
                <span>Verify in 2 minutes</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : null}

          {profile.bio && (
            <p className="text-xs font-semibold text-slate-655 dark:text-slate-350 leading-relaxed px-4 pt-1 max-w-sm mx-auto whitespace-pre-wrap select-text">
              {profile.bio}
            </p>
          )}

          {/* Location, Website, Dob & Gender row */}
          {(profile.location || profile.website || profile.dob || profile.gender) && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{profile.location}</span>
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[150px]">{profile.website.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
              {profile.dob && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{formatDob(profile.dob)}</span>
                </span>
              )}
              {profile.gender && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{profile.gender}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Profile Statistics counts card */}
      <div className="max-w-xl mx-auto w-full px-2 sm:px-4 mt-5">
        <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-4 flex justify-around text-center shadow-xs border border-slate-100 dark:border-slate-800/50">
          <div 
            onClick={() => setFollowListModal('following')}
            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Following"
          >
            <span className="text-base font-black text-slate-900 dark:text-white block">{formatCount(profile.followingCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Following</span>
          </div>
          <div 
            onClick={() => setFollowListModal('followers')}
            className="flex-1 border-x border-slate-100 dark:border-slate-800/50 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Followers"
          >
            <span className="text-base font-black text-slate-900 dark:text-white block">{formatCount(profile.followersCount)}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Followers</span>
          </div>
          <div className="flex-1">
            <span className="text-base font-black text-slate-900 dark:text-white block">{totalPosts}</span>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">Posts</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xl mx-auto">
        {isOwn ? (
          <div className="flex items-center gap-3 select-none justify-center px-2 sm:px-4 mt-4 w-full">
            <button 
              onClick={() => setShowEditProfileModal(true)}
              className="flex-1 py-2.5 rounded-full font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 shadow-md shadow-indigo-600/15"
            >
              Edit Profile
            </button>
            
            <button 
              onClick={() => {
                const shareUrl = `${window.location.origin}${window.location.pathname}?profileId=${profile._id}`;
                setShareData({
                  url: shareUrl,
                  title: `${profile.name}'s Profile on Zenivio`,
                  text: `Check out ${profile.name}'s profile on Zenivio`
                });
                setShareModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200/40 dark:border-slate-850"
            >
              Share
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 select-none justify-center px-4 mt-4 w-full">
            <button 
              disabled={actionLoading}
              onClick={handleFollowToggle}
              className={`flex-1 py-2.5 rounded-full font-black text-sm transition-all active:scale-95 shadow-md ${
                profile.isFollowing 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-250 dark:hover:bg-slate-750' 
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-rose-500/25'
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : profile.isFollowing ? (
                'Following'
              ) : (
                'Follow'
              )}
            </button>
            
            <button 
              onClick={handleMessageClick}
              className="flex-1 py-2.5 rounded-full font-black text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-xs border border-slate-200/40 dark:border-slate-850"
            >
              Message
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowActionsMenu(!showActionsMenu)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 border border-slate-200/40 dark:border-slate-800"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showActionsMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowActionsMenu(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-fade-in text-left">
                    <button
                      onClick={handleBlockUser}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                    >
                      <span>{profile.isBlocked ? 'Unblock User' : 'Block User'}</span>
                    </button>
                    <button
                      onClick={() => { setShowReportModal(true); setShowActionsMenu(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <span>Report User</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instagram-Style Story Highlights */}
      {(profile.highlights?.length > 0 || isOwn) && (
        <div className="w-full max-w-xl mx-auto px-2 sm:px-4 mt-5 select-none">
          <div className="flex items-center gap-4 overflow-x-auto py-2 no-scrollbar">
            {/* + New Highlight button */}
            {isOwn && (
              <div className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer" onClick={() => setShowHighlightModal(true)}>
                <div className="w-16 h-16 rounded-full border border-dashed border-slate-350 dark:border-slate-700 flex items-center justify-center bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors">
                  <Plus className="w-6 h-6 text-slate-450 dark:text-slate-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">New</span>
              </div>
            )}

            {/* Render highlights */}
            {profile.highlights?.map((hl, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group relative"
                onClick={() => handlePlayHighlight(hl)}
              >
                <div className="p-[2px] bg-slate-200 dark:bg-slate-800 rounded-full group-hover:scale-105 transition-transform duration-200">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-slate-950 bg-slate-100 flex items-center justify-center">
                    {(() => {
                      if (hl.cover) {
                        return (
                          <img
                            src={hl.cover.startsWith('http') || hl.cover.startsWith('/api') || hl.cover.startsWith('data:')
                              ? hl.cover
                              : `${API_BASE}/api/image?file=${encodeURIComponent(hl.cover)}`}
                            alt={hl.title}
                            className="w-full h-full object-cover"
                          />
                        );
                      }
                      
                      // Fallback to first post with media (image or video)
                      if (hl.posts && hl.posts.length > 0) {
                        const mediaPost = hl.posts.find(p => p && (p.image || p.video));
                        if (mediaPost) {
                          if (mediaPost.image) {
                            return (
                              <img
                                src={mediaPost.image.startsWith('http') || mediaPost.image.startsWith('/api') || mediaPost.image.startsWith('data:')
                                  ? mediaPost.image
                                  : `${API_BASE}/api/image?file=${encodeURIComponent(mediaPost.image)}`}
                                alt={hl.title}
                                className="w-full h-full object-cover"
                              />
                            );
                          } else if (mediaPost.video) {
                            return (
                              <video
                                src={mediaPost.video.startsWith('http') || mediaPost.video.startsWith('/api') || mediaPost.video.startsWith('data:')
                                  ? mediaPost.video
                                  : `${API_BASE}/api/image?file=${encodeURIComponent(mediaPost.video)}`}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                            );
                          }
                        }
                        
                        // Fallback to first post text content snippet if no media
                        const textPost = hl.posts.find(p => p && p.content);
                        if (textPost) {
                          return (
                            <div className="w-full h-full bg-gradient-to-tr from-rose-400 to-indigo-500 flex items-center justify-center p-1.5 text-[8px] leading-tight text-white font-bold text-center overflow-hidden break-words select-none">
                              {textPost.content.substring(0, 15)}
                            </div>
                          );
                        }
                      }
                      
                      // Final fallback
                      return (
                        <div className="w-full h-full bg-gradient-to-tr from-rose-400 to-indigo-500 flex items-center justify-center text-white font-black text-base uppercase">
                          {hl.title?.charAt(0) || 'H'}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 max-w-[70px] truncate text-center">
                  {hl.title}
                </span>

                {/* Delete button (Owner only) */}
                {isOwn && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHighlight(index);
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-xs z-10 animate-fade-in"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4-Icon Tabs Bar */}
      <div className="w-full max-w-xl mx-auto">
        <div className="border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-around py-3 select-none mt-5">
          <button 
            onClick={() => setActiveSubTab('grid')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'grid' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Grid className="w-5 h-5" />
            {activeSubTab === 'grid' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('reels')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'reels' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            {activeSubTab === 'reels' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('shop')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'shop' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            {activeSubTab === 'shop' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveSubTab('saved')}
            className={`flex-1 flex justify-center py-1.5 relative transition-colors ${
              activeSubTab === 'saved' ? 'text-[#7C3AED] dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            {activeSubTab === 'saved' && (
              <span className="absolute bottom-[-12px] left-1/4 right-1/4 h-0.75 bg-[#7C3AED] dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="pt-2 px-1">
          {activeSubTab === 'grid' ? (
            posts.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {posts.map(post => {
                  const displayImage = post.image || (post.sharedPostId && typeof post.sharedPostId === 'object' ? post.sharedPostId.image : null);
                  const displayText = post.content || (post.sharedPostId && typeof post.sharedPostId === 'object' ? post.sharedPostId.content : '') || (post.sharedPostId ? 'Shared Post' : '');
                  const isShared = Boolean(post.sharedPostId);

                  return (
                    <div
                      key={post._id}
                      onClick={() => handleOpenPostDetail(post)}
                      className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/20 shadow-xs cursor-pointer group hover:opacity-95 active:scale-98 transition-all"
                    >
                      {displayImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={getImageUrl(displayImage)}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          {isShared && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs flex items-center gap-1 text-white text-[9px] font-black shadow-sm z-10">
                              <Repeat className="w-2.5 h-2.5 text-purple-300" />
                              <span>Shared</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full p-2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-955 flex flex-col justify-between text-left">
                          {isShared && (
                            <div className="flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400">
                              <Repeat className="w-3 h-3" />
                              <span>Shared Post</span>
                            </div>
                          )}
                          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-4 leading-normal select-none">
                            {displayText}
                          </p>
                          <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                            <span>{isShared ? 'Shared' : 'Post'}</span>
                            <span>{formatRelativeTime(post.createdAt)}</span>
                          </div>
                        </div>
                      )}

                      {/* Likes/Comments Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-black z-10 select-none">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-white text-white" />
                          {formatCount(post.likesCount || (post.likes ? post.likes.length : 0))}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 fill-white text-white" />
                          {formatCount(post.commentsCount || (post.comments ? post.comments.length : 0))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl text-slate-450 font-bold text-xs select-none">
                No posts published yet.
              </div>
            )
          ) : activeSubTab === 'reels' ? (
            videos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {videos.map(video => (
                  <div 
                    key={video._id}
                    onClick={() => {
                      if (setSelectedReelId && setActiveTab) {
                        setSelectedReelId(video._id);
                        setActiveTab('Video');
                      }
                    }}
                    className="relative aspect-[9/16] rounded-xl overflow-hidden bg-slate-900 border border-slate-200/20 shadow-sm cursor-pointer group active:scale-98 transition-transform select-none"
                  >
                    <video 
                      src={video.video.startsWith('http') || video.video.startsWith('/api') || video.video.startsWith('data:') ? video.video : `${API_BASE}/api/image?file=${encodeURIComponent(video.video)}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                    
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-extrabold text-white">
                      <Play className="w-2.5 h-2.5 fill-white text-white" />
                      <span>{formatCount(video.views)}</span>
                    </div>

                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-md backdrop-blur-xs text-[9px] font-extrabold text-white">
                      <Heart className="w-2.5 h-2.5 fill-red-500 stroke-red-500" />
                      <span>{formatCount(video.likesCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl text-slate-450 font-bold text-xs select-none">
                No videos uploaded yet.
              </div>
            )
          ) : activeSubTab === 'shop' ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-3xl select-none flex flex-col items-center gap-3">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full text-indigo-500">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">Shop is Empty</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                This creator hasn't added any products or digital goods for sale yet.
              </p>
            </div>
          ) : (
            isOwn ? (
              savedPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {savedPosts.map(post => {
                    const displayImage = post.image || (post.sharedPostId && typeof post.sharedPostId === 'object' ? post.sharedPostId.image : null);
                    const displayText = post.content || (post.sharedPostId && typeof post.sharedPostId === 'object' ? post.sharedPostId.content : '') || (post.sharedPostId ? 'Shared Post' : '');
                    const isShared = Boolean(post.sharedPostId);

                    return (
                      <div
                        key={post._id}
                        onClick={() => handleOpenPostDetail(post)}
                        className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/20 shadow-xs cursor-pointer group hover:opacity-95 active:scale-98 transition-all"
                      >
                        {displayImage ? (
                          <div className="relative w-full h-full">
                            <img
                              src={getImageUrl(displayImage)}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            {isShared && (
                              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs flex items-center gap-1 text-white text-[9px] font-black shadow-sm z-10">
                                <Repeat className="w-2.5 h-2.5 text-purple-300" />
                                <span>Shared</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full p-2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-955 flex flex-col justify-between text-left">
                            {isShared && (
                              <div className="flex items-center gap-1 text-[9px] font-black text-purple-600 dark:text-purple-400">
                                <Repeat className="w-3 h-3" />
                                <span>Shared Post</span>
                              </div>
                            )}
                            <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 dark:text-slate-200 line-clamp-4 leading-normal select-none">
                              {displayText}
                            </p>
                            <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1">
                              <span>{isShared ? 'Shared' : 'Post'}</span>
                              <span>{formatRelativeTime(post.createdAt)}</span>
                            </div>
                          </div>
                        )}

                        {/* Likes/Comments Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-black z-10 select-none">
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white text-white" />
                            {formatCount(post.likesCount || (post.likes ? post.likes.length : 0))}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4 fill-white text-white" />
                            {formatCount(post.commentsCount || (post.comments ? post.comments.length : 0))}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-3xl select-none flex flex-col items-center gap-3">
                  <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-full text-pink-500">
                    <Bookmark className="w-8 h-8" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">No Saved Posts</h4>
                  <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                    You haven't saved any posts yet.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-16 px-4 bg-white dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800 rounded-3xl select-none flex flex-col items-center gap-3">
                <div className="p-4 bg-pink-50 dark:bg-pink-950/30 rounded-full text-pink-500">
                  <Bookmark className="w-8 h-8" />
                </div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white mt-1">No Saved Posts</h4>
                <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
                  Posts and videos saved by this user are private. Only the profile owner can view their saved items.
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Story Highlights Creation Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white">Create Story Highlight</h3>
              <button 
                onClick={handleCloseHighlightModal} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar text-left">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Highlight Title</label>
                <input
                  type="text"
                  placeholder="e.g. Travel Vibes ✈️"
                  value={hlTitle}
                  onChange={(e) => setHlTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Cover Image */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Cover Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                    {hlCover ? (
                      <img src={hlCover} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => highlightCoverInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all"
                  >
                    Choose Photo
                  </button>
                  <input
                    type="file"
                    ref={highlightCoverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleHighlightCoverChange}
                  />
                </div>
              </div>

              {/* Post List */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Select Posts to Include</label>
                {allSelectablePosts.length > 0 ? (
                  <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                    {allSelectablePosts.map((post) => {
                      const isSelected = hlSelectedPosts.includes(post._id);
                      return (
                        <div 
                          key={post._id}
                          onClick={() => handleTogglePostSelect(post._id)}
                          className={`flex items-center gap-3 p-2 border rounded-2xl cursor-pointer transition-all ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20' 
                              : 'border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            isSelected 
                              ? 'bg-indigo-500 border-indigo-500 text-white' 
                              : 'border-slate-300 dark:border-slate-700'
                          }`}>
                            {isSelected && <span className="text-[10px] font-black">✓</span>}
                          </div>

                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950 shrink-0 flex items-center justify-center text-[8px] border border-slate-100 dark:border-slate-800">
                            {post.video ? (
                              <video 
                                src={getImageUrl(post.video)}
                                className="w-full h-full object-cover" 
                                muted 
                              />
                            ) : post.image ? (
                              <img 
                                src={getImageUrl(post.image)} 
                                alt="" 
                                className="w-full h-full object-cover" 
                              />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-slate-750 dark:text-slate-300 truncate">
                              {post.content}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase">
                              {post.video ? 'Video Reel' : 'Community Post'} • {formatRelativeTime(post.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-bold">
                    You haven't uploaded any posts or videos yet.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={handleCloseHighlightModal}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateHighlightSubmit}
                disabled={!hlTitle.trim() || hlSelectedPosts.length === 0}
                className="flex-1 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                Save Highlight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Story Highlights Viewer */}
      {activeHighlight && activeHighlight.posts && activeHighlight.posts.length > 0 && (
        <div className="fixed inset-0 z-[150] bg-black flex flex-col justify-between select-none">
          {/* Progress indicators */}
          <div className="absolute top-4 left-0 right-0 z-[160] px-3 flex gap-1.5">
            {activeHighlight.posts.map((_, idx) => {
              let width = '0%';
              if (idx < hlActiveIndex) width = '100%';
              else if (idx === hlActiveIndex) width = `${storyProgress}%`;

              return (
                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-[50ms] ease-linear" 
                    style={{ width }} 
                  />
                </div>
              );
            })}
          </div>

          {/* User Info Header */}
          <div className="absolute top-8 left-0 right-0 z-[160] px-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-slate-800">
                {profile.profilePic ? (
                  <img 
                    src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                      ? profile.profilePic 
                      : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                    alt={profile.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="text-left">
                <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                  {profile.name}
                  {isUserVerified(profile) && (
                    <VerifiedBadge type={getUserBadgeType(profile)} iconClassName="w-3.5 h-3.5" />
                  )}
                </h4>
                <p className="text-[9px] text-white/60 font-semibold">{activeHighlight.title}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setActiveHighlight(null);
                setHlActiveIndex(0);
              }}
              className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tap Overlays */}
          <div className="absolute inset-0 z-[155] flex">
            <div className="w-[30%] h-full cursor-w-resize" onClick={handlePrevStory} />
            <div className="w-[70%] h-full cursor-e-resize" onClick={handleNextStory} />
          </div>

          {/* Core Media Slide */}
          <div className="w-full h-full flex items-center justify-center bg-black">
            {activeHighlight.posts[hlActiveIndex]?.video ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <video 
                  src={activeHighlight.posts[hlActiveIndex].video.startsWith('http') || activeHighlight.posts[hlActiveIndex].video.startsWith('/api') || activeHighlight.posts[hlActiveIndex].video.startsWith('data:') 
                    ? activeHighlight.posts[hlActiveIndex].video 
                    : `${API_BASE}/api/image?file=${encodeURIComponent(activeHighlight.posts[hlActiveIndex].video)}`}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  muted={storyMuted}
                  loop
                />
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStoryMuted(!storyMuted);
                  }}
                  className="absolute bottom-20 right-4 p-2 bg-black/50 hover:bg-black/75 backdrop-blur-md rounded-full text-white z-[158] border border-white/10"
                >
                  {storyMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            ) : activeHighlight.posts[hlActiveIndex]?.image ? (
              <img 
                src={activeHighlight.posts[hlActiveIndex].image.startsWith('http') || activeHighlight.posts[hlActiveIndex].image.startsWith('/api') || activeHighlight.posts[hlActiveIndex].image.startsWith('data:') 
                  ? activeHighlight.posts[hlActiveIndex].image 
                  : `${API_BASE}/api/image?file=${encodeURIComponent(activeHighlight.posts[hlActiveIndex].image)}`} 
                alt="" 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center px-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-955 text-center select-text">
                <p className="text-lg sm:text-xl font-bold text-white leading-relaxed max-w-sm whitespace-pre-wrap">
                  {activeHighlight.posts[hlActiveIndex]?.content || 'Story Details'}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Captions Overlay */}
          {activeHighlight.posts[hlActiveIndex] && (activeHighlight.posts[hlActiveIndex].image || activeHighlight.posts[hlActiveIndex].video) && activeHighlight.posts[hlActiveIndex].content && (
            <div className="absolute bottom-12 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 text-center text-white z-[157] pointer-events-none select-text">
              <p className="text-xs sm:text-sm font-semibold max-w-sm mx-auto line-clamp-3 leading-relaxed">
                {activeHighlight.posts[hlActiveIndex].content}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedDetailPost && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in" onClick={() => { setSelectedDetailPost(null); setPostActionMenuOpen(false); }}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 shadow-2xl flex flex-col max-h-[88vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(() => {
              const isPostAuthor = Boolean(
                isOwnProfile || 
                (currentUser?._id && (
                  (selectedDetailPost.authorId && (selectedDetailPost.authorId === currentUser._id || selectedDetailPost.authorId._id === currentUser._id)) ||
                  (selectedDetailPost.user && (selectedDetailPost.user === currentUser._id || selectedDetailPost.user._id === currentUser._id)) ||
                  (profile?._id && profile._id.toString() === currentUser._id.toString())
                ))
              );

              return (
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 shrink-0">
                      {profile.profilePic ? (
                        <img 
                          src={profile.profilePic.startsWith('http') || profile.profilePic.startsWith('/api') || profile.profilePic.startsWith('data:') 
                            ? profile.profilePic 
                            : `${API_BASE}/api/image?file=${encodeURIComponent(profile.profilePic)}`} 
                          alt={profile.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black uppercase">
                          {profile.name ? profile.name.charAt(0) : 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-850 dark:text-white flex items-center gap-1">
                        {profile.name}
                        {isUserVerified(profile) && (
                          <VerifiedBadge type={getUserBadgeType(profile)} iconClassName="w-3.5 h-3.5" />
                        )}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        {formatRelativeTime(selectedDetailPost.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 relative">
                    {/* 3 Dots Menu for Own Post */}
                    {isPostAuthor && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setPostActionMenuOpen(!postActionMenuOpen)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                          title="Post options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {postActionMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                            <button
                              type="button"
                              onClick={() => {
                                setPostActionMenuOpen(false);
                                setEditingPostContent(selectedDetailPost.content || '');
                                setShowEditPostModal(true);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-purple-600" />
                              <span>Edit Post</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPostActionMenuOpen(false);
                                setShowDeletePostConfirm(true);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete Post</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Save/Bookmark Button */}
                    <button
                      type="button"
                      onClick={() => handleSaveToggleDetail(selectedDetailPost)}
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                      title="Save post"
                    >
                      <Bookmark className={`w-5 h-5 ${selectedDetailPost.isSaved ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedDetailPost(null);
                        setPostActionMenuOpen(false);
                      }} 
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar">
              {selectedDetailPost.content && 
                selectedDetailPost.content.trim() !== 'updated their profile picture.' &&
                selectedDetailPost.content.trim() !== 'updated their cover photo.' && (
                <p className="text-slate-800 dark:text-slate-200 text-xs font-semibold leading-relaxed whitespace-pre-wrap text-left select-text">
                  {selectedDetailPost.content}
                </p>
              )}

              {((selectedDetailPost.images && selectedDetailPost.images.length > 0) || selectedDetailPost.image) && (
                <PostMediaCarousel 
                  images={selectedDetailPost.images}
                  singleImage={selectedDetailPost.image}
                  postType={
                    (selectedDetailPost.postType === 'profile_picture' || selectedDetailPost.content?.toLowerCase().includes('updated their profile picture'))
                      ? 'profile_picture'
                      : (selectedDetailPost.postType === 'cover_photo' || selectedDetailPost.content?.toLowerCase().includes('updated their cover photo'))
                      ? 'cover_photo'
                      : 'standard'
                  }
                  onImageClick={setPreviewImageUrl}
                />
              )}

              {/* Embedded Shared Post in Detail Modal */}
              {selectedDetailPost.sharedPostId && typeof selectedDetailPost.sharedPostId === 'object' && (() => {
                const sp = selectedDetailPost.sharedPostId;
                const spAuthor = sp.authorId || sp.authorDetails;
                const spAuthorName = spAuthor?.name || sp.authorName || 'User';
                const spIsVerified = spAuthor?.verificationBadge === 'blue' || spAuthor?.verificationBadge === 'purple' || spAuthor?.verificationBadge === 'golden' || sp.isVerified;
                const spBadgeType = spAuthor?.verificationBadge === 'golden' ? 'golden' : 'purple';
                const spTimeAgo = formatRelativeTime(sp.createdAt);
                const spImage = sp.image ? getImageUrl(sp.image) : null;

                return (
                  <div className="mt-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 overflow-hidden text-left">
                    <div className="p-3 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700">
                        {spAuthorPic ? (
                          <img src={getImageUrl(spAuthorPic)} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                            {spAuthorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-xs text-slate-850 dark:text-slate-100 truncate">{spAuthorName}</span>
                          {spIsVerified && <VerifiedBadge type={spBadgeType} iconClassName="w-3.5 h-3.5 inline-block shrink-0" />}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block">{spTimeAgo}</span>
                      </div>
                    </div>
                    {sp.content && (
                      <p className="px-3 pb-2.5 text-xs text-slate-750 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                        {sp.content}
                      </p>
                    )}
                    {spImage && (
                      <div 
                        onClick={() => setPreviewImageUrl(spImage)}
                        className="w-full max-h-[400px] overflow-hidden bg-slate-900 cursor-pointer"
                      >
                        <img src={spImage} alt="" className="w-full h-auto object-cover max-h-[400px]" />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer with interactive Like, Who Liked, Comments and Share - strictly 1 single row on mobile */}
            <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-850 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-black shrink-0">
                {/* Heart / Love Interactive Toggle */}
                <button
                  type="button"
                  onClick={() => handleLikeToggleDetail(selectedDetailPost._id)}
                  className="flex items-center gap-1 py-1 px-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all active:scale-90 cursor-pointer shrink-0 whitespace-nowrap"
                  title="Like post"
                >
                  <Heart className={`w-4 h-4 transition-all ${selectedDetailPost.isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-slate-500 hover:text-red-500'}`} />
                  <span className={selectedDetailPost.isLiked ? 'text-red-500' : 'text-slate-600 dark:text-slate-350'}>
                    {selectedDetailPost.isLiked ? 'Liked' : 'Like'}
                  </span>
                </button>

                {/* Who Liked Button (Opens Reactions Modal) */}
                <button
                  type="button"
                  onClick={() => setShowReactionsPostId(selectedDetailPost._id)}
                  className="flex items-center gap-1 py-1 px-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer border border-slate-200/60 dark:border-slate-800 shrink-0 whitespace-nowrap"
                  title="View who liked this post"
                >
                  <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>{selectedDetailPost.likesCount || (selectedDetailPost.likes ? selectedDetailPost.likes.length : 0)} Likes</span>
                </button>

                {/* Comments Button (Opens Comments Drawer) */}
                <button
                  type="button"
                  onClick={() => setActiveCommentPost(selectedDetailPost)}
                  className="flex items-center gap-1 py-1 px-2 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-600 dark:text-slate-350 hover:text-[#7C3AED] transition-all active:scale-95 cursor-pointer border border-slate-200/60 dark:border-slate-800 shrink-0 whitespace-nowrap"
                  title="View and write comments"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>{selectedDetailPost.commentsCount || (selectedDetailPost.comments ? selectedDetailPost.comments.length : 0)} Comments</span>
                </button>
              </div>

              {/* Share Button (Opens ShareModal) */}
              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}?post=${selectedDetailPost._id}`;
                  setShareData({
                    url: shareUrl,
                    title: 'Zenivio Post',
                    text: selectedDetailPost.content ? (selectedDetailPost.content.length > 80 ? selectedDetailPost.content.substring(0, 80) + '...' : selectedDetailPost.content) : 'Check out this post on Zenivio',
                    post: selectedDetailPost
                  });
                  setShareModalOpen(true);
                }}
                className="flex items-center gap-1 py-1 px-2 sm:px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#7C3AED] dark:text-slate-400 dark:hover:text-[#A78BFA] transition-all active:scale-95 cursor-pointer border border-slate-200/60 dark:border-slate-800 shrink-0 whitespace-nowrap"
                title="Share post"
              >
                <Send className="w-3.5 h-3.5 -rotate-12" />
                <span className="text-[11px] sm:text-xs font-black">Share</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {showDeletePostConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setShowDeletePostConfirm(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-100 dark:border-slate-800 shadow-2xl animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white mb-1">Delete this post?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium leading-relaxed">
              This post will be permanently removed from your profile and feed. This action cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={() => setShowDeletePostConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={handleDeleteDetailPost}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeletingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {showEditPostModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" onClick={() => setShowEditPostModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 w-full max-w-md border border-slate-100 dark:border-slate-800 shadow-2xl animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-purple-600" /> Edit Post Caption
              </h3>
              <button
                type="button"
                onClick={() => setShowEditPostModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDetailPost} className="pt-3 space-y-3">
              <textarea
                value={editingPostContent}
                onChange={(e) => setEditingPostContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  disabled={isUpdatingPost}
                  onClick={() => setShowEditPostModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPost}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-600/20"
                >
                  {isUpdatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in" onClick={() => setShowEditProfileModal(false)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 w-full max-w-md border border-slate-200/50 dark:border-slate-800 shadow-2xl flex flex-col max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-base text-slate-850 dark:text-white">Edit Profile Details</h3>
              <button 
                onClick={() => setShowEditProfileModal(false)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scroll Container */}
            <form onSubmit={handleEditProfileSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar text-left">
              {/* Cover and Avatar Previews inside modal */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Photos</label>
                <div className="flex gap-4 items-center">
                  {/* Profile Avatar Trigger */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-250 dark:border-slate-800 bg-slate-100 flex items-center justify-center cursor-pointer group shrink-0"
                  >
                    {profile.profilePic ? (
                      <img src={getImageUrl(profile.profilePic)} alt="" className="w-full h-full object-cover group-hover:opacity-80" />
                    ) : (
                      <User className="w-6 h-6 text-slate-455" />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Cover Banner Trigger */}
                  <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="relative h-16 flex-1 rounded-xl overflow-hidden border border-slate-250 dark:border-slate-800 bg-slate-100 flex items-center justify-center cursor-pointer group"
                  >
                    {profile.coverPic ? (
                      <img src={getImageUrl(profile.coverPic)} alt="" className="w-full h-full object-cover group-hover:opacity-80" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 opacity-90" />
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Bio Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bio</label>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white resize-none"
                />
              </div>

              {/* Website Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Website URL</label>
                <input
                  type="text"
                  placeholder="e.g. www.example.com"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Location Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka, Bangladesh"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Date of Birth Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Privacy:</span>
                    <select
                      value={editDobPrivacy}
                      onChange={(e) => setEditDobPrivacy(e.target.value)}
                      className="bg-transparent text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                    >
                      <option value="public" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-white">Public (Show)</option>
                      <option value="private" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-white">Private (Hide)</option>
                    </select>
                  </div>
                </div>
                <input
                  type="date"
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                />
              </div>

              {/* Gender Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Gender</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Privacy:</span>
                    <select
                      value={editGenderPrivacy}
                      onChange={(e) => setEditGenderPrivacy(e.target.value)}
                      className="bg-transparent text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 outline-none cursor-pointer"
                    >
                      <option value="public" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-white">Public (Show)</option>
                      <option value="private" className="bg-white dark:bg-slate-900 text-slate-850 dark:text-white">Private (Hide)</option>
                    </select>
                  </div>
                </div>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-slate-50 dark:bg-slate-955 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-750 dark:text-slate-350 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hidden File Inputs for Edit Profile Modal triggers */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarUpload}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleCoverUpload}
      />

      {/* Toast Notification */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            zIndex: 9999,
            background: 'rgba(30,30,40,0.92)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '999px',
            fontWeight: '800',
            fontSize: '13px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(8px)',
            whiteSpace: 'nowrap',
            animation: 'fadeInUp 0.25s ease-out forwards',
            transform: 'translateX(-50%)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Report User Dialog Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowReportModal(false)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full relative z-10 shadow-2xl animate-scale-pulse-glow text-left">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Report User</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-4 leading-relaxed">
              Please select the reason you are reporting this user. Reporting will also block them immediately for your safety.
            </p>
            
            <div className="space-y-2 mb-6">
              {[
                { value: 'spam', label: 'Spam, scams or fraud' },
                { value: 'harassment', label: 'Harassment or hate speech' },
                { value: 'violence', label: 'Violence or threats' },
                { value: 'sexual', label: 'Sexually explicit content' },
                { value: 'other', label: 'Other terms violations' }
              ].map(opt => (
                <label 
                  key={opt.value} 
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer font-bold text-xs sm:text-sm transition-all ${
                    reportReason === opt.value 
                      ? 'border-indigo-500 bg-indigo-500/5 text-indigo-650 dark:text-indigo-400' 
                      : 'border-slate-100 dark:border-slate-800 text-slate-650 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="reportReason" 
                    value={opt.value} 
                    checked={reportReason === opt.value} 
                    onChange={(e) => setReportReason(e.target.value)}
                    className="sr-only" 
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${reportReason === opt.value ? 'border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {reportReason === opt.value && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReportUser}
                className="flex-1 py-2.5 bg-red-650 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      <ShareModal 
        isOpen={shareModalOpen} 
        onClose={() => setShareModalOpen(false)} 
        shareUrl={shareData.url} 
        title={shareData.title} 
        text={shareData.text} 
        post={shareData.post}
        showToast={showToastNotification} 
      />

      {/* Photo Upload Caption & Confirmation Modal */}
      {pendingUploadModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-white" onClick={() => setPendingUploadModal({ isOpen: false, type: 'avatar', image: '', caption: '' })}>
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-black">
                {pendingUploadModal.type === 'avatar' ? 'Update Profile Picture' : 'Update Cover Photo'}
              </h3>
              <button
                onClick={() => setPendingUploadModal({ isOpen: false, type: 'avatar', image: '', caption: '' })}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image Preview */}
              <div className="flex justify-center">
                {pendingUploadModal.type === 'avatar' ? (
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg bg-slate-100 dark:bg-slate-800">
                    <img src={pendingUploadModal.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-[2.2/1] rounded-2xl overflow-hidden border-2 border-purple-500/30 shadow-lg bg-slate-100 dark:bg-slate-800">
                    <img src={pendingUploadModal.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                  Write a Caption (Optional)
                </label>
                <textarea
                  rows={3}
                  value={pendingUploadModal.caption}
                  onChange={(e) => setPendingUploadModal(prev => ({ ...prev, caption: e.target.value }))}
                  placeholder={pendingUploadModal.type === 'avatar' ? "Say something about your new profile picture..." : "Say something about your new cover photo..."}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none font-medium placeholder-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingUploadModal({ isOpen: false, type: 'avatar', image: '', caption: '' })}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-black text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhotoUpload}
                  className="flex-1 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all"
                >
                  Save & Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {followListModal && (
        <FollowListModal
          targetUserId={profile._id}
          initialTab={followListModal}
          onClose={() => setFollowListModal(null)}
          onUserClick={onUserClick}
          setActiveChatPartner={setActiveChatPartner}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Image Framing & Crop Modal */}
      {cropModalData.isOpen && (
        <ImageCropModal
          imageSrc={cropModalData.imageSrc}
          type={cropModalData.type}
          onCrop={handleCropComplete}
          onCancel={() => setCropModalData({ isOpen: false, imageSrc: '', type: 'avatar' })}
        />
      )}

      {/* Fullscreen Photo Lightbox with Zoom Controls */}
      {previewImageUrl && (
        <ImagePreviewModal
          imageUrl={previewImageUrl}
          onClose={() => setPreviewImageUrl(null)}
        />
      )}

      {/* Level Upgrade Modal using Coins */}
      {showLevelUpgradeModal && (
        <div className="fixed inset-0 z-[10020] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 sm:p-6 max-w-md w-full relative shadow-2xl animate-fade-in-up text-left max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">VIP Level Upgrades</h3>
                  <p className="text-[11px] text-slate-400 font-bold">Upgrade your status using your Coins</p>
                </div>
              </div>
              <button
                onClick={() => setShowLevelUpgradeModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Box */}
            <div className="my-4 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-500 font-black uppercase tracking-wider block">Your Level</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  Level {profile.level || 1} • {profile.levelName || 'Bronze'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Your Coins</span>
                <span className="text-sm font-black text-amber-500 flex items-center gap-1 justify-end">
                  🪙 {(profile.points || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tiers List */}
            <div className="space-y-2.5 mb-5">
              {[
                { lvl: 1, name: 'Bronze Member', cost: 0, icon: '🥉', perk: 'Standard membership perks' },
                { lvl: 2, name: 'Silver VIP', cost: 500, icon: '🥈', perk: 'Silver badge + 10% daily coin boost' },
                { lvl: 3, name: 'Gold VIP', cost: 1500, icon: '🥇', perk: 'Gold badge + 25% coin boost & profile frame' },
                { lvl: 4, name: 'Platinum Elite', cost: 3500, icon: '💎', perk: 'Platinum badge + 50% coin boost & custom glow' },
                { lvl: 5, name: 'Diamond Legend', cost: 7500, icon: '👑', perk: 'Diamond Legend crown + 2x multiplier & priority perks' }
              ].map(tier => {
                const isCurrent = (profile.level || 1) === tier.lvl;
                const isUnlocked = (profile.level || 1) >= tier.lvl;
                const isNext = (profile.level || 1) + 1 === tier.lvl;

                return (
                  <div
                    key={tier.lvl}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'border-[#7C3AED] bg-indigo-500/10'
                        : isUnlocked
                        ? 'border-slate-200 dark:border-slate-800 opacity-60'
                        : isNext
                        ? 'border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-850 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800/60 opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl flex-shrink-0">{tier.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                            {tier.name}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] bg-[#7C3AED] text-white px-1.5 py-0.2 rounded-full font-black uppercase">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{tier.perk}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      {isUnlocked ? (
                        <span className="text-[11px] font-bold text-emerald-500">Unlocked ✓</span>
                      ) : (
                        <span className="text-xs font-black text-amber-500 flex items-center gap-0.5">
                          🪙 {tier.cost.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Upgrade Button */}
            {(profile.level || 1) < 5 ? (
              <button
                onClick={handleUpgradeLevel}
                disabled={levelUpgradeLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-pink-500 hover:from-indigo-700 hover:to-pink-600 text-white text-xs font-black shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {levelUpgradeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Upgrading Level...</span>
                  </>
                ) : (
                  <>
                    <span>👑 Upgrade to Next Level</span>
                  </>
                )}
              </button>
            ) : (
              <div className="text-center py-2 text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                👑 Maximum Diamond Legend Tier Reached!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reactions / Who Liked Modal for Profile Post */}
      {showReactionsPostId && (
        <ProfileReactionsModal
          postId={showReactionsPostId}
          onClose={() => setShowReactionsPostId(null)}
          onUserClick={onUserClick}
        />
      )}

      {/* Interactive Comments Drawer for Profile Post */}
      {activeCommentPost && (
        <ProfileCommentsDrawer
          post={activeCommentPost}
          onClose={() => setActiveCommentPost(null)}
          onCommentSubmit={handleCommentSubmitDetail}
          currentUserId={currentUser?._id}
          onUserClick={onUserClick}
        />
      )}

      {/* Verify in 2 Minutes Modal */}
      {showVerify2MinModal && (
        <VerifyIn2MinutesModal
          isOpen={showVerify2MinModal}
          onClose={() => setShowVerify2MinModal(false)}
          onSuccess={() => {
            setProfile(prev => prev ? ({
              ...prev,
              isAccountVerified: true,
              isPhoneVerified: true,
              isEmailVerified: true,
            }) : prev);
          }}
          initialUser={profile}
          isOwn={isOwn}
        />
      )}
    </div>
  );
};

export default PublicProfilePage;
