// Keyboard and mouse input, read once a frame. Keys 1-6 grab an ingredient,
// Enter or Space serves the plate, Backspace clears it, P pauses, R restarts
// after game over. Clicking a tile, the SERVE button or the plate does the same.

import { INGREDIENTS, PLATE, SERVE_BUTTON, TILE } from './config.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_RESTART = 4;

/** The canvas-space rectangle of ingredient tile `index` (0-5). */
export function tileRect(index) {
  return {
    x: TILE.x0 + index * (TILE.width + TILE.gap),
    y: TILE.y,
    width: TILE.width,
    height: TILE.height,
  };
}

/** The canvas-space rectangle of the SERVE button. */
export function serveRect() {
  return { x: SERVE_BUTTON.x, y: SERVE_BUTTON.y, width: SERVE_BUTTON.width, height: SERVE_BUTTON.height };
}

function inside(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function createInput(canvas) {
  let actions = 0;
  /** Ingredient ids clicked or keyed since the last read, in order. */
  let grabbed = [];
  let servePressed = false;
  let clearPressed = false;
  /** Any pointer press since the last read (used to start / resume by click). */
  let tapped = false;

  function toCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function clickAt(x, y) {
    for (let index = 0; index < INGREDIENTS.length; index += 1) {
      if (inside(tileRect(index), x, y)) {
        grabbed.push(INGREDIENTS[index].id);
        return;
      }
    }
    if (inside(serveRect(), x, y)) {
      servePressed = true;
      return;
    }
    // Clicking the plate itself clears it, for a quick redo.
    const dx = x - PLATE.x;
    const dy = y - PLATE.y;
    if (dx * dx + dy * dy <= PLATE.radius * PLATE.radius) clearPressed = true;
  }

  canvas.addEventListener('pointerdown', (event) => {
    tapped = true;
    const point = toCanvas(event);
    clickAt(point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key;
    const ingredient = INGREDIENTS.find((item) => item.key === key);
    if (ingredient) {
      grabbed.push(ingredient.id);
      event.preventDefault();
      return;
    }
    if (key === 'Enter' || key === ' ') {
      actions |= ACTION_CONFIRM;
      servePressed = true;
      event.preventDefault();
    } else if (key === 'p' || key === 'P' || key === 'Escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'r' || key === 'R') {
      actions |= ACTION_RESTART;
    } else if (key === 'Backspace' || key === 'Delete') {
      clearPressed = true;
      event.preventDefault();
    }
  });

  return {
    /** Actions queued since the last call (confirm / pause / restart). */
    takeActions() {
      const queued = actions;
      actions = 0;
      return queued;
    },
    /** Ingredients grabbed since the last call, in grab order. */
    takeGrabs() {
      const taken = grabbed;
      grabbed = [];
      return taken;
    },
    /** Whether serve was requested since the last call (button or Enter/Space). */
    takeServe() {
      const pressed = servePressed || (actions & ACTION_CONFIRM) !== 0;
      servePressed = false;
      return pressed;
    },
    /** Whether the canvas was tapped since the last call. */
    takeTap() {
      const pressed = tapped;
      tapped = false;
      return pressed;
    },
    /** Whether clearing the plate was requested since the last call. */
    takeClear() {
      const pressed = clearPressed;
      clearPressed = false;
      return pressed;
    },
  };
}
