// scenes/observatory.js — Scene 4: The Observatory Balcony.
//
// A night balcony under a star field: telescope, star chart, lantern,
// notebook and a ringed planet. The hardest scene — dark palette, small
// differences, and the sky itself is the hiding place.

import { mulberry32 } from '../rng.js';
import {
  crescent, fillRoundRect, glow, grain, groundShadow, leaf, roundRectPath,
  starPath, steam, vGradient, vignette, woodPlanks,
} from '../textures.js';

// Fixed star field (computed once so hit-test coordinates are stable).
function skyStars(seed) {
  const rng = mulberry32(seed);
  const stars = [];
  while (stars.length < 60) {
    const x = 12 + rng() * 616;
    const y = 12 + rng() * 250;
    if (Math.hypot(x - 530, y - 62) < 46) continue; // keep clear of the moon
    if (Math.hypot(x - 130, y - 90) < 40) continue; // keep clear of the planet
    stars.push({ x, y, r: 0.8 + rng() * 1.5 });
  }
  return stars;
}

const SKY = skyStars(404);
// Constellation: five stars joined by faint lines (upper left-center).
const CONSTELLATION = [
  { x: 250, y: 60 }, { x: 285, y: 88 }, { x: 322, y: 66 },
  { x: 348, y: 104 }, { x: 300, y: 122 },
];
// The missing constellation star is index 2 (322, 66).

