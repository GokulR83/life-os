# ⚡ LifeOS — Personal Developer Productivity & Career Operating System

**LifeOS** is a high-performance, clean, modern SaaS web application UI built for developers, computer science students, and software engineers. Built with **React 19**, **Vite**, **Tailwind CSS v4**, **React Router v7**, **Recharts**, and **Lucide Icons**, LifeOS features local dummy datasets, an in-memory mutation state engine, a floating glassmorphic navigation system, and a 6-preset real-time theme engine.

---

## 🌟 Executive Feature Summary

### 🎨 1. Floating Glassmorphism UI & 6-Preset Multi-Theme Engine
- **Floating Glassmorphic Components**: Collapsible floating sidebar (`rounded-3xl` with `backdrop-blur-xl`) and top floating header with section category pills (`Overview`, `Analytics`, `Algorithms`, `Execution`, `Career`).
- **6 Curated Aesthetic Themes**:
  1. 🌙 **Obsidian Slate (Dark - Default)**: Deep Zinc background (`#090d16`) with warm orange accents (`#f97316`).
  2. ☀️ **Pure Minimal (Light)**: High-contrast light background (`#f8fafc`) with burnt orange accents (`#ea580c`).
  3. ⚡ **Cyberpunk Ocean (Blue)**: Oceanic Navy background (`#050b18`) with electric cyan accents (`#0284c7` & `#38bdf8`).
  4. 🌿 **Deep Forest (Emerald)**: Dark Emerald Obsidian (`#04120e`) with radiant emerald accents (`#10b981`).
  5. 🔮 **Dracula Midnight (Purple)**: Midnight Violet (`#0f0919`) with neon lavender & magenta accents (`#a855f7`).
  6. 🌅 **Dual-Tone Sunset Synthwave**: Neon Orange (`#f97316`) & Fuchsia Pink (`#ec4899`) dual-gradient glow.
- **Dynamic Theme Binding**: Changing themes in the topbar or `/settings` instantly updates `<html data-theme="...">` and recolors the entire application live in real time.

---

### 📊 2. GeeksforGeeks / LeetCode Style Heatmap Graph
- **Multi-Year Contribution Logs**: Full 365-day datasets for **2024**, **2025**, and **2026**.
- **Year Dropdown Filter**: Switch between `2026`, `2025`, and `2024` with instant annual submission totals (e.g. `1007 submissions in 2026`).
- **12 Distinct Month Blocks**:
  - Days are grouped into 12 month blocks (`Jan` through `Dec`) with visible gaps between months.
  - Compact 10px–12px cells (`w-2.5 h-2.5 md:w-3 md:h-3`).
  - Invisible offset spacers preserve natural month day bounds (28/30/31 days) without extra artificial squares.
  - Activity shades dynamically adapt to match the active theme palette.

---

### 🎴 3. Universal Flashcard Deck & Spaced Repetition Mode
- **Multi-Category Filter Pills**: Switch between `All`, `DSA`, `System Design`, `Frontend`, and `Career` categories.
- **3D Card Flip Animation**: Click cards to flip between question and answer key with syntax-highlighted code snippets.
- **Full-Screen Spaced Repetition**: Dedicated full-screen flashcard study flow featuring card progression counters, "Needs Revision" tags, and instant mastery marking.

---

### 💼 4. Job Search & 6-Column Kanban Pipeline
- **6-Stage Pipeline Board**: `Wishlist` ➔ `Applied` ➔ `OA (Assessment)` ➔ `Interview` ➔ `Offer` ➔ `Rejected`.
- **Company Cards**: View salary range, application date, contact person, notes, and quick status dropdown shifters.
- **Stale Application Alerts**: Highlights applications pending >7 days without recruiter response with quick follow-up email triggers.
- **Tailored Resume Versions**: Manage resume versions (`Resume_v1_FullStack.pdf`, `Resume_v2_Frontend_Infra.pdf`) with target role notes.

---

