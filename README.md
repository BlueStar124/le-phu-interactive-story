# Họa Sĩ Lê Phú — Những Bức Chân Dung "Có Hồn"

> Phóng sự ảnh đa phương tiện & Bản đồ tương tác (Interactive Scrollytelling) về Họa sĩ Lê Phú tại Đường sách Nguyễn Văn Bình, TP. Hồ Chí Minh.

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.4-blue?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=flat-square&logo=typescript)

---

## ✨ Điểm nổi bật
- **Phong cách Báo chí Scrollytelling:** Tông màu hoài niệm `#FAF2DE`, chữ Serif Lora & Sans-serif Be Vietnam Pro chuẩn typographic tiếng Việt, văn bản căn đều hai bên (`text-justify`).
- **Bản đồ isometric tương tác 144m Đường Sách:** Tích hợp chế độ Auto Tour tự động khám phá 6 điểm mốc văn hóa, phóng to thu nhỏ (Zoom In/Out), kéo thả chuột & vuốt chạm cảm ứng (Touch Drag & Pan) trên thiết bị di động.
- **Tối ưu Mobile-First:** Responsive 100%, không tràn lề ngang, trải nghiệm mượt mà trên iPhone/Android.
- **Hệ thống phản hồi bạn đọc:** Khu vực bình luận trực quan với tính năng thả tim cảm xúc.

---

## 🚀 Cấu trúc dự án
```
hoa-si-chan-dung/
├── public/
│   ├── assets/hoa-si/      # Hình ảnh phóng sự & bản đồ màu nước isometric
│   ├── icon.svg            # Favicon vector sắc nét
│   ├── favicon.ico
│   └── favicon.png
├── src/
│   ├── app/
│   │   ├── globals.css     # Tailwind v4, căn lề justify, typography tiếng Việt
│   │   ├── layout.tsx      # Metadata SEO, OpenGraph, font imports
│   │   └── page.tsx        # Hero, các chương phóng sự, số liệu thống kê, bình luận
│   ├── components/
│   │   └── InteractiveBookStreetmap.tsx  # Component bản đồ tương tác & thẻ thông tin
│   └── lib/
│       └── utils.ts
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🛠 Hướng dẫn cài đặt & khởi chạy

1. **Cài đặt dependencies:**
```bash
npm install --legacy-peer-deps
```

2. **Chạy máy chủ phát triển:**
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3001](http://localhost:3001).

3. **Kiểm tra TypeScript & Build Production:**
```bash
npm run check
# hoặc
npm run build && npm run start
```
