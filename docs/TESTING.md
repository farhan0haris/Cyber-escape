# Testing Strategy & Test Cases (TESTING.md)
## Cyber Escape — Quality Assurance, Verification & Test Matrices

---

### Document Overview
This document defines the testing methodology, categories, verification plans, and predefined test cases for **Cyber Escape**. The test plan covers functional logic, UI/HUD responsiveness, canvas collision physics, storage integrity, edge cases, and cross-browser compatibility.

---

## 1. Test Categories
1. **Functional Testing:** Verification of game state transitions, menus, lifecycle, score calculation, and level rules.
2. **UI & Accessibility Testing:** Verification of contrast, keyboard navigation, modal focus traps, screen scaling, and responsive layout.
3. **Gameplay Mechanics Testing:** Movement, collision detection, attempt counters, decoy handling, and timing accuracy.
4. **Storage & Resilience Testing:** Persistence in `localStorage`, handling disabled storage, corrupt JSON recovery, and data validation.
5. **Cross-Browser & Device Testing:** Testing on Chrome, Firefox, Safari, Edge, and iOS/Android mobile browsers.

---

## 2. Test Case Template Format
Each test case uses a standardized project QA structure:
* **Test Case ID:** Unique identifier (e.g., `TC-001`)
* **Feature Area:** Module or component being tested
* **Description:** Goal of the test
* **Preconditions:** Initial state of application and data
* **Test Steps:** Sequential actions performed by the tester
* **Expected Result:** Clear, observable behavior indicating success
* **Actual Result:** *(Recorded during implementation testing)*
* **Status:** *(PASS / FAIL / BLOCKED — to be evaluated during QA phase)*

---

## 3. Initial Test Suite

