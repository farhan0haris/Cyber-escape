/**
 * Level 3: Hidden Key (Sector 03 — Memory Dump Forensics Workbench)
 * 
 * Forensic Memory Deductive Challenge.
 * Investigates 12 volatile memory chips to isolate the single authentic decryption key.
 * 
 * Core Player Loop:
 * INSPECT (Select & examine block details)
 * ↓
 * COMPARE (Pin baseline & diff against target block)
 * ↓
 * DECIDE (Triage verified candidate)
 * ↓
 * VERIFY (Authorize isolated authentic key)
 */

import { gameState } from '../core/state.js';
import { audio } from '../systems/AudioManager.js';
import { getLevelMetadata } from '../core/levelMetadata.js';
import {
  LEVEL3_SCENARIOS,
  recordLevel3Scenario,
  isRecentLevel3Scenario,
  clearLevel3ScenarioHistory,
  getRecentLevel3Scenarios
} from './level3Data.js';

export class Level3 {
  /**
   * @param {HTMLElement} container
   * @param {Object} callbacks - { onComplete, onLoseLife, onPenalty }
   * @param {Object} [options] - optional config (e.g. forced scenario or seed)
   */
  constructor(container, callbacks = {}, options = {}) {
    this.container = container;
    this.callbacks = callbacks;
    this.options = options;

    this.maxAttempts = 3;
    this.failedAttempts = 0;
    this.baseScore = 1200;
    this.timeMultiplier = 15;
    this.penaltyPerMistake = 100;

    this.scenario = null;
    this.selectedChipId = null;
    this.pinnedChipId = null;
    this.inspectedChipIds = new Set();
    this.comparedPairs = new Set();
    this.triageMarks = new Map(); // Map<chipId, 'UNREVIEWED' | 'SUSPICIOUS' | 'CANDIDATE'>
    this.activityLog = []; // Array of string log events

    this.tutorialDismissed = false;

    this.hintsUsed = 0;
    this.hintPenaltyTotal = 0;

    this.isCompleted = false;
    this.isPaused = false;
    this.isLocked = false;
    this._cleanups = [];

    this._selectScenario();
  }

  _selectScenario() {
    // 1. Direct object passed via options.scenario (e.g. RETRY preservation)
    if (this.options && this.options.scenario && typeof this.options.scenario === 'object') {
      this.scenario = this.options.scenario;
      return;
    }

    // 2. Explicit scenario index (0-indexed or 1-indexed URL param)
    let explicitIdx = null;
    if (this.options) {
      if (typeof this.options.scenarioIndex === 'number') {
        explicitIdx = this.options.scenarioIndex;
      } else if (typeof this.options.scenario === 'number') {
        explicitIdx = this.options.scenario;
      }
    }

    if (typeof explicitIdx === 'number' && explicitIdx >= 0 && explicitIdx < LEVEL3_SCENARIOS.length) {
      this.scenario = LEVEL3_SCENARIOS[explicitIdx];
      recordLevel3Scenario(this.scenario.id);
      return;
    }

    // 3. Explicit scenario ID
    if (this.options && this.options.scenarioId) {
      const found = LEVEL3_SCENARIOS.find(s => s.id === this.options.scenarioId);
      if (found) {
        this.scenario = found;
        recordLevel3Scenario(this.scenario.id);
        return;
      }
    }

    // 4. New run selection: avoid recently used scenarios
    const available = LEVEL3_SCENARIOS.filter(s => !isRecentLevel3Scenario(s.id));
    const pool = available.length > 0 ? available : LEVEL3_SCENARIOS;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    this.scenario = chosen;
    recordLevel3Scenario(this.scenario.id);
  }

  init() {
    this.cleanup();
    if (!this.scenario) {
      this._selectScenario();
    }
    // Default select first chip for initial view
    if (this.scenario && this.scenario.chips && this.scenario.chips.length > 0) {
      this.selectedChipId = this.scenario.chips[0].id;
      this.inspectedChipIds.add(this.selectedChipId);
      this._logActivity(`${this.scenario.chips[0].id} INSPECTED`);
    }
    this.render();
    this.bindEvents();
  }

