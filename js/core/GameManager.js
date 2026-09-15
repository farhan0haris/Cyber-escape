/**
 * Game Manager
 * Orchestrates game lifecycle, mode transitions, and subsystems
 */

import { gameState } from './state.js';
import { Timer } from '../systems/Timer.js';
import { ScoreManager } from '../systems/ScoreManager.js';
import { LevelManager } from './LevelManager.js';
import { ui } from '../ui/UIManager.js';
import { audio } from '../systems/AudioManager.js';
import { storage } from '../systems/StorageManager.js';
import { getLevelMetadata } from './levelMetadata.js';
import { DEV_CONFIG } from './devConfig.js';

export class GameManager {
  constructor() {
    this.scoreManager = new ScoreManager(0);
    this.levelManager = null;
    this.timer = null;
    this._elapsedTimerId = null;
    this._lastElapsedTick = 0;

    this._initSubsystems();
  }

  _initSubsystems() {
    // Level Manager
    const stageContainer = typeof document !== 'undefined' ? document.getElementById('viewport-stage') : null;
    this.levelManager = new LevelManager(stageContainer);

    // Delta-time Countdown Timer
    this.timer = new Timer({
      onTick: (seconds) => {
        gameState.update({ levelTimeRemaining: seconds });
      },
      onWarning: (seconds) => {
        if (seconds === 20) {
          ui.showNotification('SYSTEM WARNING: 20 SECONDS UNTIL LOCKOUT', 'warning');
        } else if (seconds === 10) {
          ui.showNotification('CRITICAL: 10 SECONDS REMAINING!', 'danger');
          audio.playError();
        }
      },
      onExpired: () => {
        this.handleTimerExpired();
      }
    });

    // Wire state changes to UI
    gameState.subscribe((state) => {
      ui.updateHUD(state);
    });
  }

  /**
   * Start a new game run with specified player name
   * Resets all run state: score=0, lives=3, level=1, elapsed=0
   * @param {string} playerName
   */
  startGame(playerName) {
    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();

    const initialMeta = getLevelMetadata(1);

    gameState.reset();
    gameState.update({
      playerName: (playerName || 'OPERATOR').trim(),
      status: 'PLAYING',
      currentLevel: 1,
      score: 0,
      lives: 3,
      levelTimeRemaining: initialMeta.durationSeconds,
      totalTimeElapsed: 0,
      completedLevels: [],
      isPaused: false,
      isGameOver: false,
      isCompleted: false,
      startedAt: Date.now()
    });

    this.scoreManager.resetScore();

    // Persist last player name in storage
    storage.set('player', (playerName || 'OPERATOR').trim());

    // Switch view
    ui.showScreen('GAME');
    ui.hideAllModals();

    // Initialize Level 1 slot and start timers
    this.levelManager.initializeLevel(1, {
      onComplete: (scoreBonus) => this.handleLevelComplete(scoreBonus),
      onLoseLife: () => this.retryCurrentLevel(),
      onPenalty: (amount) => {
        const newScore = this.scoreManager.deductScore(amount);
        gameState.update({ score: newScore });
      }
    });
    this.levelManager.startLevel();

    this.timer.start(initialMeta.durationSeconds);
    this._startElapsedTracking();

    audio.playSuccess();
    ui.showNotification(`WELCOME AGENT ${playerName}. SECTOR 01 ENGAGED.`, 'info');
  }

  /**
   * Start a specific level directly in Developer/QA Mode
   * DEVELOPMENT ONLY: strictly guarded by DEV_CONFIG.DEV_MODE
   * @param {number} levelNumber (1-5)
   * @param {Object} [options] optional config (e.g. { seed, variantIndex })
   * @returns {boolean} true if successfully started, false if blocked
   */
  startDevLevel(levelNumber, options = {}) {
    if (!DEV_CONFIG.DEV_MODE) {
      console.warn('[GameManager] Direct level launch blocked: DEV_MODE is disabled.');
      return false;
    }

    const targetLevel = Math.max(1, Math.min(5, Number(levelNumber) || 1));
    const meta = getLevelMetadata(targetLevel);

    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();

    gameState.reset();
    const prerequisiteLevels = Array.from({ length: targetLevel - 1 }, (_, i) => i + 1);

    gameState.update({
      playerName: DEV_CONFIG.DEFAULT_TEST_PLAYER || 'TEST_OPERATOR',
      status: 'PLAYING',
      currentLevel: targetLevel,
      score: 0,
      lives: 3,
      levelTimeRemaining: meta.durationSeconds,
      totalTimeElapsed: 0,
      completedLevels: prerequisiteLevels,
      isPaused: false,
      isGameOver: false,
      isCompleted: false,
      isDevSession: true,
      startedAt: Date.now()
    });

    this.scoreManager.resetScore();

    // Switch view
    ui.showScreen('GAME');
    ui.hideAllModals();

    // Initialize Level slot and start timers
    this.levelManager.initializeLevel(targetLevel, {
      onComplete: (scoreBonus) => this.handleLevelComplete(scoreBonus),
      onLoseLife: () => this.retryCurrentLevel(),
      onPenalty: (amount) => {
        const newScore = this.scoreManager.deductScore(amount);
        gameState.update({ score: newScore });
      }
    }, options);
    this.levelManager.startLevel();

    this.timer.start(meta.durationSeconds);
    this._startElapsedTracking();

    audio.playSuccess();
    ui.showNotification(`[DEV MODE] DIRECT ACCESS: SECTOR 0${targetLevel} ENGAGED.`, 'warning');

    return true;
  }

