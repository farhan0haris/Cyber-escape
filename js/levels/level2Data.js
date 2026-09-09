/**
 * Level 2: Digital Maze — Layouts, Hazards & Validation Engine
 * 20 Columns × 15 Rows Grid (Logical Canvas 800 × 450 px, Tile 40 × 30 px)
 * 0 = Open Pathway, 1 = Wall / Obstacle
 */

export const GRID_COLS = 20;
export const GRID_ROWS = 15;
export const TILE_WIDTH = 40;
export const TILE_HEIGHT = 30;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

/**
 * 5 Mechanically Distinct Hand-Authored Maze Variants
 */
export const LEVEL2_VARIANTS = [
  {
    id: 'variant_01_alpha',
    sector: 'SECTOR 02-ALPHA',
    name: 'CIRCUIT MATRIX',
    mechanic: 'Path Selection & Branching',
    description: 'Interlocking signal channels with multiple deceptive branches and central corridor forks.',
    spawn: { x: 1, y: 1 },
    exit: { x: 18, y: 13 },
    // 20 cols x 15 rows
    grid: [
      // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1 (spawn at 1,1)
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // 2
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1], // 4
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 5
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1], // 6
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1], // 7
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // 8
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1], // 9
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], // 10
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1], // 11
      [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1], // 12
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13 (exit at 18,13)
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
    ],
    hazards: [
      {
        id: 'h1_stat_01',
        type: 'CORRUPTED_NODE',
        x: 7,
        y: 3,
        radius: 12,
        description: 'Corrupted buffer node trapped at dead-end bifurcation.'
      },
      {
        id: 'h1_stat_02',
        type: 'CORRUPTED_NODE',
        x: 13,
        y: 11,
        radius: 12,
        description: 'Corrupted data relic in false corridor.'
      },
      {
        id: 'h1_scan_01',
        type: 'SCAN_PACKET',
        startX: 1,
        startY: 5,
        endX: 7,
        endY: 5,
        speed: 90, // px per second
        radius: 10,
        description: 'Patrolling security scan packet oscillating along corridor 5.'
      },
      {
        id: 'h1_pulse_01',
        type: 'PULSE_BARRIER',
        tileX: 11,
        tileY: 9,
        cycleSafe: 1.5,
        cycleWarn: 0.75,
        cycleActive: 1.0,
        description: 'Cyclic logic firewall gate guarding central transition corridor.'
      }
    ]
  },
  {
    id: 'variant_02_beta',
    sector: 'SECTOR 02-BETA',
    name: 'PACKET BYPASS',
    mechanic: 'Perimeter Bypass & Pulse Timing',
    description: 'Long outer data bypass routes flanked by tight interior labyrinth channels and pulse firewalls.',
    spawn: { x: 1, y: 1 },
    exit: { x: 18, y: 13 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1 Top bypass channel
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1], // 2
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1], // 4
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1], // 5
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 6
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // 7
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1], // 8
      [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1], // 9
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 10
      [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1], // 11
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], // 12
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13 Bottom bypass channel
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
    ],
    hazards: [
      {
        id: 'h2_pulse_01',
        type: 'PULSE_BARRIER',
        tileX: 9,
        tileY: 1,
        cycleSafe: 1.8,
        cycleWarn: 0.8,
        cycleActive: 1.0,
        description: 'Periodic pulse laser traversing northern perimeter bypass.'
      },
      {
        id: 'h2_pulse_02',
        type: 'PULSE_BARRIER',
        tileX: 10,
        tileY: 13,
        cycleSafe: 1.8,
        cycleWarn: 0.8,
        cycleActive: 1.0,
        description: 'Periodic pulse laser traversing southern perimeter bypass.'
      },
      {
        id: 'h2_stat_01',
        type: 'CORRUPTED_NODE',
        x: 5,
        y: 5,
        radius: 12,
        description: 'Corrupted cluster inside interior chamber dead-end.'
      },
      {
        id: 'h2_scan_01',
        type: 'SCAN_PACKET',
        startX: 3,
        startY: 7,
        endX: 7,
        endY: 7,
        speed: 85,
        radius: 10,
        description: 'Oscillating scanner inside central interior channel.'
      }
    ]
  },
  {
    id: 'variant_03_gamma',
    sector: 'SECTOR 02-GAMMA',
    name: 'LOGIC LABYRINTH',
    mechanic: 'Deceptive Routes & Stationary Hazards',
    description: 'Deceptive false dead-ends, decoy corridors, and stationary hazard clusters forcing route analysis.',
    spawn: { x: 1, y: 1 },
    exit: { x: 18, y: 13 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 1
      [1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 2
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1], // 4
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1], // 5
      [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1], // 6
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 7
      [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 8
      [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1], // 9
      [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1], // 10
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1], // 11
      [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1], // 12
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
    ],
    hazards: [
      {
        id: 'h3_stat_01',
        type: 'CORRUPTED_NODE',
        x: 1,
        y: 3,
        radius: 12,
        description: 'Dead-end decoy branch trap at west corridor.'
      },
      {
        id: 'h3_stat_02',
        type: 'CORRUPTED_NODE',
        x: 16,
        y: 1,
        radius: 12,
        description: 'High-visibility dead-end trap at northeast sector.'
      },
      {
        id: 'h3_stat_03',
        type: 'CORRUPTED_NODE',
        x: 9,
        y: 9,
        radius: 12,
        description: 'False junction trap near southern logic node.'
      },
      {
        id: 'h3_scan_01',
        type: 'SCAN_PACKET',
        startX: 5,
        startY: 7,
        endX: 14,
        endY: 7,
        speed: 100,
        radius: 10,
        description: 'Rapid packet patrol traversing the central junction.'
      }
    ]
  },
  {
    id: 'variant_04_delta',
    sector: 'SECTOR 02-DELTA',
    name: 'MEMORY REGISTER',
    mechanic: 'Choke Points & Moving Scan Timing',
    description: 'Segmented memory cluster chambers interconnected by narrow bottleneck choke points.',
    spawn: { x: 1, y: 1 },
    exit: { x: 18, y: 13 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 1
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], // 2
      [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 4
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 5
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1], // 6
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 7 Grand corridor
      [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1], // 8
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1], // 9
      [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1], // 10
      [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1], // 11
      [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1], // 12
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
    ],
    hazards: [
      {
        id: 'h4_scan_01',
        type: 'SCAN_PACKET',
        startX: 3,
        startY: 7,
        endX: 16,
        endY: 7,
        speed: 110,
        radius: 11,
        description: 'High-speed packet sweeper policing the grand transverse corridor.'
      },
      {
        id: 'h4_pulse_01',
        type: 'PULSE_BARRIER',
        tileX: 10,
        tileY: 3,
        cycleSafe: 1.6,
        cycleWarn: 0.75,
        cycleActive: 1.0,
        description: 'Timing barrier guarding central chamber bottleneck.'
      },
      {
        id: 'h4_stat_01',
        type: 'CORRUPTED_NODE',
        x: 6,
        y: 1,
        radius: 12,
        description: 'Corrupted memory buffer trapped in chamber 2 upper alcove.'
      }
    ]
  },
  {
    id: 'variant_05_epsilon',
    sector: 'SECTOR 02-EPSILON',
    name: 'KERNEL CONDUIT',
    mechanic: 'Switchback Routing & Synchronized Hazards',
    description: 'High-density switchback channels requiring precise navigational steering and synchronized hazard timing.',
    spawn: { x: 1, y: 1 },
    exit: { x: 18, y: 13 },
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // 0
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 1
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1], // 2
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1], // 3
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1], // 4
      [1, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1], // 5
      [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1], // 6
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1], // 7
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1], // 8
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1], // 9
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1], // 10
      [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1], // 11
      [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1], // 12
      [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1], // 13
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]  // 14
    ],
    hazards: [
      {
        id: 'h5_pulse_01',
        type: 'PULSE_BARRIER',
        tileX: 9,
        tileY: 2,
        cycleSafe: 1.5,
        cycleWarn: 0.75,
        cycleActive: 1.0,
        description: 'First stage kernel synchronization gate.'
      },
      {
        id: 'h5_pulse_02',
        type: 'PULSE_BARRIER',
        tileX: 9,
        tileY: 9,
        cycleSafe: 1.5,
        cycleWarn: 0.75,
        cycleActive: 1.0,
        description: 'Second stage kernel synchronization gate.'
      },
      {
        id: 'h5_stat_01',
        type: 'CORRUPTED_NODE',
        x: 3,
        y: 12,
        radius: 12,
        description: 'Corrupted kernel packet resting in deceptive switchback pocket.'
      },
      {
        id: 'h5_scan_01',
        type: 'SCAN_PACKET',
        startX: 4,
        startY: 8,
        endX: 15,
        endY: 8,
        speed: 95,
        radius: 10,
        description: 'Transverse kernel sweep packet patrolling row 8.'
      }
    ]
  }
];

