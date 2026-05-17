'use client';

import Hls from 'hls.js';
import { ChevronDown, ChevronUp, Volume2, VolumeOff, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type VideoFeedItem = {
  id: string;
  hlsUrl: string;
  thumbnailUrl?: string;
  shopId?: string;
  productId?: string | null;
  duration?: number | null;
};

export type ProductInfo = {
  id: string;
  name: string;
  virtualPrice: number;
  images: string[];
};

export type VideoFeedProps = {
  videos: VideoFeedItem[];
  onClose?: () => void;
  /** Called when user reaches near the end — load more videos */
  onLoadMore?: () => void;
  /** Fetch product info by ID — if provided, shows product card overlay */
  onFetchProduct?: (productId: string) => Promise<ProductInfo | null>;
  /** Format price — defaults to plain number if not provided */
  formatPrice?: (price: number) => string;
  /** Called when current video changes — use to update URL */
  onVideoChange?: (video: VideoFeedItem, index: number) => void;
  /** Build product link href — e.g. (id) => `/product/${id}` */
  buildProductHref?: (productId: string) => string;
};

/**
 * Fullscreen vertical video feed (TikTok/Reels style).
 * - Preloads next video's first segment
 * - Up/Down navigation buttons
 * - Keyboard: ArrowUp/ArrowDown to navigate, Space to pause, Escape to close
 */
export function VideoFeed({
  videos,
  onClose,
  onLoadMore,
  onFetchProduct,
  formatPrice,
  onVideoChange,
  buildProductHref,
}: VideoFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [product, setProduct] = useState<ProductInfo | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const preloadRef = useRef<Hls | null>(null);

  const currentVideo = videos[currentIndex];

  // Load current video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo?.hlsUrl) return;

    // Cleanup previous
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ startLevel: -1, capLevelToPlayerSize: true });
      hls.loadSource(currentVideo.hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setPlaying(false));
      });
      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = currentVideo.hlsUrl;
      video.play().catch(() => setPlaying(false));
    }

    setPlaying(true);
    setProgress(0);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideo?.hlsUrl]);

  // Preload next video (just load manifest + first segment)
  useEffect(() => {
    const nextVideo = videos[currentIndex + 1];
    if (!nextVideo?.hlsUrl || !Hls.isSupported()) return;

    if (preloadRef.current) {
      preloadRef.current.destroy();
      preloadRef.current = null;
    }

    const hls = new Hls({
      startLevel: 0, // lowest quality for preload
      autoStartLoad: true,
      maxBufferLength: 4, // only 1 segment (~4s)
      maxMaxBufferLength: 4,
    });
    // Create a detached video element for preloading
    const preloadVideo = document.createElement('video');
    preloadVideo.muted = true;
    preloadVideo.preload = 'auto';
    hls.loadSource(nextVideo.hlsUrl);
    hls.attachMedia(preloadVideo);
    preloadRef.current = hls;

    return () => {
      if (preloadRef.current) {
        preloadRef.current.destroy();
        preloadRef.current = null;
      }
    };
  }, [currentIndex, videos]);

  // Request more videos when near end
  useEffect(() => {
    if (currentIndex >= videos.length - 3) {
      onLoadMore?.();
    }
  }, [currentIndex, videos.length, onLoadMore]);

  // Notify parent when video changes (for URL update etc.)
  useEffect(() => {
    if (currentVideo) {
      onVideoChange?.(currentVideo, currentIndex);
    }
  }, [currentIndex, currentVideo, onVideoChange]);

  // Fetch product info for current video
  useEffect(() => {
    setProduct(null);
    const pid = currentVideo?.productId;
    if (!pid || !onFetchProduct) return;

    let cancelled = false;
    onFetchProduct(pid).then((p) => {
      if (!cancelled) setProduct(p);
    });
    return () => {
      cancelled = true;
    };
  }, [currentVideo?.productId, onFetchProduct]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => {
      if (video.duration)
        setProgress((video.currentTime / video.duration) * 100);
    };
    video.addEventListener('timeupdate', onTime);
    return () => video.removeEventListener('timeupdate', onTime);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < videos.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, videos.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, togglePlay, goNext, goPrev]);

  // Mouse wheel / trackpad scroll to navigate
  const wheelCooldown = useRef(false);
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (wheelCooldown.current) return;

      // Threshold to avoid accidental triggers from trackpad inertia
      if (Math.abs(e.deltaY) < 30) return;

      wheelCooldown.current = true;
      if (e.deltaY > 0) goNext();
      else goPrev();

      // Cooldown 500ms to prevent rapid switching
      setTimeout(() => {
        wheelCooldown.current = false;
      }, 500);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [goNext, goPrev]);

  if (!currentVideo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Video feed"
    >
      {/* Video + product card container */}
      <div className="relative h-full max-w-full flex items-center justify-center">
        <video
          ref={videoRef}
          poster={currentVideo.thumbnailUrl}
          playsInline
          loop
          muted={muted}
          onClick={togglePlay}
          className="h-full max-w-full object-contain cursor-pointer"
        />

        {/* Product card overlay — positioned relative to video container */}
        {product && (
          <a
            href={buildProductHref ? buildProductHref(product.id) : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 left-3 right-3 max-w-sm pointer-events-auto cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2.5 flex items-center gap-3">
              {product.images[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={product.images[0]}
                  alt=""
                  className="w-11 h-11 rounded-md object-cover shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-medium truncate">
                  {product.name}
                </p>
                <p className="text-primary text-xs font-bold mt-0.5">
                  {formatPrice
                    ? formatPrice(product.virtualPrice)
                    : `${product.virtualPrice.toLocaleString()}đ`}
                </p>
              </div>
            </div>
          </a>
        )}
      </div>

      {/* Play overlay */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          aria-label="Play"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}

      {/* Top controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const v = videoRef.current;
            if (v) v.muted = !v.muted;
            setMuted(!muted);
          }}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {muted ? (
            <VolumeOff className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation buttons (right side) */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Video trước"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={currentIndex >= videos.length - 1}
          className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Video tiếp"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {videos.length}
      </div>

      {/* Progress bar — click/drag to seek */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer group/progress"
        onClick={(e) => {
          const video = videoRef.current;
          if (!video || !video.duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          video.currentTime = ratio * video.duration;
        }}
        onPointerDown={(e) => {
          const video = videoRef.current;
          if (!video || !video.duration) return;
          const bar = e.currentTarget;
          bar.setPointerCapture(e.pointerId);

          const seek = (clientX: number) => {
            const rect = bar.getBoundingClientRect();
            const ratio = Math.max(
              0,
              Math.min(1, (clientX - rect.left) / rect.width),
            );
            video.currentTime = ratio * video.duration;
          };

          const onMove = (ev: PointerEvent) => seek(ev.clientX);
          const onUp = () => {
            bar.removeEventListener('pointermove', onMove);
            bar.removeEventListener('pointerup', onUp);
          };

          bar.addEventListener('pointermove', onMove);
          bar.addEventListener('pointerup', onUp);
          seek(e.clientX);
        }}
        role="slider"
        aria-label="Video progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-white transition-[width] duration-100 group-hover/progress:bg-primary"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
