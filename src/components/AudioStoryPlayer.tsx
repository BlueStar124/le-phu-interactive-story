"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Headphones, RotateCcw } from "lucide-react";

interface AudioStoryPlayerProps {
  className?: string;
}

export default function AudioStoryPlayer({ className = "" }: AudioStoryPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressTrackRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(62.2); // ~1:02 default fallback
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Listen for media events to coordinate with video
  useEffect(() => {
    const handleMediaPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string }>;
      if (customEvent.detail?.type === "video" && audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("app:media-play", handleMediaPlay);
    return () => window.removeEventListener("app:media-play", handleMediaPlay);
  }, []);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      window.dispatchEvent(
        new CustomEvent("app:media-play", { detail: { type: "audio" } })
      );
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Audio play error:", err));
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const cycleSpeed = () => {
    if (!audioRef.current) return;
    const rates = [1, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressTrackRef.current) return;
    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newRatio = clickX / rect.width;
    const newTime = newRatio * (duration || 1);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`relative w-full rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 p-2.5 sm:p-3 text-white shadow-xl transition-all duration-300 hover:bg-black/40 hover:border-white/35 ${className}`}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src="/assets/audio/voice-story.mp3"
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex flex-col gap-2">
        {/* Top header row: compact info + controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Badge & Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#A9324E] text-white shadow-xs border border-white/20">
              <Headphones className="w-3 h-3" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-[#A9324E] px-2 py-0.5 rounded-full shadow-xs flex-shrink-0">
              Bản tin audio
            </span>
            <span className="text-xs font-medium text-stone-100 truncate font-serif">
              Họa sĩ Lê Phú
            </span>
            {isPlaying && (
              <div className="flex items-center gap-0.5 h-3 flex-shrink-0">
                <span className="w-0.5 h-2 bg-amber-300 rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-amber-300 rounded-full animate-bounce delay-75" />
                <span className="w-0.5 h-1.5 bg-amber-300 rounded-full animate-pulse delay-150" />
              </div>
            )}
          </div>

          {/* Controls: Speed + Mute */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={cycleSpeed}
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer touch-manipulation"
              title="Tốc độ phát"
              aria-label={`Tốc độ phát ${playbackRate}x`}
            >
              {playbackRate}x
            </button>
            <button
              onClick={toggleMute}
              className="p-1 rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white transition cursor-pointer touch-manipulation"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Bottom player controls row: Play button + Progress + Time */}
        <div className="flex items-center gap-2.5">
          {/* Compact Play / Pause button with brand burgundy #A9324E */}
          <button
            onClick={togglePlay}
            className={`flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer touch-manipulation shadow-md active:scale-95 bg-[#A9324E] hover:bg-[#8e243d] text-white ring-2 ring-white/30 ${
              isPlaying ? "ring-amber-300/40" : ""
            }`}
            title={isPlaying ? "Tạm dừng" : "Nghe đọc phóng sự"}
            aria-label={isPlaying ? "Tạm dừng" : "Nghe đọc phóng sự"}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Progress bar and time */}
          <div className="flex-1 flex flex-col gap-1 min-w-0">
            <div
              ref={progressTrackRef}
              onClick={handleSeek}
              className="group relative h-2 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer flex items-center transition-colors"
              title="Kéo hoặc nhấn để tua"
            >
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#A9324E] rounded-full relative transition-[width] duration-75"
                style={{ width: `${progressPercent}%` }}
              >
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white ring-2 ring-[#A9324E] rounded-full shadow-md group-hover:scale-125 transition-transform" />
              </div>
            </div>

            {/* Time labels */}
            <div className="flex items-center justify-between text-[10px] text-stone-200 font-mono">
              <span>{formatTime(currentTime)}</span>
              <div className="flex items-center gap-1.5">
                {currentTime > 0 && (
                  <button
                    onClick={handleRestart}
                    className="hover:text-amber-300 transition text-[9px] flex items-center gap-0.5 cursor-pointer font-sans"
                    title="Nghe lại từ đầu"
                  >
                    <RotateCcw className="w-2 h-2" />
                    <span>Lại</span>
                  </button>
                )}
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
