// scenes/nook.js — Scene 1: The Reading Nook.
//
// A warm lamplit study: window with a night sky, bookshelf, armchair with a
// sleeping cat, floor lamp, rug and a cup of tea. The gentlest scene —
// differences sit on clear focal objects so the first finds feel fair.
//
// draw(ctx, W, H, applied) paints the scene; `applied` is a Set of difference
// ids rendered in their ALTERED form (right panel). The left panel passes an
// empty set. Book and star layouts are computed once from the scene seed so
// both panels — and the hit-test coordinates — always agree.

import { mulberry32, intBetween, pick } from '../rng.js';
import {
  crescent, fillRoundRect, glow, grain, groundShadow,
  leaf, roundRectPath, steam, strokeRoundRect,
  vGradient, vignette, wallpaper, woodPlanks,
} from '../textures.js';

const BOOK_COLORS = ['#a34a3a', '#3a6ea3', '#4a7a4a', '#c9a227', '#7a4a8a', '#b06a2a', '#2a7a7a', '#8a3a5a'];

// --- Deterministic layouts (computed once, shared by draw + hit tests) ---

function bookLayout(seed) {
  const rng = mulberry32(seed);
  const rows = [];
  for (const boardY of [104, 184, 264]) {
    const books = [];
    let x = 440;
    while (x < 592) {
      const w = intBetween(rng, 11, 17);
      const h = intBetween(rng, 42, 56);
      books.push({ x, y: boardY - h, w, h, color: pick(rng, BOOK_COLORS) });
      x += w + 1.5;
    }
    rows.push(books);
  }
  return rows;
}

function starLayout(seed) {
  const rng = mulberry32(seed);
  const stars = [];
  while (stars.length < 14) {
    const x = 52 + rng() * 128;
    const y = 42 + rng() * 112;
    // Keep clear of the moon at (120, 70): the moon's hit circle (r 22) and
    // the star's (r 18) must never overlap, so the gap must exceed 40.
    if (Math.hypot(x - 120, y - 70) < 42) continue;
    stars.push({ x, y, r: 1 + rng() * 1.6 });
  }
  return stars;
}

const BOOKS = bookLayout(101);
const STARS = starLayout(101);
// The difference book: middle shelf, fourth book from the left.
const DIFF_BOOK = BOOKS[1][3];
// The difference star: fifth star in the window.
const DIFF_STAR = STARS[4];
// Plant leaves: fixed angles so the missing-leaf difference has a known spot.
const PLANT_LEAVES = [
  { angle: -2.4, len: 52 }, { angle: -1.9, len: 64 }, { angle: -1.45, len: 70 },
  { angle: -1.0, len: 62 }, { angle: -0.55, len: 50 }, { angle: -2.85, len: 44 },
  { angle: -0.15, len: 38 },
];
// Missing leaf (index 2) midpoint, in scene coordinates (pot top at 566, 402).
const LEAF_MID = { x: 566 + Math.cos(-1.45) * 35, y: 402 + Math.sin(-1.45) * 35 };

