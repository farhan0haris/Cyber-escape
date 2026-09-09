# Visual Design System Specification (DESIGN.md)
## Cyber Escape — System Aesthetic & Style Guide

---

### Document Overview
This document defines the complete visual language, design tokens, UI components, layout behaviors, and accessibility requirements for **Cyber Escape**. The aesthetic is **Modern, Dark, Cybersecurity-inspired, Minimal, Game-like, Polished, and Responsive**.

It deliberately avoids:
* Generic AI dashboard styles (no purple-pink glowing meshes or generic card grids).
* Crypto / Web3 clichés (no token coins, neon trading charts, or holographic clutter).
* Excessive retro 1990s green-on-black terminal fonts that impair modern readability.
* Flat corporate admin panels with generic gray tables.

---

## 1. Design Principles
1. **Restraint Over Clutter:** High-impact dark surfaces with deliberate, purposeful accent pops rather than neon everywhere.
2. **Readability First:** Clear typography and strict contrast compliance so puzzles and clues are effortless to parse.
3. **Tactile Feedback:** Crisp micro-transitions (hover glows, active press scales, danger pulses) that make interfaces feel like a physical security terminal.
4. **Cohesive Atmosphere:** Subtle scanlines, technical grid lines, and status badges that reinforce the feeling of being trapped in a secured digital mainframe.

---

## 2. Color System & Design Tokens
All color values are authored using CSS custom properties with HSL/HEX definitions to support easy theming and contrast management.

```css
:root {
  /* Background Surfaces */
  --bg-primary: #0b0f14;       /* Deep near-black charcoal */
  --bg-secondary: #111822;     /* Dark navy elevation */
  --surface: #182230;          /* Elevated panel surface */
  --surface-hover: #223042;    /* Interactive hover surface */
  --surface-active: #2b3d54;   /* Active pressed surface */
  --surface-border: #243447;   /* Subtle structural border */

  /* Text & Typography */
  --text-primary: #e6edf3;     /* Crisp high-contrast off-white */
  --text-secondary: #8b9bb4;   /* Muted technical gray */
  --text-muted: #54667a;       /* Inactive / hint text */
  --text-inverse: #0b0f14;     /* Contrast text on bright accents */

  /* Cyber Accents */
  --accent-primary: #00d2ff;   /* Electric Cyan — interactive primary */
  --accent-primary-hover: #38dcff;
  --accent-primary-glow: rgba(0, 210, 255, 0.25);
  
  --accent-secondary: #00e599; /* Secure Green indicator */
  --accent-secondary-glow: rgba(0, 229, 153, 0.25);

  /* Status Colors */
  --success: #00e599;          /* Cryptographic match / Passed */
  --warning: #ffb703;          /* Low timer / Hazard warning */
  --warning-glow: rgba(255, 183, 3, 0.25);
  --danger: #ff3366;           /* Firewall breach / Life lost / Error */
  --danger-glow: rgba(255, 51, 102, 0.3);

  /* Shadows & Elevation */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.6);
  --shadow-cyan: 0 0 16px rgba(0, 210, 255, 0.2);
  --shadow-danger: 0 0 16px rgba(255, 51, 102, 0.25);

  /* Layout & Spacing */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Typography
Cyber Escape utilizes modern, widely accessible sans-serif fonts with monospace fallbacks for terminal data readouts.

- **Primary UI Font:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Technical & Terminal Font:** `'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace`

### Typography Hierarchy
| Token / Element | Size | Weight | Line Height | Font Family | Usage |
|---|---|---|---|---|---|
| `Display / H1` | 2.25rem (36px) | 700 (Bold) | 1.2 | UI Font | Main menu title, Victory header |
| `Header / H2` | 1.5rem (24px) | 600 (SemiBold) | 1.3 | UI Font | Level titles, Modal headings |
| `Subheader / H3` | 1.125rem (18px) | 600 (SemiBold) | 1.4 | UI Font | Section subtitles, Card headers |
| `Body Regular` | 0.9375rem (15px) | 400 (Regular) | 1.5 | UI Font | Level descriptions, Instructions |
| `Body Small` | 0.8125rem (13px) | 400 (Regular) | 1.4 | UI Font | Sub-hints, Metadata timestamps |
| `Terminal / Code`| 0.875rem (14px) | 500 (Medium) | 1.6 | Monospace | Clues, password inputs, logs, coordinates |

---

