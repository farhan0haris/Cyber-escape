/**
 * Central In-Memory Game State Model
 * Adheres strictly to DATA_MODEL.md specification
 */

export const INITIAL_STATE = Object.freeze({
  sessionId: '',
  playerName: '',
  currentLevel: 1,
  score: 0,
  lives: 3,
  levelTimeRemaining: 75,
  totalTimeElapsed: 0,
  completedLevels: [],
  status: 'MENU', // 'MENU' | 'PLAYER_SETUP' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'COMPLETED'
  isPaused: false,
  isGameOver: false,
  isCompleted: false,
  isMuted: false,
  isDevSession: false,
  startedAt: 0,
  updatedAt: 0
});

export class GameState {
  constructor() {
    this._state = { ...INITIAL_STATE };
    this._listeners = new Set();
  }

  /**
   * Get immutable snapshot of current state
   */
  get state() {
    return Object.freeze({ ...this._state });
  }

  /**
   * Subscribe to state mutation events
   * @param {Function} listener (currentState) => void
   * @returns {Function} unsubscribe cleanup function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    this._listeners.add(listener);
    // Immediately notify initial state
    try {
      listener(this.state);
    } catch (err) {
      console.error('[GameState] Error in initial subscriber callback:', err);
    }
    return () => this._listeners.delete(listener);
  }

  /**
   * Mutate state and notify subscribers
   * @param {Partial<typeof INITIAL_STATE>} updates
   */
  update(updates) {
    this._state = {
      ...this._state,
      ...updates,
      updatedAt: Date.now()
    };
    this._notify();
  }

  /**
   * Reset game state back to default initial values
   */
  reset() {
    this._state = {
      ...INITIAL_STATE,
      playerName: this._state.playerName, // preserve current player name
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    this._notify();
  }

  _notify() {
    const snapshot = this.state;
    this._listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[GameState] Error in subscriber callback:', err);
      }
    });
  }
}

export const gameState = new GameState();
