'use client';

import Hls from 'hls.js';
import { Play, Volume2, VolumeOff, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type VideoPlayerProps = {
  /** HLS master playlist URL (.m3u8) */
  src: string;
  /** Poster/thumbnail URL */
  poster?: string;
  /** Called when user closes the player */
  onClose?: () => void;
};

/**
 * Fullscreen short-video player (like Reels/TikTok).
 * Plays HLS adaptive stream. Fills viewport height, centers video.
 */
export function VideoPlayer({ src, poster, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);

  // Setup HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        startLevel: -1, // auto quality
        capLevelToPlayerSize: true,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setPlaying(false));
      });
      hlsRef.current = hls;

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native HLS
      video.src = src;
      video.play().catch(() => setPlaying(false));
    }
  }, [src]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, []);

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

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, togglePlay]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
    >
      {/* Video — fills height, auto width to keep ratio */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        loop
        onClick={togglePlay}
        className="h-full max-w-full object-contain cursor-pointer"
      />

      {/* Play/Pause overlay (shows briefly on tap) */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          aria-label="Play video"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </button>
      )}

      {/* Mute button */}
      <button
        type="button"
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = !video.muted;
          setMuted(!muted);
        }}
        className="absolute top-4 right-16 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
        aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
      >
        {muted ? (
          <VolumeOff className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors cursor-pointer"
        aria-label="Đóng video"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar at bottom — click/drag to seek */}
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
