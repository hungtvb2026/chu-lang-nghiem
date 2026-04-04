# Chú Lăng Nghiêm – Học Thuộc

Ứng dụng học thuộc Chú Lăng Nghiêm bằng phương pháp **điền từ còn thiếu**, gamified với hệ thống XP, Level, Streak và Achievements.

## ✨ Tính năng chính

- 📖 **5 Đệ** — Học từng đệ hoặc tất cả (554+ câu)
- 🎮 **4 chế độ luyện tập** — Điền từ · Tiến độ · Flash · Ngẫu nhiên
- 🎯 **4 độ khó** — Dễ (15%) · Vừa (30%) · Khó (50%) · Siêu khó (80%)
- ⭐ **Gamification** — XP, Level, Daily Streak, Daily Goal, 12 Achievements
- 📊 **Dashboard thống kê** — Lịch luyện tập, accuracy, tiến độ theo Đệ
- 💾 **Lưu tiến trình** vào localStorage
- 📱 **Responsive** — Mobile-first với bottom tab bar
- ⌨️ **Keyboard shortcuts** — Chuyển trang, mode, làm mới
- 🎉 **Animations** — Confetti, XP popup, shake, glow effects

## 🚀 Chạy Local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📦 Deploy Vercel

```bash
npx vercel --prod
```

## 🛠️ Tech Stack

| | |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v3 + CSS Variables |
| Icons | Lucide React |
| Fonts | Plus Jakarta Sans + Crimson Pro |
| State | React hooks + localStorage |
| Deploy | Vercel |

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | Tech stack, project structure, data flow, design system |
| [Features](docs/FEATURES.md) | Chi tiết tất cả tính năng, modes, gamification |
| [Known Issues](docs/KNOWN_ISSUES.md) | Pain points, improvement plan, status tracking |
