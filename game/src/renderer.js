// renderer.js — paints the two panels and every play effect on top.
//
// The static scene is rendered once per scene into two offscreen canvases
// (left: no differences applied, right: all applied). Each frame composites
// the offscreen image plus markers, hint rings, click effects, score
// floaters and the keyboard crosshair. Nothing here mutates game state.

import { SCENE_W, SCENE_H } from './scenes/index.js';

const MARKER_COLOR = '#ffd23d';
const MARKER_GLOW = 'rgba(255,210,61,0.55)';

function easeOutBack(t) {
  const c = 1.70158;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
}

export class PanelRenderer {
  constructor(canvasL, canvasR, state) {
    this.canvasL = canvasL;
    this.canvasR = canvasR;
    this.ctxL = canvasL.getContext('2d');
    this.ctxR = canvasR.getContext('2d');
    this.state = state;
    this.offL = document.createElement('canvas');
    this.offR = document.createElement('canvas');
    this.offL.width = this.offR.width = SCENE_W;
    this.offL.height = this.offR.height = SCENE_H;
    this.scene = null;
    // Animation records: diffId -> timestamp the find landed.
    this.foundAt = new Map();
    // Transient effects.
    this.sparks = []; // {panel, x, y, vx, vy, born, life, color}
    this.wrongs = []; // {panel, x, y, born}
    this.floaters = []; // {panel, x, y, text, born}
    // Keyboard crosshair: {panel: 0|1, x, y, visible}.
    this.crosshair = { panel: 0, x: SCENE_W / 2, y: SCENE_H / 2, visible: false };
  }

  /** Render the static scene into both offscreen canvases. */
  loadScene(scene) {
    this.scene = scene;
    this.foundAt.clear();
    this.sparks = [];
    this.wrongs = [];
    this.floaters = [];
    const ctxL = this.offL.getContext('2d');
    const ctxR = this.offR.getContext('2d');
    ctxL.clearRect(0, 0, SCENE_W, SCENE_H);
    ctxR.clearRect(0, 0, SCENE_W, SCENE_H);
    scene.draw(ctxL, SCENE_W, SCENE_H, new Set());
    const all = new Set(scene.diffs.map((d) => d.id));
    scene.draw(ctxR, SCENE_W, SCENE_H, all);
    // First paint immediately so no frame is ever blank.
    this.render(performance.now());
  }

  /** Offscreen canvas for a panel (0 = left, 1 = right) — magnifier source. */
  offscreenFor(panel) {
    return panel === 0 ? this.offL : this.offR;
  }

