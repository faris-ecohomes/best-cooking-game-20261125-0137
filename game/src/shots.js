// The screenshot scenes behind ?shot=start|play|end. Each one plays the real
// rules forward from a fresh world for a fixed number of steps, steered by a
// simple autopilot that grabs what the oldest order asks for, so the frame is
// what a short game really looks like and the same seed always gives the
// same frame. The play scene's pilot is careful; the end scene's is sloppy
// and serves the wrong plates, so the shift ends.

import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 4;
const PLAY_SECONDS = 16;
const END_LIMIT_SECONDS = 600;
const SAMPLE = 1 / 30;

/** What the careful pilot does next: grab the oldest order's missing item, or serve. */
function carefulMove(state) {
  if (state.orders.length === 0) return { grabs: [], serve: false };
  const order = state.orders[0];
  const missing = order.recipe.needs.filter((id) => {
    const have = state.plate.filter((item) => item === id).length;
    const need = order.recipe.needs.filter((item) => item === id).length;
    return have < need;
  });
  if (missing.length === 0) return { grabs: [], serve: true };
  return { grabs: [missing[0]], serve: false };
}

/** What the sloppy pilot does: grab a random ingredient, serve once the plate fills. */
function sloppyMove(state, random) {
  const ids = ['nasi', 'ayam', 'telur', 'sayur', 'sambal', 'kerupuk'];
  if (state.plate.length >= 3) return { grabs: [], serve: true };
  return { grabs: [random.pick(ids)], serve: false };
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world, random) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    for (let index = 0; index < START_SECONDS / STEP; index += 1) {
      world.step(STEP, [], false, false);
    }
    return { screen: SCREEN_TITLE, best: 0 };
  }
  const sloppy = name === 'end';
  const limit = sloppy ? END_LIMIT_SECONDS : PLAY_SECONDS;
  let thinkIn = 0;
  let move = { grabs: [], serve: false };
  for (let index = 0; index < limit / STEP; index += 1) {
    thinkIn -= STEP;
    if (thinkIn <= 0) {
      // The end scene first cooks properly for a while (so the shift has a
      // score), then gets sloppy and serves the wrong plates until it closes.
      const goneSloppy = sloppy && world.state.elapsed > 20;
      move = goneSloppy ? sloppyMove(world.state, random) : carefulMove(world.state);
      thinkIn = 0.6;
    }
    const events = world.step(STEP, move.grabs, move.serve, false);
    move = { grabs: [], serve: false };
    if (world.state.over) break;
    // The play scene stops mid-assembly: one dish served, the next half-built.
    if (!sloppy && world.state.served >= 1 && world.state.plate.length >= 2) break;
  }
  const over = world.state.over;
  return { screen: over ? SCREEN_OVER : SCREEN_PLAY, best: world.state.score };
}
