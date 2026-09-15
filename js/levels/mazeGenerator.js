/**
 * Level 2: Maze Generator & Procedural Variation Engine
 * 
 * Implements Hand-Authored Base Structure + Controlled Procedural Variation.
 * Guarantees determinism, solvability, hazard fairness, and meaningful differences across runs.
 */

import {
  LEVEL2_VARIANTS,
  GRID_COLS,
  GRID_ROWS,
  validateMazeVariant,
  findPathBFS
} from './level2Data.js';

/**
 * Deterministic 32-bit PRNG (Mulberry32)
 * @param {number} seed - integer seed
 * @returns {() => number} deterministic pseudo-random float in [0, 1)
 */
export function createPRNG(seed) {
  let s = (Math.imul(seed, 1) + 0x6D2B79F5) | 0;
  return function next() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Normalize an input seed (string, hex, or number) into a deterministic 32-bit integer
 * @param {string|number} rawSeed
 * @returns {number}
 */
export function normalizeSeed(rawSeed) {
  if (typeof rawSeed === 'number' && !isNaN(rawSeed)) {
    return Math.floor(rawSeed) >>> 0;
  }
  if (typeof rawSeed === 'string') {
    const trimmed = rawSeed.trim();
    // Check if it's hex like '0xA7F2' or 'A7F2'
    if (/^(0x)?[0-9a-fA-F]{1,8}$/.test(trimmed)) {
      const parsed = parseInt(trimmed.startsWith('0x') ? trimmed : '0x' + trimmed, 16);
      if (!isNaN(parsed)) return parsed >>> 0;
    }
    // Hash arbitrary string to 32-bit integer
    let hash = 0;
    for (let i = 0; i < trimmed.length; i++) {
      hash = ((hash << 5) - hash + trimmed.charCodeAt(i)) | 0;
    }
    return hash >>> 0;
  }
  return (Date.now() ^ (Math.random() * 0x100000000)) >>> 0;
}

/**
 * Format an integer seed into a clean 4-character or 8-character hex string
 * @param {number} seedInt
 * @returns {string} e.g. "A7F2"
 */
export function formatSeedHex(seedInt) {
  return (seedInt >>> 0).toString(16).toUpperCase().padStart(4, '0').slice(-4);
}

/**
 * Generate a fresh random run seed
 * @returns {string} e.g. "A7F2"
 */
export function generateRunSeed() {
  const randVal = Math.floor(Math.random() * 0xFFFF) + 1;
  return randVal.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Hand-Authored Topological Mutation Definitions
 * Each base template has 4-6 designed mutation slots that toggle corridors,
 * create alternate bypasses, or extend dead-ends while maintaining solvability.
 * 
 * Each mutation defines:
 * - id: unique name
 * - tiles: Array of { x, y, state: 0 | 1 }
 * - description: gameplay effect
 */
export const TEMPLATE_MUTATIONS = {
  // 1. CIRCUIT MATRIX (variant_01_alpha)
  variant_01_alpha: [
    {
      id: 'm1_upper_fork',
      description: 'Opens upper bypass corridor at (9, 2) while closing (9, 1)',
      tiles: [{ x: 9, y: 1, state: 1 }, { x: 9, y: 2, state: 0 }]
    },
    {
      id: 'm1_central_conduit',
      description: 'Creates shortcut link at (7, 4) and adds baffle at (7, 3)',
      tiles: [{ x: 7, y: 4, state: 0 }, { x: 7, y: 3, state: 1 }]
    },
    {
      id: 'm1_south_bypass',
      description: 'Opens alternate low-routing path at (5, 12) while closing (5, 11)',
      tiles: [{ x: 5, y: 12, state: 0 }, { x: 5, y: 11, state: 1 }]
    },
    {
      id: 'm1_exit_approach',
      description: 'Redirects exit channel through (15, 12) instead of (15, 13)',
      tiles: [{ x: 15, y: 12, state: 0 }, { x: 15, y: 13, state: 1 }]
    },
    {
      id: 'm1_northeast_loop',
      description: 'Connects upper loop at (14, 2) while walling (14, 3)',
      tiles: [{ x: 14, y: 2, state: 0 }, { x: 14, y: 3, state: 1 }]
    }
  ],

  // 2. PACKET BYPASS (variant_02_beta)
  variant_02_beta: [
    {
      id: 'm2_north_choke',
      description: 'Adds pulse hazard chicane at (5, 2) / (5, 3)',
      tiles: [{ x: 5, y: 2, state: 0 }, { x: 6, y: 3, state: 1 }]
    },
    {
      id: 'm2_interior_crossover',
      description: 'Opens cross-junction between perimeter and interior at (10, 6)',
      tiles: [{ x: 10, y: 6, state: 0 }, { x: 9, y: 5, state: 1 }]
    },
    {
      id: 'm2_south_filter',
      description: 'Opens lower interior bypass at (12, 11) while baffling (11, 10)',
      tiles: [{ x: 12, y: 11, state: 0 }, { x: 11, y: 10, state: 1 }]
    },
    {
      id: 'm2_east_gate',
      description: 'Shifts eastern vertical corridor link from (17, 11) to (17, 9)',
      tiles: [{ x: 17, y: 9, state: 0 }, { x: 17, y: 11, state: 1 }]
    }
  ],

  // 3. LOGIC LABYRINTH (variant_03_gamma)
  variant_03_gamma: [
    {
      id: 'm3_west_corridor',
      description: 'Shifts western vertical access from (3, 2) to (3, 4)',
      tiles: [{ x: 3, y: 4, state: 0 }, { x: 3, y: 2, state: 1 }]
    },
    {
      id: 'm3_central_hub',
      description: 'Opens central hub passage at (10, 5) while closing (10, 7)',
      tiles: [{ x: 10, y: 5, state: 0 }, { x: 10, y: 7, state: 1 }]
    },
    {
      id: 'm3_east_switch',
      description: 'Opens alternate route at (14, 8) while walling (14, 10)',
      tiles: [{ x: 14, y: 8, state: 0 }, { x: 14, y: 10, state: 1 }]
    },
    {
      id: 'm3_south_corridor',
      description: 'Opens southern junction link at (9, 12) while closing (9, 10)',
      tiles: [{ x: 9, y: 12, state: 0 }, { x: 9, y: 10, state: 1 }]
    }
  ],

  // 4. MEMORY REGISTER (variant_04_delta)
  variant_04_delta: [
    {
      id: 'm4_chamber1_flow',
      description: 'Opens upper chamber 1 link at (3, 6) while closing (4, 6)',
      tiles: [{ x: 3, y: 6, state: 0 }, { x: 4, y: 6, state: 1 }]
    },
    {
      id: 'm4_grand_corridor_choke',
      description: 'Adds chicane barrier in grand corridor at (9, 7) with passage at (9, 8)',
      tiles: [{ x: 9, y: 7, state: 1 }, { x: 9, y: 8, state: 0 }]
    },
    {
      id: 'm4_chamber3_link',
      description: 'Connects lower chamber 3 at (11, 8) and baffles (12, 8)',
      tiles: [{ x: 11, y: 8, state: 0 }, { x: 12, y: 8, state: 1 }]
    },
    {
      id: 'm4_chamber4_exit',
      description: 'Opens alternate chamber 4 passage at (15, 13) and baffles (15, 12)',
      tiles: [{ x: 15, y: 13, state: 0 }, { x: 15, y: 12, state: 1 }]
    }
  ],

  // 5. KERNEL CONDUIT (variant_05_epsilon)
  variant_05_epsilon: [
    {
      id: 'm5_switchback1',
      description: 'Reverses switchback 1 turn at (9, 3) / (9, 4)',
      tiles: [{ x: 9, y: 3, state: 1 }, { x: 9, y: 4, state: 0 }]
    },
    {
      id: 'm5_mid_traverse',
      description: 'Opens mid-level traverse link at (13, 6) while closing (13, 7)',
      tiles: [{ x: 13, y: 6, state: 0 }, { x: 13, y: 7, state: 1 }]
    },
    {
      id: 'm5_lower_bypass',
      description: 'Opens lower bypass at (9, 10) while walling (9, 11)',
      tiles: [{ x: 9, y: 10, state: 0 }, { x: 9, y: 11, state: 1 }]
    },
    {
      id: 'm5_approach_gate',
      description: 'Shifts exit approach channel from (16, 12) to (16, 11)',
      tiles: [{ x: 16, y: 11, state: 0 }, { x: 16, y: 12, state: 1 }]
    }
  ]
};

/**
 * Hand-Authored Hazard Mutation Definitions
 * Defines fair alternative hazard locations or patrol routes per template.
 */
export const HAZARD_MUTATIONS = {
  variant_01_alpha: [
    (hazards, roll) => {
      // Alternate stationary node location
      const node = hazards.find(h => h.id === 'h1_stat_01');
      if (node) {
        if (roll > 0.5) {
          node.x = 3;
          node.y = 3;
        } else {
          node.x = 7;
          node.y = 3;
        }
      }
    },
    (hazards, roll) => {
      // Alternate scan packet patrol row or speed
      const scan = hazards.find(h => h.id === 'h1_scan_01');
      if (scan) {
        if (roll > 0.5) {
          scan.startX = 1;
          scan.endX = 7;
          scan.speed = 95;
        } else {
          scan.startX = 2;
          scan.endX = 6;
          scan.speed = 85;
        }
      }
    }
  ],

  variant_02_beta: [
    (hazards, roll) => {
      // Alternate pulse cycle timing
      const p1 = hazards.find(h => h.id === 'h2_pulse_01');
      if (p1) {
        p1.cycleSafe = roll > 0.5 ? 2.0 : 1.6;
        p1.cycleWarn = 0.75;
      }
      const p2 = hazards.find(h => h.id === 'h2_pulse_02');
      if (p2) {
        p2.cycleSafe = roll > 0.5 ? 1.6 : 2.0;
        p2.cycleWarn = 0.8;
      }
    }
  ],

  variant_03_gamma: [
    (hazards, roll) => {
      // Alternate decoy trap position
      const node = hazards.find(h => h.id === 'h3_stat_01');
      if (node) {
        if (roll > 0.5) {
          node.x = 1;
          node.y = 5;
        } else {
          node.x = 1;
          node.y = 3;
        }
      }
    }
  ],

  variant_04_delta: [
    (hazards, roll) => {
      // Alternate scan sweeper range
      const scan = hazards.find(h => h.id === 'h4_scan_01');
      if (scan) {
        if (roll > 0.5) {
          scan.startX = 4;
          scan.endX = 15;
          scan.speed = 100;
        } else {
          scan.startX = 3;
          scan.endX = 16;
          scan.speed = 110;
        }
      }
    }
  ],

  variant_05_epsilon: [
    (hazards, roll) => {
      const p = hazards.find(h => h.id === 'h5_pulse_01');
      if (p) {
        p.cycleSafe = roll > 0.5 ? 1.6 : 1.4;
      }
    }
  ]
};

/**
 * Deep clone grid
 * @param {Array<Array<number>>} grid
 * @returns {Array<Array<number>>}
 */
export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * Deep clone hazards
 * @param {Array<Object>} hazards
 * @returns {Array<Object>}
 */
export function cloneHazards(hazards) {
  return (hazards || []).map(h => ({ ...h }));
}

/**
 * Verify if two variants are meaningfully different
 * Criteria:
 * - At least 2+ structural wall differences OR
 * - Path length difference >= 2 OR
 * - Differing hazard coordinates/patrol
 * 
 * @param {Object} v1
 * @param {Object} v2
 * @returns {boolean} true if meaningfully different
 */
export function hasMeaningfulDifference(v1, v2) {
  if (!v1 || !v2) return true;
  if (v1.id !== v2.id) return true; // Different base template = totally different

  // Check tile differences
  let diffTiles = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (v1.grid[r][c] !== v2.grid[r][c]) {
        diffTiles++;
      }
    }
  }
  if (diffTiles >= 2) return true;

  // Check path length
  const p1 = findPathBFS(v1.grid, v1.spawn, v1.exit).pathLength;
  const p2 = findPathBFS(v2.grid, v2.spawn, v2.exit).pathLength;
  if (Math.abs(p1 - p2) >= 2) return true;

  // Check hazard difference
  const h1 = JSON.stringify(v1.hazards);
  const h2 = JSON.stringify(v2.hazards);
  if (h1 !== h2) return true;

  return false;
}