### ⏱️ 5. Focus Trackers & Expense Analytics
- **Study Sessions Tab**: Recharts Bar Chart of daily focus hours over the last 7 days + detailed focus log table + "+ Log Session" modal form.
- **Expenses Tab**: Recharts Pie Chart of expenses by category + monthly spend cap indicator + search/filter table + "+ Add Expense" modal.

---

### 📅 6. Tasks, Sprint Planner & Daily Habit Routines
- **Dual View Modes**: Switch between **Today Priority Checklist** (`High`, `Medium`, `Low` with deadline countdown timers) and **Sprint Board** (`Todo`, `In Progress`, `Done`, `Blocked`).
- **Daily Routines Checklist**: Habit tracking cards ("1hr DSA", "Read 20 pages System Design") with active streak counters (`14d`).

---

### 📖 7. Daily Journal & Reflection Engine
- **Calendar Picker & Timeline**: Select dates or browse past journal logs.
- **Emoji Mood Selector**: Tag entries with 🚀 Productive, 🧠 Deep Focus, ⚡ High Energy, 😌 Calm, or 😴 Exhausted.
- **Reflection Editor**: Write daily reflections, key wins, and challenges/blockers.

---

### 📁 8. Engineering Projects Portfolio
- **Visual Project Grid**: Progress bar percentages, status badges (`Planning`, `In Progress`, `Completed`), tech stack tags, and deadlines.
- **Milestone Breakdown Drawer**: View linked sub-tasks and project completion metrics.

---

## 🔍 In-Depth Module Specifications & UI Architecture

### 1. Dashboard System (`Dashboard.jsx`)
- **Primary Goal**: Serves as the developer's main daily landing page, synthesizing metrics from study, tasks, DSA, and career workflows.
- **Child Components**:
  - `StatsOverview.jsx`: Renders 4 glassmorphic metric cards (Study Time, Tasks Done, Streak, Active Job Apps) with top accent gradient bars, trend pills (`+18% vs yesterday`), and animated progress bars.
  - `StreakHeatmap.jsx`: Displays the 12-month GeeksforGeeks-style activity graph with year selection dropdown.
  - `TodaysTasksWidget.jsx`: Priority task list with instant check-off checkboxes and deadline badges.
  - `FlashcardWidget.jsx`: Category-filterable flashcards (`All`, `DSA`, `System Design`, `Frontend`, `Career`) with 3D flip animation.
  - `UpcomingDeadlinesWidget.jsx`: Timeline feed of upcoming project deadlines and scheduled recruiter interviews.

---

### 2. Analytics & Trackers Hub (`Trackers.jsx`)
- **Primary Goal**: Consolidates study focus hours, career applications, and personal dev expenses into a single multi-tab analytics suite.
- **Sub-Modules**:
  - **Study Tab (`StudyTab.jsx`)**: Displays a Recharts Bar Chart of daily focus hours over 7 days, summary stats (Total Hours, Average Focus, Target Ratio), a filterable focus session table, and a modal form to log new study sessions.
  - **Job Kanban Tab (`JobKanbanTab.jsx`)**: Displays a 6-column drag/shift application pipeline (`Wishlist`, `Applied`, `OA`, `Interview`, `Offer`, `Rejected`) with interactive stage shift controls.
  - **Expenses Tab (`ExpensesTab.jsx`)**: Displays a Recharts Pie Chart of expenses grouped by category, monthly spend indicator, category search, and "+ Add Expense" modal form.

---

### 3. DSA Revision Hub (`DSARevision.jsx`)
- **Primary Goal**: Accelerated computer science algorithm revision and interview preparation.
- **Key Features**:
  - **8 Pattern Cards**: Cover Sliding Window, Two Pointers, Fast & Slow Pointers, Merge Intervals, Top K Elements, Binary Search, BFS/DFS, and Dynamic Programming. Each card displays total solved problems, revision difficulty, and mastery progress bar.
  - **Full-Screen Spaced Repetition Mode**: Clicking "Start Revision Deck" opens a focused full-screen overlay for stepping through cards with code snippet previews, flip answers, and mastery toggles.

---

