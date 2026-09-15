# CYBER ESCAPE 🕹️🔒

> An experimental browser-based cybersecurity escape game built around investigation, navigation, memory forensics, real-time evasion, and system override mechanics.

[![Platform: Web (Zero Runtime Dependencies)](https://img.shields.io/badge/Platform-Web%20(HTML5%20%2F%20ES6)-green.svg)](#tech-stack)
[![Status: Complete](https://img.shields.io/badge/Status-Complete%20%26%20Verified-cyan.svg)](#overview)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Overview

**Cyber Escape** is an interactive, browser-based cybersecurity escape game that explores combining cybersecurity concepts, deductive problem solving, procedural environments, real-time gameplay, forensic interfaces, and immersive web visuals.

The project was created while exploring a distinct approach to browser game design—blending technical realism with arcade-style game loops, deterministic procedural variation, and multi-layered visual atmospheres (including hardware-accelerated CRT emulation and a dynamic WebGL particle swarm).

The player assumes the role of an ethical analyst trapped inside a locked, compromised mainframe. To initiate an emergency disconnect and escape, you must investigate forensic evidence, navigate dynamic digital labyrinths, analyze corrupted memory dumps, evade firewall laser corridors, and execute a multi-stage root kernel override.

---

## ✨ Features

- **Five Distinct Challenges**: Each level features unique gameplay systems—from forensic deduction and maze navigation to memory analysis, collision dodging, and frequency stabilization.
- **Forensic Investigation & Deduction**: Logic-driven evidence analysis where players inspect nodes, network services, and logs to verify authentic credentials.
- **Procedural Digital Maze**: Deterministic procedural variation engine with hand-authored templates, guaranteed BFS solvability, moving scan packets, and pulse barriers.
- **Deep Memory Forensics**: Interactive memory fragment inspection with field comparisons, candidate triage, and progressive verification.
- **Real-Time Firewall Evasion**: High-precision 2D continuous collision detection, hazard telegraph phases, safe checkpoint islands, and extraction routing.
- **Multi-Stage System Override**: Grand finale combining kernel sequence execution, multi-parameter stability balancing, and an oscillating disconnect trigger.
- **Scenario & Variant Variation**: Authored scenario pools and deterministic PRNG ensure unique run variations while preserving exact layouts across retries.
- **Run & Retry Lifecycle**: Cohesive session management with real-time scoring, bonus multipliers, mistake counters, and dynamic timers.
- **Immersive Visual Aesthetics**: Dual-layer visual pipeline featuring a 3D WebGL particle swarm and a real-time GLSL CRT monitor effect with scanlines, chromatic aberration, and phosphor persistence.
- **Synthesized Audio Engine**: Fully procedural retro-cyberpunk sound effects synthesized via the Web Audio API with zero external audio assets.
- **Local Persistence**: Client-side storage for settings, audio preferences, level unlock states, and local high scores.
- **Developer & Testing Suite**: Integrated developer modal (`Ctrl + Shift + L` or `?dev=1`), direct level jumping, seed overrides, and a 160+ automated test suite.

---

## 🎮 Levels

### Level 1 — Password Breach (Firewall Gate)
Forensic investigation and evidence deduction. Players analyze categorized evidence cards (Nodes, Services, Timeline) with trust ratings (`VERIFIED`, `SUSPECT`, `DECOY`), use forensic scratchpad tools, and deduce valid credentials before lockout.

### Level 2 — Digital Maze (Digital Labyrinth)
Procedurally varied navigation through a hostile digital environment. Players guide a data packet through complex circuit grids, avoiding corrupted node pulses and moving scan packets within a 60-second limit.

### Level 3 — Memory Forensics (Memory Dump)
Deep memory fragment analysis. Players inspect 12 volatile memory chips, compare suspect signatures, triage authentic candidates against decoy fragments, and unlock cryptographic keys.

### Level 4 — Firewall Dodge (Packet Corridor)
Real-time route selection and hazard evasion. Players navigate active packet corridors featuring cycling laser hazards, telegraph warnings, safe island checkpoints, and extraction gates.

### Level 5 — System Override (Root Kernel)
Three-stage final system operation:
1. **Node Sequencing**: Execute the correct cryptographic routing sequence.
2. **Frequency Stabilization**: Calibrate frequency, damping, and phase parameters into a stable equilibrium zone.
3. **Timed Disconnect**: Trigger emergency disconnect during optimal oscillation windows to complete the escape.

---

## ⚙️ Tech Stack

Built entirely with standard web technologies with **zero runtime external frameworks or build tooling**:

- **HTML5**: Semantic document structure, canvas elements, and accessible UI hierarchy.
- **CSS3 / Vanilla CSS**: Custom cyberpunk design tokens, glassmorphism panels, responsive grid/flexbox layouts, and keyframe animations.
- **JavaScript (ES6 Modules)**: Pure modular game architecture (`GameManager`, `LevelManager`, `InputManager`, `AudioManager`, `Timer`, `StorageManager`).
- **HTML5 2D Canvas**: High-performance rendering for maze navigation, particle physics, and real-time hazard corridors.
- **WebGL / GLSL Shaders**: Custom fragment and vertex shaders powering CRT scanline bloom, curvature distortion, and 3D particle swarm motion.
- **Web Audio API**: Real-time synthesizer nodes (oscillators, biquad filters, gain envelopes) generating responsive sound effects.
- **Web Storage API (`localStorage`)**: Resilient offline state persistence.
- **Node.js Test Runner**: Comprehensive native test suite covering engine logic, scenario generation, procedural variation, and level mechanics.

---

## 🚀 Running Locally

### Prerequisites
Any modern web browser (Chrome, Firefox, Edge, Safari) and a simple static HTTP server.

### 1. Clone the repository
```bash
git clone https://github.com/farhan0haris/Cyber-escape.git
cd Cyber-escape
```

### 2. Start a local server
```bash
# Option A: Using npx serve (recommended)
npx -y serve . -p 8080

# Option B: Using Python 3
python -m http.server 8080

# Option C: Using PHP
php -S localhost:8080
```

### 3. Open in your browser
Navigate to:
```
http://localhost:8080
```

---

## 🧪 Running Automated Tests

Run the full automated test suite using Node.js:

```bash
# Run all test suites
node tests/engine.test.js
node tests/level1.test.js
node tests/level2.test.js
node tests/level3.test.js
node tests/level4.test.js
node tests/level5.test.js
node tests/variation.test.js
```

---

## 🛠️ Developer & Testing Controls

Developer tools are available for QA evaluation and testing:

- **Modal Access**: Press `Ctrl + Shift + L` or click `[DEBUG // LEVEL ACCESS]` on the main menu.
- **Direct Level Launch**: Append `?dev=1&level=N` (where `N` is 1 to 5) to the URL.
- **Seed Reproduction**: Append `?dev=1&level=2&seed=A7F2` to reproduce an exact maze layout.
- **Production Guard**: Set `DEV_MODE: false` in [`js/core/devConfig.js`](js/core/devConfig.js) to unmount all developer controls and enforce strict gameplay rules.

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).
