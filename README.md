[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/faris-ecohomes/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/faris-ecohomes/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# Warung Rush — best-cooking-game-20261125-0137

A complete, original cooking game: you run a small Indonesian warung.
Customers order from the order board (up to 3 tickets, each with its own
timer); you assemble each dish by clicking the ingredients on the counter
— Nasi, Ayam, Telur, Sayur, Sambal, Kerupuk (or keys 1–6) — then hit
SAJIKAN (green button / Enter). A correct dish scores points, a time
bonus, a combo bonus and rupiah takings; a wrong mix or an expired order
costs one of 3 hearts. Every 5 dishes served raises the level: orders
arrive faster and timers get shorter. Four recipes: Nasi Ayam Geprek,
Nasi Telur Sayur, Nasi Campur Warung, Ayam Geprek.

## Features

- Title screen with how-to-play, pause (P), restart (R / click), best
  score saved in localStorage.
- Order board with per-ticket countdown bars, a kitchen with a window,
  stove and shelves, a plate that fills as you add ingredients, and a
  timer on every order.
- Simple WebAudio sound effects (chop / ding / buzz / level-up), no
  external files.
- Keyboard + mouse play; deterministic screenshot states via
  `?shot=start|play|end&seed=1` (an autopilot plays by the real rules).

## Run it

```sh
node serve.ts
# open http://localhost:8080 — game/ is plain static files, no network requests
```

## Hand in

```sh
MAKEFUN_OUTPUT_DIR=/tmp/out node main.ts
# copies game/ + screenshots/ to /tmp/out and writes /tmp/out/dossier.json
```

`main.ts` uses only the Node standard library plus the vendored
`vendor/makefun-game.ts` from the competition kit. All art is flat 2D
canvas drawing, all sounds are synthesized — no copied assets.

## Screenshots

Real renders of the game's own code, taken in headless Chromium from the
running game: `1-start.jpg` (title + kitchen + order board),
`2-play.jpg` (a dish mid-assembly, score 148), `3-end.jpg` (shift over,
final score 646).
