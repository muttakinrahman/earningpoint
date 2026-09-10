import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getImageUrl } from '../config';

const PostMediaCarousel = ({ 
  images = [], 
  singleImage = null, 
  postType = 'standard', 
  onImageClick 
}) => {
  // Combine & deduplicate images
  const allImages = React.useMemo(() => {
    const list = Array.isArray(images) && images.length > 0 
      ? images.filter(Boolean) 
      : (singleImage ? [singleImage] : []);
    return Array.from(new Set(list));
  }, [images, singleImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  if (allImages.length === 0) return null;

  // 1. Single Image Mode (No dots, no arrows, clean display)
  if (allImages.length === 1) {
    const imgUrl = getImageUrl(allImages[0]);

    if (postType === 'profile_picture') {
      return (
        <div 
          onClick={() => onImageClick && onImageClick(imgUrl)}
          className="relative w-full aspect-square max-h-[520px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm mt-2 select-none cursor-pointer group flex items-center justify-center"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${imgUrl})` }}
          />
          <img 
            src={imgUrl} 
            alt="Profile update" 
            className="relative w-full h-full object-cover z-10 group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }

    if (postType === 'cover_photo') {
      return (
        <div 
          onClick={() => onImageClick && onImageClick(imgUrl)}
          className="relative w-full aspect-[16/9] sm:aspect-[2.3/1] max-h-[340px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm mt-2 select-none cursor-pointer group"
        >
          <img 
            src={imgUrl} 
            alt="Cover update" 
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }

    return (
      <div 
        onClick={() => onImageClick && onImageClick(imgUrl)}
        className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 mt-2 w-full flex items-center justify-center select-none cursor-pointer hover:opacity-95 transition-opacity border border-slate-200/60 dark:border-slate-800/80"
      >
        <img 
          src={imgUrl} 
          alt="Post Content" 
          className="w-full h-auto max-h-[580px] object-cover rounded-2xl"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  // 2. Multi-Image Instagram Carousel Mode
  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex(prev => Math.min(allImages.length - 1, prev + 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // min swipe distance in px
    if (diff > threshold && currentIndex < allImages.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (diff < -threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="mt-2 select-none">
      {/* Carousel Container */}
      <div 
        className="relative rounded-2xl overflow-hidden bg-black/90 dark:bg-black/95 border border-slate-200/60 dark:border-slate-800 group"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top-Right Index Pill (e.g. 1/3) */}
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[11px] font-bold shadow-md tracking-wider pointer-events-none">
          {currentIndex + 1}/{allImages.length}
        </div>

        {/* Previous Button (Left Arrow) */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg active:scale-90 cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button (Right Arrow) */}
        {currentIndex < allImages.length - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all shadow-lg active:scale-90 cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Sliding Track */}
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {allImages.map((img, idx) => {
            const url = getImageUrl(img);
            return (
              <div
                key={idx}
                onClick={() => onImageClick && onImageClick(url)}
                className="w-full shrink-0 aspect-[4/5] sm:aspect-square max-h-[560px] flex items-center justify-center overflow-hidden cursor-pointer relative"
              >
                {/* Blurred ambient background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-35 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${url})` }}
                />
                <img
                  src={url}
                  alt={`Post photo ${idx + 1}`}
                  className="relative z-10 w-full h-full object-cover"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Instagram-Style Indicator Dots (Below Image) */}
      <div className="flex items-center justify-center gap-1.5 py-2 select-none">
        {allImages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            className={`transition-all duration-200 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-2 h-2 bg-blue-500 dark:bg-blue-400 scale-125'
                : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PostMediaCarousel;
