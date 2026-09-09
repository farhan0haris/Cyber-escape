# Technology Stack Specification (TECH_STACK.md)
## Cyber Escape — Tools, Standards & Deployment Architecture

---

### Document Overview
This document specifies the technical stack, runtime environments, storage mechanisms, hosting platforms, and technical boundaries for **Cyber Escape**.

---

## 1. Selected Technologies & Rationale

| Category | Technology | Rationale |
|---|---|---|
| **Structure** | **HTML5** | Native, accessible, semantic document markup. Utilizes standard `<canvas>`, `<dialog>`, `<section>`, and `<main>` elements without overhead. |
| **Styling** | **CSS3 (Vanilla)** | Complete styling flexibility, fast hardware-accelerated animations, CSS custom properties (`var(--token)`), flexbox, and CSS grid without build steps or runtime CSS-in-JS penalties. |
| **Logic** | **Vanilla JavaScript (ES6+)** | Native ES6 modules (`import`/`export`), classes, arrow functions, promises, and Canvas 2D Context API. Provides 100% browser compatibility without requiring Babel, Webpack, or Vite. |
| **Persistence** | **Web Storage API (`localStorage`)** | Instant synchronous key-value storage for local session state, user preferences, and top 10 leaderboard entries. Zero configuration required. |
| **Audio** | **Web Audio API** | Dynamic sound synthesizer (sine, square, sawtooth waves with envelope gain nodes). Generates lightweight retro cyberpunk audio on-the-fly without loading external audio files. |
| **Development** | **Antigravity IDE** | AI-assisted pair programming and rapid prototyping environment. |
| **Version Control** | **Git & GitHub** | Source code version control, branch management, pull requests, issue tracking, and automated deployment pipelines. |

---

## 2. Optional Future Technologies

### Firebase Cloud Firestore (Future P3 Enhancement)
* **Purpose:** Provides a real-time, global, cross-device online leaderboard.
* **Scope Rule:** The game **MUST** function 100% autonomously without Firebase. If Firebase SDK fails to load or offline status is detected, the game silently and seamlessly defaults to `localStorage` with zero disruption to the player.
* **Implementation Plan (Future):** Simple modular client SDK (`firebase/firestore/lite`) loaded optionally via dynamic import when an internet connection and Firebase config keys are present.

---

## 3. Technology Boundaries (What NOT to Use)

To maintain high code quality, accessibility, zero runtime friction, and meet the specific criteria of a college mini-project, the following technologies are **strictly prohibited** unless explicitly requested:

1. **No Heavy Frontend Frameworks:**
   * Do NOT use React, Vue, Angular, Svelte, or Next.js.
   * *Reason:* Adds unnecessary bundle size, build pipelines, and abstraction layers for a 2D arcade/puzzle mini-project.
2. **No CSS Frameworks / Utilities:**
   * Do NOT use Tailwind CSS, Bootstrap, or Bulma.
   * *Reason:* Vanilla CSS design tokens provide a much cleaner, bespoke cybersecurity aesthetic without hundreds of utility classes cluttering HTML nodes.
3. **No Heavy Game Engines:**
   * Do NOT use Phaser.js, Three.js, Pixi.js, or Babylon.js.
   * *Reason:* HTML5 Canvas 2D and modern DOM are more than sufficient for 2D mazes, puzzle matrices, and obstacle avoidance, while dramatically simplifying academic code evaluation.
4. **No Mandatory Backend Server:**
   * Do NOT require Node.js Express, Python Flask, or PHP servers for core gameplay.
   * *Reason:* Must run directly as a static client application that can be opened via `file://` or any static web server.
5. **No Bulky External Asset Packs:**
   * Do NOT load dozens of megabytes of external MP3s, WAVs, or high-res texture packs.
   * *Reason:* Ensures near-instantaneous page loads (< 1 second) and eliminates CORS / asset loading failures.

---

## 4. Supported Runtime Environments

### Desktop Browsers
- Google Chrome (Version 100+)
- Mozilla Firefox (Version 100+)
- Apple Safari (Version 15+)
- Microsoft Edge (Version 100+)

### Mobile & Tablet Browsers
- Safari on iOS 15+
- Chrome on Android 10+
- Firefox Mobile

---

## 5. Deployment Possibilities

Because **Cyber Escape** has zero build step requirements, it is a pure static web app that can be deployed instantly to any static host:

### Option A: GitHub Pages (Recommended for College Project)
* **Configuration:** Serve directly from repository root (`/`) or `/docs` on the `main` branch.
* **Cost:** Free, automatic SSL certificate, integrated into GitHub.

### Option B: Netlify
* **Configuration:** Drag-and-drop deployment or connected Git repository.
* **Settings:** Build command: *None* | Publish directory: `.`

### Option C: Vercel
* **Configuration:** Import Git repository as "Other" static project.
* **Settings:** Build command: *None* | Output directory: `.`
