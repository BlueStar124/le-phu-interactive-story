"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Compass,
} from "lucide-react";

export interface MapSpot {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  isHighlight?: boolean;
  photo?: string;
  photoAlt?: string;
  photoCaption?: string;
  photoCredit?: string;
  photoSource?: string;
  photoLicense?: { label: string; url: string };
}

const mapSpots: MapSpot[] = [
  {
    id: 1,
    title: "Cổng Công Xã Paris & Nhà Thờ Đức Bà",
    subtitle: "Cửa ngõ phía Tây",
    tag: "Di tích lịch sử",
    description:
      "Nằm kề bên Nhà thờ Đức Bà cổ kính và Công trường Công Xã Paris. Đây là cổng chính đón dòng du khách thập phương và bạn bè quốc tế ghé thăm Đường Sách mỗi ngày.",
    x: 16,
    y: 33,
    photo: "/assets/duong-sach/cong-duong-sach.webp",
    photoAlt: "Cổng chào màu xanh của Đường Sách TP.HCM cạnh Bưu điện Trung tâm",
    photoCaption: "Cổng chào Đường Sách phía Công Xã Paris",
    photoCredit: "Ảnh: Lao Động / Asia Transport",
    photoSource: "https://www.asiatransport.net/post/duong-sach",
  },
  {
    id: 2,
    title: "Bưu Điện Trung Tâm Sài Gòn",
    subtitle: "Kiến trúc biểu tượng",
    tag: "Biểu tượng đô thị",
    description:
      "Tòa nhà cổ điển phong cách Gothic do Pháp xây dựng cuối thế kỷ 19, tạo nên một bối cảnh kiến trúc lãng mạn và cổ kính ngay đầu tuyến phố sách.",
    x: 32,
    y: 22,
    photo: "/assets/duong-sach/buu-dien-trung-tam.webp",
    photoAlt: "Mặt tiền màu vàng và đồng hồ của Bưu điện Trung tâm Sài Gòn",
    photoCaption: "Mặt tiền Bưu điện Trung tâm Sài Gòn",
    photoCredit: "Ảnh: Yesvn123 / Wikimedia Commons",
    photoSource: "https://commons.wikimedia.org/wiki/File:Saigon_Central_Post_Office_2022.jpg",
    photoLicense: { label: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  },
  {
    id: 3,
    title: "Gian Hàng Sách & Nhà Xuất Bản",
    subtitle: "Không gian tri thức",
    tag: "Văn hóa đọc",
    description:
      "Hơn 20 kiosk sách liền kề nhau của các nhà xuất bản uy tín (Kim Đồng, Nhã Nam, Fahasa, Phương Nam...). Nơi bạn đọc tìm kiếm từ sách thiếu nhi, văn học đến tư liệu quý hiếm.",
    x: 52,
    y: 46,
    photo: "/assets/duong-sach/gian-hang-sach.webp",
    photoAlt: "Bạn đọc chọn sách tại gian hàng Đông A trên Đường Sách Nguyễn Văn Bình",
    photoCaption: "Gian hàng sách Đông A trên Đường Sách",
    photoCredit: "Ảnh: Việt Nam News",
    photoSource: "https://vietnamnews.vn/life-style/536512/vietnamese-publishers-honoured-at-book-street.html",
  },
  {
    id: 4,
    title: "Góc Ký Họa Của Họa Sĩ Lê Phú",
    subtitle: "Nét trầm giữa phố thị",
    tag: "Tâm điểm bài viết",
    isHighlight: true,
    description:
      "Dưới tán dù che nắng và bóng cây râm mát, họa sĩ Lê Phú lặng lẽ bên giá vẽ và hộp than chì. Chỉ trong 10 phút, những đường nét sống động, nụ cười và thần thái nhân vật hiện lên đầy cảm xúc — điều công nghệ AI không thể nào thay thế.",
    x: 43,
    y: 68,
    photo: "/assets/hoa-si/image3.png",
    photoCaption: "Họa sĩ Lê Phú đang chăm chú ký họa chân dung cho khách",
  },
  {
    id: 5,
    title: "Cà Phê Sách & Sân Khấu Giao Lưu",
    subtitle: "Không gian thư giãn",
    tag: "Cộng đồng",
    description:
      "Khuôn viên ngoài trời thoáng đãng với những bộ bàn ghế gỗ mộc mạc, nơi bạn đọc có thể nhâm nhi ly cà phê, trò chuyện văn chương hay tham gia các buổi ra mắt sách cuối tuần.",
    x: 62,
    y: 60,
    photo: "/assets/duong-sach/dep-cafe.webp",
    photoAlt: "Quán Đẹp Café với bàn ghế ngoài trời dưới mái che tại Đường Sách",
    photoCaption: "Đẹp Café trong không gian Đường Sách",
    photoCredit: "Ảnh: HCM City Guide",
    photoSource: "https://www.hcm-cityguide.com/areas/maria-church/articles/614",
  },
  {
    id: 6,
    title: "Cổng Phía Đường Hai Bà Trưng",
    subtitle: "Cửa ngõ phía Đông",
    tag: "Cửa ngõ đón khách",
    description:
      "Đầu phía Đông của Đường Sách kết nối với tuyến đường Hai Bà Trưng sầm uất. Từ đây, bạn đọc có thể bước vào không gian đi bộ rợp bóng cây, khám phá các gian sách và điểm sinh hoạt văn hóa dọc phố.",
    x: 86,
    y: 77,
    photo: "/assets/duong-sach/khong-gian-duong-sach.webp",
    photoAlt: "Bạn đọc đi bộ giữa các gian sách và hàng cây trên Đường Sách Nguyễn Văn Bình",
    photoCaption: "Không gian đi bộ trên Đường Sách Nguyễn Văn Bình",
    photoCredit: "Ảnh: Kevin Rutherford / Wikimedia Commons",
    photoSource: "https://commons.wikimedia.org/wiki/File:Nguyen_Van_Binh_Street_(52681309899).jpg",
    photoLicense: { label: "CC BY-SA 2.0", url: "https://creativecommons.org/licenses/by-sa/2.0/" },
  },
];

export default function InteractiveBookStreetmap() {
  const [activeIdx, setActiveIdx] = useState(3); // Mặc định mở điểm họa sĩ Lê Phú (index 3)
  const [zoom, setZoom] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapAreaRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, panX: 0, panY: 0 });

  const activeSpot = mapSpots[activeIdx];

  // Auto-play timer (chuyển điểm tự động sau mỗi 5s)
  useEffect(() => {
    if (!isAutoPlay) {
      setProgress(0);
      return;
    }

    const interval = 50;
    const totalTime = 5000;
    const step = (interval / totalTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIdx((curr) => (curr + 1) % mapSpots.length);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlay, activeIdx]);

  // Canh giữa marker khi zoom
  useEffect(() => {
    if (zoom > 1) {
      const spot = mapSpots[activeIdx];
      const offsetX = (50 - spot.x) * (zoom - 1) * 6;
      const offsetY = (50 - spot.y) * (zoom - 1) * 4;
      setPan({ x: offsetX, y: offsetY });
    } else {
      setPan({ x: 0, y: 0 });
    }
  }, [activeIdx, zoom]);

  // Chọn điểm
  const handleSelectSpot = (idx: number) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(2, +(z + 0.3).toFixed(1)));
  const handleZoomOut = () => {
    setZoom((z) => {
      const next = Math.max(1, +(z - 0.3).toFixed(1));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };
  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag to pan (Mouse)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan({ x: dragStart.panX + dx, y: dragStart.panY + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Drag to pan (Touch on mobile)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY, panX: pan.x, panY: pan.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || zoom <= 1 || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setPan({ x: dragStart.panX + dx, y: dragStart.panY + dy });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <section className="my-12 sm:my-16 w-full max-w-5xl mx-auto px-3 sm:px-6">
      {/* Container Card */}
      <div className="bg-[#FAF2DE] border border-[#d8c8a8] rounded-3xl shadow-xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#f3e7ce] px-4 sm:px-8 py-3.5 sm:py-5 border-b border-[#e2d2b4]">
          <div className="flex items-center justify-between gap-3 sm:gap-6 flex-nowrap mb-2 sm:mb-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A9324E] animate-ping flex-shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#A9324E] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Bản đồ tương tác
              </span>
            </div>

            {/* Autoplay & Zoom actions: flex-shrink-0 cố định trên 1 hàng */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-full border transition cursor-pointer shadow-sm whitespace-nowrap ${
                  isAutoPlay
                    ? "bg-[#A9324E] text-white border-[#A9324E]"
                    : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
                }`}
                title={isAutoPlay ? "Tạm dừng tự động" : "Bật tự động khám phá"}
              >
                {isAutoPlay ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dừng tour</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tự động tour</span>
                  </>
                )}
              </button>

              {/* Cụm nút Zoom: Giữ kích thước cố định */}
              <div className="flex items-center bg-white rounded-full border border-stone-300 p-0.5 shadow-sm">
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 2}
                  className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-stone-700 hover:text-black disabled:opacity-30 cursor-pointer touch-manipulation"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                  className="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center text-stone-700 hover:text-black disabled:opacity-30 cursor-pointer touch-manipulation"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  disabled={zoom === 1}
                  className={`w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center border-l border-stone-200 transition touch-manipulation ${
                    zoom > 1
                      ? "text-stone-700 hover:text-black cursor-pointer"
                      : "text-stone-300 opacity-40 cursor-not-allowed"
                  }`}
                  title="Đặt lại góc nhìn"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Title & subtitle: Hiển thị đầy đủ, không bị '...' trên mobile */}
          <h3 className="font-serif text-sm sm:text-base md:text-lg font-bold text-stone-900 leading-snug">
            Đường Sách Nguyễn Văn Bình — Tọa độ & Không gian văn hóa
          </h3>
          <p className="text-[11px] sm:text-xs text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
            Khám phá không gian 144m phố sách tại Quận 1, TP.HCM và vị trí góc vẽ chân dung của họa sĩ Lê Phú.
          </p>
        </div>

        {/* Progress bar for autoplay */}
        {isAutoPlay && (
          <div className="w-full h-1 bg-[#e0d0b4]">
            <div
              className="h-full bg-[#A9324E] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Map Viewport Area: THU NHỎ HIỂN THỊ TRỌN VẸN TOÀN BỘ BẢN ĐỒ (1376x768) ── */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{ aspectRatio: "1376 / 768" }}
          className={`relative w-full aspect-[1376/768] overflow-hidden bg-[#ecdcb8] select-none ${
            zoom > 1
              ? isDragging
                ? "cursor-grabbing touch-none"
                : "cursor-grab touch-none"
              : "cursor-default touch-pan-y"
          }`}
        >
          {/* Zoomable & Pannable inner container */}
          <div
            ref={mapAreaRef}
            className="absolute inset-0 transition-transform duration-500 ease-out flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* The Visual Map Image */}
            <div className="relative w-full h-full max-w-[1376px] max-h-[768px]">
              <img
                src="/assets/hoa-si/duong-sach-map.jpg"
                alt="Bản đồ minh họa Đường Sách Nguyễn Văn Bình"
                className="w-full h-full object-fill pointer-events-none"
              />

              {/* Interactive Markers / Pins */}
              {mapSpots.map((spot, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div
                    key={spot.id}
                    onClick={() => handleSelectSpot(idx)}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  >
                    {/* Pulsing ring */}
                    {isActive && (
                      <span className="absolute -inset-2.5 rounded-full bg-[#A9324E]/40 animate-ping pointer-events-none" />
                    )}

                    {/* Marker badge */}
                    <div
                      className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-lg transition-all duration-300 ${
                        isActive
                          ? "bg-[#A9324E] text-white border-white scale-110 z-30 ring-4 ring-[#A9324E]/30"
                          : spot.isHighlight
                          ? "bg-amber-600 text-white border-white hover:scale-105"
                          : "bg-white/95 text-stone-800 border-stone-300 hover:bg-white hover:scale-105"
                      }`}
                    >
                      {spot.isHighlight ? (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-inherit" />
                      )}
                      <span className="text-[11px] font-bold whitespace-nowrap hidden sm:inline">
                        {spot.title}
                      </span>
                    </div>

                    {/* Number pin on mobile */}
                    <div className="sm:hidden absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#A9324E] text-white text-[9px] font-bold flex items-center justify-center">
                      {spot.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Spot Detail Card: TÍCH HỢP Ô HÌNH NHỎ VÀO TRONG KHUNG CHỮ PHÍA TRÊN ── */}
        <div className="bg-[#FAF2DE] p-4 sm:p-6 border-t border-[#e2d2b4] transition-all duration-300">
          {/* Header row: Tag, Subtitle & Prev / Next controls */}
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 rounded-full ${
                  activeSpot.isHighlight
                    ? "bg-[#A9324E] text-white"
                    : "bg-[#e8d8be] text-stone-800"
                }`}
              >
                {activeSpot.tag}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                {activeSpot.subtitle} · Địa điểm {activeSpot.id}/6
              </span>
            </div>

            {/* Prev / Next controls đưa lên đầu góc phải */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() =>
                  handleSelectSpot((activeIdx - 1 + mapSpots.length) % mapSpots.length)
                }
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-[#A9324E] hover:text-white hover:border-[#A9324E] active:scale-95 transition cursor-pointer shadow-sm touch-manipulation"
                title="Địa điểm trước"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => handleSelectSpot((activeIdx + 1) % mapSpots.length)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-[#A9324E] hover:text-white hover:border-[#A9324E] active:scale-95 transition cursor-pointer shadow-sm touch-manipulation"
                title="Địa điểm kế tiếp"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Main content: Khung chữ và Ô hình nhỏ nằm liền kề trong cùng 1 khối */}
          <div className="flex items-start gap-3 sm:gap-5">
            <div className="flex-1 min-w-0">
              <h4 className="font-serif text-base sm:text-lg md:text-xl font-bold text-stone-900 leading-snug">
                {activeSpot.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed text-justify mt-1 sm:mt-2">
                {activeSpot.description}
              </p>
            </div>

            {/* Ô hình nhỏ được đưa vào trong khung chữ */}
            {activeSpot.photo && (
              <figure className="flex-shrink-0 w-24 sm:w-32 md:w-36">
                <div className="overflow-hidden rounded-xl border border-[#d6c7ab] shadow-sm h-20 sm:h-24 md:h-28 bg-[#e8d8be]">
                  <img
                    key={activeSpot.photo}
                    src={activeSpot.photo}
                    alt={activeSpot.photoAlt ?? activeSpot.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                </div>
                <figcaption className="sr-only">
                  {activeSpot.photoCaption}
                  {activeSpot.photoSource && (
                    <a href={activeSpot.photoSource} tabIndex={-1} target="_blank" rel="noopener noreferrer" className="block mt-0.5 underline underline-offset-2 hover:text-[#A9324E]">
                      {activeSpot.photoCredit}
                    </a>
                  )}
                  {activeSpot.photoLicense && (
                    <a href={activeSpot.photoLicense.url} tabIndex={-1} target="_blank" rel="noopener noreferrer" className="block underline underline-offset-2 hover:text-[#A9324E]">
                      {activeSpot.photoLicense.label} · ảnh thu nhỏ
                    </a>
                  )}
                </figcaption>
              </figure>
            )}
          </div>
        </div>

        {/* Bottom Horizontal Spot Selector Tabs */}
        <div className="bg-[#f3e7ce] p-2.5 sm:p-4 border-t border-[#e2d2b4] overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 min-w-max">
            {mapSpots.map((spot, idx) => {
              const isSelected = activeIdx === idx;
              return (
                <button
                  key={spot.id}
                  onClick={() => handleSelectSpot(idx)}
                  className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer touch-manipulation shrink-0 ${
                    isSelected
                      ? "bg-[#A9324E] text-white shadow-md font-semibold"
                      : spot.isHighlight
                      ? "bg-amber-100/80 text-amber-900 border border-amber-300 hover:bg-amber-200"
                      : "bg-white/80 text-stone-700 border border-stone-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isSelected ? "bg-white text-[#A9324E]" : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {spot.id}
                  </span>
                  <span>{spot.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
