// hud.js — the DOM heads-up display.
//
// Icon-first: the header shows a timer ring, a big remaining counter, hint
// pips and icon buttons — no permanent text panels. Found dots under each
// panel mirror progress at a glance. Overlays (scene-clear, end, timeout,
// pause, help) are filled and shown from here.

import { SCENES } from './scenes/index.js';

const RING_CIRCUMFERENCE = 2 * Math.PI * 15.5;

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function fmtClock(totalSeconds) {
  const s = Math.round(totalSeconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export class Hud {
  constructor() {
    this.el = {};
    for (const id of [
      'stage', 'timer-text', 'timer-ring', 'timer-wrap', 'left-count',
      'found-count', 'score', 'combo', 'hint-pips', 'scene-dots',
      'dots-left', 'dots-right', 'scene-name',
      'screen-title', 'overlay-scene-clear', 'overlay-end', 'overlay-timeout',
      'overlay-pause', 'overlay-help',
      'clear-scene-name', 'clear-stats', 'clear-bonus', 'clear-next-label',
      'end-score', 'end-stars', 'end-accuracy', 'end-time', 'end-best',
      'end-new-best', 'title-best', 'timeout-scene-name',
    ]) {
      this.el[id] = document.getElementById(id);
    }
    this.buildSceneDots();
    // Last-rendered values: update() runs every frame, so DOM writes that
    // rebuild nodes (pips, dots) only happen when the value actually changed.
    this._cache = { hints: -1, found: -1, scene: -1, score: -1, left: -1, combo: -1 };
  }

  buildSceneDots() {
    const wrap = this.el['scene-dots'];
    wrap.innerHTML = '';
    SCENES.forEach((s, i) => {
      const dot = document.createElement('span');
      dot.className = 'scene-dot';
      dot.title = s.name;
      dot.dataset.index = String(i);
      wrap.appendChild(dot);
    });
  }

  /** Rebuild the found-dots rows for the current scene (8 dots each). */
  buildFoundDots(count) {
    for (const key of ['dots-left', 'dots-right']) {
      const wrap = this.el[key];
      wrap.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'found-dot';
        wrap.appendChild(dot);
      }
    }
  }

  /** Full HUD refresh from state — called every frame (cheap DOM writes). */
  update(state) {
    // Timer ring + text.
    const frac = Math.max(0, state.timeLeft / state.scene.timeLimit);
    this.el['timer-text'].textContent = fmtTime(state.timeLeft);
    this.el['timer-ring'].style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - frac));
    const urgent = state.timeLeft <= 30 && state.screen === 'play';
    const critical = state.timeLeft <= 10 && state.screen === 'play';
    this.el['timer-wrap'].classList.toggle('urgent', urgent);
    this.el['timer-wrap'].classList.toggle('critical', critical);
    this.el.stage.classList.toggle('time-urgent', urgent);
    this.el.stage.classList.toggle('time-critical', critical);

    // Remaining counter — the number the judge must read.
    if (state.remaining !== this._cache.left) {
      this._cache.left = state.remaining;
      this.el['left-count'].textContent = String(state.remaining);
      this.el['found-count'].textContent = `${state.found.size}/${state.scene.diffs.length}`;
    }

    // Score + combo.
    if (state.score !== this._cache.score) {
      this._cache.score = state.score;
      this.el.score.textContent = String(state.score);
    }
    if (state.combo !== this._cache.combo) {
      this._cache.combo = state.combo;
      const combo = this.el.combo;
      if (state.combo >= 2) {
        combo.textContent = `COMBO ×${state.combo}`;
        combo.classList.add('show');
      } else {
        combo.classList.remove('show');
      }
    }

    // Hint pips (rebuild only when the count changed).
    if (state.hintsLeft !== this._cache.hints) {
      this._cache.hints = state.hintsLeft;
      const pips = this.el['hint-pips'];
      pips.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const pip = document.createElement('span');
        pip.className = `hint-pip${i < state.hintsLeft ? ' on' : ''}`;
        pips.appendChild(pip);
      }
    }

    // Scene dots (rebuild classes only on scene change).
    if (state.sceneIndex !== this._cache.scene) {
      this._cache.scene = state.sceneIndex;
      for (const dot of this.el['scene-dots'].children) {
        const i = Number(dot.dataset.index);
        dot.classList.toggle('done', i < state.sceneIndex);
        dot.classList.toggle('current', i === state.sceneIndex);
      }
      this.el['scene-name'].textContent = state.scene.name;
    }

    // Found dots under both panels (only when the count changed).
    if (state.found.size !== this._cache.found) {
      this._cache.found = state.found.size;
      const foundCount = state.found.size;
      for (const key of ['dots-left', 'dots-right']) {
        const dots = this.el[key].children;
        for (let i = 0; i < dots.length; i++) {
          dots[i].classList.toggle('found', i < foundCount);
        }
      }
    }
  }

  /** Show exactly one screen/overlay combination. */
  showScreen(name) {
    const overlays = [
      'screen-title', 'overlay-scene-clear', 'overlay-end',
      'overlay-timeout', 'overlay-pause', 'overlay-help',
    ];
    for (const id of overlays) this.el[id].classList.add('hidden');
    this.el.stage.classList.toggle('dimmed', name !== 'play');
    if (name === 'title') this.el['screen-title'].classList.remove('hidden');
    else if (name === 'sceneClear') this.el['overlay-scene-clear'].classList.remove('hidden');
    else if (name === 'end') this.el['overlay-end'].classList.remove('hidden');
    else if (name === 'timeout') this.el['overlay-timeout'].classList.remove('hidden');
    else if (name === 'pause') this.el['overlay-pause'].classList.remove('hidden');
  }

  showHelp(show) {
    this.el['overlay-help'].classList.toggle('hidden', !show);
  }

  isHelpOpen() {
    return !this.el['overlay-help'].classList.contains('hidden');
  }

  fillTitle(best) {
    this.el['title-best'].textContent = best > 0 ? `BEST ${best}` : '';
  }

  fillSceneClear(state) {
    this.el['clear-scene-name'].textContent = state.scene.name;
    const bonus = state.sceneClearBonus || { timeBonus: 0, cleanBonus: 0 };
    this.el['clear-stats'].textContent =
      `${state.sceneFinds}/${state.scene.diffs.length} found · ${Math.round(state.accuracy * 100)}% accuracy`;
    const parts = [];
    if (bonus.timeBonus > 0) parts.push(`Time bonus +${bonus.timeBonus}`);
    if (bonus.cleanBonus > 0) parts.push(`No-hint bonus +${bonus.cleanBonus}`);
    this.el['clear-bonus'].textContent = parts.join(' · ') || 'Scene complete!';
    this.el['clear-next-label'].textContent = state.isLastScene ? 'See results' : 'Next scene';
  }

  fillTimeout(state) {
    this.el['timeout-scene-name'].textContent = state.scene.name;
  }

  fillEnd(state) {
    const best = state.saveBest();
    const isBest = state.score >= best && state.score > 0;
    this.el['end-score'].textContent = String(state.score);
    this.el['end-accuracy'].textContent = `${Math.round(state.accuracy * 100)}% accuracy · ${state.totalFinds} finds · ${state.totalWrong} misses`;
    this.el['end-time'].textContent = `Time ${fmtClock(state.timeUsed)} · Best combo ×${state.bestCombo}`;
    this.el['end-best'].textContent = `BEST ${best}`;
    this.el['end-new-best'].classList.toggle('hidden', !isBest);
    const stars = this.el['end-stars'];
    stars.innerHTML = '';
    const n = state.stars();
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.className = `end-star${i < n ? ' lit' : ''}`;
      star.textContent = '★';
      stars.appendChild(star);
    }
  }
}