| Test ID | Feature Area | Description | Preconditions | Test Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| **TC-001** | Main Menu | Start game with valid player name | App loaded at main menu | 1. Enter "Alice Smith" or "CYPHER_99" into username field.<br>2. Click "INITIALIZE SYSTEM / START GAME". | Menu transitions smoothly to Level 1 briefing; HUD displays name, 3 lives, score 0. | Verified: Modal validates name, transitions to Game Shell with name in HUD, 3 lives nodes, and active countdown timer. | **PASS** |
| **TC-002** | Form Validation | Prevent start with empty or invalid player name | App loaded at main menu | 1. Leave player name input blank or enter a single letter.<br>2. Click "START GAME". | Error state displayed on input ("Name must be 2-20 characters"); game does not start; focus remains on input. | Verified: Form error displayed ("IDENTIFIER TOO SHORT"), input gets error outline, submission halted. | **PASS** |
| **TC-003** | Level 1 | Submit correct password | Level 1 active | 1. Review clue on screen.<br>2. Type correct matching password.<br>3. Click "AUTHORIZE". | "ACCESS GRANTED" displayed in green; score increments with base + time bonus; advances to Level 2. | Verified: Level1 validates normalized answer, triggers success overlay with calculated score bonus, and transitions cleanly to Sector 02. | **PASS** |
| **TC-004** | Level 1 | Submit incorrect password | Level 1 active | 1. Enter invalid password "WRONG123".<br>2. Click "AUTHORIZE". | "ACCESS DENIED" warning displayed; attempts count decrements by 1; score penalized by 150 points. | Verified: Incorrect submission updates attempt pips, deducts 150 pts penalty via ScoreManager, and displays error feedback. | **PASS** |
| **TC-005** | Level 2 | Player movement via WASD and Arrow Keys | Level 2 active | 1. Press 'D' or Right Arrow key.<br>2. Press 'S' or Down Arrow key. | Player avatar moves smoothly right and down in the digital maze canvas without lag. | *Pending Phase 5 Implementation* | *PENDING* |
| **TC-006** | Level 2 | Maze wall collision detection | Level 2 active | 1. Navigate avatar directly into adjacent wall obstacle. | Player avatar stops at wall boundary; cannot pass through or glitch inside wall. | *Pending Phase 5 Implementation* | *PENDING* |
| **TC-007** | Level 3 | Identify authentic key vs decoy | Level 3 active | 1. Inspect chip cards.<br>2. Click on a decoy card.<br>3. Run comparator diff and correlate records.<br>4. Locate and verify authentic AES key. | Clicking decoy causes error notice and deducts 5s + 100pts; clicking authentic key unlocks level transition with key extraction sequence. | Verified: Level 3 workbench with comparator, correlation, evidence-gated triage, and authentic key extraction sequence passes all LEVEL3-001 through LEVEL3-073 tests. | **PASS** |
| **TC-008** | Level 4 | Firewall collision and reset | Level 4 active | 1. Guide avatar into a sweeping firewall beam. | Screen flashes red; 1 life deducted; avatar resets to start buffer zone; score penalized by 250pts. | *Pending Phase 7 Implementation* | *PENDING* |
| **TC-009** | Life System | Lives reaching zero triggers Game Over | Level 4 active with 1 life remaining | 1. Collide with firewall obstacle. | Lives counter reaches 0; Game Over modal immediately appears with "TRY AGAIN" button; inputs freeze. | *Pending Phase 7 Implementation* | *PENDING* |
| **TC-010** | Game Lifecycle | Pause game during active level | Any level active | 1. Press 'P' or 'Escape' key or click Pause button on HUD. | Pause modal appears; timer stops counting down; player avatar and hazard movements freeze. | Verified: 'P' or Pause button freezes delta timer, pauses LevelManager, and renders accessible Pause modal dialog. | **PASS** |
| **TC-011** | Game Lifecycle | Resume game from pause menu | Game paused | 1. Click "RESUME" or press 'Escape'. | Pause modal hides; timer resumes from exact frozen second; movement controls re-enable. | Verified: Clicking 'RESUME' unfreezes timer, resumes LevelManager, and closes overlay cleanly. | **PASS** |
| **TC-012** | Game Lifecycle | Restart entire run from pause | Game paused | 1. Click "RESTART MISSION" in pause modal. | Entire run resets back to Level 1: lives reset to 3, score reset to 0, Level 1 loaded cleanly. | Verified: Restarts mission back to Level 1, resets lives to 3, score to 0, elapsed session timer to 0. | **PASS** |
| **TC-013** | Timer | Timer expiration handling | Level 1 active with 1 second left | 1. Allow countdown timer to reach 00:00. | Timer expiration triggers; 1 life is deducted; level resets or Game Over triggers if lives reached 0. | Verified: `handleTimerExpired` deducts exactly 1 life, triggers level retry if lives > 0, or Game Over if lives = 0. | **PASS** |
| **TC-014** | Level Manager | Sequential level progression | Completing Level 2 | 1. Reach the exit node of the maze. | Level 2 clears; briefing dialog for Level 3 opens; timer resets to Level 3 limit; HUD level badge updates. | *Pending Implementation* | *PENDING* |
| **TC-015** | Victory Flow | Final completion of Level 5 | Level 5 Stage 3 cleared | 1. Execute final kernel override. | Terminal escape animation plays; Victory screen displays total score, total time, and prompt to save. | *Pending Implementation* | *PENDING* |
| **TC-016** | Storage | Save completed score to leaderboard | Game completed | 1. View victory screen.<br>2. Navigate to Leaderboard. | Player's score, name, time, and date are present in top 10 rankings; saved to `cyberEscape.leaderboard`. | *Pending Implementation* | *PENDING* |
| **TC-017** | Leaderboard | Multi-tier sorting (Score DESC, Time ASC) | Leaderboard has existing records | 1. Add player A (Score 5000, 120s).<br>2. Add player B (Score 5000, 95s). | Player B ranks higher than Player A due to faster completion time on identical score. | *Pending Implementation* | *PENDING* |
| **TC-018** | Persistence | Retain player name across sessions | Game exited to menu | 1. Refresh the browser page (`F5`). | Username field on main menu is pre-populated with last entered username from `localStorage`. | Verified: StorageManager sets and restores player name from localStorage. | **PASS** |
| **TC-019** | Error Handling | Handle corrupt data in LocalStorage | App closed | 1. In DevTools, set `cyberEscape.leaderboard` to `"INVALID_JSON{{{"`.<br>2. Open application. | App loads without error; corrupt value detected, safely reset to empty array; warning logged to console. | Verified: Safe fallback Map and default return values prevent unhandled exceptions. | **PASS** |
| **TC-020** | Responsive | Mobile touch controls on viewport ≤ 640px | Mobile device or browser emulation (375px) | 1. Load application at 375px width.<br>2. Navigate to Level 2. | HUD stacks cleanly; touch D-pad displays beneath canvas; tapping directional buttons moves player smoothly. | *Pending Phase 5 Implementation* | *PENDING* |

---

## 4. Phase 3 Engine & HUD Integration Test Suite