## 4. Spacing System
Consistent 8-point base grid:
- `--space-xs`: 4px
- `--space-sm`: 8px
- `--space-md`: 16px
- `--space-lg`: 24px
- `--space-xl`: 32px
- `--space-2xl`: 48px

---

## 5. UI Components

### 5.1 Buttons
* **Primary Button (`.btn-primary`):**
  * Background: `var(--accent-primary)`
  * Text: `var(--text-inverse)` (bold, high contrast)
  * Border: `1px solid var(--accent-primary)`
  * Hover: background `var(--accent-primary-hover)`, box-shadow `var(--shadow-cyan)`, transform `translateY(-1px)`
* **Secondary / Ghost Button (`.btn-secondary`):**
  * Background: `var(--surface)`
  * Text: `var(--text-primary)`
  * Border: `1px solid var(--surface-border)`
  * Hover: background `var(--surface-hover)`, border-color `var(--accent-primary)`
* **Danger Button (`.btn-danger`):**
  * Background: transparent
  * Text: `var(--danger)`
  * Border: `1px solid var(--danger)`
  * Hover: background `var(--danger)`, text: `#fff`, box-shadow `var(--shadow-danger)`

### 5.2 Cards & Panels
* Background: `var(--surface)`
* Border: `1px solid var(--surface-border)`
* Radius: `var(--radius-md)`
* Padding: `var(--space-lg)`
* Subtle technical corner brackets (via pseudo-elements `::before` / `::after`) for an authentic terminal mainframe containment look.

### 5.3 Modals & Overlays
* Backdrop: `rgba(11, 15, 20, 0.85)` with `backdrop-filter: blur(6px)`.
* Modal Container: Centered, max-width 540px, surface background, `var(--shadow-lg)`, top accent border (`3px solid var(--accent-primary)`).
* Keyboard closeable via `Escape` key.

### 5.4 Form Inputs
* Background: `var(--bg-secondary)`
* Border: `1px solid var(--surface-border)`
* Text: `var(--text-primary)`, monospace styling where appropriate.
* Focus: `outline: none; border-color: var(--accent-primary); box-shadow: 0 0 0 3px var(--accent-primary-glow);`
* Error state: `border-color: var(--danger); box-shadow: 0 0 0 3px var(--danger-glow);`

### 5.5 Progress Bars
* Track: Height 8px, background `var(--surface-border)`, radius `var(--radius-full)`.
* Fill: Gradient from `var(--accent-primary)` to `var(--accent-secondary)`.
* Transitions: Smooth width transition `300ms ease-out`.

---

## 6. Heads-Up Display (HUD)
The HUD persists at the top of the gameplay viewport during active levels:
```
+-------------------------------------------------------------------------------+
| CYBER ESCAPE // LVL 02: DIGITAL MAZE      [P] PAUSE     ♥ ♥ ♥   SCORE: 01450  |
| TIME: 00:48  [===============>                      ]       USER: CYPHER_01   |
+-------------------------------------------------------------------------------+
```
* **Level Badge:** Compact pill displaying `LVL X / 5` in monospace font.
* **Timer Counter:** Monospace digital clock `MM:SS`. Transitions to amber at 20s, red pulse at 10s.
* **Lives Display:** 3 security node / shield icons (`var(--accent-secondary)` when active, `var(--surface-border)` when depleted).
* **Score Indicator:** Right-aligned padded integer (`00000`) in electric cyan.
* **Pause Trigger:** Accessible button with tooltip `[P]`.

---

## 7. Status Indicators & Notifications
* **Success Toast:** Slides down from top-center, green border, icon `[✔]`, automatically fades after 2.5s.
* **Warning Toast:** Amber border, icon `[!]`, for time warnings or decoy clicks.
* **Danger Alert:** Red flash overlay on entire canvas/viewport upon collision or wrong guess (duration: 200ms).

---

## 8. Icons & Visual Motifs
* Lightweight SVG icons only (no heavy icon font libraries like FontAwesome).
* Key icons:
  * Lock / Unlock (Level state)
  * Shield (Lives / Integrity)
  * Clock (Timer)
  * Terminal prompt `>`
  * Key / Decryption chip (Level 3 objective)
  * Firewall wave (Level 4 hazard)

---

## 9. Background & Canvas Treatment
* Subtle dark grid background:
  ```css
  background-color: var(--bg-primary);
  background-image: 
    linear-gradient(to right, rgba(36, 52, 71, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(36, 52, 71, 0.15) 1px, transparent 1px);
  background-size: 32px 32px;
  ```