  /**
   * Pause active game
   */
  pauseGame() {
    const { status } = gameState.state;
    if (status !== 'PLAYING') return;

    this.timer.pause();
    if (this.levelManager) this.levelManager.pauseLevel();
    this._pauseElapsedTracking();

    gameState.update({ status: 'PAUSED', isPaused: true });
    ui.showModal('modal-pause');
    audio.playClick();
  }

  /**
   * Resume active game
   */
  resumeGame() {
    const { status } = gameState.state;
    if (status !== 'PAUSED') return;

    gameState.update({ status: 'PLAYING', isPaused: false });
    ui.hideModal('modal-pause');

    this.timer.resume();
    if (this.levelManager) this.levelManager.resumeLevel();
    this._resumeElapsedTracking();
    audio.playClick();
  }

  /**
   * Retry current level
   * Deducts exactly 1 life, resets current level timer, clears level-specific state.
   * Total score and previous completed levels are preserved.
   * On Level 2, preserves the exact same generated maze variant and seed.
   */
  retryCurrentLevel() {
    const { lives, currentLevel } = gameState.state;
    const newLives = lives - 1;

    // Capture existing level configuration if retrying
    let retryOptions = {};
    if (this.levelManager && this.levelManager.currentLevelInstance) {
      const inst = this.levelManager.currentLevelInstance;
      if ((currentLevel === 1 || currentLevel === 3 || currentLevel === 5) && inst.scenario) {
        retryOptions = { scenario: inst.scenario };
      } else if (currentLevel === 2 && inst.variant) {
        retryOptions = { variant: inst.variant };
      } else if (currentLevel === 4 && typeof inst.variantIndex === 'number') {
        retryOptions = { variantIndex: inst.variantIndex };
      }
    }

    this.timer.stop();
    if (this.levelManager) this.levelManager.cleanupLevel();

    if (newLives <= 0) {
      gameState.update({ lives: 0 });
      this.handleGameOver('INTEGRITY EXHAUSTED');
      return;
    }

    const meta = getLevelMetadata(currentLevel);

    gameState.update({
      lives: newLives,
      levelTimeRemaining: meta.durationSeconds,
      status: 'PLAYING',
      isPaused: false
    });

    ui.showNotification(`SECTOR RETRY: 1 INTEGRITY NODE LOST (${newLives} REMAINING)`, 'danger');
    audio.playError();

    // Reinitialize same level slot with preserved variant if applicable
    this.levelManager.initializeLevel(currentLevel, {
      onComplete: (scoreBonus) => this.handleLevelComplete(scoreBonus),
      onLoseLife: () => this.retryCurrentLevel(),
      onPenalty: (amount) => {
        const newScore = this.scoreManager.deductScore(amount);
        gameState.update({ score: newScore });
      }
    }, retryOptions);
    this.levelManager.startLevel();

    // Restart countdown timer with full level duration
    this.timer.start(meta.durationSeconds);
  }

  /**
   * Restart entire mission back to Level 1
   * Resets level to 1, lives to 3, score to 0, elapsed to 0
   */
  restartGame() {
    const { playerName } = gameState.state;
    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();
    ui.hideAllModals();

    this.startGame(playerName || 'OPERATOR');
  }

  /**
   * Return to Main Menu cleanly without stale state
   */
  quitToMenu() {
    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();
    this.scoreManager.resetScore();

    gameState.update({
      status: 'MENU',
      isPaused: false,
      isGameOver: false,
      isCompleted: false,
      levelTimeRemaining: 75,
      score: 0
    });
    ui.hideAllModals();
    ui.showScreen('MENU');
    audio.playClick();
  }

