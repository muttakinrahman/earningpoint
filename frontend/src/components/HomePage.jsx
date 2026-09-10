import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Loader2, Plus, Image as ImageIcon, X, Globe, MoreVertical, Search, MessageCircle, Users, Smile, Heart, Send, Bookmark, Download, Trash2, AlertTriangle, UserX, Edit } from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import VerifiedBadge, { isUserVerified, getUserBadgeType } from './VerifiedBadge';
import PullToRefresh from './PullToRefresh';
import BannerAd from './BannerAd';
import NewsSlider from './NewsSlider';
import ShareModal from './ShareModal';
import ImagePreviewModal from './ImagePreviewModal';
import { saveImageToPhone } from '../utils/downloadHelper';
import StoryTray from './Story/StoryTray';
import StoryCreatorModal from './Story/StoryCreatorModal';
import StoryViewerModal from './Story/StoryViewerModal';
import PostMediaCarousel from './PostMediaCarousel';

const GRADIENTS_MAP = {
  aurora: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white',
  sunset: 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white',
  neon: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
  purpleHaze: 'bg-gradient-to-br from-purple-700 to-indigo-900 text-white',
  emerald: 'bg-gradient-to-tr from-emerald-400 to-teal-700 text-white',
  obsidian: 'bg-gradient-to-b from-slate-800 to-slate-950 text-white',
  candy: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-white',
  peach: 'bg-gradient-to-r from-orange-400 to-rose-400 text-white',
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

const safeLocalStorageSet = (key, value) => {
  try {
    let finalValue = value;
    if (typeof value === 'string' && value.length > 250000) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const trimmed = parsed.slice(0, 10).map(p => ({
            ...p,
            content: p.content ? p.content.slice(0, 200) : '',
            image: (p.image && (p.image.length > 100000 || p.image.startsWith('data:image'))) ? null : p.image
          }));
          finalValue = JSON.stringify(trimmed);
        }
      } catch (_) {}
    }
    localStorage.setItem(key, finalValue);
  } catch (e) {
    try {
      localStorage.removeItem('cached_feed_posts');
      localStorage.removeItem('cached_news_posts');
    } catch (_) {}
  }
};

const BannerSection = ({ onStartEarning }) => {
  return (
    <div className="bg-gradient-to-r from-[#0d0728] via-[#120a3a] to-[#25106d] text-white rounded-3xl p-5 sm:p-6 shadow-md flex items-center justify-between relative overflow-hidden group select-none">
      {/* Background decorations */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-700" />
      <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 bg-blue-500/10 rounded-full blur-xl" />

      {/* Text Area */}
      <div className="z-10 space-y-3 max-w-[65%]">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
          Earn More with <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">Zenivio</span>
        </h2>
        <p className="text-slate-350 text-xs sm:text-sm font-medium leading-relaxed">
          Complete tasks, invite friends and earn real rewards.
        </p>
        <button 
          onClick={onStartEarning}
          className="px-4.5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md shadow-purple-900/30 w-fit"
        >
          Start Earning
          <svg className="w-3.5 h-3.5 stroke-white" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Visual Graphic (Treasure Chest SVG) */}
      <div className="relative flex-shrink-0 animate-pulse" style={{ animationDuration: '3s' }}>
        <svg viewBox="0 0 160 140" className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="90" r="10" fill="#EAB308" />
          <circle cx="140" cy="50" r="8" fill="#FACC15" />
          <circle cx="110" cy="20" r="12" fill="#FACC15" />
          
          <rect x="30" y="60" width="100" height="60" rx="12" fill="#5B21B6" stroke="#7C3AED" strokeWidth="3" />
          <path d="M30 75h100M80 60v15" stroke="#7C3AED" strokeWidth="3" />
          <circle cx="80" cy="60" r="30" fill="#a78bfa" opacity="0.2" />
          
          <path d="M25 60c0-10 15-25 55-25s55 15 55 25H25z" fill="#4C1D95" stroke="#7C3AED" strokeWidth="3" />
          <polygon points="70,60 90,60 85,72 75,72" fill="#EAB308" />
          <path d="M80 42l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#FACC15" />
        </svg>
      </div>
    </div>
  );
};

