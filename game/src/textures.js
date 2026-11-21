// textures.js — procedural canvas texture painters.
//
// Every painter takes the seeded rng of the current panel render, so the two
// panels of a scene come out pixel-identical except for the differences.
// No image assets: all surface detail is drawn in code.

import { floatBetween, intBetween, pick } from './rng.js';

/** Rounded-rectangle path (no fill — caller fills or strokes). */
export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Fill a rounded rectangle. */
export function fillRoundRect(ctx, x, y, w, h, r, color) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = color;
  ctx.fill();
}

/** Stroke a rounded rectangle. */
export function strokeRoundRect(ctx, x, y, w, h, r, color, width = 1) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Vertical linear gradient helper. */
export function vGradient(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

/** Horizontal linear gradient helper. */
export function hGradient(ctx, x0, x1, stops) {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

/**
 * Wood planks: horizontal boards with grain streaks, knots and seams.
 * `tone` is [light, mid, dark] hex triplet; `plankH` the board height.
 */
export function woodPlanks(ctx, x, y, w, h, tone, plankH, rng, vertical = false) {
  const [light, mid, dark] = tone;
  ctx.fillStyle = mid;
  ctx.fillRect(x, y, w, h);
  const count = Math.ceil((vertical ? w : h) / plankH);
  for (let i = 0; i < count; i++) {
    const off = i * plankH;
    // Per-plank shade shift, seeded.
    const shade = floatBetween(rng, -0.06, 0.06);
    ctx.fillStyle = shade >= 0 ? `rgba(255,235,200,${shade})` : `rgba(40,20,5,${-shade})`;
    if (vertical) ctx.fillRect(x + off, y, plankH, h);
    else ctx.fillRect(x, y + off, w, plankH);
    // Grain streaks.
    const streaks = intBetween(rng, 3, 6);
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.16;
    ctx.lineWidth = 1;
    for (let s = 0; s < streaks; s++) {
      ctx.beginPath();
      if (vertical) {
        const gx = x + off + floatBetween(rng, 2, plankH - 2);
        ctx.moveTo(gx, y + 2);
        ctx.bezierCurveTo(
          gx + floatBetween(rng, -4, 4), y + h * 0.33,
          gx + floatBetween(rng, -4, 4), y + h * 0.66,
          gx + floatBetween(rng, -3, 3), y + h - 2,
        );
      } else {
        const gy = y + off + floatBetween(rng, 2, plankH - 2);
        ctx.moveTo(x + 2, gy);
        ctx.bezierCurveTo(
          x + w * 0.33, gy + floatBetween(rng, -3, 3),
          x + w * 0.66, gy + floatBetween(rng, -3, 3),
          x + w - 2, gy + floatBetween(rng, -2, 2),
        );
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Occasional knot.
    if (rng() < 0.35) {
      const kx = vertical ? x + off + plankH / 2 : x + floatBetween(rng, w * 0.15, w * 0.85);
      const ky = vertical ? y + floatBetween(rng, h * 0.15, h * 0.85) : y + off + plankH / 2;
      ctx.fillStyle = dark;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 4, 2.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Seam.
    ctx.fillStyle = dark;
    ctx.globalAlpha = 0.55;
    if (vertical) ctx.fillRect(x + off, y, 1.5, h);
    else ctx.fillRect(x, y + off, w, 1.5);
    ctx.globalAlpha = 1;
  }
  // Highlight along the top edge.
  ctx.fillStyle = light;
  ctx.globalAlpha = 0.12;
  ctx.fillRect(x, y, w, 2);
  ctx.globalAlpha = 1;
}

/**
 * Brick courses with per-brick shade variance and mortar lines.
 */
export function brickWall(ctx, x, y, w, h, base, mortar, rng) {
  ctx.fillStyle = mortar;
  ctx.fillRect(x, y, w, h);
  const bh = 16;
  const bw = 42;
  let row = 0;
  for (let by = y; by < y + h; by += bh, row++) {
    const offset = row % 2 === 0 ? 0 : -bw / 2;
    for (let bx = x + offset; bx < x + w; bx += bw) {
      const v = floatBetween(rng, -14, 14);
      ctx.fillStyle = shadeHex(base, v);
      ctx.fillRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
      // Speckle inside the brick.
      if (rng() < 0.5) {
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        ctx.fillRect(bx + floatBetween(rng, 4, bw - 10), by + floatBetween(rng, 3, bh - 6), 5, 2);
      }
    }
  }
}

/** Lighten/darken a #rrggbb color by delta (-255..255). */
export function shadeHex(hex, delta) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + delta);
  const g = clamp(((n >> 8) & 0xff) + delta);
  const b = clamp((n & 0xff) + delta);
  return `rgb(${r},${g},${b})`;
}

/**
 * Wallpaper: flat base with a subtle repeating motif (diamond + dot).
 */
export function wallpaper(ctx, x, y, w, h, base, motif, rng) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = motif;
  ctx.globalAlpha = 0.16;
  const step = 34;
  for (let my = y + step / 2; my < y + h; my += step) {
    for (let mx = x + step / 2; mx < x + w; mx += step) {
      const ox = ((my / step) | 0) % 2 === 0 ? 0 : step / 2;
      ctx.beginPath();
      ctx.moveTo(mx + ox, my - 5);
      ctx.lineTo(mx + ox + 5, my);
      ctx.lineTo(mx + ox, my + 5);
      ctx.lineTo(mx + ox - 5, my);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx + ox, my, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // Faint vertical wear streaks, seeded.
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = rng() < 0.5 ? '#000' : '#fff';
    ctx.fillRect(x + rng() * w, y, floatBetween(rng, 2, 7), h);
  }
  ctx.globalAlpha = 1;
}

/**
 * Subway tiles: offset rows of glossy tiles with grout.
 */
export function subwayTiles(ctx, x, y, w, h, tile, grout, rng) {
  ctx.fillStyle = grout;
  ctx.fillRect(x, y, w, h);
  const th = 22;
  const tw = 52;
  let row = 0;
  for (let ty = y; ty < y + h; ty += th, row++) {
    const offset = row % 2 === 0 ? 0 : -tw / 2;
    for (let tx = x + offset; tx < x + w; tx += tw) {
      ctx.fillStyle = shadeHex(tile, floatBetween(rng, -8, 8));
      ctx.fillRect(tx + 1, ty + 1, tw - 2, th - 2);
      // Gloss streak on the top of each tile.
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(tx + 2, ty + 2, tw - 4, 4);
    }
  }
}

/**
 * Foliage: layered leaf blobs in 3 tones, deterministic placement.
 * Draws a bush/canopy centered at (cx, cy) with radius r.
 */
export function foliage(ctx, cx, cy, r, tones, rng) {
  const blobs = Math.round(r / 3.2);
  for (let layer = 0; layer < 3; layer++) {
    const tone = tones[layer];
    for (let i = 0; i < blobs; i++) {
      const a = rng() * Math.PI * 2;
      const d = Math.sqrt(rng()) * r * (1 - layer * 0.18);
      const bx = cx + Math.cos(a) * d;
      const by = cy + Math.sin(a) * d * 0.82;
      const br = floatBetween(rng, r * 0.16, r * 0.3);
      ctx.fillStyle = tone;
      ctx.beginPath();
      ctx.ellipse(bx, by, br, br * 0.78, floatBetween(rng, -0.6, 0.6), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Leaf veins / highlights.
  ctx.strokeStyle = 'rgba(255,255,220,0.18)';
  ctx.lineWidth = 1;
  for (let i = 0; i < blobs / 2; i++) {
    const a = rng() * Math.PI * 2;
    const d = Math.sqrt(rng()) * r * 0.8;
    const bx = cx + Math.cos(a) * d;
    const by = cy + Math.sin(a) * d * 0.8;
    ctx.beginPath();
    ctx.moveTo(bx - 4, by);
    ctx.lineTo(bx + 4, by - 3);
    ctx.stroke();
  }
}

/**
 * Single leaf shape (pointed ellipse with a center vein).
 */
export function leaf(ctx, x, y, len, angle, color, vein = 'rgba(0,0,0,0.25)') {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.4, -len * 0.28, len, 0);
  ctx.quadraticCurveTo(len * 0.4, len * 0.28, 0, 0);
  ctx.fill();
  ctx.strokeStyle = vein;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, 0);
  ctx.lineTo(len - 2, 0);
  ctx.stroke();
  ctx.restore();
}

/**
 * Speckle grain over a rect — film grain / paper tooth.
 */
export function grain(ctx, x, y, w, h, rng, alpha = 0.05, count = 900) {
  for (let i = 0; i < count; i++) {
    const v = rng();
    ctx.fillStyle = v < 0.5 ? `rgba(0,0,0,${alpha})` : `rgba(255,255,255,${alpha})`;
    ctx.fillRect(x + rng() * w, y + rng() * h, 1.4, 1.4);
  }
}

/**
 * Soft drop shadow ellipse under an object.
 */
export function groundShadow(ctx, cx, cy, rx, ry, alpha = 0.28) {
  ctx.fillStyle = `rgba(20,10,5,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Radial warm glow (lamp light, candle light).
 */
export function glow(ctx, cx, cy, r, color, alpha = 0.5) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb', 'rgba'));
  g.addColorStop(1, color.replace(')', ',0)').replace('rgb', 'rgba'));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Vignette: darkened corners to focus the eye on the scene.
 */
export function vignette(ctx, w, h, strength = 0.22) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, 'rgba(10,5,0,0)');
  g.addColorStop(1, `rgba(10,5,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Five-point star path. */
export function starPath(ctx, cx, cy, r, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Crescent moon: circle minus offset circle. */
export function crescent(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(cx + r * 0.45, cy - r * 0.18, r * 0.88, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
}

/** Wavy steam: three rising curls above (x, y). */
export function steam(ctx, x, y, alpha = 0.55) {
  ctx.strokeStyle = `rgba(240,240,245,${alpha})`;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (const [dx, h] of [[-7, 22], [0, 28], [7, 20]]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.bezierCurveTo(x + dx - 4, y - h * 0.35, x + dx + 4, y - h * 0.6, x + dx - 1, y - h);
    ctx.stroke();
  }
}

/**
 * Checkerboard floor tiles in perspective-less flat rows (bakery floor).
 */
export function checkerFloor(ctx, x, y, w, h, a, b, tile = 26) {
  let row = 0;
  for (let ty = y; ty < y + h; ty += tile, row++) {
    let col = 0;
    for (let tx = x; tx < x + w; tx += tile, col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? a : b;
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(x, y, w, 3);
}
