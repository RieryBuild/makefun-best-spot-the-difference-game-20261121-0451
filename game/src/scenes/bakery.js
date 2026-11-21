// scenes/bakery.js — Scene 2: The Baker's Counter.
//
// A sunlit bakery: chalkboard menu, shelves of jam jars, bread trays, a
// wood-fired oven and hanging utensils. Busier than the Nook — the hunt
// starts to demand real scanning.

import { mulberry32, intBetween } from '../rng.js';
import {
  checkerFloor, fillRoundRect, glow, grain, groundShadow, leaf,
  roundRectPath, steam, subwayTiles, vGradient, vignette, woodPlanks,
} from '../textures.js';

const JAR_COLORS = ['#c94f4f', '#d98a2a', '#7a9a3a'];

export const bakery = {
  id: 'bakery',
  name: "The Baker's Counter",
  tagline: 'Warm bread, chalk prices, jam jars in a row.',
  seed: 202,
  timeLimit: 240,
  diffs: [
    { id: 'price', x: 382, y: 104, r: 18 }, // chalk numeral 3 vs 5
    { id: 'loaves', x: 470, y: 292, r: 24 }, // 3 loaves vs 4
    { id: 'jar', x: 548, y: 120, r: 20 }, // middle jar: red jam vs green
    { id: 'ladle', x: 108, y: 230, r: 26 }, // hanging ladle present vs gone
    { id: 'croissant', x: 222, y: 298, r: 20 }, // 2 croissants vs 3
    { id: 'dial', x: 560, y: 430, r: 18 }, // oven dial angle
    { id: 'sack', x: 92, y: 402, r: 24 }, // flour sack tied vs open
    { id: 'sun', x: 96, y: 76, r: 22 }, // sun vs cloud in the window
  ],

  draw(ctx, W, H, applied) {
    const rng = mulberry32(this.seed);

    // --- Room: tiled wall, checker floor, wooden counter. ---
    subwayTiles(ctx, 0, 0, W, 250, '#f2ead8', '#cbbd9d', rng);
    checkerFloor(ctx, 0, 250, W, H - 250, '#e8ddc2', '#8a6a42', 30);
    woodPlanks(ctx, 0, 250, W, 14, ['#a97e4e', '#96683a', '#7a4f26'], 14, rng);
    // Counter front (bottom band).
    woodPlanks(ctx, 0, 372, W, 108, ['#8a6a42', '#77572f', '#5d4120'], 27, rng);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 370, W, 3);

    // --- Window: daylight, sun or cloud. ---
    ctx.fillStyle = vGradient(ctx, 30, 170, [[0, '#9ed0e8'], [1, '#dceef5']]);
    ctx.fillRect(52, 30, 140, 140);
    if (applied.has('sun')) {
      // Cloud instead of sun.
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(80, 82, 16, 0, Math.PI * 2);
      ctx.arc(100, 72, 20, 0, Math.PI * 2);
      ctx.arc(120, 82, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(66, 82, 68, 12);
    } else {
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(96, 76, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f4d35e';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(96 + Math.cos(a) * 25, 76 + Math.sin(a) * 25);
        ctx.lineTo(96 + Math.cos(a) * 32, 76 + Math.sin(a) * 32);
        ctx.stroke();
      }
    }
    // Rooftops + a tree outside.
    ctx.fillStyle = '#7a8a9a';
    ctx.beginPath();
    ctx.moveTo(52, 170);
    ctx.lineTo(52, 140);
    ctx.lineTo(90, 122);
    ctx.lineTo(128, 142);
    ctx.lineTo(160, 130);
    ctx.lineTo(192, 146);
    ctx.lineTo(192, 170);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#4c8a44';
    ctx.beginPath();
    ctx.arc(168, 128, 14, 0, Math.PI * 2);
    ctx.arc(180, 138, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(48, 26, 148, 6);
    ctx.fillRect(48, 166, 148, 6);
    ctx.fillRect(48, 26, 6, 146);
    ctx.fillRect(190, 26, 6, 146);
    ctx.fillRect(120, 30, 4, 140);
    fillRoundRect(ctx, 40, 172, 164, 10, 3, '#77572f');

    // --- Chalkboard menu. ---
    fillRoundRect(ctx, 232, 34, 176, 110, 8, '#5d4120');
    ctx.fillStyle = '#2e3a2e';
    ctx.fillRect(240, 42, 160, 94);
    ctx.fillStyle = '#f4f0e2';
    ctx.font = 'bold 15px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('— TODAY —', 320, 62);
    ctx.font = '13px Georgia, serif';
    ctx.textAlign = 'left';
    ctx.fillText('Sourdough', 252, 86);
    ctx.fillText('Croissant', 252, 108);
    ctx.fillText('Seed loaf', 252, 128);
    ctx.textAlign = 'right';
    ctx.fillText('4', 388, 86);
    // Difference: croissant price 3 vs 5.
    ctx.fillText(applied.has('price') ? '5' : '3', 388, 108);
    ctx.fillText('6', 388, 128);
    ctx.strokeStyle = 'rgba(244,240,226,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(252, 70);
    ctx.lineTo(388, 70);
    ctx.stroke();
    // Chalk dust.
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let i = 0; i < 14; i++) {
      ctx.fillRect(244 + rng() * 150, 46 + rng() * 84, 1.6, 1.6);
    }

    // --- Jar shelf (top right). ---
    fillRoundRect(ctx, 452, 148, 160, 10, 3, '#77572f');
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(460, 158, 8, 14);
    ctx.fillRect(596, 158, 8, 14);
    const jars = [486, 548, 600];
    jars.forEach((jx, i) => {
      const jy = 148;
      const color = applied.has('jar') && i === 1 ? '#7a9a3a' : JAR_COLORS[i];
      groundShadow(ctx, jx, jy + 2, 24, 4, 0.2);
      ctx.fillStyle = 'rgba(230,240,250,0.35)';
      roundRectPath(ctx, jx - 20, jy - 52, 40, 52, 6);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.fillRect(jx - 17, jy - 40, 34, 38);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(jx - 14, jy - 48, 6, 44);
      ctx.fillStyle = '#c9a227';
      fillRoundRect(ctx, jx - 21, jy - 60, 42, 10, 3, '#c9a227');
      ctx.fillStyle = '#f4f0e2';
      ctx.fillRect(jx - 12, jy - 30, 24, 12);
    });

    // --- Utensil rail (left wall). ---
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(60, 196, 120, 5);
    ctx.beginPath();
    ctx.arc(62, 198, 4, 0, Math.PI * 2);
    ctx.arc(178, 198, 4, 0, Math.PI * 2);
    ctx.fill();
    const hang = (x, drawTool) => {
      ctx.strokeStyle = '#4a4a52';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 201);
      ctx.lineTo(x, 214);
      ctx.stroke();
      drawTool(x);
    };
    // Whisk.
    hang(70, (x) => {
      ctx.strokeStyle = '#8a8a92';
      ctx.lineWidth = 2.5;
      for (const off of [-6, 0, 6]) {
        ctx.beginPath();
        ctx.moveTo(x, 214);
        ctx.quadraticCurveTo(x + off, 232, x, 248);
        ctx.stroke();
      }
      ctx.fillStyle = '#6e4a26';
      ctx.fillRect(x - 2.5, 212, 5, 10);
    });
    // Ladle — the difference: present on the left, gone on the right.
    if (!applied.has('ladle')) {
      hang(108, (x) => {
        ctx.strokeStyle = '#8a8a92';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, 214);
        ctx.lineTo(x, 240);
        ctx.stroke();
        ctx.fillStyle = '#9a9aa2';
        ctx.beginPath();
        ctx.arc(x, 246, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6e6e76';
        ctx.beginPath();
        ctx.arc(x, 246, 5.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    // Spatula.
    hang(146, (x) => {
      ctx.fillStyle = '#6e4a26';
      ctx.fillRect(x - 2.5, 214, 5, 22);
      ctx.fillStyle = '#3a3a42';
      fillRoundRect(ctx, x - 8, 234, 16, 18, 4, '#3a3a42');
    });

    // --- Counter top: bread tray, croissants, cake stand. ---
    // Bread tray (right of center).
    groundShadow(ctx, 470, 330, 90, 9);
    fillRoundRect(ctx, 392, 318, 164, 12, 4, '#8a8a92');
    ctx.fillStyle = '#6e6e76';
    ctx.fillRect(400, 330, 148, 4);
    const loaf = (x, y, w) => {
      ctx.fillStyle = '#c98a3a';
      ctx.beginPath();
      ctx.ellipse(x, y, w, 17, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(x - w, y - 1, w * 2, 8);
      ctx.fillStyle = '#a86a22';
      ctx.beginPath();
      ctx.ellipse(x, y + 6, w, 6, 0, 0, Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#8a4f1e';
      ctx.lineWidth = 2;
      for (const off of [-0.5, 0, 0.5]) {
        ctx.beginPath();
        ctx.moveTo(x + off * w - 6, y - 12);
        ctx.lineTo(x + off * w + 6, y - 4);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255,235,200,0.35)';
      ctx.beginPath();
      ctx.ellipse(x - w * 0.3, y - 9, w * 0.4, 4, -0.3, 0, Math.PI * 2);
      ctx.fill();
    };
    loaf(420, 316, 26);
    loaf(470, 312, 28);
    loaf(522, 316, 26);
    if (applied.has('loaves')) loaf(470, 288, 24); // difference: 4th loaf stacked
    // Croissant plate (left of center).
    groundShadow(ctx, 220, 330, 62, 8);
    ctx.fillStyle = '#f4f0e2';
    ctx.beginPath();
    ctx.ellipse(220, 326, 58, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9b896';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(220, 326, 58, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    const croissant = (x, y, s) => {
      ctx.fillStyle = '#d9a03a';
      ctx.beginPath();
      ctx.moveTo(x - 22 * s, y);
      ctx.quadraticCurveTo(x - 10 * s, y - 20 * s, x, y - 8 * s);
      ctx.quadraticCurveTo(x + 10 * s, y - 20 * s, x + 22 * s, y);
      ctx.quadraticCurveTo(x + 10 * s, y + 4 * s, x, y + 2 * s);
      ctx.quadraticCurveTo(x - 10 * s, y + 4 * s, x - 22 * s, y);
      ctx.fill();
      ctx.strokeStyle = '#a86a22';
      ctx.lineWidth = 1.5;
      for (const off of [-0.45, 0, 0.45]) {
        ctx.beginPath();
        ctx.moveTo(x + off * 30 * s, y - 12 * s);
        ctx.lineTo(x + off * 30 * s + 3, y - 2 * s);
        ctx.stroke();
      }
    };
    croissant(202, 314, 0.9);
    croissant(240, 310, 0.85);
    if (applied.has('croissant')) croissant(222, 296, 0.8); // difference: 3rd croissant
    // Cake stand with a frosted cake.
    groundShadow(ctx, 330, 332, 48, 7);
    ctx.fillStyle = '#e8e2d2';
    ctx.beginPath();
    ctx.ellipse(330, 330, 44, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(326, 306, 8, 24);
    ctx.beginPath();
    ctx.ellipse(330, 306, 40, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c95a7a';
    fillRoundRect(ctx, 306, 280, 48, 26, 5, '#c95a7a');
    ctx.fillStyle = '#f4f0e2';
    fillRoundRect(ctx, 306, 280, 48, 9, 5, '#f4f0e2');
    ctx.fillStyle = '#c95a7a';
    for (const dx of [0, 12, 24, 36]) {
      ctx.beginPath();
      ctx.arc(310 + dx, 289, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#a34a3a';
    ctx.beginPath();
    ctx.arc(330, 274, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a7a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(330, 274);
    ctx.lineTo(330, 268);
    ctx.stroke();

    // --- Oven (bottom right) with dial. ---
    fillRoundRect(ctx, 500, 340, 120, 108, 8, '#3a3a42');
    ctx.fillStyle = '#22222a';
    fillRoundRect(ctx, 510, 352, 100, 56, 6, '#22222a');
    glow(ctx, 560, 380, 60, 'rgb(255,150,60)', 0.55);
    ctx.fillStyle = '#ff9a3d';
    ctx.beginPath();
    ctx.moveTo(522, 402);
    ctx.quadraticCurveTo(530, 372, 540, 396);
    ctx.quadraticCurveTo(548, 370, 558, 398);
    ctx.quadraticCurveTo(568, 374, 578, 400);
    ctx.quadraticCurveTo(590, 378, 598, 402);
    ctx.lineTo(598, 408);
    ctx.lineTo(522, 408);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a8a92';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(510, 352);
    ctx.lineTo(610, 352);
    ctx.moveTo(510, 408);
    ctx.lineTo(610, 408);
    ctx.stroke();
    // Dial — difference: pointer angle.
    ctx.fillStyle = '#e8e2d2';
    ctx.beginPath();
    ctx.arc(560, 430, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a3a42';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(560, 430);
    const dialAngle = applied.has('dial') ? Math.PI * 0.75 : -Math.PI * 0.25;
    ctx.lineTo(560 + Math.cos(dialAngle) * 8, 430 + Math.sin(dialAngle) * 8);
    ctx.stroke();
    ctx.fillStyle = '#3a3a42';
    ctx.beginPath();
    ctx.arc(560, 430, 2, 0, Math.PI * 2);
    ctx.fill();

    // --- Flour sack (bottom left). ---
    groundShadow(ctx, 92, 452, 52, 8);
    ctx.fillStyle = '#e8ddc2';
    ctx.beginPath();
    ctx.moveTo(58, 452);
    ctx.lineTo(62, 400);
    ctx.quadraticCurveTo(92, 388, 122, 400);
    ctx.lineTo(126, 452);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(66, 410);
    ctx.lineTo(64, 448);
    ctx.moveTo(118, 410);
    ctx.lineTo(120, 448);
    ctx.stroke();
    if (applied.has('sack')) {
      // Open sack: folded rim, flour puff.
      ctx.fillStyle = '#d8cba6';
      ctx.beginPath();
      ctx.ellipse(92, 398, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8f4e8';
      ctx.beginPath();
      ctx.ellipse(92, 396, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(248,244,232,0.8)';
      ctx.beginPath();
      ctx.arc(76, 388, 5, 0, Math.PI * 2);
      ctx.arc(104, 384, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tied sack: cinched neck + bow.
      ctx.fillStyle = '#c9b896';
      ctx.beginPath();
      ctx.moveTo(78, 398);
      ctx.quadraticCurveTo(92, 388, 106, 398);
      ctx.lineTo(102, 384);
      ctx.quadraticCurveTo(92, 378, 82, 384);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#a34a3a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(80, 396);
      ctx.lineTo(104, 396);
      ctx.stroke();
    }
    ctx.fillStyle = '#7a6a4a';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLOUR', 92, 432);

    // --- Herb pot on the counter (left). ---
    groundShadow(ctx, 300, 366, 26, 5);
    leaf(ctx, 292, 356, 26, -2.2, '#4c8a44');
    leaf(ctx, 300, 352, 30, -1.6, '#3f7a3a');
    leaf(ctx, 308, 356, 24, -0.9, '#4c8a44');
    ctx.fillStyle = '#b06a2a';
    ctx.beginPath();
    ctx.moveTo(286, 356);
    ctx.lineTo(314, 356);
    ctx.lineTo(310, 372);
    ctx.lineTo(290, 372);
    ctx.closePath();
    ctx.fill();

    // --- Rolling pin resting on the counter edge. ---
    ctx.save();
    ctx.translate(160, 352);
    ctx.rotate(0.12);
    ctx.fillStyle = '#c9a06a';
    roundRectPath(ctx, -44, -7, 88, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#8a6a42';
    ctx.fillRect(-56, -3, 12, 6);
    ctx.fillRect(44, -3, 12, 6);
    ctx.restore();

    steam(ctx, 420, 282, 0.35);
    grain(ctx, 0, 0, W, H, rng, 0.03, 600);
    vignette(ctx, W, H, 0.18);
  },
};
