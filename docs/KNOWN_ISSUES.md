# 🚨 Known Issues & Improvement Plan

> Last updated: 2026-04-04

---

## 🟢 Resolved Items (Completed)

Tất cả các vấn đề kiến trúc cốt lõi và thiếu sót tính năng lớn đều đã được giải quyết:

- ✅ **God Component Refactored**: `QuizClient.tsx` đã được chia nhỏ thành các custom hooks (`useQuizEngine`, `useGameStats`) và các sub-components.
- ✅ **Test Coverage**: Viết bộ 51 tests dùng Vitest bao quát toàn bộ quiz logic, seed engine, và XP calculator.
- ✅ **Single Source of Truth**: Xóa `verseData.ts` trùng lặp, dùng trực tiếp `verses.json`.
- ✅ **Styling Consistency**: Chuẩn hóa CSS Variables và Tailwind classes (Đã hỗ trợ Light/Dark Theme bằng `next-themes`).
- ✅ **Data Integrity & Backup**: Cập nhật localStorage schema có `version`, thêm tính năng Backup/Restore data JSON.
- ✅ **State Management**: Chuyển Notification sang React Context (`NotificationProvider`).
- ✅ **URL Routing**: Thêm `useUrlState` để hỗ trợ deep-linking theo Query Parameters.
- ✅ **Performance**: Tối ưu Render với `React.memo` và Canvas-based `canvas-confetti`.
- ✅ **Settings UI**: Giao diện Settings cho phép điều chỉnh ItemsPerPage, GoalXP, Flash Duration.
- ✅ **Spaced Repetition (Ôn tập)**: Thêm chế độ Smart/Spaced Repetition để học các từ sai nhiều nhất.
- ✅ **PWA Support**: Support Cài đặt App Offline với `@ducanh2912/next-pwa`.

---

## 🟡 Future Improvements (Minor)

Dù đã hoàn thiện kiến trúc, một số cải tiến có thể được cân nhắc cho các phiên bản tương lai:

### 1. Multi-device Sync (Cloud)
**Problem:** Hiện tại data chỉ lưu ở `localStorage`. User đổi điện thoại hoặc lướt web ẩn danh sẽ bị mất progress (trừ phi dùng import/export thủ công).
**Proposed Fix:** 
- Thêm Backend (Supabase / Firebase) hoặc Next-Auth để login.
- Sync `localStorage` lên database thông qua API.

### 2. Social Sharing
**Problem:** User chưa có cơ chế share streak hoặc achievement lên mạng xã hội (Facebook, Zalo).
**Proposed Fix:**
- Add Web Share API.
- Tạo OG Images generate (Open Graph) để chia sẻ có ảnh preview đẹp mắt.

### 3. SEO Limited
**Problem:** Chưa có `sitemap.xml`, `robots.txt` cho App.
**Proposed Fix:** Khai báo metadata next.js tĩnh, thêm `sitemap.ts`.

### 4. Audio Pronunciation
**Problem:** Không có tính năng phát âm thanh / đọc kinh niệm cho user nghe.
**Proposed Fix:** Cung cấp audio mp3 file, sync theo từng dòng kinh.

---

## Progress Tracking

| # | Feature / Issue | Severity | Status |
|---|---|---|---|
| 1 | God Component Split | 🔴 Critical | ✅ Completed |
| 2 | Unit Tests (Vitest) | 🔴 Critical | ✅ Completed |
| 3 | Light/Dark Theme | 🟠 Significant | ✅ Completed |
| 4 | Offline PWA | 🟠 Significant | ✅ Completed |
| 5 | Spaced Repetition | 🟠 Significant | ✅ Completed |
| 6 | URL Routing | 🟡 Minor | ✅ Completed |
| 7 | Data Backup/Restore | 🟡 Minor | ✅ Completed |
| 8 | Cloud Sync | 🟡 Minor | ⬜ Not started |
| 9 | Social Sharing | 🟡 Minor | ⬜ Not started |
| 10 | Audio Features | 🟡 Minor | ⬜ Not started |
