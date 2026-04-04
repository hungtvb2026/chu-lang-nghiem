# 🏗️ Architecture Overview

> Last updated: 2026-04-04

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | `latest` |
| Language | TypeScript | `latest` |
| UI Library | React | `latest` |
| Styling | TailwindCSS v3 + CSS Variables + Inline styles | `^3` |
| Icons | Lucide React | `^1.7.0` |
| Fonts | Plus Jakarta Sans (sans) + Crimson Pro (serif) | Google Fonts |
| State | React hooks + localStorage | — |
| Deployment | Vercel | — |

> **Note:** Zero external state management, zero API routes, zero database.
> Everything is client-side with localStorage persistence.

---

## Project Structure

```
chu-lang-nghiem/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Server component — loads verse data
│   ├── QuizClient.tsx          # Client component — main quiz orchestrator
│   ├── layout.tsx              # Root layout, metadata, fonts
│   └── globals.css             # Design tokens, animations, utilities
│
├── components/                 # Reusable UI components
│   ├── QuizLine.tsx            # Individual quiz line with fill-in blanks
│   ├── FlashMode.tsx           # Flash card memorize→recall mode
│   ├── ShuffleMode.tsx         # Shuffle & repeat-wrong mode
│   ├── FullTextView.tsx        # Read-only full text viewer
│   ├── StatsTab.tsx            # Stats dashboard with charts
│   ├── ProgressBar.tsx         # Animated progress bar
│   ├── ModeSelector.tsx        # Practice mode picker (4 modes)
│   ├── DeSelector.tsx          # Section (Đệ) picker
│   ├── DifficultySelector.tsx  # Difficulty picker
│   ├── LevelBadge.tsx          # Level ring badge (header)
│   ├── StreakBadge.tsx         # Streak badge (header)
│   ├── DailyGoalRing.tsx       # Daily goal progress ring (header)
│   ├── XPPopup.tsx             # Floating "+N XP" notification
│   ├── AchievementToast.tsx    # Achievement unlock toast
│   ├── ConfettiCelebration.tsx # Confetti particle effect
│   └── SkeletonLoader.tsx      # Loading skeleton
│
├── lib/                        # Business logic & hooks
│   ├── types.ts                # Shared types (Verse, DeSection)
│   ├── data.ts                 # Data loading from JSON
│   ├── quiz.ts                 # Quiz generation (seeded shuffle)
│   ├── achievements.ts         # Achievement definitions & checking
│   ├── useSettings.ts          # Settings hook (localStorage)
│   ├── useProgress.ts          # Progressive mode level tracking
│   ├── useGameStats.ts         # Game stats hook (XP, streak, etc.)
│   ├── useSessionTimer.ts      # Session timer
│   └── verseData.ts            # ⚠️ Duplicate — see KNOWN_ISSUES.md
│
├── data/
│   └── verses.json             # 554+ mantra verses (source of truth)
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # This file
│   ├── FEATURES.md             # Feature documentation
│   └── KNOWN_ISSUES.md         # Pain points & improvement plan
│
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── vercel.json
└── postcss.config.mjs
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SERVER                                                       │
│                                                              │
│  verses.json ──→ data.ts ──→ page.tsx (getAllVerses)         │
│                                  │                           │
└──────────────────────────────────│───────────────────────────┘
                                   │ props: allVerses, sections
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ CLIENT                                                       │
│                                                              │
│  QuizClient.tsx                                              │
│  ├── quiz.ts → generateQuiz() → QuizVerse[]                 │
│  │   └── seededShuffle (deterministic random)               │
│  │                                                           │
│  ├── useSettings ←→ localStorage["chu_settings"]            │
│  ├── useProgress ←→ localStorage["chu_progress"]            │
│  ├── useGameStats ←→ localStorage["chu_game_stats"]         │
│  └── useSessionTimer (interval-based)                        │
│                                                              │
│  Components:                                                 │
│  ├── QuizLine    → fill-in-the-blank per verse              │
│  ├── FlashMode   → memorize phase → recall phase            │
│  ├── ShuffleMode → randomized, multi-round                  │
│  └── StatsTab    → dashboard visualization                  │
│                                                              │
│  Gamification:                                               │
│  ├── XPPopup          (CustomEvent-based)                   │
│  ├── AchievementToast (module-level callback)               │
│  └── ConfettiCelebration (CSS animation particles)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management

### localStorage Keys

| Key | Hook | Description |
|---|---|---|
| `chu_settings` | `useSettings` | Section (đệ) selection + difficulty |
| `chu_progress` | `useProgress` | Progressive mode level per section |
| `chu_game_stats` | `useGameStats` | XP, level, streak, achievements, daily history |

### Client-only State (useState)

| State | Scope | Description |
|---|---|---|
| `seed` | QuizClient | Random seed for quiz generation |
| `correctSet` | QuizClient | Set of correctly answered blanks |
| `tab` | QuizClient | Active tab (quiz/text/stats) |
| `mode` | QuizClient | Practice mode (fill/progressive/flash/shuffle) |
| `page` | QuizClient | Current pagination page |
| `settingsOpen` | QuizClient | Settings panel visibility |
| `showConfetti` | QuizClient | Confetti animation trigger |

---

## Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--bg-deep` | `#08090e` | Page background |
| `--bg-surface` | `#0e1017` | Surface background |
| `--bg-card` | `#13151e` | Card background |
| `--bg-elevated` | `#1a1d2a` | Elevated elements |
| `--accent` | `#e8a838` | Primary accent (Warm Amber) |
| `--indigo` | `#818cf8` | Secondary accent (Indigo) |
| `--success` | `#4ade80` | Correct / success states |
| `--error` | `#f87171` | Wrong / error states |

### Typography

| Role | Font | Weight |
|---|---|---|
| UI Text | Plus Jakarta Sans | 300–800 |
| Verse Text | Crimson Pro | 400–700 |

### Animations (13 keyframes)

`fadeInUp` · `glowPulse` · `shimmer` · `correctPop` · `shake` · `slideDown` · `fadeIn` · `float` · `xpFloat` · `toastIn` · `confettiDrop` · `timerPulse` · `levelUpGlow`