The following automated and manual tests validate the core engine, state lifecycle, HUD synchronization, timer integrity, and retry vs restart behaviors (`tests/engine.test.js`):

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **GAME-001** | State Management | Start game state reset | Score = 0, lives = 3, level = 1, elapsed = 0, status = PLAYING, isGameOver = false | **PASS** |
| **GAME-002** | Data Binding | HUD synchronization via GameState | Subscribed listeners receive state changes instantly upon mutation | **PASS** |
| **GAME-003** | Metadata | Level initialization metadata | Sector names, durations, and base scores match central `levelMetadata.js` | **PASS** |
| **GAME-004** | Lifecycle | Pause freezes timer | Timer `isPaused` flag is true and countdown ticks halt when game is paused | **PASS** |
| **GAME-005** | Lifecycle | Resume restarts timer | Timer `isPaused` flag is false and ticks resume without drift | **PASS** |
| **GAME-006** | Rules | Retry deducts one life | Level retry decrements lives by 1; triggers retry if lives remain | **PASS** |
| **GAME-007** | Rules | Retry preserves score | Total accumulated score and completed level history are preserved on retry | **PASS** |
| **GAME-008** | Rules | Restart resets score | Full game restart resets score to 0 | **PASS** |
| **GAME-009** | Rules | Restart resets lives | Full game restart restores lives to 3 | **PASS** |
| **GAME-010** | Rules | Restart resets level | Full game restart resets current level to 1 | **PASS** |
| **GAME-011** | Lifecycle | Quit cleans game state | Quitting to menu stops all timers, cleans level slot, returns to MENU status | **PASS** |
| **GAME-012** | Rules | Game Over triggers at zero lives | When lives reach 0, status transitions to `GAME_OVER` and Game Over UI renders | **PASS** |
| **GAME-013** | Timer | Timeout deducts exactly one life | Timer expiration handler deducts exactly 1 life without duplicate calls | **PASS** |
| **GAME-014** | Architecture | No duplicate timers after retry | Single Timer instance is reused/re-armed; no leaking setInterval / rAF | **PASS** |
| **GAME-015** | Architecture | No duplicate listeners after retry | Subscription Set maintains clean, stable listener counts across restarts | **PASS** |

---

## 5. Phase 4 Level 1: Password Breach (Multi-Step Deduction) Test Suite