/**
 * Generate a controlled procedural maze variant from a base template and seed.
 * 
 * Guaranteed Solvability:
 * - Checks dimensions, perimeter, spawn, exit.
 * - Enforces minimum path length (25 steps) and maximum (60 steps).
 * - Checks hazard fairness (safe spawn, non-blocked exit).
 * - Enforces consecutive-run meaningful difference if previousVariant is provided.
 * 
 * @param {Object} baseTemplate
 * @param {string|number} rawSeed
 * @param {Object|null} [previousVariant]
 * @returns {Object} valid enriched variant
 */
export function generateMazeVariant(baseTemplate, rawSeed, previousVariant = null) {
  const seedInt = normalizeSeed(rawSeed);
  const seedHex = formatSeedHex(seedInt);

  const mutations = TEMPLATE_MUTATIONS[baseTemplate.id] || [];
  const hazardMutators = HAZARD_MUTATIONS[baseTemplate.id] || [];

  // Try up to 20 sub-seeds to ensure valid, fair, and meaningfully different maze
  for (let attempt = 0; attempt < 20; attempt++) {
    const currentSeed = (seedInt + attempt * 1013904223) >>> 0;
    const prng = createPRNG(currentSeed);

    const grid = cloneGrid(baseTemplate.grid);
    const hazards = cloneHazards(baseTemplate.hazards);

    // Apply topological mutations based on PRNG
    let appliedCount = 0;
    for (const mutation of mutations) {
      if (prng() > 0.45) { // ~55% probability per mutation
        for (const tile of mutation.tiles) {
          // Never overwrite spawn or exit tiles
          if (
            (tile.x === baseTemplate.spawn.x && tile.y === baseTemplate.spawn.y) ||
            (tile.x === baseTemplate.exit.x && tile.y === baseTemplate.exit.y)
          ) {
            continue;
          }
          // Never modify perimeter boundary
          if (tile.x === 0 || tile.x === GRID_COLS - 1 || tile.y === 0 || tile.y === GRID_ROWS - 1) {
            continue;
          }
          grid[tile.y][tile.x] = tile.state;
        }
        appliedCount++;
      }
    }

    // Apply hazard mutations
    for (const mutator of hazardMutators) {
      mutator(hazards, prng());
    }

    const candidate = {
      ...baseTemplate,
      grid,
      hazards,
      seed: currentSeed,
      seedHex: formatSeedHex(currentSeed),
      isProcedural: true
    };

    // Solvability & fairness validation
    const val = validateMazeVariant(candidate);
    if (!val.valid) continue;

    // Route length validation (approx 25 to 60 steps)
    if (val.wallPathLength < 25 || val.wallPathLength > 60) continue;
    if (val.hazardPathLength < 25 || val.hazardPathLength > 60) continue;

    // Consecutive-run meaningful difference check
    if (previousVariant && !hasMeaningfulDifference(candidate, previousVariant)) {
      continue;
    }

    // Valid candidate generated!
    return candidate;
  }

  // Fallback: return base template with current seed attached (guaranteed solvable)
  return {
    ...baseTemplate,
    grid: cloneGrid(baseTemplate.grid),
    hazards: cloneHazards(baseTemplate.hazards),
    seed: seedInt,
    seedHex,
    isProcedural: false
  };
}

