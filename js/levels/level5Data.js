/**
 * Level 5 Authored Scenarios & Profiles
 * Sector 05 — Root Kernel Override
 * 
 * Provides 5 distinct, deterministic authored scenario configurations.
 * Target numbers (targetFreq, targetBuffer) are internal parameters only
 * and must NEVER be exposed directly in player-facing DOM.
 */

export const KERNEL_NODES = Object.freeze([
  { id: 'alpha', label: 'ALPHA', role: 'KERNEL', code: '0x01', freq: 440 },
  { id: 'beta', label: 'BETA', role: 'BUFFER', code: '0x02', freq: 554.37 },
  { id: 'gamma', label: 'GAMMA', role: 'CIPHER', code: '0x03', freq: 659.25 },
  { id: 'delta', label: 'DELTA', role: 'ROOT', code: '0x04', freq: 880 }
]);

export const LEVEL5_SCENARIOS = Object.freeze([
  {
    id: 'sc_01_alpha',
    name: 'Kernel Alpha Breach',
    description: 'Bypass primary kernel access register and balance core carrier frequency.',
    // Stage 1: 4-step sequence
    sequence: ['alpha', 'gamma', 'beta', 'delta'],
    // Stage 2: Internal targets (not displayed in UI)
    targetFreq: 74, // MHz (range 20 - 150)
    targetBuffer: 128, // KB (range 32 - 512)
    freqTolerance: 4, // +/- 4 MHz tolerance
    bufferTolerance: 16, // +/- 16 KB tolerance
    // Stage 3: Oscillation gauge
    sweepSpeed: 1.0, // Base sweep speed multiplier
    sweetSpotCenter: 50, // % position (0-100)
    sweetSpotWidth: 16 // +/- 8% window
  },
  {
    id: 'sc_02_beta',
    name: 'Subsystem Flux Matrix',
    description: 'Stabilize high-frequency carrier surge through secondary harmonic buffer.',
    // Stage 1: 5-step sequence
    sequence: ['beta', 'alpha', 'delta', 'gamma', 'beta'],
    // Stage 2: Internal targets
    targetFreq: 118,
    targetBuffer: 256,
    freqTolerance: 4,
    bufferTolerance: 24,
    // Stage 3: Oscillation gauge
    sweepSpeed: 1.15,
    sweetSpotCenter: 52,
    sweetSpotWidth: 14 // +/- 7% window
  },
  {
    id: 'sc_03_gamma',
    name: 'Resonance Core Cascade',
    description: 'Harmonize deep memory registers against severe kernel buffer drift.',
    // Stage 1: 5-step sequence
    sequence: ['gamma', 'delta', 'alpha', 'beta', 'gamma'],
    // Stage 2: Internal targets
    targetFreq: 88,
    targetBuffer: 384,
    freqTolerance: 4,
    bufferTolerance: 32,
    // Stage 3: Oscillation gauge
    sweepSpeed: 1.2,
    sweetSpotCenter: 48,
    sweetSpotWidth: 14 // +/- 7% window
  },
  {
    id: 'sc_04_delta',
    name: 'Cascade Overdrive Channel',
    description: 'Override multi-layer memory registers under rapid oscillation decay.',
    // Stage 1: 5-step sequence
    sequence: ['delta', 'beta', 'gamma', 'alpha', 'delta'],
    // Stage 2: Internal targets
    targetFreq: 136,
    targetBuffer: 96,
    freqTolerance: 3,
    bufferTolerance: 16,
    // Stage 3: Oscillation gauge
    sweepSpeed: 1.3,
    sweetSpotCenter: 54,
    sweetSpotWidth: 12 // +/- 6% window
  },
  {
    id: 'sc_05_omega',
    name: 'Master Zero Kernel',
    description: 'Final master override sequence on the deepest root containment boundary.',
    // Stage 1: 5-step sequence
    sequence: ['alpha', 'delta', 'beta', 'gamma', 'alpha'],
    // Stage 2: Internal targets
    targetFreq: 104,
    targetBuffer: 320,
    freqTolerance: 3,
    bufferTolerance: 20,
    // Stage 3: Oscillation gauge
    sweepSpeed: 1.4,
    sweetSpotCenter: 50,
    sweetSpotWidth: 12 // +/- 6% window
  }
]);

// In-memory recent scenario tracker to prevent immediate repetition across runs
let lastSelectedScenarioIndex = -1;

/**
 * Select a Level 5 scenario with deduplication and developer override support
 * @param {Object} [options]
 * @param {number} [options.scenarioIndex] 0-4
 * @param {string} [options.scenarioId]
 * @param {Object} [options.scenario] Explicit preserved scenario object (for retry)
 * @returns {Object} Deep clone of selected scenario
 */
export function getLevel5Scenario(options = {}) {
  // 1. Retry preservation: if explicit scenario is provided, return its clone
  if (options.scenario && options.scenario.id) {
    const matched = LEVEL5_SCENARIOS.find(s => s.id === options.scenario.id);
    if (matched) return JSON.parse(JSON.stringify(matched));
    return JSON.parse(JSON.stringify(options.scenario));
  }

  // 2. Explicit developer index override (0-indexed or 1-indexed)
  if (typeof options.scenarioIndex === 'number' && !isNaN(options.scenarioIndex)) {
    const idx = Math.max(0, Math.min(LEVEL5_SCENARIOS.length - 1, options.scenarioIndex));
    lastSelectedScenarioIndex = idx;
    return JSON.parse(JSON.stringify(LEVEL5_SCENARIOS[idx]));
  }

  // 3. Explicit developer scenario ID override
  if (typeof options.scenarioId === 'string' && options.scenarioId.trim()) {
    const matched = LEVEL5_SCENARIOS.find(s => s.id === options.scenarioId.trim());
    if (matched) {
      lastSelectedScenarioIndex = LEVEL5_SCENARIOS.indexOf(matched);
      return JSON.parse(JSON.stringify(matched));
    }
  }

  // 4. Random selection with deduplication
  let candidateIndices = LEVEL5_SCENARIOS.map((_, i) => i);
  if (candidateIndices.length > 1 && lastSelectedScenarioIndex >= 0) {
    candidateIndices = candidateIndices.filter(i => i !== lastSelectedScenarioIndex);
  }

  const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  lastSelectedScenarioIndex = chosenIndex;
  return JSON.parse(JSON.stringify(LEVEL5_SCENARIOS[chosenIndex]));
}

/**
 * Reset recent scenario history (used for new runs/testing)
 */
export function resetLevel5History() {
  lastSelectedScenarioIndex = -1;
}
