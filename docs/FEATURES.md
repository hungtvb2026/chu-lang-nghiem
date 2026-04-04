# ✨ Features Documentation

> Last updated: 2026-04-04

---

## 1. Quiz Engine (Core)

### Fill-in-the-Blank
- Ẩn một tỷ lệ từ theo mức difficulty, user điền lại từ còn thiếu
- Answer validation: case-insensitive, tự động strip trailing punctuation (`;` `,` `.`)
- Auto-focus: Sau khi điền đúng, tự focus vào blank tiếp theo
- Hint system: Nhấn icon gợi ý sẽ hiện chữ cái đầu của từ bị ẩn

### Difficulty Levels

| Level | Label | Ratio ẩn từ | Emoji |
|---|---|---|---|
| Easy | Dễ | 15% | 🌱 |
| Medium | Vừa | 30% | 🌙 |
| Hard | Khó | 50% | 🔥 |
| Expert | Siêu khó | 80% | ⚡ |

### Seeded Randomization
- Dùng **Linear Congruential Generator** (LCG): `s = (s * 1664525 + 1013904223) >>> 0`
- Seed = `verse.id + seed * 997` — deterministic shuffle per verse
- Mỗi lần nhấn "Làm mới" sẽ tăng seed → tạo quiz pattern mới

---

## 2. Practice Modes

### 2.1 Điền từ (Fill Mode)
- **Mặc định**, standard fill-in-the-blank
- Chọn difficulty thủ công (Easy → Expert)
- Chọn section (Đệ) hoặc tất cả
- Pagination: 25 câu/trang

### 2.2 Tiến độ (Progressive Mode)
- Tự động mapping difficulty theo level:
  - Level 0 → Easy
  - Level 1 → Medium
  - Level 2 → Hard
  - Level 3+ → Expert
- Hoàn thành tất cả blanks → chọn "Ghi nhận & tăng độ khó"
- Level lưu riêng cho từng section (Đệ)
- Có nút Reset level

### 2.3 Flash Mode
- **Phase 1 — Memorize**: Hiện toàn bộ text của verse trong N giây (mặc định 3s)
  - Đồng hồ đếm ngược dạng SVG circular timer
  - Nút "Bỏ qua → Ghi ngay" để skip
- **Phase 2 — Recall**: Ẩn tất cả từ (Expert difficulty 80%), user điền lại
- Tiến hành từng câu một (card-by-card)
- Kết thúc: báo số câu sai, nếu 0 sai → unlock achievement "Siêu Trí Nhớ"

### 2.4 Ngẫu nhiên (Shuffle Mode)
- Xáo trộn thứ tự tất cả verses
- Multi-round: Sau mỗi vòng, chỉ luyện lại các câu sai
- Kết thúc khi tất cả câu đều đúng trong 1 vòng
- Báo cáo: số vòng + tổng câu sai

### 2.5 Ôn tập (Smart Mode - Spaced Repetition)
- Hệ thống theo dõi lịch sử sai (`wrongVerseCounts`)
- Chủ động nhặt các câu có tỷ lệ sai cao nhất để ưu tiên ôn tập
- Khi gõ đúng, số đếm sai tự động giảm ("heal")
- Cực kỳ hữu hiệu cho việc củng cố trí nhớ với các câu kinh hóc búa

---

## 3. Gamification System

### 3.1 XP (Experience Points)
- **+10 XP** mỗi blank điền đúng
- **+100 XP** bonus khi hoàn thành session
- XP floating popup animation khi nhận

### 3.2 Level System
- Công thức: `xpForLevel(L) = 50 × L × (L - 1)`
- Ví dụ: Level 2 = 100 XP, Level 3 = 300 XP, Level 5 = 1,000 XP
- Level up → Confetti celebration animation
- Hiển thị trên header badge + stats dashboard

### 3.3 Daily Streak
- Tính dựa trên `lastActiveDate` so với today
- Streak +1 nếu hôm qua active HOẶC lần đầu
- Streak reset về 0 nếu skip ≥ 2 ngày
- Badge thay đổi: ❄️ (0) → ✨ (1-6) → 🔥 pulse (7+)

### 3.4 Daily Goal
- Mục tiêu: 50 XP/ngày (hardcoded)
- Hiển thị trên header ring + stats tab progress bar
- ✅ icon khi đạt goal

### 3.5 Achievements (12 total)