export const nook = {
  id: 'nook',
  name: 'The Reading Nook',
  tagline: 'Lamplight, old books, one sleeping cat.',
  seed: 101,
  timeLimit: 240,
  diffs: [
    { id: 'clock', x: 305, y: 62, r: 24 },
    { id: 'moon', x: 120, y: 70, r: 22 },
    { id: 'book', x: DIFF_BOOK.x + DIFF_BOOK.w / 2, y: DIFF_BOOK.y + DIFF_BOOK.h / 2, r: 20 },
    { id: 'steam', x: 130, y: 255, r: 20 },
    { id: 'leaf', x: Math.round(LEAF_MID.x), y: Math.round(LEAF_MID.y), r: 22 },
    { id: 'rug', x: 330, y: 425, r: 22 },
    { id: 'picture', x: 262, y: 122, r: 24 },
    { id: 'star', x: Math.round(DIFF_STAR.x), y: Math.round(DIFF_STAR.y), r: 18 },
  ],

  draw(ctx, W, H, applied) {
    const rng = mulberry32(this.seed);

    // --- Room shell: wallpaper, wainscot, wooden floor. ---
    wallpaper(ctx, 0, 0, W, 330, '#e6d9bd', '#a98d5f', rng);
    woodPlanks(ctx, 0, 300, W, 30, ['#8a6a42', '#77572f', '#5d4120'], 30, rng);
    woodPlanks(ctx, 0, 330, W, H - 330, ['#a97e4e', '#96683a', '#7a4f26'], 26, rng);
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 328, W, 3);

    // --- Window: night sky, stars, moon, frame, curtains. ---
    ctx.fillStyle = vGradient(ctx, 28, 172, [[0, '#101a33'], [1, '#2a3a5f']]);
    ctx.fillRect(40, 28, 156, 144);
    for (let i = 0; i < STARS.length; i++) {
      if (applied.has('star') && i === 4) continue; // difference: star missing
      const s = STARS[i];
      // The difference star (index 4) is drawn brighter with a halo, so its
      // absence on the right panel is a fair find, not a pixel hunt.
      if (i === 4) {
        ctx.fillStyle = 'rgba(255,250,220,0.25)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,250,220,0.95)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3.2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.fillStyle = 'rgba(255,250,220,0.9)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (applied.has('moon')) {
      ctx.fillStyle = '#f4ecd0'; // difference: full moon
      ctx.beginPath();
      ctx.arc(120, 70, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(180,170,140,0.5)';
      ctx.beginPath();
      ctx.arc(114, 64, 4, 0, Math.PI * 2);
      ctx.arc(126, 76, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      crescent(ctx, 120, 70, 19, '#f4ecd0'); // crescent moon
    }
    // Distant rooftops under the sky.
    ctx.fillStyle = '#0d1526';
    ctx.beginPath();
    ctx.moveTo(40, 172);
    ctx.lineTo(40, 148);
    ctx.lineTo(80, 132);
    ctx.lineTo(118, 150);
    ctx.lineTo(150, 138);
    ctx.lineTo(196, 154);
    ctx.lineTo(196, 172);
    ctx.closePath();
    ctx.fill();
    // Frame + crossbars + sill.
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(36, 24, 164, 6);
    ctx.fillRect(36, 168, 164, 6);
    ctx.fillRect(36, 24, 6, 150);
    ctx.fillRect(194, 24, 6, 150);
    ctx.fillRect(116, 28, 4, 144);
    ctx.fillRect(40, 98, 156, 4);
    fillRoundRect(ctx, 28, 172, 180, 10, 3, '#77572f');
    // Curtains.
    for (const side of [0, 1]) {
      const cx = side === 0 ? 30 : 170;
      const grad = vGradient(ctx, 20, 190, [[0, '#8a3a34'], [1, '#6e2a26']]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx, 20);
      ctx.lineTo(cx + 30, 20);
      ctx.lineTo(cx + 26, 190);
      ctx.lineTo(cx + 4, 190);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.moveTo(cx + 5 + f * 7, 22);
        ctx.lineTo(cx + 6 + f * 7, 188);
        ctx.stroke();
      }
    }

    // --- Framed picture: mountains (left) vs sea (right). ---
    fillRoundRect(ctx, 230, 90, 64, 64, 4, '#5d4120');
    ctx.fillStyle = '#f4ead2';
    ctx.fillRect(236, 96, 52, 52);
    if (applied.has('picture')) {
      // Sea: horizon, water, sun.
      ctx.fillStyle = '#bcd8e8';
      ctx.fillRect(236, 96, 52, 24);
      ctx.fillStyle = '#3a7a9e';
      ctx.fillRect(236, 120, 52, 28);
      ctx.fillStyle = '#f4d35e';
      ctx.beginPath();
      ctx.arc(262, 112, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.moveTo(242, 130);
      ctx.lineTo(254, 130);
      ctx.moveTo(266, 138);
      ctx.lineTo(280, 138);
      ctx.stroke();
    } else {
      // Mountains: peaks, snow, sky.
      ctx.fillStyle = '#bcd8e8';
      ctx.fillRect(236, 96, 52, 52);
      ctx.fillStyle = '#6a7a8a';
      ctx.beginPath();
      ctx.moveTo(236, 148);
      ctx.lineTo(254, 116);
      ctx.lineTo(268, 136);
      ctx.lineTo(280, 118);
      ctx.lineTo(288, 148);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f4f4f4';
      ctx.beginPath();
      ctx.moveTo(254, 116);
      ctx.lineTo(249, 124);
      ctx.lineTo(254, 122);
      ctx.lineTo(259, 124);
      ctx.closePath();
      ctx.fill();
    }

    // --- Wall clock. ---
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.arc(305, 62, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f8f2df';
    ctx.beginPath();
    ctx.arc(305, 62, 23, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    for (let h = 0; h < 12; h++) {
      const a = (h / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(305 + Math.cos(a) * 19, 62 + Math.sin(a) * 19, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    const drawHand = (angle, len, wdt) => {
      ctx.strokeStyle = '#3a2a18';
      ctx.lineWidth = wdt;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(305, 62);
      ctx.lineTo(305 + Math.cos(angle) * len, 62 + Math.sin(angle) * len);
      ctx.stroke();
    };
    if (applied.has('clock')) {
      drawHand(-Math.PI / 2 + (4.5 / 12) * Math.PI * 2, 12, 3); // 4:30 hour
      drawHand(Math.PI / 2, 18, 2); // minute at 6
    } else {
      drawHand(0, 12, 3); // 3:00 hour
      drawHand(-Math.PI / 2, 18, 2); // minute at 12
    }
    ctx.fillStyle = '#a34a3a';
    ctx.beginPath();
    ctx.arc(305, 62, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // --- Bookshelf. ---
    fillRoundRect(ctx, 424, 36, 188, 296, 6, '#6e4a26');
    ctx.fillStyle = '#4a2f16';
    ctx.fillRect(432, 44, 172, 280);
    for (const boardY of [104, 184, 264]) {
      fillRoundRect(ctx, 432, boardY, 172, 8, 2, '#7a5632');
    }
    fillRoundRect(ctx, 424, 324, 188, 8, 3, '#7a5632');
    BOOKS.forEach((row, ri) => {
      row.forEach((b, bi) => {
        let color = b.color;
        if (applied.has('book') && ri === 1 && bi === 3) color = '#2a9a8a'; // difference: teal spine
        ctx.fillStyle = color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.fillRect(b.x + 1.5, b.y + 3, b.w - 3, 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(b.x, b.y + b.h - 6, b.w, 1.5);
        ctx.fillStyle = 'rgba(255,240,200,0.75)';
        ctx.fillRect(b.x + 2, b.y + 9, b.w - 4, 7);
      });
    });
    // Small vase on top of the shelf.
    ctx.fillStyle = '#3a6ea3';
    ctx.beginPath();
    ctx.ellipse(520, 32, 12, 8, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(510, 24, 20, 10);
    ctx.strokeStyle = '#4a7a4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(520, 24);
    ctx.quadraticCurveTo(514, 10, 508, 6);
    ctx.moveTo(520, 24);
    ctx.quadraticCurveTo(526, 10, 532, 8);
    ctx.stroke();
    ctx.fillStyle = '#c95a7a';
    ctx.beginPath();
    ctx.arc(508, 6, 3.4, 0, Math.PI * 2);
    ctx.arc(532, 8, 3.4, 0, Math.PI * 2);
    ctx.fill();

    // --- Rug (under the chair). ---
    ctx.fillStyle = '#7a3a34';
    ctx.beginPath();
    ctx.ellipse(330, 428, 152, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a34a3a';
    ctx.beginPath();
    ctx.ellipse(330, 428, 128, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8d9a0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(330, 428, 108, 18, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (!applied.has('rug')) {
      // Difference: center diamond present on the left, gone on the right.
      ctx.fillStyle = '#e8d9a0';
      ctx.beginPath();
      ctx.moveTo(330, 412);
      ctx.lineTo(348, 425);
      ctx.lineTo(330, 438);
      ctx.lineTo(312, 425);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#7a3a34';
      ctx.beginPath();
      ctx.moveTo(330, 418);
      ctx.lineTo(340, 425);
      ctx.lineTo(330, 432);
      ctx.lineTo(320, 425);
      ctx.closePath();
      ctx.fill();
    }

    // --- Side table + teacup. ---
    groundShadow(ctx, 130, 382, 46, 8);
    fillRoundRect(ctx, 92, 282, 76, 10, 3, '#6e4a26');
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(100, 292, 7, 88);
    ctx.fillRect(153, 292, 7, 88);
    ctx.fillRect(100, 340, 60, 6);
    // Teacup.
    ctx.fillStyle = '#f4f0e2';
    ctx.beginPath();
    ctx.ellipse(130, 276, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d94f3d';
    ctx.beginPath();
    ctx.moveTo(110, 276);
    ctx.quadraticCurveTo(112, 290, 130, 290);
    ctx.quadraticCurveTo(148, 290, 150, 276);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#d94f3d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(151, 281, 6, -1.2, 1.2);
    ctx.stroke();
    ctx.fillStyle = '#8a5a2a';
    ctx.beginPath();
    ctx.ellipse(130, 276, 15, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!applied.has('steam')) steam(ctx, 130, 268); // difference: steam gone

    // --- Floor lamp + warm glow. ---
    glow(ctx, 376, 150, 120, 'rgb(255,190,90)', 0.35);
    groundShadow(ctx, 376, 382, 30, 7);
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(373, 190, 6, 186);
    ctx.beginPath();
    ctx.ellipse(376, 380, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath();
    ctx.moveTo(352, 190);
    ctx.lineTo(400, 190);
    ctx.lineTo(392, 138);
    ctx.lineTo(360, 138);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(360, 138);
    ctx.lineTo(368, 138);
    ctx.lineTo(364, 190);
    ctx.lineTo(358, 190);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    ctx.fillRect(374, 128, 4, 12);
    ctx.beginPath();
    ctx.arc(376, 126, 4, 0, Math.PI * 2);
    ctx.fill();

    // --- Armchair + sleeping cat. ---
    groundShadow(ctx, 260, 396, 78, 10);
    const chair = (fill) => {
      ctx.fillStyle = fill;
      roundRectPath(ctx, 196, 232, 128, 130, 22);
      ctx.fill();
      roundRectPath(ctx, 188, 286, 26, 84, 12);
      ctx.fill();
      roundRectPath(ctx, 306, 286, 26, 84, 12);
      ctx.fill();
      roundRectPath(ctx, 206, 316, 108, 26, 10);
      ctx.fill();
    };
    chair('#8a4a34');
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    roundRectPath(ctx, 206, 242, 108, 60, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(210, 250 + i * 14);
      ctx.lineTo(310, 250 + i * 14);
      ctx.stroke();
    }
    // Wooden legs.
    ctx.fillStyle = '#4a2f16';
    ctx.fillRect(200, 360, 10, 26);
    ctx.fillRect(310, 360, 10, 26);
    // Cat, curled asleep on the seat.
    ctx.fillStyle = '#2e2a33';
    ctx.beginPath();
    ctx.ellipse(262, 312, 34, 16, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(288, 302, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(278, 292);
    ctx.lineTo(281, 281);
    ctx.lineTo(288, 290);
    ctx.closePath();
    ctx.moveTo(292, 290);
    ctx.lineTo(298, 281);
    ctx.lineTo(300, 293);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e2a33';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(230, 316);
    ctx.quadraticCurveTo(218, 306, 228, 296);
    ctx.stroke();
    ctx.fillStyle = '#f4ecd0';
    ctx.beginPath();
    ctx.ellipse(262, 318, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Closed-eye curve.
    ctx.strokeStyle = '#f4ecd0';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(292, 301, 3, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // --- Potted plant (bottom right). ---
    groundShadow(ctx, 566, 448, 40, 8);
    PLANT_LEAVES.forEach((lf, i) => {
      if (applied.has('leaf') && i === 2) return; // difference: leaf missing
      leaf(ctx, 566, 402, lf.len, lf.angle, i % 2 ? '#3f7a3a' : '#4c8a44');
    });
    ctx.fillStyle = '#b06a2a';
    ctx.beginPath();
    ctx.moveTo(542, 402);
    ctx.lineTo(590, 402);
    ctx.lineTo(582, 448);
    ctx.lineTo(550, 448);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a4f1e';
    ctx.fillRect(540, 398, 52, 8);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fillRect(548, 408, 8, 34);

    grain(ctx, 0, 0, W, H, rng, 0.035, 700);
    vignette(ctx, W, H, 0.2);
  },
};
