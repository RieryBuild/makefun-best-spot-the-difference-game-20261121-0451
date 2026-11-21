// rng.js — deterministic seeded random numbers.
//
// Both panels of a scene are painted by the same draw function with the same
// seed, so every speck of texture lands identically on the left and the right.
// Only the difference branches may diverge. A fresh RNG is created per panel
// render, never shared across renders.

/** mulberry32: small, fast, deterministic PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Integer in [min, max] inclusive. */
export function intBetween(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Float in [min, max). */
export function floatBetween(rng, min, max) {
  return min + rng() * (max - min);
}

/** Pick one element of an array. */
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

/** Fisher-Yates shuffle, deterministic for a given rng. */
export function shuffle(rng, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
