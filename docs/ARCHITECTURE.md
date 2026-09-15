# Software Architecture Document (ARCHITECTURE.md)
## Cyber Escape — System Architecture & Component Design

---

### Document Overview
This document describes the architectural layout, modular organization, state management paradigms, lifecycle events, and component interactions for **Cyber Escape**.

The architecture uses standard **Modular Vanilla JavaScript (ES6 Modules)** with an event-driven / pub-sub design pattern, separating game logic, rendering, input handling, and storage persistence.

---

## 1. Architectural Principles
1. **Separation of Concerns:** Pure game state is decoupled from UI DOM and Canvas rendering.
2. **Deterministic State Transitions:** State changes occur solely through defined methods on the Game Manager and State Machine.
3. **No External Framework Bloat:** High performance and direct DOM/Canvas control without virtual DOM abstractions or third-party game engines.
4. **Resilient Data Layer:** LocalStorage operations are isolated inside a dedicated Storage Manager with defensive validation and fallback guards.

---

## 2. High-Level Component Diagram

```
+-------------------------------------------------------------------------+
|                              index.html                                 |
+-------------------------------------------------------------------------+
                                    │
                                    ▼
                         [Application Bootstrap]
                                (app.js)
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
     [Game State]                                   [Game Manager]
   (state/gameState.js)                          (core/gameManager.js)
             │                                             │
             │           ┌─────────────────────────────────┼─────────────────────────────────┐
             │           ▼                                 ▼                                 ▼
             │    [Level Manager]                    [Timer Manager]                  [Score Manager]
             │  (core/levelManager.js)              (core/timer.js)                   (core/scoreManager.js)
             │           │
             │           ├─► [Level 1: PasswordBreach]
             │           ├─► [Level 2: DigitalMaze]
             │           ├─► [Level 3: HiddenKey]
             │           ├─► [Level 4: FirewallDodge]
             │           └─► [Level 5: SystemOverride]
             ▼                                             ▼                                 ▼
     [Storage Manager]                              [Input Manager]                    [UI Manager]
    (storage/storage.js)                           (core/input.js)                   (ui/uiManager.js)
             │                                                                               │
             ▼                                                                               ▼
     [Leaderboard Model]                                                               [Audio Manager]
   (storage/leaderboard.js)                                                          (audio/audioManager.js)
```

---

## 3. Module Responsibilities

### 3.1 Application Bootstrap (`app.js`)
* Entry point loaded by `<script type="module" src="js/app.js">`.
* Initializes singletons (`StorageManager`, `AudioManager`, `InputManager`, `UIManager`).
* Binds top-level event listeners (window resize, tab visibility change).
* Checks for existing user preferences in storage and renders the Main Menu.

### 3.2 Game State (`state/gameState.js`)
* Stores the authoritative in-memory state of the current game session:
  * `playerName` (string)
  * `currentLevel` (number 1–5)
  * `score` (number)
  * `lives` (number, 0–3)
  * `levelTimeRemaining` (number in seconds)
  * `totalTimeElapsed` (number in seconds)
  * `status` (enum: `'MENU'`, `'PLAYING'`, `'PAUSED'`, `'GAME_OVER'`, `'VICTORY'`)
* Emits state change events via an EventBus or callback subscriptions so UI and audio update reactively.

### 3.3 Game Manager (`core/gameManager.js`)
* Orchestrates overall game transitions:
  * `startGame(playerName)`
  * `pauseGame()` / `resumeGame()`
  * `retryCurrentLevel()` (deducts 1 life, resets current level timer)
  * `restartGame()` (resets back to Level 1, 3 lives, score 0)
  * `nextLevel()` (explicitly cancels current timer and unmounts previous level before mounting next)
  * `handleGameOver(reason)`
  * `handleGameVictory()`
* Coordinates between Level Manager, Timer, and Score Manager.

### 3.4 Level Manager (`core/levelManager.js`)
* Acts as a factory and lifecycle coordinator for individual level modules.
* Implements a common interface for all levels:
  * `init(containerElement, eventCallbacks)`
  * `start()`
  * `pause()`
  * `resume()`
  * `cleanup()`
* Explicitly removes event listeners, cancels `requestAnimationFrame`, and clears DOM/Canvas nodes before mounting the next level.

### 3.5 Timer (`core/timer.js`)
* High-precision countdown and elapsed time tracker.
* Uses timestamp delta checks (`performance.now()`) to prevent browser background timer throttling inaccuracies.
* Explicit `stop()` / `cleanup()` methods ensure timers cannot double-fire across level transitions.
* Dispatches `tick(remainingSeconds)`, `warning(seconds)`, and `expired()` events.

