// magnifier.js — the inspection lens.
//
// A circular 2x lens that follows the mouse over a panel, fed from the
// renderer's offscreen scene canvas (so it shows the pristine scene, not
// the markers). Toggled with M or the HUD button; it only appears while
// the pointer is over a panel during play.

export class Magnifier {
  constructor(lensEl, lensCanvas, renderer) {
    this.el = lensEl;
    this.canvas = lensCanvas;
    this.ctx = lensCanvas.getContext('2d');
    this.renderer = renderer;
    this.enabled = false;
    this.active = false;
    this.ZOOM = 2;
    this.SIZE = 180; // lens diameter in CSS pixels
    this.canvas.width = this.SIZE;
    this.canvas.height = this.SIZE;
  }

  setEnabled(on) {
    this.enabled = on;
    if (!on) this.hide();
  }

  isEnabled() {
    return this.enabled;
  }

  hide() {
    this.active = false;
    this.el.style.display = 'none';
  }

  /**
   * Update the lens from a pointer position over a panel canvas.
   * `sceneX/sceneY` are coordinates in the 640x480 scene space;
   * `clientX/clientY` position the lens element on the page.
   */
  update(panel, sceneX, sceneY, clientX, clientY) {
    if (!this.enabled) {
      this.hide();
      return;
    }
    const src = this.renderer.offscreenFor(panel);
    const half = this.SIZE / 2 / this.ZOOM; // source half-size in scene px
    const sx = Math.max(0, Math.min(640 - half * 2, sceneX - half));
    const sy = Math.max(0, Math.min(480 - half * 2, sceneY - half));
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.SIZE / 2, this.SIZE / 2, this.SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(src, sx, sy, half * 2, half * 2, 0, 0, this.SIZE, this.SIZE);
    // Subtle inner shading + crosshair ticks.
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.SIZE / 2, this.SIZE / 2, this.SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.SIZE / 2 - 10, this.SIZE / 2);
    ctx.lineTo(this.SIZE / 2 + 10, this.SIZE / 2);
    ctx.moveTo(this.SIZE / 2, this.SIZE / 2 - 10);
    ctx.lineTo(this.SIZE / 2, this.SIZE / 2 + 10);
    ctx.stroke();
    ctx.restore();
    // Place the lens offset from the cursor so it never covers the spot.
    const offsetX = 24;
    const offsetY = -this.SIZE - 16;
    this.el.style.display = 'block';
    this.el.style.left = `${clientX + offsetX}px`;
    this.el.style.top = `${clientY + offsetY}px`;
    this.active = true;
  }
}