/**
 * In-memory recent run history (not persistent across page reload, prevents immediate duplicates)
 */
const recentRunHistory = [];
const recentTemplateHistory = [];

/**
 * Record a run to history
 * @param {string} templateId
 * @param {string|number} seed
 */
export function recordRun(templateId, seed) {
  const seedHex = typeof seed === 'number' ? formatSeedHex(seed) : String(seed).toUpperCase();
  recentRunHistory.unshift({ templateId, seed: seedHex });
  if (recentRunHistory.length > 10) {
    recentRunHistory.pop();
  }
}

/**
 * Check if template + seed was recently used
 * @param {string} templateId
 * @param {string|number} seed
 * @returns {boolean}
 */
export function isRecentRun(templateId, seed) {
  const seedHex = typeof seed === 'number' ? formatSeedHex(seed) : String(seed).toUpperCase();
  return recentRunHistory.some(r => r.templateId === templateId && r.seed === seedHex);
}

/**
 * Record a template to recent history
 * @param {string} templateId
 */
export function recordTemplate(templateId) {
  if (!templateId) return;
  recentTemplateHistory.unshift(templateId);
  if (recentTemplateHistory.length > 3) {
    recentTemplateHistory.pop();
  }
}

/**
 * Check if template was recently used
 * @param {string} templateId
 * @returns {boolean}
 */
export function isRecentTemplate(templateId) {
  return recentTemplateHistory.includes(templateId);
}

/**
 * Clear template history
 */
export function clearTemplateHistory() {
  recentTemplateHistory.length = 0;
}

/**
 * Clear all recent run and template history
 */
export function clearRunHistory() {
  recentRunHistory.length = 0;
  recentTemplateHistory.length = 0;
  lastGeneratedVariant = null;
}

/**
 * Get last run variant or null
 * @returns {Object|null}
 */
let lastGeneratedVariant = null;

export function getLastGeneratedVariant() {
  return lastGeneratedVariant;
}

export function setLastGeneratedVariant(v) {
  lastGeneratedVariant = v;
}
