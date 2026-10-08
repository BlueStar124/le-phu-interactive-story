"use client";

import React, { useRef, useEffect, useState } from "react";
import { Film, Play } from "lucide-react";

interface ArticleVideoProps {
  className?: string;
}

export default function ArticleVideo({ className = "" }: ArticleVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Coordinate with voice audio player: pause video when audio starts
  useEffect(() => {
    const handleMediaPlay = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string }>;
      if (customEvent.detail?.type === "audio" && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("app:media-play", handleMediaPlay);
    return () => window.removeEventListener("app:media-play", handleMediaPlay);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    setHasStarted(true);
    // Pause any active audio
    window.dispatchEvent(
      new CustomEvent("app:media-play", { detail: { type: "video" } })
    );
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const triggerInitialPlay = () => {
    if (!videoRef.current) return;
    videoRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      })
      .catch((err) => console.log("Video play error:", err));
  };

  return (
    <div className={`my-8 sm:my-10 transition-all duration-700 ease-out ${className}`}>
      {/* Video Header Label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#A9324E] bg-[#A9324E]/10 px-2.5 py-1 rounded-full border border-[#A9324E]/20">
          <Film className="w-3.5 h-3.5" />
          Video phóng sự
        </span>
        <span className="text-xs text-stone-500 font-mono">01:44 · HD</span>
      </div>

      {/* Video Container */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-stone-900 border border-[#e0d0b0] shadow-lg group">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          poster="/assets/video/video-poster.jpg"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
          className="w-full aspect-video object-cover bg-black focus:outline-none"
        >
          <source src="/assets/video/video-hoa-si.mp4" type="video/mp4" />
          <source src="/assets/video/video-hoa-si.mov" type="video/quicktime" />
          <p className="text-white text-center p-4 text-xs">
            Trình duyệt của bạn không hỗ trợ phát định dạng video này.
          </p>
        </video>

        {/* Big Play Button Overlay before video has started */}
        {!hasStarted && (
          <button
            onClick={triggerInitialPlay}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 hover:bg-black/25 transition-all cursor-pointer group"
            aria-label="Phát video phóng sự"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#A9324E] text-white flex items-center justify-center shadow-2xl ring-4 ring-white/30 group-hover:scale-110 group-hover:bg-[#8e243d] active:scale-95 transition-all duration-300">
              <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
            </div>
            <span className="mt-3 text-xs sm:text-sm font-medium text-white tracking-wide bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20 shadow">
              Nhấn để xem video ký họa trực tiếp
            </span>
          </button>
        )}
      </div>

      {/* Caption */}
      <p className="text-center text-xs sm:text-sm text-stone-600 italic mt-3 px-2 sm:px-4 leading-relaxed">
        Thước phim ghi lại khoảnh khắc họa sĩ Lê Phú cặm cụi ký họa chân dung cho du khách tại góc nhỏ Đường sách Nguyễn Văn Bình (TP.HCM).
      </p>
    </div>
  );
}