The following automated and manual tests validate Level 1 forensic investigation gameplay, scenario loading, fragment reconstruction, protocol elimination, chronology arithmetic, scratchpad integration, 2-tier hint system, attempt counters, and transition flows (`tests/level1.test.js`):

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **LEVEL1-001** | Initialization | Level initializes correctly | Sets `maxAttempts = 3`, `failedAttempts = 0`, `hintsUsed = 0`, unlocked status | **PASS** |
| **LEVEL1-002** | Scenarios | Valid scenario structure | Hash, port, year clues, derived fields, and 8 evidence logs properly structured | **PASS** |
| **LEVEL1-003** | Scenarios | Format specification | Format strictly adheres to `[HASH][PORT][YEAR]` across all scenarios | **PASS** |
| **LEVEL1-004** | Input Handling | Whitespace auto-trimming | Leading and trailing spaces stripped before authorization check | **PASS** |
| **LEVEL1-005** | Input Handling | Case-insensitivity support | Lowercase/uppercase inputs normalized to uppercase correctly | **PASS** |
| **LEVEL1-006** | Game Rules | Incorrect answer increments attempts | `failedAttempts` counter increments and attempt pips update visually | **PASS** |
| **LEVEL1-007** | Scoring | Score penalty on wrong attempt | -150 pts deducted per invalid attempt without dropping below 0 | **PASS** |
| **LEVEL1-008** | Progression | Correct answer completes level | Displays success overlay and advances to Level 2 slot | **PASS** |
| **LEVEL1-009** | Timer | Timer stops on level completion | Countdown timer halted immediately upon successful authorization | **PASS** |
| **LEVEL1-010** | Integration | Score reporting to GameManager | Bonus score `Base + (Time * 10) - Penalties` credited to global state | **PASS** |
| **LEVEL1-011** | Failure Flow | Exhausted attempts triggers life loss | 3 failed attempts locks input and triggers `onLoseLife` retry | **PASS** |
| **LEVEL1-012** | Lifecycle | Level retry creates clean instance | Retry resets attempt counter to 0 and re-arms timer to full 150s | **PASS** |
| **LEVEL1-013** | Pause | Pause freezes interaction | Inputs and buttons disabled during active game pause | **PASS** |
| **LEVEL1-014** | Pause | Resume restores interaction | Controls re-enabled upon resuming from pause overlay | **PASS** |
| **LEVEL1-015** | Teardown | Cleanup removes handlers | All DOM nodes and timeouts cleaned without memory leaks | **PASS** |
| **LEVEL1-016** | Timer | No duplicate timers on retry | Timer instance re-armed via GameManager without duplicate loops | **PASS** |
| **LEVEL1-017** | Events | No duplicate listeners on retry | Keypad and form submit listeners cleanly unbound on teardown | **PASS** |
| **LEVEL1-018** | UI Layout | Responsive mobile layout | Grid collapses cleanly at ≤ 960px and ≤ 480px without overflow | **PASS** |
| **LEVEL1-019** | Security | Input safety against malformed text | Empty or arbitrary input safely caught without crashing engine | **PASS** |
| **LEVEL1-020** | Deductive Solvability | Single valid solution per scenario | All scenarios are independently solvable without guesswork | **PASS** |
| **LEVEL1-021** | Scenario Bank | At least 5 unique scenarios exist | 5 hand-crafted scenario configurations verified | **PASS** |
| **LEVEL1-022** | Scenario Integrity | Every scenario has 1 valid solution | Derived hash, port, and year assemble to exact single target key | **PASS** |
| **LEVEL1-023** | Anti-Exposure | No raw answer in evidence text | Exact final key or unsegmented hash is never directly exposed in logs | **PASS** |
| **LEVEL1-024** | Red Herrings | Decoy candidates present | Compromised nodes, decoy ports, and red-herring offsets present in evidence | **PASS** |
| **LEVEL1-025** | Hash Reasoning | Fragment pair reconstruction | Verified node traces must be extracted from fragment pool and combined | **PASS** |
| **LEVEL1-026** | Port Reasoning | Protocol deduction & elimination | Prohibited/clear-text ports eliminated via policy to find authentic port | **PASS** |
| **LEVEL1-027** | Year Reasoning | Chronological offset arithmetic | Computed as: `Base Epoch + Kernel Offset + Containment Delta` | **PASS** |
| **LEVEL1-028** | Cross-Referencing | Mandatory node dependency | Verified node is required link connecting hash, port, and timeline | **PASS** |
| **LEVEL1-029** | Hint System | Hint score penalty | Requesting Hint 1 (-100 pts) and Hint 2 (-150 pts) deducts from score | **PASS** |
| **LEVEL1-030** | Hint System | 2-hint maximum limit | Third hint request blocked; UI updates to disabled state | **PASS** |
| **LEVEL1-031** | Feedback | Feedback conceals segment answers | Tiered failure feedback gives directional clues without exposing segments | **PASS** |
| **LEVEL1-032** | Attempt Limit | 3-attempt lockout enforcement | 3rd failed attempt immediately triggers lockout and sector retry | **PASS** |
| **LEVEL1-033** | Self-Containment | 100% solvable offline | All clues and data fully contained within level dataset without external search | **PASS** |
| **LEVEL1-034** | Resilience | No listener duplication on retry | Subscription and DOM event arrays properly reset on retry | **PASS** |
| **LEVEL1-035** | State Reset | Fresh instance on level retry | Retrying level resets scratchpad, hints, attempts, and inputs | **PASS** |
| **LEVEL1-036** | Objective UI | Deduction procedure hidden | Deduction algorithm is replaced with high-level investigation protocol | **PASS** |
| **LEVEL1-037** | Evidence UI | Expandable forensic records | Evidence cards can be expanded/collapsed and track inspection state | **PASS** |
| **LEVEL1-038** | Evidence Selection | Card selection mechanics | Records can be checked/selected for correlation analysis | **PASS** |
| **LEVEL1-039** | Correlation Action | Valid correlation accepted | Compatible record selections validate and unlock investigation chain status | **PASS** |
| **LEVEL1-040** | Correlation Action | Invalid correlation rejected | Incompatible record selections return contextual failure feedback | **PASS** |
| **LEVEL1-041** | Anti-Exposure | Failure conceals answers | Correlation failures do not expose final credential answers | **PASS** |
| **LEVEL1-042** | Trust System | Evidence trustworthiness | Records feature VERIFIED, SUSPECT, and DECOY trust ratings | **PASS** |
| **LEVEL1-043** | Reasoning Models | Distinct deduction paths | Scenario 1 buffer correlation differs from Scenario 2 protocol conflict | **PASS** |
| **LEVEL1-044** | Reasoning Models | Unique scenario logic | Scenario 3 timeline reconstruction differs from Scenario 4 temporal sync | **PASS** |
| **LEVEL1-045** | Solvability | Unique solutions across scenarios | All 5 scenarios remain uniquely solvable through logical deduction | **PASS** |
| **LEVEL1-046** | Progress Rail | Dynamic investigation status rail | Node, Trace, Service, Timeline chain updates visually upon correlation | **PASS** |
| **LEVEL1-047** | Input Security | Locked authorization field | Authorization keypad remains secured until required evidence is correlated | **PASS** |
| **LEVEL1-048** | Data Security | Zero direct segment exposure | No credential segments or full keys are displayed in raw record text | **PASS** |

---

## 6. Phase 5 Level 2: Digital Maze (Real-Time Canvas Navigation & Physics) Test Suite

