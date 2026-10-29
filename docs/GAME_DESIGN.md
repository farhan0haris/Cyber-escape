# Game Design Document (GAME_DESIGN.md)
## Cyber Escape — Mechanics, Systems & Level Design

---

### Document Overview
This document contains the complete gameplay specifications, rules, level designs, math formulas, and victory/defeat criteria for **Cyber Escape**. It serves as an exact implementation reference for game developers.

---

## 1. Game Concept & Narrative
The player is a cybersecurity analyst whose consciousness has been trapped within an isolated containment sandbox of a compromised mainframe. To initiate an emergency disconnect and escape into the open net, the player must bypass 5 layers of internal security subsystems.

## 2. Core Gameplay Loop
```
[Level Briefing & Objective]
         │
         ▼
[Active Gameplay Stage] ◄────────┐
   ├── Player Input              │ Retries / Position Reset
   ├── Countdown Timer Ticking   │ (if lives > 0)
   └── Hazard / Rule Evaluation  │
         │                       │
         ├─► Hazard / Error ─────┘
         │
         ▼
[Level Victory Triggered]
         │
         ▼
[Score & Time Bonus Calculation]
         │
         ▼
[Advance to Next Level (or Escape Victory)]
```

## 3. Player Objectives & Controls
* **Primary Objective:** Successfully clear all 5 levels without depleting all 3 lives or letting any level timer hit zero.
* **Global Controls:**
  * `P` or `Escape`: Pause / Resume game.
  * `R`: Quick restart game back to Level 1 (from pause menu).
  * `M`: Toggle audio (mute/unmute).
* **Level Navigation Controls (Levels 2 & 4):**
  * `W` / `Up Arrow`: Move Up.
  * `S` / `Down Arrow`: Move Down.
  * `A` / `Left Arrow`: Move Left.
  * `D` / `Right Arrow`: Move Right.
  * Mobile: Dedicated on-screen touch D-Pad (Up, Down, Left, Right directional buttons rendered below the canvas).
* **Puzzle Interaction Controls (Levels 1, 3, 5):**
  * Mouse Click / Mobile Tap on on-screen terminal buttons, objects, and input fields.
  * Keyboard text entry or on-screen alphanumeric keypad for Level 1 password field.

---

## 4. Difficulty Philosophy, Progression & Balancing
* **Target Difficulty:** Medium $\rightarrow$ Medium-Hard.
* **Skill Over Luck:** No level or puzzle is dependent on random chance or brute-force guessing. Every challenge requires deductive logic, spatial navigation, careful observation, precise timing, or pattern recognition.
* **Progressive Cognitive & Skill Demands:**
  * **Level 1 (Logical Deduction):** Player analyzes cybersecurity clues, rules out decoy attributes, and solves the cryptographic password.
  * **Level 2 (Spatial Reasoning & Routing):** Player navigates a multi-corridor memory labyrinth with intentional choke points, requiring conscious route planning.
  * **Level 3 (Information Verification & Forensic Observation):** Player cross-examines 12 realistic memory dump chips against strict hash, algorithm, and checksum specifications, where decoys look convincing.
  * **Level 4 (Dynamic Evasion & Reaction Timing):** Player evades sinusoidal laser sweeps and harmonic packet filters requiring rhythm and reflex.
  * **Level 5 (Culminating Override Protocol):** Combines audio-visual pattern recall (Simon-style), analog frequency balancing, and high-stakes oscillation sweet-spot synchronization.
* **Balanced Forgiving/Punishing Ratio:** Mistakes incur immediate score and time penalties or life loss, but rules are crisp, telegraphs are distinct, and puzzles can be mastered within 45–75 seconds by an attentive player.
* **Total Estimated Playtime:** 7 to 12 minutes for an unbroken, successful run.

---

## 5. Global Systems

### 5.1 Lives System
* Player begins the game with **3 Lives**.
* Losing a life plays a warning pulse, screen flash, and buzzer sound indicator.
* Lives persist across levels throughout an active run.
* If a level times out or a hazard occurs:
  * 1 life is deducted.
  * If lives > 0: Level resets for another attempt with full countdown timer.
  * If lives = 0: Game Over is triggered immediately.

### 5.2 Time Limits & Timer Logic
* Every level has a countdown timer starting at a level-specific value $T_{\text{max}}$.
* Precision is maintained using `performance.now()` delta calculations to eliminate drift caused by background tabs.
* Pausing halts the countdown and preserves remaining time to the millisecond.
* Level completion cancels the active timer instance before initiating the next level.

