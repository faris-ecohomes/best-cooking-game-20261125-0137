// Warung Rush rules: orders arrive, the cook grabs ingredients onto the plate,
// and serving the plate against the board earns points. A wrong serve or an
// expired order loses a heart; three lost hearts end the shift.

import {
  HEARTS,
  INGREDIENTS,
  MAX_LEVEL,
  MAX_ORDERS,
  ORDER_TIME,
  PLATE_MAX,
  RECIPES,
  SERVED_PER_LEVEL,
  SERVE_POINTS,
  SPAWN_TIME,
} from './config.js';
import { soundChop, soundLevelUp, soundServe, soundTick, soundWrong } from './audio.js';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;
export const EVENT_LEVEL = 16;

function orderTimeFor(level) {
  return Math.max(ORDER_TIME.min, ORDER_TIME.base + ORDER_TIME.perLevel * (level - 1));
}

function spawnTimeFor(level) {
  return Math.max(SPAWN_TIME.min, SPAWN_TIME.base + SPAWN_TIME.perLevel * (level - 1));
}

function levelFor(served) {
  return Math.min(MAX_LEVEL, 1 + Math.floor(served / SERVED_PER_LEVEL));
}

/** Two ingredient lists match when they hold the same items, in any order. */
export function plateMatches(needs, plate) {
  if (needs.length !== plate.length) return false;
  const rest = [...plate];
  for (const item of needs) {
    const at = rest.indexOf(item);
    if (at === -1) return false;
    rest.splice(at, 1);
  }
  return true;
}

export function createWorld(random) {
  const state = {
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    served: 0,
    hearts: HEARTS,
    orders: [],
    plate: [],
    elapsed: 0,
    spawnIn: 3,
    over: false,
    /** The last thing that happened, shown as a floating message. */
    toast: '',
    toastAt: -99,
    /** When the newest ingredient landed, for its pop animation. */
    lastGrabAt: -99,
    /** Which ingredient landed last, so its tile can flash. */
    lastGrabId: '',
    /** When the last mistake happened, for the screen shake. */
    lastWrongAt: -99,
    /** Seconds left on the order nearest expiry, for its warning tick. */
    warnedAt: -99,
  };

  let nextOrderId = 1;

  function dealOrder() {
    const recipe = random.pick(RECIPES);
    const seconds = orderTimeFor(state.level);
    state.orders.push({ id: nextOrderId, recipe, timeLeft: seconds, timeMax: seconds });
    nextOrderId += 1;
  }

  function say(message) {
    state.toast = message;
    state.toastAt = state.elapsed;
  }

  /** Put one ingredient on the plate; returns false when the plate is full. */
  function grab(id) {
    if (state.over || state.plate.length >= PLATE_MAX) return false;
    if (!INGREDIENTS.some((item) => item.id === id)) return false;
    state.plate.push(id);
    state.lastGrabAt = state.elapsed;
    state.lastGrabId = id;
    soundChop();
    return true;
  }

  function clearPlate() {
    state.plate = [];
  }

  /**
   * Serve the plate. A plate that matches an order on the board earns points,
   * a time bonus and a combo bonus; anything else loses a heart. An empty
   * plate is not a serve at all.
   */
  function serve() {
    if (state.over || state.plate.length === 0) return 0;
    const at = state.orders.findIndex((order) => plateMatches(order.recipe.needs, state.plate));
    if (at === -1) {
      state.hearts -= 1;
      state.combo = 0;
      state.lastWrongAt = state.elapsed;
      clearPlate();
      say('Salah racik! Pelanggan kecewa.');
      soundWrong();
      if (state.hearts <= 0) {
        state.over = true;
        return EVENT_WRONG | EVENT_OVER;
      }
      return EVENT_WRONG;
    }
    const order = state.orders[at];
    state.orders.splice(at, 1);
    const timeBonus = Math.round((order.timeLeft / order.timeMax) * 50);
    const comboBonus = state.combo * 10;
    const gained = SERVE_POINTS + timeBonus + comboBonus;
    state.score += gained;
    state.coins += order.recipe.price;
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    state.served += 1;
    clearPlate();
    say(`Mantap! +${gained} poin`);
    soundServe();
    let events = EVENT_SERVED;
    const level = levelFor(state.served);
    if (level > state.level) {
      state.level = level;
      say(`Level ${level}! Pesanan makin deras.`);
      soundLevelUp();
      events |= EVENT_LEVEL;
    }
    return events;
  }

  function reset() {
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.level = 1;
    state.served = 0;
    state.hearts = HEARTS;
    state.orders = [];
    state.plate = [];
    state.elapsed = 0;
    state.spawnIn = 3;
    state.over = false;
    state.toast = '';
    state.toastAt = -99;
    state.lastGrabAt = -99;
    state.lastGrabId = '';
    state.lastWrongAt = -99;
    state.warnedAt = -99;
    nextOrderId = 1;
    dealOrder();
    dealOrder();
  }

  /**
   * Advance the shift by `dt` seconds. `grabs` are ingredient ids grabbed this
   * step, `serveIt` serves the plate, `clearIt` empties it. `attract` is the
   * title screen: orders still tick and refresh, but nothing costs a heart.
   * Returns event bits.
   */
  function step(dt, grabs, serveIt, clearIt, attract = false) {
    if (state.over) return 0;
    state.elapsed += dt;
    let events = 0;
    for (const id of grabs) grab(id);
    if (clearIt) clearPlate();
    if (serveIt) events |= serve();

    // New orders keep arriving while the board has room.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0 && state.orders.length < MAX_ORDERS) {
      dealOrder();
      state.spawnIn = spawnTimeFor(state.level);
    } else if (state.spawnIn <= 0) {
      state.spawnIn = 1;
    }

    // Every order's clock runs down; an expired one costs a heart.
    for (let index = state.orders.length - 1; index >= 0; index -= 1) {
      const order = state.orders[index];
      order.timeLeft -= dt;
      if (order.timeLeft <= 5 && state.elapsed - state.warnedAt >= 1) {
        state.warnedAt = state.elapsed;
        soundTick();
      }
      if (order.timeLeft <= 0) {
        state.orders.splice(index, 1);
        if (attract) {
          // On the title screen an expired order is just replaced, free.
          dealOrder();
          continue;
        }
        state.hearts -= 1;
        state.combo = 0;
        state.lastWrongAt = state.elapsed;
        say(`Keburu! ${order.recipe.name} hangus.`);
        soundWrong();
        events |= EVENT_EXPIRED;
        if (state.hearts <= 0) {
          state.over = true;
          events |= EVENT_OVER;
        }
      }
    }
    return events;
  }

  return { state, reset, step, grab, serve, clearPlate, dealOrder, say };
}
