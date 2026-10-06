# Kết nối bình luận với Google Sheets

Web đã có API `/api/comments` và giao diện gửi/đọc bình luận thật. Kết nối Google Sheets đã được cấu hình cho cả môi trường cục bộ và website Production trên Vercel.

## Sheet đã tạo cho dự án

Ngày 06/10/2026 đã tạo [Bình luận web Họa sĩ Lê Phú](https://docs.google.com/spreadsheets/d/1JsiPKYOtsKHCKT5eVh4fu8EZ8fsdfA3yBn_qPfweVU0/edit) trong thư mục **ChatGPT** trên Google Drive. Sheet riêng tư, có tab **Comments** và **Likes**, hàng tiêu đề cố định, trạng thái `pending` / `approved` / `rejected`, cột `readerHash` của Comments được ẩn và múi giờ Việt Nam.

Đã chuẩn bị `.env.local` và bản script riêng `.comments-setup/Code.gs` với cùng khóa kết nối. Hai file này được Git bỏ qua. Bản `google-apps-script/Code.gs` chung vẫn là mẫu không chứa khóa.

**Kết nối đã hoàn tất:** Chrome đã kết nối. [Dự án Apps Script](https://script.google.com/u/0/home/projects/1b36Zxyf6qwMcmlt3Zr5xOJ8bNWQmFJiAPgz76xZ11raumVL0-tejK2Sm/edit) đã lưu mã, chạy **setup** và triển khai web app phiên bản 1 thành công với **Execute as: Me**, **Who has access: Anyone**. URL `/exec` đã được lưu vào `.env.local`.

Web cục bộ đã chạy tại [http://localhost:3001/#binh-luan](http://localhost:3001/#binh-luan). Kiểm tra trực tiếp qua giao diện web và Google Sheets đã xác nhận:

- Gửi bình luận ghi được dòng mới với trạng thái `pending`, web báo chờ duyệt.
- Đổi trạng thái thành `approved` làm bình luận xuất hiện khi tải lại danh sách.
- Lượt thích được ghi vào tab **Likes**, giữ nguyên sau khi tải lại trang; bỏ thích loại bỏ đúng lượt thích.
- Yêu cầu tới Apps Script với khóa sai bị từ chối (`UNAUTHORIZED`).
- Dòng thử ở **Comments!A2:F2** đã đổi sang `rejected` để ẩn khỏi web; tab **Likes** không còn lượt thích thử.

Sáu kiểm thử mã dùng mô phỏng Apps Script, kiểm tra TypeScript và build production cũng đã thành công.

## Website Production

[Mở website và phần bình luận](https://le-phu-interactive-story.vercel.app/#binh-luan). Dự án Vercel **le-phu-interactive-story** liên kết với repository **BlueStar124/le-phu-interactive-story**, tự triển khai khi push nhánh `main`. Bản mã bình luận `b683f25` đã triển khai thành công ngày 06/10/2026.

Hai biến `GOOGLE_COMMENTS_SCRIPT_URL` và `GOOGLE_COMMENTS_SECRET` đã được lưu dưới dạng **Secret** trong môi trường **Production** của Vercel. Khóa vẫn chỉ dùng phía máy chủ, không nằm trong GitHub hay mã gửi xuống trình duyệt.

Đã thử gửi bình luận trực tiếp trên website công khai, kiểm tra dòng `pending` trong Sheet, duyệt thành `approved` và kiểm tra lưu lượt thích sau khi tải lại trang. Dòng thử Production ở **Comments!A3:F3** được chuyển sang `rejected` sau kiểm thử và lượt thích thử được bỏ. Nếu Google phản hồi chậm hoặc báo lỗi tạm thời, bấm **Tải lại bình luận** để thử lại.

## 1. Tạo Google Sheet

Mở https://sheets.new, đặt tên **Bình luận web Họa sĩ Lê Phú**. Giữ quyền chia sẻ Sheet là **Bị hạn chế / Restricted**. Bạn không cần tự tạo cột hoặc chia sẻ Sheet cho khách truy cập.

## 2. Dán và chạy script

1. Trong Sheet, chọn **Tiện ích mở rộng → Apps Script**.
2. Xóa nội dung mẫu trong `Code.gs`, dán toàn bộ nội dung file [google-apps-script/Code.gs](../google-apps-script/Code.gs) của dự án và lưu.
3. Chọn hàm **setup** ở thanh công cụ, bấm **Chạy / Run**.
4. Chọn tài khoản của bạn và cấp quyền cho script truy cập bảng tính. Nếu Google hiện cảnh báo ứng dụng chưa xác minh, hãy kiểm tra đây là script bạn vừa tạo và mã bạn vừa dán trước khi tiếp tục.

Hàm `setup` tạo tab **Comments**, **Likes** và khóa kết nối ngẫu nhiên. Chạy lại không xóa bình luận. Script dùng múi giờ Việt Nam.

## 3. Triển khai Apps Script

1. Chọn **Triển khai / Deploy → Bản triển khai mới / New deployment**.
2. Bấm biểu tượng bánh răng, chọn **Ứng dụng web / Web app**.
3. **Thực thi với tư cách / Execute as:** chọn **Tôi / Me**.
4. **Ai có quyền truy cập / Who has access:** chọn **Bất kỳ ai / Anyone**, kể cả người chưa đăng nhập Google.
5. Bấm **Triển khai**, sao chép **URL ứng dụng web** kết thúc bằng `/exec`.

Quyền “Anyone” áp dụng cho endpoint của script. Sheet vẫn riêng tư; các yêu cầu đọc/ghi dữ liệu phải có khóa kết nối. Trình duyệt người đọc gọi API của web, API mới gọi Google.

Nếu tài khoản công ty/trường học không có lựa chọn “Anyone”, quản trị viên có thể đang hạn chế tính năng này. Dùng tài khoản Gmail cá nhân nếu phù hợp.

## 4. Thêm cấu hình vào web

Trong Apps Script, mở **Cài đặt dự án / Project Settings → Thuộc tính tập lệnh / Script Properties**. Sao chép giá trị **COMMENTS_SECRET** do `setup` tạo.

Ở thư mục gốc dự án, sao chép `.env.example` thành `.env.local`, rồi điền:

```dotenv
GOOGLE_COMMENTS_SCRIPT_URL=https://script.google.com/macros/s/MA_TRIEN_KHAI_CUA_BAN/exec
GOOGLE_COMMENTS_SECRET=KHOA_COMMENTS_SECRET_SAO_CHEP_TU_APPS_SCRIPT
```

Khởi động lại `npm run dev`. Khi đưa web lên hosting, thêm hai biến cùng tên trong cấu hình môi trường của hosting và triển khai lại. Không đặt tiền tố `NEXT_PUBLIC_`; không gửi khóa vào chat hoặc commit `.env.local`.

Hosting phải chạy được Next.js server/API (ví dụ môi trường Node.js hoặc Vercel). Bản xuất HTML tĩnh hoặc GitHub Pages không chạy được API này.

## 5. Thử và duyệt bình luận

1. Mở web, gửi một bình luận. Web báo đã nhận và chờ duyệt.
2. Mở tab **Comments**: bạn sẽ thấy dòng mới có cột `status` là **pending**.
3. Đổi `status` thành **approved** để duyệt, hoặc **rejected** để ẩn.
4. Trên web, bấm **Tải lại bình luận**. Bình luận được duyệt xuất hiện và vẫn còn sau khi tải lại trang hoặc mở trên máy khác.
5. Bấm Thích, tải lại trang để kiểm tra lượt thích đã lưu. Tab **Likes** chứa mỗi lượt thích theo trình duyệt.

| Cột trong Comments | Ý nghĩa |
| --- | --- |
| id | Mã bình luận, tự tạo; giữ nguyên |
| name | Tên bạn đọc |
| text | Nội dung bình luận |
| createdAt | Thời điểm gửi |
| status | pending: chờ duyệt; approved: hiển thị; rejected: ẩn |
| readerHash | Mã trình duyệt đã băm, cột ẩn dùng để hạn chế gửi lặp |

Giữ nguyên tên tab, tên cột và thứ tự cột. Bạn có thể sửa tên/nội dung hoặc đổi trạng thái để kiểm duyệt. Muốn ẩn bình luận, đổi trạng thái thay vì xóa dòng; các lượt thích vẫn được giữ nếu duyệt lại.

## Giới hạn và xử lý lỗi

- Web hiển thị 100 bình luận được duyệt mới nhất và tổng số được duyệt. Bấm tải lại để thấy thay đổi; không tự tải liên tục nhằm giảm số lần gọi Google.
- Mỗi trình duyệt gửi tối đa 1 bình luận/phút và 10 bình luận/24 giờ. Lượt thích giới hạn một lượt cho mỗi bình luận trên mỗi trình duyệt. Xóa cookie hoặc đổi trình duyệt sẽ tạo danh tính mới; đây là chống lặp cơ bản, không xác minh danh tính người thật.
- Nội dung được ghi dưới dạng văn bản và hiển thị bằng React, không chạy công thức hoặc HTML từ người bình luận.
- Nếu web báo chưa kết nối: kiểm tra hai biến môi trường và khởi động/triển khai lại web.
- Nếu web báo không kết nối được: kiểm tra URL `/exec`, quyền truy cập “Anyone” và khóa giống nhau ở hai nơi. Mở URL script trong cửa sổ ẩn danh phải thấy JSON thông báo dịch vụ, không phải trang đăng nhập.
- Sau khi sửa mã Apps Script: **Deploy → Manage deployments → Edit → Version: New version → Deploy**. Chỉ lưu mã chưa cập nhật bản `/exec`. Nếu tạo bản triển khai mới, cập nhật URL trên hosting.
- Apps Script có hạn mức và thời gian phản hồi phụ thuộc Google. Phương án này dành cho web nhỏ; khi lượng bình luận tăng nhiều, nên chuyển sang database.

Tài liệu Google: [triển khai Web Apps](https://developers.google.com/apps-script/guides/web), [hạn mức Apps Script](https://developers.google.com/apps-script/guides/quotas).
