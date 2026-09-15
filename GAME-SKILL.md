---
name: game-ui-ux
version: 1.0.0
description: "Design, audit, repair, and polish game interfaces with strong visual hierarchy, spatial rhythm, interaction clarity, responsive composition, and gameplay-first UX. Use for browser games, interactive dashboards, game menus, HUDs, levels, modals, overlays, and game-flow screens."
---

# Game UI/UX

## Purpose

Use this skill when designing, auditing, repairing, or polishing a game interface.

The goal is not to make every screen dense, minimal, or perfectly viewport-fitted. The goal is to make every screen easy to understand, visually balanced, responsive, and pleasant to use while preserving gameplay clarity.

Primary principle:

**Clarity + hierarchy + spacing + feedback > information density.**

A good game UI should feel designed, not squeezed.

---

## Core Rules

### 1. Gameplay comes first

Never allow decorative UI, effects, panels, telemetry, or background animation to compete with gameplay-critical information.

For gameplay screens, prioritize:

1. Player
2. Objective
3. Interactive gameplay area
4. Danger / success states
5. Controls
6. Supporting information
7. Decoration

When there is a conflict, remove or reduce decoration before reducing gameplay readability.

### 2. Do not use compression as a layout strategy

Never solve layout problems by blindly reducing:

- font size
- button size
- card padding
- line height
- gaps
- canvas size
- touch targets

Instead use:

- grid/flex composition
- grouping
- responsive reflow
- better proportions
- content prioritization
- internal scrolling where appropriate
- progressive disclosure
- tabs/drawers/accordions on small screens when suitable

### 3. Scrolling is acceptable

Do not impose a blanket "no scrolling" rule.

Prefer no document scrolling for focused gameplay arenas when practical, but allow controlled scrolling for information-heavy interfaces.

Acceptable examples:

- long evidence lists
- lore/about pages
- instructions
- leaderboards
- inventory
- forensic datasets
- modal bodies on small screens

Unacceptable examples:

- accidental horizontal overflow
- clipped controls
- content hidden with `overflow: hidden`
- buttons pushed outside the reachable area
- scroll caused by stray margins or incorrect viewport sizing

### 4. Every screen needs a visual hierarchy

Each screen must have one primary purpose.

Define:

- primary action
- secondary action
- supporting information
- decorative information

The primary action should be visually obvious without being oversized.

### 5. Group by meaning

Related elements should be visually grouped through:

- proximity
- shared alignment
- subtle containers
- dividers
- typography
- consistent spacing

Unrelated elements should have visible separation.

Do not put a border around every component.

### 6. Use whitespace intentionally

Whitespace is part of the design.

Use three levels of spacing:

- large: between major sections
- medium: between related components
- small: within components

Never use uniform spacing everywhere.

---

## Page Composition

Before styling individual elements, sketch the composition conceptually.

Examples:

### Game menu

```text
SYSTEM STATUS

GAME TITLE
MISSION CONTEXT

FEATURE / TERMINAL / PREVIEW

PRIMARY ACTION
SECONDARY ACTIONS
```

### Investigation screen

```text
OBJECTIVE / STATUS

PRIMARY WORKSPACE      SUPPORTING WORKSPACE

                         NOTES / HINTS

FINAL ACTION / SUBMIT
```

### Action game

```text
HUD

        DOMINANT GAMEPLAY AREA

CONTROLS / SMALL STATUS AREA
```

### Multi-stage puzzle

```text
STAGE INDICATOR

        CURRENT TASK

FEEDBACK / STATE

PRIMARY ACTION
```

These are composition patterns, not fixed templates. Adapt them to the game's content.

---

## Visual Hierarchy

Use hierarchy deliberately through:

- scale
- weight
- contrast
- position
- spacing
- color
- motion

Do not make every label bright or every panel glow.

A useful hierarchy is:

**Primary:** high contrast / strongest visual weight

