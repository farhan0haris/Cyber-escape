/**
 * Level Manager
 * Lifecycle abstraction and coordinator for individual game levels
 */

import { Level1 } from '../levels/Level1.js';
import { Level2 } from '../levels/Level2.js';
import { Level3 } from '../levels/Level3.js';
import { Level4 } from '../levels/Level4.js';
import { Level5 } from '../levels/Level5.js';
import { getLevelMetadata } from './levelMetadata.js';

export class LevelManager {
  constructor(stageContainer) {
    this.stageContainer = stageContainer;
    this.currentLevelInstance = null;
    this.currentLevelNumber = 1;
    this._eventCallbacks = {};
  }

  /**
   * Initialize a specific level slot with lifecycle callbacks and optional config
   * @param {number} levelNumber (1-5)
   * @param {Object} callbacks { onComplete, onLoseLife, onPenalty, onScoreBonus }
   * @param {Object} [options] optional configuration (e.g. forced variant or seed)
   */
  initializeLevel(levelNumber, callbacks = {}, options = {}) {
    this.cleanupLevel();
    this.currentLevelNumber = levelNumber;
    this._eventCallbacks = callbacks;
    this._levelOptions = options;

    const meta = getLevelMetadata(levelNumber);

    // Factory mapping for level classes
    const levelClasses = {
      1: Level1,
      2: Level2,
      3: Level3,
      4: Level4,
      5: Level5
    };

    const LevelClass = levelClasses[levelNumber] || Level1;

    // Render level container shell
    if (this.stageContainer) {
      this.stageContainer.innerHTML = '';
      const placeholder = document.createElement('div');
      placeholder.className = 'viewport-placeholder';
      placeholder.innerHTML = `
        <div class="viewport-radar-ring" aria-hidden="true">
          <div class="radar-sweep"></div>
          <div class="radar-crosshair"></div>
        </div>
        <h2 class="viewport-placeholder-title">SECTOR 0${meta.number}: ${meta.name} // SLOT MOUNTED</h2>
        <p class="viewport-placeholder-desc">
          ${meta.description}
        </p>
        <div class="viewport-telemetry-grid font-mono">
          <div class="telemetry-card">
            <span class="card-label">SECTOR TYPE</span>
            <span class="card-val text-cyan">${meta.type}</span>
          </div>
          <div class="telemetry-card">
            <span class="card-label">BASE SCORE</span>
            <span class="card-val text-emerald">${meta.baseScore} PTS</span>
          </div>
          <div class="telemetry-card">
            <span class="card-label">TIME LIMIT</span>
            <span class="card-val text-amber">${meta.durationSeconds} SEC</span>
          </div>
        </div>
      `;
      this.stageContainer.appendChild(placeholder);
    }

    // Instantiate level instance
    try {
      this.currentLevelInstance = new LevelClass(this.stageContainer, this._eventCallbacks, options);
      if (typeof this.currentLevelInstance.init === 'function') {
        this.currentLevelInstance.init();
      }
    } catch (err) {
      console.error(`[LevelManager] Failed to instantiate Level ${levelNumber}:`, err);
    }
  }

  /**
   * Start the active level
   */
  startLevel() {
    if (this.currentLevelInstance && typeof this.currentLevelInstance.start === 'function') {
      try {
        this.currentLevelInstance.start();
      } catch (err) {
        console.error('[LevelManager] Error starting level:', err);
      }
    }
  }

  /**
   * Pause the active level
   */
  pauseLevel() {
    if (this.currentLevelInstance && typeof this.currentLevelInstance.pause === 'function') {
      try {
        this.currentLevelInstance.pause();
      } catch (err) {
        console.error('[LevelManager] Error pausing level:', err);
      }
    }
  }

  /**
   * Resume the active level
   */
  resumeLevel() {
    if (this.currentLevelInstance && typeof this.currentLevelInstance.resume === 'function') {
      try {
        this.currentLevelInstance.resume();
      } catch (err) {
        console.error('[LevelManager] Error resuming level:', err);
      }
    }
  }

  /**
   * Trigger level completion handler
   */
  completeLevel() {
    if (this.currentLevelInstance && typeof this.currentLevelInstance.complete === 'function') {
      try {
        this.currentLevelInstance.complete();
      } catch (err) {
        console.error('[LevelManager] Error completing level:', err);
      }
    }
  }

  /**
   * Guaranteed cleanup: removes event listeners, stops loops, clears DOM
   */
  cleanupLevel() {
    if (this.currentLevelInstance && typeof this.currentLevelInstance.cleanup === 'function') {
      try {
        this.currentLevelInstance.cleanup();
      } catch (err) {
        console.error('[LevelManager] Error cleaning up level instance:', err);
      }
    }
    this.currentLevelInstance = null;
    if (this.stageContainer) {
      this.stageContainer.innerHTML = '';
    }
  }
}
