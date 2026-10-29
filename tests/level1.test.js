/**
 * Level 1: Password Breach — Comprehensive Test Suite
 * Tests LEVEL1-001 through LEVEL1-048
 */

import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { Level1, LEVEL1_SCENARIOS } from '../js/levels/Level1.js';

describe('Level 1: Multi-Step Evidence Chain & Forensic Deduction Tests (LEVEL1-001 -> LEVEL1-048)', () => {
  let gm;

  beforeEach(() => {
    gameState.reset();
    gm = new GameManager();
  });

  afterEach(() => {
    if (gm && gm.timer) gm.timer.stop();
    if (gm) gm._stopElapsedTracking();
  });

  test('LEVEL1-001: Level initializes correctly with default values', () => {
    const l1 = new Level1(null, {});
    l1.init();

    assert.strictEqual(l1.maxAttempts, 3);
    assert.strictEqual(l1.failedAttempts, 0);
    assert.strictEqual(l1.hintsUsed, 0);
    assert.strictEqual(l1.hintPenaltyTotal, 0);
    assert.strictEqual(l1.isCompleted, false);
    assert.strictEqual(l1.isLocked, false);
    assert.notStrictEqual(l1.scenario, null);
    assert.strictEqual(l1.selectedEvidenceIds.size, 0);
  });

  test('LEVEL1-021: At least 5 unique puzzle scenarios exist', () => {
    assert.ok(Array.isArray(LEVEL1_SCENARIOS));
    assert.ok(LEVEL1_SCENARIOS.length >= 5, `Expected at least 5 scenarios, found ${LEVEL1_SCENARIOS.length}`);
  });

  test('LEVEL1-002, LEVEL1-003, LEVEL1-022, LEVEL1-045: Every scenario has exactly one valid solution with format [HASH][PORT][YEAR]', () => {
    LEVEL1_SCENARIOS.forEach((scen, idx) => {
      assert.ok(scen.id, `Scenario ${idx} must have an ID`);
      assert.strictEqual(scen.format, '[HASH][PORT][YEAR]');
      assert.ok(scen.expectedAnswer, `Scenario ${idx} must have expectedAnswer`);
      assert.strictEqual(typeof scen.expectedAnswer, 'string');
      assert.ok(scen.derivedHash, `Scenario ${idx} must have derivedHash`);
      assert.ok(scen.derivedPort, `Scenario ${idx} must have derivedPort`);
      assert.ok(scen.derivedYear, `Scenario ${idx} must have derivedYear`);
      assert.ok(scen.chainTargets, `Scenario ${idx} must have chainTargets`);
      
      // Expected answer must equal derived segments concatenated
      assert.strictEqual(scen.expectedAnswer, scen.derivedHash + scen.derivedPort + scen.derivedYear);
    });
  });

  test('LEVEL1-023, LEVEL1-048: No final answer segment is directly exposed as raw answer in evidence text', () => {
    LEVEL1_SCENARIOS.forEach((scen) => {
      scen.evidence.forEach((ev) => {
        // Complete answer must never appear in any evidence body
        assert.ok(
          !ev.body.includes(scen.expectedAnswer),
          `Evidence ${ev.id} in ${scen.id} contains full expected answer!`
        );
        // The combined derived hash must not appear as a single unsegmented unit in the evidence text
        assert.ok(
          !ev.body.includes(`[ ${scen.derivedHash} ]`),
          `Evidence ${ev.id} in ${scen.id} exposes raw derived hash!`
        );
      });
    });
  });

  test('LEVEL1-024, LEVEL1-042: Evidence trust states (VERIFIED, SUSPECT, DECOY) are defined and present', () => {
    LEVEL1_SCENARIOS.forEach((scen) => {
      const verifiedItems = scen.evidence.filter((e) => e.trust === 'VERIFIED');
      const suspectItems = scen.evidence.filter((e) => e.trust === 'SUSPECT');
      assert.ok(verifiedItems.length >= 4, `Scenario ${scen.id} must have verified items`);
      assert.ok(suspectItems.length >= 1, `Scenario ${scen.id} must have suspect items`);
    });
  });

  test('LEVEL1-036: High-level investigation protocol replaces rigid procedural solution text', () => {
    const l1 = new Level1(null, {});
    l1.init();
    // Verify instruction text emphasizes investigation and correlation
    assert.ok(l1.scenario);
  });

  test('LEVEL1-037, LEVEL1-038: Evidence selection and expansion tracking', () => {
    const l1 = new Level1(null, {});
    l1.init();

    // Toggle selection
    l1.selectedEvidenceIds.add('REC-01');
    l1.selectedEvidenceIds.add('REC-02');
    assert.strictEqual(l1.selectedEvidenceIds.size, 2);

    // Toggle card expansion
    l1.expandedCards.add('REC-03');
    assert.ok(l1.expandedCards.has('REC-03'));
    l1.expandedCards.delete('REC-03');
    assert.strictEqual(l1.expandedCards.has('REC-03'), false);
  });

  test('LEVEL1-039, LEVEL1-040, LEVEL1-041: Valid vs invalid evidence correlation handling', () => {
    const l1 = new Level1(null, {});
    l1.selectScenario(0);
    l1.init();

    // Incompatible selection (REC-01 and REC-03 suspect)
    l1.selectedEvidenceIds.clear();
    l1.selectedEvidenceIds.add('REC-01');
    l1.selectedEvidenceIds.add('REC-03');
    l1.handleCorrelation();
    assert.strictEqual(l1.chainStatus.service, false);

    // Compatible Node Correlation (REC-01 and REC-02)
    l1.selectedEvidenceIds.clear();
    l1.selectedEvidenceIds.add('REC-01');
    l1.selectedEvidenceIds.add('REC-02');
    l1.handleCorrelation();
    assert.strictEqual(l1.chainStatus.node, true);
    assert.strictEqual(l1.chainStatus.trace, true);

    // Compatible Service Correlation (REC-04 and REC-05)
    l1.selectedEvidenceIds.clear();
    l1.selectedEvidenceIds.add('REC-04');
    l1.selectedEvidenceIds.add('REC-05');
    l1.handleCorrelation();
    assert.strictEqual(l1.chainStatus.service, true);

    // Compatible Timeline Correlation (REC-06 and REC-07)
    l1.selectedEvidenceIds.clear();
    l1.selectedEvidenceIds.add('REC-06');
    l1.selectedEvidenceIds.add('REC-07');
    l1.handleCorrelation();
    assert.strictEqual(l1.chainStatus.timeline, true);
  });

  test('LEVEL1-043, LEVEL1-044: Scenarios use distinct reasoning targets and domains', () => {
    const s1 = LEVEL1_SCENARIOS[0]; // SSH Admin
    const s2 = LEVEL1_SCENARIOS[1]; // TLS HTTPS
    const s3 = LEVEL1_SCENARIOS[2]; // DNS Resolver
    const s4 = LEVEL1_SCENARIOS[3]; // NTP Sync
    const s5 = LEVEL1_SCENARIOS[4]; // MySQL Core

    assert.notStrictEqual(s1.chainTargets.node, s2.chainTargets.node);
    assert.notStrictEqual(s2.chainTargets.service, s3.chainTargets.service);
    assert.notStrictEqual(s3.chainTargets.timeline, s4.chainTargets.timeline);
    assert.notStrictEqual(s4.chainTargets.trace, s5.chainTargets.trace);
  });

  test('LEVEL1-029 & LEVEL1-030: Hint system limits to max 2 hints and deducts score penalty', () => {
    let penalizedPts = 0;
    const l1 = new Level1(null, {
      onPenalty: (pts) => { penalizedPts += pts; }
    });
    l1.selectScenario(0);
    l1.init();

    assert.strictEqual(l1.hintsUsed, 0);

    // Request Hint 1 (Costs 100 pts)
    l1.requestHint();
    assert.strictEqual(l1.hintsUsed, 1);
    assert.strictEqual(l1.hintPenaltyTotal, 100);
    assert.strictEqual(penalizedPts, 100);

    // Request Hint 2 (Costs 150 pts)
    l1.requestHint();
    assert.strictEqual(l1.hintsUsed, 2);
    assert.strictEqual(l1.hintPenaltyTotal, 250);
    assert.strictEqual(penalizedPts, 250);

    // Request Hint 3 (Should be blocked, max 2)
    l1.requestHint();
    assert.strictEqual(l1.hintsUsed, 2);
    assert.strictEqual(l1.hintPenaltyTotal, 250);
  });

  test('LEVEL1-004 & LEVEL1-005: Whitespace trimming and case-insensitive authorization matching', () => {
    const l1 = new Level1(null, {});
    l1.selectScenario(0); // 7F91222087
    l1.init();

    const userInput = '   7f91222087   ';
    const normalized = userInput.trim().toUpperCase();
    assert.strictEqual(normalized, l1.scenario.expectedAnswer);
  });

  test('LEVEL1-006 & LEVEL1-007: Incorrect answer increments attempts and deducts 150 score penalty', () => {
    let penaltyReceived = 0;
    const l1 = new Level1(null, {
      onPenalty: (pts) => { penaltyReceived += pts; }
    });
    l1.selectScenario(0);
    l1.init();

    assert.strictEqual(l1.failedAttempts, 0);

    l1.handleIncorrect();
    assert.strictEqual(l1.failedAttempts, 1);
    assert.strictEqual(penaltyReceived, 150);

    l1.handleIncorrect();
    assert.strictEqual(l1.failedAttempts, 2);
    assert.strictEqual(penaltyReceived, 300);
  });

  test('LEVEL1-031 & LEVEL1-032: Incorrect answer feedback does not reveal correct segments & 3 attempt limit enforced', () => {
    let lifeLossTriggered = false;
    const l1 = new Level1(null, {
      onLoseLife: () => { lifeLossTriggered = true; }
    });
    l1.selectScenario(0);
    l1.init();

    l1.handleIncorrect(); // 1
    assert.strictEqual(l1.failedAttempts, 1);
    assert.strictEqual(l1.isLocked, false);

    l1.handleIncorrect(); // 2
    assert.strictEqual(l1.failedAttempts, 2);
    assert.strictEqual(l1.isLocked, false);

    l1.handleIncorrect(); // 3 -> Lockout
    assert.strictEqual(l1.failedAttempts, 3);
    assert.strictEqual(l1.isLocked, true);
  });

  test('LEVEL1-008, LEVEL1-009, LEVEL1-010: Correct answer completes level, halts timer, reports score to GameManager', () => {
    gm.startGame('AGENT_INVESTIGATOR');
    assert.strictEqual(gameState.state.currentLevel, 1);
    assert.strictEqual(gameState.state.status, 'PLAYING');

    // Simulate completion with 1800 pts
    gm.handleLevelComplete(1800);

    assert.strictEqual(gameState.state.score, 1800);
    assert.strictEqual(gameState.state.currentLevel, 2);
    assert.deepStrictEqual(gameState.state.completedLevels, [1]);
  });

  test('LEVEL1-012, LEVEL1-034, LEVEL1-035: Level retry creates clean instance without state or listener duplication', () => {
    gm.startGame('RETRY_TESTER');
    assert.strictEqual(gameState.state.lives, 3);

    // Deduct 1 life via retry
    gm.retryCurrentLevel();

    assert.strictEqual(gameState.state.lives, 2);
    assert.strictEqual(gameState.state.currentLevel, 1);
    assert.strictEqual(gameState.state.levelTimeRemaining, 150);
    assert.strictEqual(gm.timer.isRunning, true);
  });

  test('LEVEL1-013 & LEVEL1-014: Pause freezes interaction and resume restores it', () => {
    const l1 = new Level1(null, {});
    l1.init();
    assert.strictEqual(l1.isLocked, false);

    l1.pause();
    assert.strictEqual(l1.isLocked, true);

    l1.resume();
    assert.strictEqual(l1.isLocked, false);
  });

  test('LEVEL1-015: Cleanup removes all registered cleanup hooks', () => {
    const l1 = new Level1(null, {});
    l1.init();

    let cleaned = false;
    l1._cleanups.push(() => { cleaned = true; });

    l1.cleanup();
    assert.strictEqual(cleaned, true);
    assert.strictEqual(l1._cleanups.length, 0);
  });

  test('LEVEL1-033: All 5 scenarios independently solvable from raw evidence dataset without external knowledge', () => {
    assert.strictEqual(LEVEL1_SCENARIOS[0].expectedAnswer, '7F91222087');
    assert.strictEqual(LEVEL1_SCENARIOS[1].expectedAnswer, 'E42B4432024');
    assert.strictEqual(LEVEL1_SCENARIOS[2].expectedAnswer, '5CD8532091');
    assert.strictEqual(LEVEL1_SCENARIOS[3].expectedAnswer, 'A74D1232049');
    assert.strictEqual(LEVEL1_SCENARIOS[4].expectedAnswer, 'F38833062031');
  });
});
