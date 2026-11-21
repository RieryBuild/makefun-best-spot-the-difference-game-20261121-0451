# Twin Hearth — Spot the Difference

An original spot-the-difference game, built for the make.fun bounty
`best-spot-the-difference-game-20261121-0451`. It plays offline in a desktop
browser from static files — no network, no build step.

## The game

Two near-identical pictures side by side. Find every difference before the
timer runs out. Four hand-drawn scenes, 8 differences each (32 total),
rising difficulty:

1. **The Reading Nook** — lamplight, old books, one sleeping cat.
2. **The Baker's Counter** — warm bread, chalk prices, jam jars in a row.
3. **The Garden Shed** — tools, seeds and soil, everything twice over.
4. **The Observatory Balcony** — one clear night, one patient telescope.

Every scene is painted in code on canvas — procedural wood, wallpaper,
brick, tile, foliage and grain — so the two panels are pixel-identical
except for the differences themselves (seeded rendering).

## Features

- **Satisfying finds** — golden ring pop, sparkle burst, rising chime, combo scoring.
- **Hints that behave** — 3 per scene, a brief pulsing ring on the fairest unfound spot.
- **Real time pressure** — per-scene countdown ring; under 30s the frame itself pulses red.
- **Magnifier** — a 2× lens that follows the mouse (M or the HUD button).
- **Full keyboard play** — arrows move a crosshair, Tab switches panels, Enter checks a spot.
- **Generated sound** — all effects synthesized with WebAudio; no audio files.
- **Icon-first HUD** — timer ring, big remaining counter, found dots, hint pips.
- Title screen, scene-clear cards, timeout retry, and a 3-star end screen.

## Controls

| Input | Action |
|---|---|
| Click a panel | Test that spot |
| ← ↑ ↓ → | Move the keyboard crosshair (Shift = fine) |
| Tab | Switch panels |
| Enter / Space | Check the crosshair spot |
| H | Hint |
| M | Magnifier |
| P | Pause |
| R | Restart scene |
| Esc | Title screen |

## Play it

```sh
# from this repo root — any static server works
python3 -m http.server 8080 --directory game
# then open http://localhost:8080
```

## Layout

```
main.ts                  entry program: copies game/ + screenshots/ to /output,
                         writes dossier.json with the vendored make.fun library
vendor/makefun-game.ts   kit library, unchanged
game/
  index.html             shell + HUD + overlays
  css/style.css          presentation
  src/
    main.js              boot, frame loop, wiring
    state.js             state machine + scoring + timer
    renderer.js          panel compositing, markers, effects
    magnifier.js         the 2x inspection lens
    input.js             mouse + keyboard
    hud.js               DOM HUD + overlays
    audio.js             WebAudio synth effects
    rng.js               seeded PRNG
    textures.js          procedural texture painters
    scenes/index.js      registry + panel size
    scenes/nook.js       scene 1
    scenes/bakery.js     scene 2
    scenes/shed.js       scene 3
    scenes/observatory.js scene 4
screenshots/             4 real renders of the game's own code
```

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` needs Node 22.18+ and the standard library only; two runs write
identical bytes.

## License

MIT — see `LICENSE`.