### 5.3 Scoring Formula
Total Game Score is the sum of scores earned across all 5 levels plus an end-game survival bonus:
$$\text{Level Score} = \max\Big(0, \text{BaseScore} + (\text{RemainingSeconds} \times \text{Multiplier}) - \text{Penalties}\Big)$$
$$\text{End Game Bonus} = \text{RemainingLives} \times 500$$
$$\text{Total Score} = \sum_{i=1}^5 \text{LevelScore}_i + \text{EndGameBonus}$$
* Guaranteed non-negative score: Under no circumstances can a level score or total score drop below 0.

### 5.4 Run Identity & Replayability Variation Rules
* **New Runs vs Retries:**
  * **New Run (`startGame` / `restartGame`):** Generates a unique `runId`. Level 1 chooses a new puzzle scenario (avoiding recent duplicates); Level 2 selects a non-recent base template and generates a fresh procedural seed.
  * **Level Retry (`retryCurrentLevel`):** Preserves `runId`. Level 1 retains the exact same scenario and answer; Level 2 retains the exact same base template, seed, grid, and hazards.
  * **Developer Mode Override:** Explicit scenario (`?dev=1&level=1&scenario=1..5`) or seed (`?dev=1&level=2&seed=12345`) overrides random selection deterministically.

---

## 6. Detailed Level Specifications

---

### LEVEL 1 — PASSWORD BREACH
* **Cyber Metaphor:** Forensic reconstruction and cross-referencing of an authorization override key at the primary firewall gate.
* **Duration:** 150 Seconds.
* **Base Score:** 1,000 pts (+10 pts per remaining second).
* **Penalty:** -150 pts per incorrect authorization attempt; -100 pts for Hint 1; -150 pts for Hint 2.
* **Max Attempts Allowed:** 3 attempts. The 3rd failed attempt triggers an automatic security lockout (-1 life; if lives > 0, level resets with full 150s timer).

#### Gameplay Mechanics & Forensic Deduction Architecture:
1. **Deductive Multi-Step Structure:** No authorization segment (`[HASH]`, `[PORT]`, `[YEAR]`) is ever directly displayed in the raw evidence. The player must deduce each segment through cross-referencing:
   * **Segment A [HASH]:** Isolate the single authentic node marked `[VERIFIED AUTHENTIC]` from the Node Verification Matrix, then concatenate its two designated memory trace fragments (`TRACE-X + TRACE-Y`).
   * **Segment B [PORT]:** Identify the authorized protocol assigned to the verified node, consult the Service Port Registry, and eliminate blocked/prohibited candidate services per the Security Gateway Policy.
   * **Segment C [YEAR]:** Compute the final containment timestamp from the chronological chain: $\text{Year} = \text{Base Epoch} + \text{Kernel Deployment Delta} + \text{Incident Containment Delta}$.
2. **5 Hand-Crafted Solvable Scenarios:**
   * **Scenario 1 (Sector Alpha — SSH Admin):**
     * Node: Node-07 (Verified) | Traces: TR-1 (`7F`) + TR-3 (`91`) $\rightarrow$ `7F91`
     * Service: SSH (Secure Shell) $\rightarrow$ `22`
     * Chronology: Base (2060) + Kernel (18) + Incident (9) $\rightarrow$ `2087`
     * *Solution:* `7F91222087`
   * **Scenario 2 (Sector Beta — TLS Gateway):**
     * Node: Node-09 (Verified) | Traces: TR-2 (`E4`) + TR-4 (`2B`) $\rightarrow$ `E42B`
     * Service: HTTPS (TLS Secure Transport) $\rightarrow$ `443`
     * Chronology: Base (2010) + Kernel (12) + Incident (2) $\rightarrow$ `2024`
     * *Solution:* `E42B4432024`
   * **Scenario 3 (Sector Gamma — DNS Resolver):**
     * Node: Node-06 (Verified) | Traces: TR-3 (`5C`) + TR-1 (`D8`) $\rightarrow$ `5CD8`
     * Service: DNS (Domain Name Service) $\rightarrow$ `53`
     * Chronology: Base (2050) + Kernel (25) + Incident (16) $\rightarrow$ `2091`
     * *Solution:* `5CD8532091`
   * **Scenario 4 (Sector Delta — NTP Synchronization):**
     * Node: Node-08 (Verified) | Traces: TR-2 (`A7`) + TR-4 (`4D`) $\rightarrow$ `A74D`
     * Service: NTP (Network Time Protocol) $\rightarrow$ `123`
     * Chronology: Base (2030) + Kernel (14) + Incident (5) $\rightarrow$ `2049`
     * *Solution:* `A74D1232049`
   * **Scenario 5 (Sector Epsilon — SQL Core Database):**
     * Node: Node-10 (Verified) | Traces: TR-1 (`F3`) + TR-3 (`88`) $\rightarrow$ `F388`
     * Service: MySQL (Relational Database) $\rightarrow$ `3306`
     * Chronology: Base (2000) + Kernel (15) + Incident (16) $\rightarrow$ `2031`
     * *Solution:* `F38833062031`
