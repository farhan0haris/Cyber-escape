# Product Requirements Document (PRD)
## Cyber Escape — Virtual Cybersecurity Escape Room

---

### Document Information
- **Project Name:** Cyber Escape
- **Document Version:** 1.0.0
- **Status:** Approved Source of Truth
- **Target Release:** Production Web Release
- **Author:** Project Engineering Team

---

## 1. Product Overview
**Cyber Escape** is a lightweight, responsive, browser-based cybersecurity-themed puzzle and adventure game. The player assumes the role of an ethical analyst / digital avatar trapped inside an infected or locked virtual computer system. To initiate system escape and regain control, the player must crack password hashes, navigate corrupted digital memory mazes, locate hidden digital decryption keys, evade dynamic firewall barriers, and perform an emergency system override.

The game is built using standard web technologies (HTML5, CSS3, Vanilla JavaScript) and browser `localStorage`, requiring zero runtime framework installations or mandatory backend servers.

---

## 2. Problem Statement
Many interactive educational software tools and educational cybersecurity games suffer from two extremes:
1. They are dry, text-heavy multiple-choice quizzes that fail to engage learners or gamify security concepts.
2. They are overly bloated applications requiring heavy client downloads, backend database setups, and high compute resources.

Players and casual learners need an engaging, accessible, zero-friction web experience that introduces foundational digital security metaphors (passwords, secure routing, cryptographic keys, firewall evasion, override protocols) through enjoyable puzzle mechanics.

---

## 3. Project Motivation
* **Educational Engagement:** Present fundamental cyber hygiene concepts (strong passwords, decoy analysis, firewall rules, protocol overrides) via interactive game metaphors.
* **Technical Demonstration:** Showcase clean modular JavaScript architecture, canvas/DOM game mechanics, state machines, and resilient client-side storage without external dependencies.
* **Accessibility & Portability:** Create a game that runs instantly on any modern desktop or mobile browser with zero installation.

---

## 4. Project Objectives
1. **Playability:** Deliver 5 distinct, progressive cybersecurity-themed levels playable end-to-end within 5 to 15 minutes.
2. **Reliability:** Maintain a deterministic state machine with clean pause, resume, restart, and failure recovery.
3. **Performance:** Smooth 60 FPS rendering on canvas-based levels (Levels 2 and 4) and instant DOM response on puzzle levels (Levels 1, 3, 5).
4. **Data Integrity:** Gracefully manage session persistence, high score retention, and state corruption recovery via `localStorage`.

---

## 5. Target Users
* **Primary Users:** Cybersecurity enthusiasts, puzzle game players, and web developers interested in browser game architecture.
* **Secondary Users:** Casual puzzle gamers and learners interested in cybersecurity concepts.
* **User Personas:**
  * *Evaluator Prof:* Wants immediate start, intuitive controls, bug-free transitions, and clear scoring criteria.
  * *Student Player:* Wants responsive keyboard/touch controls, engaging visual feedback, fair challenge, and high score competition.

---

## 6. Core User Journey
1. **Launch:** Player visits the web application and arrives at the terminal-inspired Main Menu.
2. **Setup:** Player enters their username (validated 2–16 alphanumeric characters) and optionally views instructions.
3. **Initialization:** Game state initializes with 3 lives, score 0, and loads Level 1.
4. **Progression (Levels 1 through 5):**
   * Player reviews level briefing / objective.
   * Player completes challenge under the active level countdown timer.
   * On success: bonus score calculated based on remaining time and accuracy; advance to next level.
   * On mistake/collision: life deducted or attempt counter decremented. If lives reach 0 or timer reaches 0, Game Over screen displays with option to retry.
5. **System Override & Escape:** Completing Level 5 triggers the escape sequence and final victory screen.
6. **Leaderboard & Review:** Final stats (Total Score, Total Time Elapsed, Remaining Lives) saved to local leaderboard. Player can view standings or restart.

---

