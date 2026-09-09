# Cyber Escape 🕹️🔒

> A cybersecurity-themed, browser-based puzzle and adventure escape room game built with Vanilla JavaScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Planning & Specification](https://img.shields.io/badge/Status-Specification%20Phase-cyan.svg)](#project-status)
[![Platform: Web (Zero Dependencies)](https://img.shields.io/badge/Platform-Web%20(HTML5%20%2F%20ES6)-green.svg)](#technology-stack)

---

## 📌 Project Overview
**Cyber Escape** is an interactive, browser-based escape room game developed as a college mini-project. The player assumes the role of an ethical analyst whose digital avatar is trapped inside a locked, compromised computer mainframe. To initiate an emergency disconnect and escape, the player must crack password hashes, navigate corrupted digital memory mazes, locate hidden cryptographic keys, evade dynamic firewall hazards, and execute a master root kernel override.

The project emphasizes clean software architecture, deterministic state machines, responsive canvas/DOM interactions, and resilient local client-side persistence—with **zero runtime external frameworks or build tooling**.

---

## 🎮 Planned Gameplay & Levels

The game features **5 progressive cybersecurity-themed challenges**:

1. **Level 1 — Password Breach:** Logic-based puzzle requiring players to deduce a salted password hash using security clues within limited attempts.
2. **Level 2 — Digital Maze:** 2D grid maze navigation where the player guides a data packet to the exit node while avoiding corrupted memory barriers and pulse firewalls. Features a 60-second limit and a deterministic procedural variation engine built on 5 hand-authored base templates.
3. **Level 3 — Hidden Key:** Deep inspection challenge requiring players to examine memory dumps, filter out deceptive decoys, and isolate the authentic AES encryption key.
4. **Level 4 — Firewall Dodge:** Real-time evasion challenge requiring careful navigation across active packet corridors while avoiding moving firewall laser sweeps.
5. **Level 5 — System Override:** Grand finale combining memory sequence recall, port frequency balancing, and a timed root disconnect trigger to achieve freedom.

---

## ⚙️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Markup** | HTML5 | Accessible, semantic layout and canvas viewport elements |
| **Styling** | Vanilla CSS3 | Bespoke modern dark cybersecurity design system using CSS custom properties |
| **Logic** | Vanilla JavaScript (ES6+) | Modular game engine, canvas rendering, and state management |
| **Persistence** | Web Storage API (`localStorage`) | Client-side session state, user settings, and top 10 local leaderboard |
| **Audio** | Web Audio API | Lightweight retro-cyberpunk synthesizer sound effects with zero audio file downloads |
| **Version Control** | Git & GitHub | Source code tracking and static hosting via GitHub Pages |

*Note: The core game functions 100% offline without external dependencies or mandatory backend servers.*

---

## 📂 Project Structure

```
Cyber-escape/
├── docs/                     # Specifications & project documentation (Source of Truth)
│   ├── PRD.md                # Product Requirements Document
│   ├── DESIGN.md             # Visual design system & CSS design tokens
│   ├── GAME_DESIGN.md        # Detailed level rules, mechanics & formulas
│   ├── ARCHITECTURE.md       # Modular software architecture & state flow
│   ├── TECH_STACK.md         # Technology rationale, boundaries & deployment
│   ├── DATA_MODEL.md         # Data models, validation & LocalStorage schemas
│   ├── TESTING.md            # Test strategy, categories & 20 initial test cases
│   ├── ROADMAP.md            # Phased 13-stage development roadmap
│   └── CONTRIBUTING.md       # Coding conventions & style guide
├── css/                      # Stylesheets (to be created in Phase 1)
├── js/                       # Modular ES6 JavaScript (to be created in Phase 1+)
├── assets/                   # SVG icons and static assets
├── index.html                # Main entry markup (to be created in Phase 1)
└── README.md                 # Project documentation summary
```

---

## 🚦 Development Status

**Current Checkpoint:** Phase 5 Complete (Level 1 + Level 2 Fully Implemented & Verified). Development paused after Level 2.

* **Phase 1 — Project Foundation:** COMPLETE ✅
* **Phase 2 — Design System & Main Menu:** COMPLETE ✅
* **Phase 3 — Core Game Engine & HUD Integration:** COMPLETE ✅
* **Phase 4 — Level 1: Password Breach:** COMPLETE ✅
  * Multi-step forensic deduction architecture
  * 5 distinct, solvable cyber investigation scenarios
  * Categorized forensic records (Nodes, Services, Timeline) with trust ratings (VERIFIED, SUSPECT, DECOY)
  * Tiered hint penalty system, 3-attempt lockout enforcement, and interactive authorization terminal
* **Phase 5 — Level 2: Digital Maze:** COMPLETE ✅
  * 5 hand-authored structural base templates (Circuit Matrix, Packet Bypass, Logic Labyrinth, Memory Register, Kernel Conduit)
  * Controlled procedural variation engine (`mazeGenerator.js`) with deterministic Mulberry32 PRNG (160+ unique layouts)
  * Guaranteed BFS solvability ($25 \le \text{path} \le 60$), perimeter boundary integrity, and hazard fairness validation
  * Deterministic moving scan packets, pulsating corrupted nodes, and synchronized pulse barriers
  * 60-second countdown limit (`01:00`); same maze/seed preserved on retry, fresh variant on new run
  * Smooth AABB collision & wall sliding; full desktop keyboard (WASD/Arrows) and mobile Pointer D-pad support
  * Deterministic developer seed reproduction (`?dev=1&level=2&seed=...`)

### Upcoming Phases (NOT YET IMPLEMENTED):
* **Phase 6 — Level 3: Hidden Key / Memory Dump:** Upcoming ⏳
* **Phase 7 — Level 4: Firewall Dodge / Packet Corridor:** Upcoming ⏳
* **Phase 8 — Level 5: System Override / Root Kernel:** Upcoming ⏳
* **Phase 9 — Leaderboard Persistence & Storage:** Upcoming ⏳
* **Phase 10+ — Final QA, Production Cleanup, Deployment & Submission Preparation:** Upcoming ⏳

---

## 🛠️ Developer Mode — Direct Level Access (DEVELOPMENT ONLY)

> [!NOTE]
> During development and QA evaluation, developer tools allow testing any individual level directly.
>
> **Access Options:**
> 1. **Main Menu UI:** Click `[DEBUG // LEVEL ACCESS]` on the main menu to open the sector modal (`01 FIREWALL GATE`, `02 DIGITAL LABYRINTH`, `03 MEMORY DUMP`, `04 PACKET CORRIDOR`, `05 ROOT KERNEL`).
> 2. **Keyboard Shortcut:** Press `Ctrl + Shift + L` to toggle the developer modal.
> 3. **Direct URL:** Open `http://localhost:8080/?dev=1&level=N` (where `N` is 1 to 5).
> 4. **Seed Override:** Open `http://localhost:8080/?dev=1&level=2&seed=12345` or `?dev=1&level=2&seed=A7F2` to reproduce an exact maze layout.
>
> **Production Safety:**
> Setting `DEV_MODE: false` in [`js/core/devConfig.js`](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/js/core/devConfig.js) completely disables and unmounts all developer controls, blocks direct launches, and rejects URL overrides. Developer runs are flagged as test sessions and prohibited from leaderboard submission.

---

## 🚀 How to Run Locally

Start a lightweight static HTTP server:
```bash
# Using npx serve (recommended)
npx -y serve -l 8080 .

# Or using Python 3
python -m http.server 8080
```
Open **`http://localhost:8080`** in any modern web browser.

---

## 🧪 How to Run Automated Tests

Execute all 93 automated tests across the 4 test suites:
```bash
node --test tests/level2.test.js tests/dev_mode.test.js tests/level1.test.js tests/engine.test.js
```


---

## 🔮 Future Enhancements (Post-Submission)
* **Online Leaderboard:** Optional Firebase Cloud Firestore integration for real-time global player rankings.
* **Additional Security Levels:** SQL Injection puzzle, Phishing email analyzer, and Caesar/Vigenère cipher cracker.
* **Speedrun Mode:** Global timer challenge with downloadable escape certificates.

---

## 📖 Documentation Index
For comprehensive technical details, please consult the documents in the [docs/](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs) directory:
- [Product Requirements Document (PRD)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/PRD.md)
- [Visual Design System (DESIGN.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/DESIGN.md)
- [Game Design & Mechanics (GAME_DESIGN.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/GAME_DESIGN.md)
- [Software Architecture (ARCHITECTURE.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/ARCHITECTURE.md)
- [Technology Stack (TECH_STACK.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/TECH_STACK.md)
- [Data Models & Persistence (DATA_MODEL.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/DATA_MODEL.md)
- [Testing Strategy & Test Cases (TESTING.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/TESTING.md)
- [Implementation Roadmap (ROADMAP.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/ROADMAP.md)
- [Contributing & Code Standards (CONTRIBUTING.md)](file:///c:/Users/FARHAN%20HARIS/Documents/Cyber-escape/docs/CONTRIBUTING.md)

---

## 📜 License
This project is licensed under the MIT License — see the LICENSE file for details.