**Secondary:** clear but quieter

**Tertiary:** muted technical information

**Decorative:** lowest contrast and visual priority

---

## Game Menus

Menus should feel like game interfaces, not generic websites.

### Main menu

The player should understand within seconds:

- what the game is
- what state the game is in
- how to start
- what optional actions exist

Keep one dominant call-to-action.

### Secondary actions

Actions such as:

- How To Play
- Settings
- Leaderboard
- About
- Quit

should not visually compete with the main action.

### Developer/debug controls

Keep them isolated from normal player UI.

They must never confuse normal users or affect legitimate scoring/progression.

---

## HUD Design

A HUD should communicate only information that matters during play.

Typical information:

- level/sector
- objective
- timer
- score
- health/lives
- pause

Keep related telemetry together.

Avoid creating multiple competing "status bars" unless they have distinct gameplay meaning.

Use compact grouping with adequate gaps.

Never let the HUD cover gameplay-critical areas.

---

## Cards and Panels

A card should earn its existence.

Use a card when it helps one of these:

- grouping
- comparison
- selection
- focus
- state
- interaction

Avoid decorative cards with no information or interaction value.

### Card spacing

Cards need:

- internal padding
- separation from neighboring cards
- visible hierarchy
- clear selected/hover/focus states

Never allow cards to visually merge unless that is an intentional list/table treatment.

### Nested containers

Avoid excessive nesting:

```text
panel
  → panel
     → card
        → card
```

Prefer:

```text
workspace
  → section
  → card/list
```

Use whitespace and subtle separators before adding another border.

---

## Typography

Typography is structural.

Define a small hierarchy:

- display/title
- section heading
- body
- label/meta
- technical/monospace

Do not use the smallest possible font to make everything fit.

Prioritize:

- readability
- line-height
- contrast
- consistent capitalization
- sensible letter spacing
- controlled line length

Use monospace selectively for terminal/code/telemetry content rather than the entire interface.

---

## Buttons and Controls

Every important control should have deliberate states:

- default
- hover
- active/pressed
- focus-visible
- disabled
- success where relevant
- danger where relevant

Do not rely on color alone for state.

Controls should communicate what will happen.

Prefer action verbs:

- START RUN
- INSPECT
- VERIFY
- STABILIZE
- EXECUTE
- RETRY
- PAUSE
- QUIT MISSION

Avoid vague labels such as "Continue" when a specific action is possible.

---

## Forms and Inputs

Inputs should have:

- visible label
- clear purpose
- sufficient touch size
- usable focus state
- readable text
- validation feedback

Do not hide validation errors or make them depend solely on red coloring.

Avoid browser-native alerts for normal game UI when a project modal/notification system exists.

---

## Modal/Dialog UX

Use accessible dialog patterns.

A dialog should:

- clearly state its purpose
- have a visible primary action
- have a visible close/cancel path when appropriate
- trap focus when required
- return focus appropriately
- prevent background interaction
- fit the available screen without clipping

Long modal content may scroll internally.

Do not make every dialog fullscreen.

Destructive actions should require clear confirmation.

Example:

```text
ABORT CURRENT MISSION?
Your current run will be lost.

[CANCEL] [QUIT MISSION]
```

---

## Game-Specific Level UX

Every level should have a unique interaction model while sharing one global visual language.

For each level define:

1. What am I doing?
2. What is the first action?
3. What information matters?
4. What can I safely ignore?
5. How do I know I am progressing?
6. How do I know I failed?
7. How do I know I succeeded?

The player should not need to reverse-engineer the UI before playing.

### Level introduction

Use a short mission briefing:

```text
MISSION
OBJECTIVE
CONTROLS
SUCCESS CONDITION
```

Keep it short enough to scan.

### Feedback

Every meaningful interaction should produce a visible state change, sound, animation, or combination of these.

Good feedback examples:

- selected evidence becomes clearly selected
- danger telegraphs before activation
- successful verification changes state
- checkpoints confirm activation
- final actions produce clear system feedback

---

## Puzzle / Investigation UI

For investigative games, create an explicit workflow.

A useful pattern is:

```text
OBSERVE
→ INSPECT
→ CORRELATE
→ DEDUCE
→ VERIFY
```

Make the current step visually clear.

Do not expose hidden solution variables in the DOM or debug-facing UI.

Avoid turning investigation interfaces into quiz forms unless the game is intentionally a quiz.

---

## Action / Canvas Game UI

For real-time games:

- maximize useful gameplay area
- keep HUD unobtrusive
- give controls dedicated space
- make hazards legible before they become dangerous
- preserve coordinate systems while scaling canvases

If the game depends on timing, hazard telegraphing must remain visible.

Use color plus shape/position/motion where possible so danger is not color-only.

---

## Responsive Design

Do not treat mobile as a scaled-down desktop.

Use responsive composition.

### Large desktop

Use more columns and breathing room.

### Laptop

Tighten spacing slightly but preserve hierarchy.

### Tablet

Rebalance columns and allow selected regions to stack.

### Mobile

Prioritize in a logical order and allow scrolling when necessary.

Possible pattern:

```text
OBJECTIVE
↓
PRIMARY INTERACTION
↓
SUPPORTING INFO
↓
SECONDARY ACTIONS
```

Avoid dozens of breakpoints.

Prefer a small number of meaningful layout states.

---

## Viewport and Scrolling

Use modern viewport units such as `dvh` where appropriate, but do not make viewport fitting an obsession.

Check for:

- browser chrome effects on mobile
- safe-area insets
- accidental horizontal overflow
- fixed-position elements overlapping content
- modal clipping
- canvas aspect-ratio problems

Do not use `overflow: hidden` globally as a shortcut.

---

## Canvas and Game Areas

When a game uses Canvas:

- preserve logical game coordinates
- scale visually with CSS/device-pixel-ratio handling
- keep the interaction area aligned with the displayed canvas
- avoid blurry rendering where practical
- avoid changing gameplay physics just to fit the screen

The canvas should occupy the dominant visual area for action-heavy levels.

---

## Animation and Motion

Animation should communicate one of:

- state
- progress
- interaction
- danger
- transition
- reward

Avoid animation added solely because empty space exists.

Never use motion to compensate for poor hierarchy.

Support:

`prefers-reduced-motion: reduce`

Reduce nonessential animation while retaining gameplay-critical feedback.

---

## Audio UX

Use audio as confirmation, not noise.

Useful categories:

- navigation
- selection
- warning
- danger
- success
- failure
- checkpoint
- transition
- completion

Avoid stacking or leaking Web Audio nodes.

Respect browser autoplay restrictions and user mute preferences.

---

## Accessibility

Apply accessible interaction patterns from the project’s web guidance.

Minimum expectations:

- semantic controls
- keyboard access
- visible focus
- readable contrast
- labels for inputs
- modal focus management
- Escape behavior where appropriate
- touch targets with sufficient size
- no critical state communicated only through color
- reduced-motion support

Do not add ARIA unnecessarily when native semantics are sufficient.

---

## Background Effects

Background effects must remain subordinate to gameplay and UI.

Examples:

- CRT
- scanlines
- particles
- data streams
- glow
- noise
- animated grids

Use them to establish atmosphere, not to compete with content.

When a background effect hurts readability:

1. reduce opacity
2. reduce motion
3. reduce density
4. add a readability overlay
5. disable it during critical gameplay if necessary

Do not redesign gameplay merely to showcase an effect.

---

## Hidden / Secret UI

A game may contain one optional hidden interaction.

Good secrets are:

- discoverable through world context
- optional
- harmless
- non-cheating
- non-score-affecting unless deliberately designed otherwise
- visually rewarding
- temporary or compact