## 7. Functional Requirements
* **FR-01 (Player Identification):** Must require a valid player name (2–20 characters, allowing letters, numbers, spaces, underscores, and hyphens; trimmed of leading/trailing whitespace; non-empty) before gameplay starts.
* **FR-02 (Level Flow Control):** Must transition sequentially across Levels 1 through 5 upon satisfying level completion triggers.
* **FR-03 (State Pause/Resume):** Must permit player to pause gameplay at any point during an active level, halting timers, animations, and inputs.
* **FR-04 (Life Management):** Must track lives globally (initial count: 3) with visible HUD decrements upon hazards/mistakes. Reaching 0 lives triggers Game Over.
* **FR-05 (Time Tracking):** Must run an independent countdown timer for each level and track cumulative elapsed game time across successful levels.
* **FR-06 (Score Aggregation):** Must calculate level scores with a strict non-negative floor ($\ge 0$) and maintain an aggregate total score.
* **FR-07 (Local Leaderboard):** Must persist top 10 historical scores in `localStorage` sorted by score descending, then total time ascending.
* **FR-08 (Reset/Restart):** Must provide two distinct restart pathways:
  * *Level Retry (within session):* If a level fails due to timeout or attempt lockout while lives > 0, 1 life is deducted, and the current level timer and state reset for another attempt.
  * *Game Restart (from Pause or Game Over):* Resets the entire run back to Level 1, restoring 3 lives and resetting score and cumulative timer to 0.

---

## 8. Non-Functional Requirements
* **NFR-01 (Zero Dependencies):** Must run entirely on native browser APIs (Vanilla HTML5/CSS3/ES6+ JavaScript). No npm runtime libraries, no UI frameworks.
* **NFR-02 (Performance):** Average frame rate ≥ 55 FPS during animated canvas loops on standard desktop/mobile browsers; DOM interactions latency < 50ms.
* **NFR-03 (Storage Footprint):** Total `localStorage` usage must remain under 100 KB.
* **NFR-04 (Offline Capability):** Once assets are cached/loaded, the initial release must run 100% offline.
* **NFR-05 (Defensive Execution):** Malformed or missing `localStorage` data must never crash the game; fallback to defaults automatically.

---

## 9. Core Features
* **Terminal Cyber Aesthetic:** Cyber-security UI with dark background, crisp electric cyan accents, emerald status indicators, and warning ambers.
* **5 Distinct Level Mechanics:** Logic riddle, maze traversal, visual scan/inspection, dynamic obstacle evasion, and multi-step override.
* **Global Heads-Up Display (HUD):** Persistent display of Current Level, Player Name, Score, Lives Indicator, and Level Countdown Timer.
* **Interactive Modal Dialogues:** Level briefings, pause screen, confirmation dialogs, and game over/victory modals.
* **Client-Side High Score Board:** Top 10 ranks with name, date, score, and completion time.

---

## 10. Game Rules
* The player starts the game with **3 lives**.
* Each level has a specific countdown time limit (60–90 seconds depending on level).
* **Timer Expiration Rule:** If the countdown reaches 0:
  * 1 life is deducted.
  * If lives > 0, the current level reloads with a fresh level timer so the player can retry.
  * If lives = 0, Game Over is triggered immediately.
* **Life Depletion Rule:** Reaching 0 lives at any point triggers an immediate **System Locked / Game Over** state.
* **Scoring Rule:** Completing a level grants a Base Score plus a Time Bonus minus any penalties. Level score is strictly clamped to a minimum of 0 (no negative scores).
* **Timer Lifecycle Rule:**
  * Pausing freezes the countdown and animation loops without loss of remaining time.
  * Resuming unfreezes countdown exactly where it paused.
  * Advancing to the next level cancels any active timer handle before starting the new level timer, preventing double-tick race conditions.

---