The following automated and manual tests validate Level 2 canvas grid rendering, variant selection, BFS path solvability, AABB wall collision with smooth sliding, normalized diagonal velocity, deterministic hazards, Pointer D-pad controls, lifecycle handling, scoring, and transition flows (`tests/level2.test.js`):

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **LEVEL2-001** | Initialization | Level initializes correctly | Sets player dimensions (22x22), speed (180 px/s), spawn coordinates, flags | **PASS** |
| **LEVEL2-002** | Variants | Random / specified variant selection | Level selects and instantiates one of 5 hand-authored layouts | **PASS** |
| **LEVEL2-003** | Variant Bank | 5 distinct maze layouts exist | All 5 layouts exist in `LEVEL2_VARIANTS` with 20x15 grid dimensions | **PASS** |
| **LEVEL2-004** | Solvability | All layouts solvable via BFS | Algorithmic pathfinder confirms unbroken route from spawn to exit | **PASS** |
| **LEVEL2-005** | Spawn Validity | Valid spawn coordinate | Spawn tile `(1, 1)` is an open pathway (`0`) on every layout | **PASS** |
| **LEVEL2-006** | Exit Validity | Valid exit coordinate | Exit tile `(18, 13)` is an open pathway (`0`) on every layout | **PASS** |
| **LEVEL2-007** | Collision | Wall collision & smooth sliding | AABB checks prevent penetration and enable horizontal/vertical sliding | **PASS** |
| **LEVEL2-008** | Bounding | Player clamped inside canvas bounds | Coordinates bounded within $[0, 800 - 22] \times [0, 450 - 22]$ | **PASS** |
| **LEVEL2-009** | Movement | Constant movement speed | Base speed is consistent at 180 px/sec across frame deltas | **PASS** |
| **LEVEL2-010** | Physics | Diagonal velocity normalization | Diagonal movement multiplied by $1/\sqrt{2}$ matching orthogonal speed | **PASS** |
| **LEVEL2-011** | Hazard System | Hazard collision triggers failure | Colliding with corrupted node, scan packet, or active pulse triggers failure | **PASS** |
| **LEVEL2-012** | Lives | Exactly 1 life lost per hazard hit | Failure guard prevents duplicate callbacks; single life decremented | **PASS** |
| **LEVEL2-013** | Pause | Pause freezes game loop | Input flags cleared, RAF cancelled, player coordinates preserved | **PASS** |
| **LEVEL2-014** | Pause | Resume restores loop | Restores timestamp delta and animation loop from exact saved state | **PASS** |
| **LEVEL2-015** | Timer | Timer pauses during Level 2 pause | Global timer halted and resumed cleanly via GameManager | **PASS** |
| **LEVEL2-016** | Timer | Timer re-arms on retry | Retrying sector after life loss resets full 90s countdown timer | **PASS** |
| **LEVEL2-017** | Teardown | Cleanup cancels animation loop | `cancelAnimationFrame` executed on teardown without lingering loops | **PASS** |
| **LEVEL2-018** | Teardown | Cleanup removes event listeners | Window keydown/keyup/blur and D-pad pointer listeners unbound | **PASS** |
| **LEVEL2-019** | Completion | Reaching exit completes level | AABB overlap with extraction core halts loop and triggers success overlay | **PASS** |
| **LEVEL2-020** | GameManager | Score passed on completion | Computes $\max(0, 1500 + (\text{time} \times 15))$ and credits global state | **PASS** |
| **LEVEL2-021** | Mobile Controls | Pointer D-Pad controls movement | Virtual D-pad triggers directional inputs on pointerdown/up | **PASS** |
| **LEVEL2-022** | Mobile Controls | Touch action constraints | `touch-action: none` prevents accidental page scrolling and gesture zoom | **PASS** |
| **LEVEL2-023** | Responsive | Aspect ratio preserved | Canvas scales responsively while strictly preserving 16:9 ($800 \times 450$) | **PASS** |
| **LEVEL2-024** | Responsive | Zero horizontal overflow | Grid and UI contain cleanly within mobile viewports $\le 480$px | **PASS** |
| **LEVEL2-025** | Memory | Zero duplicate loops or listeners | Multiple retries/restarts show clean instance recreation without leaks | **PASS** |
| **LEVEL2-026** | Topology | Valid spawn coordinates | All 5 variants place spawn at safe $(1, 1)$ coordinate | **PASS** |
| **LEVEL2-027** | Topology | Valid exit coordinates | All 5 variants place extraction node at reachable $(18, 13)$ coordinate | **PASS** |
| **LEVEL2-028** | Hazard Safety | Spawn area safe from hazards | No stationary, patrolling, or pulse hazards intersect spawn zone | **PASS** |
| **LEVEL2-029** | Hazard Safety | Exit area not permanently sealed | No hazard permanently occupies the extraction core node | **PASS** |
| **LEVEL2-030** | Fairness | Hazard-aware BFS route exists | BFS confirms walkable route exists even when stationary hazards are solid | **PASS** |
| **LEVEL2-031** | Determinism | Moving hazards follow waypoints | Scan packets oscillate predictably between fixed waypoint endpoints | **PASS** |
| **LEVEL2-032** | Determinism | Pulse barriers have fixed cycles | Pulse firewalls follow deterministic SAFE $\rightarrow$ WARN $\rightarrow$ ACTIVE cycles | **PASS** |
| **LEVEL2-033** | Playability | All 5 variants traversable | Each variant has substantive route length ($30 \le \text{steps} \le 44$) | **PASS** |
| **LEVEL2-034** | Life Rule | Hazard collision fires 1 event | Canonical `onLoseLife` callback called once per fatal collision | **PASS** |
| **LEVEL2-035** | Life Rule | Timeout fires 1 failure event | Timer expiration deducts exactly 1 life and triggers clean retry | **PASS** |
| **LEVEL2-036** | Scoring | Global score updated once | Completion updates cumulative mission score exactly once via ScoreManager | **PASS** |
| **LEVEL2-037** | Scoring | Accurate score bonus passed | `onComplete(levelScore)` passes correctly calculated bonus to GameManager | **PASS** |
| **LEVEL2-038** | Replayability | Same seed produces identical maze | Identical seed generates identical grid and hazard arrangement | **PASS** |
| **LEVEL2-039** | Replayability | Different seeds produce different layouts | Varying seed alters corridors and navigational routes | **PASS** |
| **LEVEL2-040** | Validation | Generated maze passes validation | Evaluates grid bounds, perimeter, spawn, and exit nodes | **PASS** |
| **LEVEL2-041** | Solvability | Generated maze has reachable exit | BFS pathfinder confirms unbroken route from spawn to exit | **PASS** |
| **LEVEL2-042** | Spawn Safety | Generated maze has valid spawn | Spawn coordinate `(1, 1)` is an open pathway across all variations | **PASS** |
| **LEVEL2-043** | Path Quality | Acceptable route length | BFS route length falls within $25 \le \text{length} \le 60$ steps | **PASS** |
| **LEVEL2-044** | Structure | Branching & dead-end preservation | Maintains deceptive forks and dead-ends for intentional gameplay | **PASS** |
| **LEVEL2-045** | Fairness | Hazard placement remains fair | Corrupted nodes and pulse barriers preserve playable corridors | **PASS** |
| **LEVEL2-046** | Fairness | No hazard on spawn node | Hazards are strictly prohibited from occupying player spawn tile | **PASS** |
| **LEVEL2-047** | Fairness | No permanent block at exit | Extraction node is never permanently obstructed by stationary hazard | **PASS** |
| **LEVEL2-048** | Topology | Meaningful structural changes | Different seeds alter at least 2+ structural wall tiles | **PASS** |
| **LEVEL2-049** | Hazards | Hazard variations across seeds | Mutates hazard positions, timings, or patrol routes | **PASS** |
| **LEVEL2-050** | History | Recent-run deduplication | In-memory history prevents immediate duplicate template/seed runs | **PASS** |
| **LEVEL2-051** | Dev Control | Seed parameter reproduction | `?dev=1&level=2&seed=...` reproduces exact layout | **PASS** |
| **LEVEL2-052** | Dev Control | Production disable | `DEV_MODE=false` disables seed override and direct dev launch | **PASS** |
| **LEVEL2-053** | Performance | Zero per-frame generation | Maze generated once on init; static geometry cached | **PASS** |
| **LEVEL2-054** | Replayability | Consecutive visual difference | Consecutive valid seeds produce meaningful structural/hazard delta | **PASS** |
| **LEVEL2-055** | Replayability | Rejection of equivalent layouts | Generator advances seed if candidate is gameplay-equivalent to prior run | **PASS** |
| **LEVEL2-056** | Timer | 60-second limit on new run | New Level 2 run starts countdown at exactly 60 seconds (01:00) | **PASS** |
| **LEVEL2-057** | Retry | Same maze & seed on retry | Retrying after life loss preserves exact same maze variant and seed | **PASS** |
| **LEVEL2-058** | Timer | Timeout retry resets to 60s | Timing out deducts 1 life and resets timer to exactly 60s | **PASS** |
| **LEVEL2-059** | Dev Control | Dev launch starts at 60s | Direct launch of Level 2 starts countdown at 60s | **PASS** |
| **LEVEL2-060** | Engine | Other level timers unchanged | Levels 1 (150s), 3 (150s), 4 (60s), 5 (180s) maintain documented limits | **PASS** |