### 4. Planner & Sprint Task Manager (`Planner.jsx`)
- **Primary Goal**: Daily task execution and sprint planning.
- **Key Features**:
  - **Sprint Kanban Board**: Columns for `Todo`, `In Progress`, `Done`, and `Blocked` with instant status shifting.
  - **Daily Habits & Routine Checklist**: Habit cards ("Solve 2 LeetCode", "Review System Design") with active streak counters (`14d`) and instant check-off toggles.
  - **Task Priority Filters**: View tasks by `High`, `Medium`, or `Low` priority.

---

### 5. Code & Knowledge Base Notes (`Notes.jsx`)
- **Primary Goal**: Organization of technical notes, code snippets, and cheat sheets.
- **Key Features**:
  - **Split View Layout**: Left sidebar note list with search input + right markdown note viewer/editor.
  - **Syntax Highlighting**: Previews code snippets in `JavaScript`, `Python`, `C++`, and `SQL`.
  - **Flashcard Conversion**: "+ Convert to Flashcard" button automatically copies note questions into `flashcards.json` state for spaced repetition study.

---

### 6. Daily Journal & Reflection Engine (`Journal.jsx`)
- **Primary Goal**: Mindset tracking, daily reflections, and obstacle resolution.
- **Key Features**:
  - **Timeline & Date Selector**: View past journal reflections by date.
  - **5 Emoji Mood Tags**: Select between 🚀 Productive, 🧠 Deep Focus, ⚡ High Energy, 😌 Calm, and 😴 Exhausted.
  - **Structured Reflection Fields**: Form inputs for "What went well today?", "Key Wins", and "Challenges & Blockers".

---

### 7. Engineering Projects Portfolio (`Projects.jsx`)
- **Primary Goal**: Managing personal software engineering builds and open-source projects.
- **Key Features**:
  - **Project Grid**: Cards displaying project name, description, completion %, tech stack tags (`React`, `Node`, `Tailwind`, `Docker`), and status badges (`Planning`, `In Progress`, `Completed`).
  - **Project Drawer Modal**: Clicking a project opens a detailed modal showing linked sub-tasks and milestone breakdown.

---

### 8. Job Search & Resume Hub (`JobSearch.jsx`)
- **Primary Goal**: Centralizing recruiter outreach, resume versions, and application follow-ups.
- **Key Features**:
  - **Resume Versions Manager**: Organizes tailored resume drafts (`Resume_v1_FullStack.pdf`, `Resume_v2_Frontend_Infra.pdf`) with target role tags and upload dates.
  - **Stale Application Alerts**: Highlights applications pending >7 days without recruiter response with quick "Send Follow-up Email" triggers.
  - **Integrated Pipeline View**: Embedded 6-column Kanban pipeline board.

---

### 9. System Settings & Preferences (`Settings.jsx`)
- **Primary Goal**: Customizing user profile details, daily focus goals, theme modes, and notification toggles.
- **Key Features**:
  - **Developer Profile Card**: Update Name, Email, Avatar URL, and view current streak status.
  - **Focus Targets**: Adjust Daily DSA Solved Target and Daily Study Target Hours.
  - **6 Theme Preset Selector**: Interactive theme cards for live theme switching.
  - **Notification Toggles**: Toggles for daily study reminders, streak warning alerts, and job follow-up reminders.

---

