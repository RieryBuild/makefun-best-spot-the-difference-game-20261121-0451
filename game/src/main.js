// main.js — boot, game loop and wiring.
//
// Owns the frame loop (timer, hint expiry, render, HUD), the guess
// resolution (hit test → find or miss) and every button. The modules do
// the work; this file connects them.

import { SCENES, SCENE_W, SCENE_H } from './scenes/index.js';
import { GameState } from './state.js';
import { PanelRenderer } from './renderer.js';
import { Magnifier } from './magnifier.js';
import { Input } from './input.js';
import { Hud } from './hud.js';
import {
  ensureAudio, playFind, playWrong, playHint, playTick, playCountdown,
  playSceneClear, playWin, playTimeout, setMuted, isMuted,
} from './audio.js';

const $ = (id) => document.getElementById(id);

const state = new GameState();
const hud = new Hud();
const renderer = new PanelRenderer($('panel-left'), $('panel-right'), state);
const magnifier = new Magnifier($('lens'), $('lens-canvas'), renderer);

// --- Scene loading -------------------------------------------------------

function loadScene() {
  renderer.loadScene(state.scene);
  hud.buildFoundDots(state.scene.diffs.length);
  input.resetCrosshair();
  magnifier.hide();
  hud.update(state);
}

// --- Guess resolution ----------------------------------------------------