export const observatory = {
  id: 'observatory',
  name: 'The Observatory Balcony',
  tagline: 'One clear night, one patient telescope.',
  seed: 404,
  timeLimit: 180,
  diffs: [
    { id: 'comet', x: 452, y: 52, r: 24 }, // comet present vs gone
    { id: 'constellation', x: 322, y: 66, r: 20 }, // constellation star missing
    { id: 'telescope', x: 310, y: 327, r: 40 }, // telescope tube angle (wide radius: both tube ends)
    { id: 'lantern', x: 480, y: 342, r: 22 }, // table lantern flame: warm vs blue
    { id: 'notebook', x: 532, y: 357, r: 22 }, // notebook sketch: moon vs star
    { id: 'steam', x: 592, y: 336, r: 18 }, // mug steam present vs gone
    { id: 'ring', x: 130, y: 90, r: 24 }, // planet ring present vs gone
    { id: 'snow', x: 340, y: 248, r: 20 }, // mountain snow cap present vs gone
  ],

  draw(ctx, W, H, applied) {
    const rng = mulberry32(this.seed);

    // --- Night sky + star field. ---
    ctx.fillStyle = vGradient(ctx, 0, 300, [[0, '#0a1024'], [0.6, '#16233f'], [1, '#2a3550']]);
    ctx.fillRect(0, 0, W, 300);
    for (const s of SKY) {
      ctx.fillStyle = 'rgba(255,250,230,0.85)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // A few brighter stars with cross sparkle.
    for (const [bx, by] of [[60, 40], [210, 130], [420, 150], [590, 140], [360, 40]]) {
      ctx.fillStyle = 'rgba(255,255,240,0.95)';
      ctx.beginPath();
      ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,240,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bx - 6, by);
      ctx.lineTo(bx + 6, by);
      ctx.moveTo(bx, by - 6);
      ctx.lineTo(bx, by + 6);
      ctx.stroke();
    }
    // Constellation with faint join lines. When the middle star is the
    // missing difference, the lines touching it go too — the gap in the
    // shape is part of the find.
    ctx.strokeStyle = 'rgba(180,200,255,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (applied.has('constellation')) {
      ctx.moveTo(CONSTELLATION[0].x, CONSTELLATION[0].y);
      ctx.lineTo(CONSTELLATION[1].x, CONSTELLATION[1].y);
      ctx.moveTo(CONSTELLATION[3].x, CONSTELLATION[3].y);
      ctx.lineTo(CONSTELLATION[4].x, CONSTELLATION[4].y);
    } else {
      ctx.moveTo(CONSTELLATION[0].x, CONSTELLATION[0].y);
      for (let i = 1; i < CONSTELLATION.length; i++) {
        ctx.lineTo(CONSTELLATION[i].x, CONSTELLATION[i].y);
      }
    }
    ctx.stroke();
    CONSTELLATION.forEach((s, i) => {
      if (applied.has('constellation') && i === 2) return; // difference: star gone
      ctx.fillStyle = '#dfe8ff';
      starPath(ctx, s.x, s.y, 5);
      ctx.fill();
    });
    // Comet — difference: present on the left, gone on the right.
    if (!applied.has('comet')) {
      const grad = ctx.createLinearGradient(452, 52, 400, 96);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(452, 52);
      ctx.lineTo(402, 96);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(452, 52, 4.5, 0, Math.PI * 2);
      ctx.fill();
      glow(ctx, 452, 52, 22, 'rgb(200,220,255)', 0.5);
    }
    // Ringed planet — difference: ring present on the left, gone on the right.
    ctx.fillStyle = '#c98a5a';
    ctx.beginPath();
    ctx.arc(130, 90, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a86a3a';
    ctx.beginPath();
    ctx.ellipse(130, 84, 18, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(130, 98, 15, 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    if (!applied.has('ring')) {
      ctx.strokeStyle = 'rgba(240,220,180,0.85)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(130, 90, 36, 10, -0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Moon (upper right).
    glow(ctx, 530, 62, 70, 'rgb(240,235,200)', 0.4);
    crescent(ctx, 530, 62, 26, '#f4ecd0');

    // --- Mountain silhouette + snow cap difference. ---
    ctx.fillStyle = '#1a2438';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(0, 250);
    ctx.lineTo(80, 210);
    ctx.lineTo(150, 252);
    ctx.lineTo(230, 200);
    ctx.lineTo(310, 258);
    ctx.lineTo(340, 238); // the snow-capped peak
    ctx.lineTo(390, 262);
    ctx.lineTo(470, 214);
    ctx.lineTo(560, 254);
    ctx.lineTo(640, 220);
    ctx.lineTo(640, 300);
    ctx.closePath();
    ctx.fill();
    if (!applied.has('snow')) {
      ctx.fillStyle = '#e8ecf4';
      ctx.beginPath();
      ctx.moveTo(340, 238);
      ctx.lineTo(326, 254);
      ctx.lineTo(334, 252);
      ctx.lineTo(340, 258);
      ctx.lineTo(347, 251);
      ctx.lineTo(354, 254);
      ctx.closePath();
      ctx.fill();
    }
    // Distant town lights.
    ctx.fillStyle = 'rgba(255,200,110,0.8)';
    for (const [tx, ty] of [[60, 268], [120, 276], [210, 272], [430, 270], [520, 276], [600, 268]]) {
      ctx.fillRect(tx, ty, 3, 3);
    }

    // --- Balcony floor + railing. ---
    woodPlanks(ctx, 0, 300, W, H - 300, ['#6e5638', '#5d452a', '#4a3018'], 30, rng);
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(0, 296, W, 6);
    // Railing: posts + two rails, drawn in front of the sky edge.
    ctx.fillStyle = '#3a2c20';
    for (let px = 20; px < W; px += 80) {
      ctx.fillRect(px, 268, 8, 34);
    }
    ctx.fillRect(0, 264, W, 7);
    ctx.fillRect(0, 284, W, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(0, 264, W, 2);

    // --- Telescope on tripod (center-left). ---
    groundShadow(ctx, 250, 448, 70, 9);
    ctx.strokeStyle = '#4a3a28';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(250, 340);
    ctx.lineTo(214, 448);
    ctx.moveTo(250, 340);
    ctx.lineTo(250, 448);
    ctx.moveTo(250, 340);
    ctx.lineTo(286, 448);
    ctx.stroke();
    ctx.fillStyle = '#6e5638';
    ctx.beginPath();
    ctx.arc(250, 340, 12, 0, Math.PI * 2);
    ctx.fill();
    // Tube — difference: angled up-left vs up-right.
    ctx.save();
    ctx.translate(250, 330);
    ctx.rotate(applied.has('telescope') ? 0.5 : -0.6);
    const tubeGrad = vGradient(ctx, -16, 16, [[0, '#5a7a9a'], [0.5, '#3a5a7a'], [1, '#2a4460']]);
    ctx.fillStyle = tubeGrad;
    roundRectPath(ctx, -70, -15, 140, 30, 12);
    ctx.fill();
    ctx.fillStyle = '#1a2a3a';
    ctx.beginPath();
    ctx.ellipse(70, 0, 6, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8ec8e8';
    ctx.beginPath();
    ctx.ellipse(70, 0, 3.5, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a227';
    ctx.fillRect(-58, -15, 8, 30);
    ctx.fillRect(46, -15, 8, 30);
    // Finder scope.
    ctx.fillStyle = '#2a2a32';
    fillRoundRect(ctx, -20, -26, 34, 9, 4, '#2a2a32');
    ctx.restore();
    // Eyepiece + focus knobs.
    ctx.fillStyle = '#2a2a32';
    ctx.beginPath();
    ctx.arc(250, 348, 6, 0, Math.PI * 2);
    ctx.fill();

    // --- Star chart on an easel (right-center). ---
    ctx.strokeStyle = '#4a3a28';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(392, 300);
    ctx.lineTo(376, 448);
    ctx.moveTo(392, 300);
    ctx.lineTo(408, 448);
    ctx.stroke();
    ctx.fillStyle = '#f4ead2';
    ctx.save();
    ctx.translate(392, 318);
    ctx.rotate(-0.04);
    ctx.fillRect(-34, -52, 68, 92);
    ctx.strokeStyle = '#5d4120';
    ctx.lineWidth = 3;
    ctx.strokeRect(-34, -52, 68, 92);
    ctx.strokeStyle = 'rgba(58,80,120,0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-20, -30);
    ctx.lineTo(0, -10);
    ctx.lineTo(18, -28);
    ctx.lineTo(8, 8);
    ctx.lineTo(-12, 14);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = '#3a5078';
    for (const [sx, sy] of [[-20, -30], [0, -10], [18, -28], [8, 8], [-12, 14]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3a5078';
    ctx.font = 'bold 8px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('LYRA', 0, 32);
    ctx.restore();

    // --- Side table with lantern, notebook, mug. ---
    groundShadow(ctx, 520, 452, 84, 9);
    woodPlanks(ctx, 440, 372, 170, 12, ['#8a6a42', '#77572f', '#5d4120'], 12, rng);
    ctx.fillStyle = '#5d4120';
    ctx.fillRect(450, 384, 9, 68);
    ctx.fillRect(592, 384, 9, 68);
    // Lantern — difference: warm flame vs cold blue flame.
    const flameWarm = !applied.has('lantern');
    glow(ctx, 480, 344, 60, flameWarm ? 'rgb(255,190,90)' : 'rgb(120,170,255)', 0.5);
    ctx.fillStyle = '#2a2a32';
    fillRoundRect(ctx, 466, 316, 28, 8, 3, '#2a2a32');
    ctx.beginPath();
    ctx.arc(480, 314, 6, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,244,200,0.9)';
    ctx.fillRect(468, 324, 24, 36);
    ctx.fillStyle = flameWarm ? '#ff9a3d' : '#6aa8ff';
    ctx.beginPath();
    ctx.moveTo(480, 330);
    ctx.quadraticCurveTo(486, 340, 484, 348);
    ctx.quadraticCurveTo(480, 352, 476, 348);
    ctx.quadraticCurveTo(474, 340, 480, 330);
    ctx.fill();
    ctx.fillStyle = '#2a2a32';
    ctx.fillRect(466, 360, 28, 6);
    ctx.strokeStyle = '#2a2a32';
    ctx.lineWidth = 2;
    ctx.strokeRect(468, 324, 24, 36);
    // Notebook — difference: moon sketch vs star sketch.
    ctx.save();
    ctx.translate(532, 356);
    ctx.rotate(0.08);
    ctx.fillStyle = '#f4ead2';
    fillRoundRect(ctx, -22, -14, 44, 30, 2, '#f4ead2');
    ctx.strokeStyle = '#8a7a5a';
    ctx.lineWidth = 1;
    for (let ly = -6; ly < 14; ly += 6) {
      ctx.beginPath();
      ctx.moveTo(-18, ly);
      ctx.lineTo(18, ly);
      ctx.stroke();
    }
    if (applied.has('notebook')) {
      ctx.fillStyle = '#3a5078';
      starPath(ctx, 0, -8, 6);
      ctx.fill();
    } else {
      crescent(ctx, 0, -8, 6, '#3a5078');
    }
    ctx.restore();
    // Mug with steam — difference: steam present vs gone.
    ctx.fillStyle = '#3a6ea3';
    ctx.beginPath();
    ctx.moveTo(576, 356);
    ctx.quadraticCurveTo(578, 372, 592, 372);
    ctx.quadraticCurveTo(606, 372, 608, 356);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#2a5a8a';
    ctx.beginPath();
    ctx.ellipse(592, 356, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a6ea3';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(609, 362, 5, -1.2, 1.2);
    ctx.stroke();
    if (!applied.has('steam')) steam(ctx, 592, 348, 0.5);

    // --- Lantern post (left foreground) + stool. ---
    groundShadow(ctx, 96, 452, 40, 8);
    ctx.fillStyle = '#2a2018';
    ctx.fillRect(92, 300, 8, 148);
    ctx.fillStyle = '#3a2c20';
    ctx.beginPath();
    ctx.arc(96, 300, 12, 0, Math.PI);
    ctx.fill();
    glow(ctx, 96, 330, 55, 'rgb(255,190,90)', 0.4);
    ctx.fillStyle = '#2a2a32';
    fillRoundRect(ctx, 82, 316, 28, 8, 3, '#2a2a32');
    ctx.fillStyle = 'rgba(255,244,200,0.9)';
    ctx.fillRect(84, 324, 24, 32);
    ctx.fillStyle = '#ff9a3d';
    ctx.beginPath();
    ctx.moveTo(96, 329);
    ctx.quadraticCurveTo(101, 338, 99, 345);
    ctx.quadraticCurveTo(96, 349, 93, 345);
    ctx.quadraticCurveTo(91, 338, 96, 329);
    ctx.fill();
    ctx.fillStyle = '#2a2a32';
    ctx.fillRect(82, 356, 28, 6);
    // Stool.
    ctx.fillStyle = '#6e4a26';
    ctx.beginPath();
    ctx.ellipse(150, 420, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(144, 426, 6, 26);
    ctx.fillRect(152, 426, 6, 26);
    ctx.fillStyle = '#c95a7a';
    ctx.beginPath();
    ctx.ellipse(150, 414, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    grain(ctx, 0, 0, W, H, rng, 0.04, 700);
    vignette(ctx, W, H, 0.26);
  },
};