### 3.6 Score Manager (`core/scoreManager.js`)
* Encapsulates all scoring algorithms, time bonuses, penalties, and multipliers.
* Enforces strict non-negative clamping: `score = Math.max(0, calculatedScore)`.
* Provides methods: `addPoints(amount)`, `deductPoints(amount)`, `calculateLevelBonus(timeRemaining, lives)`.

### 3.7 Input Manager (`core/input.js`)
* Unifies desktop keyboard events (`keydown`, `keyup`) and mobile touch inputs (on-screen D-pad buttons, tap events).
* Prevents default browser behaviors on game keys (e.g., arrow keys scrolling the viewport).
* Normalizes input signals into a clean command stream (`MOVE_UP`, `MOVE_DOWN`, `MOVE_LEFT`, `MOVE_RIGHT`, `ACTION`, `PAUSE`).

### 3.8 Storage Manager (`storage/storage.js`)
* Encapsulates all read/write operations to `window.localStorage`.
* Provides fail-safe serialization/deserialization with `try...catch` guards.
* Fallbacks gracefully to memory cache if `localStorage` is disabled (e.g., incognito security restrictions).

### 3.9 Leaderboard Manager (`storage/leaderboard.js`)
* Handles leaderboard data operations:
  * `getTopScores(limit = 10)`
  * `addScore(entry)`
  * `clearLeaderboard()`
* Performs validation and multi-tier sorting: `score DESC, totalTime ASC`.

### 3.10 UI Manager (`ui/uiManager.js`)
* Controls DOM views: Main Menu, HUD, Modal Overlays (Pause, Level Briefing, Game Over, Victory), and Leaderboard modal.
* Manages notifications, screen shakes, and HUD value animations.

### 3.11 Audio Manager (`audio/audioManager.js`)
* Synthesizes retro-futuristic sound effects using the native browser **Web Audio API** (OscillatorNode, GainNode):
  * Click / Input beep
  * Error / Access denied buzzer
  * Success / Access granted chord
### 3.12 Lifecycle Commands & Variation Management

The game engine enforces a strict distinction between lifecycle commands to ensure proper replayability and fair deduplication:

| Lifecycle Action | `runId` State | Level 1 Scenario Behavior | Level 2 Maze Behavior | Score / Lives State |
|---|---|---|---|---|
| **START NEW RUN** (`startGame`) | Fresh `runId` generated | Selects among candidate scenarios, avoiding immediate recent repetition | Selects non-recent base template & generates fresh procedural seed | Score = 0, Lives = 3, Level = 1 |
| **LEVEL RETRY** (`retryCurrentLevel`) | Existing `runId` preserved | Preserves **exact same scenario** and expected answer | Preserves **exact same base template, seed, and maze layout** | Lives = Lives - 1, Score preserved |
| **GAME RESTART** (`restartGame`) | Fresh `runId` generated | Eligible for new distinct scenario selection | Eligible for new base template and fresh procedural seed | Score = 0, Lives = 3, Level = 1 |
| **PAUSE / RESUME** (`pauseGame` / `resumeGame`) | Existing `runId` preserved | Preserved | Preserved | Unchanged, Timer frozen/resumed |
| **QUIT TO MENU** (`quitToMenu`) | `runId` reset to null | Unmounted & cleaned | Unmounted & cleaned | Active session terminated |

---

## 4. Individual Level Module Architecture
Each level implements the standard `ILevel` lifecycle:

```javascript
// Level Interface Pattern
export class BaseLevel {
  constructor(container, callbacks) {
    this.container = container;
    this.callbacks = callbacks; // onWin, onLoseLife, onPenalty
  }
  init() {}
  start() {}
  pause() {}
  resume() {}
  cleanup() {} // Unbind event listeners, cancel rAF
}
```

* **Level 1 (`levels/Level1.js`):** DOM-based terminal UI with clue parsing and forensic evidence correlation.
* **Level 2 (`levels/Level2.js` & `levels/mazeGenerator.js`):** Canvas 2D grid rendering with AABB tile collision, smooth wall sliding, 60s countdown limit, and a deterministic procedural generation engine (`mazeGenerator.js`). Every run generates a solvable variant from one of 5 hand-authored base templates with controlled topological and hazard mutations.
* **Level 3 (`levels/Level3.js`):** Interactive DOM memory matrix with decoy inspect cards (placeholder slot).
* **Level 4 (`levels/Level4.js`):** High-frequency Canvas 2D animation loop with oscillating obstacle barriers (placeholder slot).
* **Level 5 (`levels/Level5.js`):** Composite module handling memory sequence recall, slider calibration, and timed execute triggers (placeholder slot).

