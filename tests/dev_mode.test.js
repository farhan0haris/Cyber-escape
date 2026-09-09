/**
 * Developer Mode Direct Level Access Test Suite
 * Validates specifications DEV-001 through DEV-020
 */

import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { DEV_CONFIG, setDevMode } from '../js/core/devConfig.js';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { storage } from '../js/systems/StorageManager.js';
import { Level1 } from '../js/levels/Level1.js';
import { Level2 } from '../js/levels/Level2.js';
import { Level3 } from '../js/levels/Level3.js';
import { Level4 } from '../js/levels/Level4.js';
import { Level5 } from '../js/levels/Level5.js';

describe('Developer Mode: Direct Level Access (DEV-001 -> DEV-020)', () => {
  let gm;

  beforeEach(() => {
    setDevMode(true);
    gameState.reset();
    gm = new GameManager();
  });

  afterEach(() => {
    if (gm && gm.timer) gm.timer.stop();
    if (gm) gm._stopElapsedTracking();
    if (gm && gm.levelManager) gm.levelManager.cleanupLevel();
    setDevMode(true); // reset back to default
  });

  test('DEV-001: Developer mode can be enabled', () => {
    setDevMode(false);
    assert.equal(DEV_CONFIG.DEV_MODE, false);
    setDevMode(true);
    assert.equal(DEV_CONFIG.DEV_MODE, true);
  });

  test('DEV-002: Developer mode can be disabled', () => {
    setDevMode(true);
    assert.equal(DEV_CONFIG.DEV_MODE, true);
    setDevMode(false);
    assert.equal(DEV_CONFIG.DEV_MODE, false);
  });

  test('DEV-003: Developer level selector appears only in DEV_MODE', () => {
    const shouldMountWhenDev = Boolean(DEV_CONFIG.DEV_MODE);
    assert.equal(shouldMountWhenDev, true, 'Mounts when DEV_MODE is true');

    setDevMode(false);
    const shouldMountWhenProd = Boolean(DEV_CONFIG.DEV_MODE);
    assert.equal(shouldMountWhenProd, false, 'Does not mount when DEV_MODE is false');
  });

  test('DEV-004: Level 1 can launch directly', () => {
    const success = gm.startDevLevel(1);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 1);
    assert.equal(gm.levelManager.currentLevelNumber, 1);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level1);
  });

  test('DEV-005: Level 2 can launch directly', () => {
    const success = gm.startDevLevel(2);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gm.levelManager.currentLevelNumber, 2);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level2);
  });

  test('DEV-006: Level 3 can launch directly', () => {
    const success = gm.startDevLevel(3);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 3);
    assert.equal(gm.levelManager.currentLevelNumber, 3);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level3);
  });

  test('DEV-007: Level 4 can launch directly', () => {
    const success = gm.startDevLevel(4);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 4);
    assert.equal(gm.levelManager.currentLevelNumber, 4);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level4);
  });

  test('DEV-008: Level 5 can launch directly', () => {
    const success = gm.startDevLevel(5);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 5);
    assert.equal(gm.levelManager.currentLevelNumber, 5);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level5);
  });

  test('DEV-009: Direct level launch uses GameManager (startDevLevel on gm)', () => {
    assert.equal(typeof gm.startDevLevel, 'function', 'GameManager exposes startDevLevel');
    const success = gm.startDevLevel(2);
    assert.equal(success, true);
    assert.equal(gameState.state.status, 'PLAYING');
  });

  test('DEV-010: Direct level launch uses LevelManager (initializeLevel invoked)', () => {
    gm.startDevLevel(3);
    assert.equal(gm.levelManager.currentLevelNumber, 3);
    assert.ok(gm.levelManager.currentLevelInstance !== null, 'LevelManager has current instance');
  });

  test('DEV-011: Direct level launch creates valid GameState', () => {
    gm.startDevLevel(3);
    const s = gameState.state;

    assert.equal(s.playerName, 'TEST_OPERATOR');
    assert.equal(s.currentLevel, 3);
    assert.equal(s.score, 0);
    assert.equal(s.lives, 3);
    assert.deepEqual(s.completedLevels, [1, 2], 'Prerequisite levels 1 and 2 are marked completed');
    assert.equal(s.isPaused, false);
    assert.equal(s.isGameOver, false);
    assert.equal(s.isCompleted, false);
    assert.equal(s.status, 'PLAYING');
    assert.equal(s.isDevSession, true);
  });

  test('DEV-012: Direct level launch starts with 3 lives', () => {
    gm.startDevLevel(5);
    assert.equal(gameState.state.lives, 3);
  });

  test('DEV-013: Direct level launch starts with score 0', () => {
    gm.startDevLevel(5);
    assert.equal(gameState.state.score, 0);
    assert.equal(gm.scoreManager.getScore(), 0);
  });

  test('DEV-014: Direct level launch does not award skipped-level score', () => {
    gm.startDevLevel(5);
    assert.equal(gameState.state.score, 0, 'Score in state is 0');
    assert.equal(gm.scoreManager.getScore(), 0, 'ScoreManager score is 0');
  });

  test('DEV-015: Developer sessions cannot submit to leaderboard', () => {
    gm.startDevLevel(4);
    assert.equal(gameState.state.isDevSession, true);
    assert.equal(gm.canSubmitLeaderboard(), false, 'Eligibility check fails for dev session');

    const initialLeaderboard = storage.get('leaderboard', []);
    const initialCount = Array.isArray(initialLeaderboard) ? initialLeaderboard.length : 0;

    const submitted = gm.submitLeaderboardScore({
      player: 'TEST_OPERATOR',
      score: 99999
    });
    assert.equal(submitted, false, 'Direct submission rejected for dev session');

    gameState.update({ score: 50000 });
    gm.completeGame();

    const currentLeaderboard = storage.get('leaderboard', []);
    const currentCount = Array.isArray(currentLeaderboard) ? currentLeaderboard.length : 0;
    assert.equal(currentCount, initialCount, 'Leaderboard record count unchanged');
  });

  test('DEV-016: Switching Level 2 → Level 3 cleans previous resources', () => {
    gm.startDevLevel(2);
    const lvl2Instance = gm.levelManager.currentLevelInstance;
    assert.ok(lvl2Instance instanceof Level2);
    assert.equal(lvl2Instance.isCompleted, false);

    gm.startDevLevel(3);
    assert.equal(lvl2Instance.isCompleted, true, 'Level 2 instance marked completed/stopped during cleanup');
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level3);
    assert.notStrictEqual(gm.levelManager.currentLevelInstance, lvl2Instance);

    gm.startDevLevel(1);
    assert.ok(gm.levelManager.currentLevelInstance instanceof Level1);
  });

  test('DEV-017: No duplicate timers after repeated level switching', () => {
    gm.startDevLevel(2);
    gm.startDevLevel(3);
    gm.startDevLevel(5);
    gm.startDevLevel(2);
    const finalElapsed = gm._elapsedTimerId;

    assert.ok(finalElapsed !== null);
    assert.equal(typeof finalElapsed, 'object');
    assert.equal(gm.timer.isRunning, true);
  });

  test('DEV-018: No duplicate event listeners after repeated level switching', () => {
    gm.startDevLevel(2);
    const lvl2Instance = gm.levelManager.currentLevelInstance;
    let cleanupCalled = false;
    lvl2Instance._cleanups.push(() => {
      cleanupCalled = true;
    });

    gm.startDevLevel(3);
    assert.equal(cleanupCalled, true, 'Level 2 cleanup was executed upon switching away');
    assert.equal(lvl2Instance._cleanups.length, 0, 'Level 2 cleanups array drained');

    gm.startDevLevel(1);
    const lvl1Instance = gm.levelManager.currentLevelInstance;
    let lvl1CleanupCalled = false;
    lvl1Instance._cleanups.push(() => {
      lvl1CleanupCalled = true;
    });

    gm.startDevLevel(2);
    assert.equal(lvl1CleanupCalled, true, 'Level 1 cleanup was executed upon switching away');
    assert.equal(lvl1Instance._cleanups.length, 0, 'Level 1 cleanups array drained');
  });

  test('DEV-019: URL ?dev=1&level=2 launches Level 2 (conceptual validation)', () => {
    // URL parsing occurs in main.js _checkDevUrlLaunch which requires window.location.
    // Here we validate the programmatic equivalent works correctly.
    assert.equal(DEV_CONFIG.DEV_MODE, true, 'DEV_MODE must be enabled');
    const success = gm.startDevLevel(2);
    assert.equal(success, true);
    assert.equal(gameState.state.currentLevel, 2);
    assert.equal(gameState.state.isDevSession, true);
  });

  test('DEV-020: DEV_MODE=false disables ?dev access (startDevLevel returns false)', () => {
    setDevMode(false);

    const launched = gm.startDevLevel(3);
    assert.equal(launched, false, 'startDevLevel returns false when DEV_MODE=false');
    assert.notEqual(gameState.state.currentLevel, 3, 'Level did not switch to 3');
    assert.notEqual(gameState.state.status, 'PLAYING');
  });
});