Do not add obvious permanent buttons labeled "SECRET" or "EASTER EGG".

A secret should not block normal progression.

---

## Design Review Method

When a screen looks wrong, review it in this order:

### Pass 1 — Structure

Ask:

- What is the screen's main purpose?
- What is the primary action?
- Is the content grouped logically?

### Pass 2 — Spacing

Ask:

- Do major sections breathe?
- Do cards touch?
- Are internal paddings adequate?
- Is there awkward dead space?

### Pass 3 — Hierarchy

Ask:

- What do I notice first?
- What should I notice first?
- Is anything competing with the main task?

### Pass 4 — Readability

Check:

- font size
- line height
- contrast
- wrapping
- label clarity

### Pass 5 — Interaction

Check:

- states
- feedback
- button placement
- keyboard/touch behavior

### Pass 6 — Responsive behavior

Check representative sizes rather than every possible device.

### Pass 7 — Polish

Only after structure is correct, add:

- subtle glow
- animation
- CRT/background treatment
- micro-interactions
- decorative details

---

## Repair Strategy

When the UI is broken, do NOT stack endless overrides on top of broken CSS.

Instead:

1. Identify the recent change that caused the regression.
2. Isolate the affected component/screen.
3. Restore the nearest known-good structure if necessary.
4. Remove contradictory styles.
5. Recompose the affected region.
6. Add responsive rules.
7. Verify in the real browser.

A clean rollback of a bad layout is better than a tower of CSS patches.

---

## Preserve Functionality During UI Work

UI/UX changes must not accidentally alter:

- timers
- score calculation
- lives
- level completion
- retry semantics
- new-run semantics
- scenario generation
- random seeds
- developer access
- leaderboard rules
- audio lifecycle
- level cleanup

If a shared stylesheet or component is changed, verify all affected screens.

---

## Testing Checklist

### Visual

- no overlap
- no clipping
- no accidental horizontal scroll
- sufficient spacing
- readable typography
- clear hierarchy
- consistent alignment
- consistent component styling

### Interaction

- every primary action works
- hover works
- keyboard focus works
- mobile tap works
- disabled states work
- modal close/cancel works

### Gameplay

- objective is clear
- controls are clear
- progression is understandable
- failure is understandable
- success is understandable
- effects do not obscure play

### Responsive

Check at representative sizes such as:

- 1366x768
- 1440x900
- 1920x1080
- 768x1024
- 390x844

Use the project's supported device targets as the final authority.

### Console/performance

Check:

- no JavaScript errors
- no missing imports
- no duplicate animation loops
- no duplicate event listeners
- no leaking timers
- no leaking observers
- no leaking WebGL resources
- no runaway audio nodes

---

## Acceptance Standard

Do not declare a UI finished because everything technically fits.

Declare it finished when:

- the purpose of the screen is immediately clear
- the primary action is obvious
- information is comfortably readable
- elements have breathing room
- panels do not look stuck together
- controls are easy to use
- gameplay remains dominant where appropriate
- responsive layouts feel intentional
- visual effects support rather than dominate
- the interface feels like one cohesive game

The target is:

**CLEAN + SPACIOUS + CLEAR + RESPONSIVE + GAMEPLAY-FIRST + POLISHED**

not:

**MAXIMUM INFORMATION PER PIXEL**.

---

## Recommended Workflow for AI Coding Agents

When asked to polish a game UI, follow this order:

1. Inspect the current implementation.
2. Inspect recent changes and identify regressions.
3. Read relevant UI/accessibility skills.
4. Pick ONE screen or ONE level.
5. Fix structure before decoration.
6. Verify the browser rendering.
7. Fix responsive behavior.
8. Test interactions.
9. Report exactly what changed.
10. Wait for the next screen/level before making broad changes unless explicitly instructed otherwise.

Never apply a large UI redesign across every level simultaneously when the visual problems are not yet understood.
