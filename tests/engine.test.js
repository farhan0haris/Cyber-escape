/**
 * Cyber Escape - Phase 3 Core Game Engine Test Suite
 * Validates GameState, GameManager, LevelManager, Timer, ScoreManager, and Lifecycle
 */

import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { gameState } from '../js/core/state.js';
import { GameManager } from '../js/core/GameManager.js';
import { ScoreManager } from '../js/systems/ScoreManager.js';
import { Timer } from '../js/systems/Timer.js';
import { getLevelMetadata } from '../js/core/levelMetadata.js';
import { storage } from '../js/systems/StorageManager.js';

describe('Phase 3 Core Engine & Lifecycle Tests', () => {
  let gm;

  beforeEach(() => {
    gameState.reset();
    gm = new GameManager();
  });

  afterEach(() => {
    if (gm && gm.timer) gm.timer.stop();
    if (gm) gm._stopElapsedTracking();
  });

  test('GAME-001: Start game state reset', () => {
    // Set dirty state first
    gameState.update({ score: 9999, lives: 1, currentLevel: 4, totalTimeElapsed: 500 });
    
    gm.startGame('OPERATOR_X');
    const s = gameState.state;

    assert.strictEqual(s.playerName, 'OPERATOR_X');
    assert.strictEqual(s.score, 0);
    assert.strictEqual(s.lives, 3);
    assert.strictEqual(s.currentLevel, 1);
    assert.strictEqual(s.totalTimeElapsed, 0);
    assert.strictEqual(s.status, 'PLAYING');
    assert.strictEqual(s.isPaused, false);
    assert.strictEqual(s.isGameOver, false);
    assert.strictEqual(s.isCompleted, false);
  });

  test('GAME-002: HUD synchronization via GameState subscriptions', () => {
    let notifiedState = null;
    const unsub = gameState.subscribe((s) => {
      notifiedState = s;
    });

    gm.startGame('AGENT_TEST');
    assert.strictEqual(notifiedState.playerName, 'AGENT_TEST');
    assert.strictEqual(notifiedState.lives, 3);

    gameState.update({ score: 250 });
    assert.strictEqual(notifiedState.score, 250);

    unsub();
  });

  test('GAME-003: Level initialization uses correct metadata', () => {
    const metaL1 = getLevelMetadata(1);
    assert.strictEqual(metaL1.number, 1);
    assert.strictEqual(metaL1.name, 'FIREWALL GATE');
    assert.strictEqual(metaL1.durationSeconds, 150);

    const metaL5 = getLevelMetadata(5);
    assert.strictEqual(metaL5.name, 'ROOT KERNEL');
    assert.strictEqual(metaL5.durationSeconds, 180);

    gm.startGame('OPERATOR');
    assert.strictEqual(gameState.state.levelTimeRemaining, 150);
  });

  test('GAME-004 & GAME-005: Pause freezes timer and Resume restarts timer', async () => {
    gm.startGame('TEST_TIMER');
    assert.strictEqual(gameState.state.status, 'PLAYING');
    assert.strictEqual(gameState.state.isPaused, false);

    gm.pauseGame();
    assert.strictEqual(gameState.state.status, 'PAUSED');
    assert.strictEqual(gameState.state.isPaused, true);
    assert.strictEqual(gm.timer.isPaused, true);

    gm.resumeGame();
    assert.strictEqual(gameState.state.status, 'PLAYING');
    assert.strictEqual(gameState.state.isPaused, false);
    assert.strictEqual(gm.timer.isPaused, false);
  });

  test('GAME-006 & GAME-007: Retry deducts one life and preserves score', () => {
    gm.startGame('RETRY_TEST');
    // Simulate scoring points in the level
    gm.scoreManager.addScore(850);
    gameState.update({ score: 850 });

    assert.strictEqual(gameState.state.lives, 3);
    assert.strictEqual(gameState.state.score, 850);

    // Trigger retry
    gm.retryCurrentLevel();

    assert.strictEqual(gameState.state.lives, 2, 'Life must decrement by 1');
    assert.strictEqual(gameState.state.score, 850, 'Score must be preserved');
    assert.strictEqual(gameState.state.currentLevel, 1, 'Level must stay on same sector');
    assert.strictEqual(gameState.state.levelTimeRemaining, 150, 'Timer must reset to full level duration');
  });

  test('GAME-008, GAME-009, GAME-010: Restart resets score, lives, and level', () => {
    gm.startGame('RESTART_TEST');
    gm.scoreManager.addScore(1200);
    gameState.update({ score: 1200, lives: 1, currentLevel: 3 });

    // Restart game
    gm.restartGame();

    assert.strictEqual(gameState.state.score, 0, 'Score must reset to 0');
    assert.strictEqual(gameState.state.lives, 3, 'Lives must reset to 3');
    assert.strictEqual(gameState.state.currentLevel, 1, 'Current level must reset to 1');
  });

  test('GAME-011: Quit cleans game state and returns to MENU', () => {
    gm.startGame('QUIT_TEST');
    assert.strictEqual(gameState.state.status, 'PLAYING');

    gm.quitToMenu();

    assert.strictEqual(gameState.state.status, 'MENU');
    assert.strictEqual(gameState.state.isPaused, false);
    assert.strictEqual(gameState.state.isGameOver, false);
    assert.strictEqual(gm.timer.isRunning, false);
  });

  test('GAME-012: Game Over triggers at zero lives', () => {
    gm.startGame('GAMEOVER_TEST');
    assert.strictEqual(gameState.state.lives, 3);

    gm.retryCurrentLevel(); // Lives -> 2
    assert.strictEqual(gameState.state.lives, 2);

    gm.retryCurrentLevel(); // Lives -> 1
    assert.strictEqual(gameState.state.lives, 1);

    gm.retryCurrentLevel(); // Lives -> 0 -> Triggers Game Over
    assert.strictEqual(gameState.state.lives, 0);
    assert.strictEqual(gameState.state.status, 'GAME_OVER');
    assert.strictEqual(gameState.state.isGameOver, true);
  });

  test('GAME-013: Timer timeout deducts exactly one life', () => {
    gm.startGame('TIMEOUT_TEST');
    assert.strictEqual(gameState.state.lives, 3);

    // Call handleTimerExpired
    gm.handleTimerExpired();

    assert.strictEqual(gameState.state.lives, 2);
    assert.strictEqual(gameState.state.status, 'PLAYING');
  });

  test('GAME-014: No duplicate timers after retry', () => {
    gm.startGame('TIMER_DUP_TEST');
    const firstTimerInstance = gm.timer;

    gm.retryCurrentLevel();
    assert.strictEqual(gm.timer, firstTimerInstance, 'Single timer instance must be reused');
    assert.strictEqual(gm.timer.isRunning, true);

    gm.retryCurrentLevel();
    assert.strictEqual(gm.timer.isRunning, true);
  });

  test('GAME-015: No duplicate listeners after retry / state reset', () => {
    const initialListenersCount = gameState._listeners.size;

    gm.retryCurrentLevel();
    assert.strictEqual(gameState._listeners.size, initialListenersCount, 'Listener count must not increase');

    gm.restartGame();
    assert.strictEqual(gameState._listeners.size, initialListenersCount, 'Listener count must not duplicate on restart');
  });

  test('TC-001 & TC-002: Player Name validation & storage persistence', () => {
    // Valid name
    gm.startGame('  CYPHER_99  ');
    assert.strictEqual(gameState.state.playerName, 'CYPHER_99');
    assert.strictEqual(storage.get('player'), 'CYPHER_99');

    // Storage resilience
    storage.set('cyberEscape.leaderboard', '{"corrupt": true');
    assert.doesNotThrow(() => {
      storage.get('cyberEscape.leaderboard', []);
    });
  });

  test('Score floor validation: Score never falls below 0', () => {
    const sm = new ScoreManager(100);
    sm.deductScore(250);
    assert.strictEqual(sm.getScore(), 0, 'Score floor must be 0');
  });

  test('GAME-016: Quit to Menu cleanly halts timers and transitions to MENU status', () => {
    gm.startGame('QUIT_TESTER');
    assert.strictEqual(gameState.state.status, 'PLAYING');
    assert.strictEqual(gm.timer.isRunning, true);

    gm.pauseGame();
    assert.strictEqual(gameState.state.status, 'PAUSED');

    gm.quitToMenu();
    assert.strictEqual(gameState.state.status, 'MENU');
    assert.strictEqual(gameState.state.isPaused, false);
    assert.strictEqual(gameState.state.isGameOver, false);
    assert.strictEqual(gameState.state.isCompleted, false);
    assert.strictEqual(gm.timer.isRunning, false);
  });

  test('GAME-017: Quit Mission does NOT submit or pollute leaderboard', () => {
    storage.set('leaderboard', []);
    gm.startGame('UNFINISHED_RUN');
    gameState.update({ score: 1800 });

    gm.quitToMenu();
    const board = storage.get('leaderboard', []);
    assert.strictEqual(board.length, 0, 'Leaderboard must not contain abandoned/quit runs');
  });

  test('GAME-018: New Run after Quit creates fresh run identity and clean state', () => {
    gm.startGame('FIRST_RUN');
    const firstRunId = gameState.state.runId;
    gameState.update({ score: 500, lives: 2 });

    gm.quitToMenu();

    gm.startGame('SECOND_RUN');
    const secondRunId = gameState.state.runId;

    assert.notStrictEqual(firstRunId, secondRunId, 'New Run must generate fresh runId');
    assert.strictEqual(gameState.state.playerName, 'SECOND_RUN');
    assert.strictEqual(gameState.state.score, 0);
    assert.strictEqual(gameState.state.lives, 3);
    assert.strictEqual(gameState.state.currentLevel, 1);
    assert.strictEqual(gameState.state.status, 'PLAYING');
  });

  test('GAME-019: Quit during late level (e.g. Level 4) resets state cleanly', () => {
    gm.startDevLevel(4);
    assert.strictEqual(gameState.state.currentLevel, 4);
    assert.strictEqual(gameState.state.status, 'PLAYING');

    gm.pauseGame();
    gm.quitToMenu();

    assert.strictEqual(gameState.state.status, 'MENU');
    assert.strictEqual(gameState.state.score, 0);
    assert.strictEqual(gm.timer.isRunning, false);
  });

  test('GAME-020: Player-facing pause modal does NOT contain a RESTART button in index.html', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const htmlPath = path.join(import.meta.dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Extract the pause modal section (modal-pause)
    const pauseModalMatch = html.match(/id="modal-pause"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    assert.ok(pauseModalMatch, 'Pause modal must exist in index.html');
    const pauseModalHtml = pauseModalMatch[0];

    // Must NOT contain btn-pause-restart or any RESTART button
    assert.ok(!pauseModalHtml.includes('btn-pause-restart'), 'Pause modal must NOT contain btn-pause-restart');
    assert.ok(!pauseModalHtml.includes('>RESTART MISSION<'), 'Pause modal must NOT contain RESTART MISSION text');
    assert.ok(!pauseModalHtml.includes('>RESTART<'), 'Pause modal must NOT contain a RESTART button');

    // Must contain RESUME EXECUTION and QUIT MISSION
    assert.ok(pauseModalHtml.includes('btn-resume-game'), 'Pause modal must contain RESUME EXECUTION button');
    assert.ok(pauseModalHtml.includes('btn-quit-menu'), 'Pause modal must contain QUIT MISSION button');
  });

  test('GAME-021: Player-facing HUD does NOT contain a RESTART button in index.html', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const htmlPath = path.join(import.meta.dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Extract the HUD controls section
    const hudControlsMatch = html.match(/class="hud-controls"[\s\S]*?<\/div>/);
    assert.ok(hudControlsMatch, 'HUD controls section must exist in index.html');
    const hudControlsHtml = hudControlsMatch[0];

    // Must NOT contain btn-restart-game
    assert.ok(!hudControlsHtml.includes('btn-restart-game'), 'HUD must NOT contain btn-restart-game');
    assert.ok(!hudControlsHtml.includes('>RESTART<'), 'HUD must NOT contain a RESTART button');

    // Must still contain the PAUSE button
    assert.ok(hudControlsHtml.includes('btn-pause-game'), 'HUD must contain PAUSE button');
  });

  test('GAME-022: Quit confirmation modal exists with correct structure', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const htmlPath = path.join(import.meta.dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Quit confirmation modal must exist
    assert.ok(html.includes('id="modal-quit-confirm"'), 'Quit confirmation modal must exist');
    assert.ok(html.includes('ABORT CURRENT MISSION?'), 'Quit confirmation must ask ABORT CURRENT MISSION?');
    assert.ok(html.includes('btn-quit-cancel'), 'Quit confirmation must have CANCEL button');
    assert.ok(html.includes('btn-quit-confirm'), 'Quit confirmation must have QUIT MISSION confirm button');
  });

  test('GAME-023: Internal restartGame() remains functional for developer/testing use', () => {
    gm.startGame('DEV_RESTART_TEST');
    gameState.update({ score: 1500, lives: 1, currentLevel: 3 });

    // restartGame() must exist and function correctly
    assert.strictEqual(typeof gm.restartGame, 'function', 'restartGame() must exist on GameManager');
    gm.restartGame();

    // After restart: score=0, lives=3, level=1, status=PLAYING
    assert.strictEqual(gameState.state.score, 0, 'Score must reset to 0 after restart');
    assert.strictEqual(gameState.state.lives, 3, 'Lives must reset to 3 after restart');
    assert.strictEqual(gameState.state.currentLevel, 1, 'Level must reset to 1 after restart');
    assert.strictEqual(gameState.state.status, 'PLAYING', 'Status must be PLAYING after restart');
  });

  test('GAME-024: InputManager does NOT map R key to RESTART action', async () => {
    const { InputManager } = await import('../js/systems/InputManager.js');
    const inputMgr = new InputManager();

    // Collect actions emitted for 'R' key
    let emittedAction = null;
    inputMgr.on('RESTART', () => { emittedAction = 'RESTART'; });

    // Simulate R keydown via internal handler
    inputMgr._handleKeyDown({ key: 'R', preventDefault: () => {}, target: { tagName: 'DIV' } });
    assert.strictEqual(emittedAction, null, 'Pressing R must NOT emit RESTART action');
    inputMgr.cleanup();
  });

  test('GAME-025: Direct Pause Menu buttons verification', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const htmlPath = path.join(import.meta.dirname, '..', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf-8');

    const pauseModalMatch = html.match(/id="modal-pause"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    assert.ok(pauseModalMatch, 'modal-pause must exist in index.html');
    const pauseHtml = pauseModalMatch[0];

    // Find all button tags inside modal-pause
    const buttonMatches = pauseHtml.match(/<button[^>]*>([\s\S]*?)<\/button>/g) || [];
    assert.strictEqual(buttonMatches.length, 2, 'Pause modal must contain EXACTLY 2 buttons');

    // Button 1: RESUME EXECUTION
    assert.ok(buttonMatches[0].includes('btn-resume-game'), 'Button 1 must be #btn-resume-game');
    assert.ok(buttonMatches[0].includes('RESUME EXECUTION'), 'Button 1 text must be RESUME EXECUTION');

    // Button 2: QUIT MISSION
    assert.ok(buttonMatches[1].includes('btn-quit-menu'), 'Button 2 must be #btn-quit-menu');
    assert.ok(buttonMatches[1].includes('QUIT MISSION'), 'Button 2 text must be QUIT MISSION');
  });

  test('GAME-026: Direct Quit and Cancel flow simulation', () => {
    gm.startGame('QUIT_FLOW_TESTER');
    gameState.update({ score: 950, currentLevel: 2 });
    assert.strictEqual(gameState.state.status, 'PLAYING');

    // Pause game
    gm.pauseGame();
    assert.strictEqual(gameState.state.isPaused, true);

    // Quit to menu
    gm.quitToMenu();
    assert.strictEqual(gameState.state.status, 'MENU');
    assert.strictEqual(gameState.state.score, 0);
    assert.strictEqual(gameState.state.isPaused, false);
    assert.strictEqual(gm.timer.isRunning, false);
  });
});
