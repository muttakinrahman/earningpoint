import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Globe, Users, Lock, ChevronRight, Image as ImageIcon, 
  UserPlus, Smile, MapPin, X, Loader2, Check 
} from 'lucide-react';
import { API_BASE, getImageUrl } from '../config';
import { updatePageSEO } from '../utils/seo';

// Define gradients options
const GRADIENTS = [
  { id: 'none', label: 'None', class: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800' },
  { id: 'aurora', label: 'Aurora', class: 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white' },
  { id: 'sunset', label: 'Sunset', class: 'bg-gradient-to-tr from-amber-500 to-rose-600 text-white' },
  { id: 'neon', label: 'Neon Blue', class: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' },
  { id: 'purpleHaze', label: 'Purple Haze', class: 'bg-gradient-to-br from-purple-700 to-indigo-900 text-white' },
  { id: 'emerald', label: 'Emerald Glow', class: 'bg-gradient-to-tr from-emerald-400 to-teal-700 text-white' },
  { id: 'obsidian', label: 'Obsidian', class: 'bg-gradient-to-b from-slate-800 to-slate-950 text-white' },
  { id: 'candy', label: 'Candy', class: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 text-white' },
  { id: 'peach', label: 'Peach', class: 'bg-gradient-to-r from-orange-400 to-rose-400 text-white' },
];

const MOCK_FRIENDS = [
  'Sayed Muttakin', 'Tanvir Hasan', 'Arafat Rahman', 'Fahim Shahriar', 
  'Milon Khan', 'Jane Doe', 'John Smith', 'Alice Johnson', 'Bob Miller'
];

const FEELINGS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Sad', emoji: '😢' },
  { label: 'Excited', emoji: '😆' },
  { label: 'Loved', emoji: '😍' },
  { label: 'Blessed', emoji: '😇' },
  { label: 'Tired', emoji: '😴' },
  { label: 'Crazy', emoji: '🤪' },
  { label: 'Peaceful', emoji: '😌' },
  { label: 'Proud', emoji: '😎' },
  { label: 'Angry', emoji: '😡' },
];

const MOCK_LOCATIONS = [
  'Dhaka, Bangladesh', 'Chittagong, Bangladesh', 'Sylhet, Bangladesh', 
  'New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan'
];

const CreatePostPage = ({ currentUser, onBack, setActiveTab, postToEdit = null, setPostUploadState }) => {
  const [content, setContent] = useState(postToEdit ? postToEdit.content : '');
  const [privacy, setPrivacy] = useState(postToEdit ? postToEdit.privacy : 'public'); // public, friends, private
  const [selectedGradient, setSelectedGradient] = useState(postToEdit && postToEdit.bgGradient ? postToEdit.bgGradient : 'none');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(() => {
    if (postToEdit) {
      if (postToEdit.video) {
        return [{ url: getImageUrl(postToEdit.video), type: 'video' }];
      }
      if (postToEdit.images && Array.isArray(postToEdit.images) && postToEdit.images.length > 0) {
        return postToEdit.images.map(img => ({ url: getImageUrl(img), type: 'image', isExisting: true }));
      }
      if (postToEdit.image) {
        return [{ url: getImageUrl(postToEdit.image), type: 'image', isExisting: true }];
      }
    }
    return [];
  });
  const [selectedFileType, setSelectedFileType] = useState(postToEdit && postToEdit.video ? 'video' : 'image'); // image, video

  React.useEffect(() => {
    updatePageSEO('posts');
  }, []);
  const [postingLoading, setPostingLoading] = useState(false);
  const [clearImage, setClearImage] = useState(false);
  const [clearVideo, setClearVideo] = useState(false);

  // Enhancement States
  const [feeling, setFeeling] = useState(postToEdit && postToEdit.feeling ? postToEdit.feeling : null);
  const [location, setLocation] = useState(postToEdit ? postToEdit.location : null);
  const [taggedFriends, setTaggedFriends] = useState(postToEdit && postToEdit.taggedFriends ? postToEdit.taggedFriends : []);

  // Modals Visibility
  const [activeModal, setActiveModal] = useState(null); // 'privacy', 'friends', 'feeling', 'location'
  
  // Tag friends search state
  const [friendsSearch, setFriendsSearch] = useState('');
  // Check-in search/input state
  const [locationInput, setLocationInput] = useState('');

  const fileInputRef = useRef(null);

  const getAvatarUrl = (u) => {
    if (!u) return `https://ui-avatars.com/api/?name=User&background=7C3AED&color=fff&bold=true`;
    const pic = u.profilePic || u.googleAvatar || u.facebookAvatar;
    if (!pic) return `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}&background=7C3AED&color=fff&bold=true`;
    return getImageUrl(pic);
  };

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);
  const showToastNotification = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 3500);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.some(file => file.type.startsWith('video/'))) {
      showToastNotification("The video option is currently unavailable. However, it will be available very soon.");
      e.target.value = '';
      return;
    }

    const imgFiles = files.filter(file => file.type.startsWith('image/'));
    if (imgFiles.length === 0) return;

    setSelectedGradient('none');
    setSelectedFileType('image');

    const newPreviews = imgFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: 'image'
    }));

    setSelectedImages(prev => [...prev, ...imgFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImagePreviews(prev => {
      const removed = prev[index];
      if (removed && removed.url && removed.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(removed.url); } catch (err) {}
      }
      return prev.filter((_, i) => i !== index);
    });
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (postToEdit) {
      setClearImage(true);
    }
  };

  const clearAllMedia = () => {
    imagePreviews.forEach(item => {
      if (item.url && item.url.startsWith('blob:')) {
        try { URL.revokeObjectURL(item.url); } catch (err) {}
      }
    });
    setSelectedImages([]);
    setImagePreviews([]);
    if (postToEdit) {
      if (postToEdit.image) setClearImage(true);
      if (postToEdit.video) setClearVideo(true);
    }
  };

  const selectGradient = (gradId) => {
    setSelectedGradient(gradId);
    if (gradId !== 'none') {
      clearAllMedia();
    }
  };

  const handlePrivacySelect = (type) => {
    setPrivacy(type);
    setActiveModal(null);
  };

  const toggleFriendTag = (friend) => {
    setTaggedFriends(prev => 
      prev.includes(friend) 
        ? prev.filter(f => f !== friend) 
        : [...prev, friend]
    );
  };

  const handleLocationSelect = (loc) => {
    setLocation(loc);
    setActiveModal(null);
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (locationInput.trim()) {
      setLocation(locationInput.trim());
      setActiveModal(null);
    }
  };

  const handlePostSubmit = async () => {
    if ((!content.trim() && selectedImages.length === 0 && imagePreviews.length === 0) || postingLoading) return;

    setPostingLoading(true);
    if (setPostUploadState) {
      setPostUploadState({ status: 'uploading', progress: 45, message: 'Uploading post & media...' });
    }

    // Switch to Home tab immediately so user sees upload progress at top
    setActiveTab('Home');

    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('content', content);
    formData.append('privacy', privacy);
    
    if (selectedGradient !== 'none') {
      formData.append('bgGradient', selectedGradient);
    }
    if (feeling) {
      formData.append('feeling', JSON.stringify(feeling));
    }
    if (location) {
      formData.append('location', location);
    }
    if (taggedFriends.length > 0) {
      formData.append('taggedFriends', JSON.stringify(taggedFriends));
    }
    if (selectedImages.length > 0) {
      selectedImages.forEach(img => {
        formData.append('images', img);
      });
    }
    if (postToEdit) {
      if (clearImage) formData.append('clearImage', 'true');
      if (clearVideo) formData.append('clearVideo', 'true');
    }

    try {
      const url = postToEdit ? `${API_BASE}/api/posts/${postToEdit._id}` : `${API_BASE}/api/posts`;
      const method = postToEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setContent('');
        setSelectedGradient('none');
        clearAllMedia();
        setFeeling(null);
        setLocation(null);
        setTaggedFriends([]);
        setClearImage(false);
        setClearVideo(false);
        
        localStorage.removeItem('cached_feed_posts');
        
        if (setPostUploadState) {
          setPostUploadState({ status: 'success', progress: 100, message: 'Post published successfully!' });
          setTimeout(() => setPostUploadState(null), 3000);
        }

        // Trigger feed refresh on Home Page
        window.dispatchEvent(new CustomEvent('tabReclickRefresh', { detail: { tab: 'Home' } }));
      } else {
        let errorMessage = `Failed to ${postToEdit ? 'save' : 'create'} post`;
        try {
          const errorData = await res.json();
          if (errorData && errorData.message) errorMessage = errorData.message;
        } catch (e) {
          if (res.status === 413) errorMessage = 'File size is too large (max 100MB)';
        }
        if (setPostUploadState) {
          setPostUploadState({ status: 'error', progress: 0, message: errorMessage });
          setTimeout(() => setPostUploadState(null), 4000);
        }
      }
    } catch (err) {
      console.error('Post submit error:', err);
      if (setPostUploadState) {
        setPostUploadState({ status: 'error', progress: 0, message: 'An error occurred during upload.' });
        setTimeout(() => setPostUploadState(null), 4000);
      }
    } finally {
      setPostingLoading(false);
    }
  };

  const renderStatusHeader = () => {
    const parts = [];
    if (feeling) {
      parts.push(
        <span key="feeling" className="text-slate-500 dark:text-slate-400">
          {' '}is feeling <span className="font-bold text-slate-800 dark:text-slate-200">{feeling.label} {feeling.emoji}</span>
        </span>
      );
    }
    if (taggedFriends.length > 0) {
      const friendText = taggedFriends.length === 1 
        ? taggedFriends[0] 
        : taggedFriends.length === 2 
          ? `${taggedFriends[0]} and ${taggedFriends[1]}`
          : `${taggedFriends[0]} and ${taggedFriends.length - 1} others`;
      parts.push(
        <span key="friends" className="text-slate-500 dark:text-slate-400">
          {' '}with <span className="font-bold text-slate-800 dark:text-slate-200">{friendText}</span>
        </span>
      );
    }
    if (location) {
      parts.push(
        <span key="location" className="text-slate-500 dark:text-slate-400">
          {' '}at <span className="font-bold text-slate-800 dark:text-slate-200">{location}</span>
        </span>
      );
    }
    return parts;
  };

  const currentGradient = GRADIENTS.find(g => g.id === selectedGradient);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-20 relative">
      {/* Facebook-style Animated Post Uploading Banner */}
      {postingLoading && (
        <div className="fixed top-0 left-0 right-0 z-[500] bg-slate-900/95 text-white backdrop-blur-md px-5 py-3.5 flex items-center justify-between shadow-2xl animate-fade-in-down border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/50 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-[#7C3AED] animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                Posting to Zenivio...
                <span className="inline-block w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
              </h4>
              <p className="text-[11px] font-bold text-slate-400">Uploading post & media, please wait</p>
            </div>
          </div>
          <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
            <div className="bg-gradient-to-r from-indigo-500 via-[#7C3AED] to-pink-500 h-full animate-pulse w-4/5 rounded-full" />
          </div>
        </div>
      )}
      {/* Top Header */}
      <header className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col justify-center px-4 pt-[env(safe-area-inset-top,0px)] pb-1.5 z-30">
        <div className="h-13 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-black text-slate-800 dark:text-white">
              {postToEdit ? 'Edit Post' : 'Create Post'}
              <span className="sr-only"> – Share Your Thoughts on Zenivio</span>
            </h1>
          </div>
          
          <button
            onClick={handlePostSubmit}
            disabled={(!content.trim() && selectedImages.length === 0 && imagePreviews.length === 0) || postingLoading}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-black text-sm rounded-full shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            {postingLoading ? (
              <><Loader2 className="w-4.5 h-4.5 animate-spin" /> {postToEdit ? 'Saving...' : 'Posting...'}</>
            ) : (
              postToEdit ? 'Save' : 'Post'
            )}
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 p-2 sm:p-4 max-w-2xl md:max-w-3xl lg:max-w-xl xl:max-w-2xl mx-auto w-full flex flex-col space-y-4">
        {/* User Card info */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-brand-500 to-indigo-500 flex-shrink-0">
            <img 
              src={getAvatarUrl(currentUser)} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-900"
            />
          </div>
          <div>
            <div className="flex flex-wrap items-center text-sm font-black text-slate-800 dark:text-white leading-tight">
              {currentUser?.name || 'User'}
              {renderStatusHeader()}
            </div>
            
            {/* Privacy Dropdown Trigger */}
            <button
              onClick={() => setActiveModal('privacy')}
              className="flex items-center gap-1.5 text-[10.5px] text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 px-2.5 py-1 rounded-full w-fit font-bold mt-1.5 transition-colors border border-transparent dark:border-slate-700"
            >
              {privacy === 'public' && <Globe className="w-3.5 h-3.5" />}
              {privacy === 'friends' && <Users className="w-3.5 h-3.5" />}
              {privacy === 'private' && <Lock className="w-3.5 h-3.5" />}
              <span className="capitalize">{privacy === 'private' ? 'Only me' : privacy}</span>
              <span className="text-[8px] opacity-70">▼</span>
            </button>
          </div>
        </div>

        {/* Text Area Card with interactive Gradients support */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          {selectedGradient === 'none' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${currentUser?.name || 'User'}?`}
              className="w-full flex-1 bg-transparent text-slate-850 dark:text-white placeholder-slate-405 outline-none border-none resize-none text-[16px] leading-relaxed focus:ring-0 focus:border-transparent min-h-[150px] p-1"
            />
          ) : (
            <div className={`w-full flex-1 rounded-3xl p-6 flex items-center justify-center min-h-[220px] transition-all duration-300 relative ${currentGradient.class}`}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`What's on your mind?`}
                maxLength={250}
                className="w-full bg-transparent text-center text-white placeholder-white/60 outline-none border-none resize-none text-xl md:text-2xl font-black focus:ring-0 focus:border-transparent leading-snug"
                style={{ height: 'auto' }}
              />
            </div>
          )}

          {/* Background Gradient Palette Picker */}
          <div className="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar select-none">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1">Theme</span>
            {GRADIENTS.map(grad => (
              <button
                key={grad.id}
                onClick={() => selectGradient(grad.id)}
                className={`w-7 h-7 rounded-lg flex-shrink-0 transition-transform hover:scale-110 active:scale-90 relative ${grad.class} border-2 ${
                  selectedGradient === grad.id ? 'border-brand-500 scale-105 shadow-sm' : 'border-transparent dark:border-slate-800'
                }`}
                title={grad.label}
              >
                {selectedGradient === grad.id && (
                  <span className={`absolute inset-0 flex items-center justify-center text-[10px] ${grad.id === 'none' ? 'text-slate-800 dark:text-white' : 'text-white'}`}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Facebook-Style Multi-Photo Preview Grid with individual delete & add more */}
          {imagePreviews.length > 0 && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-2 mt-2 group">
              {/* Top action bar: Add more photos & Clear all */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    {imagePreviews.length} {imagePreviews.length === 1 ? 'Photo' : 'Photos'}
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 rounded-full transition-colors flex items-center gap-1"
                  >
                    + Add More
                  </button>
                </div>
                <button
                  type="button"
                  onClick={clearAllMedia}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2 py-0.5 rounded-md transition-colors"
                >
                  Remove all
                </button>
              </div>

              {/* Grid layout depending on photo count */}
              {imagePreviews.length === 1 ? (
                <div className="relative rounded-xl overflow-hidden max-h-[380px] w-full flex items-center justify-center bg-black/5 dark:bg-black/20 group/item">
                  {imagePreviews[0].type === 'video' ? (
                    <video src={imagePreviews[0].url} controls className="w-full max-h-[380px] object-contain" />
                  ) : (
                    <img src={imagePreviews[0].url} alt="Post preview" className="w-full max-h-[380px] object-cover rounded-xl" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(0)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all shadow-md active:scale-90"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : imagePreviews.length === 2 ? (
                <div className="grid grid-cols-2 gap-2 max-h-[320px]">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-square bg-black/5 dark:bg-black/20 group/item">
                      <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full transition-all shadow-md active:scale-90"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : imagePreviews.length === 3 ? (
                <div className="grid grid-cols-2 gap-2 max-h-[380px]">
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-black/5 dark:bg-black/20 row-span-2">
                    <img src={imagePreviews[0].url} alt="Preview 1" className="w-full h-full object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => removeImage(0)}
                      className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-rows-2 gap-2 h-full">
                    {imagePreviews.slice(1, 3).map((img, idx) => (
                      <div key={idx + 1} className="relative rounded-xl overflow-hidden h-[115px] bg-black/5 dark:bg-black/20">
                        <img src={img.url} alt={`Preview ${idx + 2}`} className="w-full h-full object-cover rounded-xl" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx + 1)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 4 or more images */
                <div className="grid grid-cols-2 gap-2 max-h-[380px]">
                  {imagePreviews.slice(0, 4).map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden aspect-square bg-black/5 dark:bg-black/20">
                      <img src={img.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                      {idx === 3 && imagePreviews.length > 4 && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center text-white font-black text-xl rounded-xl">
                          +{imagePreviews.length - 3}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full shadow-md z-10"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick actions buttons bar */}
        <div className="flex items-center gap-2 p-1 border-y border-slate-100 dark:border-slate-800/80">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100/70 rounded-xl transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Photo
          </button>
          <button
            onClick={() => setActiveModal('feeling')}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/70 rounded-xl transition-colors"
          >
            <Smile className="w-4 h-4" />
            Feeling
          </button>
          <button
            onClick={() => setActiveModal('location')}
            className="flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-100/70 rounded-xl transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Check in
          </button>
        </div>

        {/* List: Add to your post options */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150/40 dark:border-slate-800 rounded-3xl p-2.5 shadow-sm space-y-1">
          <div className="px-3 py-2 text-[11px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-wider">
            Add to your post
          </div>
          
          {/* Photo upload trigger */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ImageIcon className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Photo</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              multiple
              onChange={handleImageChange} 
              className="hidden" 
            />
          </button>

          {/* Tag friends option */}
          <button
            onClick={() => setActiveModal('friends')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-405 flex items-center justify-center">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Tag Friends</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              {taggedFriends.length > 0 && (
                <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-650 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold">
                  {taggedFriends.length} tagged
                </span>
              )}
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Feeling / Activity option */}
          <button
            onClick={() => setActiveModal('feeling')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-955/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Smile className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Feeling/Activity</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              {feeling && (
                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md font-bold">
                  {feeling.emoji} {feeling.label}
                </span>
              )}
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          {/* Check in option */}
          <button
            onClick={() => setActiveModal('location')}
            className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-955/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Check in</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              {location && (
                <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 px-2 py-0.5 rounded-md font-bold truncate max-w-[120px]">
                  {location}
                </span>
              )}
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </main>

      {/* --- SUB MODALS OVERLAYS --- */}

      {/* 1. Privacy Selector Modal */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 border border-transparent dark:border-slate-800 animate-fade-in-up pb-8 sm:pb-5">
            <h3 className="text-center font-black text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3">Select Audience</h3>
            
            <div className="mt-4 space-y-2">
              <button 
                onClick={() => handlePrivacySelect('public')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${privacy === 'public' ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"><Globe className="w-5 h-5" /></div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-805 dark:text-white block">Public</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Anyone on Zenivio can see this post</span>
                  </div>
                </div>
                {privacy === 'public' && <Check className="w-5 h-5 text-indigo-500" strokeWidth={3} />}
              </button>

              <button 
                onClick={() => handlePrivacySelect('friends')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${privacy === 'friends' ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"><Users className="w-5 h-5" /></div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-805 dark:text-white block">Friends</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Only your followers can see this post</span>
                  </div>
                </div>
                {privacy === 'friends' && <Check className="w-5 h-5 text-indigo-500" strokeWidth={3} />}
              </button>

              <button 
                onClick={() => handlePrivacySelect('private')}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors ${privacy === 'private' ? 'bg-indigo-50/50 dark:bg-indigo-950/30' : ''}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center"><Lock className="w-5 h-5" /></div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-805 dark:text-white block">Only Me</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 block">Only you can see this post</span>
                  </div>
                </div>
                {privacy === 'private' && <Check className="w-5 h-5 text-indigo-500" strokeWidth={3} />}
              </button>
            </div>
            
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Tag Friends Modal */}
      {activeModal === 'friends' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 border border-transparent dark:border-slate-800 animate-fade-in-up flex flex-col max-h-[85vh] pb-8 sm:pb-5">
            <h3 className="text-center font-black text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">Tag Friends</h3>
            
            {/* Search Input */}
            <div className="my-3 flex-shrink-0">
              <input
                type="text"
                value={friendsSearch}
                onChange={(e) => setFriendsSearch(e.target.value)}
                placeholder="Search friends..."
                className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-sm font-medium"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-1 my-2 pr-1 no-scrollbar">
              {MOCK_FRIENDS
                .filter(friend => friend.toLowerCase().includes(friendsSearch.toLowerCase()))
                .map(friend => {
                  const isChecked = taggedFriends.includes(friend);
                  return (
                    <button
                      key={friend}
                      onClick={() => toggleFriendTag(friend)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left ${
                        isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-650 flex items-center justify-center font-black text-xs">
                          {friend.charAt(0)}
                        </div>
                        <span className="font-bold text-sm text-slate-705 dark:text-slate-200">{friend}</span>
                      </div>
                      
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked 
                          ? 'bg-indigo-500 border-indigo-500 text-white' 
                          : 'border-slate-300 dark:border-slate-600 text-transparent'
                      }`}>
                        <Check className="w-3.5 h-3.5" strokeWidth={3.5} />
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 mt-3 flex-shrink-0">
              <button
                onClick={() => { setTaggedFriends([]); setActiveModal(null); }}
                className="flex-1 py-3 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Done ({taggedFriends.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Feeling Selector Modal */}
      {activeModal === 'feeling' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 border border-transparent dark:border-slate-800 animate-fade-in-up flex flex-col max-h-[75vh] pb-8 sm:pb-5">
            <h3 className="text-center font-black text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">How are you feeling?</h3>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 mt-4 pr-1 no-scrollbar">
              {FEELINGS.map(item => {
                const isSelected = feeling?.label === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setFeeling(isSelected ? null : item);
                      setActiveModal(null);
                    }}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 text-left ${
                      isSelected 
                        ? 'bg-amber-50/50 border-amber-400 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900' 
                        : 'border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-2xl">{item.emoji}</span>
                    <span className="font-bold text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setActiveModal(null)}
              className="mt-5 w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-colors flex-shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 4. Check-in Location Modal */}
      {activeModal === 'location' && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={() => setActiveModal(null)} />
          <div className="relative z-10 bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 border border-transparent dark:border-slate-800 animate-fade-in-up flex flex-col max-h-[80vh] pb-8 sm:pb-5">
            <h3 className="text-center font-black text-slate-800 dark:text-white text-base border-b border-slate-100 dark:border-slate-800 pb-3 flex-shrink-0">Check In</h3>
            
            {/* Custom search / input location */}
            <form onSubmit={handleCustomLocationSubmit} className="my-3 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Search or type custom location..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-brand-500 text-sm font-medium"
              />
              <button
                type="submit"
                className="px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Add
              </button>
            </form>

            {/* Suggestions */}
            <div className="px-1 py-1 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider flex-shrink-0">
              Suggested Locations
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 no-scrollbar">
              {MOCK_LOCATIONS.map(loc => {
                const isSelected = location === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => handleLocationSelect(loc)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors text-left ${
                      isSelected ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-955/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-705 dark:text-slate-200">{loc}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-500" strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-2 mt-4 flex-shrink-0">
              <button
                onClick={() => { setLocation(null); setActiveModal(null); }}
                className="flex-1 py-3 border border-slate-250 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs transition-colors"
              >
                Remove Location
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-755 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 text-white text-xs font-black px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/40 backdrop-blur-md animate-fade-in text-center max-w-[90vw] sm:max-w-md">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CreatePostPage;