// Comments Drawer Slide-up Component (Facebook Style Nested Replies & Mentions)
const CommentsDrawer = ({ post, onClose, onCommentSubmit, currentUserId, onUserClick }) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { commentId, userName, userId }
  const [activeReactionCommentId, setActiveReactionCommentId] = useState(null);
  const [commentReactions, setCommentReactions] = useState({});
  const listRef = React.useRef(null);

  const handleCommentReact = (commentId, reactionType) => {
    setCommentReactions(prev => ({
      ...prev,
      [commentId]: prev[commentId] === reactionType ? null : reactionType
    }));
    setActiveReactionCommentId(null);
  };

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

    // Scroll comments list to the bottom
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      
      {/* Centered Compact Modal Container */}
      <div className="relative z-10 w-full max-w-md max-h-[85vh] sm:max-h-[520px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col animate-fade-in-up border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Drag handle */}
        <div className="w-12 h-1 bg-slate-250 dark:bg-slate-750 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-slate-100 dark:border-slate-850 flex-shrink-0">
          <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">
            Comments ({post.comments?.length || 0})
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
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
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
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
                        className="text-[10px] font-black text-brand-500 hover:underline mr-6"
                      >
                        Reply
                      </button>
                    </div>
                    <p className="text-xs text-slate-650 dark:text-slate-300 mt-1 leading-relaxed pr-6">
                      {comment.text}
                    </p>

                    {/* Reaction & Reply Actions Bar */}
                    <div className="flex items-center gap-4 mt-2 border-t border-slate-100/50 dark:border-slate-800/50 pt-1.5">
                      {/* React Button & Popover */}
                      <div className="relative">
                        <button
                          onClick={() => setActiveReactionCommentId(activeReactionCommentId === comment._id ? null : comment._id)}
                          className="text-[10px] font-black text-slate-500 hover:text-rose-500 flex items-center gap-1 transition-colors"
                        >
                          {commentReactions[comment._id] ? (
                            <span className="text-xs font-bold text-rose-500 flex items-center gap-1">
                              {commentReactions[comment._id] === 'like' && '👍 Like'}
                              {commentReactions[comment._id] === 'love' && '❤️ Love'}
                              {commentReactions[comment._id] === 'haha' && '😆 Haha'}
                              {commentReactions[comment._id] === 'wow' && '😮 Wow'}
                              {commentReactions[comment._id] === 'sad' && '😢 Sad'}
                              {commentReactions[comment._id] === 'angry' && '😡 Angry'}
                            </span>
                          ) : (
                            <span>React</span>
                          )}
                        </button>

                        {/* Comment Multi-Emoji Reaction Picker Popover */}
                        {activeReactionCommentId === comment._id && (
                          <div className="absolute bottom-6 left-0 bg-white dark:bg-slate-800 rounded-full shadow-2xl p-1 flex items-center gap-1 border border-slate-100 dark:border-slate-700 z-50 animate-fade-in-up">
                            {[
                              { type: 'like', emoji: '👍' },
                              { type: 'love', emoji: '❤️' },
                              { type: 'haha', emoji: '😆' },
                              { type: 'wow', emoji: '😮' },
                              { type: 'sad', emoji: '😢' },
                              { type: 'angry', emoji: '😡' }
                            ].map(r => (
                              <button
                                key={r.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCommentReact(comment._id, r.type);
                                }}
                                className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                              >
                                {r.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleReplyClick(comment._id, comment.userName, comment.user)}
                        className="text-[10px] font-black text-brand-500 hover:underline"
                      >
                        Reply
                      </button>
                    </div>
                    
                    {(comment.user === currentUserId || post.authorId === currentUserId) && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm('Delete comment?')) return;
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`${API_BASE}/api/posts/${post._id}/comment/${comment._id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.ok) {
                              window.location.reload();
                            }
                          } catch (err) {
                            console.error('Failed to delete comment:', err);
                          }
                        }}
                        className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Nested Replies */}
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
                              className="text-[10px] font-black text-brand-500 hover:underline"
                            >
                              Reply
                            </button>
                          </div>
                          <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-normal">
                            {reply.replyToUser && (
                              <span className="font-extrabold text-brand-500 mr-1">@{reply.replyToUser}</span>
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

        {/* Replying Banner */}
        {replyingTo && (
          <div className="px-4 py-1.5 bg-brand-50 dark:bg-brand-950/40 border-t border-brand-100 dark:border-brand-900/50 flex items-center justify-between text-xs text-brand-600 dark:text-brand-400 font-bold flex-shrink-0">
            <span>Replying to <span className="underline">@{replyingTo.userName}</span></span>
            <button onClick={() => { setReplyingTo(null); setCommentText(''); }} className="p-0.5 hover:bg-brand-100 dark:hover:bg-brand-900 rounded-full">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-850 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/60 pb-safe flex-shrink-0">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={replyingTo ? `Reply to @${replyingTo.userName}...` : "Add a comment..."}
            className="flex-1 bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="p-2.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-40 transition-opacity active:scale-95 flex items-center justify-center"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

// Reactions List Modal (Who Reacted)
const ReactionsModal = ({ postId, onClose, onUserClick }) => {
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
    fetchReactions();
  }, [postId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800 animate-scale-pulse-glow max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
            <span className="text-rose-500">❤️</span> Reactions ({reactions.length})
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-3 divide-y divide-slate-100 dark:divide-slate-800/40">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
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

const CommunityPostCard = ({ post, onFollowToggle, onLikeToggle, onCommentClick, currentUserId, setSelectedReelId, setActiveTab, onUserClick, onImageClick, showToast, onActionTrigger, onShareClick, onOpenReactionsModal }) => {
  const [actionLoading, setActionLoading] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  const userHasLiked = React.useMemo(() => {
    if (!currentUserId || !post?.likes) return false;
    return (post.likes || []).some(id => {
      const idStr = typeof id === 'object' && id?._id ? id._id.toString() : id.toString();
      return idStr === currentUserId.toString();
    });
  }, [post?.likes, currentUserId]);

  const [isLiked, setIsLiked] = useState(userHasLiked);

  React.useEffect(() => {
    setIsLiked(userHasLiked);
  }, [userHasLiked]);

  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [currentReaction, setCurrentReaction] = useState(post.userReaction || (userHasLiked ? 'love' : null));
  const videoRef = useRef(null);

  const handleReactSelect = async (type) => {
    setShowReactionPicker(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentReaction(data.userReaction);
        setIsLiked(data.isLiked);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    }
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setIsLiked(prev => !prev);
    try {
      if (onLikeToggle) {
        await onLikeToggle(post._id);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
      setIsLiked(userHasLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const likesCount = post.likes?.length || 0;
  const commentsCount = post.comments?.length || 0;
  const shareCount = Math.floor(likesCount * 0.15);

  const isProfilePictureUpdate = Boolean(
    post.postType === 'profile_picture' || 
    (post.content && post.content.toLowerCase().includes('updated their profile picture'))
  );

  const isCoverPhotoUpdate = Boolean(
    post.postType === 'cover_photo' || 
    (post.content && post.content.toLowerCase().includes('updated their cover photo'))
  );

  const handleSaveToggle = async (e) => {
    if (e) e.stopPropagation();
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
        setIsSaved(data.isSaved);
        if (showToast) {
          showToast(data.isSaved ? 'Post saved! 💾' : 'Post unsaved! ❌');
        }
      }
    } catch (err) {
      console.error('Failed to toggle save post:', err);
    }
  };

  useEffect(() => {
    if (!post.video || !videoRef.current) return;
    const el = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.4) {
          if (el && !el.paused) {
            el.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: [0.1, 0.4, 0.8] }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [post.video]);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleFollowClick = async (e) => {
    e.stopPropagation();
    if (actionLoading) return;
    setActionLoading(true);
    await onFollowToggle(post.authorId);
    setActionLoading(false);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await onLikeToggle(post._id);
    setIsLiking(false);
  };

  const parsedFeeling = (() => {
    if (!post.feeling) return null;
    if (typeof post.feeling === 'object') return post.feeling;
    try {
      return JSON.parse(post.feeling);
    } catch (e) {
      return { label: post.feeling, emoji: '' };
    }
  })();

  const parsedTaggedFriends = (() => {
    if (!post.taggedFriends) return [];
    if (Array.isArray(post.taggedFriends)) return post.taggedFriends;
    try {
      return JSON.parse(post.taggedFriends);
    } catch (e) {
      return typeof post.taggedFriends === 'string' ? post.taggedFriends.split(',').map(f => f.trim()) : [];
    }
  })();

  return (
    <article id={`post-${post._id}`} className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2rem] p-3 sm:p-4.5 space-y-3 sm:space-y-3.5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with IG gradient border and follow plus button overlay */}
          <div className="relative select-none">
            <button
              onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
              className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white font-black text-sm relative active:scale-95 transition-transform"
            >
              {post.authorDetails?.profilePic ? (
                <img 
                  src={getImageUrl(post.authorDetails.profilePic)} 
                  alt={post.authorDetails.name || post.authorName} 
                  className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-white dark:border-slate-900 flex items-center justify-center font-black">
                  {post.authorDetails?.name ? post.authorDetails.name.charAt(0).toUpperCase() : (post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U')}
                </div>
              )}
            </button>
            
            {/* Follow overlay plus badge */}
            {!post.isOwnPost && post.authorId && !post.isFollowing && (
              <button 
                onClick={handleFollowClick}
                disabled={actionLoading}
                className="absolute -bottom-1 -right-1 bg-brand-500 text-white rounded-full p-0.5 border border-white dark:border-slate-900 hover:scale-110 active:scale-90 transition-transform shadow-md flex items-center justify-center"
                title="Follow User"
              >
                {actionLoading ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                ) : (
                  <Plus className="w-2.5 h-2.5" strokeWidth={3.5} />
                )}
              </button>
            )}
          </div>

          <div>
            <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <button
                onClick={() => post.authorId && onUserClick && onUserClick(post.authorId)}
                className="hover:underline font-extrabold text-left active:opacity-70 transition-opacity"
              >
                {post.authorDetails?.name || post.authorName || 'User'}
              </button>
              {(isUserVerified(post.authorDetails) || post.isVerified) && (
                <VerifiedBadge type={getUserBadgeType(post.authorDetails)} iconClassName="w-[14px] h-[14px] inline-block flex-shrink-0" />
              )}
              {isProfilePictureUpdate && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  updated their profile picture.
                </span>
              )}
              {isCoverPhotoUpdate && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  updated their cover photo.
                </span>
              )}
              {parsedFeeling && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  is feeling <span className="font-bold text-slate-700 dark:text-slate-250">{parsedFeeling.label} {parsedFeeling.emoji}</span>
                </span>
              )}
              {parsedTaggedFriends.length > 0 && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  with <span className="font-bold text-slate-700 dark:text-slate-250">
                    {parsedTaggedFriends.length === 1 
                      ? parsedTaggedFriends[0] 
                      : parsedTaggedFriends.length === 2 
                        ? `${parsedTaggedFriends[0]} and ${parsedTaggedFriends[1]}`
                        : `${parsedTaggedFriends[0]} and ${parsedTaggedFriends.length - 1} others`}
                  </span>
                </span>
              )}
              {post.location && (
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  at <span className="font-bold text-slate-705 dark:text-slate-200">{post.location}</span>
                </span>
              )}
              {!post.isOwnPost && post.authorId && (
                <>
                  <span className="text-slate-400 font-normal text-xs">•</span>
                  <button 
                    onClick={handleFollowClick}
                    disabled={actionLoading}
                    className={`text-xs font-bold transition-all active:scale-95 ${
                      post.isFollowing 
                        ? 'text-slate-400 dark:text-slate-500' 
                        : 'text-blue-500 hover:text-blue-600'
                    }`}
                  >
                    {actionLoading ? '...' : post.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </>
              )}
            </h3>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-0.5">
              {post.privacy === 'friends' ? (
                <Users className="w-3 h-3 text-slate-450" />
              ) : post.privacy === 'private' ? (
                <Lock className="w-3 h-3 text-slate-450" />
              ) : (
                <Globe className="w-3 h-3 text-slate-450" />
              )}
              <span>{formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-850 rounded-2xl shadow-2xl border border-slate-150 dark:border-slate-700/90 py-2 z-40 animate-fade-in text-left">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    await handleSaveToggle();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-slate-500'}`} />
                  <span>{isSaved ? 'Unsave Post' : 'Save Post'}</span>
                </button>

                {post.image && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      saveImageToPhone(post.image, showToast);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-5 h-5 text-emerald-500" />
                    <span>Download Image</span>
                  </button>
                )}

                {post.authorId === currentUserId || post.isOwnPost ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        if (onActionTrigger) onActionTrigger('edit', post);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="w-5 h-5 text-indigo-500" />
                      <span>Edit Post</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        if (onActionTrigger) onActionTrigger('delete', post);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <span>Delete Post</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        if (onActionTrigger) onActionTrigger('report', post);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <span>Report Post</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        if (onActionTrigger) onActionTrigger('block', post);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserX className="w-5 h-5 text-slate-500" />
                      <span>Block User</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content text (Shown as a description caption) */}
      {post.bgGradient && GRADIENTS_MAP[post.bgGradient] ? (
        <div className={`w-full rounded-2xl p-5 flex items-center justify-center min-h-[160px] text-center text-base md:text-lg font-black shadow-inner my-2 ${GRADIENTS_MAP[post.bgGradient]}`}>
          {post.content}
        </div>
      ) : post.content && (
        (!isProfilePictureUpdate && !isCoverPhotoUpdate) ||
        (isProfilePictureUpdate && post.content.trim() !== 'updated their profile picture.') ||
        (isCoverPhotoUpdate && post.content.trim() !== 'updated their cover photo.')
      ) ? (
        <div className="text-slate-750 dark:text-slate-355 text-xs leading-relaxed whitespace-pre-wrap font-medium pb-1">
          {post.content}
        </div>
      ) : null}

      {/* Media Attachment (Instagram-Style Carousel or Single Photo) */}
      {((post.images && post.images.length > 0) || post.image) ? (
        <PostMediaCarousel 
          images={post.images}
          singleImage={post.image}
          postType={isProfilePictureUpdate ? 'profile_picture' : (isCoverPhotoUpdate ? 'cover_photo' : 'standard')}
          onImageClick={onImageClick}
        />
      ) : null}

      {post.video && (
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 mt-1 flex items-center justify-center w-full max-h-[500px] cursor-pointer group select-none">
          <video 
            ref={videoRef}
            src={`${getImageUrl(post.video)}#t=0.001`} 
            preload="metadata"
            className="w-full h-auto object-contain max-h-[500px]"
            playsInline
            controls={isPlaying}
            onClick={handlePlayPause}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          {!isPlaying && (
            <div 
              onClick={handlePlayPause}
              className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/45 transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 active:scale-95 animate-fade-in border border-white/40">
                <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Facebook-style Embedded Shared Post Card */}
      {post.sharedPostId && typeof post.sharedPostId === 'object' && (() => {
        const sp = post.sharedPostId;
        const spAuthor = sp.authorId || sp.authorDetails;
        const spAuthorName = spAuthor?.name || sp.authorName || 'User';
        const spAuthorPic = spAuthor?.profilePic || spAuthor?.googleAvatar || spAuthor?.facebookAvatar || '';
        const spIsVerified = spAuthor?.verificationBadge === 'blue' || spAuthor?.verificationBadge === 'purple' || spAuthor?.verificationBadge === 'golden' || sp.isVerified;
        const spBadgeType = spAuthor?.verificationBadge === 'golden' ? 'golden' : 'purple';
        const spTimeAgo = formatRelativeTime(sp.createdAt);
        const spImage = sp.image ? getImageUrl(sp.image) : null;

        return (
          <div className="mt-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/50 overflow-hidden hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors">
            {/* Original Author Header */}
            <div className="p-3 sm:p-3.5 flex items-center gap-2.5">
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (spAuthor?._id && onUserClick) onUserClick(spAuthor._id);
                }}
                className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 cursor-pointer"
              >
                {spAuthorPic ? (
                  <img src={getImageUrl(spAuthorPic)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                    {spAuthorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (spAuthor?._id && onUserClick) onUserClick(spAuthor._id);
                    }}
                    className="font-extrabold text-xs sm:text-sm text-slate-850 dark:text-slate-100 hover:underline cursor-pointer truncate"
                  >
                    {spAuthorName}
                  </span>
                  {spIsVerified && <VerifiedBadge type={spBadgeType} iconClassName="w-3.5 h-3.5 inline-block shrink-0" />}
                </div>
                <span className="text-[10px] text-slate-400 font-bold block">{spTimeAgo}</span>
              </div>
            </div>

            {/* Original Post Content */}
            {sp.content && (
              <p className="px-3 sm:px-3.5 pb-2.5 text-xs text-slate-750 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                {sp.content}
              </p>
            )}

            {/* Original Post Image */}
            {spImage && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImageClick) onImageClick(spImage);
                }}
                className="w-full max-h-[420px] overflow-hidden bg-slate-900 cursor-pointer"
              >
                <img src={spImage} alt="Shared content" className="w-full h-auto object-cover max-h-[420px]" loading="lazy" />
              </div>
            )}
          </div>
        );
      })()}

      {/* Action Icons Row */}
      <div className="flex items-center justify-between pt-1 select-none relative">
        <div className="flex items-center gap-4.5">
          {/* Reaction Picker Popover */}
          {/* Single Tap Heart / Love Button */}
          <button 
            onClick={handleLikeToggle}
            onContextMenu={(e) => {
              e.preventDefault();
              setShowReactionPicker(true);
            }}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            {isLiked ? (
              <Heart className="w-5.5 h-5.5 text-rose-500 fill-rose-500" strokeWidth={2} />
            ) : (
              <Heart className="w-5.5 h-5.5 text-slate-700 dark:text-slate-350 group-hover:text-rose-500" strokeWidth={2} />
            )}
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {likesCount}
            </span>
          </button>

          {/* Comment Button */}
          <button 
            onClick={onCommentClick}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            <MessageCircle className="w-5.5 h-5.5 text-slate-700 dark:text-slate-350 group-hover:text-indigo-500" strokeWidth={2} />
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {commentsCount}
            </span>
          </button>

          {/* Share Button */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const shareUrl = `${window.location.origin}?post=${post._id}`;
              if (onShareClick) {
                onShareClick(shareUrl, post.title || 'Zenivio Post', post.content || 'Check out this post', post);
              }
            }}
            className="flex items-center gap-1.5 group active:scale-90 transition-transform"
          >
            <Send className="w-5.5 h-5.5 text-slate-700 dark:text-slate-350 group-hover:text-emerald-500 -rotate-12" strokeWidth={2} />
            <span className="text-xs font-black text-slate-650 dark:text-slate-400 mt-0.5">
              {post.shareCount !== undefined ? post.shareCount : shareCount}
            </span>
          </button>
        </div>

        {/* Bookmark Button */}
        <button 
          onClick={handleSaveToggle}
          className="text-slate-700 dark:text-slate-350 hover:text-yellow-500 active:scale-90 transition-transform p-0.5"
        >
          <Bookmark className={`w-6 h-6 transition-all duration-200 ${isSaved ? 'fill-yellow-500 text-yellow-500 scale-110' : ''}`} strokeWidth={2} />
        </button>
      </div>

      {/* Social Info & Comments Container */}
      <div className="space-y-1.5 pt-0.5">
        {/* Liked By Summary */}
        {likesCount > 0 && (
          <div 
            onClick={() => onOpenReactionsModal && onOpenReactionsModal(post._id)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex -space-x-2">
              {post.recentLikers && post.recentLikers.length > 0 ? (
                post.recentLikers.slice(0, 2).map((liker, lIdx) => (
                  <div key={lIdx} className="w-5 h-5 rounded-full overflow-hidden border border-white dark:border-slate-900 shrink-0 bg-slate-200 dark:bg-slate-800">
                    {liker.profilePic ? (
                      <img src={getImageUrl(liker.profilePic)} alt={liker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[9px] text-slate-600 dark:text-slate-300">
                        {liker.name ? liker.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ❤️
                </div>
              )}
            </div>
            <span className="text-xs text-slate-800 dark:text-slate-200 font-bold leading-none">
              Liked by <span className="font-extrabold">{likesCount} people</span> <span className="text-[10px] text-brand-500 font-extrabold ml-1">(View reactions)</span>
            </span>
          </div>
        )}



        {/* Inline Comments List (Last 2 comments) */}
        {commentsCount > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-100/50 dark:border-slate-800/50 mt-1">
            {post.comments.slice(-2).map((comment, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] leading-tight text-slate-750 dark:text-slate-300">
                <div className="truncate pr-4">
                  <span className="font-black mr-2 text-slate-900 dark:text-white inline-flex items-center gap-1">
                    <span>{comment.userName}</span>
                    {(isUserVerified(comment) || isUserVerified(comment.user)) && (
                      <VerifiedBadge type={getUserBadgeType(comment.user || comment)} iconClassName="w-3 h-3 flex-shrink-0 inline" />
                    )}
                  </span>
                  <span>{comment.text}</span>
                </div>
                <button className="text-slate-400 hover:text-red-500 flex-shrink-0">
                  <Heart className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* View all comments link & relative time */}
        <div className="flex items-center justify-between pt-1 select-none">
          {commentsCount > 0 ? (
            <button 
              onClick={onCommentClick}
              className="text-[11px] font-bold text-[#7C3AED] hover:underline"
            >
              View all {commentsCount} comments
            </button>
          ) : (
            <button 
              onClick={onCommentClick}
              className="text-[11px] font-bold text-slate-400 hover:underline"
            >
              Add a comment...
            </button>
          )}

          <span className="text-[9.5px] font-black text-slate-400">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>
      </div>
    </article>
  );
};

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

const HomePage = ({ setActiveTab, setSelectedNewsId, setActiveChatPartner, setSelectedReelId, highlightedPostId, setHighlightedPostId, setPostToEdit, onUserClick }) => {
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [showReactionsPostId, setShowReactionsPostId] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', title: '', text: '' });
  const [newsPosts, setNewsPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_news_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [feedPosts, setFeedPosts] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_feed_posts');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    // Stale-While-Revalidate: skip initial spinner if we have cached feed content
    const cachedNews = localStorage.getItem('cached_news_posts');
    const cachedFeed = localStorage.getItem('cached_feed_posts');
    return !(cachedNews || cachedFeed);
  });
  const [refreshing, setRefreshing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_global_settings');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_current_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  
  // Post Creation States
  const [postingLoading, setPostingLoading] = useState(false);

  // Story States (Facebook Style)
  const [stories, setStories] = useState(() => {
    try {
      const cached = localStorage.getItem('cached_stories');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [viewingStoryUser, setViewingStoryUser] = useState(null);
  const [viewingStoryIndex, setViewingStoryIndex] = useState(0);

  // Ordered story sequence (Facebook/Instagram style)
  const orderedStoryUsers = useMemo(() => {
    const myStory = (stories || []).find(s => s._id?.toString() === currentUser?._id?.toString());
    const otherStories = (stories || []).filter(s => s._id?.toString() !== currentUser?._id?.toString());
    return [ ...(myStory ? [myStory] : []), ...otherStories ];
  }, [stories, currentUser?._id]);

  const handleNextStoryUser = () => {
    const currentIndex = orderedStoryUsers.findIndex(u => u._id?.toString() === viewingStoryUser?._id?.toString());
    if (currentIndex !== -1 && currentIndex + 1 < orderedStoryUsers.length) {
      setViewingStoryUser(orderedStoryUsers[currentIndex + 1]);
      setViewingStoryIndex(0);
    } else {
      setViewingStoryUser(null);
    }
  };

  const handlePrevStoryUser = () => {
    const currentIndex = orderedStoryUsers.findIndex(u => u._id?.toString() === viewingStoryUser?._id?.toString());
    if (currentIndex > 0) {
      const prevUser = orderedStoryUsers[currentIndex - 1];
      setViewingStoryUser(prevUser);
      setViewingStoryIndex((prevUser.stories?.length || 1) - 1);
    }
  };

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const [activeActionModal, setActiveActionModal] = useState(null); // null or { type: 'delete' | 'report' | 'block', post }
  const [reportReason, setReportReason] = useState('spam');

  // User Search Discovery States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState(() => {
    try {
      const c = localStorage.getItem('cached_suggested_users');
      return c ? JSON.parse(c) : [];
    } catch (e) {
      return [];
    }
  });
  const communityFeedRef = useRef(null);

  const handleSeeAllCommunityPosts = () => {
    if (communityFeedRef.current) {
      communityFeedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    handleRefresh();
  };

  // Silent Infinite Scroll Pagination States (30 posts batch, hidden page numbers)
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const bottomSentinelRef = useRef(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeActionModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeActionModal]);

  const handleActionTrigger = (type, post) => {
    if (type === 'edit') {
      if (setPostToEdit) {
        setPostToEdit(post);
      }
      setActiveTab('CreatePost');
      return;
    }
    setActiveActionModal({ type, post });
  };

  const handleDeleteConfirm = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToastNotification('Post deleted successfully! 🗑️');
        handlePostDelete(post._id);
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const handleReportSubmit = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${post._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        showToastNotification('🚨 Post reported! Hidden from feed.');
        handlePostDelete(post._id);
        setActiveActionModal(null);
      } else {
        const errData = await res.json();
        showToastNotification(errData.message || 'Error reporting post');
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to report post:', err);
    }
  };

  const handleBlockConfirm = async () => {
    if (!activeActionModal?.post) return;
    const { post } = activeActionModal;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${post.authorId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToastNotification('🚫 User blocked successfully!');
        handleBlockAuthor(post.authorId);
        setActiveActionModal(null);
      }
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const showToastNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2500);
  };

  const handleUserSearchChange = async (query) => {
    setUserSearchQuery(query);
    if (!query.trim()) {
      setUserSearchResults([]);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(query.trim())}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserSearchResults(data);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSearchUserFollowToggle = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update search results list
        setUserSearchResults(prev => prev.map(u => {
          if (u._id === userId) {
            return { ...u, isFollowing: data.isFollowing };
          }
          return u;
        }));
        // Update main community feed list if user posts are on screen
        setFeedPosts(prev => prev.map(post => {
          if (post.authorId === userId) {
            return { ...post, isFollowing: data.isFollowing };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error('Failed to toggle follow from search results:', err);
    }
  };

  const handleSearchUserMessageClick = (user) => {
    if (setActiveChatPartner) {
      setActiveChatPartner(user);
    }
    if (setActiveTab) {
      setActiveTab('Messenger');
    }
  };

  useEffect(() => {
    const handleReclick = (e) => {
      if (e.detail && e.detail.tab === 'Home') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        handleRefresh();
      }
    };
    window.addEventListener('tabReclickRefresh', handleReclick);
    return () => window.removeEventListener('tabReclickRefresh', handleReclick);
  }, []);

  useEffect(() => {
    const handlePostShared = (e) => {
      const sharedPost = e.detail?.post || e.detail;
      if (sharedPost && sharedPost._id) {
        setFeedPosts(prev => [sharedPost, ...prev]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('post_shared', handlePostShared);
    return () => window.removeEventListener('post_shared', handlePostShared);
  }, []);

  const fetchMorePosts = async () => {
    if (fetchingMore || !hasMorePosts) return;
    setFetchingMore(true);
    const nextPage = page + 1;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/feed?page=${nextPage}&limit=15`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newPosts = Array.isArray(data) ? data : (data.feedPosts || []);
        if (newPosts.length > 0) {
          setFeedPosts(prev => {
            const existingIds = new Set(prev.map(p => p._id ? p._id.toString() : ''));
            const uniqueNew = newPosts.filter(p => !existingIds.has(p._id ? p._id.toString() : ''));
            return [...prev, ...uniqueNew];
          });
          setPage(nextPage);
          if (newPosts.length < 15) {
            setHasMorePosts(false);
          }
        } else {
          setHasMorePosts(false);
        }
      }
    } catch (err) {
      console.error('Failed to fetch more posts:', err);
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    if (!hasMorePosts || fetchingMore || !bottomSentinelRef.current) return;
    const sentinel = bottomSentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchMorePosts();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.unobserve(sentinel);
  }, [page, hasMorePosts, fetchingMore]);

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetchWithTimeout(`${API_BASE}/api/messages/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      }, 5000);
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStories(data);
          safeLocalStorageSet('cached_stories', JSON.stringify(data));
        }
      }
    } catch (e) {
      console.error('Failed to fetch stories:', e);
    }
  };

  const fetchHomeData = async () => {
    setPage(1);
    setHasMorePosts(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1-roundtrip unified feed & news fetch + profile fetch + suggested users + stories in parallel
      const [feedRes, profileRes, suggestionsRes, storiesRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE}/api/posts/feed?includeNews=true&page=1&limit=15`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Feed fetch failed:', err); return null; }),
        fetchWithTimeout(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Profile fetch failed:', err); return null; }),
        fetchWithTimeout(`${API_BASE}/api/profile/suggestions`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Suggestions fetch failed:', err); return null; }),
        fetchWithTimeout(`${API_BASE}/api/messages/stories`, {
          headers: { Authorization: `Bearer ${token}` }
        }, 5000).catch(err => { console.error('Stories fetch failed:', err); return null; })
      ]);

      if (feedRes && feedRes.ok) {
        const data = await feedRes.json();
        const feedList = Array.isArray(data) ? data : (data.feedPosts || []);
        const newsList = Array.isArray(data) ? [] : (data.newsPosts || []);

        if (feedList.length > 0) {
          setFeedPosts(feedList);
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(feedList));
        }

        if (newsList.length > 0) {
          const updates = newsList.filter(p => !p.authorId);
          setNewsPosts(updates);
          safeLocalStorageSet('cached_news_posts', JSON.stringify(updates));
          safeLocalStorageSet('cached_admin_updates', JSON.stringify(updates));
        }
      }

      if (profileRes && profileRes.ok) {
        const userData = await profileRes.json();
        setCurrentUser(userData);
        safeLocalStorageSet('cached_current_user', JSON.stringify(userData));
      }

      if (suggestionsRes && suggestionsRes.ok) {
        const suggData = await suggestionsRes.json();
        if (Array.isArray(suggData)) {
          setSuggestedUsers(suggData);
          safeLocalStorageSet('cached_suggested_users', JSON.stringify(suggData));
        }
      }

      if (storiesRes && storiesRes.ok) {
        const storiesData = await storiesRes.json();
        if (Array.isArray(storiesData)) {
          setStories(storiesData);
          safeLocalStorageSet('cached_stories', JSON.stringify(storiesData));
        }
      }
    } catch (err) {
      console.error('Failed to fetch home page feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/api/earning/settings`, {}, 5000);
      if (response.ok) {
        const data = await response.json();
        setGlobalSettings(data);
        safeLocalStorageSet('cached_global_settings', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (highlightedPostId) {
      let rawId = typeof highlightedPostId === 'object' ? (highlightedPostId.postId?._id || highlightedPostId.postId) : highlightedPostId;
      if (typeof rawId === 'object' && rawId?._id) {
        rawId = rawId._id;
      }
      const targetPostId = rawId ? rawId.toString() : '';
      const shouldOpenComment = typeof highlightedPostId === 'object' ? !!highlightedPostId.openComment : false;

      if (!targetPostId) return;

      const fetchHighlightedPost = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/posts/${targetPostId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const postData = await res.json();

            // Ensure post exists in feedPosts list so it renders on screen
            setFeedPosts(prev => {
              const exists = prev.some(p => p._id && p._id.toString() === postData._id.toString());
              if (!exists) {
                return [postData, ...prev];
              }
              return prev;
            });

            // ONLY open comment drawer if it was a comment notification!
            if (shouldOpenComment) {
              setActiveCommentPost(postData);
            } else {
              setActiveCommentPost(null); // Ensure comments drawer is closed for Like / Post notifications!
            }

            // Smooth scroll the post card into view on Home feed!
            setTimeout(() => {
              const postEl = document.getElementById(`post-${targetPostId}`);
              if (postEl) {
                postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                postEl.classList.add('ring-4', 'ring-purple-500/50', 'transition-all', 'duration-500');
                setTimeout(() => {
                  postEl.classList.remove('ring-4', 'ring-purple-500/50');
                }, 3000);
              }
            }, 350);

            if (setHighlightedPostId) setHighlightedPostId(null);
          }
        } catch (err) {
          console.error('Failed to fetch highlighted post:', err);
        }
      };
      fetchHighlightedPost();
    }
  }, [highlightedPostId]);

  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (activeCommentPost) {
        e.preventDefault();
        setActiveCommentPost(null);
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [activeCommentPost]);


  const handlePostDelete = (postId) => {
    setFeedPosts(prev => {
      const updated = prev.filter(p => p._id !== postId);
      safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBlockAuthor = (authorId) => {
    setFeedPosts(prev => {
      const updated = prev.filter(p => p.authorId !== authorId);
      safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
    fetchGlobalSettings();
  };

  // Follow/Unfollow Toggle
  const handleFollowToggle = async (authorId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${authorId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Update local state dynamically
        setFeedPosts(prev => {
          const updated = prev.map(post => {
            if (post.authorId === authorId) {
              return { ...post, isFollowing: data.isFollowing };
            }
            return post;
          });
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    }
  };

  // Like/Unlike Toggle on post
  const handleLikeToggle = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json(); // { likesCount, isLiked }
        const userIdStr = currentUser?._id ? currentUser._id.toString() : '';
        
        setFeedPosts(prev => {
          const updated = prev.map(p => {
            if (p._id === postId) {
              let newLikes = (p.likes || []).map(id => typeof id === 'object' && id?._id ? id._id.toString() : id.toString());
              if (data.isLiked) {
                if (userIdStr && !newLikes.includes(userIdStr)) {
                  newLikes = [...newLikes, userIdStr];
                }
              } else {
                newLikes = newLikes.filter(id => id !== userIdStr);
              }
              return { ...p, likes: newLikes };
            }
            return p;
          });
          safeLocalStorageSet('cached_feed_posts', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to toggle like');
    }
  };

  // Comment or Reply submit
  const handleCommentSubmit = async (postId, text, commentId = null, replyToUser = '', replyToUserId = null) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = commentId 
        ? `${API_BASE}/api/posts/${postId}/comment/${commentId}/reply`
        : `${API_BASE}/api/posts/${postId}/comment`;

      const bodyData = commentId 
        ? { text, replyToUser, replyToUserId }
        : { text };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        // Fetch updated post data to refresh comments & replies
        const postRes = await fetch(`${API_BASE}/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (postRes.ok) {
          const updatedPost = await postRes.json();
          setActiveCommentPost(updatedPost);
          setFeedPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: updatedPost.comments } : p));
        }
      }
    } catch (err) {
      console.error('Failed to submit comment/reply:', err);
    }
  };

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 flex flex-col relative">
        {/* Content Body */}
        <div className="w-full max-w-2xl md:max-w-3xl lg:max-w-2xl mx-auto px-1 sm:px-3 lg:px-0 pt-2 lg:pt-0 pb-8 flex-1 space-y-5 sm:space-y-6">
          {/* SEO H1 Heading (Screen Reader & Search Engine Optimized) */}
          <h1 className="sr-only">Zenivio – More Than a Social Network</h1>

          {/* Banner */}
          <BannerSection onStartEarning={() => setActiveTab && setActiveTab('Earning')} />

          {/* Facebook Style Story (Day) Tray — Temporarily hidden, code preserved */}
          {false && (
            <div className="w-full">
              <StoryTray
                stories={stories}
                currentUser={currentUser}
                onOpenCreator={() => setShowStoryCreator(true)}
                onOpenViewer={(user, idx = 0) => {
                  setViewingStoryUser(user);
                  setViewingStoryIndex(idx);
                }}
              />
            </div>
          )}

          {/* Community Feed Section */}
          <div ref={communityFeedRef} className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-850 dark:text-white">Community Posts</h2>
              <button 
                onClick={handleSeeAllCommunityPosts} 
                className="text-xs font-black text-[#7C3AED] hover:underline cursor-pointer active:scale-95 transition-all"
              >
                See All
              </button>
            </div>

            {/* Search Users to Follow or Chat */}
            <div className="relative z-20">
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl px-4 py-1 shadow-2xs focus-within:border-[#7C3AED]/30 transition-all">
                <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  placeholder="Search users to follow or message..."
                  className="w-full bg-transparent border-none py-2 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-xs sm:text-sm font-semibold"
                />
                {userSearchQuery && (
                  <button onClick={() => { setUserSearchQuery(''); setUserSearchResults([]); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown Overlay */}
              {userSearchQuery && (
                <div className="absolute top-13 left-0 right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-xl z-50 p-2 max-h-[300px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                  {searchingUsers ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      <span className="text-xs text-slate-450 font-bold">Searching...</span>
                    </div>
                  ) : userSearchResults.length > 0 ? (
                    userSearchResults.map(user => (
                      <div key={user._id} className="flex items-center justify-between py-2.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors">
                        <button
                          onClick={() => {
                            if (onUserClick) {
                              onUserClick(user._id);
                              setUserSearchQuery('');
                              setUserSearchResults([]);
                            }
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left active:opacity-70 transition-opacity"
                        >
                          {user.profilePic ? (
                            <img
                              src={getImageUrl(user.profilePic)}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1">
                              {isUserVerified(user) && (
                                <VerifiedBadge size="w-3.5 h-3.5" type={getUserBadgeType(user)} />
                              )}
                            </div>
                          </div>
                        </button>

                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {/* Follow Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSearchUserFollowToggle(user._id); }}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all active:scale-95 ${
                              user.isFollowing
                                ? 'bg-slate-100 dark:bg-slate-850 text-slate-450 dark:text-slate-500'
                                : 'text-[#7C3AED] bg-indigo-50 dark:bg-[#7C3AED]/10 hover:bg-indigo-100/70'
                            }`}
                          >
                            {user.isFollowing ? 'Following' : '+ Follow'}
                          </button>

                          {/* Message Button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSearchUserMessageClick(user); }}
                            className="p-1.5 rounded-lg bg-indigo-50 dark:bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-indigo-100/70 active:scale-95 transition-all"
                            title="Message User"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-450 font-bold">
                      No users found matching "{userSearchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {loading ? (
              <div className="space-y-4 pb-12">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 space-y-3 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="space-y-1.5 flex-1">
                        <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                        <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md" />
                      </div>
                    </div>
                    <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                    <div className="w-full h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  </div>
                ))}
              </div>
            ) : feedPosts.length > 0 ? (
              <div className="space-y-4 pb-12">
                {feedPosts.map((post, index) => (
                  <React.Fragment key={post._id}>
                    <CommunityPostCard 
                      post={post} 
                      onFollowToggle={handleFollowToggle} 
                      onLikeToggle={handleLikeToggle}
                      onCommentClick={() => setActiveCommentPost(post)}
                      currentUserId={currentUser?._id}
                      setSelectedReelId={setSelectedReelId}
                      setActiveTab={setActiveTab}
                      onUserClick={onUserClick}
                      onImageClick={setPreviewImageUrl}
                      showToast={showToastNotification}
                      onActionTrigger={handleActionTrigger}
                      onShareClick={(url, title, text, postObj) => {
                        setShareData({ url, title, text, post: postObj || post });
                        setShareModalOpen(true);
                      }}
                      onOpenReactionsModal={(id) => setShowReactionsPostId(id)}
                    />

                    {/* Suggested People to Follow Section (Every 7 posts) */}
                    {(index + 1) % 7 === 0 && suggestedUsers && suggestedUsers.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs my-4 animate-fade-in">
                        <div className="flex items-center justify-between mb-3 px-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-[#7C3AED] flex items-center justify-center font-bold">
                              <Users className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                                Suggested for You
                              </h3>
                              <p className="text-[10px] text-slate-400 font-bold">People you may want to connect with</p>
                            </div>
                          </div>
                        </div>

                        {/* Horizontal scrollable user cards */}
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1 -mx-1 px-1">
                          {suggestedUsers.slice(0, 8).map(sUser => (
                            <div 
                              key={sUser._id} 
                              className="flex-shrink-0 w-36 bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-3 flex flex-col items-center text-center justify-between relative shadow-2xs hover:shadow-sm transition-all"
                            >
                              <div 
                                onClick={() => onUserClick && onUserClick(sUser._id)}
                                className="cursor-pointer flex flex-col items-center w-full"
                              >
                                <div className="relative mb-2">
                                  {sUser.profilePic ? (
                                    <img 
                                      src={getImageUrl(sUser.profilePic)} 
                                      alt={sUser.name}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-pink-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                      {sUser.name ? sUser.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                   )}
                                </div>

                                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate w-full flex items-center justify-center gap-1 mb-2">
                                  <span className="truncate">{sUser.name}</span>
                                  {isUserVerified(sUser) && (
                                    <VerifiedBadge size="sm" type={getUserBadgeType(sUser)} />
                                  )}
                                </h4>
                              </div>

                              <button
                                onClick={async () => {
                                  await handleFollowToggle(sUser._id);
                                  setSuggestedUsers(prev => prev.map(u => u._id === sUser._id ? { ...u, isFollowing: !u.isFollowing } : u));
                                }}
                                className={`w-full py-1.5 rounded-xl text-[11px] font-black transition-all active:scale-95 ${
                                  sUser.isFollowing
                                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200'
                                    : 'bg-[#7C3AED] hover:bg-indigo-700 text-white shadow-xs'
                                }`}
                              >
                                {sUser.isFollowing ? 'Following' : '+ Follow'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {/* Silent Bottom Infinite Scroll Sentinel (No Page Numbers Displayed) */}
                {hasMorePosts && (
                  <div ref={bottomSentinelRef} className="py-6 flex flex-col items-center justify-center">
                    {fetchingMore && (
                      <div className="flex items-center gap-2 text-[#7C3AED] font-bold text-xs">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading more posts...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-400 font-bold text-sm">
                No community posts yet. Be the first to post!
              </div>
            )}
          </div>
        </div>

        {/* Floating Plus FAB to Create Post (Matches screenshot bottom right button) */}
        <button
          onClick={() => setActiveTab && setActiveTab('CreatePost')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 z-40 transition-transform duration-300"
          title="Create Post"
        >
          <Plus className="w-7 h-7" strokeWidth={2.8} />
        </button>
      </div>
    </PullToRefresh>

        {/* Comments Drawer Slide-up Sheet Drawer Overlay */}
        {activeCommentPost && (
          <CommentsDrawer
            post={activeCommentPost}
            onClose={() => setActiveCommentPost(null)}
            onCommentSubmit={handleCommentSubmit}
            currentUserId={currentUser?._id}
            onUserClick={onUserClick}
          />
        )}

        {/* Full Screen Image Preview Modal */}
        {previewImageUrl && (
          <ImagePreviewModal 
            imageUrl={previewImageUrl} 
            onClose={() => setPreviewImageUrl(null)} 
          />
        )}

        {/* React Modals for Post UGC actions (replaces window.confirm/prompt) */}
        {activeActionModal && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveActionModal(null)} />
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-scale-pulse-glow text-left">
              
              {activeActionModal.type === 'delete' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Post</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                    Are you sure you want to permanently delete this post? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteConfirm}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-rose-500/20 active:scale-95"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}

              {activeActionModal.type === 'block' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Block User</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                    Are you sure you want to block {activeActionModal.post?.authorDetails?.name || activeActionModal.post?.authorName || 'this user'}? You won't see their posts or chats anymore.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors active:scale-95"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBlockConfirm}
                      className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-rose-500/20 active:scale-95"
                    >
                      Block User
                    </button>
                  </div>
                </>
              )}

              {activeActionModal.type === 'report' && (
                <>
                  <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Report Post</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-4 leading-relaxed">
                    Please select a reason for reporting this post. It will be hidden from your feed and reviewed by moderators.
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      { value: 'spam', label: 'Spam or scams' },
                      { value: 'harassment', label: 'Harassment or hate speech' },
                      { value: 'violence', label: 'Violence or threats' },
                      { value: 'sexual', label: 'Sexually explicit content' },
                      { value: 'other', label: 'Other violation' }
                    ].map(opt => (
                      <label 
                        key={opt.value} 
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer font-bold text-xs sm:text-sm transition-all ${
                          reportReason === opt.value 
                            ? 'border-indigo-500 bg-indigo-500/5 text-indigo-655 dark:text-indigo-400' 
                            : 'border-slate-100 dark:border-slate-800 text-slate-655 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="postReportReason" 
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
                      onClick={() => setActiveActionModal(null)}
                      className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleReportSubmit}
                      className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-black text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                    >
                      Submit Report
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}

        {/* Story Creator Modal */}
        {showStoryCreator && (
          <StoryCreatorModal
            isOpen={showStoryCreator}
            onClose={() => setShowStoryCreator(false)}
            onStoryCreated={() => {
              fetchStories();
              showToastNotification('Story shared successfully! 🌟');
            }}
          />
        )}

        {/* Story Viewer Modal */}
        {viewingStoryUser && (
          <StoryViewerModal
            storyUser={viewingStoryUser}
            storyUsers={orderedStoryUsers}
            initialIndex={viewingStoryIndex}
            currentUser={currentUser}
            onClose={() => setViewingStoryUser(null)}
            onNextUser={handleNextStoryUser}
            onPrevUser={handlePrevStoryUser}
            onUserClick={onUserClick}
            onDeleteStory={(deletedId) => {
              fetchStories();
              showToastNotification('Story deleted 🗑️');
            }}
          />
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

        {showReactionsPostId && (
          <ReactionsModal 
            postId={showReactionsPostId} 
            onClose={() => setShowReactionsPostId(null)} 
            onUserClick={onUserClick} 
          />
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-2 animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
};

export default HomePage;