### 10. In-Memory State Engine (`DataContext.jsx` & `ThemeContext.jsx`)
- **Primary Goal**: Zero-backend state management layer.
- **`DataContext.jsx`**: Loads initial mock datasets from `src/data/*.json` into React state. Provides helper functions (`toggleTask`, `addStudySession`, `updateJobStatus`, `addExpense`, `toggleFlashcardRevision`, `addNote`, `saveJournalEntry`, `updateUser`) that instantly mutate state in memory, allowing all UI components to re-render dynamically.
- **`ThemeContext.jsx`**: Manages active theme state (`dark`, `light`, `sunset`, `blue`, `emerald`, `purple`) and updates the root DOM attribute `<html data-theme="...">`.

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Framework** | React 19 (Vite) |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite` with `@theme` token binding) |
| **Routing** | React Router v7 (`BrowserRouter`, `Routes`, `Route`) |
| **Data Visualization** | Recharts (BarChart, PieChart, ResponsiveContainer) |
| **Icons** | Lucide React |
| **State Management** | Central React Context (`DataContext.jsx` & `ThemeContext.jsx`) |
| **Typography** | Plus Jakarta Sans (UI) & JetBrains Mono (Code) |

---

## 📂 Directory & File Architecture

```
c:/Gokul/demo-app-2/
├── index.html                  # Imports Plus Jakarta Sans & JetBrains Mono
├── vite.config.js              # Configured with React & Tailwind CSS v4 plugins
├── package.json
├── README.md
├── src/
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Router & Context provider wrapper
│   ├── index.css               # Tailwind v4 @theme tokens & 6 theme CSS variables
│   ├── context/
│   │   ├── DataContext.jsx     # Central in-memory state store with mutation methods
│   │   └── ThemeContext.jsx    # Multi-theme state provider (6 theme presets)
│   ├── data/
│   │   ├── user.json           # Developer profile & target goals
│   │   ├── tasks.json          # Priority & Sprint tasks
│   │   ├── studySessions.json  # Logged focus sessions
│   │   ├── jobApplications.json# Applications across 6 Kanban stages
│   │   ├── expenses.json       # Software, book & server expenses
│   │   ├── dsaPatterns.json    # 8 algorithm pattern stats
│   │   ├── flashcards.json     # Multi-category flashcards (DSA, System Design, Frontend, Career)
│   │   ├── notes.json          # Markdown notes with code blocks
│   │   ├── journalEntries.json # Daily reflections & mood tags
│   │   ├── projects.json       # Portfolio projects & milestones
│   │   └── heatmap.json        # 365-day activity logs (2024, 2025, 2026)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx     # Floating glassmorphism sidebar (collapsible)
│   │   │   ├── Topbar.jsx      # Floating glassmorphism top header with search & theme button
│   │   │   └── Layout.jsx      # Main layout wrapper
│   │   ├── dashboard/
│   │   │   ├── StatsOverview.jsx          # Top 4 glassmorphic metric cards with trend pills
│   │   │   ├── StreakHeatmap.jsx          # GeeksforGeeks 12-month calendar graph
│   │   │   ├── TodaysTasksWidget.jsx      # Priority tasks with countdown timers
│   │   │   ├── FlashcardWidget.jsx        # Universal flashcard widget with category filters
│   │   │   └── UpcomingDeadlinesWidget.jsx# Top 5 upcoming task & interview dates
│   │   ├── trackers/
│   │   │   ├── StudyTab.jsx               # Recharts bar chart & focus log table
│   │   │   ├── JobKanbanTab.jsx           # 6-column application pipeline board
│   │   │   └── ExpensesTab.jsx            # Recharts pie chart & expense log table
│   │   └── common/
│   │       ├── Badge.jsx                  # Theme-aware badges
│   │       ├── ProgressBar.jsx            # Animated progress bars
│   │       └── QuickAddModal.jsx          # Quick item creation modal
│   └── pages/
│       ├── Dashboard.jsx        (/)
│       ├── Trackers.jsx         (/trackers)
│       ├── DSARevision.jsx      (/dsa)
│       ├── Notes.jsx            (/notes)
│       ├── Journal.jsx          (/journal)
│       ├── Planner.jsx          (/planner)
│       ├── Projects.jsx         (/projects)
│       ├── JobSearch.jsx        (/job-search)
│       └── Settings.jsx         (/settings)
```

---

## ⚡ Getting Started & Quick Run

### 1. Installation
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will be accessible at **`http://localhost:5174/`**.

### 3. Production Build Verification
```bash
npm run build
```

---

## 🔒 No External Persistence Needed
All mutations (checking off tasks, adding study sessions, flipping flashcards, moving job application Kanban columns, logging expenses) update in-memory React state cleanly via `DataContext.jsx`. Data is populated instantly upon page load from the mock JSON files.