## 11. Level Requirements Summary
| Level # | Codename | Primary Mechanic | Primary Input | Win Condition | Failure Condition |
|---|---|---|---|---|---|
| **Level 1** | Password Breach | Logic deduction / Hash clue | Keyboard / Click keypad | Submit matching password within 3 attempts | 3 invalid attempts (-1 life) OR timer expiration (-1 life) |
| **Level 2** | Digital Maze | 2D Grid / Labyrinth traversal | WASD / Arrows / On-screen D-Pad | Reach target exit node | Timer expiration (-1 life) |
| **Level 3** | Hidden Key | Object inspection & decoy filtering | Mouse click / Touch tap | Identify & click authentic encryption key | Timer expiration (-1 life); decoy clicks penalize time & score |
| **Level 4** | Firewall Dodge | Dynamic obstacle evasion | WASD / Arrows / On-screen D-Pad | Traverse from start zone to safe terminal | Collision with firewall (-1 life, resets position) OR timer expiration (-1 life) |
| **Level 5** | System Override | Sequence recall + slider calibration + timed confirm | Mouse / Touch clicks | Complete 3 override stages | 3 sequence errors (-1 life, resets Stage 1) OR timer expiration (-1 life) |

---

## 12. Scoring Requirements
* **Level 1 (Password Breach):** Base 1,000 pts. Time bonus: +10 pts per remaining second. Penalty: -150 pts per wrong attempt.
* **Level 2 (Digital Maze):** Base 1,500 pts. Time bonus: +15 pts per remaining second.
* **Level 3 (Hidden Key):** Base 1,200 pts. Time bonus: +15 pts per remaining second. Penalty: -100 pts and -5 seconds per decoy clicked.
* **Level 4 (Firewall Dodge):** Base 2,000 pts. Time bonus: +20 pts per remaining second. Penalty: -250 pts per firewall hit.
* **Level 5 (System Override):** Base 2,500 pts. Time bonus: +25 pts per remaining second. Life bonus: +500 pts per surviving life.
* **Score Floor:** All level scores and overall score are clamped to $\ge 0$.

---

## 13. Timer Requirements
* Standard countdown ticker running at 1-second intervals (using `performance.now()` delta validation).
* Countdown pause freezes timer value precisely.
* Transitioning between levels explicitly stops and cleans up the prior timer before mounting the new one.
* Visual warning triggers:
  * Warning pulse (amber) when remaining time $\le 20$ seconds.
  * Critical urgency pulse (red) when remaining time $\le 10$ seconds.
* Configured Level Durations:
  * Level 1: 150 seconds
  * Level 2: 90 seconds
  * Level 3: 150 seconds
  * Level 4: 60 seconds
  * Level 5: 180 seconds

---

## 14. Lives & Attempts Requirements
* Player starts with exactly **3 Lives** (represented visually by shield/security node icons in the HUD).
* Lives persist across levels throughout the active run.
* When a hazard or timeout occurs:
  * If lives > 0: HUD updates, 1 life deducted, player retries stage/level.
  * If lives = 0: Game Over screen is triggered immediately.
* On Game Restart (from Pause or Game Over), lives reset to 3, score resets to 0, and player restarts at Level 1.

---

## 15. Leaderboard Requirements
* Stored locally in browser `localStorage`.
* Maximum 10 entries.
* Entry schema: `rank`, `playerName`, `score`, `totalTime` (seconds), `date` (ISO string or formatted date).
* Sorted primary: `score` descending; secondary: `totalTime` ascending.
* Player can view leaderboard from Main Menu or after completing the game.
* Clear leaderboard option available with confirmation prompt.

---

## 16. LocalStorage Requirements
* All keys must be namespaced under `cyberEscape.*`.
* Required keys:
  * `cyberEscape.player`: Last used username.
  * `cyberEscape.settings`: Audio toggle, difficulty/preferences.
  * `cyberEscape.leaderboard`: Array of top score entries.
  * `cyberEscape.saveState`: Active session state (for pause/resume resilience).
