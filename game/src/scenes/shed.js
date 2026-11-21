// scenes/shed.js — Scene 3: The Garden Shed.
//
// A cluttered potting shed: pegboard tools, seed packets, terracotta pots,
// a wheelbarrow and vines creeping through the window. The clutter is the
// difficulty — differences hide among many similar shapes.

import { mulberry32 } from '../rng.js';
import {
  fillRoundRect, foliage, glow, grain, groundShadow, leaf, roundRectPath,
  vGradient, vignette, woodPlanks,
} from '../textures.js';

export const shed = {
  id: 'shed',
  name: 'The Garden Shed',
  tagline: 'Tools, seeds and soil — everything twice over.',
  seed: 303,
  timeLimit: 210,
  diffs: [
    { id: 'hammer', x: 150, y: 128, r: 22 }, // pegboard hammer present vs gone
    { id: 'spout', x: 544, y: 355, r: 24 }, // watering-can spout up vs down
    { id: 'pot', x: 360, y: 180, r: 20 }, // middle pot: terracotta vs blue
    { id: 'packet', x: 419, y: 244, r: 20 }, // seed packets 4 vs 3
    { id: 'bulb', x: 560, y: 96, r: 20 }, // hanging bulb lit vs dark
    { id: 'boot', x: 140, y: 420, r: 24 }, // boot pair vs single boot
    { id: 'flower', x: 616, y: 384, r: 20 }, // vine flowers 3 vs 2
    { id: 'bird', x: 528, y: 68, r: 20 }, // bird on the windowsill vs gone
  ],

  draw(ctx, W, H, applied) {
    const rng = mulberry32(this.seed);

    // --- Shed shell: vertical plank walls, plank floor. ---
    woodPlanks(ctx, 0, 0, W, 330, ['#9a7a52', '#8a6a42', '#6e4f2a'], 34, rng, true);
    woodPlanks(ctx, 0, 330, W, H - 330, ['#a97e4e', '#96683a', '#7a4f26'], 26, rng);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, 328, W, 3);
    // Roof beam.
    woodPlanks(ctx, 0, 0, W, 22, ['#6e4f2a', '#5d4120', '#4a2f16'], 22, rng);

    // --- Window (right): garden outside, bird on the sill. ---
    ctx.fillStyle = vGradient(ctx, 30, 150, [[0, '#a8d8e8'], [1, '#e8f4d8']]);
    ctx.fillRect(480, 30, 130, 120);
    // Garden bushes outside.
    ctx.fillStyle = '#4c8a44';
    ctx.beginPath();
    ctx.arc(510, 142, 26, 0, Math.PI * 2);
    ctx.arc(552, 148, 30, 0, Math.PI * 2);
    ctx.arc(592, 140, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3f7a3a';
    ctx.beginPath();
    ctx.arc(530, 150, 18, 0, Math.PI * 2);
    ctx.arc(575, 150, 16, 0, Math.PI * 2);
    ctx.fill();
    // Fence.
    ctx.fillStyle = '#c9b896';
    for (let fx = 486; fx < 606; fx += 14) {
      ctx.fillRect(fx, 118, 9, 32);
    }
    ctx.fillRect(482, 126, 126, 5);
    // Bird — difference: present on the left, gone on the right.
    if (!applied.has('bird')) {
      ctx.fillStyle = '#3a6ea3';
      ctx.beginPath();
      ctx.ellipse(528, 66, 11, 8, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(537, 60, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f4a93a';
      ctx.beginPath();
      ctx.moveTo(542, 60);
      ctx.lineTo(548, 62);
      ctx.lineTo(542, 64);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(524, 74);
      ctx.lineTo(524, 80);
      ctx.moveTo(530, 74);
      ctx.lineTo(530, 80);
      ctx.stroke();
      ctx.fillStyle = '#2a4a6a';
      ctx.beginPath();
      ctx.moveTo(520, 62);
      ctx.lineTo(512, 58);
      ctx.lineTo(516, 68);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(476, 26, 138, 6);
    ctx.fillRect(476, 146, 138, 6);
    ctx.fillRect(476, 26, 6, 126);
    ctx.fillRect(608, 26, 6, 126);
    ctx.fillRect(544, 30, 4, 120);
    fillRoundRect(ctx, 468, 152, 154, 10, 3, '#77572f');

    // --- Hanging bulb (right, lit or dark). ---
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(560, 22);
    ctx.lineTo(560, 72);
    ctx.stroke();
    if (!applied.has('bulb')) glow(ctx, 560, 96, 90, 'rgb(255,220,130)', 0.5);
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(554, 70, 12, 10);
    if (applied.has('bulb')) {
      ctx.fillStyle = '#c9c9c9'; // dark bulb
      ctx.beginPath();
      ctx.arc(560, 96, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a8a8a';
      ctx.beginPath();
      ctx.arc(560, 96, 5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#fff2b8'; // lit bulb
      ctx.beginPath();
      ctx.arc(560, 96, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(555, 92);
      ctx.lineTo(558, 100);
      ctx.lineTo(562, 92);
      ctx.lineTo(565, 100);
      ctx.stroke();
    }

    // --- Pegboard with tools (left). ---
    fillRoundRect(ctx, 36, 48, 220, 180, 8, '#7a5a34');
    ctx.fillStyle = '#6e4f2a';
    ctx.fillRect(44, 56, 204, 164);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    for (let py = 66; py < 216; py += 14) {
      for (let px = 54; px < 240; px += 14) {
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Hammer — difference: present on the left, gone on the right.
    if (!applied.has('hammer')) {
      ctx.save();
      ctx.translate(150, 128);
      ctx.rotate(-0.5);
      ctx.fillStyle = '#c9a06a';
      roundRectPath(ctx, -5, -10, 10, 62, 4);
      ctx.fill();
      ctx.fillStyle = '#8a8a92';
      fillRoundRect(ctx, -24, -22, 48, 18, 4, '#8a8a92');
      ctx.fillStyle = '#6e6e76';
      ctx.fillRect(-24, -8, 48, 4);
      ctx.restore();
    }
    // Hand saw.
    ctx.save();
    ctx.translate(84, 130);
    ctx.rotate(0.35);
    ctx.fillStyle = '#b8bcc2';
    ctx.beginPath();
    ctx.moveTo(-6, -34);
    ctx.lineTo(34, -20);
    ctx.lineTo(34, 6);
    ctx.lineTo(-6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a4a34';
    fillRoundRect(ctx, -18, -30, 14, 34, 4, '#8a4a34');
    ctx.restore();
    // Shears.
    ctx.save();
    ctx.translate(206, 128);
    ctx.rotate(0.2);
    ctx.strokeStyle = '#8a8a92';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-8, -28);
    ctx.lineTo(6, 26);
    ctx.moveTo(8, -28);
    ctx.lineTo(-6, 26);
    ctx.stroke();
    ctx.strokeStyle = '#a34a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-10, -32, 6, 0, Math.PI * 2);
    ctx.arc(10, -32, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    // Trowel.
    ctx.save();
    ctx.translate(110, 190);
    ctx.rotate(-0.15);
    ctx.fillStyle = '#6e4a26';
    fillRoundRect(ctx, -4, -26, 8, 22, 3, '#6e4a26');
    ctx.fillStyle = '#b8bcc2';
    ctx.beginPath();
    ctx.moveTo(-9, -4);
    ctx.quadraticCurveTo(0, 26, 9, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Coiled rope.
    ctx.strokeStyle = '#c9b896';
    ctx.lineWidth = 5;
    for (const r of [6, 12, 18]) {
      ctx.beginPath();
      ctx.arc(196, 192, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- Shelf with pots (center). ---
    fillRoundRect(ctx, 280, 196, 160, 10, 3, '#77572f');
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(288, 206, 8, 12);
    ctx.fillRect(424, 206, 8, 12);
    const pot = (x, color, plant) => {
      groundShadow(ctx, x, 196, 22, 4, 0.2);
      if (plant) {
        leaf(ctx, x - 4, 172, 22, -2.2, '#4c8a44');
        leaf(ctx, x + 2, 168, 26, -1.5, '#3f7a3a');
        leaf(ctx, x + 8, 172, 20, -0.8, '#4c8a44');
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x - 18, 166);
      ctx.lineTo(x + 18, 166);
      ctx.lineTo(x + 13, 196);
      ctx.lineTo(x - 13, 196);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x - 19, 164, 38, 5);
    };
    pot(302, '#b06a2a', true);
    // Difference: middle pot terracotta vs blue.
    pot(360, applied.has('pot') ? '#3a6ea3' : '#b06a2a', false);
    pot(418, '#b06a2a', true);

    // --- Seed packets pinned under the shelf. ---
    const packet = (x, color, label) => {
      ctx.fillStyle = color;
      fillRoundRect(ctx, x, 222, 34, 44, 3, color);
      ctx.fillStyle = '#f4f0e2';
      ctx.fillRect(x + 4, 228, 26, 14);
      ctx.fillStyle = '#3a3a2a';
      ctx.font = 'bold 8px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + 17, 238);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.arc(x + 17, 222, 2.5, 0, Math.PI * 2);
      ctx.fill();
    };
    packet(288, '#c95a7a', 'ROSE');
    packet(326, '#e8a33d', 'SUN');
    packet(364, '#7a9a3a', 'PEA');
    if (!applied.has('packet')) packet(402, '#3a6ea3', 'SKY'); // difference: 4th packet

    // --- Workbench (bottom center-left). ---
    groundShadow(ctx, 250, 452, 170, 10);
    woodPlanks(ctx, 90, 330, 330, 16, ['#a97e4e', '#96683a', '#7a4f26'], 16, rng);
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(100, 346, 12, 106);
    ctx.fillRect(398, 346, 12, 106);
    ctx.fillRect(100, 396, 310, 10);
    // Soil pile + trowel on the bench.
    ctx.fillStyle = '#4a3220';
    ctx.beginPath();
    ctx.ellipse(170, 330, 46, 12, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#5d4120';
    ctx.beginPath();
    ctx.ellipse(170, 328, 30, 7, 0, Math.PI, 0);
    ctx.fill();
    // Small seedlings in a tray.
    ctx.fillStyle = '#3a3a42';
    fillRoundRect(ctx, 250, 312, 90, 18, 3, '#3a3a42');
    for (let i = 0; i < 4; i++) {
      const sx = 264 + i * 20;
      ctx.strokeStyle = '#4c8a44';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 312);
      ctx.lineTo(sx, 300);
      ctx.stroke();
      leaf(ctx, sx, 300, 9, -2.2, '#4c8a44');
      leaf(ctx, sx, 300, 9, -0.9, '#3f7a3a');
    }
    // Twine ball.
    ctx.fillStyle = '#c9b896';
    ctx.beginPath();
    ctx.arc(386, 318, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.arc(386, 318, 8, 0.4, 2.4);
    ctx.arc(386, 318, 5, 2.8, 5.4);
    ctx.stroke();

    // --- Watering can (right of bench). ---
    groundShadow(ctx, 480, 452, 52, 8);
    ctx.fillStyle = '#5a7a8a';
    ctx.beginPath();
    ctx.ellipse(480, 330, 34, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(446, 330, 68, 62);
    ctx.beginPath();
    ctx.ellipse(480, 392, 34, 10, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(452, 336, 8, 50);
    // Spout — difference: points up on the left, down on the right.
    ctx.strokeStyle = '#5a7a8a';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (applied.has('spout')) {
      ctx.moveTo(508, 352);
      ctx.quadraticCurveTo(540, 360, 542, 388);
    } else {
      ctx.moveTo(508, 352);
      ctx.quadraticCurveTo(540, 348, 548, 322);
    }
    ctx.stroke();
    ctx.fillStyle = '#4a6a7a';
    ctx.beginPath();
    ctx.arc(applied.has('spout') ? 542 : 548, applied.has('spout') ? 390 : 320, 7, 0, Math.PI * 2);
    ctx.fill();
    // Handle.
    ctx.strokeStyle = '#4a6a7a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(452, 344);
    ctx.quadraticCurveTo(428, 330, 434, 306);
    ctx.quadraticCurveTo(440, 296, 452, 302);
    ctx.stroke();

    // --- Boots (bottom left). ---
    const boot = (x, flip) => {
      ctx.save();
      ctx.translate(x, 424);
      ctx.scale(flip ? -1 : 1, 1);
      groundShadow(ctx, 0, 30, 30, 6);
      ctx.fillStyle = '#2a5a34';
      ctx.beginPath();
      ctx.moveTo(-12, -38);
      ctx.lineTo(8, -38);
      ctx.lineTo(8, 12);
      ctx.lineTo(26, 12);
      ctx.lineTo(26, 26);
      ctx.lineTo(-12, 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e4026';
      ctx.fillRect(-12, 22, 38, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(-8, -34, 6, 52);
      ctx.restore();
    };
    boot(96, false);
    if (!applied.has('boot')) boot(140, true); // difference: second boot gone

    // --- Vine with flowers (right edge). ---
    ctx.strokeStyle = '#3f7a3a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(628, 200);
    ctx.bezierCurveTo(606, 240, 628, 280, 610, 330);
    ctx.bezierCurveTo(600, 360, 622, 400, 612, 440);
    ctx.stroke();
    leaf(ctx, 616, 240, 22, -2.6, '#4c8a44');
    leaf(ctx, 612, 300, 22, -0.5, '#3f7a3a');
    leaf(ctx, 614, 370, 20, -2.6, '#4c8a44');
    const flower = (x, y) => {
      ctx.fillStyle = '#c95a7a';
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * 6, y + Math.sin(a) * 6, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    };
    flower(612, 222);
    flower(604, 300);
    if (!applied.has('flower')) flower(616, 384); // difference: 3rd flower gone

    // --- Wheelbarrow (bottom right, behind the can). ---
    ctx.fillStyle = '#3a6ea3';
    ctx.beginPath();
    ctx.moveTo(560, 400);
    ctx.lineTo(628, 400);
    ctx.lineTo(616, 440);
    ctx.lineTo(572, 440);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a5a8a';
    ctx.fillRect(556, 396, 76, 8);
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(596, 446, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a8a92';
    ctx.beginPath();
    ctx.arc(596, 446, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6e4a26';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(556, 410);
    ctx.lineTo(536, 420);
    ctx.stroke();

    grain(ctx, 0, 0, W, H, rng, 0.04, 700);
    vignette(ctx, W, H, 0.22);
  },
};
