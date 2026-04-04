<!-- # Project Context: one dot

## 🕰️ Core Philosophy: The Reminder
The core idea of **one dot** is to serve as a constant visceral reminder that **we have limited time.** 
Life is a non-renewable resource. By visualizing this finitude directly on the most-viewed screen in our lives (the phone lock screen), we encourage users to:
1. Stop procrastinating on their deepest goals.
2. Realize the weight of every passing week.
3. Live with more intentionality and presence.

The "one dot" branding symbolizes that single, precious moment we have right now.

---

## 🛠️ Technical Roadmap (Phased Progression)

### Phase 1-4: Foundation (COMPLETED)
- ✅ **Interactive Generator**: 10 styles like Memento Mori, Life Grids, and Countdowns.
- ✅ **Cross-Platform Sync**: Firestore-based config sync between Web and Native.
- ✅ **Native Android App**: Custom Capacitor plugin (`WallpaperPlugin.java`) to set wallpapers from Base64.
- ✅ **Premium Gallery**: High-performance draggable auto-scroll for style exploration.

### Phase 5: The "Alive" Wallpaper Engine (COMPLETED)
We have moved from "Static Downloads" to a **Live Service** model using unique API calls (Shortcuts).
- ✅ **SSR Image Engine**: Ported canvas drawing logic to Node.js server using `node-canvas`.
- ✅ **Shortcut Integration**: Unique URL `GET /api/wallpaper/u/:uid/daily.png` for iOS/Android automation.
- ✅ **The Living Soul**:
    - **Randomized Mood**: Wallpaper randomly picks between "Glow" and "Dim" versions on mỗi fetch.
    - **Daily Wisdom**: 30+ philosophical quotes that change daily based on the year's progress.
    - **Time-Awareness**: Background gradients that shift (Morning/Day/Night) automatically.
- ✅ **Cloud Sync UI**: New "Alive Engine" section in the generator for one-click setup.

### Phase 6: Ecosystem & Widgets (FUTURE)
- [ ] **Lock Screen Widgets**: Native iOS/Android widgets for real-time progress.
- [ ] **Live Activities**: "Active Goal" bubbles for the Dynamic Island.
- [ ] **Social Awareness**: Sharing progress milestones (e.g. "15% of the year lived").

---

## 🏗️ Architectural Decisions
1. **Config-Sync Strategy**: Instead of sending heavy image files, we sync a small JSON `active_wallpaper_config` to Firestore. The mobile app/server then reconstructs the image locally.
2. **"Ultimate Glow" (Static Bloom)**: To solve the OS limitation of "no blinking wallpapers," we use multi-layered radial gradients to create a breathing light effect that looks active even when static.
3. **Capacitor + Native Plugins**: Uses a custom Java bridge for direct `WallpaperManager` access on Android.

---

## 🛠️ Build & Dev Note
- **Frontend**: `cd client && npm run dev`
- **Backend**: `cd server && npm run dev`
- **Android**: `cd client && npx cap sync android && npx cap open android`

## 🤖 AI Instructions
Always read this file before resuming work. It is the "Source of Truth" for the mission and tech stack. Update it whenever a phase is cleared. -->


Right now your doc is:

✅ technically solid
❌ missing behavioral / product loops that drive retention & virality

🧠 What’s Missing (High Impact Gaps)

I’ll break it into what to ADD, not replace.

🔥 1. MISSING: “Shock Moment” System (CRITICAL)

Your philosophy mentions it, but not implemented as a system.

Add new section:
## ⚡ Phase 5.5: Shock Onboarding (CRITICAL - TO IMPLEMENT)

### Goal
Create an emotional “reality check” moment immediately after user enters DOB.

### Experience
Display full-screen:

- Days lived
- Days left
- % life used

Minimal UI:
Black background, centered text.

### Why
This is the primary viral hook and increases conversion to wallpaper creation.

### Status
- [ ] Not implemented
🔁 2. MISSING: Daily Progression Engine (RETENTION CORE)

You have “Alive Engine” but not explicit retention logic.

Add:
## 🔁 Daily Progression Engine (Retention Core)

### Goal
Ensure the wallpaper changes slightly every day to maintain user awareness.

