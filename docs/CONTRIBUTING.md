# Contributing & Coding Standards (CONTRIBUTING.md)
## Cyber Escape — Engineering Conventions & Style Guide

---

### Document Overview
This document outlines the coding style, directory conventions, Git practices, and testing requirements for contributors working on **Cyber Escape**. Adhering to these standards ensures the codebase remains clean, readable, modular, and easy for evaluators to review.

---

## 1. Project Directory Structure
All project assets and source files must conform to the following directory layout:

```
Cyber-escape/
├── docs/                     # Specifications & project documentation
│   ├── PRD.md
│   ├── DESIGN.md
│   ├── GAME_DESIGN.md
│   ├── ARCHITECTURE.md
│   ├── TECH_STACK.md
│   ├── DATA_MODEL.md
│   ├── TESTING.md
│   ├── ROADMAP.md
│   └── CONTRIBUTING.md
├── css/                      # Vanilla CSS stylesheets
│   ├── variables.css         # Design tokens (colors, fonts, radii)
│   ├── layout.css            # Base container, grid, HUD layout
│   ├── components.css        # Buttons, cards, modals, form inputs
│   └── responsive.css        # Breakpoints & mobile touch layouts
├── js/                       # Modular Vanilla JavaScript (ES6)
│   ├── app.js                # Application bootstrap entry point
│   ├── state/
│   │   └── gameState.js      # Central game state model & observer
│   ├── core/
│   │   ├── gameManager.js    # Lifecycle orchestrator (start, pause, win, lose)
│   │   ├── levelManager.js   # Level loader & lifecycle coordinator
│   │   ├── timer.js          # High-precision delta timer
│   │   ├── scoreManager.js   # Scoring math & bonus calculations
│   │   └── input.js          # Keyboard & touch input aggregator
│   ├── levels/
│   │   ├── baseLevel.js      # Base level class / interface definition
│   │   ├── level1_password.js# Level 1: Password Breach
│   │   ├── level2_maze.js    # Level 2: Digital Maze
│   │   ├── level3_key.js     # Level 3: Hidden Key
│   │   ├── level4_dodge.js   # Level 4: Firewall Dodge
│   │   └── level5_override.js# Level 5: System Override
│   ├── storage/
│   │   ├── storage.js        # Safe LocalStorage wrapper
│   │   └── leaderboard.js    # High-score sorting & retrieval
│   ├── ui/
│   │   ├── uiManager.js      # Modal, screen, and HUD DOM renderer
│   │   └── hud.js            # Live status bar component
│   └── audio/
│       └── audioManager.js   # Web Audio API sound synthesizer
├── assets/                   # Static icons or favicons (minimal SVG only)
├── index.html                # Root HTML document
└── README.md                 # Project introduction and overview
```

---

## 2. Naming Conventions

### 2.1 File & Directory Names
* **Directories & Files:** Use `camelCase` or `kebab-case` consistently.
  * Level modules: `level1_password.js`, `level2_maze.js`, etc.
  * Stylesheets: `variables.css`, `components.css`.
  * Documentation files: `UPPERCASE.md` (e.g., `PRD.md`).

### 2.2 JavaScript Code
* **Classes:** `PascalCase` (e.g., `GameManager`, `ScoreManager`, `DigitalMazeLevel`).
* **Functions & Methods:** `camelCase` with descriptive action verbs (e.g., `calculateScore()`, `handleCollision()`, `initLevel()`).
* **Variables & Properties:** `camelCase` (e.g., `remainingLives`, `currentLevelId`).
* **Constants & Enums:** `UPPER_SNAKE_CASE` (e.g., `MAX_LIVES = 3`, `DEFAULT_COUNTDOWN = 75`, `STATUS_PAUSED = 'PAUSED'`).
* **Private Methods/Fields:** Prefix with underscore or use native private `#field` syntax (e.g., `_renderCanvas()`).

### 2.3 HTML & CSS
* **CSS Class Names:** `kebab-case` using BEM-like clarity (e.g., `.btn-primary`, `.hud-container`, `.modal-backdrop`, `.card-header`).
* **CSS Variables:** Prepend `--` with category prefix (e.g., `--bg-primary`, `--accent-primary`, `--space-md`).
* **DOM IDs:** `camelCase` or `kebab-case` for specific singletons (e.g., `id="gameCanvas"`, `id="player-name-input"`).

---

## 3. JavaScript Standards (ES6+)
1. **Modules:** Always use native ES6 `import` and `export` statements. Do NOT use CommonJS (`require` / `module.exports`).
2. **Variable Declarations:**
   * Prefer `const` by default.
   * Use `let` only when variable re-assignment is needed.
   * **Never use `var`**.
3. **Strict Equality:** Always use `===` and `!==` instead of `==` and `!=`.
4. **Pure Functions where possible:** Game math and scoring formulas must be pure functions that are easy to test.
5. **No Globals:** Do not attach variables to `window` unless explicitly required for debugging (and gated behind a dev flag).

---

## 4. CSS Standards
1. **No Inline Styles:** Keep all presentation in CSS files. Dynamic values (like canvas pixel width/height or progress bar percentage) are the only acceptable exception.
2. **Tokens First:** Always reference CSS variables from `variables.css` for colors, spacing, font sizes, and borders. Never hardcode arbitrary hex colors like `#0b0f14` in component files.
3. **Box Sizing:** Ensure `*, *::before, *::after { box-sizing: border-box; }` is active globally.
4. **Responsive Media Queries:** Keep mobile rules co-located in `responsive.css` or at the bottom of component files using `min-width` or `max-width` consistently.

---

## 5. HTML Standards
1. **Semantic Elements:** Use `<main>`, `<header>`, `<nav>`, `<section>`, `<dialog>`, and `<button>` instead of non-semantic `<div>` tags where appropriate.
2. **Button Type:** Always specify `type="button"` on non-submitting interactive buttons to avoid unintended form triggers.
3. **Accessibility:** Include `alt` attributes on images, `aria-label` on icon-only buttons, and proper `<label>` elements for inputs.

---

## 6. Git Workflow & Commit Guidelines

### 6.1 Branching Strategy
* `main`: Protected production branch; must always contain stable, bug-free, deployable code.
* `feature/<phase-or-feature-name>`: Development branches for discrete roadmap tasks (e.g., `feature/phase-1-foundation`, `feature/level-2-maze`).

### 6.2 Commit Message Format
Use Conventional Commits formatting:
```
<type>(<scope>): <short descriptive summary in imperative tense>

[optional body explaining motivation and context]
```
* **Types:**
  * `feat`: A new feature or level implementation.
  * `fix`: A bug fix.
  * `docs`: Documentation updates or additions.
  * `style`: Code styling, CSS formatting, or aesthetic tweaks (no logic change).
  * `refactor`: Restructuring code without changing functionality.
  * `test`: Adding or updating test cases.

* **Examples:**
  * `docs(specs): author complete PRD and architecture specification`
  * `feat(level2): implement maze tile rendering and collision physics`
  * `fix(timer): resolve countdown delta drift during window blur`

---

## 7. Testing & Quality Expectations
Before opening a pull request or submitting a phase for review:
1. **Check Console:** Verify zero unhandled errors or syntax warnings in the browser DevTools console.
2. **Verify Cross-Browser:** Test in at least two modern browsers (e.g., Chrome + Firefox).
3. **Execute Relevant Test Cases:** Confirm the corresponding test cases in `TESTING.md` pass successfully.
4. **Check Mobile Layout:** Inspect responsive emulation at 375px width to ensure HUD and controls render without horizontal overflow.
