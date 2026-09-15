/**
 * Scenario and Maze Variant Selection Test Suite
 * Tests VAR-001 through VAR-014
 * 
 * Verifies distinction between NEW RUN, RETRY, RESTART, and PAUSE/RESUME.
 */

import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { Level1, LEVEL1_SCENARIOS, clearLevel1ScenarioHistory } from '../js/levels/Level1.js';
import { Level2 } from '../js/levels/Level2.js';
import { LEVEL2_VARIANTS } from '../js/levels/level2Data.js';
import { clearRunHistory, clearTemplateHistory } from '../js/levels/mazeGenerator.js';

describe('Scenario & Variant Selection Tests (VAR-001 -> VAR-014)', () => {
  let gm;
  let mockContainer;

  beforeEach(() => {
    gameState.reset();
    clearLevel1ScenarioHistory();
    clearRunHistory();
    clearTemplateHistory();
    mockContainer = {
      innerHTML: '',
      appendChild: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
    gm = new GameManager();
  });

  afterEach(() => {
    if (gm && gm.timer) gm.timer.stop();
    if (gm) gm._stopElapsedTracking();
    if (gm && gm.levelManager) gm.levelManager.cleanupLevel();
  });

  test('VAR-001: Two consecutive NEW runs can select different Level 1 scenarios', () => {
    const l1Run1 = new Level1(mockContainer, {});
    l1Run1.init();
    const scenario1 = l1Run1.scenario.id;

    const l1Run2 = new Level1(mockContainer, {});
    l1Run2.init();
    const scenario2 = l1Run2.scenario.id;

    assert.notEqual(scenario1, scenario2, 'Consecutive new Level 1 runs should not repeat the same scenario');
  });

  test('VAR-002: New Level 1 run does not always select scenario 1', () => {
    const scenarioSet = new Set();
    for (let i = 0; i < 20; i++) {
      const l1 = new Level1(mockContainer, {});
      l1.init();
      scenarioSet.add(l1.scenario.id);
    }
    assert.ok(scenarioSet.size >= 3, `Expected at least 3 distinct scenarios across 20 runs, got ${scenarioSet.size}`);
  });

  test('VAR-003: Immediate scenario repetition is prevented where possible', () => {
    const chosenScenarios = [];
    for (let i = 0; i < 5; i++) {
      const l1 = new Level1(mockContainer, {});
      l1.init();
      chosenScenarios.push(l1.scenario.id);
    }
    // Check that no two adjacent runs have identical scenario
    for (let i = 1; i < chosenScenarios.length; i++) {
      assert.notEqual(
        chosenScenarios[i],
        chosenScenarios[i - 1],
        `Run ${i} (${chosenScenarios[i]}) should not be identical to Run ${i-1} (${chosenScenarios[i-1]})`
      );
    }
  });

  test('VAR-004: Level 1 RETRY preserves the exact same scenario', () => {
    gm.startGame('TEST_AGENT');
    const initialScenario = gm.levelManager.currentLevelInstance.scenario;
    assert.ok(initialScenario, 'Level 1 must have an active scenario');

    // Simulate failure and retry
    gm.retryCurrentLevel();
    const retriedScenario = gm.levelManager.currentLevelInstance.scenario;

    assert.equal(
      retriedScenario.id,
      initialScenario.id,
      'Retry must preserve the exact same Level 1 scenario'
    );
    assert.equal(
      retriedScenario.expectedAnswer,
      initialScenario.expectedAnswer,
      'Retry must preserve the exact expected answer'
    );
  });

  test('VAR-005: Game RESTART clears previous scenario selection and creates fresh run', () => {
    gm.startGame('TEST_AGENT');
    const run1Id = gameState.state.runId;
    assert.ok(run1Id, 'Initial game must have a valid runId');

    // Restart the game
    gm.restartGame();
    const run2Id = gameState.state.runId;
    assert.ok(run2Id, 'Restarted game must have a valid runId');
    assert.notEqual(run1Id, run2Id, 'Restarting game must generate a new runId');
    assert.equal(gameState.state.lives, 3, 'Restarting game must restore 3 lives');
    assert.equal(gameState.state.currentLevel, 1, 'Restarting game must return to Level 1');
  });

  test('VAR-006: Explicit developer scenario override works', () => {
    const l1Explicit = new Level1(mockContainer, {}, { scenarioIndex: 2 });
    l1Explicit.init();
    assert.equal(l1Explicit.scenario.id, LEVEL1_SCENARIOS[2].id);

    const l1ById = new Level1(mockContainer, {}, { scenarioId: 'scenario_04_delta' });
    l1ById.init();
    assert.equal(l1ById.scenario.id, 'scenario_04_delta');
  });

  test('VAR-007: Two consecutive NEW Level 2 runs can produce different seeds', () => {
    const l2Run1 = new Level2(mockContainer, {});
    const l2Run2 = new Level2(mockContainer, {});

    assert.notEqual(l2Run1.seedHex, l2Run2.seedHex, 'Two consecutive Level 2 runs should have distinct seeds');
  });

  test('VAR-008: Two consecutive NEW Level 2 runs can produce meaningfully different maze layouts', () => {
    const l2Run1 = new Level2(mockContainer, {});
    const l2Run2 = new Level2(mockContainer, {});

    const isDifferentTemplate = l2Run1.variant.id !== l2Run2.variant.id;
    const isDifferentGrid = JSON.stringify(l2Run1.grid) !== JSON.stringify(l2Run2.grid);

    assert.ok(isDifferentTemplate || isDifferentGrid, 'Consecutive Level 2 runs must produce different layouts');
  });

  test('VAR-009: Level 2 RETRY preserves exact same seed', () => {
    gm.startDevLevel(2);
    const initialSeed = gm.levelManager.currentLevelInstance.seedHex;
    assert.ok(initialSeed, 'Level 2 must have an active seedHex');

    gm.retryCurrentLevel();
    const retriedSeed = gm.levelManager.currentLevelInstance.seedHex;

    assert.equal(retriedSeed, initialSeed, 'Level 2 retry must retain exact same seedHex');
  });

  test('VAR-010: Level 2 RETRY preserves exact same maze variant', () => {
    gm.startDevLevel(2);
    const initialVariant = gm.levelManager.currentLevelInstance.variant;
    const initialGridJson = JSON.stringify(initialVariant.grid);

    gm.retryCurrentLevel();
    const retriedVariant = gm.levelManager.currentLevelInstance.variant;
    const retriedGridJson = JSON.stringify(retriedVariant.grid);

    assert.equal(retriedVariant.id, initialVariant.id, 'Retry must retain exact base template id');
    assert.equal(retriedGridJson, initialGridJson, 'Retry must retain exact wall matrix');
    assert.equal(retriedVariant.seedHex, initialVariant.seedHex, 'Retry must retain exact seed');
  });

  test('VAR-011: GAME RESTART creates a new Level 2 run identity', () => {
    gm.startDevLevel(2);
    const run1Id = gameState.state.runId;
    assert.ok(run1Id, 'Dev run should have runId');

    gm.restartGame();
    const run2Id = gameState.state.runId;
    assert.notEqual(run1Id, run2Id, 'Restart must generate a new runId');
  });

  test('VAR-012: New Level 2 run does not always use variant index 0', () => {
    const templateIds = new Set();
    for (let i = 0; i < 20; i++) {
      const l2 = new Level2(mockContainer, {});
      templateIds.add(l2.variant.id);
    }
    assert.ok(templateIds.size >= 3, `Expected at least 3 distinct base templates across 20 runs, got ${templateIds.size}`);
  });

  test('VAR-013: Explicit developer seed reproduces exact maze', () => {
    const testSeed = 'B82C';
    const l2A = new Level2(mockContainer, {}, { seed: testSeed });
    const l2B = new Level2(mockContainer, {}, { seed: testSeed });

    assert.equal(l2A.seedHex, l2B.seedHex);
    assert.equal(JSON.stringify(l2A.grid), JSON.stringify(l2B.grid));
    assert.equal(JSON.stringify(l2A.variant.hazards), JSON.stringify(l2B.variant.hazards));
  });

  test('VAR-014: Retry does not accidentally regenerate the maze', () => {
    gm.startDevLevel(2, { seed: '99FF' });
    const initialInstance = gm.levelManager.currentLevelInstance;
    const initialGrid = JSON.stringify(initialInstance.grid);
    const initialHazards = JSON.stringify(initialInstance.variant.hazards);

    // Call retry
    gm.retryCurrentLevel();
    const retriedInstance = gm.levelManager.currentLevelInstance;

    assert.equal(JSON.stringify(retriedInstance.grid), initialGrid, 'Grid must not be regenerated on retry');
    assert.equal(JSON.stringify(retriedInstance.variant.hazards), initialHazards, 'Hazards must not be regenerated on retry');
    assert.equal(retriedInstance.seedHex, '99FF', 'Seed must remain 99FF');
  });
});