/**
 * Breadth-First Search (BFS) Pathfinding Validator
 * Can evaluate pure wall connectivity OR hazard-aware connectivity.
 *
 * @param {Array<Array<number>>} grid - 2D grid of 0s and 1s
 * @param {{x: number, y: number}} start - starting grid coordinate
 * @param {{x: number, y: number}} target - destination grid coordinate
 * @param {Set<string>} [blockedTiles] - optional set of "x,y" keys to treat as solid
 * @returns {{ solvable: boolean, pathLength: number, path: Array<{x: number, y: number}> }}
 */
export function findPathBFS(grid, start, target, blockedTiles = new Set()) {
  const rows = grid.length;
  const cols = grid[0].length;

  if (start.x < 0 || start.x >= cols || start.y < 0 || start.y >= rows) {
    return { solvable: false, pathLength: 0, path: [] };
  }
  if (target.x < 0 || target.x >= cols || target.y < 0 || target.y >= rows) {
    return { solvable: false, pathLength: 0, path: [] };
  }
  if (grid[start.y][start.x] === 1 || grid[target.y][target.x] === 1) {
    return { solvable: false, pathLength: 0, path: [] };
  }
  if (blockedTiles.has(`${start.x},${start.y}`) || blockedTiles.has(`${target.x},${target.y}`)) {
    return { solvable: false, pathLength: 0, path: [] };
  }

  const queue = [[start]];
  const visited = new Set([`${start.x},${start.y}`]);
  const dirs = [
    { dx: 0, dy: -1 }, // Up
    { dx: 0, dy: 1 },  // Down
    { dx: -1, dy: 0 }, // Left
    { dx: 1, dy: 0 }   // Right
  ];

  while (queue.length > 0) {
    const currentPath = queue.shift();
    const current = currentPath[currentPath.length - 1];

    if (current.x === target.x && current.y === target.y) {
      return { solvable: true, pathLength: currentPath.length, path: currentPath };
    }

    for (const dir of dirs) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const key = `${nx},${ny}`;

      if (
        nx >= 0 &&
        nx < cols &&
        ny >= 0 &&
        ny < rows &&
        grid[ny][nx] === 0 &&
        !blockedTiles.has(key) &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push([...currentPath, { x: nx, y: ny }]);
      }
    }
  }

  return { solvable: false, pathLength: 0, path: [] };
}

