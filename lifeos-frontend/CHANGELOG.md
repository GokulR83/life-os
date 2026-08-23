# 📜 LifeOS Changelog

All notable changes and upgrades to the LifeOS platform are documented in this file.

---

## [v2.0.0] - 2026-08-06 (Roadmap Upgrades & AI Integration)

### 🚀 Added & Enhanced
- **LocalStorage Persistence Layer (`P0.1`)**:
  - `src/utils/storage.js` hydrates app state from `localStorage` (`lifeos_data_v2`) on boot and syncs all mutations in real time.
  - Added **"Reset to Demo Seeds"** in `/settings`.
- **Theme-Aware Loading & Empty States (`P0.2`)**:
  - `SkeletonLoader.jsx` shimmer variants (`ring`, `table`, `card`) using theme tokens (`bg-theme-card-hover/40`).
  - `EmptyState.jsx` visual cards with action CTAs for zero-data states.
- **Global Command Palette `Cmd+K` (`P0.3`)**:
  - Installed `CommandPalette.jsx` indexing all 9 page routes, tasks, notes, flashcards, projects, and job applications.
  - Keyboard navigation (`Up`, `Down`, `Enter`, `Esc`) and global `Cmd+K` / `Ctrl+K` hotkey binding.
- **3-Tier Dashboard Redesign**:
  - **Tier 1 — Hero Ring Cluster**: Concentric SVG progress rings for Study Target %, Tasks Done %, and Daily Streak with trend arrows and one-word verdicts.
  - **Tier 1 — AI Daily Briefing**: Single-sentence AI briefing strip summarizing progress vs goals with daily caching.
  - **Tier 2 — Momentum Heatmap Row**: Weekly delta callouts (`↑ 14% vs last week`), journal date click-throughs, and pinned streak badges.
  - **Tier 3 — Actionable Split Row**: 2-column layout grouping next action items (`TodaysTasksWidget`, `UpcomingDeadlinesWidget`, and slim `FlashcardWidget`).
- **SuperMemo SM-2 Spaced Repetition**:
  - `src/utils/sm2.js` implementing interval scheduling (`easeFactor`, `interval`, `nextReviewDate`, `repetitions`).
  - Real computed **"N cards due today"** strip on Dashboard and full-screen review flow.
- **Job Kanban Funnel & Time-in-Stage**:
  - **Pipeline Conversion Funnel** stat bar (`Applied` → `OA` → `Interview` → `Offer` %).
  - **Time-in-stage** tracking on application cards (color-coded amber/rose when >7 days).
- **Focus Pomodoro Timer**:
  - `PomodoroTimer.jsx` with 25m Focus / 5m Break modes, progress ring, and automatic study session logging.
- **Data Portability & JSON Export/Import**:
  - 1-click **Export App Data (JSON)** & **Import App Data (JSON)** in `/settings`.

---

## [v1.0.0] - 2026-08-06 (Initial Frontend UI Release)
- Scaffolded Vite + React 19 + Tailwind v4 + React Router v7 stack.
- Built 11 initial mock JSON datasets across 9 full page views.
- Configured 6-preset multi-theme engine (`dark`, `light`, `sunset`, `blue`, `emerald`, `purple`).
- Implemented GeeksforGeeks-style calendar heatmap graph.