function resolveGuess(panel, x, y) {
  if (state.screen !== 'play' || state.paused) return;
  ensureAudio();
  const nowMs = performance.now();
  // Clicking an already-found marker is not a miss — the player is
  // re-checking a spot they already own. Ignore it silently.
  for (const d of state.scene.diffs) {
    if (state.found.has(d.id) && Math.hypot(d.x - x, d.y - y) <= d.r) return;
  }
  // Nearest unfound difference within its hit radius.
  let best = null;
  let bestDist = Infinity;
  for (const d of state.scene.diffs) {
    if (state.found.has(d.id)) continue;
    const dist = Math.hypot(d.x - x, d.y - y);
    if (dist <= d.r && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  if (best) {
    const points = state.registerFind(best.id);
    renderer.markFound(best, points, nowMs);
    playFind(state.combo);
    if (state.screen === 'sceneClear') {
      playSceneClear();
      hud.fillSceneClear(state);
      hud.showScreen('sceneClear');
    }
  } else {
    state.registerWrong();
    renderer.markWrong(panel, x, y, nowMs);
    playWrong();
    // Brief shake on the clicked panel.
    const canvas = panel === 0 ? $('panel-left') : $('panel-right');
    canvas.classList.remove('shake');
    void canvas.offsetWidth; // restart the animation
    canvas.classList.add('shake');
  }
  hud.update(state);
}

// --- Actions ---------------------------------------------------------------

function startRun() {
  ensureAudio();
  playTick();
  state.startRun();
  loadScene();
  hud.showScreen('play');
}

function advanceScene() {
  ensureAudio();
  playTick();
  state.nextScene();
  if (state.screen === 'end') {
    playWin();
    hud.fillEnd(state);
    hud.showScreen('end');
  } else {
    loadScene();
    hud.showScreen('play');
  }
}

function retryScene() {
  ensureAudio();
  playTick();
  state.retryScene();
  loadScene();
  hud.showScreen('play');
}

function restartScene() {
  if (state.screen !== 'play') return;
  playTick();
  state.retryScene();
  loadScene();
  hud.update(state);
}

function useHint() {
  if (state.screen !== 'play' || state.paused) return;
  ensureAudio();
  const target = state.useHint(performance.now());
  if (target) {
    playHint();
  } else {
    // No hints left: shake the hint button.
    const btn = $('btn-hint');
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
  }
  hud.update(state);
}

function toggleMagnifier() {
  ensureAudio();
  playTick();
  magnifier.setEnabled(!magnifier.isEnabled());
  $('btn-mag').classList.toggle('active', magnifier.isEnabled());
}

function toggleSound() {
  ensureAudio();
  const muted = setMuted(!isMuted());
  $('btn-sound').classList.toggle('muted', muted);
  if (!muted) playTick();
}

function togglePause() {
  if (state.screen !== 'play') return;
  state.paused = !state.paused;
  playTick();
  hud.showScreen(state.paused ? 'pause' : 'play');
}

function goMenu() {
  playTick();
  state.resetAll();
  loadScene();
  hud.fillTitle(state.loadBest());
  hud.showScreen('title');
}

// --- Input wiring ----------------------------------------------------------

const input = new Input($('panel-left'), $('panel-right'), {
  getScreen: () => (state.paused ? 'pause' : state.screen),
  onGuess: resolveGuess,
  onHover: (panel, x, y, clientX, clientY) => {
    if (state.screen === 'play' && !state.paused) magnifier.update(panel, x, y, clientX, clientY);
    else magnifier.hide();
  },
  onHoverEnd: () => magnifier.hide(),
  onCrosshair: (panel, x, y, visible) => renderer.setCrosshair(panel, x, y, visible),
  onHint: useHint,
  onMagnifierToggle: toggleMagnifier,
  onPauseToggle: togglePause,
  onRestart: restartScene,
  onMenu: goMenu,
  onAdvance: advanceScene,
  onRetry: retryScene,
  onStart: startRun,
});

// Hide the crosshair as soon as the mouse moves over a panel.
for (const id of ['panel-left', 'panel-right']) {
  $(id).addEventListener('mousemove', () => input.hideCrosshair());
}

// --- Buttons ---------------------------------------------------------------

$('btn-play').addEventListener('click', startRun);
$('btn-hint').addEventListener('click', useHint);
$('btn-mag').addEventListener('click', toggleMagnifier);
$('btn-sound').addEventListener('click', toggleSound);
$('btn-pause').addEventListener('click', togglePause);
$('btn-restart').addEventListener('click', restartScene);
$('btn-menu').addEventListener('click', goMenu);
$('btn-help').addEventListener('click', () => hud.showHelp(true));
$('btn-help-close').addEventListener('click', () => hud.showHelp(false));
$('btn-next').addEventListener('click', advanceScene);
$('btn-retry').addEventListener('click', retryScene);
$('btn-timeout-menu').addEventListener('click', goMenu);
$('btn-again').addEventListener('click', startRun);
$('btn-resume').addEventListener('click', togglePause);
$('btn-pause-menu').addEventListener('click', () => {
  state.paused = false;
  goMenu();
});

// --- Title preview: a live render of scene 1 behind the title. -------------

function paintTitlePreview() {
  const preview = $('title-preview');
  const pctx = preview.getContext('2d');
  const scale = preview.width / SCENE_W;
  pctx.save();
  pctx.scale(scale, scale);
  SCENES[0].draw(pctx, SCENE_W, SCENE_H, new Set());
  pctx.restore();
}

// --- Responsive panel sizing -----------------------------------------------

function fitPanels() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const headerH = 64;
  const footerH = 58;
  const dotsH = 26;
  const pad = 32;
  const gap = 18;
  const availW = (vw - pad - gap) / 2;
  const availH = vh - headerH - footerH - dotsH - pad;
  const w = Math.max(280, Math.min(availW, availH * (SCENE_W / SCENE_H)));
  const h = w * (SCENE_H / SCENE_W);
  for (const id of ['panel-left', 'panel-right']) {
    const c = $(id);
    c.style.width = `${Math.floor(w)}px`;
    c.style.height = `${Math.floor(h)}px`;
  }
}

window.addEventListener('resize', fitPanels);

// --- Frame loop --------------------------------------------------------------

let lastNow = performance.now();

function frame(nowMs) {
  const dt = Math.min(0.1, (nowMs - lastNow) / 1000);
  lastNow = nowMs;
  if (state.screen === 'play' && !state.paused) {
    const result = state.tick(dt);
    // Countdown ticks in the last 10 seconds.
    const whole = state.wholeSeconds;
    if (whole !== state.lastTickSecond) {
      state.lastTickSecond = whole;
      if (whole <= 10 && whole > 0) playCountdown();
    }
    if (result === 'timeout') {
      playTimeout();
      hud.fillTimeout(state);
      hud.showScreen('timeout');
    }
  }
  state.expireHint(nowMs);
  renderer.render(nowMs);
  hud.update(state);
  requestAnimationFrame(frame);
}

// --- Boot --------------------------------------------------------------------

paintTitlePreview();
loadScene();
hud.fillTitle(state.loadBest());
hud.showScreen('title');
fitPanels();
requestAnimationFrame(frame);
