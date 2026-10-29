# PSR Schedule Review — prototype

Prototype for a home exercise: the tool a cinema chain's operations admin uses to review, adjust and publish a weekly schedule produced by an optimization engine. The engine is faked. What matters is the review flow, not the optimizer, the visuals or code quality.

**The product bet:** the admin's real risk is not trusting the engine's output and re-checking everything by hand. Every screen exists to let him see what the engine did, change it with confidence, and see what each change cost.

## How we work
- Plan before building. One slice per session (see Build order). Commit at the end of each slice with a clear message.
- When you propose an approach, name the main alternative you rejected in one line. Ido logs where he overrides you.
- Build only what is in this file. If something seems missing, ask; don't invent features.
- Ask before adding any dependency beyond the stack below.
- Keep files small and focused: data, engine, and each UI area in their own files.

## Stack
- Vite + React + TypeScript. Static site, no backend, all state in memory (a refresh resets to the generated schedule; that's fine).
- Drag and drop: @dnd-kit/core, or plain pointer events if simpler.
- Plain CSS or CSS modules. No UI framework.
- Run: `npm install && npm run dev`. Deploy as a static site (Vercel or Netlify).

## Data (hardcoded, from the brief)
**One site: Downtown, Tel Aviv.** The week scheduled is Sun 6 – Sat 12 June 2027.

| Theatre | Seats | Cleaning |
|---|---|---|
| 1 | 320 | 25 min |
| 2 | 240 | 15 min |
| 3 | 180 | 15 min |
| 4 | 180 | 15 min |
| 5 | 90 | 10 min |
| 6 | 60, premium recliners | 20 min (10 + 10 premium) |

**Hours:** Sun–Thu 11:00–00:30; Fri–Sat 10:00–01:30. A screening after midnight belongs to the previous day. A screening must end by closing time.

**Movies** (runtime in minutes, demand 1–10): Gravity Well 148 / 9.4 · The Last Ferry 121 / 8.1 · Paper Lanterns 96 / 6.8 · Blue Hour 134 / 7.5 · Kibbutz Kids 3 88 / 8.9 · Sonata 167 / 5.2 · The Quiet Fleet 112 / 7.0 · Marmalade 84 / 6.1

**Rules (hard; never broken):**
1. Every screening falls within opening hours and ends by closing time.
2. Between two screenings in the same theatre: that theatre's cleaning time. The cleaning after the last screening of the day happens after closing, so it doesn't use screening time, and the theatre is clean at the next opening.
3. Night crew: any cleaning that starts at 22:00 or later is done by the site's single crew, one theatre at a time. Before 22:00, every theatre can be cleaned at once.
4. Coverage: every movie plays at least twice each day.
5. Start times are on 5-minute steps.

**Expected revenue per screening:** (demand ÷ 10) × seats × ₪45.

## The fake engine
One module, pure functions, deterministic (the same input always gives the same output). Two operations:

**Generate the week.** For each day, separately (days are independent):
- First place two screenings of every movie (coverage), then fill the remaining time to maximize revenue: strongest demand into the largest theatres.
- A simple greedy approach is fine. The output must be valid under all rules.
- Keep the generated schedule as the **engine's baseline**; the revenue gap is measured against it.

**Re-plan after a drag.** Input: the day, the current schedule, and the drag (screening, new theatre, new start time). The re-plan is **local**: it changes only what the drag affects.
- The dragged screening is pinned at its new place. Pinned screenings never move.
- In the target theatre, screenings overlapping the new slot, or after it, are shifted later or moved into the gap the drag left in the source theatre.
- In the source theatre, the freed gap may be filled with the best movie that fits.
- If a cleaning after 22:00 changes, other theatres' screenings after 22:00 may shift in time to respect the single night crew. They shift; they are never reassigned.
- A screening that no longer fits anywhere in scope is removed, unless removing it breaks coverage.
- Maximize revenue within that scope only. Don't re-plan the whole day.

**A drag is blocked** (nothing changes) when it would:
- end after closing,
- overlap a pinned screening, or
- require removing a screening that would leave a movie below two that day.

A blocked drag returns a plain-language reason, for example: "Can't move Sonata to Theatre 2 at 23:10: it would end at 01:57, after closing (00:30)."

**Every screening carries structured reasons**, which the UI displays and never invents. Kinds of reason:
- coverage ("2nd of 2 required screenings of Sonata today")
- revenue ("₪X expected: demand 9.4 × 320 seats")
- start time set by cleaning ("waits for the 25-min cleaning of Theatre 1")
- start time set by the night crew ("waits for the night crew, cleaning Theatre 4 until 22:40")
- pinned by the admin

**Every re-plan returns a list of changes:** for each screening, moved (from, to), added or removed, and the reason. The engine's list is the only source for what the UI shows as changed.

## Screens

### 1. Review the schedule (the deep flow; must fully work)
- **Header:** site, week, and status (Draft or Published). Day tabs Sun–Sat, each showing that day's hours. Weekend days are marked.
- **Timeline:** a row per theatre (number and seats), time running left to right from opening to closing. Screenings are blocks showing the movie and start–end time. Cleaning is shown as a thin block after each screening. The timeline extends a little past closing: the closing time is a clear vertical line, and the end-of-night cleaning after the last screening of each theatre is shown past it, in grey.
- **Drag:** a block can be dragged to a new time in the same row or to another row. It snaps to 5 minutes. On drop, the engine re-plans and the result is applied immediately.
- **After a drag:**
  - Every changed screening is highlighted, with a faint ghost at its old position. Removed screenings appear only as ghosts.
  - The dragged screening shows a pin icon.
  - Highlights stay until the next action.
  - A change summary shows: "N screenings changed · revenue change for this drag: +/−₪X".
- **Blocked drag:** the block snaps back, and a message shows the reason, with an "Edit rules" link (stub).
- **Revenue indicator (always visible):** "Compared with the engine's schedule: −₪X today · −₪Y this week." Neutral wording; never "loss" or "lost revenue."
- **Side panel:**
  - Click a screening to see its reasons, from the engine.
  - Below that, the change history for the day: one line per drag, with what moved and why.
- **Rules enforced:** a small collapsible list of the five rules above.
- **Toolbar:**
  - Undo: one change back, as many times as needed.
  - Reset to the engine's schedule: restores the baseline and clears pins; asks for confirmation.
  - Publish week: opens a confirmation showing how many screenings changed across the week, which days were edited, and the revenue compared with the engine's schedule. On confirm, status becomes Published, the schedule is read-only, and a banner appears.

### 2. Generate (thin, but works)
"Generate schedule for the week of 6 June" button → short fake loading → Review screen on Sunday.

### 3. Setup (read-only, one page)
One page with a section for each input, built from the data above. Each section shows a note: "Editing would happen here."
- **Sites:** Downtown, Northgate and Valley Mall. Only Downtown is set up; the other two say "not set up in this prototype."
- **Theatres:** number, seats, premium flag and cleaning time.
- **Movies:** title, runtime and demand score.
- **Hours:** weekday and weekend hours, plus the summer override (July–August, 10:00–01:30 every day), marked "not active for this week."
- **Cleaning and crew rules:** the cleaning times by size, and the single night crew after 22:00.
- **Ticket price:** ₪45, the same in every theatre, used for expected revenue.

### Navigation
A simple left nav: Setup, Generate, Review.

## Out of scope; don't build
Other sites, chat or any language-model call, editing inputs, multi-user approval, editing a published schedule ("Create new version" can be a disabled button), unpinning, holidays and seasonal overrides, swapping which movie plays in a screening, persistence, auth, mobile layout.

## Build order (one slice per session)
1. Data, engine generate, static timeline with day tabs. Check: every day's schedule passes all five rules, verified with a small check function you write and run.
2. Drag, local re-plan, undo and reset.
3. Highlights, ghosts, pin icon, change summary, revenue indicator.
4. Side panel with reasons and change history; rules list.
5. Blocked drags with messages.
6. Publish flow, Generate screen, Setup stubs, navigation.
7. Deploy, and run the demo script below end to end.

## Demo script (must work after slice 7)
1. Generate → Review opens on Sunday.
2. Click a screening → its reasons appear.
3. Drag a mid-afternoon screening from Theatre 1 to Theatre 3 → a few highlights, a pin, the change summary, and the revenue indicator updates.
4. Undo → back to how it was.
5. Drag a late screening so it would end after closing → blocked, with a reason.
6. Switch to Friday → longer hours.
7. Publish → summary → Published, read-only.
