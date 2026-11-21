// input.js — mouse + keyboard play.
//
// Mouse: click either panel to test a spot. Keyboard: arrows move a
// crosshair, Tab switches panels, Enter/Space tests the crosshair spot,
// H hints, M toggles the magnifier, P pauses, R restarts the scene,
// Esc returns to the title. All actions flow through callbacks into
// main.js; this module owns no game state beyond the crosshair.

import { SCENE_W, SCENE_H } from './scenes/index.js';

const ARROW_STEP = 14;
const ARROW_FINE = 4;

export class Input {
  constructor(canvasL, canvasR, callbacks) {
    this.canvasL = canvasL;
    this.canvasR = canvasR;
    this.cb = callbacks;
    // One remembered crosshair position per panel.
    this.cross = [
      { x: SCENE_W / 2, y: SCENE_H / 2 },
      { x: SCENE_W / 2, y: SCENE_H / 2 },
    ];
    this.activePanel = 0;
    this.crosshairVisible = false;
    this.bind();
  }

  bind() {
    const canvases = [this.canvasL, this.canvasR];
    canvases.forEach((canvas, panel) => {
      canvas.addEventListener('click', (e) => {
        const { x, y } = this.toSceneCoords(canvas, e);
        this.cb.onGuess(panel, x, y);
      });
      canvas.addEventListener('mousemove', (e) => {
        const { x, y } = this.toSceneCoords(canvas, e);
        this.cb.onHover(panel, x, y, e.clientX, e.clientY);
      });
      canvas.addEventListener('mouseleave', () => this.cb.onHoverEnd());
    });
    document.addEventListener('keydown', (e) => this.onKey(e));
  }

  toSceneCoords(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SCENE_W,
      y: ((e.clientY - rect.top) / rect.height) * SCENE_H,
    };
  }

  onKey(e) {
    const screen = this.cb.getScreen();
    // Title screen: Enter/Space starts.
    if (screen === 'title') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.cb.onStart();
      }
      return;
    }
    // Scene-clear: N, Enter or Space advances.
    if (screen === 'sceneClear') {
      if (e.key === 'n' || e.key === 'N' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.cb.onAdvance();
      }
      return;
    }
    // End screen: Enter restarts.
    if (screen === 'end') {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.cb.onStart();
      }
      return;
    }
    // Timeout: R retries, Esc goes to the title.
    if (screen === 'timeout') {
      if (e.key === 'r' || e.key === 'R') this.cb.onRetry();
      if (e.key === 'Escape') this.cb.onMenu();
      return;
    }
    // Pause: P or Esc resumes.
    if (screen === 'pause') {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') this.cb.onPauseToggle();
      return;
    }
    if (screen !== 'play') return;

    const step = e.shiftKey ? ARROW_FINE : ARROW_STEP;
    const pos = this.cross[this.activePanel];
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        pos.y = Math.max(0, pos.y - step);
        this.showCrosshair();
        break;
      case 'ArrowDown':
        e.preventDefault();
        pos.y = Math.min(SCENE_H, pos.y + step);
        this.showCrosshair();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        pos.x = Math.max(0, pos.x - step);
        this.showCrosshair();
        break;
      case 'ArrowRight':
        e.preventDefault();
        pos.x = Math.min(SCENE_W, pos.x + step);
        this.showCrosshair();
        break;
      case 'Tab':
        e.preventDefault();
        this.activePanel = 1 - this.activePanel;
        this.showCrosshair();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.showCrosshair();
        this.cb.onGuess(this.activePanel, pos.x, pos.y);
        break;
      case 'h':
      case 'H':
        this.cb.onHint();
        break;
      case 'm':
      case 'M':
        this.cb.onMagnifierToggle();
        break;
      case 'p':
      case 'P':
        this.cb.onPauseToggle();
        break;
      case 'r':
      case 'R':
        this.cb.onRestart();
        break;
      case 'Escape':
        this.cb.onMenu();
        break;
      default:
        break;
    }
  }

  showCrosshair() {
    this.crosshairVisible = true;
    const pos = this.cross[this.activePanel];
    this.cb.onCrosshair(this.activePanel, pos.x, pos.y, true);
  }

  hideCrosshair() {
    this.crosshairVisible = false;
    const pos = this.cross[this.activePanel];
    this.cb.onCrosshair(this.activePanel, pos.x, pos.y, false);
  }

  /** Reset the crosshair when a new scene loads. */
  resetCrosshair() {
    this.cross = [
      { x: SCENE_W / 2, y: SCENE_H / 2 },
      { x: SCENE_W / 2, y: SCENE_H / 2 },
    ];
    this.activePanel = 0;
    if (this.crosshairVisible) this.showCrosshair();
  }
}