* Any parsing errors (corrupt JSON) must be handled gracefully: fall back to defaults, log a safe warning, and restore defaults without throwing unhandled exceptions.

---

## 17. Error Handling Requirements
* Gracefully catch DOM element lookup failures during view mounting.
* Catch canvas context creation failures with fallback error screen.
* Safe JSON parse wrappers for all `localStorage` operations.
* Defensive input sanitation (strip HTML tags, prevent XSS in username display).

---

## 18. Accessibility Requirements
* High contrast ratio: Text contrast ≥ 4.5:1 against dark backgrounds for primary content.
* Keyboard Navigable: All menu buttons, inputs, and modal dialogues accessible via `Tab`, `Enter`, `Space`, and `Escape`.
* Screen Reader Labels: `aria-label` tags on icon buttons, status badges, and HUD indicators.
* Focus Indicators: Distinct cyan focus outline (`2px solid var(--accent-primary)`) on interactive elements.

---

## 19. Responsive Requirements
* Breakpoints:
  * Mobile: 320px – 640px (HUD stacks compactly, on-screen virtual d-pad/touch controls activate).
  * Tablet: 641px – 1024px (optimized canvas sizing and proportional grid).
  * Desktop: 1025px+ (standard fixed aspect canvas / centered container, full keyboard support).
* Maximum game container width: 1024px centered with fluid margins.

---

## 20. Browser Compatibility
* Google Chrome (v100+)
* Mozilla Firefox (v100+)
* Apple Safari (v15+)
* Microsoft Edge (v100+)
* Mobile Chrome and Mobile Safari on iOS and Android.

---

## 21. Constraints
* Must not require build tools, bundlers (webpack, vite), or transpilers to play.
* Must not depend on internet connection for core gameplay.
* Must use standard vanilla CSS and ES6 modules / classes.
* Must maintain lightweight architecture achievable with clean modular web technologies.

---

## 22. Out of Scope (Initial Release)
* Multiplayer or real-time networking.
* Backend database server (Node, Python, PHP, etc.).
* Complex 3D graphics or WebGL shaders.
* User account creation / password authentication.
* Microtransactions or inventory economy.

---

## 23. Future Enhancements
* Optional Firebase Cloud Firestore integration for a global online leaderboard.
* Sound effects and atmospheric dark-synth ambient audio via Web Audio API.
* Additional levels (e.g., SQL Injection riddle, Phishing email detector, Cryptographic cipher decipher).
* Speedrun timer mode and downloadable completion certificate.

---

## 24. Acceptance Criteria & Feature Classification

### Must Have (P0 — Core Scope)
- [ ] Clean, cohesive dark cybersecurity UI design system.
- [ ] Working Main Menu with player name entry and validation.
- [ ] Global HUD showing player name, level, score, lives, and timer.
- [ ] Fully playable Level 1 (Password Breach).
- [ ] Fully playable Level 2 (Digital Maze with collision).
- [ ] Fully playable Level 3 (Hidden Key with decoy detection).
- [ ] Fully playable Level 4 (Firewall Dodge with moving obstacles).
- [ ] Fully playable Level 5 (System Override finale).
- [ ] Working Pause, Resume, and Restart flows.
- [ ] Game Over (0 lives / timeout) and Victory screens.
- [ ] LocalStorage-backed top 10 Leaderboard.
- [ ] Responsive design supporting desktop keyboards and mobile touch/on-screen controls.

### Should Have (P1)
- [ ] Level briefing transition modals with security lore.
- [ ] Audio toggle with Web Audio synthesizer beeps/alerts (no external mp3 dependencies).
- [ ] Visual glitch/scanline subtle effect on screen transitions.

### Could Have (P2)
- [ ] Multiple difficulty presets (Recruit / Specialist / Elite).
- [ ] Custom particle burst effects on level completion.

### Future (P3)
- [ ] Firebase online real-time global leaderboard.
- [ ] Level creator mode.