### Logic
- daysLived = today - dob
- daysLeft = totalLife - daysLived
- percentUsed = daysLived / totalDays

### Update Frequency
- Minimum: once per day
- Triggered via:
  - App open OR
  - Background job OR
  - API fetch

### Visual Changes
- Increment grid progression
- Update % values
- Rotate quote/message

### Why
Prevents wallpaper from becoming “invisible” to the user.

### Status
- [ ] Partially implemented (via API fetch)
- [ ] Needs guaranteed daily refresh logic
📱 3. MISSING: Native Retention Layer (VERY IMPORTANT)

Right now your system is API-driven (good)
But missing device-level persistence

Add:
## 📱 Native Retention Layer (Android Priority)

### Goal
Ensure wallpaper updates without user intervention.

### Components
- WorkManager (daily job)
- Wallpaper refresh trigger
- Local cache of last config

### Modes
1. Passive Mode (current)
   - Updates only when API is fetched

2. Active Mode (NEW)
   - Daily automatic refresh on device

### Decision
Ask before enabling Active Mode (battery considerations)

### Status
- [ ] Not implemented
💣 4. MISSING: Viral Templates Definition

You mention styles, but not which ones drive growth

Add:
## 💣 Viral Template Strategy

### Goal
Prioritize emotionally impactful, shareable templates.

### Tier 1 (Must Have)
- Life % Left (e.g., "62% left")
- Days Remaining (e.g., "~18,203 days left")
- Life Grid (weekly visualization)

### Tier 2
- Memento Mori quotes
- Daily philosophical prompts

### Design Rules
- Minimal
- High contrast
- Large typography

### Why
These templates drive:
- sharing
- emotional impact
- retention

### Status
- [ ] Needs prioritization in UI
📤 5. MISSING: Shareability Loop (GROWTH ENGINE)

You don’t mention sharing explicitly.

Add:
## 📤 Shareability Loop (Growth Engine)

### Goal
Turn users into distribution channel.

### Features
- Export wallpaper as image
- Include subtle watermark: "Made with one dot"
- Optional deep link to app

### User Flow
Create → Preview → Share → Install by others

### Why
Primary growth channel (organic)

### Status
- [ ] Not implemented
🔔 6. MISSING: Habit Loop (NOTIFICATIONS)

Your product depends on passive usage, but needs active triggers

Add:
## 🔔 Daily Habit Loop

### Goal
Bring user back into awareness daily.

### Notification Examples
- "1 more day gone."
- "You now have X days left."

### Frequency
- Once per day (morning preferred)

### Behavior
Tap → opens app → refreshes stats

### Why
Improves retention and engagement

### Status
- [ ] Not implemented
🧠 7. MISSING: User Identity Layer

Right now it’s generic.

Add:
## 🧠 Personal Identity Layer

### Goal
Make wallpaper feel deeply personal.

### Inputs
- DOB (required)
- Optional:
  - Name
  - Goal
  - Custom message

### Output
- Personalized wallpaper text
- Goal-based reminders

### Why
Increases emotional attachment

### Status
- [ ] Partial (DOB exists)
📊 8. MISSING: Retention Metrics (CRITICAL)

You’re building blind without this.

Add:
## 📊 Analytics & Retention Tracking

### Core Metrics
- DAU (Daily Active Users)
- Day 1 retention
- Day 7 retention

### Events
- onboarding_completed
- wallpaper_created
- wallpaper_set
- app_open
- share_clicked

### Why
Measure product success

### Status
- [ ] Not implemented
⚖️ 9. IMPORTANT: Clarify “Alive Engine vs Native”

Right now you have:

API-based dynamic wallpaper (great)

But missing clarity:

👉 Which is primary?

Add:
## ⚖️ Dynamic Strategy Clarification

### Two Approaches

1. API-based (current)
- Fetch image via URL
- Works cross-platform

2. Native-based (future)
- On-device rendering
- More control + offline

### Decision
- MVP: API-based
- Future: Hybrid model

### Status
- [ ] Needs clarification
🧠 Final Verdict

Your current doc is:

✅ Strong technically
✅ Clear philosophy
🔥 Already ahead of most apps

But to reach your goal:

👉 You must add:

emotional onboarding
daily progression clarity
retention loops
shareability