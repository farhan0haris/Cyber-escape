# Data Models & Storage Specification (DATA_MODEL.md)
## Cyber Escape — Schemas, LocalStorage & Validation Rules

---

### Document Overview
This document specifies all in-memory data structures, persistence schemas, `localStorage` key namespacing, validation rules, and error recovery policies for **Cyber Escape**.

---

## 1. LocalStorage Namespace & Keys

All persistent storage keys used by Cyber Escape are strictly scoped under the `cyberEscape.` namespace:

| LocalStorage Key | Data Type | Description |
|---|---|---|
| `cyberEscape.player` | `string` | Stores the last entered username for convenient auto-fill. |
| `cyberEscape.leaderboard` | `Array<LeaderboardEntry>` | Top 10 historical completion entries. |
| `cyberEscape.settings` | `SettingsObject` | Audio volume, mute toggle, and accessibility preferences. |
| `cyberEscape.saveState` | `GameStateObject` | Active session snapshot (used for pause/resume resilience). |

---

## 2. In-Memory Data Models

### 2.1 GameState Model
The central state object representing an active playthrough session.

```typescript
interface GameState {
  sessionId: string;            // UUID v4 or timestamp string
  playerName: string;           // Validated player name (2-16 chars)
  currentLevel: number;         // 1 | 2 | 3 | 4 | 5
  score: number;                // Non-negative integer (e.g., 4250)
  lives: number;                // Integer: 0 to 3
  levelTimeRemaining: number;   // Countdown seconds remaining in current level
  totalTimeElapsed: number;     // Total seconds spent across all played levels
  completedLevels: number[];    // Array of completed level IDs, e.g., [1, 2]
  status: GameStatus;           // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY'
  isMuted: boolean;             // Boolean sound toggle
  startedAt: number;            // Unix timestamp (epoch ms)
  updatedAt: number;            // Unix timestamp (epoch ms)
}

type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';
```

**Default Initial State:**
```javascript
const defaultGameState = {
  sessionId: '',
  playerName: '',
  currentLevel: 1,
  score: 0,
  lives: 3,
  levelTimeRemaining: 75,
  totalTimeElapsed: 0,
  completedLevels: [],
  status: 'MENU',
  isMuted: false,
  startedAt: 0,
  updatedAt: 0
};
```

---

### 2.2 Player Model
Represents player profile information:

```typescript
interface PlayerProfile {
  name: string;             // 2-20 characters (letters, numbers, spaces, _, -)
  gamesPlayed: number;      // Total games initiated
  victories: number;        // Total games successfully completed
  highestScore: number;     // Personal best score
  lastActive: string;       // ISO 8601 date string
}
```

---

### 2.3 Leaderboard Entry Model
Represents a completed game run saved to the local leaderboard.

```typescript
interface LeaderboardEntry {
  id: string;               // Unique entry ID (e.g., "entry_1678901234_xyz")
  playerName: string;       // Sanitized player username (2-20 chars)
  score: number;            // Final accumulated score (clamped integer >= 0)
  totalTime: number;        // Total seconds taken to complete the game
  remainingLives: number;   // Lives remaining upon victory (1, 2, or 3)
  date: string;             // Formatted date string (e.g., "2026-09-09 21:50")
  timestamp: number;        // Unix epoch timestamp (for sorting ties)
}
```

**Sorting Policy:**
1. Primary: `score` **Descending** (highest score first).
2. Secondary: `totalTime` **Ascending** (faster escape ranks higher on tie).
3. Tertiary: `timestamp` **Ascending** (earlier record achieved ranks higher).
4. Capacity: Strictly clamped to maximum **10 entries**.

---

### 2.4 Level Result Model
Returned by an individual level module upon level completion or failure:

```typescript
interface LevelResult {
  levelId: number;           // 1 to 5
  success: boolean;          // true if completed, false if failed/timed out
  timeRemaining: number;     // Seconds left on the clock
  timeSpent: number;         // Seconds taken
  baseScore: number;         // Level base score awarded
  timeBonus: number;         // Time bonus added
  penalty: number;           // Mistakes/hazard penalties deducted
  finalLevelScore: number;   // max(0, baseScore + timeBonus - penalty)
  livesLost: number;         // Lives lost during this attempt
}
```

---

### 2.5 Settings Model
Represents user preferences:

```typescript
interface Settings {
  soundEnabled: boolean;     // Default: true
  masterVolume: number;      // 0.0 to 1.0 (Default: 0.7)
  scanlinesEnabled: boolean; // Default: true (visual effect toggle)
  highContrast: boolean;     // Default: false
}
```

---

## 3. Data Validation Rules

### 3.1 Player Name Validation
* **Pattern:** `/^[a-zA-Z0-9 _-]{2,20}$/`
* **Rules:**
  * Minimum length: 2 characters (after trimming leading/trailing whitespace).
  * Maximum length: 20 characters.
  * Allowed characters: English letters (A-Z, a-z), numbers (0-9), single spaces between words, underscores (`_`), and hyphens (`-`).
  * No HTML tags, angle brackets (`<`, `>`), quotes, or script injection characters.
  * HTML sanitization: Escaped via `element.textContent` when rendering into the DOM to prevent XSS.

### 3.2 Leaderboard Entry Validation
Before saving any entry into `cyberEscape.leaderboard`:
1. `score` must be a non-negative finite integer (`Number.isInteger(score) && score >= 0`).
2. `totalTime` must be a positive number (`typeof totalTime === 'number' && totalTime > 0`).
3. `playerName` must be sanitized string between 2 and 20 characters.
4. `remainingLives` must be an integer between 1 and 3.
5. If payload fails validation, discard the entry and log a defensive warning.

---

## 4. Storage Error Handling & Corrupt Data Policy

### 4.1 Storage Availability Check
Before attempting storage operations, the application tests availability:
```javascript
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
```
If unavailable (e.g., Safari Private Browsing restrictions), `StorageManager` falls back to an in-memory `Map` with no game crash.

### 4.2 Malformed Data Handling
When reading any JSON key:
```javascript
function safeGet(key, fallbackValue) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallbackValue;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Storage] Corrupt data detected at ${key}. Resetting to fallback.`, err);
    safeSet(key, fallbackValue);
    return fallbackValue;
  }
}
```
* Under no circumstances will a corrupt `localStorage` item throw an unhandled exception or prevent the game from booting.
