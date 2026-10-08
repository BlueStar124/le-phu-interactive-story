"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Share2, BookOpen, Pencil, Cpu } from "lucide-react";
import Comments from "@/components/Comments";
import InteractiveBookStreetmap from "@/components/InteractiveBookStreetmap";
import AudioStoryPlayer from "@/components/AudioStoryPlayer";
import ArticleVideo from "@/components/ArticleVideo";

// ─── Fade-in-on-scroll hook ───────────────────────────────────────────
function useFadeIn(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Immediately trigger if already in or near viewport
    const checkVisibility = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 120) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (checkVisibility()) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top <= window.innerHeight + 100) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold, rootMargin: "250px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Single scroll-driven hero ─────────────────────────────────────────
function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      if (!containerRef.current) return;
      const { top } = containerRef.current.getBoundingClientRect();
      setParallax(Math.max(0, -top * 0.35));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] sm:min-h-[620px] overflow-hidden flex flex-col justify-end"
    >
      {/* Background image with parallax */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${parallax}px)` }}
      >
        <img
          src="/assets/hoa-si/image1.png"
          alt="Đường sách Nguyễn Văn Bình"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
      </div>

      {/* Text overlay */}
      <div className="relative z-10 w-full flex flex-col justify-end px-4 sm:px-10 md:px-20 pt-20 pb-8 sm:pb-12 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 mb-2.5 animate-fade-in">
          <img
            src="/icon.svg"
            alt="Logo"
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-md shadow"
          />
          <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-amber-400">
            <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Nguyễn Thị Thu Hiệp
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-3 sm:mb-4 drop-shadow-lg">
          Họa sĩ Lê Phú và những bức<br className="hidden sm:block" /> chân dung&nbsp;
          <span className="text-amber-300">"có hồn"</span>
        </h1>
        <p className="text-stone-200 text-sm sm:text-xl leading-relaxed max-w-2xl font-light">
          Giữa nhịp sống hối hả của Thành phố và sự bùng nổ của AI, tại Đường sách Nguyễn Văn Bình vẫn có một góc yên bình — nơi từng nét bút chì than kết nối những tâm hồn du khách.
        </p>
        <div className="flex items-center gap-3 mt-3 sm:mt-4 text-[11px] sm:text-xs text-stone-400">
          <span>Đường sách Nguyễn Văn Bình, TP. Hồ Chí Minh</span>
          <span>·</span>
          <span>Phóng sự ảnh</span>
        </div>

        {/* Voice Player: Bản tin audio / Giọng đọc phóng sự */}
        <div className="w-full max-w-xl mx-auto mt-4 sm:mt-5">
          <AudioStoryPlayer />
        </div>
      </div>
    </section>
  );
}

// ─── Sticky top nav bar ─────────────────────────────────────────────────
function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Họa sĩ Lê Phú", url: window.location.href }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-[#FAF2DE]/95 backdrop-blur-md shadow-sm border-b border-[#e0d0b0]"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-3">
        <div
          className={`flex items-center gap-2 min-w-0 transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"
            }`}
        >
          <img
            src="/icon.svg"
            alt="Logo"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg shadow-sm flex-shrink-0"
          />
          <span className="font-serif font-bold text-xs sm:text-base truncate text-stone-800">
            Họa sĩ Lê Phú — Những bức chân dung "có hồn"
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <a
            href="#binh-luan"
            className={`flex items-center justify-center gap-1.5 text-xs min-h-[34px] min-w-[34px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all touch-manipulation ${scrolled
              ? "bg-white/80 border-stone-300 text-stone-700 hover:bg-white"
              : "bg-white/20 border-white/40 text-white hover:bg-white/30"
              }`}
            title="Bình luận"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bình luận</span>
          </a>
          <button
            onClick={handleShare}
            className={`flex items-center justify-center gap-1.5 text-xs min-h-[34px] min-w-[34px] sm:min-w-0 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all cursor-pointer touch-manipulation ${scrolled
              ? "bg-white/80 border-stone-300 text-stone-700 hover:bg-white"
              : "bg-white/20 border-white/40 text-white hover:bg-white/30"
              }`}
            title="Chia sẻ bài viết"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Section wrapper with fade-in ──────────────────────────────────────
function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Pull quote ─────────────────────────────────────────────────────────
function PullQuote({ text }: { text: string }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`my-8 sm:my-10 px-2 sm:px-4 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
    >
      <blockquote className="relative border-l-4 border-[#A9324E] pl-4 sm:pl-5 py-1 font-serif text-base sm:text-xl md:text-2xl italic text-stone-800 leading-relaxed max-w-2xl">
        {text}
        <span className="absolute top-0 -left-2 text-[#A9324E] text-4xl sm:text-5xl leading-none opacity-30 font-serif select-none">
          "
        </span>
      </blockquote>
    </div>
  );
}

