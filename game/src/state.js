// state.js — the game's state machine and scoring.
//
// Screens: title → play → scene-clear → play … → end. The state owns the
// timer, hints, found set, score and accuracy; the renderer and HUD only
// read it. All time is driven by performance.now deltas from main.js.

import { SCENES, TOTAL_DIFFS } from './scenes/index.js';

export const HINTS_PER_SCENE = 3;
export const POINTS_FIND = 100;
export const POINTS_WRONG = -25;
export const POINTS_TIME_BONUS_PER_SEC = 2;
export const POINTS_NO_HINT_BONUS = 150;

export class GameState {
  constructor() {
    this.resetAll();
  }

  resetAll() {
    this.screen = 'title'; // title | play | sceneClear | end | timeout
    this.sceneIndex = 0;
    this.found = new Set(); // diff ids found in the current scene
    this.hintsLeft = HINTS_PER_SCENE;
    this.hintsUsedScene = 0;
    this.score = 0;
    this.totalClicks = 0;
    this.totalFinds = 0;
    this.totalWrong = 0;
    this.timeLeft = SCENES[0].timeLimit;
    this.timeUsed = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.paused = false;
    this.hintTarget = null; // diff id currently highlighted, or null
    this.hintExpiresAt = 0;
    this.sceneStartScore = 0;
    this.sceneFinds = 0;
    this.sceneClearBonus = { timeBonus: 0, cleanBonus: 0 };
    this.lastTickSecond = -1;
  }

  get scene() {
    return SCENES[this.sceneIndex];
  }

  get remaining() {
    return this.scene.diffs.length - this.found.size;
  }

  get isLastScene() {
    return this.sceneIndex === SCENES.length - 1;
  }

  get accuracy() {
    return this.totalClicks === 0 ? 1 : this.totalFinds / this.totalClicks;
  }

  /** Begin the run from the title screen. */
  startRun() {
    this.resetAll();
    this.screen = 'play';
    this.timeLeft = this.scene.timeLimit;
    this.sceneStartScore = 0;
  }

  /** Move to the next scene (or the end screen after the last). */
  nextScene() {
    if (this.isLastScene) {
      this.screen = 'end';
      return;
    }
    this.sceneIndex++;
    this.found = new Set();
    this.hintsLeft = HINTS_PER_SCENE;
    this.hintsUsedScene = 0;
    this.combo = 0;
    this.hintTarget = null;
    this.timeLeft = this.scene.timeLimit;
    this.sceneStartScore = this.score;
    this.sceneFinds = 0;
    this.screen = 'play';
  }

  /** Retry the current scene after a timeout, keeping the run's score. */
  retryScene() {
    this.found = new Set();
    this.hintsLeft = HINTS_PER_SCENE;
    this.hintsUsedScene = 0;
    this.combo = 0;
    this.hintTarget = null;
    this.timeLeft = this.scene.timeLimit;
    this.sceneFinds = 0;
    this.score = this.sceneStartScore;
    this.screen = 'play';
  }

  /** Advance the timer by dt seconds. Returns 'timeout' when it hits zero. */
  tick(dt) {
    if (this.screen !== 'play' || this.paused) return null;
    this.timeLeft -= dt;
    this.timeUsed += dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = 'timeout';
      return 'timeout';
    }
    return null;
  }

  /** The whole-second value of the timer, for the countdown tick sound. */
  get wholeSeconds() {
    return Math.ceil(this.timeLeft);
  }

  /**
   * Register a find. Returns the points earned (combo-scaled).
   * Marks the scene complete when the last difference is found.
   */
  registerFind(diffId) {
    if (this.found.has(diffId)) return 0;
    this.found.add(diffId);
    this.totalFinds++;
    this.totalClicks++;
    this.sceneFinds++;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const points = POINTS_FIND + Math.min(this.combo - 1, 7) * 15;
    this.score += points;
    if (this.remaining === 0) this.completeScene();
    return points;
  }

  /** Register a wrong click: combo breaks, small penalty. */
  registerWrong() {
    this.totalWrong++;
    this.totalClicks++;
    this.combo = 0;
    this.score = Math.max(0, this.score + POINTS_WRONG);
  }

  /** Scene-clear bonuses: leftover time + no-hint bonus. */
  completeScene() {
    const timeBonus = Math.round(this.timeLeft) * POINTS_TIME_BONUS_PER_SEC;
    const cleanBonus = this.hintsUsedScene === 0 ? POINTS_NO_HINT_BONUS : 0;
    this.score += timeBonus + cleanBonus;
    this.sceneClearBonus = { timeBonus, cleanBonus };
    this.screen = 'sceneClear';
  }

  /** Spend a hint: returns the diff id to highlight, or null if none left. */
  useHint(nowMs) {
    if (this.hintsLeft <= 0 || this.screen !== 'play' || this.paused) return null;
    const unfound = this.scene.diffs.filter((d) => !this.found.has(d.id));
    if (unfound.length === 0) return null;
    this.hintsLeft--;
    this.hintsUsedScene++;
    this.combo = 0;
    // Highlight the unfound difference nearest the scene center — the
    // fairest hint, never the hardest one.
    const target = unfound
      .map((d) => ({ d, dist: Math.hypot(d.x - 320, d.y - 240) }))
      .sort((a, b) => a.dist - b.dist)[0].d;
    this.hintTarget = target.id;
    this.hintExpiresAt = nowMs + 2500;
    return target;
  }

  /** Clear an expired hint highlight. */
  expireHint(nowMs) {
    if (this.hintTarget && nowMs > this.hintExpiresAt) this.hintTarget = null;
  }

  /** Stars for the end screen: accuracy + speed + completion. */
  stars() {
    let s = 1; // finishing earns one star
    if (this.accuracy >= 0.7) s++;
    if (this.accuracy >= 0.85 && this.totalWrong <= 4) s++;
    return Math.min(s, 3);
  }

  /** Best score persistence (localStorage, offline-safe). */
  loadBest() {
    try {
      return Number(localStorage.getItem('twin-hearth-best') || 0);
    } catch {
      return 0;
    }
  }

  saveBest() {
    try {
      const best = this.loadBest();
      if (this.score > best) localStorage.setItem('twin-hearth-best', String(this.score));
      return Math.max(best, this.score);
    } catch {
      return this.score;
    }
  }
}

export { TOTAL_DIFFS };
