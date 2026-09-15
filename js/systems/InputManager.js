/**
 * Input Manager Foundation
 * Normalizes keyboard and touch input events with clean event unregistration
 */

export class InputManager {
  constructor() {
    this._listeners = new Map();
    this._isBound = false;
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onKeyUp = this._handleKeyUp.bind(this);
  }

  /**
   * Initialize input event bindings
   */
  initialize() {
    if (this._isBound) return;
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    this._isBound = true;
  }

  /**
   * Subscribe to specific normalized action commands
   * @param {string} action 'PAUSE' | 'MOVE_UP' | 'MOVE_DOWN' | 'MOVE_LEFT' | 'MOVE_RIGHT'
   * @param {Function} callback
   */
  on(action, callback) {
    if (!this._listeners.has(action)) {
      this._listeners.set(action, new Set());
    }
    this._listeners.get(action).add(callback);
    return () => {
      const set = this._listeners.get(action);
      if (set) set.delete(callback);
    };
  }

  _handleKeyDown(e) {
    // Avoid triggering navigation shortcuts when user types into form input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    let action = null;
    switch (e.key) {
      case 'p':
      case 'P':
      case 'Escape':
        action = 'PAUSE';
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        action = 'MOVE_UP';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        action = 'MOVE_DOWN';
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        action = 'MOVE_LEFT';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        action = 'MOVE_RIGHT';
        break;
      default:
        break;
    }

    if (action) {
      // Prevent page scrolling on arrow keys during game
      if (action.startsWith('MOVE_')) {
        e.preventDefault();
      }
      this._dispatch(action, true);
    }
  }

  _handleKeyUp(e) {
    // Optional keyup handling for continuous movement in Levels 2 & 4
  }

  _dispatch(action, data) {
    const callbacks = this._listeners.get(action);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[InputManager] Error in action callback (${action}):`, err);
        }
      });
    }
  }

  /**
   * Clean up all event listeners
   */
  cleanup() {
    if (this._isBound) {
      window.removeEventListener('keydown', this._onKeyDown);
      window.removeEventListener('keyup', this._onKeyUp);
      this._isBound = false;
    }
    this._listeners.clear();
  }
}

export const input = new InputManager();