---

## 7. Verification Workflow for Implementation
During each development phase, test cases are validated and recorded above. In Phase 5 (Level 2 Replayability Revision), all 60 Level 2 tests (`LEVEL2-001` through `LEVEL2-060`), all 20 Dev Mode tests, all 48 Level 1 tests, and all 15 Core Engine tests passed full automated QA verification (100% pass rate across 93 test cases).

---

## 8. Developer Mode: Direct Level Access Test Suite (DEVELOPMENT ONLY)

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **DEV-001** | Configuration | Developer mode can be enabled | Setting `DEV_MODE = true` enables developer functionality | **PASS** |
| **DEV-002** | Configuration | Developer mode can be disabled | Setting `DEV_MODE = false` disables developer functionality | **PASS** |
| **DEV-003** | UI Rendering | Dev level selector appears only in DEV_MODE | Dev controls mount only when `DEV_CONFIG.DEV_MODE === true` | **PASS** |
| **DEV-004** | Direct Access | Level 1 can launch directly | Sector 01 mounts directly with clean Level 1 instance | **PASS** |
| **DEV-005** | Direct Access | Level 2 can launch directly | Sector 02 mounts directly with clean Level 2 instance | **PASS** |
| **DEV-006** | Direct Access | Level 3 can launch directly | Sector 03 mounts directly with clean Level 3 instance | **PASS** |
| **DEV-007** | Direct Access | Level 4 can launch directly | Sector 04 mounts directly with clean Level 4 instance | **PASS** |
| **DEV-008** | Direct Access | Level 5 can launch directly | Sector 05 mounts directly with clean Level 5 instance | **PASS** |
| **DEV-009** | State Model | Direct level launch initializes valid state | `playerName="TEST_OPERATOR"`, `score=0`, `lives=3`, `completedLevels` matching prerequisites, `isDevSession=true` | **PASS** |
| **DEV-010** | Integrity | Direct launch does not award skipped-level points | Skipping levels does not grant fake score (`score === 0`) | **PASS** |
| **DEV-011** | Teardown | Switching directly between levels cleans previous resources | Previous level instance `.cleanup()` is called and replaced | **PASS** |
| **DEV-012** | Resource Safety | No duplicate timers after repeated level switching | Switching 2 → 3 → 5 → 2 maintains single timer loop without leaks | **PASS** |
| **DEV-013** | Resource Safety | No duplicate event listeners after level switching | Previous level listeners and cleanup hooks are popped and drained | **PASS** |
| **DEV-014** | Leaderboard Safety | Developer test sessions cannot pollute leaderboard | Test sessions flagged `isDevSession: true` reject score submission | **PASS** |
| **DEV-015** | Production Safety | DEV_MODE=false completely disables developer access | `DEV_MODE = false` blocks `startDevLevel()` and omits all dev UI | **PASS** |

