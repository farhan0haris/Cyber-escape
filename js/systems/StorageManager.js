/**
 * Safe LocalStorage Wrapper with in-memory fallback
 * Namespaced strictly under `cyberEscape.*`
 */

const STORAGE_PREFIX = 'cyberEscape.';

export class StorageManager {
  constructor() {
    this._memoryFallback = new Map();
    this._isStorageAvailable = this._checkAvailability();
  }

  _checkAvailability() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return false;
      }
      const testKey = `${STORAGE_PREFIX}__test__`;
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('[StorageManager] localStorage unavailable; using in-memory fallback.', e);
      return false;
    }
  }

  /**
   * Get an item from storage with fallback
   * @param {string} key key suffix, e.g. 'player', 'settings'
   * @param {*} defaultValue fallback value if missing or corrupt
   */
  get(key, defaultValue = null) {
    const fullKey = `${STORAGE_PREFIX}${key}`;

    if (!this._isStorageAvailable) {
      return this._memoryFallback.has(fullKey)
        ? this._memoryFallback.get(fullKey)
        : defaultValue;
    }

    try {
      const raw = window.localStorage.getItem(fullKey);
      if (raw === null) return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`[StorageManager] Corrupt JSON at ${fullKey}. Restoring fallback.`, err);
      this.set(key, defaultValue);
      return defaultValue;
    }
  }

  /**
   * Set an item in storage
   * @param {string} key key suffix, e.g. 'player', 'settings'
   * @param {*} value serializable value
   */
  set(key, value) {
    const fullKey = `${STORAGE_PREFIX}${key}`;

    if (!this._isStorageAvailable) {
      this._memoryFallback.set(fullKey, value);
      return true;
    }

    try {
      window.localStorage.setItem(fullKey, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[StorageManager] Failed to write to ${fullKey}:`, err);
      this._memoryFallback.set(fullKey, value);
      return false;
    }
  }

  /**
   * Remove an item from storage
   * @param {string} key
   */
  remove(key) {
    const fullKey = `${STORAGE_PREFIX}${key}`;
    if (!this._isStorageAvailable) {
      this._memoryFallback.delete(fullKey);
      return;
    }
    try {
      window.localStorage.removeItem(fullKey);
    } catch (err) {
      console.error(`[StorageManager] Failed to remove ${fullKey}:`, err);
    }
  }
}

export const storage = new StorageManager();