* Vignette: Radial gradient darkening corners to focus eye on the active puzzle area.
* Optional scanline overlay: Ultra-low opacity (0.03) horizontal repeating lines for retro-futuristic atmosphere without hurting legibility.

---

## 10. Animation Principles
* **Functional Transitions:** Durations strictly between 150ms and 250ms.
* **No Motion Sickness:** Strictly avoid rapid screen-shakes or spinning cameras.
* **Accessibility (`prefers-reduced-motion`):** Disable scanlines, pulses, and transform animations when reduced motion is requested by the OS.

---

## 11. Responsive Layout Strategy
* **Desktop (1024px+):** Centered game canvas (800×500px aspect ratio), HUD spanning top, full keyboard controls.
* **Tablet (641px - 1023px):** Fluid width canvas scaling with `max-width: 100%`, touch-friendly button hitboxes (minimum 44×44px).
* **Mobile (320px - 640px):** HUD switches to a compact 2-tier stacked bar. On-screen virtual D-pad buttons render automatically beneath the maze/dodge canvas for touch inputs.

---

## 12. Accessibility Standards
* **WCAG 2.1 AA Compliance:** Minimum text contrast 4.5:1 against background colors.
* **Keyboard Navigation:** Explicit `:focus-visible` styling for all interactive elements.
* **Screen Reader Announcers:** Invisible `aria-live="polite"` region for timer warnings and game status changes.
* **Color Blindness Safe:** Every color status is paired with an icon and text label (e.g., Red ✖ Failed, Green ✔ Authorized).

---

## 13. Virtual System Atmosphere & Visual Sophistication
To ensure the game presents a high-production "virtual operating environment" rather than a simple web page, the interface incorporates structured, layered visual systems:
1. **Layered Cyber Depth:**
   * Layer 0 (Base): Deep charcoal background with subtle 32px digital grid and vignette edge.
   * Layer 1 (System Environment): Contextual animated SVG status node diagrams, subtle scanline overlay, and animated diagnostic pulse lines.
   * Layer 2 (Active Terminal Canvas / Viewport): Primary puzzle interaction container with technical corner containment brackets and subtle glowing telemetry metrics.
   * Layer 3 (Heads-Up Display & Status Rail): Persistent security status indicator, active threat level monitor, real-time cryptographic integrity gauges, and session timer.
   * Layer 4 (Security Alerts & Modals): High-priority override dialogs with `backdrop-filter: blur(8px)` and electric cyan/emerald perimeter strokes.
2. **Contextual Environmental Progression:**
   * **Level 1 (Firewall Terminal):** Subdued dark blue telemetry, command-line data stream logs, monospace authentication readouts.
   * **Level 2 (Corrupted Memory Labyrinth):** Fragmented data packet nodes, pulsating digital grid conduits, and animated exit gateway beacons.
   * **Level 3 (Cryptographic Dump Analyzer):** Interactive hexadecimal matrix chips, detailed card inspector panel with verification checksum badges.
   * **Level 4 (Active Packet Inspection Corridor):** High-tension red hazard lasers, sweeping perimeter filters, dynamic danger pulse overlays.
   * **Level 5 (Root Kernel Overlord):** Multi-tiered control console, frequency waveform sliders, calibration gauges, and full-terminal escape reboot sequence.
3. **Clutter-Free Visual Hierarchy:**
   * High visual complexity is achieved through crisp typography, clean micro-borders, and tactile reactive states—never through arbitrary screen clutter, random glowing stickers, or unreadable tiny text.
   * Key interactive elements remain unmistakable: high contrast electric cyan (`--accent-primary`), green indicators (`--accent-secondary`), and warning ambers (`--warning`).

---

## 14. Performance & Rendering Guardrails
1. **CSS Hardware Acceleration:** Use `transform: translate3d()` and `opacity` for UI transitions to keep animation on the compositor thread.
2. **Canvas Scoped Only Where Essential:** Canvas 2D rendering is utilized strictly for real-time physics and obstacle movement (Levels 2 & 4). Levels 1, 3, and 5 use clean, semantic DOM layouts to maintain high rendering efficiency and accessibility.
3. **Strict Animation Cleanup:** All `requestAnimationFrame` loops, dynamic intervals, and pulse transitions must be cleanly halted during pause, level unmount, or game-over states to eliminate CPU/GPU drain and memory leaks.