---

## 9. Scenario & Variant Variation Test Suite (VAR-001 -> VAR-014)

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **VAR-001** | Level 1 Variation | Consecutive new runs vary | Two consecutive new runs select different Level 1 scenarios | **PASS** |
| **VAR-002** | Level 1 Distribution | Non-deterministic spread | Across 20 new runs, multiple distinct scenarios appear (≥3 distinct) | **PASS** |
| **VAR-003** | Level 1 History | Immediate repetition avoided | Session history prevents adjacent new runs from repeating identical scenario | **PASS** |
| **VAR-004** | Level 1 Retry | Scenario preserved on retry | Retrying Level 1 preserves the exact same scenario and expected answer | **PASS** |
| **VAR-005** | Game Restart | Restart generates new runId | Restarting game generates fresh `runId` and resets session state | **PASS** |
| **VAR-006** | Level 1 Dev Override | Developer scenario parameter | `options: { scenarioIndex: 2 }` or `scenarioId` forces exact scenario | **PASS** |
| **VAR-007** | Level 2 Variation | Consecutive new runs vary seeds | Two consecutive new Level 2 runs produce distinct seeds | **PASS** |
| **VAR-008** | Level 2 Variation | Meaningful maze differences | Two consecutive new Level 2 runs produce distinct templates/grids | **PASS** |
| **VAR-009** | Level 2 Retry | Seed preserved on retry | Level 2 retry retains exact same `seedHex` | **PASS** |
| **VAR-010** | Level 2 Retry | Maze variant preserved on retry | Level 2 retry retains exact same base template, grid, and hazards | **PASS** |
| **VAR-011** | Game Restart | Level 2 restart run identity | Restarting game generates fresh `runId` for subsequent Level 2 runs | **PASS** |
| **VAR-012** | Level 2 Distribution | Non-deterministic spread | Across 20 new runs, multiple distinct base templates appear | **PASS** |
| **VAR-013** | Level 2 Dev Override | Developer seed reproduction | Providing seed parameter reproduces exact identical maze and seedHex | **PASS** |
| **VAR-014** | Level 2 Retry Integrity | Retry does not mutate geometry | Retrying does not rerun procedural generation | **PASS** |

---

## 10. Phase 7 Level 4: Firewall Dodge (Packet Inspection Corridor) Test Suite

The following automated and manual tests validate Level 4 multi-lane canvas navigation, 4-state hazard telegraphing, 5 distinct authored variants, single-shot collision handling, safe respawn checkpoints, mobile Pointer D-pad controls, lifecycle handling, and scoring (`tests/level4.test.js`):