  /**
   * Handle level completion and advance
   */
  handleLevelComplete(scoreBonus = 0) {
    const { currentLevel, completedLevels } = gameState.state;

    this.timer.stop();

    // Add bonus score if provided
    if (scoreBonus > 0) {
      const newScore = this.scoreManager.addScore(scoreBonus);
      gameState.update({ score: newScore });
    }

    const nextCompleted = completedLevels.includes(currentLevel)
      ? completedLevels
      : [...completedLevels, currentLevel];

    if (currentLevel >= 5) {
      gameState.update({ completedLevels: nextCompleted });
      this.completeGame();
      return;
    }

    const nextLvl = currentLevel + 1;
    const nextMeta = getLevelMetadata(nextLvl);

    gameState.update({
      currentLevel: nextLvl,
      completedLevels: nextCompleted,
      levelTimeRemaining: nextMeta.durationSeconds
    });

    // Mount and start next level slot
    this.levelManager.initializeLevel(nextLvl, {
      onComplete: (scoreBonus) => this.handleLevelComplete(scoreBonus),
      onLoseLife: () => this.retryCurrentLevel(),
      onPenalty: (amount) => {
        const newScore = this.scoreManager.deductScore(amount);
        gameState.update({ score: newScore });
      }
    });
    this.levelManager.startLevel();

    this.timer.start(nextMeta.durationSeconds);

    audio.playSuccess();
    ui.showNotification(`SECTOR 0${currentLevel} CLEARED. ENTERING SECTOR 0${nextLvl}`, 'success');
  }

  /**
   * Timer expiration handler: deducts 1 life and retries or game over
   */
  handleTimerExpired() {
    ui.showNotification('LOCKOUT PROTOCOL TRIGGERED: TIMEOUT REACHED', 'danger');
    audio.playError();
    this.retryCurrentLevel();
  }

  /**
   * Game Over handler when lives hit 0
   * @param {string} reason
   */
  handleGameOver(reason = 'SYSTEM LOCKED') {
    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();

    const currentState = gameState.state;
    gameState.update({ status: 'GAME_OVER', isGameOver: true, isPaused: false });

    audio.playError();
    ui.showGameOver(reason, currentState);
  }

  /**
   * Check if active session is eligible for leaderboard submission
   * Development test sessions MUST NEVER pollute production leaderboard
   * @returns {boolean}
   */
  canSubmitLeaderboard() {
    const { isDevSession } = gameState.state;
    return isDevSession !== true && DEV_CONFIG.isDevSession !== true;
  }

  /**
   * Safely submit score to persistent leaderboard
   * Blocked unconditionally if session is a developer test session
   * @param {Object} scoreEntry
   * @returns {boolean} true if persisted, false if blocked
   */
  submitLeaderboardScore(scoreEntry) {
    if (!this.canSubmitLeaderboard()) {
      console.warn('[GameManager] Leaderboard submission blocked: Development test session.');
      return false;
    }

    const currentBoard = storage.get('leaderboard', []);
    const updatedBoard = Array.isArray(currentBoard) ? currentBoard : [];
    updatedBoard.push(scoreEntry);
    storage.set('leaderboard', updatedBoard);
    return true;
  }

  /**
   * Game Victory handler
   */
  completeGame() {
    this.timer.stop();
    this._stopElapsedTracking();
    if (this.levelManager) this.levelManager.cleanupLevel();

    // Calculate Survival Bonus: 500 pts per surviving life
    const remainingLives = gameState.state.lives || 0;
    const survivalBonus = remainingLives * 500;
    if (survivalBonus > 0) {
      const newScore = this.scoreManager.addScore(survivalBonus);
      gameState.update({ score: newScore });
    }

    gameState.update({ status: 'COMPLETED', isCompleted: true, isPaused: false });
    audio.playSuccess();
    ui.showNotification('CONGRATULATIONS: ALL SECTORS OVERRIDDEN // SYSTEM UNLOCKED!', 'success');

    // Show dedicated Victory / Mission Results Screen
    ui.showVictory(gameState.state);

    // Leaderboard guard
    if (this.canSubmitLeaderboard()) {
      this.submitLeaderboardScore({
        player: gameState.state.playerName,
        score: gameState.state.score,
        completedAt: Date.now()
      });
    }
  }

  _startElapsedTracking() {
    this._stopElapsedTracking();
    this._lastElapsedTick = Date.now();
    this._elapsedTimerId = setInterval(() => {
      if (gameState.state.status === 'PLAYING') {
        const now = Date.now();
        const deltaSec = Math.floor((now - this._lastElapsedTick) / 1000);
        if (deltaSec >= 1) {
          this._lastElapsedTick = now;
          gameState.update({
            totalTimeElapsed: gameState.state.totalTimeElapsed + deltaSec
          });
        }
      } else {
        this._lastElapsedTick = Date.now();
      }
    }, 500);
  }

  _pauseElapsedTracking() {
    this._lastElapsedTick = Date.now();
  }

  _resumeElapsedTracking() {
    this._lastElapsedTick = Date.now();
  }

  _stopElapsedTracking() {
    if (this._elapsedTimerId) {
      clearInterval(this._elapsedTimerId);
      this._elapsedTimerId = null;
    }
  }
}
