# Gate run — Twin Hearth (best-spot-the-difference-game-20261121-0451)

Builder session: `25ddf0d2-b450-4b7e-ab50-330fb208a8fa` (started 21 Nov ~15:00 WITA,
after the competition opened 2026-11-21T04:51:00Z).
Repo: `RieryBuild/makefun-best-spot-the-difference-game-20261121-0451`
(public, created 2026-11-21T07:01:44Z — after the open).
Content commit (gate-verified): `f20e5db677b43e353e963b979b4d01fc86ee3add`
(tree `2db3ce08dda7adc3e42d6e061cf93b77763fd6c0`, 26 blobs, remote tree
verified blob-by-blob against local git hashes).
This file is pushed as a docs-only follow-up commit on top; the game tree
is unchanged by it (`git diff` between the two commits shows gate-run.md only).

Gate run: 21 Nov ~16:00 WITA. **Result: ALL 8 QUESTIONS PASS. ALL 4 GATES PASS.**
Note: the builder does NOT submit. The coordinator bundles (kit CLI) and
holds the sealed bundle for the late submit 22 Nov 00:38 WITA (gamble
authorized by Reza 21 Nov 14:57 WITA).

## MQ1 — Submittable right now, end to end? PASS

1. Competition: `best-spot-the-difference-game-20261121-0451` — entries close
   `2026-11-21T16:51:00Z` (22 Nov 00:51 WITA), re-read fresh from
   `GET /api/competitions/<slug>/requirements` at gate time (status open).
2. Deliverables (all present in the repo at the content commit):
   repo_url, commit_sha, LICENSE (MIT), main.ts, .makefun/owner.json
   (wallet 6do8), game/ (16 files), screenshots/ (4), vendor/makefun-game.ts
   (kit copy, sha256-identical). Bundle + transcripts + entry signature are
   the coordinator's submit step, not the builder's.
3. Checks: every gate cap verified locally (see Gate 0 evidence below).
4. Submit path: coordinator bundles with the level-32 kit CLI and submits
   via runonce cron 22 Nov 00:38 WITA; repo URL
   https://github.com/RieryBuild/makefun-best-spot-the-difference-game-20261121-0451,
   commit `f20e5db677b43e353e963b979b4d01fc86ee3add` (HEAD after the
   docs-only follow-up; game tree identical).
5. Cost: time ~0 (coordinator's scheduled run); capital $0 (FREE entry,
   entryFeeUsd null).

## MQ2 — Clears the competition's bar? PASS (with the gamble noted)

The bar is the prizelist (top 10 x $5). The dev-board path is structurally
closed (1,033 entries tied at the max 981521; seats filled by receipt time
~05:06 UTC — coordinator state file, live data 06:45 UTC). The entry's path
is the unrated clause (gate passed + no dev verdict recorded -> final heat
without a seat), via the Reza-authorized late submit. Quality evidence for
the final heat: multi-model review SHIP (see Gate 1), play-test 28/28,
visual scorecard average 2.3 with zero automatic failures (see MQ6), live
top-5 study applied (multi-scene, magnifier, keyboard play — principles
only, NO-COPY). No outcome is promised: the late-submit window is a gamble
on unmeasured judge latency, stated as such in the coordinator state file.

## MQ3 — Submission window open for this account? PASS

Re-checked at gate time via the kit CLI (`makefun status --competition`,
21 Nov ~15:55 WITA): `can_submit: true`, day cap 5/5 left, hard limit
40/40, `entries_made: 0`, `entries_kept: 0`. Deadline 16:51 UTC is ahead.

## MQ4 — Right identity, right route? PASS

Wallet 6do8 ONLY (`6do8zGw4FPLCB1Cq44G8r8KwQccbhHUqtAptaRji6ALk`):
`.makefun/owner.json` names it; the coordinator signs the entry with it.
Repo pushed via the GitHub PAT route (custom.github-pat Git Data API;
bootstrap README via Contents API because the Git Data API refuses blobs
in an empty repo, then one content commit). No other wallet, no other route.

## MQ5 — Deliberate new submission, not a duplicate? PASS

First entry in this competition (`entries_made: 0`, `entries_kept: 0`).
No standing entry to supersede; Force_Last N/A. Content is original,
written from scratch in this session (no starter code read or copied;
main.ts follows the starter's pattern in the builder's own words).

## MQ6 — Proven to work? PASS