  start() {
    this.isPaused = false;
    this.isLocked = false;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  cleanup() {
    this._cleanups.forEach((fn) => {
      try { fn(); } catch (e) { console.warn('[Level3] Cleanup error:', e); }
    });
    this._cleanups = [];
    if (this.container && typeof document !== 'undefined') {
      this.container.innerHTML = '';
    }
  }

  /**
   * Helper to retrieve currently selected chip object
   */
  getSelectedChip() {
    if (!this.scenario || !this.selectedChipId) return null;
    return this.scenario.chips.find(c => c.id === this.selectedChipId) || null;
  }

  /**
   * Helper to retrieve pinned chip object
   */
  getPinnedChip() {
    if (!this.scenario || !this.pinnedChipId) return null;
    return this.scenario.chips.find(c => c.id === this.pinnedChipId) || null;
  }

  /**
   * Helper to append to activity log
   * @param {string} msg
   */
  _logActivity(msg) {
    this.activityLog.unshift(msg);
    if (this.activityLog.length > 5) {
      this.activityLog.pop();
    }
  }

  /**
   * Investigation stage evaluations:
   * SCAN: always complete (12 blocks mounted)
   * INSPECT: at least 2 distinct chips inspected
   * COMPARE: at least 1 pairwise comparison performed
   * IDENTIFY: at least 1 candidate established with evidence
   * VERIFY: READY when gate conditions met
   */
  getInvestigationProgress() {
    const isScanDone = true;
    const isInspectDone = this.inspectedChipIds.size >= 2;
    const isCompareDone = this.comparedPairs.size >= 1 || (this.pinnedChipId !== null && this.selectedChipId !== this.pinnedChipId);
    
    // Check if any inspected chip has been triaged as CANDIDATE
    let isCandidateDone = false;
    for (const [id, mark] of this.triageMarks.entries()) {
      if (mark === 'CANDIDATE' && this.inspectedChipIds.has(id)) {
        isCandidateDone = true;
        break;
      }
    }

    const isVerifyReady = this.isInvestigationGatePassed();

    return {
      scan: { status: 'complete', label: 'SCAN' },
      inspect: { status: isInspectDone ? 'complete' : (this.inspectedChipIds.size >= 1 ? 'current' : 'pending'), label: 'INSPECT' },
      compare: { status: isCompareDone ? 'complete' : (isInspectDone ? 'current' : 'pending'), label: 'COMPARE' },
      identify: { status: isCandidateDone ? 'complete' : (isCompareDone ? 'current' : 'pending'), label: 'IDENTIFY' },
      verify: { status: isVerifyReady ? 'ready' : 'locked', label: 'VERIFY' }
    };
  }

  /**
   * Meaningful investigation gate conditions for AUTHENTICITY = READY_TO_VERIFY
   */
  isInvestigationGatePassed() {
    const selected = this.getSelectedChip();
    if (!selected) return false;

    // 1. Selected candidate must be actively inspected
    const isInspected = this.inspectedChipIds.has(selected.id);
    if (!isInspected) return false;

    // 2. Minimum forensic baseline gathered (at least 2 distinct chips inspected)
    const baselineGathered = this.inspectedChipIds.size >= 2;
    if (!baselineGathered) return false;

    // 3. Meaningful comparative diff performed
    const comparisonDone = this.comparedPairs.size >= 1 || (this.pinnedChipId !== null && this.pinnedChipId !== selected.id);

    return baselineGathered && comparisonDone;
  }

  /**
   * Current high-visibility mission objective
   */
  getCurrentObjective() {
    const isScenario1 = this.scenario && this.scenario.id === 'scenario_01_alpha';
    if (this.inspectedChipIds.size < 2) {
      return isScenario1
        ? 'SYSTEM GUIDE: "Inspect a memory block to begin."'
        : 'INSPECT AT LEAST TWO MEMORY BLOCKS TO ESTABLISH AN EVIDENCE BASELINE.';
    }
    if (this.comparedPairs.size === 0 && !this.pinnedChipId) {
      return isScenario1
        ? 'SYSTEM GUIDE: "Now pin one block as a reference."'
        : 'PIN A REFERENCE BLOCK TO ENABLE COMPARATIVE DIFFING.';
    }
    if (this.comparedPairs.size === 0 && this.pinnedChipId) {
      return isScenario1
        ? 'SYSTEM GUIDE: "Select another block to compare the records."'
        : 'SELECT A SECOND BLOCK TO CONTRAST PROPERTIES AGAINST REFERENCE.';
    }
    
    let hasCandidate = false;
    for (const [id, mark] of this.triageMarks.entries()) {
      if (mark === 'CANDIDATE') { hasCandidate = true; break; }
    }

    if (!hasCandidate) {
      return isScenario1
        ? 'SYSTEM GUIDE: "Use TRIAGE when you have enough evidence."'
        : 'EVALUATE DIFFERENCES AND MARK YOUR TRUSTED BLOCK AS [CANDIDATE].';
    }

    return isScenario1
      ? 'SYSTEM GUIDE: "Your candidate can now be verified."'
      : 'AUTHENTICITY GATE UNLOCKED. AUTHORIZE [VERIFY MEMORY BLOCK].';
  }

  /**
   * Select a chip for deep inspection
   * @param {string} chipId
   */
  selectChip(chipId) {
    if (this.isLocked || this.isPaused) return;
    this.selectedChipId = chipId;
    const wasInspected = this.inspectedChipIds.has(chipId);
    this.inspectedChipIds.add(chipId);

    if (!wasInspected) {
      this._logActivity(`${chipId} INSPECTED`);
    }

    if (this.pinnedChipId && this.pinnedChipId !== chipId) {
      const pairKey = [this.pinnedChipId, chipId].sort().join(':');
      if (!this.comparedPairs.has(pairKey)) {
        this.comparedPairs.add(pairKey);
        this._logActivity(`COMPARISON COMPLETE`);
      }
    }

    audio.playSelect();
    this.updateUI();
  }

  /**
   * Pin / unpin a reference chip for field-by-field comparative diff
   * @param {string} chipId
   */
  togglePinChip(chipId) {
    if (this.isLocked || this.isPaused) return;
    if (this.pinnedChipId === chipId) {
      this.pinnedChipId = null;
      this._logActivity(`REFERENCE UNPINNED`);
      this.showNotice('Reference pin cleared.', 'info');
    } else {
      this.pinnedChipId = chipId;
      this._logActivity(`REFERENCE PINNED: ${chipId}`);
      if (this.selectedChipId && this.selectedChipId !== chipId) {
        const pairKey = [chipId, this.selectedChipId].sort().join(':');
        if (!this.comparedPairs.has(pairKey)) {
          this.comparedPairs.add(pairKey);
          this._logActivity(`COMPARISON COMPLETE`);
        }
      }
      this.showNotice(`Block [${this.getPinnedChip()?.blockLabel || chipId}] pinned as comparison reference.`, 'info');
    }
    audio.playSelect();
    this.updateUI();
  }

  /**
   * Cycle candidate triage state: UNREVIEWED -> SUSPICIOUS -> CANDIDATE -> UNREVIEWED
   * Requires evidence before marking as CANDIDATE.
   * @param {string} chipId
   */
  cycleTriage(chipId) {
    if (this.isLocked || this.isPaused) return;
    const chip = this.scenario.chips.find(c => c.id === chipId);
    if (!chip) return;

    // Must have inspected chip first
    if (!this.inspectedChipIds.has(chipId)) {
      this.showNotice('INSPECTION REQUIRED: Inspect memory block before assigning triage status.', 'warning');
      audio.playError();
      return;
    }

    const current = this.triageMarks.get(chipId) || 'UNREVIEWED';
    let next = 'UNREVIEWED';

    if (current === 'UNREVIEWED') {
      next = 'SUSPICIOUS';
      this._logActivity(`${chipId} MARKED SUSPICIOUS`);
    } else if (current === 'SUSPICIOUS') {
      // Evidence check for CANDIDATE: requires baseline >= 2 inspected and comparison action
      if (this.inspectedChipIds.size < 2 || this.comparedPairs.size === 0) {
        this.showNotice('INSUFFICIENT EVIDENCE FOR CANDIDATE: Compare against reference blocks first.', 'warning');
        audio.playError();
        return;
      }
      next = 'CANDIDATE';
      this._logActivity(`CANDIDATE ESTABLISHED`);
    } else if (current === 'CANDIDATE') {
      next = 'UNREVIEWED';
    }

    this.triageMarks.set(chipId, next);
    audio.playClick();
    this.updateUI();
  }

  /**
   * Set specific triage state directly (SUSPICIOUS or CANDIDATE)
   * @param {string} chipId
   * @param {'SUSPICIOUS' | 'CANDIDATE' | 'UNREVIEWED'} state
   */
  setTriageState(chipId, state) {
    if (this.isLocked || this.isPaused) return;
    const chip = this.scenario.chips.find(c => c.id === chipId);
    if (!chip) return;

    if (!this.inspectedChipIds.has(chipId)) {
      this.showNotice('INSPECTION REQUIRED: Inspect memory block before assigning triage status.', 'warning');
      audio.playError();
      return;
    }

    if (state === 'CANDIDATE') {
      this._logActivity(`CANDIDATE ESTABLISHED`);
    } else if (state === 'SUSPICIOUS') {
      this._logActivity(`${chipId} MARKED SUSPICIOUS`);
    }

    this.triageMarks.set(chipId, state);
    audio.playClick();
    this.updateUI();
  }

  /**
   * Dismiss the onboarding tutorial banner
   */
  dismissTutorial() {
    this.tutorialDismissed = true;
    audio.playClick();
    this.updateUI();
  }

  /**
   * Execute Authenticity Verification Action on Selected Memory Chip
   */
  verifySelectedChip() {
    if (this.isLocked || this.isPaused || this.isCompleted) return;

    const selected = this.getSelectedChip();
    if (!selected) {
      this.showNotice('NO CANDIDATE SELECTED: Click a memory block to inspect first.', 'warning');
      audio.playError();
      return;
    }

    if (!this.isInvestigationGatePassed()) {
      this.showNotice('FORENSIC GATE LOCKED: Complete baseline comparison before authorization attempt.', 'warning');
      audio.playError();
      return;
    }

    // Evaluate authenticity using internal data
    if (selected.isAuthentic === true) {
      this._handleVerificationSuccess(selected);
    } else {
      this._handleVerificationFailure(selected);
    }
  }

  _handleVerificationSuccess(authenticChip) {
    this.isCompleted = true;
    this.isLocked = true;
    audio.playSuccess();

    // Calculate score
    const timeRemaining = gameState.state.levelTimeRemaining || 0;
    const timeBonus = timeRemaining * this.timeMultiplier;
    const penaltyTotal = (this.failedAttempts * this.penaltyPerMistake) + this.hintPenaltyTotal;
    const finalScore = Math.max(0, this.baseScore + timeBonus - penaltyTotal);

    this.showNotice('CRYPTOGRAPHIC MATCH: AUTHENTIC DECRYPTION KEY ISOLATED.', 'success');

    // Trigger key extraction overlay animation
    this._renderExtractionOverlay(authenticChip, finalScore);

    setTimeout(() => {
      if (this.callbacks.onComplete) {
        this.callbacks.onComplete(finalScore);
      }
    }, 1800);
  }

  _handleVerificationFailure(decoyChip) {
    this.failedAttempts++;
    audio.playError();

    // Score Penalty
    if (this.callbacks.onPenalty) {
      this.callbacks.onPenalty(this.penaltyPerMistake);
    }

    // Deduct 5 seconds from active timer
    const currentRemaining = gameState.state.levelTimeRemaining || 0;
    const newRemaining = Math.max(1, currentRemaining - 5);
    gameState.update({ levelTimeRemaining: newRemaining });

    this.showNotice(`VERIFICATION FAILED: Candidate failed cryptographic integrity criteria. (-${this.penaltyPerMistake} PTS, -5s)`, 'error');

    if (this.failedAttempts >= this.maxAttempts) {
      this.isLocked = true;
      this.showNotice('SECURITY LOCKOUT: Maximum verification attempts exceeded.', 'error');
      setTimeout(() => {
        if (this.callbacks.onLoseLife) {
          this.callbacks.onLoseLife();
        }
      }, 1000);
    }

    this.updateUI();
  }

  /**
   * Request deduction hint
   */
  requestHint() {
    if (this.isLocked || this.isPaused || this.isCompleted) return;
    if (!this.scenario || !this.scenario.hints) return;

    if (this.hintsUsed >= this.scenario.hints.length) {
      this.showNotice('NO FURTHER HINTS AVAILABLE FOR THIS SECTOR.', 'info');
      return;
    }

    const hint = this.scenario.hints[this.hintsUsed];
    this.hintsUsed++;
    this.hintPenaltyTotal += hint.cost;

    if (this.callbacks.onPenalty) {
      this.callbacks.onPenalty(hint.cost);
    }

    this.showNotice(`${hint.text} (-${hint.cost} PTS)`, 'warning');
    audio.playClick();
    this.updateUI();
  }

  showNotice(msg, type = 'info') {
    const banner = this.container ? this.container.querySelector('#l3-notice-banner') : null;
    if (banner) {
      banner.textContent = msg;
      banner.className = `l3-notice-banner active ${type}`;
    }
  }

  /**
   * Render complete Level 3 DOM
   */
  render() {
    if (!this.container || typeof document === 'undefined') return;

    const attemptsRemaining = Math.max(0, this.maxAttempts - this.failedAttempts);
    const gatePassed = this.isInvestigationGatePassed();
    const isScenario1 = this.scenario && this.scenario.id === 'scenario_01_alpha';
    const showTutorial = isScenario1 && !this.tutorialDismissed;
    const progress = this.getInvestigationProgress();

    this.container.innerHTML = `
      <div class="level3-container" id="level3-screen">
        <!-- Header -->
        <header class="l3-header">
          <div class="l3-title-group">
            <span class="l3-status-badge ${gatePassed ? 'ready' : 'locked'}" id="l3-gate-badge">
              ${gatePassed ? 'STATUS: READY TO VERIFY' : 'STATUS: INVESTIGATING'}
            </span>
            <h2 class="l3-sector-title">${this.scenario.name}</h2>
          </div>
          <div class="l3-attempts-group">
            <span>INTEGRITY ATTEMPTS:</span>
            <div class="l3-attempt-pips" id="l3-attempt-pips" aria-label="${attemptsRemaining} attempts remaining">
              <span class="l3-pip ${this.failedAttempts >= 1 ? 'used' : ''}"></span>
              <span class="l3-pip ${this.failedAttempts >= 2 ? 'used' : ''}"></span>
              <span class="l3-pip ${this.failedAttempts >= 3 ? 'used' : ''}"></span>
            </div>
          </div>
        </header>

        <!-- Dynamic Mission Objective Banner (Priority 1) -->
        <div class="l3-objective-banner" id="l3-objective-banner">
          <div class="l3-obj-indicator">▶ CURRENT OBJECTIVE</div>
          <div class="l3-obj-text" id="l3-obj-text">${this.getCurrentObjective()}</div>
        </div>

        <!-- First 10 Seconds Onboarding Banner (Scenario 1) -->
        ${showTutorial ? this._renderTutorialBanner() : ''}

        <!-- Simplified Step-by-Step Investigation Tracker -->
        <div class="l3-tracker-rail" id="l3-tracker-rail" aria-label="Investigation Progress Tracker">
          <div class="l3-tracker-title">INVESTIGATION PROGRESS:</div>
          <div class="l3-tracker-steps">
            <span class="l3-track-step done" id="tr-scan"><span class="step-icon">✓</span> SCAN</span>
            <span class="l3-track-step ${progress.inspect.status === 'complete' ? 'done' : (progress.inspect.status === 'current' ? 'active' : '')}" id="tr-inspect">
              <span class="step-icon">${progress.inspect.status === 'complete' ? '✓' : '●'}</span> INSPECT
            </span>
            <span class="l3-track-step ${progress.compare.status === 'complete' ? 'done' : (progress.compare.status === 'current' ? 'active' : '')}" id="tr-compare">
              <span class="step-icon">${progress.compare.status === 'complete' ? '✓' : (progress.compare.status === 'current' ? '●' : '○')}</span> COMPARE
            </span>
            <span class="l3-track-step ${progress.identify.status === 'complete' ? 'done' : (progress.identify.status === 'current' ? 'active' : '')}" id="tr-identify">
              <span class="step-icon">${progress.identify.status === 'complete' ? '✓' : (progress.identify.status === 'current' ? '●' : '○')}</span> IDENTIFY
            </span>
            <span class="l3-track-step ${gatePassed ? 'ready' : 'locked'}" id="tr-verify">
              <span class="step-icon">${gatePassed ? '●' : '🔒'}</span> VERIFY
            </span>
          </div>
        </div>

        <!-- Feedback Notice Banner -->
        <div id="l3-notice-banner" class="l3-notice-banner" role="alert"></div>

        <!-- 1. Dominant Memory Archive (Forensic Dataset Surface) -->
        <section class="l3-memory-archive-surface" aria-label="Volatile Memory Archive">
          <div class="l3-archive-header">
            <div class="l3-archive-title-group">
              <span class="l3-archive-badge">FORENSIC DATASET</span>
              <h3 class="l3-archive-title">VOLATILE MEMORY HEAP // 12 REGISTER BLOCKS</h3>
            </div>
            <span class="l3-archive-meta">SECTOR 03 DUMP • 1 AUTHENTIC KEY ISOLATION TARGET</span>
          </div>

          <div class="l3-chips-grid" id="l3-chips-grid" role="grid" aria-label="12 Memory Blocks Grid">
            ${this._renderChipCards()}
          </div>
        </section>

        <!-- 2. Selected Fragment Forensic Workbench (Inspection + Comparison + Triage) -->
        <section class="l3-workbench-surface" aria-label="Forensic Investigation Workbench">
          <div class="l3-workbench-header">
            <div class="l3-workbench-title-group">
              <span class="l3-workbench-badge">MICROSCOPE</span>
              <h3 class="l3-workbench-title">DEEP FORENSIC INVESTIGATION & DIFF BENCH</h3>
            </div>
            <div class="l3-triage-guide">
              <span class="text-muted">TRIAGE CLASSIFICATION:</span>
              <span class="guide-tag"><strong>SUSPICIOUS:</strong> Anomaly detected</span>
              <span class="guide-tag"><strong>CANDIDATE:</strong> Verified authentic baseline</span>
            </div>
          </div>

          <div class="l3-workbench-grid">
            <!-- Left: Active Inspector Card -->
            <div class="l3-workbench-col" id="l3-inspector-card">
              ${this._renderInspectorContent()}
            </div>

            <!-- Right: Comparator Card -->
            <div class="l3-workbench-col" id="l3-comparator-card">
              ${this._renderComparatorContent()}
            </div>
          </div>

          <!-- Tactical Control Suite & Secondary Actions -->
          <div class="l3-workbench-controls">
            <div class="l3-btn-row">
              <button type="button" id="btn-pin-chip" class="l3-btn l3-btn-pin">
                ${this.pinnedChipId === this.selectedChipId ? 'UNPIN REFERENCE' : 'PIN AS REFERENCE'}
              </button>
              <button type="button" id="btn-triage-suspicious" class="l3-btn l3-btn-suspicious">
                MARK SUSPICIOUS
              </button>
              <button type="button" id="btn-triage-candidate" class="l3-btn l3-btn-candidate">
                MARK CANDIDATE
              </button>
              <button type="button" id="btn-hint-chip" class="l3-btn l3-btn-hint">
                REQUEST HINT (${this.hintsUsed}/${this.scenario.hints ? this.scenario.hints.length : 2})
              </button>
            </div>
          </div>
        </section>

        <!-- 3. Bottom Execution Bar: Audit Trail & Final Verification -->
        <section class="l3-resolution-bar" aria-label="Investigation Resolution">
          <!-- Activity Feed -->
          <div class="l3-activity-panel">
            <div class="l3-activity-header">
              <span class="l3-activity-title">AUDIT TRAIL</span>
              <span class="l3-activity-counter">${this.activityLog.length} EVENTS</span>
            </div>
            <div class="l3-activity-list" id="l3-activity-list">
              ${this._renderActivityList()}
            </div>
          </div>

          <!-- Final Authenticity Verification Gate -->
          <div class="l3-verification-panel">
            <div class="l3-verify-desc">
              <span class="l3-verify-title">FINAL AUTHORIZATION GATE</span>
              <span class="l3-verify-hint">
                ${gatePassed ? 'Gate conditions satisfied. Ready to isolate key.' : 'Complete comparative inspection & baseline triage to unlock.'}
              </span>
            </div>
            <button type="button" id="btn-verify-chip" class="l3-btn l3-btn-verify" ${!gatePassed ? 'disabled' : ''}>
              ${gatePassed ? 'AUTHORIZE & VERIFY AUTHENTICITY [READY]' : 'VERIFY AUTHENTICITY [LOCKED]'}
            </button>
          </div>
        </section>
      </div>
    `;
  }

  _renderTutorialBanner() {
    return `
      <div class="l3-tutorial-card" id="l3-tutorial-card">
        <div class="l3-tutorial-header">
          <div class="l3-tut-title">MEMORY DUMP ACQUIRED // 12 MEMORY BLOCKS DETECTED</div>
          <button type="button" class="l3-tut-close" id="btn-dismiss-tutorial" title="Dismiss Tutorial">DISMISS ✕</button>
        </div>
        <div class="l3-tut-body">
          <div class="l3-tut-objective">OBJECTIVE: ISOLATE THE AUTHENTIC MEMORY BLOCK.</div>
          <div class="l3-tutorial-steps-simplified">
            <div class="l3-tut-item active">
              <strong>1. INSPECT A MEMORY BLOCK</strong>
              <span>Select any block to load its parameters into the Forensic Inspector.</span>
            </div>
            <div class="l3-tut-item">
              <strong>2. COMPARE RECORDS</strong>
              <span>Pin a reference block and contrast field values against other blocks.</span>
            </div>
            <div class="l3-tut-item">
              <strong>3. MARK YOUR CANDIDATE</strong>
              <span>Use Triage to tag blocks once corroborated with evidence.</span>
            </div>
            <div class="l3-tut-item">
              <strong>4. VERIFY AUTHENTICITY</strong>
              <span>Authorize the verified block to isolate the decryption key.</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Simplified Clean 12-Chip Grid:
   * Shows ID, Address, Block Label, Status, and Action.
   * Excludes raw algorithms/fingerprints/checksums to prevent answer leaks and information overload.
   */
  _renderChipCards() {
    if (!this.scenario || !Array.isArray(this.scenario.chips)) return '';

    return this.scenario.chips.map((chip) => {
      const isSelected = chip.id === this.selectedChipId;
      const isPinned = chip.id === this.pinnedChipId;
      const isInspected = this.inspectedChipIds.has(chip.id);
      const triage = this.triageMarks.get(chip.id) || 'UNREVIEWED';

      let triageClass = '';
      if (triage === 'SUSPICIOUS') triageClass = 'triage-suspicious';
      if (triage === 'CANDIDATE') triageClass = 'triage-candidate';

      return `
        <article class="l3-chip-card ${isSelected ? 'selected' : ''} ${isPinned ? 'pinned' : ''} ${triageClass}"
                 data-chip-id="${chip.id}"
                 role="button"
                 tabindex="0"
                 aria-label="Memory Block ${chip.id} - ${chip.blockLabel}"
                 aria-selected="${isSelected}">
          <div class="l3-chip-corner-tl"></div>
          <div class="l3-chip-corner-br"></div>
          <div class="l3-chip-header">
            <span class="l3-chip-id">${chip.id}</span>
            <span class="l3-chip-address font-mono">${chip.address}</span>
          </div>
          <div class="l3-chip-body-clean">
            <span class="l3-chip-name">${chip.blockLabel}</span>
            <div class="l3-chip-status-line">
              <span class="l3-chip-status-dot ${isInspected ? 'dot-inspected' : 'dot-uninspected'}"></span>
              <span class="l3-chip-status ${isInspected ? 'status-inspected' : 'status-uninspected'}">
                ${isInspected ? 'INSPECTED' : 'UNREVIEWED'}
              </span>
            </div>
          </div>
          <div class="l3-chip-footer">
            <span class="l3-chip-tag l3-tag-${triage.toLowerCase()}">${triage}</span>
            ${isPinned ? '<span class="l3-pin-indicator">[PINNED]</span>' : '<span class="l3-inspect-action">[ INSPECT ]</span>'}
          </div>
        </article>
      `;
    }).join('');
  }

  _renderActivityList() {
    if (this.activityLog.length === 0) {
      return '<div class="l3-activity-empty">NO ACTIVITY RECORDED</div>';
    }
    return this.activityLog.map(item => `
      <div class="l3-activity-item">
        <span class="l3-act-bullet">▶</span>
        <span class="l3-act-msg">${item}</span>
      </div>
    `).join('');
  }

  _renderInspectorCard() {
    return this._renderInspectorContent();
  }

  _renderComparatorCard() {
    return this._renderComparatorContent();
  }

  _renderInspectorContent() {
    const selected = this.getSelectedChip();
    if (!selected) {
      return `
        <div class="l3-panel-header">
          <h4 class="l3-panel-title">FORENSIC INSPECTOR</h4>
        </div>
        <div class="l3-empty-state">SELECT A MEMORY BLOCK TO INSPECT</div>
      `;
    }

    const integrityWarnClass = selected.integrity < 90 ? 'danger' : selected.integrity < 100 ? 'warn' : '';

    // Calculate related records count in memory pool that share signature family or origin
    const relatedCount = this.scenario.chips.filter(c =>
      c.id !== selected.id && (c.fingerprintFamily === selected.fingerprintFamily || c.origin === selected.origin)
    ).length;

    return `
      <div class="l3-panel-header">
        <h4 class="l3-panel-title">INSPECTOR // ${selected.blockLabel} (${selected.id})</h4>
        <span class="l3-chip-address">${selected.address}</span>
      </div>
      <div class="l3-inspector-grid">
        <div class="l3-field-row">
          <span class="l3-field-label">ALGORITHM</span>
          <span class="l3-field-val highlight">${selected.algorithm}</span>
        </div>
        <div class="l3-field-row">
          <span class="l3-field-label">CHECKSUM</span>
          <span class="l3-field-val">${selected.checksum}</span>
        </div>
        <div class="l3-field-row">
          <span class="l3-field-label">FINGERPRINT</span>
          <span class="l3-field-val">${selected.fingerprint}</span>
        </div>
        <div class="l3-field-row">
          <span class="l3-field-label">SIG FAMILY</span>
          <span class="l3-field-val">${selected.fingerprintFamily}</span>
        </div>
        <div class="l3-field-row" style="grid-column: 1 / -1;">
          <span class="l3-field-label">ORIGIN PROVENANCE</span>
          <span class="l3-field-val">${selected.origin}</span>
        </div>
        <div class="l3-field-row">
          <span class="l3-field-label">ALLOCATION TIMESTAMP</span>
          <span class="l3-field-val">${selected.timestamp}</span>
        </div>
        <div class="l3-field-row">
          <span class="l3-field-label">EPOCH STATUS</span>
          <span class="l3-field-val">${selected.epochStatus} (YR ${selected.epoch})</span>
        </div>
        <div class="l3-field-row" style="grid-column: 1 / -1;">
          <span class="l3-field-label">RELATED RECORDS IN POOL</span>
          <span class="l3-field-val highlight">${relatedCount} BLOCKS SHARE ORIGIN OR SIG FAMILY</span>
        </div>
      </div>

      <!-- Hex Payload Fragment -->
      <div class="l3-hex-viewer">
        <div class="l3-hex-title">RAW MEMORY HEAP SNIPPET (16 BYTES)</div>
        <div class="l3-hex-bytes">${selected.hexSnippet}</div>
        <div class="l3-hex-ascii">ASCII: ${selected.asciiSnippet}</div>
      </div>

      <!-- Integrity Meter -->
      <div class="l3-integrity-box">
        <div class="l3-chip-meta-row">
          <span class="l3-field-label">SECTOR INTEGRITY</span>
          <span class="l3-chip-meta-val">${selected.integrity}% (${selected.integrityStatus})</span>
        </div>
        <div class="l3-integrity-bar-wrap">
          <div class="l3-integrity-bar ${integrityWarnClass}" style="width: ${selected.integrity}%;"></div>
        </div>
      </div>
    `;
  }

  _renderComparatorContent() {
    const selected = this.getSelectedChip();
    const pinned = this.getPinnedChip();

    if (!pinned) {
      return `
        <div class="l3-panel-header">
          <h4 class="l3-panel-title">COMPARATOR</h4>
        </div>
        <div class="l3-empty-state">PIN A REFERENCE BLOCK TO ENABLE COMPARATIVE DIFF</div>
      `;
    }

    if (!selected || selected.id === pinned.id) {
      return `
        <div class="l3-panel-header">
          <h4 class="l3-panel-title">COMPARATOR // REFERENCE: ${pinned.blockLabel} (${pinned.id})</h4>
        </div>
        <div class="l3-empty-state">SELECT A SECOND BLOCK TO COMPARE AGAINST ${pinned.blockLabel}</div>
      `;
    }

    // Compute field diffs
    const diffs = [
      {
        field: 'CLUSTER',
        refVal: pinned.addressCluster,
        candVal: selected.addressCluster,
        status: pinned.addressCluster === selected.addressCluster ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'ALGORITHM',
        refVal: pinned.algorithm,
        candVal: selected.algorithm,
        status: pinned.algorithm === selected.algorithm ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'FINGERPRINT',
        refVal: pinned.fingerprint.slice(0, 8),
        candVal: selected.fingerprint.slice(0, 8),
        status: pinned.fingerprint.slice(0, 8) === selected.fingerprint.slice(0, 8) ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'SIG FAMILY',
        refVal: pinned.fingerprintFamily,
        candVal: selected.fingerprintFamily,
        status: pinned.fingerprintFamily === selected.fingerprintFamily ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'CHECKSUM',
        refVal: pinned.checksum,
        candVal: selected.checksum,
        status: pinned.checksum === selected.checksum ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'ORIGIN',
        refVal: pinned.origin.slice(0, 14),
        candVal: selected.origin.slice(0, 14),
        status: pinned.origin === selected.origin ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'EPOCH',
        refVal: `${pinned.epoch}`,
        candVal: `${selected.epoch}`,
        status: pinned.epoch === selected.epoch ? 'MATCH' : 'DIFFERENT'
      },
      {
        field: 'INTEGRITY',
        refVal: `${pinned.integrity}%`,
        candVal: `${selected.integrity}%`,
        status: pinned.integrity === selected.integrity && selected.integrity === 100
          ? 'MATCH'
          : (selected.integrity < 100 || pinned.integrity < 100 ? 'ANOMALY' : 'DIFFERENT')
      }
    ];

    return `
      <div class="l3-panel-header">
        <h4 class="l3-panel-title">COMPARISON: [${pinned.blockLabel}] vs [${selected.blockLabel}]</h4>
      </div>
      <table class="l3-comparator-table" aria-label="Field Diff Table">
        <thead>
          <tr>
            <th>FIELD</th>
            <th>BLOCK A (${pinned.id})</th>
            <th>BLOCK B (${selected.id})</th>
            <th>RESULT</th>
          </tr>
        </thead>
        <tbody>
          ${diffs.map(d => {
            let badgeClass = 'l3-diff-different';
            if (d.status === 'MATCH') badgeClass = 'l3-diff-match';
            if (d.status === 'ANOMALY') badgeClass = 'l3-diff-anomaly';
            return `
              <tr>
                <td>${d.field}</td>
                <td>${d.refVal}</td>
                <td>${d.candVal}</td>
                <td><span class="l3-diff-badge ${badgeClass}">${d.status}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  _renderExtractionOverlay(authenticChip, finalScore) {
    if (!this.container || typeof document === 'undefined') return;

    const overlay = document.createElement('div');
    overlay.className = 'l3-extraction-overlay';
    overlay.id = 'l3-extraction-overlay';
    overlay.innerHTML = `
      <div class="l3-extraction-box">
        <h3 class="l3-extraction-title">CRYPTOGRAPHIC KEY ISOLATED</h3>
        <p class="l3-extraction-desc">
          Memory heap stabilized. Authentic AES-256 decryption key successfully extracted from block [${authenticChip.blockLabel}].
        </p>
        <div class="l3-extraction-key-display">
          KEY: ${authenticChip.hexSnippet.slice(0, 23)}...
        </div>
        <div style="margin-top: 14px; font-family: var(--font-mono, monospace); font-size: 0.85rem; color: #00ffcc;">
          SECTOR 03 SCORE: +${finalScore} PTS
        </div>
      </div>
    `;
    this.container.appendChild(overlay);
  }

  updateUI() {
    if (!this.container || typeof document === 'undefined') return;

    // Update objective
    const objText = this.container.querySelector('#l3-obj-text');
    if (objText) {
      objText.textContent = this.getCurrentObjective();
    }

    // Update tracker rail
    const gatePassed = this.isInvestigationGatePassed();
    const progress = this.getInvestigationProgress();
    const trInspect = this.container.querySelector('#tr-inspect');
    if (trInspect) {
      trInspect.className = `l3-track-step ${progress.inspect.status === 'complete' ? 'done' : (progress.inspect.status === 'current' ? 'active' : '')}`;
      trInspect.innerHTML = `<span class="step-icon">${progress.inspect.status === 'complete' ? '✓' : '●'}</span> INSPECT`;
    }
    const trCompare = this.container.querySelector('#tr-compare');
    if (trCompare) {
      trCompare.className = `l3-track-step ${progress.compare.status === 'complete' ? 'done' : (progress.compare.status === 'current' ? 'active' : '')}`;
      trCompare.innerHTML = `<span class="step-icon">${progress.compare.status === 'complete' ? '✓' : (progress.compare.status === 'current' ? '●' : '○')}</span> COMPARE`;
    }
    const trIdentify = this.container.querySelector('#tr-identify');
    if (trIdentify) {
      trIdentify.className = `l3-track-step ${progress.identify.status === 'complete' ? 'done' : (progress.identify.status === 'current' ? 'active' : '')}`;
      trIdentify.innerHTML = `<span class="step-icon">${progress.identify.status === 'complete' ? '✓' : (progress.identify.status === 'current' ? '●' : '○')}</span> IDENTIFY`;
    }
    const trVerify = this.container.querySelector('#tr-verify');
    if (trVerify) {
      trVerify.className = `l3-track-step ${gatePassed ? 'ready' : 'locked'}`;
      trVerify.innerHTML = `<span class="step-icon">${gatePassed ? '●' : '🔒'}</span> VERIFY`;
    }

    // Update chips grid
    const gridEl = this.container.querySelector('#l3-chips-grid');
    if (gridEl) gridEl.innerHTML = this._renderChipCards();

    // Update activity feed
    const actEl = this.container.querySelector('#l3-activity-list');
    if (actEl) actEl.innerHTML = this._renderActivityList();

    // Update inspector deck
    const inspEl = this.container.querySelector('#l3-inspector-card');
    if (inspEl) inspEl.innerHTML = this._renderInspectorContent();

    const compEl = this.container.querySelector('#l3-comparator-card');
    if (compEl) compEl.innerHTML = this._renderComparatorContent();

    // Update Status Badge
    const gateBadge = this.container.querySelector('#l3-gate-badge');
    if (gateBadge) {
      gateBadge.className = `l3-status-badge ${gatePassed ? 'ready' : 'locked'}`;
      gateBadge.textContent = gatePassed ? 'STATUS: READY TO VERIFY' : 'STATUS: INVESTIGATING';
    }

    // Update Action Buttons
    const btnVerify = this.container.querySelector('#btn-verify-chip');
    if (btnVerify) {
      btnVerify.disabled = !gatePassed || this.isLocked || this.isCompleted;
      btnVerify.textContent = gatePassed ? 'VERIFY AUTHENTICITY [READY]' : 'VERIFY AUTHENTICITY [LOCKED]';
    }

    const btnPin = this.container.querySelector('#btn-pin-chip');
    if (btnPin) {
      btnPin.textContent = this.pinnedChipId === this.selectedChipId ? 'UNPIN REFERENCE' : 'PIN AS REFERENCE';
    }

    const currentMark = this.selectedChipId ? (this.triageMarks.get(this.selectedChipId) || 'UNREVIEWED') : 'UNREVIEWED';
    const btnTriageSusp = this.container.querySelector('#btn-triage-suspicious');
    if (btnTriageSusp) {
      btnTriageSusp.classList.toggle('active', currentMark === 'SUSPICIOUS');
    }
    const btnTriageCand = this.container.querySelector('#btn-triage-candidate');
    if (btnTriageCand) {
      btnTriageCand.classList.toggle('active', currentMark === 'CANDIDATE');
    }

    const btnTriage = this.container.querySelector('#btn-triage-chip');
    if (btnTriage) {
      btnTriage.textContent = `MARK: ${currentMark}`;
    }

    const btnHint = this.container.querySelector('#btn-hint-chip');
    if (btnHint && this.scenario && this.scenario.hints) {
      btnHint.textContent = `REQUEST DECRYPTION HINT (${this.hintsUsed}/${this.scenario.hints.length})`;
    }

    // Update attempt pips
    const pipsEl = this.container.querySelector('#l3-attempt-pips');
    if (pipsEl) {
      pipsEl.innerHTML = `
        <span class="l3-pip ${this.failedAttempts >= 1 ? 'used' : ''}"></span>
        <span class="l3-pip ${this.failedAttempts >= 2 ? 'used' : ''}"></span>
        <span class="l3-pip ${this.failedAttempts >= 3 ? 'used' : ''}"></span>
      `;
    }
  }

  bindEvents() {
    if (!this.container || typeof document === 'undefined') return;

    // Delegate chip click/selection
    const handleGridClick = (e) => {
      const card = e.target.closest('.l3-chip-card');
      if (card) {
        const chipId = card.getAttribute('data-chip-id');
        if (chipId) this.selectChip(chipId);
      }
    };
    this.container.addEventListener('click', handleGridClick);
    this._cleanups.push(() => this.container.removeEventListener('click', handleGridClick));

    // Delegate keyboard navigation on grid
    const handleGridKeydown = (e) => {
      if (e.target.classList.contains('l3-chip-card')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const chipId = e.target.getAttribute('data-chip-id');
          if (chipId) this.selectChip(chipId);
        }
      }
    };
    this.container.addEventListener('keydown', handleGridKeydown);
    this._cleanups.push(() => this.container.removeEventListener('keydown', handleGridKeydown));

    // Action button listeners
    const handleActionClick = (e) => {
      if (e.target.closest('#btn-verify-chip')) {
        this.verifySelectedChip();
      } else if (e.target.closest('#btn-pin-chip')) {
        if (this.selectedChipId) this.togglePinChip(this.selectedChipId);
      } else if (e.target.closest('#btn-triage-suspicious')) {
        if (this.selectedChipId) this.setTriageState(this.selectedChipId, 'SUSPICIOUS');
      } else if (e.target.closest('#btn-triage-candidate')) {
        if (this.selectedChipId) this.setTriageState(this.selectedChipId, 'CANDIDATE');
      } else if (e.target.closest('#btn-triage-chip')) {
        if (this.selectedChipId) this.cycleTriage(this.selectedChipId);
      } else if (e.target.closest('#btn-hint-chip')) {
        this.requestHint();
      } else if (e.target.closest('#btn-dismiss-tutorial')) {
        this.dismissTutorial();
      }
    };
    this.container.addEventListener('click', handleActionClick);
    this._cleanups.push(() => this.container.removeEventListener('click', handleActionClick));

    // Global keyboard shortcuts (V for verify, P for pin, T for triage, H for hint)
    const handleGlobalKeys = (e) => {
      if (this.isLocked || this.isPaused || this.isCompleted) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toUpperCase();
      if (key === 'V') {
        e.preventDefault();
        this.verifySelectedChip();
      } else if (key === 'P') {
        e.preventDefault();
        if (this.selectedChipId) this.togglePinChip(this.selectedChipId);
      } else if (key === 'T') {
        e.preventDefault();
        if (this.selectedChipId) this.cycleTriage(this.selectedChipId);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    this._cleanups.push(() => window.removeEventListener('keydown', handleGlobalKeys));
  }
}