---

## 5. Game Lifecycle & State Machine

```
[ Application Start ]
        │
        ▼
   [ Main Menu ] ───(Open Leaderboard)───► [ Leaderboard Modal ]
        │
        ├─► (Enter Player Name & Click Start)
        │
        ▼
[ Game Session Init ]
        │
   ┌────┴───────────────────────────────────────┐
   ▼                                            │
[ Level Briefing Modal ]                        │
   │                                            │
   ├─► (Player Clicks "START MISSION")          │
   ▼                                            │
[ Level Loop ] ◄───────────────────────────┐    │
   │                                       │    │
   ├── [ Gameplay Active ]                 │    │
   │      │                                │    │
   │      ├──► (User presses P) ──► [ Paused Modal ]
   │      │                             │
   │      │                             ├──► [ Resume ] ───┘
   │      │                             └──► [ Quit to Menu ]
   │      │
   │      ├──► (Mistake / Hit) ──► Lives > 0 ? Deduct Life & Reset Pos
   │      │                               │
   │      │                               └──► Lives == 0 ──┐
   │      │                                                 │
   │      └──► (Timer Hits 0) ────► Lives > 0 ? Deduct Life & Restart Level
   │                                      │                 │
   │                                      └──► Lives == 0 ──┤
   ▼                                                        ▼
[ Level Won ]                                        [ Game Over Modal ]
   │                                                        │
   ├── Level < 5: Advance Level ────────────────────────────┤
   │                                                        │
   └── Level == 5:                                          │
        ▼                                                   │
   [ Final Victory Screen ]                                 │
        │                                                   │
        ├─► [ Save Score to Leaderboard ]                   │
        │                                                   │
        ▼                                                   ▼
   [ Return to Main Menu / Restart Game Session ] ◄─────────┘
```

---

## 6. Error Handling & Edge Cases
1. **Corrupt Storage:** If `localStorage.getItem('cyberEscape.leaderboard')` fails JSON parsing, it is reset to empty `[]` and a warning is logged.
2. **Missing Canvas Support:** If `HTMLCanvasElement.getContext('2d')` returns null, a fallback compatibility banner is rendered.
3. **Tab Inactivity:** Window `blur` or `visibilitychange` automatically invokes `gameManager.pauseGame()` to prevent player death during background tabs.
4. **Uncaught Error Boundary:** Top-level window `error` handler prevents infinite alert loops and displays a clean UI recovery dialog.

---

## 7. Developer Mode (DEVELOPMENT ONLY)

> [!WARNING]
> **DEVELOPMENT & QA ONLY — NOT A USER-FACING GAME FEATURE**
> This feature is strictly temporary for academic and development testing. It enables direct access to any individual level (1 through 5) without playing through completed levels. Before final production release, setting `DEV_CONFIG.DEV_MODE = false` completely removes all developer UI and disables programmatic access.

### 7.1 Architecture & Single Switch Control
- **Configuration Root:** `js/core/devConfig.js` exports `DEV_CONFIG`:
  ```javascript
  export const DEV_CONFIG = {
    DEV_MODE: true, // Master switch: toggle to false for final production build
    DEFAULT_TEST_PLAYER: 'TEST_OPERATOR'
  };
  ```
- **Lifecycle Integration:** Direct launches execute via `gameManager.startDevLevel(levelNumber)` through canonical `GameManager` and `LevelManager` lifecycles:
  - Destroys prior level instance, clears event listeners, cancels `requestAnimationFrame` loops, and resets countdown and elapsed timers.
  - Initializes clean state: `playerName = "TEST_OPERATOR"`, `score = 0`, `lives = 3`, `completedLevels = [prerequisites]`, `isDevSession = true`.
  - Instantiates level slot through standard lifecycle hooks: `initialize -> mount -> start -> pause/resume -> completion -> cleanup`.
- **Leaderboard Protection:** Developer test runs set `isDevSession: true`. `GameManager.canSubmitLeaderboard()` evaluates to `false`, preventing test scores from ever polluting the production leaderboard or persistent storage.
- **Production Safety:** When `DEV_CONFIG.DEV_MODE = false`:
  - The developer level selector is not injected into the DOM.
  - Direct level launch calls immediately abort and return `false`.
  - Development URL parameters (`?dev=1&level=N`) are ignored.