| ID | Tên | Điều kiện | Hạng |
|---|---|---|---|
| `first_step` | Sơ Khởi | Hoàn thành 1 session | 🥉 Bronze |
| `streak_3` | Tinh Tấn | 3-day streak | 🥉 Bronze |
| `streak_7` | Kiên Trì | 7-day streak | 🥈 Silver |
| `streak_30` | Bất Thoái Chuyển | 30-day streak | 🥇 Gold |
| `xp_100` | Nhập Môn | 100 XP total | 🥉 Bronze |
| `xp_1000` | Tinh Thông | 1,000 XP total | 🥈 Silver |
| `xp_10000` | Kim Cương | 10,000 XP total | 💎 Diamond |
| `de_1` | Đệ Nhất Thành | Hoàn thành Đệ Nhất | 🥉 Bronze |
| `de_all` | Chinh Phục | Hoàn thành cả 5 Đệ | 🥇 Gold |
| `flash_master` | Siêu Trí Nhớ | Flash perfect (0 sai) | 🥇 Gold |
| `accuracy_90` | Chính Xác | ≥90% accuracy (min 50 câu) | 🥈 Silver |
| `level_10` | Thập Cấp | Đạt Level 10 | 🥇 Gold |

---

## 4. Stats Dashboard

### Today Card
- XP earned, correct/wrong count, accuracy percentage
- Daily goal progress bar

### Streak Calendar
- Heatmap 28 ngày gần nhất (4 tuần)
- Intensity dựa trên XP của ngày đó
- Hiển thị kỷ lục streak

### Tổng quan
- Total correct/wrong, total time, sessions, best streak, Đệ completed

### Đệ Progress
- 5 section progress bars (Đệ Nhất → Đệ Ngũ)
- Completed vs pending status

### Achievement Gallery
- Grid tất cả 12 achievements
- Locked (mờ + icon 🔒) vs Unlocked (tier color + emoji)
- Tier badge: bronze/silver/gold/diamond

---

## 5. Navigation & UI

### Tabs
| Tab | Label | Icon | Content |
|---|---|---|---|
| `quiz` | Luyện tập | PenLine | Quiz modes (Fill, Progressive, Smart, Flash, Shuffle) |
| `text` | Toàn bộ | BookOpen | Full text reader |
| `stats` | Thống kê | BarChart3 | Stats dashboard |

### Settings & Configurations
- **Items Per Page**: Tùy chỉnh số câu hiển thị mỗi trang (10, 25, 50, Tất cả).
- **Daily Goal XP**: Tùy chỉnh mục tiêu XP luyện tập mỗi ngày (50 → 500 XP).
- **Theme Toggle**: Tuỳ chỉnh Giao diện Sáng (Light) / Tối (Dark) tích hợp bằng `next-themes`.
- **Data Backup**: Upload / Download progress (JSON) để lưu trữ và backup tiến trình học.
- **PWA Support**: Hỗ trợ cài đặt trên Điện thoại làm Web App ngoại tuyến.

### Responsive Layout
- **Mobile (< 640px)**: Bottom tab bar, compact header, stacked settings
- **Desktop (≥ 640px)**: Top tab bar, side-by-side layouts, keyboard hints

### Keyboard Shortcuts
| Key | Action |
|---|---|
| `←` `→` | Chuyển trang |
| `1` `2` `3` `4` | Chuyển mode |
| `Ctrl + Enter` | Làm mới quiz |
| `Esc` | Đóng settings |

---

## 6. Data

### Verse Structure
```json
{
  "id": 1,
  "text": "Nam mô tát đát tha",
  "de": 1
}
```

### Sections
| Đệ | Label | Description |
|---|---|---|
| 1 | Đệ Nhất | Phần 1 |
| 2 | Đệ Nhị | Phần 2 |
| 3 | Đệ Tam | Phần 3 |
| 4 | Đệ Tứ | Phần 4 |
| 5 | Đệ Ngũ | Phần 5 |

### Backup & LocalStorage (Schema v2)
- Toàn bộ dữ liệu được lưu cục bộ trên máy ở `localStorage: 'nghiem_stats'`.
- Hỗ trợ auto-migration tự động chuyển đổi cấu trúc cũ lên cấu trúc mới để đảm bảo User không bao giờ bị mất save tiến độ. Khả năng import/export trọn vẹn thông qua JSON files.