// ─── Full-width image with caption ─────────────────────────────────────
function ArticleImage({ src, caption, alt }: { src: string; caption: string; alt: string }) {
  const { ref, visible } = useFadeIn(0.05);
  return (
    <div
      ref={ref}
      className={`my-8 sm:my-10 transition-all duration-700 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"
        }`}
    >
      <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-[#e0d0b0] shadow-md sm:shadow-lg">
        <img src={src} alt={alt} className="w-full object-cover max-h-[580px]" />
      </div>
      {caption && (
        <p className="text-center text-xs sm:text-sm text-stone-500 italic mt-2.5 sm:mt-3 px-2 sm:px-4 leading-relaxed">
          {caption}
        </p>
      )}
    </div>
  );
}

// ─── Chapter heading ────────────────────────────────────────────────────
function ChapterHeading({ title, icon }: { title: string; icon: React.ReactNode }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      className={`flex items-center gap-2.5 sm:gap-3 my-6 sm:my-8 transition-all duration-600 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      <span className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#A9324E]/10 text-[#A9324E] flex items-center justify-center">
        {icon}
      </span>
      <h2 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 leading-snug">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#A9324E]/30 to-transparent ml-2 hidden sm:block" />
    </div>
  );
}

// ─── Stat card row ──────────────────────────────────────────────────────
function StatRow() {
  const { ref, visible } = useFadeIn();
  const stats = [
    { value: "1957", label: "Năm sinh tại Thủ Đức" },
    { value: "10'", label: "Vẽ một bức chân dung" },
    { value: "100%", label: "Thủ công — không AI" },
  ];
  return (
    <div
      ref={ref}
      className={`grid grid-cols-3 gap-2 sm:gap-3 my-8 sm:my-10 transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          className="flex flex-col items-center text-center p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/60 border border-[#e0d0b0] shadow-sm"
          style={{ transitionDelay: `${i * 80}ms` }}
        >
          <span className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-[#A9324E] leading-none mb-1">
            {s.value}
          </span>
          <span className="text-[11px] sm:text-xs md:text-sm text-stone-600 leading-snug">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Reading progress bar ───────────────────────────────────────────────
function ReadingProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      if (scrollable > 0) setPct((window.scrollY / scrollable) * 100);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div className="fixed top-14 left-0 right-0 z-50 h-0.5 bg-stone-200">
      <div
        className="h-full bg-[#A9324E] transition-all duration-100"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Back-to-top ────────────────────────────────────────────────────────
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-6 z-40 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#A9324E] text-white shadow-lg flex items-center justify-center hover:bg-[#841c3f] active:scale-95 transition cursor-pointer touch-manipulation"
      title="Về đầu trang"
      aria-label="Về đầu trang"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF2DE] selection:bg-[#A9324E] selection:text-white">
      <ReadingProgress />
      <TopBar />

      {/* ── Hero ── */}
      <Hero />

      {/* ── Article body ── */}
      <article className="max-w-[700px] mx-auto px-4 sm:px-6 pt-12">
        {/* Lead paragraph */}
        <FadeSection>
          <p className="text-lg sm:text-xl leading-[1.9rem] sm:leading-[2.1rem] text-stone-800 font-light text-justify first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:text-[#A9324E] first-letter:float-left first-letter:mr-2.5 first-letter:mt-1 first-letter:leading-none">
            Giữa nhịp sống hối hả của Thành phố và sự bùng nổ của công nghệ trí tuệ nhân tạo (AI), tại Đường sách Nguyễn Văn Bình vẫn có một góc yên bình. Nơi ấy, có họa sĩ Lê Phú lặng lẽ dùng ngòi bút chì, than chì để "thổi hồn" vào những bức chân dung nghệ thuật, lưu giữ khoảnh khắc và kết nối những tâm hồn du khách.
          </p>
        </FadeSection>

        {/* Image 1 */}
        <ArticleImage
          src="/assets/hoa-si/image1.png"
          alt="Toàn cảnh Đường sách Nguyễn Văn Bình"
          caption="Đường sách Nguyễn Văn Bình — điểm đến văn hóa quen thuộc của người dân và du khách TP. Hồ Chí Minh."
        />

        <FadeSection>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Nằm dưới bóng mát của những hàng cây cổ thụ, những cây dù nhiều màu sắc, Đường sách Nguyễn Văn Bình từ lâu đã trở thành điểm đến quen thuộc của giới mộ điệu văn hóa, sách vở và du khách thập phương. Giữa không gian nhộn nhịp tiếng nói cười, tiếng lật trang sách và mùi cà phê thơm nức, người ta dễ dàng bắt gặp một hình ảnh đầy nghệ thuật: một người đàn ông tóc điểm bạc, cặm cụi gọt từng chiếc bút chì, cẩn trọng quan sát từng đường nét trên khuôn mặt người đối diện để họa nên những bức chân dung sống động.
          </p>
        </FadeSection>
      </article>

      {/* ── Bản đồ tương tác Đường Sách Nguyễn Văn Bình ── */}
      <InteractiveBookStreetmap />

      {/* ── Article body tiếp tục ── */}
      <article className="max-w-[700px] mx-auto px-4 sm:px-6">
        {/* Video phóng sự tài liệu */}
        <FadeSection>
          <ArticleVideo />
        </FadeSection>

        {/* ─ Chapter 1 ─ */}
        <ChapterHeading
          title="Nhịp sống phố sách và nốt trầm mang tên Lê Phú"
          icon={<BookOpen className="w-4 h-4" />}
        />

        <StatRow />

        {/* Image 2 */}
        <ArticleImage
          src="/assets/hoa-si/image2.png"
          alt="Họa sĩ Lê Phú tại Đường sách"
          caption="Họa sĩ Lê Phú (sinh năm 1957 tại Thủ Đức) — người đã gắn bó với Đường sách ngay từ những ngày đầu đi vào hoạt động."
        />

        <FadeSection>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Thăng trầm cùng cái nghề vẽ tranh, ông Phú kể lại, sau ngày đất nước thống nhất, nhờ năng khiếu và niềm đam mê hội họa, ông xin vào làm việc tại Trung tâm Văn hóa - Thể thao Quận 10. Mối duyên ấy bắt đầu từ những ngày tháng vẽ tranh cổ động, áp phích tuyên truyền hay pano khổ lớn khi công nghệ in ấn chưa phát triển.
          </p>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Sau này, ông trau dồi thêm tay nghề tại Trường Đại học Mỹ thuật TP.HCM. Nhưng rồi làn sóng máy móc hiện đại tràn đến, nhu cầu vẽ thủ công giảm dần, ông chuyển sang mở tiệm vẽ bảng hiệu quảng cáo và tập tành ký họa chân dung tặng bạn bè.
          </p>
        </FadeSection>

        <PullQuote text="Được nhiều người khen ảnh 'có hồn', ông được tiếp thêm sức mạnh để gắn bó với công việc này." />

        {/* ─ Chapter 2 ─ */}
        <ChapterHeading
          title="Nét chì nối nhịp tâm hồn giữa lòng phố thị"
          icon={<Pencil className="w-4 h-4" />}
        />

        {/* Image 3 */}
        <ArticleImage
          src="/assets/hoa-si/image3.png"
          alt="Họa sĩ Lê Phú đang vẽ chân dung"
          caption="Họa sĩ thận trọng và tỉ mỉ trong từng nét vẽ than chì khi ký họa chân dung cho khách tại Đường sách TP.HCM."
        />

        <FadeSection>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Từ khi Đường sách mở cửa, góc nhỏ của họa sĩ Lê Phú đã trở thành một phần ký ức của nhiều du khách. Với mức giá vô cùng bình dân — chỉ cần bỏ ra một khoản chi phí vừa túi tiền cho một tác phẩm nghệ thuật thủ công — ai cũng có thể dễ dàng sở hữu cho mình một tấm chân dung ký họa đen trắng đầy thần thái.
          </p>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Kết thúc tác phẩm người nghệ sĩ già không quên ký tên của chính mình nhằm đánh dấu chủ quyền tác phẩm. Chỉ vỏn vẹn trong khoảng <strong>10 phút</strong> tỉ mỉ, bằng đôi bàn tay tài hoa và sự tập trung cao độ, từng nét than chì qua tay ông đã làm hiện lên góc mặt, nụ cười hay ánh mắt sống động của nhân vật. Ngoài vẽ trực tiếp tại chỗ, ông còn nhận vẽ qua ảnh chụp do khách gửi.
          </p>
        </FadeSection>

        <PullQuote text="Chỉ vỏn vẹn 10 phút, từng nét than chì đã làm hiện lên góc mặt, nụ cười hay ánh mắt sống động." />

        {/* ─ Chapter 3 ─ */}
        <ChapterHeading
          title="Trái tim con người — điều AI không thể thay thế"
          icon={<Cpu className="w-4 h-4" />}
        />

        {/* Image 4 */}
        <ArticleImage
          src="/assets/hoa-si/image4.png"
          alt="Sự tương tác trực tiếp giữa họa sĩ và khách"
          caption="Giữa thời đại AI phát triển, sự tương tác và cảm xúc trực tiếp giữa họa sĩ với nhân vật là giá trị thủ công không thể thay thế."
        />

        <FadeSection>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Trong thời đại số hóa đang phát triển, khi các công cụ tạo ảnh bằng trí tuệ nhân tạo (AI) có thể vẽ ra một bức chân dung sắc nét chỉ trong vài giây, nhiều người không khỏi trăn trở về số phận của những người làm nghề vẽ thủ công như ông Phú.
          </p>
          <p className="text-base sm:text-lg leading-[1.85rem] sm:leading-[2.1rem] text-stone-800 mb-5 text-justify">
            Nhưng thiết nghĩ, công nghệ có thể mô phỏng lại đường nét, không thể mô phỏng được nhịp đập cảm xúc, ánh mắt dõi theo nhân vật hay cái "tâm" mà người thợ đặt vào từng nét vẽ. Vì vậy, đó không chỉ là nơi mua bán một sản phẩm nghệ thuật giá trị với mức chi phí hợp lý, mà còn là nơi lưu giữ nét đẹp lao động thủ công truyền thống — một giá trị văn hóa đầy tính nhân văn đáng được trân trọng và gìn giữ giữa kỷ nguyên công nghệ.
          </p>
        </FadeSection>

        {/* Final pull quote */}
        <FadeSection>
          <div className="my-10 bg-[#A9324E] text-white px-6 sm:px-10 py-8 rounded-3xl shadow-lg text-center">
            <p className="font-serif text-xl sm:text-2xl italic leading-relaxed">
              "Đó không chỉ là nơi mua một sản phẩm nghệ thuật,
              <br className="hidden sm:block" /> mà là nơi lưu giữ giá trị văn hóa đầy nhân văn."
            </p>
          </div>
        </FadeSection>

        {/* Credits */}
        <FadeSection className="mt-12 mb-4">
          <div className="text-right text-sm text-stone-600 space-y-0.5">
            <p>
              <span className="italic">Nội dung:</span>{" "}
              <strong className="text-stone-800">Đường sách Nguyễn Văn Bình</strong>
            </p>
            <p>
              <span className="italic">Thực hiện:</span>{" "}
              <strong className="text-stone-800">Nguyễn Thị Thu Hiệp</strong>
            </p>
          </div>
        </FadeSection>
      </article>

      {/* Comments */}
      <Comments />

      {/* Footer */}
      <footer className="bg-[#ede1c7] border-t border-[#d6c7ab] py-10 px-5 text-xs text-stone-600 text-center mt-10">
        <p>Đường sách Nguyễn Văn Bình · TP. Hồ Chí Minh</p>
      </footer>

      <BackToTop />
    </main>
  );
}

