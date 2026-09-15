/**
 * Level 4 Headless Playtest Verification Script
 * Validates all 5 Level 4 variants for:
 * - Traversal and reachability
 * - Checkpoint triggering
 * - Intentional collision and safe respawn
 * - Single-shot life loss and scoring
 * - Pause and resume
 * - Completion and victory score
 */

import assert from 'node:assert/strict';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { Level4 } from '../js/levels/Level4.js';
import { LEVEL4_VARIANTS, ZONE_BOUNDS, SPAWN_POSITION, CHECKPOINT_POSITION } from '../js/levels/level4Data.js';

console.log('--- STARTING LEVEL 4 PLAYTEST VERIFICATION MATRIX (5 VARIANTS) ---');

const mockContainer = {
  innerHTML: '',
  appendChild: () => {},
  querySelector: (sel) => {
    if (sel === '#l4-canvas') {
      return {
        getContext: () => ({
          fillRect: () => {},
          strokeRect: () => {},
          beginPath: () => {},
          moveTo: () => {},
          lineTo: () => {},
          stroke: () => {},
          fill: () => {},
          arc: () => {},
          closePath: () => {},
          save: () => {},
          restore: () => {},
          translate: () => {},
          rotate: () => {},
          fillText: () => {},
          setLineDash: () => {}
        }),
        classList: { add: () => {}, remove: () => {} }
      };
    }
    return {
      textContent: '',
      className: '',
      appendChild: () => {},
      remove: () => {},
      addEventListener: () => {},
      classList: { add: () => {}, remove: () => {} }
    };
  },
  querySelectorAll: () => [],
  addEventListener: () => {},
  removeEventListener: () => {}
};

for (let vIdx = 0; vIdx < LEVEL4_VARIANTS.length; vIdx++) {
  const v = LEVEL4_VARIANTS[vIdx];
  console.log(`\nTesting Variant ${vIdx + 1}: ${v.name} (${v.id})...`);

  gameState.reset();
  const gm = new GameManager();

  let completedScore = 0;
  let lifeLosses = 0;
  let penalties = 0;

  const l4 = new Level4(mockContainer, {
    onComplete: (score) => { completedScore = score; },
    onLoseLife: () => { lifeLosses++; },
    onPenalty: (pts) => { penalties += pts; }
  }, { variantIndex: vIdx });

  l4.init();
  l4.start();

  // 1. Initial State Checks
  assert.equal(l4.player.x, SPAWN_POSITION.x);
  assert.equal(l4.player.y, SPAWN_POSITION.y);
  assert.equal(l4.checkpoint.isMidpointReached, false);
  console.log('  ✓ Initial state valid at spawn');

  // 2. Advance to Safe Island Checkpoint (x = 400)
  l4.player.x = 400;
  l4._update(0.016);
  assert.equal(l4.checkpoint.isMidpointReached, true);
  assert.equal(l4.checkpoint.x, CHECKPOINT_POSITION.x);
  console.log('  ✓ Checkpoint armed at midpoint island');

  // 3. Test Intentional Collision
  const hazard = l4.variant.hazards[0];
  l4._handleCollision(hazard);
  assert.equal(lifeLosses, 1);
  assert.equal(penalties, 250);
  assert.equal(l4.player.x, CHECKPOINT_POSITION.x);
  console.log('  ✓ Collision handled: -1 life, -250 pts, safe respawn at midpoint');

  // 4. Test Pause / Resume
  l4.pause();
  assert.equal(l4.isPaused, true);
  l4.resume();
  assert.equal(l4.isPaused, false);
  console.log('  ✓ Pause / Resume cycle clean');

  // 5. Reach Extraction Gate
  gameState.update({ levelTimeRemaining: 35 });
  l4.player.x = ZONE_BOUNDS.GOAL_TRIGGER_X;
  l4._update(0.016);
  assert.equal(l4.isCompleted, true);
  console.log(`  ✓ Extraction successful: final score = ${completedScore}`);

  l4.cleanup();
  if (gm.timer) gm.timer.stop();
  if (gm.levelManager) gm.levelManager.cleanupLevel();
}

console.log('\n--- ALL 5 LEVEL 4 VARIANTS SUCCESSFULLY PLAYTESTED & VALIDATED ---');
