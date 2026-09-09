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

---

## 6. Detailed Level Specifications

---

### LEVEL 1 — PASSWORD BREACH
* **Cyber Metaphor:** Forensic reconstruction and cross-referencing of an authorization override key at the primary firewall gate.
* **Duration:** 75 Seconds.
* **Base Score:** 1,000 pts (+10 pts per remaining second).
* **Penalty:** -150 pts per incorrect authorization attempt; -100 pts for Hint 1; -150 pts for Hint 2.
* **Max Attempts Allowed:** 3 attempts. The 3rd failed attempt triggers an automatic security lockout (-1 life; if lives > 0, level resets with full 75s timer).

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

### LEVEL 3 — HIDDEN KEY
* **Cyber Metaphor:** Analyzing a cluttered memory dump to isolate the authentic decryption key among obfuscated decoys.
* **Duration:** 60 Seconds.
* **Base Score:** 1,200 pts (+15 pts per remaining second).
* **Penalty:** -100 pts and -5 seconds deduction for each decoy clicked.

#### Gameplay Mechanics:
1. The game displays an interactive grid of **12 inspectable memory chips / cards**.
2. Each card has a visual label (e.g., `BUFFER_01`, `CERT_02`, `KEY_07`).
3. Clicking/tapping any card displays its details in an **Inspector Sub-Panel**:
   * Displays Header, Algorithm, Fingerprint, and Checksum status.
4. **Authentic Key Criteria (Explicitly shown on screen banner):**
   * *Algorithm:* `AES-256`
   * *Fingerprint:* Starts with `7F`
   * *Checksum:* `VERIFIED_OK`
5. **Decoy Nodes (11 total):**
   * Examples: Missing AES header, starting with `3A`, corrupted checksum, or expired SSL certificate.
   * Clicking "INJECT KEY" on a decoy causes an error buzzer, -100 pts, and -5 seconds off the clock.
6. **Authentic Key (1 unique node):**
   * Satisfies all 3 criteria. Clicking "INJECT KEY" instantly triggers a green cryptographic match animation and advances to Level 4.

---

### LEVEL 4 — FIREWALL DODGE
* **Cyber Metaphor:** Crossing a live deep-packet inspection zone protected by sweeping laser beams and packet filters.
* **Duration:** 60 Seconds.
* **Base Score:** 2,000 pts (+20 pts per remaining second).
* **Penalty:** -250 pts and loss of 1 life upon colliding with a firewall beam.

#### Gameplay Mechanics:
1. Canvas-based arena (800×450px):
   * **Start Zone (Safe Buffer):** Left strip ($x = 0 \to 80$px) highlighted with green border.
   * **Goal Zone (Safe Terminal):** Right strip ($x = 720 \to 800$px) highlighted with pulsing cyan exit gate.
   * **Active Hazard Zone:** Middle area ($x = 80 \to 720$px).
2. **Obstacles:**
   * 4 vertical scanning firewall laser beams moving vertically with predictable, harmonic sinusoidal speeds.
   * 2 horizontal packet-scrubber drones moving back and forth across safe gaps.
3. **Collision & Life Handling:**
   * Continuous AABB collision checks between player ($20\times20$px) and moving hazard boxes.
   * Collision triggers a 200ms red screen flash, audio buzzer, -250 pts, and loss of 1 life.
   * Player avatar instantly resets to the Start Zone safe buffer.
   * If remaining lives = 0: Game Over triggers immediately.
4. Reaching the Goal Zone successfully clears Level 4.

---

### LEVEL 5 — SYSTEM OVERRIDE
* **Cyber Metaphor:** Executing the master override sequence on the root kernel terminal to initiate system escape.
* **Duration:** 90 Seconds.
* **Base Score:** 2,500 pts (+25 pts per remaining second) + (Surviving Lives × 500).
* **Max Error Tolerance:** 3 wrong sequences before security lockdown (-1 life, resets override stages).

#### Gameplay Mechanics:
The override requires clearing **3 consecutive intuitive protocol stages**:
1. **Stage 1 (Sequence Echo):**
   * A 4-node terminal matrix (`[ALPHA]`, `[BETA]`, `[GAMMA]`, `[DELTA]`) flashes a 4-step sequence with sound tones.
   * Player reproduces the sequence by clicking the buttons.
2. **Stage 2 (Port Frequency Balancing):**
   * Two slider controls: `CARRIER FREQUENCY` and `BUFFER OFFSET`.
   * Display shows target frequency (e.g., `TARGET: 75 MHz`) and current frequency readout.
   * Player slides controls into the designated target zone (within $\pm 3$ tolerance) and clicks **SYNCHRONIZE**.
3. **Stage 3 (Core Disconnect Trigger):**
   * A dynamic calibration bar oscillates left-and-right across a gauge with a central green sweet-spot.
   * Player taps the master **DISCONNECT SYSTEM** button when the indicator is inside the green target zone.
4. **Completion:** Clearing Stage 3 halts all timers, plays the terminal escape animation ("ROOT ACCESS RESTORED — ESCAPE COMPLETED"), and transitions to the **Victory Screen**.

---

## 7. State Transitions & Edge Cases
* **Pause State:** Game loops pause immediately, `requestAnimationFrame` loop freezes, countdown interval suspends with exact millisecond preservation.
* **Window Blur / Tab Switch:** Game automatically triggers pause state to prevent unfair deaths while the player is unfocused.
* **Game Over:** Displays total completed levels, final score achieved, cause of death (e.g., "Firewall Integrity Breached" or "Timer Expired"), and an immediate "TRY AGAIN" button.
* **Victory Screen:** Displays Player Name, Final Score, Remaining Lives, Total Completion Time, and automatically prompts submission to the Local Leaderboard.
