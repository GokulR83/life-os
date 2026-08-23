# LifeOS Backend (Express + Mongoose)

Every number the UI used to compute in React now comes pre-computed from the API.
The frontend should be able to delete all of the inline `.reduce()`/`.filter()` math
in the components below and just render what these endpoints return.

## Run it

```bash
cp .env.example .env        # point MONGODB_URI at your Mongo instance
npm install
npm run seed                # loads seed/data/*.json (same data the UI shipped with) into Mongo
npm run dev                 # http://localhost:5000
```

There's no login yet — `resolveUser` middleware attaches a single demo user
to every request via `req.userId`. Every model already has a `user` field
and every service is scoped by `userId`, so swapping in real auth later is a
one-line change in `src/middleware/resolveUser.js`, not a rewrite.

## What moved server-side, and why

| UI component (before) | Derived value | Now lives in | Endpoint |
|---|---|---|---|
| `HeroRingsCluster.jsx` + `StatsOverview.jsx` (duplicated in both!) | `studyPct`, `taskPct`, `streakPct`, `velocityScore` | `dashboardService.getVelocity` | `GET /api/dashboard/velocity` |
| `AIDailyBriefing.jsx` | templated summary string | `dashboardService.getDailyBriefing` | `GET /api/dashboard/briefing` |
| `UpcomingDeadlinesWidget.jsx` | merge+sort of open tasks & active job apps | `dashboardService.getUpcomingDeadlines` | `GET /api/dashboard/deadlines` |
| `StreakHeatmap.jsx` | year grid, `totalSubmissions`, `activeDaysCount` | `heatmapService.getYearHeatmap` | `GET /api/heatmap/:year` |
| `FlashcardWidget.jsx`, `utils/sm2.js` | cards due today, SM-2 scheduling | `flashcardService` | `GET /api/flashcards/due-today`, `POST /api/flashcards/:id/review` |
| `Planner.jsx` | `overdueTasks`, `pendingTasks`, `totalEstMinutesRemaining`, kanban columns | `taskService` | `GET /api/tasks/stats`, `GET /api/tasks/kanban` |
| `ExpensesTab.jsx` | `totalMonthlySpend`, category breakdown / pie data | `expenseService.getExpenseSummary` | `GET /api/expenses/summary` |
| `StudyTab.jsx` | 7-day chart data, weekly total | `studyService.getWeeklyBreakdown` | `GET /api/study-sessions/weekly` |
| `DSARevision.jsx` | pattern `completionPct`, revision deck | `dsaService` | `GET /api/dsa/patterns`, `GET /api/dsa/revision-deck` |
| `JobSearch.jsx` | stale-application detection, pipeline counts | `jobService.getJobPipeline` | `GET /api/jobs/pipeline` |
| `Projects.jsx` | project `progress` % | `projectService` (real `Task.project` FK now) | `GET /api/projects` |
| `Settings.jsx` | JSON export/import backup | `userService` | `GET /api/user/export`, `POST /api/user/import` |
| `DataContext.toggleHabit` (mutated a counter) | habit `streak`, `completedToday` | `habitService` (derived from `completionLog`) | `GET /api/habits`, `POST /api/habits/:id/toggle` |
| `data/generateHeatmap.js` (random mock data) | heatmap cells | `heatmapService` (derived from real completed tasks + study sessions) | `GET /api/heatmap/:year` |

## Relationships that were missing before and are now real

1. **Project ↔ Task.** `projects.json` used to hardcode `progress`,
   `tasksCount`, `completedTasksCount` with zero link to actual tasks.
   `Task` now has a `project` ObjectId field; `projectService` aggregates
   real task counts to compute `progress` on every read.
2. **DsaPattern ↔ Flashcard.** `dsaPatterns.json` stored
   `cardsNeedingRevision` as a static number that could silently drift from
   the actual flashcards. It's no longer stored at all — `dsaService`
   counts `Flashcard` docs where `pattern === pattern.name` and
   `needsRevision: true` on every request.
3. **User streak ↔ activity.** `user.streak` used to be an integer bumped
   up/down directly by `toggleHabit`. Now it's recalculated
   (`streakService.recalculateStreak`) from the union of days with a
   completed task, a logged study session, or a completed habit — a single
   source of truth instead of three places that could disagree.
4. **Heatmap ↔ real activity.** The old heatmap was pre-generated random
   mock data (`data/generateHeatmap.js`), completely disconnected from
   tasks/study sessions. `heatmapService` now builds each day's cell from
   `Task.completedAt` and `StudySession.date` for that user.

## Project layout

```
src/
  models/       # one schema per module, all scoped by `user`
  services/     # ALL derivation/aggregation logic lives here — routes/controllers stay thin
  controllers/  # req/res glue, no business logic
  routes/       # one router per module, mounted under /api in routes/index.js
  middleware/   # resolveUser (auth stub), asyncHandler, errorHandler
seed/
  data/         # the original frontend JSON, used to seed Mongo
  seed.js       # wires relations (task.project, flashcard.pattern) on insert
```

## Full endpoint list

```
GET    /api/dashboard/summary        combined payload for the Dashboard page
GET    /api/dashboard/velocity
GET    /api/dashboard/deadlines
GET    /api/dashboard/briefing

GET    /api/tasks
GET    /api/tasks/stats
GET    /api/tasks/kanban
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/bulk-update
POST   /api/tasks/bulk-delete
DELETE /api/tasks/completed

GET    /api/habits
POST   /api/habits
PATCH  /api/habits/:id
DELETE /api/habits/:id
POST   /api/habits/:id/toggle

GET    /api/study-sessions
GET    /api/study-sessions/weekly
GET    /api/study-sessions/today
POST   /api/study-sessions

GET    /api/jobs
GET    /api/jobs/pipeline
POST   /api/jobs
PATCH  /api/jobs/:id/status

GET    /api/expenses
GET    /api/expenses/summary
POST   /api/expenses

GET    /api/dsa/patterns
GET    /api/dsa/revision-deck

GET    /api/flashcards
GET    /api/flashcards/due-today
POST   /api/flashcards
POST   /api/flashcards/:id/review   { quality: 0-5 }

GET    /api/notes
GET    /api/notes/folders
POST   /api/notes
PATCH  /api/notes/:id
DELETE /api/notes/:id

GET    /api/journal
POST   /api/journal                 upserts by date

GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PATCH  /api/projects/:id
DELETE /api/projects/:id

GET    /api/heatmap/:year

GET    /api/user/me
PATCH  /api/user/me
GET    /api/user/export
POST   /api/user/import
```

## Known simplification worth flagging

`DsaPattern.solvedProblems`/`totalProblems` are still author-managed inputs,
not derived — there's no "problem solved" event in this dataset to derive
them from (flashcards only track review/revision state, not LeetCode
completion). If you want that fully derived too, the fix is adding a
`ProblemAttempt` collection (`{ pattern, solved: bool, date }`) and counting
from it, same pattern as everything else here.
