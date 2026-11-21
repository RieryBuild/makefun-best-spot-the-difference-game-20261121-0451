// scenes/index.js — scene registry: the four scenes in play order,
// plus the shared logical panel size every scene is painted at.

import { nook } from './nook.js';
import { bakery } from './bakery.js';
import { shed } from './shed.js';
import { observatory } from './observatory.js';

/** Logical size of one panel (both canvases paint at this resolution). */
export const SCENE_W = 640;
export const SCENE_H = 480;

/** Scenes in play order: difficulty rises with each set. */
export const SCENES = [nook, bakery, shed, observatory];

/** Total differences across the whole game. */
export const TOTAL_DIFFS = SCENES.reduce((n, s) => n + s.diffs.length, 0);