  /** Record a find: marker pop + sparkle burst + score floater. */
  markFound(diff, points, nowMs) {
    this.foundAt.set(diff.id, nowMs);
    for (const panel of [0, 1]) {
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 + Math.random() * 0.5;
        const speed = 40 + Math.random() * 90;
        this.sparks.push({
          panel,
          x: diff.x,
          y: diff.y,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 30,
          born: nowMs,
          life: 500 + Math.random() * 300,
          color: i % 3 === 0 ? '#fff3b0' : MARKER_COLOR,
        });
      }
      this.floaters.push({ panel, x: diff.x, y: diff.y - 30, text: `+${points}`, born: nowMs });
    }
  }

  /** Record a wrong click: red X puff on the clicked panel. */
  markWrong(panel, x, y, nowMs) {
    this.wrongs.push({ panel, x, y, born: nowMs });
  }

  setCrosshair(panel, x, y, visible) {
    this.crosshair = { panel, x, y, visible };
  }

  /** Composite one frame onto both visible canvases. */
  render(nowMs) {
    if (!this.scene) return;
    this.renderPanel(this.ctxL, this.offL, 0, nowMs);
    this.renderPanel(this.ctxR, this.offR, 1, nowMs);
    // Prune finished effects.
    this.sparks = this.sparks.filter((s) => nowMs - s.born < s.life);
    this.wrongs = this.wrongs.filter((w) => nowMs - w.born < 650);
    this.floaters = this.floaters.filter((f) => nowMs - f.born < 1100);
  }

  renderPanel(ctx, off, panel, nowMs) {
    ctx.clearRect(0, 0, SCENE_W, SCENE_H);
    ctx.drawImage(off, 0, 0);

    // Hint highlight: pulsing dashed ring on both panels.
    const hintId = this.state.hintTarget;
    if (hintId) {
      const diff = this.scene.diffs.find((d) => d.id === hintId);
      if (diff) {
        const remain = Math.max(0, this.state.hintExpiresAt - nowMs);
        const pulse = 1 + Math.sin(nowMs / 130) * 0.08;
        ctx.save();
        ctx.globalAlpha = Math.min(1, remain / 500);
        ctx.strokeStyle = '#7ad0ff';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(diff.x, diff.y, diff.r * pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Found markers: golden ring with a pop-in, then a steady glow ring.
    for (const diff of this.scene.diffs) {
      if (!this.state.found.has(diff.id)) continue;
      const born = this.foundAt.get(diff.id) ?? nowMs;
      // Clamp: the rAF timestamp can predate the click handler's
      // performance.now() by a few ms in the same frame; a negative age
      // would drive easeOutBack below zero and throw on arc().
      const age = Math.max(0, nowMs - born);
      const pop = age < 320 ? Math.max(0, easeOutBack(Math.min(age / 320, 1))) : 1;
      const r = diff.r * pop;
      ctx.save();
      ctx.strokeStyle = MARKER_COLOR;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = MARKER_GLOW;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Small check tick at the ring's lower right.
      const cx = diff.x + r * 0.62;
      const cy = diff.y + r * 0.62;
      ctx.fillStyle = MARKER_COLOR;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a2a10';
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx - 1, cy + 3.4);
      ctx.lineTo(cx + 4.4, cy - 3.4);
      ctx.stroke();
      ctx.restore();
    }

    // Sparkle burst particles (skip any that outlived their life — a
    // stalled frame can push t past 1, which would flip the radius negative).
    for (const s of this.sparks) {
      if (s.panel !== panel) continue;
      const t = (nowMs - s.born) / s.life;
      if (t >= 1) continue;
      const x = s.x + s.vx * (t * s.life) / 1000;
      const y = s.y + s.vy * (t * s.life) / 1000 + 90 * t * t;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.1, 2.6 * (1 - t * 0.6)), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Wrong-click X puffs.
    for (const w of this.wrongs) {
      if (w.panel !== panel) continue;
      const t = (nowMs - w.born) / 650;
      if (t >= 1) continue;
      ctx.save();
      ctx.globalAlpha = 1 - t;
      ctx.strokeStyle = '#ff5a4d';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      const r = 9 + t * 6;
      ctx.beginPath();
      ctx.moveTo(w.x - r, w.y - r);
      ctx.lineTo(w.x + r, w.y + r);
      ctx.moveTo(w.x + r, w.y - r);
      ctx.lineTo(w.x - r, w.y + r);
      ctx.stroke();
      ctx.restore();
    }

    // Score floaters.
    for (const f of this.floaters) {
      if (f.panel !== panel) continue;
      const t = (nowMs - f.born) / 1100;
      if (t >= 1) continue;
      ctx.save();
      ctx.globalAlpha = 1 - t * t;
      ctx.font = 'bold 17px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(40,25,5,0.85)';
      ctx.strokeText(f.text, f.x, f.y - t * 26);
      ctx.fillStyle = '#ffd23d';
      ctx.fillText(f.text, f.x, f.y - t * 26);
      ctx.restore();
    }

    // Keyboard crosshair on the active panel.
    const ch = this.crosshair;
    if (ch.visible && ch.panel === panel && this.state.screen === 'play') {
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.arc(ch.x, ch.y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(ch.x - 22, ch.y);
      ctx.lineTo(ch.x - 10, ch.y);
      ctx.moveTo(ch.x + 10, ch.y);
      ctx.lineTo(ch.x + 22, ch.y);
      ctx.moveTo(ch.x, ch.y - 22);
      ctx.lineTo(ch.x, ch.y - 10);
      ctx.moveTo(ch.x, ch.y + 10);
      ctx.lineTo(ch.x, ch.y + 22);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ch.x, ch.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
