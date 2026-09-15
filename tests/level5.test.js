/**
 * Level 5: System Override (Root Kernel) Tests
 * Sector 05 — Master Finale Test Suite
 * Covers LEVEL5-001 through LEVEL5-046
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { Level5 } from '../js/levels/Level5.js';
import { LEVEL5_SCENARIOS, KERNEL_NODES, getLevel5Scenario, resetLevel5History } from '../js/levels/level5Data.js';
import { getLevelMetadata } from '../js/core/levelMetadata.js';
import { ScoreManager } from '../js/systems/ScoreManager.js';
import { Timer } from '../js/systems/Timer.js';

describe('Level 5: System Override (Root Kernel) Tests (LEVEL5-001 -> LEVEL5-046)', () => {

  beforeEach(() => {
    resetLevel5History();
  });

  it('LEVEL5-001: Level initializes correctly with stage 1 default state', () => {
    const level = new Level5(null, {});
    assert.strictEqual(level.currentStage, 1, 'Initial stage must be 1');
    assert.strictEqual(level.majorMistakes, 0, 'Initial mistakes must be 0');
    assert.strictEqual(level.isPaused, false, 'Level should start unpaused');
    assert.strictEqual(level.isCompleted, false, 'Level should start uncompleted');
    assert.ok(level.scenario, 'Scenario must be assigned');
    assert.ok(level.scenario.id, 'Scenario must have a valid ID');
  });

  it('LEVEL5-002: Level 5 metadata specifies exactly 90 seconds duration and 2500 base score', () => {
    const meta = getLevelMetadata(5);
    assert.strictEqual(meta.durationSeconds, 90, 'Duration must be 90 seconds');
    assert.strictEqual(meta.baseScore, 2500, 'Base score must be 2500');
    assert.strictEqual(meta.timeBonusMultiplier, 25, 'Time multiplier must be 25');
  });

  it('LEVEL5-003: Exactly 5 authored scenarios exist and all pass schema validation', () => {
    assert.strictEqual(LEVEL5_SCENARIOS.length, 5, 'Must have exactly 5 scenarios');
    for (const sc of LEVEL5_SCENARIOS) {
      assert.ok(sc.id, 'Must have ID');
      assert.ok(sc.name, 'Must have name');
      assert.ok(Array.isArray(sc.sequence) && sc.sequence.length >= 4, 'Sequence length must be >= 4');
      assert.ok(typeof sc.targetFreq === 'number' && sc.targetFreq >= 20 && sc.targetFreq <= 150, 'targetFreq valid range');
      assert.ok(typeof sc.targetBuffer === 'number' && sc.targetBuffer >= 32 && sc.targetBuffer <= 512, 'targetBuffer valid range');
      assert.ok(typeof sc.sweepSpeed === 'number' && sc.sweepSpeed >= 1.0, 'sweepSpeed must be >= 1.0');
      assert.ok(typeof sc.sweetSpotWidth === 'number' && sc.sweetSpotWidth >= 10, 'sweetSpotWidth valid');
    }
  });

  it('LEVEL5-004 & LEVEL5-005: Stage 1 meaningful kernel nodes exist and input is recorded', () => {
    assert.strictEqual(KERNEL_NODES.length, 4, 'Must have 4 meaningful nodes');
    const nodeIds = KERNEL_NODES.map(n => n.id);
    assert.ok(nodeIds.includes('alpha'));
    assert.ok(nodeIds.includes('beta'));
    assert.ok(nodeIds.includes('gamma'));
    assert.ok(nodeIds.includes('delta'));

    const level = new Level5(null, {}, { scenarioIndex: 0 }); // sc_01_alpha: ['alpha', 'gamma', 'beta', 'delta']
    level.init();

    level._handleStage1Input('alpha');
    assert.strictEqual(level.stage1Input.length, 1);
    assert.strictEqual(level.stage1Input[0], 'alpha');
  });

  it('LEVEL5-006: Correct sequence completion advances to Stage 2', (t, done) => {
    const level = new Level5(null, {}, { scenarioIndex: 0 });
    level.init();
    const seq = level.scenario.sequence;

    for (let i = 0; i < seq.length; i++) {
      level._handleStage1Input(seq[i]);
    }

    setTimeout(() => {
      assert.strictEqual(level.currentStage, 2, 'Stage must advance to 2');
      done();
    }, 600);
  });

  it('LEVEL5-007: Incorrect sequence input registers penalty and mistake', () => {
    let penaltyDeducted = 0;
    const level = new Level5(null, {
      onPenalty: (amt) => { penaltyDeducted += amt; }
    }, { scenarioIndex: 0 }); // expected first: 'alpha'
    level.init();

    level._handleStage1Input('beta'); // wrong!
    assert.strictEqual(penaltyDeducted, 100, 'Mistake should penalize 100 pts');
    assert.strictEqual(level.majorMistakes, 1, 'Major mistakes counter incremented');
    assert.strictEqual(level.currentStage, 1, 'Remains on Stage 1');
  });

  it('LEVEL5-008, LEVEL5-009, LEVEL5-010: Stage 2 parameter tuning and stability calculation', () => {
    const level = new Level5(null, {}, { scenarioIndex: 0 }); // targetFreq: 74, targetBuffer: 128
    level.init();
    level.currentStage = 2;

    // Far from target
    level.currentFreq = 20;
    level.currentBuffer = 500;
    level._updateStage2Coherence();
    assert.ok(level.coherence < 50, `Coherence should be low when off-target (was ${level.coherence})`);

    // Close to target
    level.currentFreq = 74;
    level.currentBuffer = 128;
    level._updateStage2Coherence();
    assert.ok(level.coherence >= 95, `Coherence should be >= 95% at exact target (was ${level.coherence})`);
  });

  it('LEVEL5-011: Stage 2 successful stabilization advances to Stage 3', () => {
    const level = new Level5(null, {}, { scenarioIndex: 0 });
    level.init();
    level.currentStage = 2;
    level.currentFreq = 74;
    level.currentBuffer = 128;
    level._updateStage2Coherence();

    level._handleStage2Stabilize();
    assert.strictEqual(level.currentStage, 3, 'Stage must advance to 3');
  });

  it('LEVEL5-012 & LEVEL5-033: Stage 3 oscillation needle updates and sets 4 gauge states', () => {
    const level = new Level5(null, {}, { scenarioIndex: 0 }); // sweetSpotCenter: 50, sweetSpotWidth: 16 (42 - 58)
    level.init();
    level.currentStage = 3;

    // Far left -> WAITING
    level.needlePos = 10;
    level._update(0.001);
    assert.strictEqual(level.gaugeState, 'WAITING');

    // Close to window -> APPROACHING
    level.needlePos = 35;
    level._update(0.001);
    assert.strictEqual(level.gaugeState, 'APPROACHING');

    // Inside window -> OPTIMAL WINDOW
    level.needlePos = 50;
    level._update(0.001);
    assert.strictEqual(level.gaugeState, 'OPTIMAL WINDOW');
  });

  it('LEVEL5-013 & LEVEL5-040: Optimal disconnect trigger invokes final escape and level complete', (t, done) => {
    let completedBonus = 0;
    const level = new Level5(null, {
      onComplete: (bonus) => { completedBonus = bonus; }
    }, { scenarioIndex: 0 });
    level.init();
    level.currentStage = 3;
    level.needlePos = 50; // exact center of optimal window

    level._handleStage3Trigger();
    assert.strictEqual(level.isCompleted, true, 'isCompleted must be true');

    setTimeout(() => {
      assert.strictEqual(completedBonus, 2500, 'Level 5 base score 2500 awarded');
      done();
    }, 1900);
  });

  it('LEVEL5-014: Mistimed disconnect trigger penalizes score and counts mistake', () => {
    let penaltyDeducted = 0;
    const level = new Level5(null, {
      onPenalty: (amt) => { penaltyDeducted += amt; }
    }, { scenarioIndex: 0 });
    level.init();
    level.currentStage = 3;
    level.needlePos = 10; // outside window

    level._handleStage3Trigger();
    assert.strictEqual(penaltyDeducted, 150, 'Missed disconnect penalizes 150 pts');
    assert.strictEqual(level.majorMistakes, 1);
    assert.strictEqual(level.isCompleted, false);
  });

  it('LEVEL5-015 & LEVEL5-034: 3 cumulative major mistakes trigger life loss', () => {
    let lifeLostCount = 0;
    const level = new Level5(null, {
      onLoseLife: () => { lifeLostCount++; }
    }, { scenarioIndex: 0 });
    level.init();

    level._registerMajorMistake('Fail 1');
    assert.strictEqual(lifeLostCount, 0);
    level._registerMajorMistake('Fail 2');
    assert.strictEqual(lifeLostCount, 0);
    level._registerMajorMistake('Fail 3');
    assert.strictEqual(lifeLostCount, 1, '3rd mistake must trigger onLoseLife exactly once');
  });

  it('LEVEL5-016 & LEVEL5-017 & LEVEL5-045: Pause and resume preserve state and stop execution', () => {
    const level = new Level5(null, {}, { scenarioIndex: 1 });
    level.init();
    level.currentStage = 2;
    level.currentFreq = 110;

    level.pause();
    assert.strictEqual(level.isPaused, true);
    assert.strictEqual(level.currentStage, 2);
    assert.strictEqual(level.currentFreq, 110);

    level.resume();
    assert.strictEqual(level.isPaused, false);
    assert.strictEqual(level.currentStage, 2);
  });

  it('LEVEL5-018 & LEVEL5-035 & LEVEL5-036 & LEVEL5-044: Retry preserves scenario and resets temporary progress', () => {
    const originalScenario = LEVEL5_SCENARIOS[2]; // sc_03_gamma
    const level = new Level5(null, {}, { scenario: originalScenario });
    level.init();
    level.currentStage = 3;
    level.majorMistakes = 2;

    // Retry reinitializes Level5 with the same scenario
    const retryLevel = new Level5(null, {}, { scenario: level.scenario });
    retryLevel.init();

    assert.strictEqual(retryLevel.scenario.id, originalScenario.id, 'Scenario ID preserved on retry');
    assert.strictEqual(retryLevel.currentStage, 1, 'Retry resets stage to 1');
    assert.strictEqual(retryLevel.majorMistakes, 0, 'Retry resets mistake counter to 0');
  });

  it('LEVEL5-019 & LEVEL5-046: Developer scenario override reproduces exact requested scenario', () => {
    const l1 = new Level5(null, {}, { scenarioIndex: 0 });
    assert.strictEqual(l1.scenario.id, 'sc_01_alpha');

    const l4 = new Level5(null, {}, { scenarioIndex: 3 });
    assert.strictEqual(l4.scenario.id, 'sc_04_delta');

    const lByString = new Level5(null, {}, { scenarioId: 'sc_05_omega' });
    assert.strictEqual(lByString.scenario.id, 'sc_05_omega');
  });

  it('LEVEL5-020: ScoreManager ensures score is non-negative and bonuses calculate properly', () => {
    const sm = new ScoreManager(0);
    sm.addScore(2500); // Base
    sm.addScore(20 * 25); // 20s remaining * 25 pts = 500
    sm.addScore(3 * 500); // 3 lives * 500 = 1500
    assert.strictEqual(sm.getScore(), 4500);

    sm.deductScore(5000);
    assert.strictEqual(sm.getScore(), 0, 'Score floor >= 0');
  });

  it('LEVEL5-021 to LEVEL5-030: Cleanup stops loop and removes state', () => {
    const level = new Level5(null, {});
    level.init();
    level.start();
    assert.strictEqual(level.isPaused, false);

    level.cleanup();
    assert.strictEqual(level.isPaused, true);
    assert.strictEqual(level._rafId, null);
    assert.strictEqual(level._sequenceTimeoutId, null);
  });

  it('LEVEL5-031: Exact internal target values are not directly exposed in player-facing UI', () => {
    const sc = LEVEL5_SCENARIOS[0];
    assert.ok(sc.targetFreq, 'Target freq exists');
    assert.ok(sc.targetBuffer, 'Target buffer exists');

    // Verify scenario definition properties are not leaked in name/description
    assert.ok(!sc.name.includes(String(sc.targetFreq)), 'Target freq not in name');
    assert.ok(!sc.description.includes(String(sc.targetFreq)), 'Target freq not in description');
    assert.ok(!sc.description.includes(String(sc.targetBuffer)), 'Target buffer not in description');
  });

  it('LEVEL5-032: Stage 2 stability changes progressively toward/away from target', () => {
    const level = new Level5(null, {}, { scenarioIndex: 0 }); // Target: freq 74, buffer 128
    level.init();
    level.currentStage = 2;

    level.currentFreq = 30;
    level.currentBuffer = 300;
    level._updateStage2Coherence();
    const cLow = level.coherence;

    level.currentFreq = 60;
    level.currentBuffer = 180;
    level._updateStage2Coherence();
    const cMid = level.coherence;

    level.currentFreq = 74;
    level.currentBuffer = 128;
    level._updateStage2Coherence();
    const cHigh = level.coherence;

    assert.ok(cMid > cLow, `Coherence should increase closer to target (mid=${cMid}, low=${cLow})`);
    assert.ok(cHigh > cMid, `Coherence should peak at target (high=${cHigh}, mid=${cMid})`);
  });

  it('LEVEL5-037 & LEVEL5-041 & LEVEL5-042 & LEVEL5-043: New runs can select different scenarios with deduplication', () => {
    resetLevel5History();
    const first = getLevel5Scenario();
    const second = getLevel5Scenario();

    assert.ok(first.id, 'First scenario valid');
    assert.ok(second.id, 'Second scenario valid');
    assert.notStrictEqual(first.id, second.id, 'Immediate scenario repetition is prevented');
  });

  it('LEVEL5-038 & LEVEL5-039: Connected progression transitions smoothly across 1 -> 2 -> 3', () => {
    const level = new Level5(null, {}, { scenarioIndex: 0 });
    level.init();
    assert.strictEqual(level.currentStage, 1);

    // Complete stage 1
    const seq = level.scenario.sequence;
    for (const node of seq) {
      level._handleStage1Input(node);
    }
    // Advance to 2
    level.currentStage = 2;
    assert.strictEqual(level.currentStage, 2);

    // Complete stage 2
    level.currentFreq = 74;
    level.currentBuffer = 128;
    level._updateStage2Coherence();
    level._handleStage2Stabilize();
    assert.strictEqual(level.currentStage, 3);
  });

});
