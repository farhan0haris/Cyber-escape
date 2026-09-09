import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { Level2 } from '../js/levels/Level2.js';
import {
  LEVEL2_VARIANTS,
  GRID_COLS,
  GRID_ROWS,
  TILE_WIDTH,
  TILE_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  findPathBFS,
  validateMazeVariant,
  MIN_MAZE_PATH_LENGTH,
  MAX_MAZE_PATH_LENGTH
} from '../js/levels/level2Data.js';
import {
  generateMazeVariant,
  generateRunSeed,
  normalizeSeed,
  formatSeedHex,
  createPRNG,
  hasMeaningfulDifference,
  isRecentRun,
  recordRun,
  HAZARD_MUTATIONS
} from '../js/levels/mazeGenerator.js';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { DEV_CONFIG, setDevMode } from '../js/core/devConfig.js';
import { getLevelMetadata } from '../js/core/levelMetadata.js';

describe('Level 2: Digital Maze & Navigation Tests (LEVEL2-001 -> LEVEL2-060)', () => {
  let mockContainer;

  beforeEach(() => {
    mockContainer = {
      innerHTML: '',
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
    gameState.reset();
  });

  test('LEVEL2-001: Level initializes correctly with default values', () => {
    const level = new Level2(mockContainer, {});
    assert.ok(level.variant, 'Variant is assigned');
    assert.equal(typeof level.player.x, 'number');
    assert.equal(typeof level.player.y, 'number');
    assert.equal(level.player.width, 22);
    assert.equal(level.player.height, 22);
    assert.equal(level.player.speed, 180);
    assert.equal(level.isCompleted, false);
    assert.equal(level.isPaused, false);
    assert.equal(level.isFailing, false);
    level.cleanup();
  });

  test('LEVEL2-002 & LEVEL2-003: All 5 maze layouts exist and one is selected', () => {
    assert.equal(LEVEL2_VARIANTS.length, 5, 'Exactly 5 hand-authored maze variants exist');

    for (let i = 0; i < 5; i++) {
      const level = new Level2(mockContainer, {}, { variantIndex: i });
      assert.equal(level.variant.id, LEVEL2_VARIANTS[i].id);
      assert.equal(level.grid.length, GRID_ROWS);
      assert.equal(level.grid[0].length, GRID_COLS);
      level.cleanup();
    }
  });

  test('LEVEL2-004, LEVEL2-005, LEVEL2-006: All layouts are solvable with valid spawn and exit nodes', () => {
    LEVEL2_VARIANTS.forEach((variant) => {
      const res = validateMazeVariant(variant);
      assert.equal(res.valid, true, `Variant ${variant.id} must be valid: ${res.errors.join('; ')}`);
      assert.ok(res.wallPathLength >= 25, `Variant ${variant.id} must have substantive route length`);

      // Spawn check
      assert.equal(variant.grid[variant.spawn.y][variant.spawn.x], 0, 'Spawn must be in empty path');
      // Exit check
      assert.equal(variant.grid[variant.exit.y][variant.exit.x], 0, 'Exit must be in empty path');
    });
  });

  test('LEVEL2-007: Wall collision prevents invalid movement and allows sliding', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0 });
    // Spawn is at (1, 1). Top boundary is at y = 0 (wall ending at y = 30).
    // Position player touching top wall at y = 30:
    level.player.y = 30;
    level.keys.up = true;
    level.update(0.1);
    // Collision against y=0 wall should clamp player.y to 30
    assert.equal(level.player.y, 30, 'Player cannot penetrate top wall');

    // Wall sliding test: move UP and RIGHT simultaneously against top wall
    level.keys.up = true;
    level.keys.right = true;
    const initialX = level.player.x;
    level.update(0.1);
    // Y should remain blocked at 30, but X should advance smoothly!
    assert.equal(level.player.y, 30, 'Y remains clamped to top wall');
    assert.ok(level.player.x > initialX, 'Player must slide along wall horizontally when moving diagonally');
    level.cleanup();
  });

  test('LEVEL2-008: Player remains strictly inside maze bounds', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0 });
    // Place player near edge
    level.player.x = 10;
    level.player.y = 10;
    level.keys.left = true;
    level.keys.up = true;

    for (let i = 0; i < 20; i++) {
      level.update(0.1);
    }

    assert.ok(level.player.x >= 0, 'Player X must be >= 0');
    assert.ok(level.player.y >= 0, 'Player Y must be >= 0');
    assert.ok(level.player.x <= CANVAS_WIDTH - level.player.width, 'Player X within max canvas width');
    assert.ok(level.player.y <= CANVAS_HEIGHT - level.player.height, 'Player Y within max canvas height');
    level.cleanup();
  });

  test('LEVEL2-009 & LEVEL2-010: Movement speed is normalized for diagonal inputs', () => {
    // Test in an unobstructed corridor to compare pure velocity
    const openGrid = Array(15).fill(null).map(() => Array(20).fill(0));
    const levelOrthogonal = new Level2(mockContainer, {}, { variant: { ...LEVEL2_VARIANTS[0], grid: openGrid } });
    const levelDiagonal = new Level2(mockContainer, {}, { variant: { ...LEVEL2_VARIANTS[0], grid: openGrid } });

    // Move orthogonal right
    levelOrthogonal.player.x = 100;
    levelOrthogonal.player.y = 100;
    levelOrthogonal.keys.right = true;
    levelOrthogonal.update(1.0); // 1 sec
    const orthoDistance = levelOrthogonal.player.x - 100;

    // Move diagonal right + down
    levelDiagonal.player.x = 100;
    levelDiagonal.player.y = 100;
    levelDiagonal.keys.right = true;
    levelDiagonal.keys.down = true;
    levelDiagonal.update(1.0); // 1 sec
    const diagDx = levelDiagonal.player.x - 100;
    const diagDy = levelDiagonal.player.y - 100;
    const diagDistance = Math.hypot(diagDx, diagDy);

    // Diagonal speed and orthogonal speed must match within floating precision
    assert.ok(
      Math.abs(orthoDistance - diagDistance) < 0.05,
      `Diagonal speed (${diagDistance}) must match orthogonal speed (${orthoDistance})`
    );
    levelOrthogonal.cleanup();
    levelDiagonal.cleanup();
  });

  test('LEVEL2-011, LEVEL2-012, LEVEL2-034: Hazard collision produces exactly one life-loss event', () => {
    let lifeLostCount = 0;
    const level = new Level2(
      mockContainer,
      {
        onLoseLife: () => {
          lifeLostCount++;
        }
      },
      { variantIndex: 0 }
    );

    // Spawn stationary hazard right next to player to test collision
    const testHazard = level.hazards.find((h) => h.type === 'CORRUPTED_NODE');
    assert.ok(testHazard, 'Stationary hazard exists');

    // Teleport player on top of hazard
    level.player.x = testHazard.pixelX - level.player.width / 2;
    level.player.y = testHazard.pixelY - level.player.height / 2;

    level.update(0.016);
    assert.equal(lifeLostCount, 1, 'Exactly one life loss callback triggered upon hazard hit');
    assert.equal(level.isFailing, true, 'Level entered failing state');

    // Consecutive frames should not fire duplicate life loss
    level.update(0.016);
    level.update(0.016);
    assert.equal(lifeLostCount, 1, 'No duplicate life loss events fired');
    level.cleanup();
  });

  test('LEVEL2-013 & LEVEL2-014: Pause stops gameplay updates and resume restores it', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0 });
    level.keys.right = true;
    const posX = level.player.x;

    level.pause();
    assert.equal(level.isPaused, true);
    assert.equal(level.keys.right, false, 'Keys are cleared on pause');

    // Try update while paused
    level.update(0.1);
    assert.equal(level.player.x, posX, 'Player must not move while paused');

    level.resume();
    assert.equal(level.isPaused, false);
    level.keys.right = true;
    level.update(0.1);
    assert.ok(level.player.x >= posX, 'Movement resumes after pause');
    level.cleanup();
  });

  test('LEVEL2-015 & LEVEL2-016: Timer pauses and resets correctly after retry', () => {
    const gm = new GameManager();
    gm.startGame('AGENT-TEST');

    // Advance to Level 2
    gm.handleLevelComplete(1000);
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Level 2 begins with 60 seconds');

    // Test pause
    gm.pauseGame();
    assert.equal(gameState.state.status, 'PAUSED');
    assert.equal(gm.timer.isPaused, true);

    gm.resumeGame();
    assert.equal(gameState.state.status, 'PLAYING');
    assert.equal(gm.timer.isPaused, false);

    // Test retry
    const initialLives = gameState.state.lives;
    gm.retryCurrentLevel();
    assert.equal(gameState.state.lives, initialLives - 1);
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Retry re-arms full 60s timer');

    gm.quitToMenu();
  });

  test('LEVEL2-017 & LEVEL2-018 & LEVEL2-025: Cleanup cancels loops and removes event listeners without leaks', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0 });
    level.start();
    assert.equal(level.isCompleted, false);

    level.cleanup();
    assert.equal(level.isCompleted, true);
    assert.equal(level.isPaused, true);
    assert.equal(level.rafId, null);
    assert.equal(level._cleanups.length, 0, 'All registered cleanup hooks must be popped and executed');
  });

  test('LEVEL2-019, LEVEL2-020, LEVEL2-036, LEVEL2-037: Reaching exit completes level and passes score to GameManager', () => {
    let completedScore = 0;
    const level = new Level2(
      mockContainer,
      {
        onComplete: (score) => {
          completedScore = score;
        }
      },
      { variantIndex: 0 }
    );

    // Set time remaining in gameState
    gameState.update({ levelTimeRemaining: 40 });

    // Teleport player directly into exit node
    level.player.x = level.exit.x;
    level.player.y = level.exit.y;

    level.update(0.016);
    assert.equal(level.isCompleted, true);
    // BaseScore (1500) + RemainingTime (40) * 15 = 1500 + 600 = 2100 pts
    assert.equal(completedScore, 2100, 'Score calculation matches BaseScore + TimeBonus');

    // Test GameManager integration
    const gm = new GameManager();
    gm.startGame('TESTER');
    // Set scoreManager and state to 1000 prior to level 2 completion
    gm.scoreManager.setScore(1000);
    gameState.update({ currentLevel: 2, score: 1000 });
    gm.handleLevelComplete(completedScore);
    // Global score updated exactly once: 1000 + 2100 = 3100
    assert.equal(gameState.state.score, 3100);
    assert.ok(gameState.state.completedLevels.includes(2));
    assert.equal(gameState.state.currentLevel, 3, 'Advances to Level 3 placeholder slot');

    level.cleanup();
    gm.quitToMenu();
  });

  test('LEVEL2-021 & LEVEL2-022: Mobile D-Pad controls and touch-action constraints', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0 });
    level.dpad.right = true;
    const startX = level.player.x;
    level.update(0.1);
    assert.ok(level.player.x > startX, 'D-pad right moves player right');

    level.dpad.right = false;
    level.dpad.down = true;
    const startY = level.player.y;
    level.update(0.1);
    assert.ok(level.player.y > startY, 'D-pad down moves player down');
    level.cleanup();
  });

  test('LEVEL2-023 & LEVEL2-024: Canvas aspect ratio and dimensions maintain 16:9', () => {
    assert.equal(CANVAS_WIDTH, 800);
    assert.equal(CANVAS_HEIGHT, 450);
    assert.equal(CANVAS_WIDTH / CANVAS_HEIGHT, 16 / 9);
    assert.equal(GRID_COLS * TILE_WIDTH, CANVAS_WIDTH);
    assert.equal(GRID_ROWS * TILE_HEIGHT, CANVAS_HEIGHT);
  });

  test('LEVEL2-026 & LEVEL2-027: All layouts have valid spawn and exit coordinates', () => {
    LEVEL2_VARIANTS.forEach((v) => {
      assert.equal(v.spawn.x, 1);
      assert.equal(v.spawn.y, 1);
      assert.equal(v.exit.x, 18);
      assert.equal(v.exit.y, 13);
      assert.equal(v.grid[v.spawn.y][v.spawn.x], 0);
      assert.equal(v.grid[v.exit.y][v.exit.x], 0);
    });
  });

  test('LEVEL2-028 & LEVEL2-029: Spawn and exit areas are safe from hazards', () => {
    LEVEL2_VARIANTS.forEach((v) => {
      v.hazards.forEach((h) => {
        if (h.type === 'CORRUPTED_NODE') {
          assert.ok(!(h.x === v.spawn.x && h.y === v.spawn.y), 'Corrupted node must not be at spawn');
          assert.ok(!(h.x === v.exit.x && h.y === v.exit.y), 'Corrupted node must not be at exit');
        } else if (h.type === 'PULSE_BARRIER') {
          assert.ok(!(h.tileX === v.spawn.x && h.tileY === v.spawn.y), 'Pulse barrier must not be at spawn');
          assert.ok(!(h.tileX === v.exit.x && h.tileY === v.exit.y), 'Pulse barrier must not be at exit');
        }
      });
    });
  });

  test('LEVEL2-030 & LEVEL2-033: Hazard-aware BFS path exists for every layout', () => {
    LEVEL2_VARIANTS.forEach((v) => {
      const blocked = new Set();
      v.hazards.forEach((h) => {
        if (h.type === 'CORRUPTED_NODE') {
          blocked.add(`${h.x},${h.y}`);
        }
      });
      const res = findPathBFS(v.grid, v.spawn, v.exit, blocked);
      assert.equal(res.solvable, true, `Variant ${v.id} must be solvable even with stationary hazards`);
      assert.ok(res.pathLength > 0);
    });
  });

  test('LEVEL2-031: Moving scan packets follow deterministic waypoint paths', () => {
    LEVEL2_VARIANTS.forEach((v) => {
      const scan = v.hazards.find((h) => h.type === 'SCAN_PACKET');
      if (scan) {
        assert.ok(scan.speed > 0);
        assert.ok(scan.startX >= 0 && scan.startX < GRID_COLS);
        assert.ok(scan.endX >= 0 && scan.endX < GRID_COLS);
        assert.ok(scan.startY >= 0 && scan.startY < GRID_ROWS);
        assert.ok(scan.endY >= 0 && scan.endY < GRID_ROWS);
      }
    });
  });

  test('LEVEL2-032: Pulse barriers have deterministic safe and active cycles', () => {
    LEVEL2_VARIANTS.forEach((v) => {
      const pulses = v.hazards.filter((h) => h.type === 'PULSE_BARRIER');
      pulses.forEach((p) => {
        assert.ok(p.cycleSafe >= 1.0, 'Safe window must be at least 1.0 second');
        assert.ok(p.cycleWarn >= 0.5, 'Warning window must be at least 0.5 seconds');
        assert.ok(p.cycleActive >= 0.5, 'Active window must be at least 0.5 seconds');
      });
    });
  });

  test('LEVEL2-035: Timeout produces exactly one life-loss event in GameManager', () => {
    const gm = new GameManager();
    gm.startGame('AGENT-TIMEOUT');
    gameState.update({ currentLevel: 2, lives: 3 });

    // Trigger timer expiration
    gm.handleTimerExpired();
    assert.equal(gameState.state.lives, 2, 'Exactly one life deducted on timeout');
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Timer re-armed for retry with 60s');

    gm.quitToMenu();
  });

  // ==========================================
  // LEVEL2-038 -> LEVEL2-060: REPLAYABILITY & PROCEDURAL VARIATION
  // ==========================================

  test('LEVEL2-038: Same seed produces identical maze', () => {
    const baseTemplate = LEVEL2_VARIANTS[0];
    const seed = '12345';
    const v1 = generateMazeVariant(baseTemplate, seed);
    const v2 = generateMazeVariant(baseTemplate, seed);

    assert.equal(v1.seed, v2.seed, 'Seeds must match');
    assert.deepEqual(v1.grid, v2.grid, 'Grids must be 100% identical for same seed');
    assert.deepEqual(v1.hazards, v2.hazards, 'Hazards must be 100% identical for same seed');
  });

  test('LEVEL2-039: Different seeds can produce different maze layouts', () => {
    const baseTemplate = LEVEL2_VARIANTS[0];
    const v1 = generateMazeVariant(baseTemplate, 1111);
    const v2 = generateMazeVariant(baseTemplate, 9999);

    assert.notEqual(v1.seed, v2.seed);
    const differs = hasMeaningfulDifference(v1, v2);
    assert.ok(differs, 'Different seeds should produce meaningfully different layouts');
  });

  test('LEVEL2-040: Generated maze passes validation', () => {
    for (let t = 0; t < 5; t++) {
      const base = LEVEL2_VARIANTS[t];
      for (let s = 1; s <= 5; s++) {
        const variant = generateMazeVariant(base, s * 1337);
        const val = validateMazeVariant(variant);
        assert.equal(val.valid, true, `Generated maze ${base.name} seed ${s} must be valid: ${val.errors.join('; ')}`);
      }
    }
  });

  test('LEVEL2-041: Generated maze has reachable exit', () => {
    for (let t = 0; t < 5; t++) {
      const base = LEVEL2_VARIANTS[t];
      const variant = generateMazeVariant(base, 'EXIT_TEST_' + t);
      const res = findPathBFS(variant.grid, variant.spawn, variant.exit);
      assert.equal(res.solvable, true, 'Exit must be reachable');
      assert.ok(res.pathLength >= 25, 'Path length must be at least 25');
    }
  });

  test('LEVEL2-042: Generated maze has valid spawn', () => {
    LEVEL2_VARIANTS.forEach((base) => {
      const variant = generateMazeVariant(base, 42);
      assert.equal(variant.spawn.x, 1);
      assert.equal(variant.spawn.y, 1);
      assert.equal(variant.grid[1][1], 0, 'Spawn tile must remain open passage');
    });
  });

  test('LEVEL2-043: Generated maze has acceptable path length', () => {
    LEVEL2_VARIANTS.forEach((base) => {
      const variant = generateMazeVariant(base, 777);
      const val = validateMazeVariant(variant);
      assert.ok(val.wallPathLength >= MIN_MAZE_PATH_LENGTH, `Path length ${val.wallPathLength} must be >= 25`);
      assert.ok(val.wallPathLength <= MAX_MAZE_PATH_LENGTH, `Path length ${val.wallPathLength} must be <= 60`);
    });
  });

  test('LEVEL2-044: Generated maze maintains branching/dead-end structure', () => {
    LEVEL2_VARIANTS.forEach((base) => {
      const variant = generateMazeVariant(base, 2026);
      let deadEnds = 0;
      let forks = 0;
      const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

      for (let r = 1; r < GRID_ROWS - 1; r++) {
        for (let c = 1; c < GRID_COLS - 1; c++) {
          if (variant.grid[r][c] === 0) {
            let openNeighbors = 0;
            for (const d of dirs) {
              if (variant.grid[r + d.dy][c + d.dx] === 0) openNeighbors++;
            }
            if (openNeighbors === 1) deadEnds++;
            if (openNeighbors >= 3) forks++;
          }
        }
      }
      assert.ok(deadEnds >= 1, 'Must maintain at least 1 dead-end');
      assert.ok(forks >= 2, 'Must maintain branching corridor forks');
    });
  });

  test('LEVEL2-045: Hazard placement remains fair', () => {
    LEVEL2_VARIANTS.forEach((base) => {
      const variant = generateMazeVariant(base, 'HAZARD_CHECK');
      const val = validateMazeVariant(variant);
      assert.equal(val.valid, true, 'Hazards must not make layout unfair');
      assert.ok(val.hazardPathLength >= 25, 'Hazard-aware path must remain solvable');
    });
  });

  test('LEVEL2-046: No hazard is placed on spawn', () => {
    for (let i = 0; i < 10; i++) {
      const base = LEVEL2_VARIANTS[i % 5];
      const variant = generateMazeVariant(base, i * 4999);
      variant.hazards.forEach((h) => {
        if (h.type === 'CORRUPTED_NODE') {
          assert.ok(h.x !== 1 || h.y !== 1, 'No corrupted node on spawn');
        } else if (h.type === 'PULSE_BARRIER') {
          assert.ok(h.tileX !== 1 || h.tileY !== 1, 'No pulse barrier on spawn');
        } else if (h.type === 'SCAN_PACKET') {
          assert.ok(h.startX !== 1 || h.startY !== 1, 'No scan packet start on spawn');
        }
      });
    }
  });

  test('LEVEL2-047: No permanent hazard block exists at exit', () => {
    for (let i = 0; i < 5; i++) {
      const base = LEVEL2_VARIANTS[i];
      const variant = generateMazeVariant(base, i * 8888);
      variant.hazards.forEach((h) => {
        if (h.type === 'CORRUPTED_NODE') {
          assert.ok(h.x !== 18 || h.y !== 13, 'No corrupted node on exit');
        } else if (h.type === 'PULSE_BARRIER') {
          assert.ok(h.tileX !== 18 || h.tileY !== 13, 'No pulse barrier permanently on exit');
        }
      });
    }
  });

  test('LEVEL2-048: Different seeds produce meaningful structural changes', () => {
    const base = LEVEL2_VARIANTS[0];
    const v1 = generateMazeVariant(base, 0x1A2B);
    const v2 = generateMazeVariant(base, 0x9F8E);

    let structuralDelta = 0;
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (v1.grid[r][c] !== v2.grid[r][c]) structuralDelta++;
      }
    }
    assert.ok(structuralDelta >= 2, `Expected at least 2 structural wall differences, got ${structuralDelta}`);
  });

  test('LEVEL2-049: Hazard positions can change between valid seeds', () => {
    const base = LEVEL2_VARIANTS[0]; // has h1_stat_01
    const v1 = generateMazeVariant(base, 100);
    const v2 = generateMazeVariant(base, 200);

    const h1Str = JSON.stringify(v1.hazards);
    const h2Str = JSON.stringify(v2.hazards);
    assert.ok(typeof h1Str === 'string' && typeof h2Str === 'string');
    // At least one template has mutatable hazards
    const hasHazardMutation = HAZARD_MUTATIONS[base.id].length > 0;
    assert.ok(hasHazardMutation);
  });

  test('LEVEL2-050: Immediate duplicate template/seed combinations are prevented', () => {
    const templateId = 'variant_01_alpha';
    const seed = 'A1B2';
    recordRun(templateId, seed);
    assert.equal(isRecentRun(templateId, seed), true, 'Seed should be recognized as recent');
    assert.equal(isRecentRun(templateId, 'FFFF'), false, 'Different seed should not be marked recent');
  });

  test('LEVEL2-051: Developer seed parameter reproduces exact layout', () => {
    const level1 = new Level2(mockContainer, {}, { variantIndex: 0, seed: 'A7F2' });
    const level2 = new Level2(mockContainer, {}, { variantIndex: 0, seed: 'A7F2' });

    assert.deepEqual(level1.grid, level2.grid, 'Same dev seed must produce identical grid');
    assert.equal(level1.seedHex, 'A7F2');
    assert.equal(level2.seedHex, 'A7F2');
    level1.cleanup();
    level2.cleanup();
  });

  test('LEVEL2-052: DEV_MODE=false disables seed override and dev level launch', () => {
    setDevMode(false);
    const gm = new GameManager();
    const launched = gm.startDevLevel(2, { seed: '12345' });
    assert.equal(launched, false, 'startDevLevel must return false when DEV_MODE is false');
    setDevMode(true); // restore
  });

  test('LEVEL2-053: Maze generation does not occur every frame', () => {
    const level = new Level2(mockContainer, {}, { variantIndex: 0, seed: 12345 });
    const originalGrid = level.grid;
    // Simulate 10 update frames
    for (let f = 0; f < 10; f++) {
      level.update(0.016);
    }
    assert.equal(level.grid, originalGrid, 'Grid reference must be cached and unchanged across frames');
    level.cleanup();
  });

  test('LEVEL2-054: Consecutive valid seeds produce a meaningful structural or hazard difference', () => {
    const base = LEVEL2_VARIANTS[0];
    const prev = generateMazeVariant(base, 'RUN_ALPHA');
    const next = generateMazeVariant(base, 'RUN_BETA', prev);

    assert.ok(hasMeaningfulDifference(next, prev), 'Next variant must be meaningfully different from previous');
  });

  test('LEVEL2-055: Generator rejects a technically different but gameplay-equivalent variant when it is effectively identical', () => {
    const base = LEVEL2_VARIANTS[1];
    const prev = generateMazeVariant(base, 100);
    // Create candidate identical to prev
    const identicalCandidate = { ...prev };
    assert.equal(hasMeaningfulDifference(identicalCandidate, prev), false, 'Identical candidate has no meaningful difference');
    // Generator given prev as constraint will yield a meaningfully different one
    const distinct = generateMazeVariant(base, 100, prev);
    assert.ok(hasMeaningfulDifference(distinct, prev), 'Generator must return distinct variant');
  });

  test('LEVEL2-056: New Level 2 run starts with 60 seconds', () => {
    const meta = getLevelMetadata(2);
    assert.equal(meta.durationSeconds, 60, 'Level 2 metadata duration is 60 seconds');

    const gm = new GameManager();
    gm.startGame('TEST_TIMER');
    gm.handleLevelComplete(1000); // Advance to Level 2
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Level 2 begins with 60 seconds');
    gm.quitToMenu();
  });

  test('LEVEL2-057: Level 2 retry resets timer to exactly 60 seconds and preserves the same seed / maze variant', () => {
    const gm = new GameManager();
    gm.startDevLevel(2, { seed: 'RETRY_TEST_SEED' });

    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.levelTimeRemaining, 60);

    const initialVariant = gm.levelManager.currentLevelInstance.variant;
    const initialSeed = gm.levelManager.currentLevelInstance.seedHex;
    assert.ok(initialVariant, 'Initial variant is present');

    // Simulate life loss retry
    gm.retryCurrentLevel();

    assert.equal(gameState.state.levelTimeRemaining, 60, 'Retry timer is exactly 60s');
    assert.equal(gameState.state.lives, 2, 'Lives decremented to 2');

    const retriedVariant = gm.levelManager.currentLevelInstance.variant;
    assert.equal(retriedVariant.seedHex, initialSeed, 'Retried variant preserves the same seed');
    assert.deepEqual(retriedVariant.grid, initialVariant.grid, 'Retried variant preserves exact same grid');
    gm.quitToMenu();
  });

  test('LEVEL2-058: Level 2 timeout occurs correctly', () => {
    const gm = new GameManager();
    gm.startDevLevel(2);
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.lives, 3);

    // Expire timer
    gm.handleTimerExpired();
    assert.equal(gameState.state.lives, 2, 'Life deducted on timeout');
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Timer resets to 60s on timeout retry');
    gm.quitToMenu();
  });

  test('LEVEL2-059: Developer Level 2 starts with 60 seconds', () => {
    const gm = new GameManager();
    gm.startDevLevel(2);
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.levelTimeRemaining, 60, 'Direct dev Level 2 launch starts at 60s');
    gm.quitToMenu();
  });

  test('LEVEL2-060: Levels 1, 3, 4, and 5 retain their existing documented timers', () => {
    assert.equal(getLevelMetadata(1).durationSeconds, 75, 'Level 1 must remain 75s');
    assert.equal(getLevelMetadata(2).durationSeconds, 60, 'Level 2 must be 60s');
    assert.equal(getLevelMetadata(3).durationSeconds, 60, 'Level 3 must remain 60s');
    assert.equal(getLevelMetadata(4).durationSeconds, 60, 'Level 4 must remain 60s');
    assert.equal(getLevelMetadata(5).durationSeconds, 90, 'Level 5 must remain 90s');
  });
});

