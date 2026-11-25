// A tiny seeded random generator (mulberry32), so a seed always deals the same
// orders and the screenshot scenes are reproducible.

export function createRandom(seed) {
  let state = seed >>> 0;
  return {
    /** A float in [0, 1). */
    next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** An integer in [0, max). */
    int(max) {
      return Math.floor(this.next() * max);
    },
    /** One element of `list`, picked uniformly. */
    pick(list) {
      return list[this.int(list.length)];
    },
  };
}
