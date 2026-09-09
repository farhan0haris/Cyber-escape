# Cyber Escape — Development Handoff

## Current Status

Development of **Cyber Escape** is cleanly paused at the completion of **Phase 5** (Level 2 Replayability Revision and Visual Polish).

- **Phase 1 — Project Foundation**: COMPLETE (Directory structure, documentation standards, architecture)
- **Phase 2 — Design System & Main Menu**: COMPLETE (Cyberpunk neon design system, interactive main menu, accessibility, audio subsystem)
- **Phase 3 — Core Game Engine & HUD**: COMPLETE (GameManager, LevelManager, GameState event bus, HUD synchronization, global lives, timer, and score management)
- **Phase 4 — Level 1 — Password Breach**: COMPLETE (Forensic deduction, 5 distinct scenarios, evidence correlation, hint penalty, scoring, pause/resume, retry)
- **Phase 5 — Level 2 — Digital Maze & Controlled Procedural Replayability**: COMPLETE (5 base authored templates, controlled topology and hazard mutations, seeded PRNG, BFS validation, 60s timer limit, retry maze preservation, developer seed override)

Current Checkpoint: **Level 1 and Level 2 are fully playable, verified, and test-covered (93/93 unit tests passing).**

---

## Current Architecture

The codebase follows a strictly modular, decoupled, Vanilla JavaScript (ES Modules) architecture without third-party frameworks.

### Core Systems (`js/core/` & `js/systems/`):
- **[GameManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/core/GameManager.js)**: Central orchestrator and sole authoritative owner of global player lives (3), global accumulated score, level transitions, and game lifecycle states (`MENU`, `PLAYING`, `PAUSED`, `LEVEL_COMPLETE`, `GAME_OVER`, `VICTORY`). Dispatches single failure pathways for hazard collisions and timeouts.
- **[LevelManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/core/LevelManager.js)**: Manages level registration, initialization, transitions, lifecycle hooks, and cleanup.
- **[GameState.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/core/GameState.js)**: Reactive pub/sub event bus coordinating game state changes across UI, HUD, and level instances.
- **[Timer.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/Timer.js)**: Robust countdown timer with millisecond precision, pause/resume freezing, timeout callbacks, and tick event dispatching.
- **[ScoreManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/ScoreManager.js)**: Calculates and awards base scores, time bonuses, hint penalties, and streak multipliers while strictly enforcing non-negative score floors.
- **[InputManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/InputManager.js)**: Unified input handler capturing keyboard (WASD/Arrows), UI clicks, touch events, and mobile D-pad interactions.
- **[StorageManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/StorageManager.js)**: LocalStorage abstraction managing player profiles, settings, high scores, and persistent game data with fallbacks.
- **[UIManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/UIManager.js)**: Handles screen transitions, modal overlays (pause, retry, level complete, game over), HUD telemetry updates, and accessibility alerts.
- **[AudioManager.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/systems/AudioManager.js)**: Web Audio API sound synthesizers (SFX, ambient drone, UI clicks, success/failure tones) with mute and volume controls.
- **[devConfig.js](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/core/devConfig.js)**: Centralized developer configuration toggle, URL parameter parser, and developer level selector modal.

---

## Completed Levels

### Level 1: Password Breach (`js/levels/Level1.js`, `js/levels/level1Data.js`)
- **Forensic Deduction**: Players analyze multi-source network logs, employee badges, packet traces, and security memos.
- **5 Puzzle Scenarios**: Authoured distinct scenarios (`Server Infiltration`, `Database Breach`, `Firewall Intrusion`, `Cloud Perimeter`, `Mainframe Exfiltration`).
- **Mechanics**: Evidence trust categorization (VERIFIED, SUSPECT, DECOY), correlation tracking, 3 authorization attempts limit, 2 hints with score penalties (-100 pts), retry and pause integration.

### Level 2: Digital Maze (`js/levels/Level2.js`, `js/levels/level2Data.js`, `js/levels/mazeGenerator.js`)
- **Centerpiece Canvas Navigation**: High visual complexity, 2.5D pseudo-isometric digital maze environment with dynamic neon glow, corruption scanlines, particle emissions, and ambient grid depth.
- **5 Authored Base Templates**: `Circuit Matrix`, `Packet Bypass`, `Logic Labyrinth`, `Memory Register`, and `Kernel Conduit`.
- **Procedural Replayability**: Seeded deterministic generator applying topological branch/dead-end mutations and dynamic hazard repositioning while strictly preserving solvable paths.
- **Movement & Controls**: Responsive keyboard (WASD / Arrow keys) and on-screen mobile D-pad with pointer-capture for smooth press-and-hold traversal and wall sliding.
- **Hazards**: Deterministic patrol scan packets, cyclic pulse barriers, and firewall grid sectors.
- **Timer & Retry**: Exactly 60-second time limit. Replay/retry retains identical maze and seed while restoring spawn position and resetting timer. New runs generate fresh valid maze variants.

---

## Current Level 2 Architecture

