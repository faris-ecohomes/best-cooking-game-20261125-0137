// Warung Rush: every tuning number, colour, ingredient and recipe in one place.
// The kitchen is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** A customer walks out after this many failed serves or expired orders. */
export const HEARTS = 3;

/** Points for a correct serve, before the time bonus and the combo bonus. */
export const SERVE_POINTS = 100;

/** Dishes served before the warung levels up (orders come faster, timers shorter). */
export const SERVED_PER_LEVEL = 5;
export const MAX_LEVEL = 10;

/** How long an order stays on the board, in seconds, at level 1 and at the fastest. */
export const ORDER_TIME = { base: 50, perLevel: -3, min: 26 };

/** Seconds between new orders arriving, at level 1 and at the fastest. */
export const SPAWN_TIME = { base: 9, perLevel: -0.6, min: 4 };

/** At most this many orders wait on the board at once. */
export const MAX_ORDERS = 3;

/** At most this many ingredients fit on one plate. */
export const PLATE_MAX = 4;

/** The six ingredients a cook can grab from the counter, in counter order. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fff8e7', accent: '#d9a441' },
  { id: 'ayam', name: 'Ayam', key: '2', color: '#c97b3d', accent: '#8a4f22' },
  { id: 'telur', name: 'Telur', key: '3', color: '#fdfdfd', accent: '#f2b705' },
  { id: 'sayur', name: 'Sayur', key: '4', color: '#4caf50', accent: '#2e7d32' },
  { id: 'sambal', name: 'Sambal', key: '5', color: '#d32f2f', accent: '#7f0000' },
  { id: 'kerupuk', name: 'Kerupuk', key: '6', color: '#ffe082', accent: '#c17900' },
];

/** The warung's menu: each dish is the set of ingredients it needs, in any order. */
export const RECIPES = [
  { id: 'nasi-ayam-geprek', name: 'Nasi Ayam Geprek', needs: ['nasi', 'ayam', 'sambal'], price: 150 },
  { id: 'nasi-telur-sayur', name: 'Nasi Telur Sayur', needs: ['nasi', 'telur', 'sayur'], price: 120 },
  { id: 'nasi-campur', name: 'Nasi Campur Warung', needs: ['nasi', 'ayam', 'telur', 'sayur'], price: 200 },
  { id: 'ayam-geprek', name: 'Ayam Geprek', needs: ['ayam', 'sambal', 'kerupuk'], price: 130 },
];

/** Where the six ingredient tiles sit on the counter (shared by input and renderer). */
export const TILE = { y: 508, width: 168, height: 138, gap: 8, x0: 16 };
export const SERVE_BUTTON = { x: 1072, y: 508, width: 192, height: 138 };
export const CLEAR_BUTTON = { x: 1072, y: 508, width: 0, height: 0 };

/** The plate's spot on the counter, and the order board's ticket size. */
export const PLATE = { x: 640, y: 418, radius: 86 };
export const TICKET = { width: 392, height: 92, gap: 16, x0: 16, y: 76 };

export const PALETTE = {
  wall: '#f6e3bd',
  wallBand: '#2f7d6d',
  floor: '#c98f5f',
  counterTop: '#8a5a33',
  counterFront: '#6e4525',
  board: '#4a3220',
  ticket: '#fff6dd',
  ticketHot: '#ffe3a1',
  text: '#2b2118',
  muted: '#7a6a55',
  hud: '#263238',
  hudText: '#f5efe0',
  accent: '#e4572e',
  serve: '#43a047',
  serveHot: '#66bb6a',
  heart: '#e53935',
  coin: '#f2b705',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'warung-rush.best';