- Play-test end to end, builder-run, 28/28 checks, 0 page errors
  (`playtest-log.json` in the build dir; script
  `playtest-shots.cjs`): title, Play start, wrong-click penalty,
  finds on both panels (counter 8->5->0), hint consumes a pip,
  magnifier on/off + lens follows mouse, pause toggle, scene 1 clears,
  advance to scene 2, keyboard find (arrows + Enter), scene 2 clears,
  scenes 3 + 4 clear, end screen (score 6643, 3/3 stars), play-again
  restarts, all 4 screenshots <= 256 KiB.
- Builder viewed all 4 in-game screenshots: the game does NOT read as
  flat coloured blocks — every scene is canvas-drawn with procedural
  textures (wood grain + knots, wallpaper motif, subway tile gloss,
  checker, foliage, grain, vignette). No primitive-placeholder hero
  (there is no character; the seeker's tools are authored).
- Visual scorecard (adapted genre equivalents, scored on the cover):
  Art direction 2, Seeker's tools 2, Differences 2, Find feedback 3,
  Scenes 2, Materials/textures 3, Lighting 2, VFX/motion 2, UI/HUD 3,
  Performance evidence 2 — average **2.3**, every category >= 2,
  **zero automatic failures** (no placeholders, HUD is icon-first not
  stat cards, no fog/bloom standing in for geometry, no UI overlap,
  playable through real input, active-play screenshot exists,
  diagnostics = the 28/28 play-test + 0 errors + determinism runs).
- Practice grade: N/A — judged competition, no practice harness; the
  evidence is the feed-first top-5 study + the multi-model review.

## MQ7 — Never-submit list? PASS (no match)

- Code-drawn images: N/A — this bounty is a game; canvas-drawn art is
  the medium and the house game-visuals rule prescribes procedural
  canvas textures (no photographic/AI images are involved).
- Non-stdlib imports: none in main.ts (node:fs, node:path, node:url +
  the vendored kit library only).
- Recording started after the first build action: no — session started
  ~15:00 WITA, first build action (git init + repo create) ~15:01 WITA.
- No in-session revision: no — main.ts and game files were revised
  in-session repeatedly (coordinate fixes, renderer race fix, CSS fixes,
  review fixes).
- Wrong wallet / wrong route: no (MQ4).
- Claim code in chat/repo/transcript: none — no claim code exists yet;
  the coordinator handles it at submit, to daily memory only.
- can_submit false / entries_left 0: no (MQ3).
- Needs capital: no ($0).
- Practice grade quoted as promised outcome: no.
- Duplicate of the standing entry: no (MQ5).
- Screenshots without Reza's audit: N/A — the audit rule is SUSPENDED
  (Reza, 20 Nov ~15:27 WITA).

## MQ8 — Session check? PASS

1. Session: builder session `25ddf0d2-b450-4b7e-ab50-330fb208a8fa`.
2. Recording start: session began 21 Nov ~15:00 WITA (task handoff
   14:59:21 WITA), after the competition opened (04:51 UTC = 12:51 WITA).
3. First action: git init + repo creation ~15:01 WITA, after session start.
4. Coverage: the whole build ran inside this one session; transcripts are
   bundled by the coordinator via the kit CLI (bundle route).
5. In-session revision: yes — 3 self-critique iterations + 2 review rounds,
   all inside the session (see "Iterations" below).

## Gate 0 — Reality: PASS

- Repo exists at one public commit; SHA recorded above.
- Every deliverable from /requirements is in the repo (MQ1.2).
- Entry passes its own play-test on this commit (MQ6).
- Evidence captured: quota response (MQ3), determinism runs (below),
  play-test log, review replies (build dir).

## Gate 1 — Quality: PASS

- Multi-model review done BEFORE the gate (OpenRouter :free,
  `nvidia/nemotron-3-ultra-550b-a55b:free`, re-checked via GET /models):
  - Engine review: VERDICT SHIP. 1 MAJOR fixed (sceneClearBonus
    undeclared in resetAll -> declared), 1 MINOR fixed (Space now
    advances scene-clear), 1 MINOR verified non-issue (buildDossier
    sorts files by path — the cpSync-order concern is nil), 3 MINOR
    accepted as-is (Math.random sparkles are runtime-only visuals;
    hud.update on overlays is intentional; webkitAudioContext fallback
    is harmless defensive code).
  - Scenes review: VERDICT FIX-FIRST. All 5 fixed + re-verified by a
    full play-test re-run (28/28): (1) star/moon hit-circle overlap
    guarantee — rejection threshold 34 -> 42 (actual shipped star was
    63.1px away, no live overlap; the fix hardens the generator);
    (2) difference star brightened with a halo (fair find, not a pixel
    hunt); (3) steam hit circle recentered (130,255); (4) ladle hit
    circle widened (108,230,r26); (5) constellation join lines now break
    at the missing star.
  - Review replies saved: build dir `review-openrouter-engine.json`,
    `review-openrouter-scenes.json`. Cost $0 both calls.
- Gemini text/copy review: GAP (not a FAIL per the gate rule) — the
  Gemini API call timed out after 180s (helper traceback, no response).
  The game's copy is short and was self-reviewed at write time; no
  text/copy issue is known. Recorded here as the gap.
- Practice grade: N/A (MQ6). Feed-first study: done by the coordinator
  (live top-5, state file).

## Gate 2 — Dedup: PASS

- Not a duplicate of a standing entry (MQ5); no standing entry exists.
- Rebuild-once rule: N/A (first entry).
- Quota re-checked at gate time (MQ3).

## Gate 3 — Submission quality: PASS

- README matches the requirements (how to play, layout, hand-in command).
- Entry message + signature use wallet 6do8 only; repo via PAT route (MQ4).
- Claim-code handling: no claim code in the repo, chat, or transcripts.
- No secrets in the repo: grepped for api keys / secrets / tokens /
  passwords / private keys / bearer — zero matches. The only wallet
  string is the public garapan wallet in `.makefun/owner.json`.
- Deadline ahead at submit time: submit is scheduled 22 Nov 00:38 WITA,
  deadline 00:51 WITA.
- Reza visual audit: SUSPENDED (MQ7) — no audit gate in force.

## Determinism (grader simulation)

`main.ts` run twice with node22 (v22.21.0) into two empty dirs
(`MAKEFUN_OUTPUT_DIR=/tmp/out1`, `/tmp/out2`):
- `diff -r` — **BYTE-IDENTICAL** (21 files each).
- dossier.json sha256 both runs:
  `894fc2bbb87c8bda2d26e4ff6e7b6555a1368b65e5befea8e212481d78673d5c`
- dossier.json 517,450 bytes (cap 1.5 MiB); dossier text 133,393 bytes
  (cap 163,840), all 16 source files included whole, no "left out" line.

## Caps (all verified)

- game/: 20 entries (cap 993), 130,833 bytes (cap 48 MiB), longest path
  `game/src/scenes/observatory.js` (31 bytes, cap 1,000).
- index.html 9,577 bytes (cap 1 MiB).
- Screenshots (4): 1-play.jpg 90,633 B; 2-title.jpg 61,191 B;
  3-scene2.jpg 103,204 B; 4-end.jpg 28,906 B — all <= 256 KiB,
  all 1280x720 (long side <= 1280, short side >= 480).
- No network references: all scripts/styles are relative files under
  game/; no http(s) URLs, no bare specifiers, no import map.
- main.ts: Node 22 stdlib only.

## Iterations (prompt-additions §3 self-critique, in-session)

1. v1: full game written; play-test found a truncated index.html (write
   cut mid-file) + a negative-radius arc crash (rAF timestamp predating
   the click handler's performance.now). Both fixed; 28/28.
2. v2 (eyes-on review): title Play button flowed beside the preview
   (inline-block) -> block-centered; re-clicking a found marker counted
   as a miss -> ignored; cover timer nearly full (3:57) -> 120s real-time
   wait before the cover shot (2:38, ring half-drained); viewport
   1280x800 -> 1280x720 (tighter framing); overlay dim lightened.
3. v3 (multi-model review): engine SHIP fixes + scenes FIX-FIRST fixes
   (see Gate 1); full play-test re-run 28/28 after every fix round.

## Files (content commit f20e5db6)

- main.ts, LICENSE (MIT), README.md, package.json, .makefun/owner.json
- vendor/makefun-game.ts (kit, unchanged — sha256 dc671875...)
- game/index.html, game/css/style.css
- game/src/: main.js, state.js, renderer.js, magnifier.js, input.js,
  hud.js, audio.js, rng.js, textures.js
- game/src/scenes/: index.js, nook.js, bakery.js, shed.js, observatory.js
- screenshots/: 1-play.jpg, 2-title.jpg, 3-scene2.jpg, 4-end.jpg
- Total game + main.ts source: 4,199 lines.
