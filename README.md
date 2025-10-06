# Mobigenius HR

Ứng dụng quản lý quy trình tuyển dụng (HR Agent) xây dựng với Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, và dnd-kit.

## Tính năng chính
- Bảng kanban theo giai đoạn: CV Mới, Đang Sàng Lọc, Vòng thi, Phỏng vấn, Offer, Đã tuyển, Từ chối
- Kéo thả ứng viên giữa các cột (dnd-kit)
- Sidepanel chi tiết ứng viên (Sheet) kèm hành động nhanh
- Gửi email theo ngữ cảnh (mời phỏng vấn, offer, từ chối) với modal soạn thảo và preview
- Trạng thái email theo từng giai đoạn (emailStatusByStage) hiển thị badge “Đã gửi email” trên card
- Luồng từ chối (reject): mở modal email từ chối khi đánh giá “Không phù hợp”, hỗ trợ gửi lại email ở cột Từ chối
- Ràng buộc kéo thả: không cho kéo từ Từ chối sang cột khác trừ “Đang Sàng Lọc”
- Cấu hình: Vị trí tuyển dụng, Tiêu chí sàng lọc, Mẫu email
  - Tiêu chí chung cho mọi vị trí (global/common criteria)
  - Tiêu chí riêng theo từng vị trí

## Công nghệ
- Next.js 14, React 18, TypeScript
- TailwindCSS, shadcn/ui
- dnd-kit (@dnd-kit/core, @dnd-kit/sortable)
- date-fns

## Cài đặt & Chạy
1) Cài dependency
```bash
pnpm install
# hoặc
npm install
```

2) Chạy dev
```bash
pnpm dev
# hoặc
npm run dev
```

3) Mở trình duyệt: http://localhost:3000

## Scripts hữu ích
```bash
pnpm dev          # chạy bản phát triển
pnpm build        # build production
pnpm start        # chạy production đã build
```

## Cấu trúc thư mục (rút gọn)
- app/
  - hr-agent/page.tsx: Trang chính HR Agent (kanban, kéo thả, modal email)
  - config/page.tsx: Trang cấu hình vị trí, tiêu chí, mẫu email
- components/: UI và modal (candidate-detail, email-composition, sidebar, ui/*)
- lib/
  - data-store.ts: store dữ liệu ứng viên, hoạt động, email status theo stage
  - config-store.ts: store vị trí, tiêu chí (gồm tiêu chí chung), mẫu email
  - types.ts: định nghĩa kiểu dữ liệu

## Lưu ý quan trọng
- Email status theo từng giai đoạn: `Candidate.emailStatusByStage[stage] = { sent, lastSent }`
- Khi đánh giá “Không phù hợp” ở sàng lọc: tự chuyển sang rejected và mở modal email từ chối
- Ở cột rejected: có nút “Gửi lại email từ chối”; badge “Đã gửi email” hiển thị khi đã gửi
- Kéo từ rejected chỉ cho phép quay lại screening; đồng thời reset status = pending để mở lại hành động

## Đẩy code lên GitHub (tóm tắt)
```bash
git init && git branch -M main
git add .
git commit -m "feat: email per-stage, reject flow, global criteria"
git remote add origin <your-repo-url>
git push -u origin main
```

## Giấy phép
Nội bộ (Mobifone IT).