1. **Base Templates (`level2Data.js`)**: Five distinct hand-authored 16x9 grid matrices with established corridor topologies, spawn points, and exit nodes.
2. **Deterministic PRNG (`mazeGenerator.js`)**: Mulberry32 pseudorandom number generator keyed by numeric or string seeds.
3. **Controlled Topology Mutation (`mazeGenerator.js`)**: Mutates up to 3 non-essential wall/corridor cells without isolating pathways or sealing corridors.
4. **Controlled Hazard Mutation (`mazeGenerator.js`)**: Moves hazard patrol routes or activates alternating deterministic pulse nodes.
5. **Validation Engine (`mazeGenerator.js`)**:
   - Breadth-First Search (BFS) reachability validation from spawn to exit.
   - Hazard-aware path validation ensuring no hazard permanently obstructs critical routes.
   - Path-length validation (minimum distance ≥ 20 steps).
   - Consecutive-run meaningful difference validation (comparing wall grids and hazard layouts).
   - Duplicate run prevention (tracking recent template/seed hashes).
6. **Seed Override**: Supports `?dev=1&level=2&seed=12345` to deterministically regenerate identical test labyrinths.

---

## Developer Mode

A development-only toolsuite is included to allow rapid testing without playing through preceding levels:

- **Central Toggle**: Controlled via `DEV_MODE` in `js/core/devConfig.js` (currently `true`).
- **Direct Level Access**:
  - UI Level Selector modal accessible via Developer Mode badge on the Main Menu and in-game pause screen.
  - Direct URL launching: `http://localhost:8080/?dev=1&level=2`
  - Direct seed specification: `http://localhost:8080/?dev=1&level=2&seed=12345`
- **Isolation**: Developer mode sessions do not pollute production leaderboards or persistent campaign saves.

> [!NOTE]
> Developer tools are isolated in `js/core/devConfig.js` and can be globally disabled by setting `DEV_MODE: false`.

---

## What Is NOT Implemented

The following phases and items are explicitly **NOT STARTED** and left for future development:
- ❌ **Phase 6 — Level 3: Hidden Key / Memory Dump** (Hex viewer / memory forensics deduction minigame)
- ❌ **Phase 7 — Level 4: Firewall Dodge** (Real-time timing and collision avoidance minigame)
- ❌ **Phase 8 — Level 5: System Override** (Multi-stage terminal / command injection terminal puzzle)
- ❌ **Phase 9 — Final Leaderboard & Persistence** (Persistent global high scores and player career records)
- ❌ **Phase 10+ — Production Optimization & Deployment** (Asset bundling, final QA, submission packaging)

---

## How To Run

To run the project locally on any machine:

```powershell
# Using Python 3 (built-in HTTP server)
python -m http.server 8080

# OR using Node.js npx serve
npx serve -l 8080 .
```

Open your browser to: `http://localhost:8080`

---

## How To Test

Run the full automated test suite using Node.js built-in test runner:

```powershell
# Run all test suites
node --test tests/level2.test.js tests/dev_mode.test.js tests/level1.test.js tests/engine.test.js

# Run individual suites
node --test tests/level1.test.js
node --test tests/level2.test.js
node --test tests/dev_mode.test.js
node --test tests/engine.test.js
```

Current Test Results: **4 test suites, 93 test cases, 0 failures, 100% passing.**

---

## How To Directly Test Levels

1. **Via UI**: Launch the game, click the `[DEV MODE: SELECT LEVEL]` button in the top corner of the main menu, and select Level 1, 2, 3, 4, or 5.
2. **Via Query Parameters**:
   - Launch Level 1: `http://localhost:8080/?dev=1&level=1`
   - Launch Level 2 (Random Seed): `http://localhost:8080/?dev=1&level=2`
   - Launch Level 2 (Deterministic Seed): `http://localhost:8080/?dev=1&level=2&seed=12345`

---

## Important Design Rules

When resuming development, adhere strictly to the established architectural principles:
1. **Visual Excellence**: Dark cyberpunk aesthetics, high visual complexity, rich glowing accents (`#00ffcc`, `#ff007f`, `#ffe600`), smooth animations, and no generic flat colors.
2. **Gameplay Complexity**: Medium-hard intellectual challenges designed to reward logical deduction and spatial problem-solving.
3. **Vanilla JS Standards**: Pure ES Modules, zero external frameworks, clean lifecycle management (`init()`, `start()`, `pause()`, `resume()`, `cleanup()`).
4. **State Ownership**: `GameManager` remains the sole authoritative owner of global lives and global score. Levels report success/failure events rather than mutating global state directly.
5. **Solvability & Fairness**: All procedural variations must pass validation algorithms before being presented to the player.
6. **Deterministic Hazards**: Hazard patterns (scan packets, pulse gates) must be learnable and deterministic.

---

## Next Development Task

When development resumes, begin with:

**Phase 6 — Level 3: Hidden Key / Memory Dump**
- Hex dump inspection interface
- Pattern searching and decoded binary extraction
- Regex / memory block alignment puzzles
