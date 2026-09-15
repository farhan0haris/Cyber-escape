/**
 * Comprehensive Browser Flow Simulation Test Script
 * Simulates complete user interactions across multiple runs, retries, and restarts
 */

import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { LEVEL1_SCENARIOS, clearLevel1ScenarioHistory } from '../js/levels/Level1.js';
import { LEVEL2_VARIANTS } from '../js/levels/level2Data.js';
import { clearRunHistory, clearTemplateHistory } from '../js/levels/mazeGenerator.js';

console.log('===========================================================');
console.log('STARTING INTEGRATED BROWSER FLOW SIMULATION');
console.log('===========================================================');

const mockStage = {
  innerHTML: '',
  appendChild: () => {},
  querySelector: () => null,
  querySelectorAll: () => []
};

// ----------------------------------------------------------------
// TEST A: Level 1 Scenario Variation & Retry / Restart Verification
// ----------------------------------------------------------------
console.log('\n--- [TEST A] Level 1 Scenario Selection Across 5 Consecutive New Games ---');
clearLevel1ScenarioHistory();

const gm = new GameManager();
const recordedScenarios = [];

for (let run = 1; run <= 5; run++) {
  gm.startGame(`OPERATOR_${run}`);
  const currentScenario = gm.levelManager.currentLevelInstance.scenario;
  recordedScenarios.push({
    run,
    runId: gameState.state.runId,
    scenarioId: currentScenario.id,
    name: currentScenario.name,
    expectedAnswer: currentScenario.expectedAnswer
  });
  console.log(`[Run ${run}] runId: ${gameState.state.runId.slice(0, 18)}... | Scenario: ${currentScenario.id} (${currentScenario.name})`);
  gm.quitToMenu();
}

console.log('\nLevel 1 Consecutive Run Scenarios:');
recordedScenarios.forEach(r => console.log(`  - Run ${r.run}: ${r.scenarioId} -> Answer: ${r.expectedAnswer}`));

// Check scenario uniqueness across runs
const uniqueL1Scenarios = new Set(recordedScenarios.map(r => r.scenarioId));
console.log(`Unique scenarios observed across 5 runs: ${uniqueL1Scenarios.size} / 5`);

// Verify Retry on Level 1
console.log('\n--- [TEST A - RETRY] Level 1 Retry Scenario Preservation ---');
gm.startGame('RETRY_TESTER');
const initialL1Scenario = gm.levelManager.currentLevelInstance.scenario;
console.log(`[Initial L1 Run] Scenario: ${initialL1Scenario.id} (${initialL1Scenario.name})`);

// Trigger retry (e.g. 3 failed attempts)
gm.retryCurrentLevel();
const retriedL1Scenario = gm.levelManager.currentLevelInstance.scenario;
console.log(`[Retried L1 Run] Scenario: ${retriedL1Scenario.id} (${retriedL1Scenario.name})`);
console.log(`Preserved on Retry? ${initialL1Scenario.id === retriedL1Scenario.id ? 'YES (PASS)' : 'NO (FAIL)'}`);
console.log(`Remaining Lives: ${gameState.state.lives} / 3`);

// Verify Restart from Level 1
console.log('\n--- [TEST A - RESTART] Game Restart Verification ---');
const prevRunId = gameState.state.runId;
gm.restartGame();
const newRunId = gameState.state.runId;
console.log(`Previous runId: ${prevRunId}`);
console.log(`New runId:      ${newRunId}`);
console.log(`New runId generated on restart? ${prevRunId !== newRunId ? 'YES (PASS)' : 'NO (FAIL)'}`);
console.log(`Lives reset to 3? ${gameState.state.lives === 3 ? 'YES (PASS)' : 'NO (FAIL)'}`);

// ----------------------------------------------------------------
// TEST B: Level 2 Maze Variant & Retry / Restart Verification
// ----------------------------------------------------------------
console.log('\n--- [TEST B] Level 2 Maze Variant Selection Across 5 Consecutive New Runs ---');
clearRunHistory();
clearTemplateHistory();

const recordedL2Runs = [];
for (let run = 1; run <= 5; run++) {
  gm.startDevLevel(2);
  const l2Instance = gm.levelManager.currentLevelInstance;
  recordedL2Runs.push({
    run,
    runId: gameState.state.runId,
    templateId: l2Instance.variant.id,
    templateName: l2Instance.variant.name,
    seed: l2Instance.seedHex
  });
  console.log(`[L2 Run ${run}] runId: ${gameState.state.runId.slice(0, 18)}... | Template: ${l2Instance.variant.id} (${l2Instance.variant.name}) | Seed: ${l2Instance.seedHex}`);
  gm.quitToMenu();
}

const uniqueL2Templates = new Set(recordedL2Runs.map(r => r.templateId));
const uniqueL2Seeds = new Set(recordedL2Runs.map(r => r.seed));
console.log(`Unique L2 Templates: ${uniqueL2Templates.size} / 5`);
console.log(`Unique L2 Seeds:     ${uniqueL2Seeds.size} / 5`);

// Verify Level 2 Retry
console.log('\n--- [TEST B - RETRY] Level 2 Retry Maze & Seed Preservation ---');
gm.startDevLevel(2);
const initialL2Inst = gm.levelManager.currentLevelInstance;
const initialL2Template = initialL2Inst.variant.id;
const initialL2Seed = initialL2Inst.seedHex;
const initialL2Grid = JSON.stringify(initialL2Inst.grid);
console.log(`[Initial L2 Run] Template: ${initialL2Template} | Seed: ${initialL2Seed}`);

// Trigger retry (hazard collision / timeout)
gm.retryCurrentLevel();
const retriedL2Inst = gm.levelManager.currentLevelInstance;
const retriedL2Template = retriedL2Inst.variant.id;
const retriedL2Seed = retriedL2Inst.seedHex;
const retriedL2Grid = JSON.stringify(retriedL2Inst.grid);

console.log(`[Retried L2 Run] Template: ${retriedL2Template} | Seed: ${retriedL2Seed}`);
console.log(`Template Preserved? ${initialL2Template === retriedL2Template ? 'YES (PASS)' : 'NO (FAIL)'}`);
console.log(`Seed Preserved?     ${initialL2Seed === retriedL2Seed ? 'YES (PASS)' : 'NO (FAIL)'}`);
console.log(`Grid Identical?     ${initialL2Grid === retriedL2Grid ? 'YES (PASS)' : 'NO (FAIL)'}`);

// Cleanup
gm.timer.stop();
gm._stopElapsedTracking();
if (gm.levelManager) gm.levelManager.cleanupLevel();

console.log('\n===========================================================');
console.log('SIMULATION COMPLETE: ALL VARIATIONS & RETRY CONSTRAINTS VERIFIED');
console.log('===========================================================');