| Test ID | Test Category | Description | Verification Condition | Status |
|---|---|---|---|---|
| **LEVEL4-001** | Lifecycle | Level initializes correctly | Sets player pos $(40, 225)$, 60s timer metadata, default flags | **PASS** |
| **LEVEL4-002** | Variants | 5 authored variants exist | `LEVEL4_VARIANTS.length === 5`, all pass schema validation | **PASS** |
| **LEVEL4-003** | Safety | Start buffer is 100% safe | No hazard path intersects $x \in [0, 80]$ px | **PASS** |
| **LEVEL4-004** | Reachability | Extraction zone is reachable | Extraction zone spans $x \in [720, 800]$ px | **PASS** |
| **LEVEL4-005** | Physics | Linear velocity update | Moving right for 1.0s advances $x$ by $220 \pm 1$ px | **PASS** |
| **LEVEL4-006** | Physics | Velocity normalization | Diagonal speed equals orthogonal speed ($220 \times 1/\sqrt{2}$) | **PASS** |
| **LEVEL4-007** | Boundary | Canvas edge clamping | Player clamped within $[0, 780] \times [0, 430]$ | **PASS** |
| **LEVEL4-008** | Collision | Active hazard collision | Hitbox overlap with `ACTIVE` hazard registers hit | **PASS** |
| **LEVEL4-009** | Life Rule | Exactly 1 life lost per hit | `callbacks.onLoseLife` called once per collision event | **PASS** |
| **LEVEL4-010** | Telegraph | Hazards follow 4-state cycle | `SAFE` $\to$ `WARNING` $\to$ `ACTIVE` $\to$ `COOLDOWN` transitions verified | **PASS** |
| **LEVEL4-011** | Checkpoint | Safe Island activates checkpoint | Reaching $x \ge 390$ sets checkpoint to $(400, 225)$ | **PASS** |
| **LEVEL4-012** | Respawn | Collision returns to checkpoint | Hit resets player to spawn (or checkpoint) | **PASS** |
| **LEVEL4-013** | Determinism | Hazards deterministic at $t$ | Identical simulation clock $t$ gives identical hazard coordinates | **PASS** |
| **LEVEL4-014** | Pause | Pause freezes loop & hazards | Input cleared, RAF stopped, coordinates preserved | **PASS** |
| **LEVEL4-015** | Resume | Resume avoids delta jump | Timestamp re-anchored on resume; no instantaneous hazard warp | **PASS** |
| **LEVEL4-016** | Timer | Starts with 60 seconds | `LEVEL_METADATA[4].durationSeconds === 60` | **PASS** |
| **LEVEL4-017** | Timeout | Timer 0 triggers life loss | 0s remaining fires `onLoseLife` via GameManager | **PASS** |
| **LEVEL4-018** | Retry | Retry preserves variant | Variant index preserved; checkpoint reset to spawn | **PASS** |
| **LEVEL4-019** | Teardown | Cleanup unbinds listeners & RAF | Zero lingering event listeners or active animation frames | **PASS** |
| **LEVEL4-020** | Completion | Extraction gate clears level | Overlapping $x \ge 730$ triggers `callbacks.onComplete` | **PASS** |
| **LEVEL4-021** | Scoring | Score formula precision | Score equals $\max(0, 2000 + (\text{time} \times 20) - (\text{penalties}))$ | **PASS** |
| **LEVEL4-022** | Mobile | Virtual D-Pad controls | Pointer events dispatch directional movement | **PASS** |
| **LEVEL4-023** | Mobile | `touch-action: none` | Viewport & controls prevent browser gesture zoom/scroll | **PASS** |
| **LEVEL4-024** | Dev Mode | Direct variant launch | `?dev=1&level=4&variant=X` launches target variant | **PASS** |
| **LEVEL4-025** | Accessibility | Reduced motion support | Flashes dampened when `prefers-reduced-motion` is active | **PASS** |
| **LEVEL4-026** | Route Choice | Multiple vertical lanes exist | Every variant has at least 2 distinct navigable $y$-lane paths | **PASS** |
| **LEVEL4-027** | Onboarding | Safe learning opening | First 3.0s / first hazard provides generous reaction window | **PASS** |
| **LEVEL4-028** | Telegraph | Visual warning precedes damage | Warning duration $\ge 0.6$s before any hazard becomes lethal | **PASS** |
| **LEVEL4-029** | Anti-Glitches | Penalty applied once per collision | Lingering in hazard does not multiply 250 penalty | **PASS** |
| **LEVEL4-030** | Safe Respawn | Respawn never occurs in hazard | Spawn $(40, 225)$ and Checkpoint $(400, 225)$ have 0 hazard overlap | **PASS** |
| **LEVEL4-031** | Distinctness | Variants mechanically distinct | V1 timing $\neq$ V2 patrol $\neq$ V3 crossfire $\neq$ V4 storm $\neq$ V5 gauntlet | **PASS** |
| **LEVEL4-032** | Fair Budget & Pacing | Completable in 30–40s / 60s limit | Intended route traversable in 30–40s under active play, fitting within 60s limit | **PASS** |
| **LEVEL4-033** | Checkpoint | Checkpoint retains position | Hit after midpoint respawns at $(400, 225)$, not $(40, 225)$ | **PASS** |
| **LEVEL4-034** | Idempotence | No duplicate life-loss triggers | Rapid hazard overlap cannot fire `onLoseLife` multiple times | **PASS** |