3. **Investigation Interface:**
   * **Left Panel:** Forensic Dossier containing 8 categorized evidence items with filter tabs (`ALL`, `NODES`, `SERVICES`, `TIMELINE`).
   * **Center Panel:** Deduction Matrix with step-by-step logic guide, interactive Operator Scratchpad (with auto-transfer to terminal), and a 2-tier hint request system.
   * **Right Panel:** Authorization Terminal with high-contrast text input, virtual alphanumeric keypad, and tiered directional feedback.
4. **Scoring & Lockout Rules:**
   * $\text{Score} = \max\Big(0, 1000 + (\text{RemainingTime} \times 10) - (\text{Mistakes} \times 150) - \text{HintPenalties}\Big)$.
   * Attempt 1 Failure: Broad directional guidance.
   * Attempt 2 Failure: Specific correlation guidance without segment exposure.
   * Attempt 3 Failure: Automatic security lockout ($\rightarrow -1$ life & sector retry).

---

### LEVEL 2 — DIGITAL MAZE
* **Cyber Metaphor:** Navigating through corrupted packet buffers and fragmented memory registers inside Sector 02: Digital Labyrinth.
* **Duration:** 60 Seconds (countdown begins at 01:00 for new runs and re-arms to 01:00 on retries).
* **Base Score:** 1,500 pts (+15 pts per remaining second).
* **Penalty:** None for touching walls (walls act as rigid physical obstacles). Hazard impact triggers canonical life deduction (-1 life) and sector retry.
* **Environment:** 2D Grid Canvas (20 columns × 15 rows, tile size 40×30px, canvas logical resolution 800×450px).
* **Actors:**
  * **Player Avatar:** Electric Cyan glowing data-packet square ($22\times22$px) with trailing velocity echoes.
  * **Maze Walls:** Dark navy solid barrier tiles with neon cyan boundary edges and circuit nodes.
  * **Extraction Core Exit:** Pulsing green terminal node ($26\times26$px) located at grid coordinate `(18, 13)` with spinning radar reticle.
  * **Hazards:**
    * *Corrupted Nodes (`CORRUPTED_NODE`):* Stationary pulsating red traps at dead-end baits and false corridor junctions.
    * *Patrolling Scan Packets (`SCAN_PACKET`):* Moving linear hazard packets oscillating at constant velocity between deterministic waypoints.
    * *Cyclic Pulse Barriers (`PULSE_BARRIER`):* Timed firewall gates cycling through deterministic phases: SAFE (1.5–1.8s) $\rightarrow$ CHARGING WARN (0.75–0.8s) $\rightarrow$ LETHAL ACTIVE (1.0s).

#### Replayability Engine & Controlled Procedural Variation:
1. **Hand-Authored Templates + Deterministic Seeded Mutations:**
   - 5 structural base templates (Circuit Matrix, Packet Bypass, Logic Labyrinth, Memory Register, Kernel Conduit).
   - Deterministic 32-bit Mulberry32 PRNG uses a run seed (e.g. `A7F2` or integer) to mutate wall openings, alternate corridors, dead-end extensions, and hazard placements.
   - Solvability guarantee: Every generated layout is evaluated via BFS ($25 \le \text{path} \le 60$), perimeter boundary integrity, and hazard fairness before presentation.
2. **Consecutive-Run Visual Difference Gate:**
   - Checks candidate variants against the immediate previous run to ensure at least 2+ structural wall differences, route length delta, or hazard configuration shifts.
3. **Session Deduplication & Retry Consistency:**
   - In-memory recent run history prevents immediate duplicate template/seed combinations.
   - **Retry Rule:** On failure and retry, the level reuses the **exact same generated maze variant and seed**, restores the player to spawn `(1, 1)`, resets the timer to **60 seconds**, and deducts 1 global life.
4. **Developer Reproduction:**
   - URL parameter `?dev=1&level=2&seed=12345` or `?dev=1&level=2&seed=A7F2` deterministically reproduces the exact maze layout when `DEV_MODE === true`. Disabled when `DEV_MODE === false`.

