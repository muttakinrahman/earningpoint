import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Send, ArrowLeft, Loader2, User as UserIcon, WifiOff, Phone, 
  Video, PhoneOff, Image, Mic, Smile, ThumbsUp, ChevronRight, UserPlus, 
  MoreVertical, Star, X, Users, SquarePen, Check, Plus,
  CornerUpLeft, Edit3, Trash2, Undo, CheckCheck,
  Music, Volume2, VolumeX, Play, Pause, Upload
} from 'lucide-react';
import { io } from 'socket.io-client';
import { API_BASE, getImageUrl } from '../config';
import PullToRefresh from './PullToRefresh';
import VerifiedBadge from './VerifiedBadge';
import StoryCreatorModal from './Story/StoryCreatorModal';
import StoryViewerModal from './Story/StoryViewerModal';

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾',
  '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿',
  '😾', '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '🦻', '👃',
  '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸', '❤️',
  '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '🔥', '✨'
];

const STORY_MUSIC_PRESETS = [
  {
    id: 'lofi_chill',
    title: 'Lo-Fi Chill Beat',
    artist: 'Zenivio Lo-Fi',
    genre: 'Lo-Fi / Chill',
    url: '/music/lofi_chill.wav'
  },
  {
    id: 'acoustic_love',
    title: 'Romantic Acoustic',
    artist: 'Sunset Serenade',
    genre: 'Acoustic / Indie',
    url: '/music/acoustic_love.wav'
  },
  {
    id: 'upbeat_pop',
    title: 'Upbeat Pop Groove',
    artist: 'Dance City',
    genre: 'Pop / Dance',
    url: '/music/upbeat_pop.wav'
  },
  {
    id: 'bangla_melody',
    title: 'Bangla Melodic Serenade',
    artist: 'Dhaka Folk Vibe',
    genre: 'Bengali Folk Melody',
    url: '/music/bangla_melody.wav'
  }
];

const getProfilePicUrl = (pic) => {
  return getImageUrl(pic);
};

const AudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const onTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatAudioTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/90 py-2 px-3 rounded-2xl w-60 text-slate-850 dark:text-slate-150 border border-slate-200/40 dark:border-slate-800/80 shadow-3xs" onClick={(e) => e.stopPropagation()}>
      <audio 
        ref={audioRef} 
        src={src} 
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
      <button 
        type="button" 
        onClick={togglePlay}
        className="w-8 h-8 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white flex items-center justify-center shrink-0 active:scale-90 transition-transform"
      >
        {isPlaying ? (
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="bg-[#7C3AED] h-full" 
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">
          <span>{formatAudioTime(currentTime)}</span>
          <span>{formatAudioTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

const formatRelativeTime = (timeStr) => {
  if (!timeStr) return '';
  const diffMs = Date.now() - new Date(timeStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

const MessengerPage = ({ 
  onBack, 
  activeChatPartner, 
  setActiveChatPartner, 
  socket, 
  onlineUsers, 
  incomingCallData, 
  setIncomingCallData,
  setActiveTab,
  setActivePublicProfileUserId 
}) => {
  // ────────────────── ALL STATE HOOKS ──────────────────
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_current_user')) || null; } catch { return null; }
  });
  const [chatUsers, setChatUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cached_chat_users')) || []; } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [activePartner, setActivePartner] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('messenger_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showEditFavoritesModal, setShowEditFavoritesModal] = useState(false);
  const [favoritesSearchQuery, setFavoritesSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [typingGroupMembers, setTypingGroupMembers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(() => !localStorage.getItem('cached_chat_users'));
  const [loadingChat, setLoadingChat] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  // Status Notes State
  const [notes, setNotes] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  // Group Creation State
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  
  // Custom dialog modals
  const [activeModal, setActiveModal] = useState(null); // 'delete_chat', 'block_user', 'report_user', 'report_message', 'delete_story', 'message_actions'
  const [reportReason, setReportReason] = useState('spam');
  const [targetMessageId, setTargetMessageId] = useState(null);
  const [targetStoryId, setTargetStoryId] = useState(null);
  
  // Message Edit, Reply, and Action state
  const [editingMessage, setEditingMessage] = useState(null); // { _id, content }
  const [replyingTo, setReplyingTo] = useState(null); // { messageId, content, senderName, messageType }
  const [messageActionTarget, setMessageActionTarget] = useState(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);
  // Rich Media State Hooks
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Story State Hooks
  const [stories, setStories] = useState([]);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [storyEmoji, setStoryEmoji] = useState('');
  const [storyImage, setStoryImage] = useState(null);         // File object
  const [storyImagePreview, setStoryImagePreview] = useState(''); // data URL for preview
  const [storyBg, setStoryBg] = useState('linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)');
  const [storyTextColor, setStoryTextColor] = useState('#ffffff');
  const [storyFontStyle, setStoryFontStyle] = useState('normal');
  const [isSavingStory, setIsSavingStory] = useState(false);
  const [storyMusic, setStoryMusic] = useState(null); // { title: '', artist: '', url: '' }
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [previewingMusicUrl, setPreviewingMusicUrl] = useState(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isStoryMuted, setIsStoryMuted] = useState(false);
  const storyAudioRef = useRef(null);
  const previewAudioRef = useRef(null);
  const storyAudioUploadInputRef = useRef(null);

  // Story Viewer
  const [viewingStoryUser, setViewingStoryUser] = useState(null); // { _id, name, profilePic, stories[] }
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

  const socketConnected = !!socket;
  const connectionError = !socket;

  // ────────────────── ALL REF HOOKS ──────────────────
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const audioContextRef = useRef(null);
  const ringIntervalRef = useRef(null);
  // WebRTC Call Refs
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const callTypeRef = useRef('audio');
  const candidateQueueRef = useRef([]);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);

  // Rich Media Refs
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const recordingStartTimeRef = useRef(0);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const storyImageInputRef = useRef(null); // For story photo picker
  // Stable refs for async callbacks
  const activeCallRef = useRef(activeCall);
  const activePartnerRef = useRef(activePartner);
  const incomingCallDataRef = useRef(incomingCallData);
  // remoteStreamReady toggles to trigger useEffect stream attachment
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);

  // ────────────────── USE EFFECTS ──────────────────
  // Keep stable refs in sync
  useEffect(() => { activeCallRef.current = activeCall; }, [activeCall]);
  useEffect(() => { activePartnerRef.current = activePartner; }, [activePartner]);
  useEffect(() => { incomingCallDataRef.current = incomingCallData; }, [incomingCallData]);

  // Manage Call Duration Timer
  useEffect(() => {
    let interval;
    if (activeCall === 'ongoing') {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const formatDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Manage Ringtone when incomingCallData changes
  useEffect(() => {
    if (incomingCallData) {
      startRingtone();
    } else {
      stopRingtone();
    }
    return () => stopRingtone();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomingCallData]);

  // Attach remote stream to video/audio element whenever stream is ready
  useEffect(() => {
    if (!remoteStreamRef.current) return;
    const stream = remoteStreamRef.current;
    const tryAttach = () => {
      if (callTypeRef.current === 'video') {
        const el = remoteVideoRef.current || document.getElementById('remoteVideo');
        if (el && el.srcObject !== stream) {
          el.srcObject = stream;
          el.muted = false;
          el.volume = 1.0;
          el.play().catch(() => {});
        }
      } else {
        const el = remoteAudioRef.current || document.getElementById('remoteAudio');
        if (el && el.srcObject !== stream) {
          el.srcObject = stream;
          el.muted = false;
          el.volume = 1.0;
          el.play().catch(() => {
            el.muted = true;
            el.play().then(() => { el.muted = false; }).catch(() => {});
          });
        }
      }
    };
    tryAttach();
    const t1 = setTimeout(tryAttach, 500);
    const t2 = setTimeout(tryAttach, 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [remoteStreamReady, activeCall]);

  // Attach local stream to local video element when call is ongoing
  useEffect(() => {
    if (activeCall === 'ongoing' && callTypeRef.current === 'video' && localStreamRef.current) {
      const el = localVideoRef.current || document.getElementById('localVideo');
      if (el && el.srcObject !== localStreamRef.current) {
        el.srcObject = localStreamRef.current;
        el.muted = true;
        el.play().catch(() => {});
      }
    }
  }, [activeCall]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPartnerTyping, typingGroupMembers]);

  // Hardware Back Button listener
  useEffect(() => {
    const handleHardwareBack = (e) => {
      if (activeCall) {
        e.preventDefault();
        stopRingtone();
        setActiveCall(null);
      } else if (incomingCallData) {
        e.preventDefault();
        stopRingtone();
        setIncomingCallData(null);
      } else if (showCreateGroupModal) {
        e.preventDefault();
        setShowCreateGroupModal(false);
      } else if (showNoteModal) {
        e.preventDefault();
        setShowNoteModal(false);
      } else if (showEditFavoritesModal) {
        e.preventDefault();
        setShowEditFavoritesModal(false);
      } else if (activePartner) {
        e.preventDefault();
        setActivePartner(null);
        if (setActiveChatPartner) setActiveChatPartner(null);
        fetchUsers();
      }
    };
    document.addEventListener('appBackButton', handleHardwareBack);
    return () => {
      document.removeEventListener('appBackButton', handleHardwareBack);
    };
  }, [activeCall, incomingCallData, showCreateGroupModal, showNoteModal, showEditFavoritesModal, activePartner, setActiveChatPartner]);

  // ────────────────── FETCHING DATA ──────────────────
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const profileRes = await fetch(`${API_BASE}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const pData = await profileRes.json();
        setCurrentUser(pData);
        try { localStorage.setItem('cached_current_user', JSON.stringify(pData)); } catch {}
      }

      const usersRes = await fetch(`${API_BASE}/api/messages/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setChatUsers(uData);
        try { localStorage.setItem('cached_chat_users', JSON.stringify(uData)); } catch {}
      }
    } catch (err) {
      console.error('Failed to fetch Messenger data:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/notes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const fetchStories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_BASE}/api/messages/stories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStories(data);
      }
    } catch (err) {
      console.error('Failed to fetch stories:', err);
    }
  };

  const togglePreviewTrack = (url) => {
    if (previewingMusicUrl === url) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setPreviewingMusicUrl(null);
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      previewAudioRef.current = new Audio(url);
      previewAudioRef.current.play().catch(() => {});
      setPreviewingMusicUrl(url);
      previewAudioRef.current.onended = () => setPreviewingMusicUrl(null);
    }
  };

  const handleSelectMusic = (track) => {
    setStoryMusic({
      title: track.title,
      artist: track.artist || 'Original Sound',
      url: track.url
    });
    setShowMusicPicker(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setPreviewingMusicUrl(null);
    }
  };

  const handleCustomAudioUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAudio(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/messages/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        const audioUrl = `${API_BASE}/api/image?file=${encodeURIComponent(data.filename)}`;
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
        setStoryMusic({
          title: cleanTitle.length > 25 ? cleanTitle.substring(0, 25) + '...' : cleanTitle,
          artist: 'Custom Sound',
          url: audioUrl
        });
        setShowMusicPicker(false);
        if (previewAudioRef.current) {
          previewAudioRef.current.pause();
          setPreviewingMusicUrl(null);
        }
      }
    } catch (err) {
      console.error('Audio upload failed:', err);
    } finally {
      setIsUploadingAudio(false);
      e.target.value = '';
    }
  };

  const handleSaveStory = async () => {
    if (!storyText.trim() && !storyEmoji && !storyImage && !storyMusic) return;
    setIsSavingStory(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('text', storyText);
      formData.append('emoji', storyEmoji);
      formData.append('bgGradient', storyBg);
      formData.append('textColor', storyTextColor);
      formData.append('fontStyle', storyFontStyle);
      if (storyImage) formData.append('image', storyImage);
      if (storyMusic) formData.append('music', JSON.stringify(storyMusic));

      const res = await fetch(`${API_BASE}/api/messages/story`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setShowStoryCreator(false);
        setStoryText('');
        setStoryEmoji('');
        setStoryImage(null);
        setStoryImagePreview('');
        setStoryMusic(null);
        setStoryBg('linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)');
        setStoryFontStyle('normal');
        fetchStories();
      }
    } catch (err) {
      console.error('Failed to save story:', err);
    } finally {
      setIsSavingStory(false);
    }
  };

  const handleDeleteChatConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/chat/${activePartner._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveModal(null);
        setActivePartner(null);
        if (setActiveChatPartner) setActiveChatPartner(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleBlockUserConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/block/${activePartner._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setActiveModal(null);
        setActivePartner(null);
        if (setActiveChatPartner) setActiveChatPartner(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to block user:', err);
    }
  };

  const handleReportUserSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/report/${activePartner._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        setActiveModal(null);
        setActivePartner(null);
        if (setActiveChatPartner) setActiveChatPartner(null);
        fetchUsers();
      }
    } catch (err) {
      console.error('Failed to report user:', err);
    }
  };

  const handleReportMessageSubmit = async () => {
    if (!targetMessageId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/report/${targetMessageId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reportReason })
      });
      if (res.ok) {
        setActiveModal(null);
        setTargetMessageId(null);
      }
    } catch (err) {
      console.error('Failed to report message:', err);
    }
  };

  const handleDeleteStoryConfirm = async () => {
    if (!targetStoryId) return;
    try {
      await handleDeleteStory(targetStoryId);
      setActiveModal(null);
      setTargetStoryId(null);
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/messages/story/${storyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStories();
      setViewingStoryUser(null);
    } catch (err) {
      console.error('Failed to delete story:', err);
    }
  };

  const openStoryViewer = (storyUser, index = 0) => {
    setViewingStoryUser(storyUser);
    setViewingStoryIndex(index);
  };

  useEffect(() => {
    fetchUsers();
    fetchNotes();
    fetchStories();
  }, []);

  // Sync with activeChatPartner prop (e.g., when call is incoming or initiated from another page)
  useEffect(() => {
    if (activeChatPartner) {
      handleOpenChat(activeChatPartner);
    }
  }, [activeChatPartner]);

  // Default favorites populator
  useEffect(() => {
    const activeDirectUsers = chatUsers.filter(u => !u.isGroup);
    if (activeDirectUsers.length > 0 && favorites.length === 0) {
      const saved = localStorage.getItem('messenger_favorites');
      if (!saved) {
        const defaultIds = activeDirectUsers.slice(0, 4).map(u => u._id);
        setFavorites(defaultIds);
        try {
          localStorage.setItem('messenger_favorites', JSON.stringify(defaultIds));
        } catch (e) {
          console.warn('LocalStorage save failed:', e);
        }
      }
    }
  }, [chatUsers, favorites.length]);

  // Global search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearchingGlobal(true);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${API_BASE}/api/profile/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Filter out users who are already in local chatUsers list to avoid duplicates
            const filtered = data.filter(u => !chatUsers.some(cu => cu._id.toString() === u._id.toString()));
            setGlobalSearchResults(filtered);
          }
        } catch (err) {
          console.error('Failed to search users globally:', err);
        } finally {
          setIsSearchingGlobal(false);
        }
      } else {
        setGlobalSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, chatUsers]);

  // ────────────────── WEBSOCKET SETUP ──────────────────
  // Setup Group Rooms — join on mount/chatUsers change, and also on socket reconnect
  const chatUsersRef = useRef(chatUsers);
  useEffect(() => { chatUsersRef.current = chatUsers; }, [chatUsers]);
  const activePartnerRef2 = useRef(activePartner);
  useEffect(() => { activePartnerRef2.current = activePartner; }, [activePartner]);

  useEffect(() => {
    if (socket && chatUsers.length > 0) {
      const groupChats = chatUsers.filter(u => u.isGroup);
      groupChats.forEach(g => {
        socket.emit('join_group_room', { groupId: g._id });
      });
    }
  }, [socket, chatUsers]);

  // On socket reconnect: rejoin rooms and reload active chat history
  useEffect(() => {
    if (!socket) return;
    const handleReconnect = () => {
      // Rejoin all group rooms
      const groups = chatUsersRef.current.filter(u => u.isGroup);
      groups.forEach(g => {
        socket.emit('join_group_room', { groupId: g._id });
      });
      // Reload active chat to avoid missing messages during disconnect
      const partner = activePartnerRef2.current;
      if (partner) {
        const token = localStorage.getItem('token');
        if (!token) return;
        const endpoint = partner.isGroup
          ? `${API_BASE}/api/messages/history/group/${partner._id}`
          : `${API_BASE}/api/messages/history/${partner._id}`;
        fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.ok ? r.json() : null)
          .then(history => { if (history) setMessages(history); })
          .catch(() => {});
      }
      // Refresh user list
      fetchUsers();
    };
    socket.on('reconnect', handleReconnect);
    // Also listen for connect event (fired on both initial connect and reconnect)
    socket.on('connect', handleReconnect);
    return () => {
      socket.off('reconnect', handleReconnect);
      socket.off('connect', handleReconnect);
    };
  }, [socket]);


  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    socket.on('receive_direct_message', (message) => {
      const msgSenderId = message.sender?._id ? message.sender._id.toString() : (message.sender ? message.sender.toString() : '');
      const msgReceiverId = message.receiver?._id ? message.receiver._id.toString() : (message.receiver ? message.receiver.toString() : '');
      const myId = currentUser?._id ? currentUser._id.toString() : '';
      const partnerId = activePartner?._id ? activePartner._id.toString() : '';

      if (activePartner && !activePartner.isGroup && (
        (msgSenderId === partnerId && msgReceiverId === myId) ||
        (msgSenderId === myId && msgReceiverId === partnerId)
      )) {
        setMessages((prev) => [...prev, message]);
        if (msgReceiverId === myId && msgSenderId === partnerId) {
          socket.emit('read_messages', { senderId: partnerId, receiverId: myId });
          window.dispatchEvent(new CustomEvent('messages_read_update'));
        }
      }
      fetchUsers();
    });

    socket.on('receive_group_message', (message) => {
      const activeGroupId = activePartner?._id ? activePartner._id.toString() : '';
      const msgGroupId = message.group?._id ? message.group._id.toString() : (message.group ? message.group.toString() : '');
      if (activePartner && activePartner.isGroup && msgGroupId === activeGroupId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchUsers();
    });

    socket.on('direct_typing', (data) => {
      if (activePartner && !activePartner.isGroup && data.senderId === activePartner._id) {
        setIsPartnerTyping(data.isTyping);
        if (data.isTyping) {
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsPartnerTyping(false);
          }, 3000);
        }
      }
    });

    socket.on('group_typing', (data) => {
      if (activePartner && activePartner.isGroup && data.groupId === activePartner._id && data.senderId !== currentUser?._id) {
        if (data.isTyping) {
          setTypingGroupMembers(prev => [...new Set([...prev, data.senderName])]);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingGroupMembers(prev => prev.filter(name => name !== data.senderName));
          }, 3000);
        } else {
          setTypingGroupMembers(prev => prev.filter(name => name !== data.senderName));
        }
      }
    });

    socket.on('message_edited', (updatedMessage) => {
      setMessages((prev) => prev.map((m) => m._id === updatedMessage._id ? updatedMessage : m));
    });

    socket.on('message_unsent', ({ messageId, updatedMessage }) => {
      setMessages((prev) => prev.map((m) => m._id === messageId ? (updatedMessage || { ...m, isUnsent: true, content: 'This message was unsent', messageType: 'text' }) : m));
    });

    socket.on('message_deleted_for_me', ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    socket.on('messages_read', (data) => {
      const activePartnerId = activePartner?._id?.toString();
      const readerId = data?.readerId?.toString();
      const myId = currentUser?._id?.toString();

      if (activePartner && !activePartner.isGroup && readerId && activePartnerId && readerId === activePartnerId) {
        setMessages((prev) => prev.map(msg => {
          const msgSenderId = (msg.sender?._id || msg.sender)?.toString();
          if (msgSenderId && myId && msgSenderId === myId && !msg.isRead) {
            return { ...msg, isRead: true };
          }
          return msg;
        }));
      }
    });

    // Calling Listeners — incoming_call is handled in App.jsx for global scope
    // Only handle incoming_group_call here if not already handled in App.jsx
    socket.on('incoming_group_call', (data) => {
      setIncomingCallData({ ...data, isGroup: true });
      startRingtone();
    });

    socket.on('call_declined', () => {
      cleanUpCall();
      // Don't use alert - just clean up silently or show toast
      console.log('Call was declined.');
    });

    socket.on('call_accepted', async (data) => {
      stopRingtone();
      setActiveCall('ongoing');
      
      const callType = callTypeRef.current;
      const partner = activePartnerRef.current;
      if (!partner) return;

      try {
        const myId = currentUser?._id;
        const stream = await startLocalStream(callType);
        const pc = createPeerConnection(partner._id, stream, myId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc_signal', {
          targetId: partner._id,
          senderId: myId,
          signal: { type: 'offer', sdp: offer.sdp }
        });
      } catch (err) {
        console.error('Error starting WebRTC call:', err);
        cleanUpCall();
      }
    });

    socket.on('call_ended', () => {
      cleanUpCall();
      console.log('Call ended.');
    });

    socket.on('webrtc_signal', async (data) => {
      const { senderId, signal } = data;
      let pc = peerConnectionRef.current;
      const myId = currentUser?._id;
      
      try {
        if (signal.type === 'offer') {
          const callType = incomingCallDataRef.current?.type || callTypeRef.current || 'audio';
          callTypeRef.current = callType;
          // Reuse already-started stream if available (from handleAnswerCall), else get new one
          const stream = localStreamRef.current || await startLocalStream(callType);
          if (!localStreamRef.current) localStreamRef.current = stream;
          pc = createPeerConnection(senderId, stream);
          await pc.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc_signal', {
            targetId: senderId,
            senderId: myId,
            signal: { type: 'answer', sdp: answer.sdp }
          });
          
          // Process queued candidates
          await processCandidateQueue();
        } else if (signal.type === 'answer') {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal));
            // Process queued candidates
            await processCandidateQueue();
          }
        } else if (signal.type === 'candidate') {
          if (pc && pc.remoteDescription) {
            if (signal.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
          } else {
            // Queue candidate if peer connection or remote description is not ready yet
            if (signal.candidate) {
              candidateQueueRef.current.push(signal.candidate);
            }
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC signal:', err);
      }
    });

    return () => {
      socket.off('receive_direct_message');
      socket.off('receive_group_message');
      socket.off('direct_typing');
      socket.off('group_typing');
      socket.off('message_edited');
      socket.off('message_unsent');
      socket.off('message_deleted_for_me');
      socket.off('messages_read');
      socket.off('incoming_call');
      socket.off('incoming_group_call');
      socket.off('call_declined');
      socket.off('call_accepted');
      socket.off('call_ended');
      socket.off('webrtc_signal');
    };
  }, [socket, activePartner, currentUser]);

  // ────────────────── CHAT ACTIONS ──────────────────
  const handleOpenChat = async (partner) => {
    setActivePartner(partner);
    setLoadingChat(true);
    setMessages([]);
    setIsPartnerTyping(false);
    setTypingGroupMembers([]);
    if (setActiveChatPartner) setActiveChatPartner(partner);

    // Fetch fresh profile details for direct partner to ensure verified badge is up-to-date
    if (!partner.isGroup && partner._id) {
      try {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/api/profile/${partner._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => {
            if (d?.user) {
              setActivePartner(prev => (prev && prev._id === partner._id) ? {
                ...prev,
                verificationBadge: d.user.verificationBadge || 'none',
                isEmailVerified: d.user.isEmailVerified,
                profilePic: d.user.profilePic || prev.profilePic,
                name: d.user.name || prev.name
              } : prev);
            }
          })
          .catch(() => {});
      } catch (e) {}
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = partner.isGroup 
        ? `${API_BASE}/api/messages/history/group/${partner._id}`
        : `${API_BASE}/api/messages/history/${partner._id}`;

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const history = await res.json();
        setMessages(history);
        if (!partner.isGroup && socket) {
          const partnerId = partner._id ? partner._id.toString() : '';
          const myId = currentUser?._id ? currentUser._id.toString() : '';
          if (partnerId && myId) {
            socket.emit('read_messages', { senderId: partnerId, receiverId: myId });
          }
        }
        window.dispatchEvent(new CustomEvent('messages_read_update'));
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  // Click outside emoji picker logic
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const sendMediaMessage = (fileUrl, type) => {
    if (!socket || !activePartner || !currentUser) return;
    
    if (activePartner.isGroup) {
      socket.emit('send_group_message', {
        senderId: currentUser._id,
        groupId: activePartner._id,
        content: fileUrl,
        messageType: type,
        replyTo: replyingTo || null
      });
    } else {
      socket.emit('send_direct_message', {
        senderId: currentUser._id,
        receiverId: activePartner._id,
        content: fileUrl,
        messageType: type,
        replyTo: replyingTo || null
      });
    }
    setReplyingTo(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/messages/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      if (data.filename) {
        sendMediaMessage(data.filename, 'image');
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      let fileExt = 'webm';
      if (typeof MediaRecorder.isTypeSupported === 'function') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
          fileExt = 'webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          fileExt = 'mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
          mimeType = 'audio/ogg;codecs=opus';
          fileExt = 'ogg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
          fileExt = 'wav';
        }
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (audioBlob.size === 0) return;

        const duration = Math.round((Date.now() - recordingStartTimeRef.current) / 1000);
        if (duration < 1) return;

        const audioFile = new File([audioBlob], `voice_${Date.now()}.${fileExt}`, { type: mimeType || 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioFile);

        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/api/messages/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload voice note');
          }

          const data = await response.json();
          if (data.filename) {
            sendMediaMessage(data.filename, 'voice');
          }
        } catch (err) {
          console.error('Failed to upload voice note:', err);
        }
      };

      recordingStartTimeRef.current = Date.now();
      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to access microphone:', err);
      alert('Could not access microphone. Please verify permissions.');
    }
  };

  const stopVoiceRecording = (shouldSend = true) => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    if (!shouldSend) {
      mediaRecorderRef.current.onstop = () => {
        const stream = mediaRecorderRef.current.stream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const formatRecordTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(prev => prev + emoji);
  };

  const handleSaveEditedMessage = async () => {
    if (!editingMessage || !messageInput.trim()) return;
    const trimmed = messageInput.trim();
    const msgId = editingMessage._id;

    if (socket) {
      socket.emit('edit_message', {
        messageId: msgId,
        content: trimmed,
        userId: currentUser._id
      });
    }

    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/messages/message/${msgId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: trimmed })
      });
    } catch (err) {
      console.error('Failed to edit message via REST:', err);
    }

    setMessages(prev => prev.map(m => m._id === msgId ? { ...m, content: trimmed, isEdited: true, editedAt: new Date() } : m));
    setEditingMessage(null);
    setMessageInput('');
  };

  const handleDeleteMessage = async (msgId, type = 'for_me') => {
    if (!msgId) return;

    if (type === 'for_everyone') {
      if (socket) {
        socket.emit('unsend_message', {
          messageId: msgId,
          userId: currentUser._id
        });
      }
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/messages/message/${msgId}?type=for_everyone`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Failed to unsend message:', e);
      }
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, isUnsent: true, content: 'This message was unsent', messageType: 'text' } : m));
    } else {
      if (socket) {
        socket.emit('delete_message_for_me', {
          messageId: msgId,
          userId: currentUser._id
        });
      }
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/messages/message/${msgId}?type=for_me`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Failed to delete message for me:', e);
      }
      setMessages(prev => prev.filter(m => m._id !== msgId));
    }
    setMessageActionTarget(null);
  };

  const scrollToMessage = (messageId) => {
    if (!messageId) return;
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#7C3AED]', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#7C3AED]', 'ring-offset-2');
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket || !activePartner || !currentUser) return;
    
    // If editing
    if (editingMessage) {
      handleSaveEditedMessage();
      return;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (activePartner.isGroup) {
      socket.emit('group_typing', {
        senderId: currentUser._id,
        senderName: currentUser.name || 'User',
        groupId: activePartner._id,
        isTyping: false
      });
      socket.emit('send_group_message', {
        senderId: currentUser._id,
        groupId: activePartner._id,
        content: messageInput.trim(),
        replyTo: replyingTo || null
      });
    } else {
      socket.emit('direct_typing', {
        senderId: currentUser._id,
        receiverId: activePartner._id,
        isTyping: false
      });
      socket.emit('send_direct_message', {
        senderId: currentUser._id,
        receiverId: activePartner._id,
        content: messageInput.trim(),
        replyTo: replyingTo || null
      });
    }
    setMessageInput('');
    setReplyingTo(null);
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    if (socket && activePartner && currentUser) {
      if (activePartner.isGroup) {
        socket.emit('group_typing', {
          senderId: currentUser._id,
          senderName: currentUser.name || 'User',
          groupId: activePartner._id,
          isTyping: true
        });
      } else {
        socket.emit('direct_typing', {
          senderId: currentUser._id,
          receiverId: activePartner._id,
          isTyping: true
        });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (activePartner.isGroup) {
          socket.emit('group_typing', {
            senderId: currentUser._id,
            senderName: currentUser.name || 'User',
            groupId: activePartner._id,
            isTyping: false
          });
        } else {
          socket.emit('direct_typing', {
            senderId: currentUser._id,
            receiverId: activePartner._id,
            isTyping: false
          });
        }
      }, 1500);
    }
  };

  const handleSendThumbsUp = () => {
    if (!socket || !activePartner || !currentUser) return;
    const thumbMsg = {
      senderId: currentUser._id,
      content: '👍'
    };
    if (activePartner.isGroup) {
      socket.emit('send_group_message', { ...thumbMsg, groupId: activePartner._id });
    } else {
      socket.emit('send_direct_message', { ...thumbMsg, receiverId: activePartner._id });
    }
  };

  const handleFollowToggle = async (e, userId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/profile/follow/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChatUsers(prev => prev.map(user => {
          if (user._id === userId) {
            return { ...user, isFollowing: data.isFollowing };
          }
          return user;
        }));
      }
    } catch (err) {
      console.error('Follow toggle error in messenger:', err);
    }
  };

  const toggleFavorite = (userId) => {
    setFavorites(prev => {
      const isFav = prev.includes(userId);
      let updated;
      if (isFav) {
        updated = prev.filter(id => id !== userId);
      } else {
        updated = [...prev, userId];
      }
      try {
        localStorage.setItem('messenger_favorites', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      return updated;
    });
  };

  // ────────────────── STATUS NOTES ACTIONS ──────────────────
  const handleSaveNote = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/note`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: noteInput.slice(0, 60) })
      });
      if (res.ok) {
        setShowNoteModal(false);
        setNoteInput('');
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to save status note:', err);
    }
  };

  // ────────────────── GROUP ACTIONS ──────────────────
  const handleCreateGroup = async () => {
    if (!groupNameInput.trim() || selectedGroupMembers.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/messages/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: groupNameInput.trim(), members: selectedGroupMembers })
      });
      if (res.ok) {
        const groupObj = await res.json();
        setShowCreateGroupModal(false);
        setGroupNameInput('');
        setSelectedGroupMembers([]);
        if (socket) {
          socket.emit('join_group_room', { groupId: groupObj._id });
        }
        handleOpenChat({ ...groupObj, isGroup: true });
        fetchUsers();
      }
    } catch (err) {
      console.error('Group creation failed:', err);
    }
  };

  const toggleGroupMemberSelection = (userId) => {
    setSelectedGroupMembers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // ────────────────── CALLING SIMULATION SOUNDS ──────────────────
  const stopRingtone = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
  };

  const startRingtone = () => {
    // Stop any existing ringtone first
    stopRingtone();
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const playRing = () => {
        if (!audioContextRef.current) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime + 1.8);
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.0);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 2.1);
        osc2.stop(ctx.currentTime + 2.1);
      };

      playRing();
      ringIntervalRef.current = setInterval(playRing, 3000);
    } catch (e) {
      console.error('Failed to play synthetic ringtone:', e);
    }
  };

  const playBusyTone = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playBeep = (delay) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 480;
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.05);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + delay + 0.35);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + 0.4);
        osc.start();
        setTimeout(() => {
          try { osc.stop(); } catch(e) {}
        }, (delay + 0.5) * 1000);
      };

      playBeep(0);
      playBeep(0.5);
      playBeep(1.0);
      
      setTimeout(() => {
        try { ctx.close(); } catch(e) {}
      }, 2000);
    } catch (e) {
      console.error('Failed to play busy tone:', e);
    }
  };

  const startLocalStream = async (type) => {
    // If stream already exists, stop old tracks first
    if (localStreamRef.current) {
      try { localStreamRef.current.getTracks().forEach(t => t.stop()); } catch(e) {}
      localStreamRef.current = null;
    }
    try {
      const constraints = {
        audio: true,
        video: type === 'video' ? { facingMode: 'user' } : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      
      // Attach to local video element if video call
      if (type === 'video') {
        setTimeout(() => {
          const localVideo = document.getElementById('localVideo');
          if (localVideo) {
            localVideo.srcObject = stream;
            localVideo.muted = true;
            localVideo.play().catch(e => console.error('Local video play error:', e));
          }
        }, 300);
      }
      
      return stream;
    } catch (err) {
      console.error('Failed to get local stream:', err);
      alert('Could not access microphone/camera. Please check permissions.');
      throw err;
    }
  };

  const createPeerConnection = (targetId, stream, myId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        {
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turns:openrelay.metered.ca:443?transport=tcp'
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject'
        }
      ],
      iceCandidatePoolSize: 10
    });
    
    peerConnectionRef.current = pc;
    
    // Add local tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
    
    // Handle ICE candidates — include our own userId as senderId
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc_signal', {
          targetId,
          senderId: myId || currentUser?._id,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    // Log connection state for debugging
    pc.onconnectionstatechange = () => {
      console.log('WebRTC connection state:', pc.connectionState);
    };
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (!remoteStream) return;
      remoteStreamRef.current = remoteStream;
      // Toggle to trigger the useEffect that attaches stream to DOM elements
      setRemoteStreamReady(v => !v);
    };
    
    return pc;

  };

  const cleanUpCall = () => {
    stopRingtone();
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      } catch (e) {}
      localStreamRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {}
      peerConnectionRef.current = null;
    }
    remoteStreamRef.current = null;
    candidateQueueRef.current = [];
    setRemoteStreamReady(false);
    setActiveCall(null);
    setIncomingCallData(null);
  };

  const processCandidateQueue = async () => {
    const pc = peerConnectionRef.current;
    if (pc && pc.remoteDescription && candidateQueueRef.current.length > 0) {
      console.log(`Processing ${candidateQueueRef.current.length} queued ICE candidates`);
      for (const cand of candidateQueueRef.current) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.error('Error adding queued candidate:', e);
        }
      }
      candidateQueueRef.current = [];
    }
  };

  const handleStartCall = (type) => {
    if (!activePartner) return;
    setActiveCall(type);
    callTypeRef.current = type;
    startRingtone();
    
    // Relay call request through socket
    if (socket && currentUser) {
      if (activePartner.isGroup) {
        socket.emit('group_call', {
          callerId: currentUser._id,
          callerName: currentUser.name || 'User',
          groupId: activePartner._id,
          type
        });
      } else {
        socket.emit('call_user', {
          callerId: currentUser._id,
          callerName: currentUser.name || 'User',
          receiverId: activePartner._id,
          type
        });
      }
    }

    // Auto-timeout if call not answered (ring for 30 seconds)
    setTimeout(() => {
      setActiveCall((currentCall) => {
        if (currentCall && currentCall !== 'ongoing') {
          cleanUpCall();
          playBusyTone();
          alert(`${activePartner.name} did not answer.`);
        }
        return currentCall;
      });
    }, 30000);
  };

  const handleAnswerCall = async () => {
    stopRingtone();
    const callerId = incomingCallDataRef.current?.callerId;
    const callType = incomingCallDataRef.current?.type || 'audio';
    callTypeRef.current = callType;
    
    // Pre-initialize local stream immediately on user gesture
    // This is critical for browser audio/video permission and autoplay policy
    try {
      await startLocalStream(callType);
    } catch (err) {
      console.error('Could not start local stream on answer:', err);
      // Don't block the call accept even if stream fails
    }
    
    if (socket && callerId) {
      socket.emit('accept_call', { callerId, receiverId: currentUser?._id });
    }
    
    setIncomingCallData(null);
    setActiveCall('ongoing');
  };

  const handleDeclineCall = () => {
    stopRingtone();
    if (socket && incomingCallData) {
      socket.emit('decline_call', { callerId: incomingCallData.callerId });
    }
    setIncomingCallData(null);
  };

  const handleEndCall = () => {
    const partnerId = activePartnerRef.current?._id || incomingCallDataRef.current?.callerId;
    if (socket && partnerId) {
      socket.emit('end_call', { targetId: partnerId });
    }
    cleanUpCall();
  };

  // ────────────────── SEARCH FILTERING ──────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    await fetchNotes();
    setRefreshing(false);
  };

  const filteredUsersAndGroups = chatUsers.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const directOnlineUsers = chatUsers.filter(u => !u.isGroup);
  const activeRowUsers = chatUsers.filter(u => !u.isGroup && (onlineUsers.includes(u._id?.toString()) || notes.some(n => n._id?.toString() === u._id?.toString())));

  // Active note lookup helpers
  const myNoteObj = currentUser ? notes.find(n => n._id === currentUser._id) : null;

  if (loadingUsers) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm animate-pulse">Loading Messenger...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-955 flex flex-col overflow-hidden text-slate-800 dark:text-white">
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative overflow-hidden h-full">
        
        {/* ────────────────── CONVERSATIONS LIST SCREEN ────────────────── */}
        {!activePartner ? (
          <>
            {/* Header matches screenshot */}
            <div className="px-4.5 pt-[max(12px,env(safe-area-inset-top))] pb-2 flex items-center justify-between shrink-0 z-10 bg-white dark:bg-slate-950">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-[20px] font-black text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">
                Messages
              </h1>
              <div className="flex items-center gap-2">
                {/* Create Group Icon */}
                <button 
                  onClick={() => setShowCreateGroupModal(true)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-colors"
                  title="Create Group"
                >
                  <Users className="w-5.5 h-5.5" />
                </button>
              </div>
            </div>

            {/* Search messages... Rounded search bar */}
            <div className="px-5 py-2.5 shrink-0 bg-white dark:bg-slate-955">
              <div className="flex items-center bg-slate-100/80 dark:bg-slate-900 rounded-[2rem] px-4 py-1.5 border border-transparent shadow-3xs focus-within:bg-white dark:focus-within:bg-slate-900/60 focus-within:border-slate-150 dark:focus-within:border-slate-800 transition-all duration-200">
                <Search className="w-4.5 h-4.5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full bg-transparent border-none py-1.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-[14px] font-medium"
                />
              </div>
            </div>

            {/* Content list container */}
            <div className="flex-1 overflow-y-auto w-full px-4.5 pb-24 bg-white dark:bg-slate-950">
              <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
                
                {/* ── STORIES ROW — temporarily hidden, code preserved ── */}
                {false && (() => {
                  const myStoryUser = stories.find(s => s._id?.toString() === currentUser?._id?.toString());
                  const STORY_BG_PRESETS = [
                    'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
                    'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
                    'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
                    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                    'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
                    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                  ];
                  return (
                    <div className="flex gap-4 overflow-x-auto py-4 pb-3 scrollbar-none snap-x px-1">

                      {/* Your Story circle */}
                      <div className="flex flex-col items-center gap-1.5 shrink-0 snap-start">
                        <button
                          onClick={() => {
                            if (myStoryUser) {
                              openStoryViewer(myStoryUser);
                            } else {
                              setShowStoryCreator(true);
                            }
                          }}
                          className="relative focus:outline-none transition-transform active:scale-95"
                        >
                          {/* Gradient story ring if has story */}
                          <div className={`p-[2.5px] rounded-full ${myStoryUser ? '' : 'bg-slate-200 dark:bg-slate-800'}`}
                            style={myStoryUser ? { background: 'linear-gradient(135deg, #f97316, #ec4899, #7C3AED)' } : {}}>
                            <div className="p-[2px] bg-white dark:bg-slate-900 rounded-full">
                              {currentUser?.profilePic ? (
                                <img
                                  src={getProfilePicUrl(currentUser.profilePic)}
                                  alt="Your Story"
                                  className="w-14 h-14 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg">
                                  {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* Add story plus button */}
                          {!myStoryUser && (
                            <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#7C3AED] text-white border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center shadow-md">
                              <Plus className="w-3 h-3" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 max-w-[65px] truncate">
                          {myStoryUser ? 'My story' : 'Add story'}
                        </span>
                      </div>

                      {/* Other users' stories */}
                      {stories.filter(s => s._id?.toString() !== currentUser?._id?.toString()).map((storyUser) => (
                        <button
                          key={storyUser._id}
                          onClick={() => openStoryViewer(storyUser)}
                          className="flex flex-col items-center gap-1.5 shrink-0 snap-start active:scale-95 transition-transform"
                        >
                          <div className="p-[2.5px] rounded-full" style={{ background: 'linear-gradient(135deg, #f97316, #ec4899, #7C3AED)' }}>
                            <div className="p-[2px] bg-white dark:bg-slate-900 rounded-full">
                              {storyUser.profilePic ? (
                                <img
                                  src={getProfilePicUrl(storyUser.profilePic)}
                                  alt={storyUser.name}
                                  className="w-14 h-14 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg">
                                  {storyUser.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-350 max-w-[65px] truncate">
                            {storyUser.name?.split(' ')[0]}
                          </span>
                        </button>
                      ))}

                      {/* Notes row (existing contacts with notes — thought bubble style) */}
                      {activeRowUsers.map((user) => {
                        const userNoteObj = notes.find(n => n._id === user._id);
                        const hasStory = stories.some(s => s._id?.toString() === user._id?.toString());
                        if (hasStory) return null; // Already shown in story row
                        return (
                          <button
                            key={user._id}
                            onClick={() => handleOpenChat(user)}
                            className="flex flex-col items-center gap-1.5 shrink-0 snap-start relative active:scale-95 transition-transform"
                          >
                            {/* Note thought bubble */}
                            {userNoteObj && (
                              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-850 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md border border-slate-150/40 dark:border-slate-800/80 whitespace-nowrap max-w-[84px] truncate leading-tight z-10">
                                {userNoteObj.note}
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white dark:bg-slate-850 rotate-45 border-r border-b border-slate-150/40 dark:border-slate-800/80" />
                              </div>
                            )}
                            <div className="relative">
                              {user.profilePic ? (
                                <img src={getProfilePicUrl(user.profilePic)} alt={user.name} className="w-14 h-14 rounded-full object-cover border border-slate-150/40 dark:border-slate-800" />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg border border-slate-100 dark:border-slate-800">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {onlineUsers.includes(user._id?.toString()) && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                              )}
                            </div>
                            <span className="text-[11px] font-black text-slate-700 dark:text-slate-350 max-w-[65px] truncate">
                              {user.name.split(' ')[0]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}


                {/* Combined Conversation List */}
                <div className="mt-4 space-y-1">
                  {filteredUsersAndGroups.length === 0 && globalSearchResults.length === 0 ? (
                    <div className="py-10 text-center text-slate-400">
                      <p className="font-bold text-sm">No conversations found</p>
                      {isSearchingGlobal ? (
                        <p className="text-xs text-slate-500 mt-1 animate-pulse">Searching users globally...</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Start typing a name or username above to search globally.</p>
                      )}
                    </div>
                  ) : (
                    <>
                      {filteredUsersAndGroups.map((chat) => (
                        <div
                          key={chat._id}
                          onClick={() => handleOpenChat(chat)}
                          className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all rounded-2xl cursor-pointer active:scale-[0.98] border border-transparent hover:border-slate-100 dark:hover:border-slate-850"
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            {/* Avatar Indicator */}
                            <div className="relative flex-shrink-0">
                              {chat.isGroup ? (
                                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-[#7C3AED] dark:text-indigo-400 flex items-center justify-center border border-indigo-200/40 dark:border-indigo-900/40 shadow-3xs">
                                  <Users className="w-5.5 h-5.5" />
                                </div>
                              ) : chat.profilePic ? (
                                <img
                                  src={getProfilePicUrl(chat.profilePic)}
                                  alt={chat.name}
                                  className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg">
                                  {chat.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              {/* Online badge for direct chats only */}
                              {!chat.isGroup && onlineUsers.includes(chat._id?.toString()) && (
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                              )}
                            </div>
                            
                            {/* Chat Detail text */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-black text-slate-800 dark:text-slate-100 text-[15px] truncate leading-tight flex items-center gap-1">
                                <span className="truncate">{chat.name}</span>
                                {(chat.verificationBadge === 'blue' || chat.verificationBadge === 'purple' || chat.verificationBadge === 'golden') && (
                                  <VerifiedBadge type={chat.verificationBadge === 'golden' ? 'golden' : 'purple'} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                              </h3>
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-1 leading-none">
                                {chat.lastMessage || 'No messages yet'}
                              </p>
                            </div>
                          </div>

                          {/* Right details: relative time and unread badge */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-2">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                              {formatRelativeTime(chat.lastMessageTime)}
                            </span>
                            {chat.unreadCount > 0 && (
                              <span className="w-5 h-5 bg-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-3xs">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {globalSearchResults.length > 0 && (
                        <div className="mt-6">
                          <h3 className="px-3.5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Global Users (Search Results)
                          </h3>
                          {globalSearchResults.map((user) => (
                            <div
                              key={user._id}
                              onClick={() => handleOpenChat({ ...user, isGroup: false })}
                              className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all rounded-2xl cursor-pointer active:scale-[0.98] border border-transparent hover:border-slate-100 dark:hover:border-slate-850"
                            >
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="relative flex-shrink-0">
                                  {user.profilePic ? (
                                    <img
                                      src={getProfilePicUrl(user.profilePic)}
                                      alt={user.name}
                                      className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white font-black text-lg">
                                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h2 className="text-[14px] font-extrabold text-slate-900 dark:text-white truncate flex items-center gap-1">
                                      <span className="truncate">{user.name}</span>
                                      {(user.verificationBadge === 'blue' || user.verificationBadge === 'purple' || user.verificationBadge === 'golden') && (
                                        <VerifiedBadge type={user.verificationBadge === 'golden' ? 'golden' : 'purple'} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                                      )}
                                    </h2>
                                  </div>
                                  <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                    Click to start a conversation
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

              </PullToRefresh>
            </div>
          </>) : (
            // ────────────────── ACTIVE CONVERSATION SCREEN ──────────────────
            <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/35">
            {/* Chat Room Header */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 px-4 pt-[max(10px,env(safe-area-inset-top))] pb-2.5 flex items-center justify-between shrink-0 shadow-sm z-20 sticky top-0">
              <div 
                className={`flex items-center gap-2 sm:gap-3 ${!activePartner.isGroup ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => {
                  if (!activePartner.isGroup && setActiveTab && setActivePublicProfileUserId) {
                    setActivePublicProfileUserId(activePartner._id);
                    setActiveTab('PublicProfile');
                  }
                }}
              >
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePartner(null);
                    if (setActiveChatPartner) setActiveChatPartner(null);
                    fetchUsers(); 
                  }} 
                  className="p-2 -ml-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                {/* Avatar */}
                <div className="relative">
                  {activePartner.isGroup ? (
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[#7C3AED] dark:text-indigo-400 flex items-center justify-center border border-indigo-200/40">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : activePartner.profilePic ? (
                    <img
                      src={getProfilePicUrl(activePartner.profilePic)}
                      alt={activePartner.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white border border-indigo-100 dark:border-slate-800 shadow-sm flex-shrink-0 font-black">
                      {activePartner.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!activePartner.isGroup && onlineUsers.includes(activePartner._id?.toString()) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                  )}
                </div>

                <div>
                  <h1 className="text-base sm:text-lg font-black text-slate-855 dark:text-white flex items-center gap-1.5 leading-tight">
                    <span>{activePartner.name}</span>
                    {(activePartner.verificationBadge === 'blue' || activePartner.verificationBadge === 'purple' || activePartner.verificationBadge === 'golden') && (
                      <VerifiedBadge type={activePartner.verificationBadge === 'golden' ? 'golden' : 'purple'} iconClassName="w-4 h-4 flex-shrink-0" />
                    )}
                  </h1>
                  {activePartner.isGroup || onlineUsers.includes(activePartner._id?.toString()) ? (
                    <p className="text-[10.5px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5 animate-pulse">
                      Active Now
                    </p>
                  ) : (
                    <p className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      Offline
                    </p>
                  )}
                </div>
              </div>

              {/* Options Menu on Header Right */}
              <div className="relative">
                <button
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350 active:scale-95 transition-transform cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-1.5 z-40 animate-fade-in text-left">
                      <button
                        onClick={() => {
                          setShowChatMenu(false);
                          setActiveModal('delete_chat');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-left"
                      >
                        <span>Delete Conversation</span>
                      </button>
                      
                      {!activePartner.isGroup && (
                        <>
                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setActiveModal('block_user');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-left"
                          >
                            <span>Block User</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setShowChatMenu(false);
                              setActiveModal('report_user');
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-500 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors text-left"
                          >
                            <span>Report User</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Conversation Messages Scroll Body */}
            <div 
              className={`flex-1 overflow-y-auto p-4 space-y-4 pb-4 transition-colors duration-300 ${
                localStorage.getItem('chat_wallpaper') === 'solid_dark'
                  ? 'bg-black'
                  : localStorage.getItem('chat_wallpaper') === 'gradient_lavender'
                    ? 'bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-950/40 dark:to-indigo-950/40'
                    : localStorage.getItem('chat_wallpaper') === 'gradient_sunset'
                      ? 'bg-gradient-to-br from-amber-50 to-rose-50 dark:from-[#2e262c] dark:to-[#17161b]'
                      : 'bg-slate-50/50 dark:bg-slate-900/35'
              }`}
            >
              {loadingChat ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mb-2 shadow-xs">
                    {activePartner.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-black text-slate-800 dark:text-white flex items-center justify-center gap-1">
                    <span>{activePartner.name}</span>
                    {(activePartner.verificationBadge === 'blue' || activePartner.verificationBadge === 'purple' || activePartner.verificationBadge === 'golden') && (
                      <VerifiedBadge type={activePartner.verificationBadge === 'golden' ? 'golden' : 'purple'} iconClassName="w-4 h-4 flex-shrink-0" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Start your conversation with {activePartner.name} now.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const myId = currentUser?._id ? currentUser._id.toString() : '';
                  const msgSenderId = msg.sender && (typeof msg.sender === 'object' ? (msg.sender._id ? msg.sender._id.toString() : '') : msg.sender.toString());
                  const isUser = Boolean(myId && msgSenderId && msgSenderId === myId);
                  const senderName = isUser 
                    ? (currentUser?.name || 'Me') 
                    : (activePartner.isGroup 
                        ? (msg.sender && typeof msg.sender === 'object' ? msg.sender.name : 'Member')
                        : activePartner.name);
                  const senderPic = isUser 
                    ? currentUser?.profilePic 
                    : (activePartner.isGroup 
                        ? (msg.sender && typeof msg.sender === 'object' ? msg.sender.profilePic : '')
                        : activePartner.profilePic);
                  const isLastMessage = i === messages.length - 1;

                  return (
                    <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}>
                      <div className={`flex gap-2 max-w-[80%] items-end ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {!isUser && (
                          <div className="relative flex-shrink-0">
                            {senderPic ? (
                              <img
                                src={getProfilePicUrl(senderPic)}
                                alt="sender"
                                className="w-8 h-8 rounded-full object-cover shadow-xs border border-slate-100 dark:border-slate-800"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex items-center justify-center text-white text-[10px] font-black shadow-xs">
                                {senderName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex flex-col group/msg relative">
                          {/* Display sender name for group chats */}
                          {!isUser && activePartner.isGroup && (
                            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold block mb-0.5 ml-1 leading-none">{senderName}</span>
                          )}
                          
                          {/* Speech bubble */}
                          <div 
                            id={`msg-${msg._id}`}
                            onClick={() => setExpandedMessageId(expandedMessageId === msg._id ? null : msg._id)}
                            className={`rounded-2xl relative shadow-3xs cursor-pointer select-none transition-all active:scale-[0.99] ${
                              msg.isUnsent
                                ? 'py-2 px-3.5 bg-slate-100/80 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-2xl'
                                : msg.messageType === 'image' || msg.messageType === 'voice'
                                  ? 'bg-transparent overflow-hidden' 
                                  : isUser 
                                    ? 'py-2 px-3.5 text-white rounded-br-sm' 
                                    : 'py-2 px-3.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200/40 dark:border-slate-800/80 shadow-3xs'
                            }`}
                            style={
                              !msg.isUnsent && isUser && msg.messageType !== 'image' && msg.messageType !== 'voice'
                                ? { backgroundColor: localStorage.getItem('chat_theme') || '#7C3AED' }
                                : {}
                            }
                          >
                            {/* Quoted Reply Card on top of message */}
                            {msg.replyTo && msg.replyTo.content && !msg.isUnsent && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  scrollToMessage(msg.replyTo.messageId);
                                }}
                                className={`mb-1.5 px-2.5 py-1 rounded-lg border-l-4 text-left select-none cursor-pointer transition-opacity hover:opacity-85 ${
                                  isUser 
                                    ? 'bg-black/20 border-amber-300 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-800/90 border-[#7C3AED] text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                <p className={`text-[10px] font-black leading-tight ${isUser ? 'text-amber-200' : 'text-[#7C3AED] dark:text-purple-400'}`}>
                                  {msg.replyTo.senderName || 'User'}
                                </p>
                                <p className="text-[11px] truncate opacity-90 leading-tight mt-0.5 font-medium">
                                  {msg.replyTo.messageType === 'image' ? '📷 Photo' : msg.replyTo.messageType === 'voice' ? '🎤 Voice Message' : msg.replyTo.content}
                                </p>
                              </div>
                            )}

                            {msg.isUnsent ? (
                              <p className="text-[13px] italic text-slate-400 dark:text-slate-500 py-0.5 select-none flex items-center gap-1.5">
                                <span className="opacity-75">🚫</span>
                                <span>This message was unsent</span>
                              </p>
                            ) : msg.messageType === 'image' ? (
                              <div className="max-w-xs rounded-2xl overflow-hidden border border-slate-200/40 dark:border-slate-800 shadow-md">
                                <img 
                                  src={getProfilePicUrl(msg.content)} 
                                  alt="Shared image" 
                                  className="max-h-60 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(getProfilePicUrl(msg.content), '_blank');
                                  }}
                                />
                              </div>
                            ) : msg.messageType === 'voice' ? (
                              <AudioPlayer src={getProfilePicUrl(msg.content)} />
                            ) : (
                              <p className="text-[14px] leading-snug break-words font-medium">
                                {msg.content}
                                {msg.isEdited && (
                                  <span className="text-[10px] opacity-75 italic ml-1 select-none font-normal">(edited)</span>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Quick Message Actions / Timestamp */}
                          <div className={`flex items-center gap-2 mt-1 px-1 transition-all ${isUser ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] font-bold text-slate-400">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            
                            {!msg.isUnsent && (
                              <>
                                <span className="text-[9px] text-slate-300 dark:text-slate-700 font-bold">•</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMessageActionTarget(msg);
                                    setActiveModal('message_actions');
                                  }}
                                  className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5"
                                >
                                  <span>Options</span>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Status Indicator for user's own last message */}
                          {isUser && isLastMessage && (
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 text-right flex items-center justify-end select-none">
                              {msg.isRead ? (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 border border-blue-500/20 shadow-xs">
                                  <CheckCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                  <span className="text-[10px] font-black">Seen</span>
                                  {!activePartner.isGroup && activePartner.profilePic && (
                                    <img 
                                      src={getProfilePicUrl(activePartner.profilePic)} 
                                      alt="seen" 
                                      className="w-3.5 h-3.5 rounded-full object-cover border border-white dark:border-slate-800 shrink-0"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  )}
                                </div>
                              ) : onlineUsers.includes(activePartner._id?.toString()) ? (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-slate-400 dark:text-slate-400">
                                  <CheckCheck className="w-3 h-3 text-slate-400" strokeWidth={2} />
                                  <span className="text-[10px] font-bold">Delivered</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-slate-400 dark:text-slate-500">
                                  <Check className="w-3 h-3 text-slate-400" strokeWidth={2} />
                                  <span className="text-[10px] font-medium">Sent</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicators */}
              {isPartnerTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex gap-2 items-end">
                    {activePartner.profilePic ? (
                      <img
                        src={getProfilePicUrl(activePartner.profilePic)}
                        alt="typing"
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 dark:border-slate-800 shadow-xs"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-brand-500 flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black shadow-xs">
                        {activePartner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/45 dark:border-slate-800 p-3.5 px-4 rounded-2xl rounded-bl-sm flex items-center gap-1 shadow-3xs">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Group Typing Indicator */}
              {typingGroupMembers.length > 0 && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-white dark:bg-slate-900 border border-slate-250/20 dark:border-slate-800 px-3.5 py-2 rounded-2xl flex items-center gap-2 shadow-3xs">
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold">
                      {typingGroupMembers.join(', ')} {typingGroupMembers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                    <div className="flex items-center gap-0.5">
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Bottom Input form panel */}
            <div className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-900 px-2 sm:px-3 py-2 sm:py-2.5 shrink-0 pb-safe pb-3 sm:pb-4 relative w-full overflow-hidden">
              {/* Custom Emoji Picker Popover */}
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-16 right-4 w-72 h-52 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 overflow-y-auto grid grid-cols-6 gap-1 scrollbar-thin select-none"
                >
                  {EMOJIS.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="text-2xl p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-90 transition-all text-center flex items-center justify-center"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Hidden file input for image uploads */}
              <input 
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* Replying Preview Banner */}
              {replyingTo && (
                <div className="w-full max-w-4xl mx-auto mb-2 flex items-center justify-between bg-purple-50 dark:bg-slate-900 border-l-4 border-[#7C3AED] px-3.5 py-2 rounded-r-2xl shadow-xs animate-fade-in select-none">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <CornerUpLeft className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black text-[#7C3AED] dark:text-purple-400 block leading-tight">
                        Replying to {replyingTo.senderName || 'User'}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                        {replyingTo.messageType === 'image' ? '📷 Photo' : replyingTo.messageType === 'voice' ? '🎤 Voice Note' : replyingTo.content}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="p-1 hover:bg-purple-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Editing Preview Banner */}
              {editingMessage && (
                <div className="w-full max-w-4xl mx-auto mb-2 flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 px-3.5 py-2 rounded-r-2xl shadow-xs animate-fade-in select-none">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 block leading-tight">
                        Editing message
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">
                        {editingMessage.content}
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageInput('');
                    }}
                    className="p-1 hover:bg-amber-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2 w-full max-w-4xl mx-auto">
                {isRecording ? (
                  // Recording UI
                  <div className="flex-1 min-w-0 flex items-center justify-between bg-red-550/10 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-full px-3.5 py-1.5 transition-all duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <span className="text-red-500 dark:text-red-400 text-xs sm:text-sm font-black tracking-wider truncate">
                        Recording: {formatRecordTime(recordingDuration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => stopVoiceRecording(false)}
                        className="p-1.5 sm:p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-full transition-colors active:scale-95 cursor-pointer" 
                        title="Cancel Recording"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => stopVoiceRecording(true)}
                        className="p-1.5 sm:p-2 text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors active:scale-95 cursor-pointer" 
                        title="Send Voice Note"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // Normal input UI
                  <>
                    <div className="flex items-center gap-0.5 sm:gap-1 text-slate-400 dark:text-slate-500 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className={`p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer ${isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`} 
                        title="Share Image"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        ) : (
                          <Image className="w-5 h-5" />
                        )}
                      </button>
                      <button 
                        type="button" 
                        onClick={startVoiceRecording}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-indigo-600 active:scale-95 transition-all cursor-pointer" 
                        title="Record Voice"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0 flex items-center bg-slate-100 dark:bg-slate-900 rounded-full pl-3.5 sm:pl-4 pr-1.5 sm:pr-2 py-0.5 border border-transparent focus-within:bg-white dark:focus-within:bg-slate-950 focus-within:border-slate-200 dark:focus-within:border-slate-800 transition-all duration-200 shadow-inner">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 w-full bg-transparent border-none py-2 sm:py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 outline-none text-sm sm:text-[15px] font-medium"
                      />
                      <button 
                        type="button" 
                        ref={emojiButtonRef}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`p-1.5 transition-colors shrink-0 cursor-pointer ${showEmojiPicker ? 'text-[#7C3AED]' : 'text-slate-400 dark:text-slate-500 hover:text-[#7C3AED]'}`} 
                        title="Emojis"
                      >
                        <Smile className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
                      </button>
                    </div>

                    {messageInput.trim() ? (
                      <button
                        type="submit"
                        className="w-9.5 h-9.5 sm:w-10 sm:h-10 bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-95 text-white rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm cursor-pointer"
                        title="Send Message"
                      >
                        <Send className="w-4.5 h-4.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendThumbsUp}
                        className="w-9.5 h-9.5 sm:w-10 sm:h-10 hover:bg-slate-100 dark:hover:bg-slate-900 text-[#7C3AED] active:scale-90 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer"
                        title="Send Like"
                      >
                        <ThumbsUp className="w-5 h-5 fill-[#7C3AED]" />
                      </button>
                    )}
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* ────────────────── CALLING SCREENS overlay ────────────────── */}
        {/* Outgoing Call */}
        {activeCall && activeCall !== 'ongoing' && (
          <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-between py-20 px-6 text-white animate-fade-in">
            <div className="flex flex-col items-center gap-2 mt-12">
              <span className="text-emerald-500 font-black tracking-widest text-xs uppercase animate-pulse">
                Zenivio Secure Call
              </span>
              <h2 className="text-3xl font-black mt-4">{activePartner?.name}</h2>
              <p className="text-slate-400 text-sm font-medium animate-pulse mt-1">
                Ringing...
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-[#7C3AED]/20 rounded-full scale-125 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-[#7C3AED]/30 rounded-full scale-150 animate-pulse" />
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#5B21B6] flex items-center justify-center relative border-4 border-[#7C3AED]/50 shadow-2xl overflow-hidden">
                {activePartner?.profilePic ? (
                  <img
                    src={getProfilePicUrl(activePartner.profilePic)}
                    alt="partner"
                    className="w-full h-full object-cover animate-pulse"
                  />
                ) : (
                  activeCall === 'video' ? (
                    <Video className="w-14 h-14 text-white animate-pulse" strokeWidth={1.5} />
                  ) : (
                    <Phone className="w-14 h-14 text-white" strokeWidth={1.5} />
                  )
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8 w-full max-w-xs">
              {activeCall === 'video' && (
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-550 animate-pulse" />
                  <span className="text-xs font-bold text-slate-350">Front Camera Activated</span>
                </div>
              )}
              <button 
                onClick={handleEndCall}
                className="w-16 h-16 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40"
              >
                <PhoneOff className="w-7 h-7 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Incoming Call Screen */}
        {incomingCallData && (
          <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-lg flex flex-col items-center justify-between py-20 px-6 text-white animate-fade-in">
            <div className="flex flex-col items-center gap-2 mt-12">
              <span className="text-emerald-500 font-black tracking-widest text-xs uppercase animate-pulse">
                Incoming {incomingCallData.type === 'video' ? 'Video' : 'Audio'} Call
              </span>
              <h2 className="text-3xl font-black mt-4">{incomingCallData.callerName}</h2>
              <p className="text-slate-400 text-sm font-medium animate-pulse mt-1">
                {incomingCallData.isGroup ? 'Zenivio Group Call' : 'Private Call'}
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full scale-125 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 bg-emerald-500/30 rounded-full scale-150 animate-pulse" />
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center relative border-4 border-emerald-450 shadow-2xl overflow-hidden">
                {incomingCallData.type === 'video' ? (
                  <Video className="w-14 h-14 text-white animate-pulse" strokeWidth={1.5} />
                ) : (
                  <Phone className="w-14 h-14 text-white" strokeWidth={1.5} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-8 mb-8 w-full max-w-xs justify-center">
              {/* Decline Button */}
              <button 
                onClick={handleDeclineCall}
                className="w-15 h-15 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40"
              >
                <PhoneOff className="w-6.5 h-6.5 text-white" />
              </button>
              {/* Accept Button */}
              <button 
                onClick={handleAnswerCall}
                className="w-15 h-15 bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40"
              >
                <Phone className="w-6.5 h-6.5 text-white fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* ─────── Ongoing Call Screen ─────── */}
        {activeCall === 'ongoing' && (
          <div className="fixed inset-0 z-[100] bg-black text-white animate-fade-in" style={{ fontFamily: 'inherit' }}>

            {/* ── VIDEO CALL LAYOUT ── */}
            {callTypeRef.current === 'video' ? (
              <>
                {/* Remote video — full screen background */}
                <video
                  id="remoteVideo"
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover bg-black"
                  style={{ zIndex: 1 }}
                />
                {/* Fallback overlay if no video yet */}
                {!remoteStreamReady && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950" style={{ zIndex: 2 }}>
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-2xl overflow-hidden">
                      {activePartner?.profilePic
                        ? <img src={getProfilePicUrl(activePartner.profilePic)} className="w-full h-full object-cover" alt="partner" />
                        : <UserIcon className="w-14 h-14 text-white" />}
                    </div>
                    <p className="text-white font-bold text-lg">{activePartner?.name}</p>
                    <p className="text-emerald-400 text-xs mt-1 animate-pulse">Connecting video...</p>
                  </div>
                )}

                {/* Top info bar */}
                <div className="absolute top-0 left-0 right-0 flex flex-col items-center pt-12 pb-6" style={{ zIndex: 10, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)' }}>
                  <p className="text-white font-black text-xl">{activePartner?.name}</p>
                  <p className="text-emerald-400 text-xs font-bold mt-1">{formatDuration(callDuration)}</p>
                </div>

                {/* Local video — small corner overlay (bottom-right) */}
                <div className="absolute bottom-28 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-slate-900" style={{ zIndex: 10 }}>
                  <video
                    id="localVideo"
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-10 gap-8" style={{ zIndex: 10, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}>
                  <button
                    onClick={handleEndCall}
                    className="w-16 h-16 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-lg shadow-rose-500/50"
                  >
                    <PhoneOff className="w-7 h-7 text-white" />
                  </button>
                </div>
              </>
            ) : (
              /* ── AUDIO CALL LAYOUT ── */
              <div className="flex flex-col items-center justify-between w-full h-full bg-gradient-to-b from-slate-900 to-slate-950 py-20 px-6">
                {/* Hidden audio element for remote stream */}
                <audio
                  id="remoteAudio"
                  ref={remoteAudioRef}
                  autoPlay
                  playsInline
                  style={{ display: 'none' }}
                />

                <div className="flex flex-col items-center gap-1 mt-8">
                  <span className="text-emerald-500 font-black tracking-widest text-xs uppercase animate-pulse">Connected</span>
                  <h2 className="text-3xl font-black mt-3 text-white">{activePartner?.name}</h2>
                  <p className="text-emerald-400 text-sm font-bold mt-1">{formatDuration(callDuration)}</p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/20 scale-125 animate-ping" style={{ animationDuration: '2.5s' }} />
                  <div className="absolute inset-0 rounded-full bg-emerald-500/10 scale-150 animate-pulse" />
                  <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center relative border-4 border-indigo-400/30 shadow-2xl overflow-hidden">
                    {activePartner?.profilePic
                      ? <img src={getProfilePicUrl(activePartner.profilePic)} className="w-full h-full object-cover" alt="partner" />
                      : <UserIcon className="w-16 h-16 text-white" />}
                  </div>
                </div>

                <button
                  onClick={handleEndCall}
                  className="w-18 h-18 bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl shadow-rose-500/40 mb-4"
                  style={{ width: '4.5rem', height: '4.5rem' }}
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Story Creator Modal */}
        <StoryCreatorModal
          isOpen={showStoryCreator}
          onClose={() => setShowStoryCreator(false)}
          onStoryCreated={fetchStories}
        />

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
            onUserClick={(uid) => {
              if (setActivePublicProfileUserId) setActivePublicProfileUserId(uid);
              if (setActiveTab) setActiveTab('PublicProfile');
            }}
            onDeleteStory={() => fetchStories()}
          />
        )}

        {/* ────────────────── STATUS NOTES EDITING MODAL ────────────────── */}

        {showNoteModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-white">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-150/40 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-black">Your Status Note</h3>
                <button onClick={() => setShowNoteModal(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-405">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400 dark:text-slate-400 font-bold leading-normal">
                  Share what's on your mind. Friends will see your note above your avatar for 24 hours. (Max 60 chars)
                </p>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 shadow-inner">
                  <textarea 
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value.slice(0, 60))}
                    placeholder="Share a thought..."
                    className="w-full bg-transparent border-none outline-none text-[15px] font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:ring-0 resize-none h-16"
                  />
                  <div className="text-right text-[10px] text-slate-400 font-black mt-1">
                    {noteInput.length} / 60
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {myNoteObj && (
                    <button 
                      onClick={async () => {
                        setNoteInput('');
                        try {
                          const token = localStorage.getItem('token');
                          await fetch(`${API_BASE}/api/messages/note`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                            body: JSON.stringify({ note: '' })
                          });
                          setShowNoteModal(false);
                          fetchNotes();
                        } catch(e) {}
                      }}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100/70 text-rose-600 rounded-xl text-xs font-black transition-colors"
                    >
                      Delete Note
                    </button>
                  )}
                  <button 
                    onClick={handleSaveNote}
                    disabled={!noteInput.trim()}
                    className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ────────────────── GROUP CREATION MODAL ────────────────── */}
        {showCreateGroupModal && (
          <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-slate-800 dark:text-white">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-150/40 dark:border-slate-800 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-scale-up">
              
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-black">Create Group Chat</h3>
                <button 
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupNameInput('');
                    setSelectedGroupMembers([]);
                    setGroupSearchQuery('');
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Group Name input */}
              <div className="px-6 py-4 space-y-2 shrink-0 border-b border-slate-100 dark:border-slate-800/80">
                <label className="text-xs font-black text-slate-400 dark:text-slate-400 uppercase tracking-wide">Group Name</label>
                <input 
                  type="text"
                  required
                  placeholder="Enter group name..."
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500/50 shadow-inner"
                />
              </div>

              {/* Search contacts for group */}
              <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center bg-slate-50 dark:bg-slate-950 rounded-xl px-3 py-1 border border-slate-205 dark:border-slate-800 shadow-inner">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input 
                    type="text"
                    placeholder="Search friends..."
                    value={groupSearchQuery}
                    onChange={(e) => setGroupSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none py-1.5 text-xs outline-none focus:ring-0"
                  />
                </div>
              </div>

              {/* Contacts checklist */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-slate-50/20 dark:bg-slate-955/5">
                {directOnlineUsers
                  .filter(u => u.name.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                  .map((user) => {
                    const isSelected = selectedGroupMembers.includes(user._id.toString());
                    return (
                      <div 
                        key={user._id} 
                        onClick={() => toggleGroupMemberSelection(user._id.toString())}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-2xl transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          {user.profilePic ? (
                            <img src={getProfilePicUrl(user.profilePic)} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-50 to-brand-500 flex items-center justify-center text-white font-black text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-sm leading-tight flex items-center gap-1">
                              {(user.verificationBadge === 'blue' || user.verificationBadge === 'purple' || user.verificationBadge === 'golden') && (
                                <VerifiedBadge type={user.verificationBadge === 'golden' ? 'golden' : 'purple'} iconClassName="w-3.5 h-3.5 flex-shrink-0" />
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Custom Circular Checkbox */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-[#7C3AED] border-[#7C3AED] text-white shadow-3xs' 
                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Submit footer */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end shrink-0 gap-3">
                <button 
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupNameInput('');
                    setSelectedGroupMembers([]);
                    setGroupSearchQuery('');
                  }}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-605 dark:text-slate-300 rounded-xl text-xs font-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateGroup}
                  disabled={!groupNameInput.trim() || selectedGroupMembers.length === 0}
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20 active:scale-95 transition-transform"
                >
                  Create
                </button>
              </div>

            </div>
          </div>
        )}

      {/* React Modals for Messenger actions (replaces window.confirm/prompt) */}
      {activeModal && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-scale-pulse-glow text-left">
            
            {activeModal === 'delete_chat' && (
              <>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Conversation</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                  Are you sure you want to delete all chat history with this user? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteChatConfirm}
                    className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {activeModal === 'block_user' && (
              <>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Block User</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                  Are you sure you want to block {activePartner?.name}? You will no longer receive messages or calls from them.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveModal(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleBlockUserConfirm}
                    className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-black text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Block User
                  </button>
                </div>
              </>
            )}

            {activeModal === 'delete_story' && (
              <>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">Delete Story</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-5 leading-relaxed">
                  Are you sure you want to permanently delete this story?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => { setActiveModal(null); setTargetStoryId(null); }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteStoryConfirm}
                    className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-white text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

            {(activeModal === 'report_user' || activeModal === 'report_message') && (
              <>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">
                  {activeModal === 'report_user' ? 'Report User' : 'Report Message'}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold mb-4 leading-relaxed">
                  Please select a reason for reporting this.
                  {activeModal === 'report_user' && ' Reporting will also block them immediately for your safety.'}
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    { value: 'spam', label: 'Spam, scams or fraud' },
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
                        name="msgReportReason" 
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
                    onClick={() => { setActiveModal(null); setTargetMessageId(null); }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={activeModal === 'report_user' ? handleReportUserSubmit : handleReportMessageSubmit}
                    className="flex-1 py-2.5 bg-red-655 hover:bg-red-700 text-black text-xs font-black rounded-xl cursor-pointer transition-colors shadow-md shadow-red-500/10"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}

            {activeModal === 'message_actions' && messageActionTarget && (
              <>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">Message Options</h3>
                
                <div className="space-y-2 mb-4">
                  {/* Reply */}
                  <button
                    onClick={() => {
                      const target = messageActionTarget;
                      const targetSenderId = target.sender?._id ? target.sender._id.toString() : (target.sender ? target.sender.toString() : '');
                      const isTargetUser = targetSenderId === (currentUser?._id ? currentUser._id.toString() : '');
                      const targetSenderName = isTargetUser ? 'You' : (target.sender?.name || activePartner?.name || 'User');
                      setReplyingTo({
                        messageId: target._id,
                        content: target.content,
                        senderName: targetSenderName,
                        messageType: target.messageType
                      });
                      setActiveModal(null);
                      setMessageActionTarget(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors text-left"
                  >
                    <CornerUpLeft className="w-5 h-5 text-indigo-500" />
                    <span>Reply to Message</span>
                  </button>

                  {/* Edit Message (if sender, unread, not unsent, text only) */}
                  {((messageActionTarget.sender?._id ? messageActionTarget.sender._id.toString() : (messageActionTarget.sender ? messageActionTarget.sender.toString() : '')) === (currentUser?._id ? currentUser._id.toString() : '')) && 
                   !messageActionTarget.isRead && !messageActionTarget.isUnsent && messageActionTarget.messageType === 'text' && (
                    <button
                      onClick={() => {
                        setEditingMessage(messageActionTarget);
                        setMessageInput(messageActionTarget.content);
                        setActiveModal(null);
                        setMessageActionTarget(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors text-left"
                    >
                      <Edit3 className="w-5 h-5 text-amber-500" />
                      <span>Edit Message (Unseen)</span>
                    </button>
                  )}

                  {/* Unsend for Everyone (if sender, not unsent) */}
                  {((messageActionTarget.sender?._id ? messageActionTarget.sender._id.toString() : (messageActionTarget.sender ? messageActionTarget.sender.toString() : '')) === (currentUser?._id ? currentUser._id.toString() : '')) && 
                   !messageActionTarget.isUnsent && (
                    <button
                      onClick={() => {
                        handleDeleteMessage(messageActionTarget._id, 'for_everyone');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 font-bold text-sm transition-colors text-left"
                    >
                      <Undo className="w-5 h-5 text-rose-500" />
                      <span>Unsend for Everyone</span>
                    </button>
                  )}

                  {/* Delete for You */}
                  <button
                    onClick={() => {
                      handleDeleteMessage(messageActionTarget._id, 'for_me');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm transition-colors text-left"
                  >
                    <Trash2 className="w-5 h-5 text-slate-500" />
                    <span>Delete for You</span>
                  </button>

                  {/* Report Message (if not sender and not unsent) */}
                  {((messageActionTarget.sender?._id ? messageActionTarget.sender._id.toString() : (messageActionTarget.sender ? messageActionTarget.sender.toString() : '')) !== (currentUser?._id ? currentUser._id.toString() : '')) && 
                   !messageActionTarget.isUnsent && (
                    <button
                      onClick={() => {
                        setTargetMessageId(messageActionTarget._id);
                        setActiveModal('report_message');
                        setMessageActionTarget(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 font-bold text-sm transition-colors text-left"
                    >
                      <Star className="w-5 h-5 text-amber-500" />
                      <span>Report Message</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveModal(null);
                    setMessageActionTarget(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default MessengerPage;
