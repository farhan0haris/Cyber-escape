/**
 * Score Manager System
 * Manages game score and enforces mathematical floor: score >= 0
 */

export class ScoreManager {
  constructor(initialScore = 0) {
    this._score = Math.max(0, Math.floor(initialScore));
  }

  getScore() {
    return this._score;
  }

  setScore(amount) {
    this._score = Math.max(0, Math.floor(amount));
    return this._score;
  }

  addScore(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return this._score;
    this._score = Math.max(0, this._score + Math.floor(amount));
    return this._score;
  }

  subtractScore(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return this._score;
    this._score = Math.max(0, this._score - Math.floor(amount));
    return this._score;
  }

  deductScore(amount) {
    return this.subtractScore(amount);
  }

  resetScore() {
    this._score = 0;
    return this._score;
  }
}