#### Gameplay Mechanics & Navigation Physics:
1. **Spawn & Extraction Coordinates:** Player starts at safe Top-Left node `(x: 1, y: 1)`; Extraction Core is located at Bottom-Right node `(x: 18, y: 13)`.
2. **Controls:**
   * Desktop: WASD or Arrow keys (browser scrolling default prevented; input ignored during text entry).
   * Mobile: On-screen virtual Pointer D-Pad (Up, Down, Left, Right) supporting press-and-hold via Pointer Events with `touch-action: none`.
3. **Collision & Sliding Physics:** Independent X and Y axis AABB tile collision allows smooth wall sliding without corner sticking or wall tunneling.
4. **Velocity Normalization:** Diagonal velocity is strictly normalized by multiplying by $1/\sqrt{2} \approx 0.7071$, ensuring uniform movement speed ($180$ px/s) across all directions.
5. **Failure & Life Loss:** Colliding with an active hazard or timer timeout deducts exactly 1 life through GameManager's canonical `onLoseLife()` pathway. If lives remain, the sector resets with full timer; if 0 lives remain, Game Over triggers.
6. **Level Completion & Scoring:**
   * $\text{Level Score} = \max\Big(0, 1500 + (\text{RemainingTime} \times 15)\Big)$.
   * Reaching the Extraction Core locks controls, displays the sector score breakdown overlay, and advances to the Sector 03 mounted placeholder slot.

---

### LEVEL 3 — HIDDEN KEY / MEMORY DUMP FORENSICS
* **Cyber Metaphor:** Analyzing a volatile memory dump to isolate the authentic decryption key among 11 corrupted, spoofed, or stale decoys.
* **Duration:** 150 Seconds.
* **Base Score:** 1,200 pts (+15 pts per remaining second).
* **Penalty:** -100 pts and -5 seconds deduction for each false decoy verification.
* **Lockout:** 3 failed verifications trigger a security lockout and life loss.

#### Key Forensic Systems & Mechanics:
1. **12 Inspectable Memory Blocks:** Interactive grid displaying chip labels, memory addresses, algorithms, and triage markers.
2. **First-Time Onboarding Tutorial (Scenario 1):**
   - Step 1: Inspect 2 blocks to establish an initial evidence baseline.
   - Step 2: Pin a reference block and compare against target blocks.
   - Step 3: Run `[CORRELATE RECORDS]` to evaluate origin domain & signature family alignment.
   - Step 4: Triage suspect blocks (`NORMAL` $\to$ `SUSPICIOUS` $\to$ `CANDIDATE`).
   - Step 5: Verify candidate block once the Authenticity Gate unlocks.
3. **Forensic Comparator:** Live field-by-field diffing (`MATCH`, `DIFFERENT`, `ANOMALY`) between pinned reference and target candidate.
4. **Active Record Correlation (`[CORRELATE RECORDS]`):**
   - Evaluates shared cipher architecture, provenance enclave, and signature family without revealing answers.
5. **Zero Answer Leaks:** Internal authenticity flags (`isAuthentic`, `defectReason`) are never rendered in the DOM or UI.
6. **Retry Behavior:** Exact scenario and 12-chip layout are preserved on retry while resetting transient triage/comparison state and deducting 1 life.

---
---

### LEVEL 4 — FIREWALL DODGE / PACKET INSPECTION CORRIDOR
* **Cyber Metaphor:** Traversing a multi-lane high-throughput packet inspection conduit protected by oscillating firewall lasers, patrol sentinels, pulse gates, and packet storms.
* **Duration:** 60 Seconds.
* **Base Score:** 2,000 pts (+20 pts per remaining second).
* **Penalty:** -250 pts and loss of 1 life upon colliding with an active hazard (applied once per collision event).
* **Target Pacing:** 30–40s clean skilled run time with ample observation/repositioning buffer.

#### Core Gameplay & Navigation Mechanics:
1. **Multi-Lane Free 2D Movement ($800 \times 450$px Canvas):**
   * **Start Safe Buffer ($x = 0 \to 80$px):** Spawn point $(x: 40, y: 225)$, completely protected from all hazard paths.
   * **Sector 1 Active Corridor ($x = 80 \to 380$px):** Multi-lane conduit featuring Top, Mid, and Bottom lane choices with alternating timing windows.
   * **Midpoint Safe Island ($x = 380 \to 420$px):** Permanent energy-shielded transit haven. Crossing $x \ge 390$px arms the Checkpoint $(x: 400, y: 225)$ without restoring lives.
   * **Sector 2 Active Gauntlet ($x = 420 \to 720$px):** Advanced hazard intersection with divergent high-speed vs. synchronized lane options.
   * **Extraction Goal Zone ($x \ge 720$px):** Pulsing cyan extraction gate ($x \ge 730$px completes the level).
