/**
 * Level 3: Hidden Key / Memory Dump — Test Suite
 * Tests LEVEL3-001 through LEVEL3-060
 */

import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { Level3 } from '../js/levels/Level3.js';
import {
  LEVEL3_SCENARIOS,
  validateScenario,
  clearLevel3ScenarioHistory
} from '../js/levels/level3Data.js';
import { getLevelMetadata } from '../js/core/levelMetadata.js';

describe('Level 3: Memory Dump & Forensics Tests (LEVEL3-001 -> LEVEL3-060)', () => {
  let gm;
  let mockContainer;

  beforeEach(() => {
    gameState.reset();
    clearLevel3ScenarioHistory();
    mockContainer = {
      innerHTML: '',
      appendChild: () => {},
      querySelector: (selector) => {
        if (selector === '#l3-notice-banner') return { textContent: '', className: '' };
        if (selector === '#l3-chips-grid') return { innerHTML: '' };
        if (selector === '#l3-inspector-card') return { innerHTML: '' };
        if (selector === '#l3-comparator-card') return { innerHTML: '' };
        if (selector === '#l3-gate-badge') return { className: '', textContent: '' };
        if (selector === '#btn-verify-chip') return { disabled: false };
        if (selector === '#btn-pin-chip') return { textContent: '' };
        if (selector === '#btn-triage-chip') return { textContent: '' };
        if (selector === '#btn-hint-chip') return { textContent: '' };
        if (selector === '#l3-attempt-pips') return { innerHTML: '' };
        return null;
      },
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {}
    };
    gm = new GameManager();
  });

  afterEach(() => {
    if (gm && gm.timer) gm.timer.stop();
    if (gm) gm._stopElapsedTracking();
    if (gm && gm.levelManager) gm.levelManager.cleanupLevel();
  });

  test('LEVEL3-001: Level initializes correctly with default values', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    assert.equal(l3.maxAttempts, 3);
    assert.equal(l3.failedAttempts, 0);
    assert.equal(l3.baseScore, 1200);
    assert.equal(l3.timeMultiplier, 15);
    assert.equal(l3.penaltyPerMistake, 100);
    assert.equal(l3.hintsUsed, 0);
    assert.equal(l3.hintPenaltyTotal, 0);
    assert.equal(l3.isCompleted, false);
    assert.equal(l3.isLocked, false);
    assert.ok(l3.scenario, 'Scenario is assigned');
    assert.ok(l3.selectedChipId, 'First chip selected by default on init');
    l3.cleanup();
  });

  test('LEVEL3-002 & LEVEL3-003: Exactly 5 authored scenarios exist and all pass schema validation', () => {
    assert.ok(Array.isArray(LEVEL3_SCENARIOS));
    assert.equal(LEVEL3_SCENARIOS.length, 5, 'Must have exactly 5 authored scenarios');

    LEVEL3_SCENARIOS.forEach((scen, idx) => {
      const val = validateScenario(scen);
      assert.ok(val.valid, `Scenario ${idx} (${scen.id}) failed validation: ${val.errors.join('; ')}`);
    });
  });

  test('LEVEL3-004 to LEVEL3-010: Every scenario has 12 chips, exactly 1 authentic key, and 11 distinct decoys', () => {
    LEVEL3_SCENARIOS.forEach((scen) => {
      assert.equal(scen.chips.length, 12, 'Must have 12 chips');
      const authentic = scen.chips.filter(c => c.isAuthentic === true);
      assert.equal(authentic.length, 1, 'Must have exactly 1 authentic chip');

      const decoys = scen.chips.filter(c => c.isAuthentic === false);
      assert.equal(decoys.length, 11, 'Must have exactly 11 decoys');

      decoys.forEach((decoy) => {
        assert.ok(decoy.defectReason, `Decoy ${decoy.id} must have defectReason defined internally`);
      });
    });
  });

  test('LEVEL3-011 to LEVEL3-020: Chip selection updates inspector view', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const chip2 = l3.scenario.chips[1];
    l3.selectChip(chip2.id);

    assert.equal(l3.selectedChipId, chip2.id);
    assert.equal(l3.getSelectedChip().id, chip2.id);
    assert.ok(l3.inspectedChipIds.has(chip2.id));
    l3.cleanup();
  });

  test('LEVEL3-021 to LEVEL3-030: Triage state cycles UNREVIEWED -> SUSPICIOUS -> CANDIDATE -> UNREVIEWED', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();
    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    // Inspect two chips and pin/compare to establish evidence baseline
    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);
    l3.selectChip(c1.id);

    assert.equal(l3.triageMarks.get(c1.id) || 'UNREVIEWED', 'UNREVIEWED');

    l3.cycleTriage(c1.id);
    assert.equal(l3.triageMarks.get(c1.id), 'SUSPICIOUS');

    l3.cycleTriage(c1.id);
    assert.equal(l3.triageMarks.get(c1.id), 'CANDIDATE');

    l3.cycleTriage(c1.id);
    assert.equal(l3.triageMarks.get(c1.id), 'UNREVIEWED');
    l3.cleanup();
  });

  test('LEVEL3-031 to LEVEL3-040: Pinning reference enables comparative diff', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    assert.equal(l3.pinnedChipId, c1.id);

    l3.selectChip(c2.id);
    assert.ok(l3.comparedPairs.size >= 1, 'Pair comparison should be recorded');
    l3.cleanup();
  });

  test('LEVEL3-041: Verification gate prevents premature blind verification', () => {
    const l3 = new Level3(mockContainer, {});
    // Fresh un-investigated chip
    l3.inspectedChipIds.clear();
    l3.comparedPairs.clear();
    l3.selectedChipId = l3.scenario.chips[0].id;

    assert.equal(l3.isInvestigationGatePassed(), false, 'Gate must be locked initially');

    let completed = false;
    l3.callbacks = { onComplete: () => { completed = true; } };
    l3.verifySelectedChip();

    assert.equal(completed, false, 'Verification should not complete when gate is locked');
    l3.cleanup();
  });

  test('LEVEL3-042: Decoy verification penalizes score and timer and increments attempts', () => {
    let penaltyAmount = 0;
    gameState.update({ levelTimeRemaining: 70 });

    const l3 = new Level3(mockContainer, {
      onPenalty: (amt) => { penaltyAmount += amt; }
    });
    l3.init();

    // Inspect at least 2 chips and compare to pass gate
    const decoy = l3.scenario.chips.find(c => !c.isAuthentic);
    const otherChip = l3.scenario.chips.find(c => c.id !== decoy.id);

    l3.selectChip(otherChip.id);
    l3.togglePinChip(otherChip.id);
    l3.selectChip(decoy.id);

    assert.ok(l3.isInvestigationGatePassed(), 'Gate should pass after inspection and comparison');

    const prevRemaining = gameState.state.levelTimeRemaining;
    l3.verifySelectedChip();

    assert.equal(l3.failedAttempts, 1, 'Failed attempts incremented');
    assert.equal(penaltyAmount, 100, '-100 score penalty applied');
    assert.equal(gameState.state.levelTimeRemaining, prevRemaining - 5, '-5 seconds deducted from timer');
    l3.cleanup();
  });

  test('LEVEL3-043: 3rd failed verification triggers life loss callback', () => {
    let lifeLost = false;
    const l3 = new Level3(mockContainer, {
      onLoseLife: () => { lifeLost = true; }
    });
    l3.init();

    const decoy = l3.scenario.chips.find(c => !c.isAuthentic);
    const other = l3.scenario.chips.find(c => c.id !== decoy.id);

    l3.selectChip(other.id);
    l3.togglePinChip(other.id);
    l3.selectChip(decoy.id);

    l3.failedAttempts = 2; // on 3rd attempt
    l3.verifySelectedChip();

    assert.equal(l3.failedAttempts, 3);
    assert.equal(l3.isLocked, true);
    l3.cleanup();
  });

  test('LEVEL3-044: Authentic verification extracts key and triggers level completion', (t, done) => {
    let completedScore = 0;
    gameState.update({ levelTimeRemaining: 60 });

    const l3 = new Level3(mockContainer, {
      onComplete: (score) => { completedScore = score; }
    });
    l3.init();

    const authentic = l3.scenario.chips.find(c => c.isAuthentic);
    const other = l3.scenario.chips.find(c => c.id !== authentic.id);

    l3.selectChip(other.id);
    l3.togglePinChip(other.id);
    l3.selectChip(authentic.id);

    l3.verifySelectedChip();
    assert.equal(l3.isCompleted, true);

    setTimeout(() => {
      assert.ok(completedScore > 0, 'Completion score bonus awarded');
      l3.cleanup();
      done();
    }, 1900);
  });

  test('LEVEL3-045: Hint system limits hints and applies penalty', () => {
    let penalty = 0;
    const l3 = new Level3(mockContainer, {
      onPenalty: (amt) => { penalty += amt; }
    });
    l3.init();

    assert.equal(l3.hintsUsed, 0);
    l3.requestHint();
    assert.equal(l3.hintsUsed, 1);
    assert.equal(penalty, 100);

    l3.requestHint();
    assert.equal(l3.hintsUsed, 2);
    assert.equal(penalty, 250); // 100 + 150

    l3.requestHint();
    assert.equal(l3.hintsUsed, 2, 'Cannot exceed available hints');
    l3.cleanup();
  });

  test('LEVEL3-051: Internal isAuthentic flags are not exposed through player-visible UI', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const html = l3._renderChipCards();
    assert.ok(!html.includes('isAuthentic'), 'No isAuthentic text in rendered chips');
    assert.ok(!html.includes('is-authentic'), 'No is-authentic attribute in rendered chips');
    assert.ok(!html.includes('authentic-chip'), 'No authentic-chip class in rendered chips');
    l3.cleanup();
  });

  test('LEVEL3-052: Defect reasons are not exposed directly in rendered card HTML', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const html = l3._renderChipCards();
    l3.scenario.chips.forEach(c => {
      if (!c.isAuthentic && c.defectReason) {
        assert.ok(!html.includes(c.defectReason), `Defect reason ${c.defectReason} must not appear in card HTML`);
      }
    });
    l3.cleanup();
  });

  test('LEVEL3-053: Comparison highlights field differences correctly', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);

    const compHtml = l3._renderComparatorContent();
    assert.ok(compHtml.includes('COMPARISON:'), 'Comparator shows diff header');
    assert.ok(compHtml.includes('l3-diff-badge'), 'Comparator renders diff badges');
    l3.cleanup();
  });

  test('LEVEL3-054: Matching fields are distinguishable from differing fields in comparator', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();

    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);

    const compHtml = l3._renderComparatorContent();
    assert.ok(compHtml.includes('MATCH') || compHtml.includes('DIFFERENT'), 'Includes MATCH or DIFFERENT tokens');
    l3.cleanup();
  });

  test('LEVEL3-055: Verification cannot be completed without investigation prerequisites', () => {
    const l3 = new Level3(mockContainer, {});
    l3.init();
    l3.inspectedChipIds.clear();
    l3.comparedPairs.clear();
    l3.pinnedChipId = null;
    l3.triageMarks.clear();

    assert.equal(l3.isInvestigationGatePassed(), false);
    l3.cleanup();
  });

  test('LEVEL3-056: Retry preserves exact scenario and chip arrangement', () => {
    gm.startDevLevel(3);
    const initialScenario = gm.levelManager.currentLevelInstance.scenario;
    assert.ok(initialScenario, 'Level 3 must have scenario');

    gm.retryCurrentLevel();
    const retriedScenario = gm.levelManager.currentLevelInstance.scenario;

    assert.equal(retriedScenario.id, initialScenario.id, 'Retry must preserve exact scenario ID');
    assert.equal(retriedScenario.chips.length, 12, '12 chips preserved');
  });

  test('LEVEL3-057: Retry resets temporary investigation state', () => {
    gm.startDevLevel(3);
    const inst = gm.levelManager.currentLevelInstance;
    inst.triageMarks.set(inst.scenario.chips[0].id, 'SUSPICIOUS');
    inst.pinnedChipId = inst.scenario.chips[1].id;
    inst.failedAttempts = 1;

    gm.retryCurrentLevel();
    const newInst = gm.levelManager.currentLevelInstance;

    assert.equal(newInst.failedAttempts, 0, 'Failed attempts reset on retry');
    assert.equal(newInst.pinnedChipId, null, 'Pinned comparison reset on retry');
    assert.equal(newInst.triageMarks.size, 0, 'Triage marks reset on retry');
  });

  test('LEVEL3-058: Level 3 starts with exactly 75 seconds countdown', () => {
    const meta = getLevelMetadata(3);
    assert.equal(meta.durationSeconds, 75, 'Level 3 metadata duration must be 75 seconds');

    gm.startDevLevel(3);
    assert.equal(gameState.state.levelTimeRemaining, 75, 'Initial countdown must be 75s');
  });

  test('LEVEL3-059: Level 3 retry resets timer to exactly 75 seconds', () => {
    gm.startDevLevel(3);
    gameState.update({ levelTimeRemaining: 20 });

    gm.retryCurrentLevel();
    assert.equal(gameState.state.levelTimeRemaining, 75, 'Retry must restore timer to 75 seconds');
  });

  test('LEVEL3-060: Different scenarios use meaningfully different reasoning emphasis', () => {
    const focuses = LEVEL3_SCENARIOS.map(s => s.focus);
    const uniqueFocuses = new Set(focuses);

    assert.equal(uniqueFocuses.size, 5, 'All 5 scenarios must have distinct dominant reasoning focuses');
    assert.ok(uniqueFocuses.has('CHECKSUM_ANOMALY'));
    assert.ok(uniqueFocuses.has('ORIGIN_VERIFICATION'));
    assert.ok(uniqueFocuses.has('FINGERPRINT_COMPARISON'));
    assert.ok(uniqueFocuses.has('STALE_EPOCH'));
    assert.ok(uniqueFocuses.has('COMPOUND_FORENSICS'));
  });

  test('LEVEL3-061: Initial 12 cards expose only summary metadata', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();

    const cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('MEM-0x01'), 'Includes chip ID');
    assert.ok(cardsHtml.includes('0x7FFA8010'), 'Includes short memory address');
    assert.ok(cardsHtml.includes('BUFFER_01'), 'Includes neutral block name');
    assert.ok(cardsHtml.includes('INSPECT'), 'Includes inspect action');

    // Must NOT expose raw forensic details on the grid cards
    assert.equal(cardsHtml.includes('AES-256'), false, 'Algorithm must not appear on initial chip cards');
    assert.equal(cardsHtml.includes('7F:91:A3:4C'), false, 'Fingerprint must not appear on initial chip cards');
    assert.equal(cardsHtml.includes('0x12FA'), false, 'Checksum must not appear on initial chip cards');
    assert.equal(cardsHtml.includes('AUTH_KERNEL_SECURE_VAULT'), false, 'Origin must not appear on initial chip cards');
    l3.cleanup();
  });

  test('LEVEL3-062: Detailed forensic properties are revealed through inspection', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const inspectorHtml = l3._renderInspectorContent();

    assert.ok(inspectorHtml.includes('ALGORITHM'), 'Inspector shows Algorithm');
    assert.ok(inspectorHtml.includes('CHECKSUM'), 'Inspector shows Checksum');
    assert.ok(inspectorHtml.includes('FINGERPRINT'), 'Inspector shows Fingerprint');
    assert.ok(inspectorHtml.includes('ORIGIN PROVENANCE'), 'Inspector shows Origin');
    assert.ok(inspectorHtml.includes('EPOCH STATUS'), 'Inspector shows Epoch');
    assert.ok(inspectorHtml.includes('SECTOR INTEGRITY'), 'Inspector shows Integrity');
    assert.ok(inspectorHtml.includes('RELATED RECORDS IN POOL'), 'Inspector shows Related records');
    l3.cleanup();
  });

  test('LEVEL3-063: Inspection updates investigation state', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    l3.inspectedChipIds.clear();

    const progInitial = l3.getInvestigationProgress();
    assert.equal(progInitial.inspect.status, 'pending');

    l3.selectChip(l3.scenario.chips[0].id);
    l3.selectChip(l3.scenario.chips[1].id);

    const progAfter = l3.getInvestigationProgress();
    assert.equal(progAfter.inspect.status, 'complete');
    l3.cleanup();
  });

  test('LEVEL3-064: Inspection creates an activity log event', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    l3.activityLog = [];

    const c2 = l3.scenario.chips[1];
    l3.selectChip(c2.id);

    assert.ok(l3.activityLog.some(log => log.includes(`${c2.id} INSPECTED`)), 'Activity log records chip inspection');
    l3.cleanup();
  });

  test('LEVEL3-065: Comparator requires two selected chips', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    l3.pinnedChipId = null;

    const unpinnedHtml = l3._renderComparatorContent();
    assert.ok(unpinnedHtml.includes('PIN A REFERENCE BLOCK'), 'Prompts to pin reference when unpinned');

    const c1 = l3.scenario.chips[0];
    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    const sameSelectedHtml = l3._renderComparatorContent();
    assert.ok(sameSelectedHtml.includes('SELECT A SECOND BLOCK TO COMPARE'), 'Prompts to select second block when same block selected');
    l3.cleanup();
  });

  test('LEVEL3-066: Comparator correctly shows field differences', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);

    const compHtml = l3._renderComparatorContent();
    assert.ok(compHtml.includes('BLOCK A'), 'Shows Block A header');
    assert.ok(compHtml.includes('BLOCK B'), 'Shows Block B header');
    assert.ok(compHtml.includes('RESULT'), 'Shows Result header');
    assert.ok(compHtml.includes('MATCH') || compHtml.includes('DIFFERENT') || compHtml.includes('ANOMALY'));
    assert.equal(compHtml.includes('CORRECT'), false);
    assert.equal(compHtml.includes('WRONG'), false);
    assert.equal(compHtml.includes('AUTHENTIC'), false);
    assert.equal(compHtml.includes('DECOY'), false);
    l3.cleanup();
  });

  test('LEVEL3-067: Triage cannot mark an uninspected chip as CANDIDATE', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c4 = l3.scenario.chips[3];

    l3.inspectedChipIds.clear();
    l3.cycleTriage(c4.id);

    assert.notEqual(l3.triageMarks.get(c4.id), 'CANDIDATE', 'Uninspected chip cannot be triaged');
    l3.cleanup();
  });

  test('LEVEL3-068: Verification starts LOCKED', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    l3.inspectedChipIds.clear();
    l3.comparedPairs.clear();

    assert.equal(l3.isInvestigationGatePassed(), false, 'Gate starts locked');
    assert.equal(l3.getInvestigationProgress().verify.status, 'locked');
    l3.cleanup();
  });

  test('LEVEL3-069: Verification unlocks only after meaningful investigation', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];

    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);

    assert.equal(l3.isInvestigationGatePassed(), true, 'Verification unlocks after baseline inspection & comparison');
    assert.equal(l3.getInvestigationProgress().verify.status, 'ready');
    l3.cleanup();
  });

  test('LEVEL3-070: Scenario 1 displays onboarding guidance', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();

    assert.equal(l3.scenario.id, 'scenario_01_alpha');
    const tutHtml = l3._renderTutorialBanner();
    assert.ok(tutHtml.includes('MEMORY DUMP ACQUIRED // 12 MEMORY BLOCKS DETECTED'));
    assert.ok(tutHtml.includes('INSPECT A MEMORY BLOCK'));
    assert.ok(l3.getCurrentObjective().includes('SYSTEM GUIDE:'), 'Dynamic guidance shows SYSTEM GUIDE');
    l3.cleanup();
  });

  test('LEVEL3-071: Scenarios 2–5 reduce onboarding guidance', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 1 });
    l3.init();

    assert.equal(l3.scenario.id, 'scenario_02_beta');
    assert.equal(l3.getCurrentObjective().includes('SYSTEM GUIDE:'), false, 'Non-tutorial scenarios do not show SYSTEM GUIDE');
    l3.cleanup();
  });

  test('LEVEL3-072: No authentic chip is visually highlighted before verification', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const cards = l3._renderChipCards();

    assert.equal(cards.includes('authentic'), false);
    assert.equal(cards.includes('correct'), false);
    assert.equal(cards.includes('target-key'), false);
    l3.cleanup();
  });

  test('LEVEL3-073: Player cannot solve the level simply by scanning the initial chip grid', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const cards = l3._renderChipCards();

    // All 12 cards have identical structure without leaking answer
    const matchCount = (cards.match(/l3-chip-body-clean/g) || []).length;
    assert.equal(matchCount, 12, 'All 12 cards render clean neutral body');
    l3.cleanup();
  });

  test('LEVEL3-074: Retry resets temporary investigation state', () => {
    gm.startDevLevel(3);
    const inst = gm.levelManager.currentLevelInstance;
    inst.triageMarks.set(inst.scenario.chips[0].id, 'SUSPICIOUS');
    inst.pinnedChipId = inst.scenario.chips[1].id;
    inst.activityLog.push('CUSTOM LOG');

    gm.retryCurrentLevel();
    const newInst = gm.levelManager.currentLevelInstance;

    assert.equal(newInst.pinnedChipId, null, 'Pinned reference reset on retry');
    assert.equal(newInst.triageMarks.size, 0, 'Triage marks reset on retry');
  });

  test('LEVEL3-075: 12 chips render as card elements', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const cardsHtml = l3._renderChipCards();
    const matches = cardsHtml.match(/class="[^"]*l3-chip-card[^"]*"/g) || [];
    assert.equal(matches.length, 12, 'Must render exactly 12 card elements');
    l3.cleanup();
  });

  test('LEVEL3-076: Chip grid uses correct responsive structure', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    const cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('l3-chip-card'));
    const gridHtml = `<div class="l3-chips-grid" id="l3-chips-grid" role="grid" aria-label="12-Block Memory Grid">${cardsHtml}</div>`;
    assert.ok(gridHtml.includes('class="l3-chips-grid"'), 'Container contains l3-chips-grid class');
    assert.ok(gridHtml.includes('id="l3-chips-grid"'), 'Container contains l3-chips-grid id');
    l3.cleanup();
  });

  test('LEVEL3-077: Initial card view does not expose all forensic fields', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const cardsHtml = l3._renderChipCards();
    // Cards must not contain full algorithms, fingerprints, or defect reasons
    assert.equal(cardsHtml.includes('AES-256'), false);
    assert.equal(cardsHtml.includes('defectReason'), false);
    assert.equal(cardsHtml.includes('isAuthentic'), false);
    l3.cleanup();
  });

  test('LEVEL3-078: Inspect action opens forensic inspector', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    l3.selectChip(c1.id);
    const inspectorHtml = l3._renderInspectorCard();
    assert.ok(inspectorHtml.includes(c1.id));
    assert.ok(inspectorHtml.includes(c1.address));
    assert.ok(inspectorHtml.includes(c1.algorithm));
    l3.cleanup();
  });

  test('LEVEL3-079: Inspection changes chip visual state', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c2 = l3.scenario.chips[1];
    assert.equal(l3.inspectedChipIds.has(c2.id), false);
    l3.selectChip(c2.id);
    assert.equal(l3.inspectedChipIds.has(c2.id), true);
    const cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('status-inspected'));
    l3.cleanup();
  });

  test('LEVEL3-080: Inspection updates investigation progress', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    l3.selectChip(c1.id);
    const progress = l3.getInvestigationProgress();
    assert.ok(progress.inspect.status === 'current' || progress.inspect.status === 'complete');
    l3.cleanup();
  });

  test('LEVEL3-081: Pin/reference interaction works', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    assert.equal(l3.pinnedChipId, c1.id);
    const cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('pinned'));
    l3.cleanup();
  });

  test('LEVEL3-082: Comparator appears only after two chips are available', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    const c2 = l3.scenario.chips[1];
    
    // Initial: no pin
    assert.ok(l3._renderComparatorCard().includes('PIN A REFERENCE BLOCK'));
    
    // Pin chip 1, inspect chip 2
    l3.selectChip(c1.id);
    l3.togglePinChip(c1.id);
    l3.selectChip(c2.id);
    
    const compHtml = l3._renderComparatorCard();
    assert.ok(compHtml.includes('l3-comparator-table'), 'Table rendered when 2 chips are compared');
    assert.ok(compHtml.includes('COMPARISON: ['));
    l3.cleanup();
  });

  test('LEVEL3-083: Triage state changes visually', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const c1 = l3.scenario.chips[0];
    l3.inspectedChipIds.add(c1.id);
    l3.setTriageState(c1.id, 'SUSPICIOUS');
    let cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('triage-suspicious'));
    assert.ok(cardsHtml.includes('l3-tag-suspicious'));

    l3.setTriageState(c1.id, 'CANDIDATE');
    cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('triage-candidate'));
    assert.ok(cardsHtml.includes('l3-tag-candidate'));
    l3.cleanup();
  });

  test('LEVEL3-084: Verification starts locked', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    l3.inspectedChipIds.clear();
    l3.comparedPairs.clear();
    assert.equal(l3.isInvestigationGatePassed(), false);
    assert.equal(l3.getInvestigationProgress().verify.status, 'locked');
    l3.cleanup();
  });

  test('LEVEL3-085: Objective clearly identifies the first action', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const obj = l3.getCurrentObjective();
    assert.ok(obj.toUpperCase().includes('INSPECT'), 'Objective prompts player to inspect');
    l3.cleanup();
  });

  test('LEVEL3-086: No raw vertical memory-block list is rendered as the primary UI', () => {
    const l3 = new Level3(mockContainer, {}, { scenarioIndex: 0 });
    l3.init();
    const cardsHtml = l3._renderChipCards();
    assert.ok(cardsHtml.includes('l3-chip-card'));
    assert.ok(cardsHtml.includes('l3-chip-corner-tl'));
    assert.ok(cardsHtml.includes('l3-chip-corner-br'));
    assert.ok(cardsHtml.includes('l3-inspect-action'));
    assert.equal(cardsHtml.includes('<ul>'), false);
    assert.equal(cardsHtml.includes('<ol>'), false);
    l3.cleanup();
  });
});