/**
 * Comprehensive Hazard-Aware Maze Validator
 * Guarantees that a maze variant is both wall-solvable AND fair with hazards.
 *
 * @param {Object} variant
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateMazeVariant(variant) {
  const errors = [];
  const { grid, spawn, exit, hazards } = variant;

  // 1. Check dimensions
  if (!grid || grid.length !== GRID_ROWS) {
    errors.push(`Grid rows mismatch: expected ${GRID_ROWS}, got ${grid ? grid.length : 0}`);
  }
  for (let r = 0; r < (grid ? grid.length : 0); r++) {
    if (grid[r].length !== GRID_COLS) {
      errors.push(`Row ${r} length mismatch: expected ${GRID_COLS}, got ${grid[r].length}`);
    }
  }

  // 2. Perimeter Wall Check
  for (let c = 0; c < GRID_COLS; c++) {
    if (grid[0][c] !== 1) errors.push(`Top boundary missing at col ${c}`);
    if (grid[GRID_ROWS - 1][c] !== 1) errors.push(`Bottom boundary missing at col ${c}`);
  }
  for (let r = 0; r < GRID_ROWS; r++) {
    if (grid[r][0] !== 1) errors.push(`Left boundary missing at row ${r}`);
    if (grid[r][GRID_COLS - 1] !== 1) errors.push(`Right boundary missing at row ${r}`);
  }

  // 3. Spawn & Exit validity
  if (grid[spawn.y][spawn.x] !== 0) {
    errors.push(`Spawn at (${spawn.x}, ${spawn.y}) is inside a wall`);
  }
  if (grid[exit.y][exit.x] !== 0) {
    errors.push(`Exit at (${exit.x}, ${exit.y}) is inside a wall`);
  }

  // 4. Wall-only solvability
  const wallPath = findPathBFS(grid, spawn, exit);
  if (!wallPath.solvable) {
    errors.push('No valid walkable path exists from spawn to exit');
  }

  // 5. Hazard Fairness & Safety
  const stationaryBlocked = new Set();
  if (Array.isArray(hazards)) {
    for (const h of hazards) {
      // Check spawn safety
      if (h.type === 'CORRUPTED_NODE') {
        if (h.x === spawn.x && h.y === spawn.y) {
          errors.push(`Spawn is occupied by stationary hazard ${h.id}`);
        }
        // Adjacent spawn safety
        if (Math.abs(h.x - spawn.x) <= 1 && Math.abs(h.y - spawn.y) <= 1) {
          errors.push(`Stationary hazard ${h.id} is too close to spawn (immediate damage risk)`);
        }
        if (h.x === exit.x && h.y === exit.y) {
          errors.push(`Exit node is blocked by stationary hazard ${h.id}`);
        }
        stationaryBlocked.add(`${h.x},${h.y}`);
      } else if (h.type === 'PULSE_BARRIER') {
        if (h.tileX === spawn.x && h.tileY === spawn.y) {
          errors.push(`Spawn is inside pulse barrier ${h.id}`);
        }
        if (h.tileX === exit.x && h.tileY === exit.y) {
          errors.push(`Exit is inside pulse barrier ${h.id}`);
        }
        if (h.cycleSafe < 1.0) {
          errors.push(`Pulse barrier ${h.id} has dangerously short safe window (${h.cycleSafe}s)`);
        }
      } else if (h.type === 'SCAN_PACKET') {
        if (h.speed <= 0) {
          errors.push(`Scan packet ${h.id} has non-positive speed`);
        }
        if (h.startX === spawn.x && h.startY === spawn.y) {
          errors.push(`Scan packet ${h.id} spawns directly on player spawn`);
        }
      }
    }
  }

  // 6. Hazard-Aware BFS Solvability (treating stationary hazards as solid obstacles)
  const hazardPath = findPathBFS(grid, spawn, exit, stationaryBlocked);
  if (!hazardPath.solvable) {
    errors.push('Stationary hazards completely seal all viable routes to the exit');
  }

  return {
    valid: errors.length === 0,
    errors,
    wallPathLength: wallPath.pathLength,
    hazardPathLength: hazardPath.pathLength
  };
}

export const MIN_MAZE_PATH_LENGTH = 25;
export const MAX_MAZE_PATH_LENGTH = 60;