2. **4-State Deterministic Hazard Model:**
   * `SAFE`: Translucent cyan wireframe (walkable / non-lethal).
   * `WARNING`: Amber chevrons + sound chime + guide emitter glow (pre-fire telegraph).
   * `ACTIVE`: Electric red energy beam/drone (lethal).
   * `COOLDOWN`: Dissipating orange energy arcs (non-lethal).
3. **5 Mechanically Distinct Authored Variants:**
   * `v1_timing_gates`: Staggered rhythmic pulse barriers across conduit lanes.
   * `v2_patrol_drones`: Waypoint-patrolling scrubber sentinels with directional headlights.
   * `v3_crossfire_beams`: Harmonically oscillating sweeping lasers with sinusoidal speed.
   * `v4_packet_storms`: High-density packet stream bursts across vertical lanes.
   * `v5_master_gauntlet`: Integrated deep inspection gauntlet combining all hazard systems.
4. **Collision, Safe Respawn & Invulnerability:**
   * Hitbox: Fair $16 \times 16$px collision box centered inside $20 \times 20$px diamond avatar.
   * On collision: Single-shot -250 pts penalty and 1 life deducted via GameManager `onLoseLife()`.
   * Respawn: Player instantly resets to active Checkpoint (Spawn or Midpoint Island) with 1.2s post-respawn invulnerability window.
5. **Lifecycle & Retry Consistency:**
   * Level retry preserves exact variant index, resets checkpoint to spawn, and re-arms full 60s timer.

---

### LEVEL 5 — SYSTEM OVERRIDE / ROOT KERNEL
* **Cyber Metaphor:** Executing the master override sequence on the collapsing root kernel terminal to breach containment and escape the sandbox.
* **Duration:** 180 Seconds.
* **Base Score:** 2,500 pts (+25 pts per remaining second) + (Surviving Lives × 500 pts).
* **Max Error Tolerance:** 3 cumulative major stage failures before security lockdown (-1 life, resets override to Stage 1 with full 180s timer).

#### Gameplay Mechanics & Connected 3-Stage Climax:
1. **Stage 1 (Access Pathway Recall):**
   - Meaningful Node Matrix: `[ALPHA / KERNEL]`, `[BETA / BUFFER]`, `[GAMMA / CIPHER]`, `[DELTA / ROOT]`.
   - Flashes an authentic 4-to-5 step harmonic sequence with audio tones.
   - Reproducing the sequence channels power into the core and unlocks Stage 2.
2. **Stage 2 (Parameter Coherence Tuning — Zero Answer Leaks):**
   - Dual rotary/slider controls: `CARRIER FREQUENCY` (20–150 MHz) and `BUFFER OFFSET` (32–512 KB).
   - Target numbers are strictly internal. Player observes live **Kernel Coherence %** and **Harmonic Waveform** smoothing towards resonance.
   - Locking parameters at $\ge 95\%$ stability feeds power into the disconnect capacitor.
3. **Stage 3 (Timed Disconnect Execution):**
   - 4-State Harmonic Sweep Gauge: `WAITING` $\to$ `APPROACHING` $\to$ `OPTIMAL WINDOW` $\to$ `MISSED`.
   - Player taps `[EXECUTE EMERGENCY DISCONNECT]` while the oscillating needle is aligned within the highlighted green sweet spot.
4. **Final Escape Sequence & Victory Presentation:**
   - Breaches containment: `"ROOT ACCESS REVOKED // CONTAINMENT FAILURE // EXTERNAL CHANNEL CONNECTED // ESCAPE VECTOR OPEN // MISSION COMPLETE"`.
   - Transitions to the dedicated **Mission Accomplished Screen** displaying Player Name, Final Score, Remaining Lives, Elapsed Time, and Performance Rating (`CYBER SPECTRE`, `NETWORK OPERATIVE`, `SURVIVOR`).

---

## 7. State Transitions & Edge Cases
* **Pause State:** Game loops pause immediately, `requestAnimationFrame` loop freezes, countdown interval suspends with exact millisecond preservation.
* **Window Blur / Tab Switch:** Game automatically triggers pause state to prevent unfair deaths while the player is unfocused.
* **Game Over:** Displays total completed levels, final score achieved, cause of death (e.g., "Firewall Integrity Breached" or "Timer Expired"), and an immediate "TRY AGAIN" button.
* **Victory Screen:** Displays Player Name, Final Score, Remaining Lives, Total Completion Time, and automatically prompts submission to the Local Leaderboard.
