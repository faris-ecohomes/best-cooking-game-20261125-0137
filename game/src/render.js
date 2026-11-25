// Everything the player sees: the warung kitchen, the order board, the counter
// with its plate, the ingredient tiles, the HUD and the title / pause /
// game-over screens. All art is drawn flat on the canvas; nothing is loaded.

import {
  FIELD,
  FONT,
  INGREDIENTS,
  PALETTE,
  PLATE,
  SERVE_BUTTON,
  TICKET,
  TILE,
} from './config.js';
import { tileRect, serveRect } from './input.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** A flat icon for one ingredient, centred on (cx, cy), about `size` across. */
export function drawIngredientIcon(ctx, id, cx, cy, size) {
  const s = size / 2;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'nasi') {
    ctx.fillStyle = '#8a5a33';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.45, s, s * 0.5, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.85, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d9a441';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, s * 0.15, s * 0.55, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  } else if (id === 'ayam') {
    ctx.rotate(-0.6);
    ctx.fillStyle = '#c97b3d';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.95, s * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a4f22';
    ctx.beginPath();
    ctx.ellipse(-s * 0.25, -s * 0.1, s * 0.45, s * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5efe0';
    ctx.lineWidth = s * 0.28;
    ctx.beginPath();
    ctx.moveTo(s * 0.7, s * 0.1);
    ctx.lineTo(s * 1.25, s * 0.35);
    ctx.stroke();
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(s * 1.3, s * 0.2, s * 0.22, 0, Math.PI * 2);
    ctx.arc(s * 1.18, s * 0.48, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fdfdfd';
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.75, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b705';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.05, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(s * 0.02, -s * 0.12, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#2e7d32';
    for (const angle of [-0.5, 0, 0.5]) {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.45, s * 0.42, s * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.strokeStyle = '#81c784';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.lineTo(0, -s * 0.7);
    ctx.stroke();
  } else if (id === 'sambal') {
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = s * 0.55;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, -s * 0.1, s * 0.75, Math.PI * 0.15, Math.PI * 0.95);
    ctx.stroke();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = s * 0.22;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, -s * 0.75);
    ctx.quadraticCurveTo(-s * 0.9, -s * 1.1, -s * 0.55, -s * 1.15);
    ctx.stroke();
    ctx.fillStyle = '#ff6659';
    ctx.beginPath();
    ctx.arc(s * 0.1, -s * 0.55, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'kerupuk') {
    ctx.fillStyle = '#ffe082';
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2;
      const r = i % 2 === 0 ? s : s * 0.78;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c17900';
    for (const [dx, dy] of [[-0.35, -0.3], [0.3, -0.35], [0, 0.1], [-0.3, 0.4], [0.35, 0.35]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawHeart(ctx, cx, cy, size, filled) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(size / 20, size / 20);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-11, -4, -6, -12, 0, -6);
  ctx.bezierCurveTo(6, -12, 11, -4, 0, 6);
  ctx.closePath();
  ctx.fillStyle = filled ? PALETTE.heart : '#5d4037';
  ctx.fill();
  ctx.restore();
}

function drawKitchen(ctx) {
  // Wall and floor.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 64, FIELD.width, 336);
  ctx.fillStyle = PALETTE.wallBand;
  ctx.fillRect(0, 352, FIELD.width, 48);
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 400, FIELD.width, 108);

  // Window with a sunny street outside, left of the plate.
  ctx.fillStyle = '#7fb3d5';
  ctx.fillRect(56, 196, 220, 140);
  ctx.fillStyle = '#ffe082';
  ctx.beginPath();
  ctx.arc(232, 232, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.moveTo(56, 336);
  ctx.lineTo(140, 288);
  ctx.lineTo(220, 336);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5d4037';
  ctx.lineWidth = 8;
  ctx.strokeRect(56, 196, 220, 140);
  ctx.beginPath();
  ctx.moveTo(166, 196);
  ctx.lineTo(166, 336);
  ctx.moveTo(56, 266);
  ctx.lineTo(276, 266);
  ctx.stroke();

  // Shelf with jars and a hanging lamp, right of the plate.
  ctx.fillStyle = '#6e4525';
  ctx.fillRect(1000, 300, 224, 12);
  const jars = ['#e57373', '#81c784', '#ffb74d'];
  jars.forEach((color, i) => {
    ctx.fillStyle = color;
    roundRect(ctx, 1012 + i * 72, 252, 48, 48, 8);
    ctx.fill();
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(1020 + i * 72, 244, 32, 10);
  });

  // Hanging lamp over the plate.
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(PLATE.x, 172);
  ctx.lineTo(PLATE.x, 216);
  ctx.stroke();
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.moveTo(PLATE.x - 42, 216);
  ctx.lineTo(PLATE.x + 42, 216);
  ctx.lineTo(PLATE.x + 26, 252);
  ctx.lineTo(PLATE.x - 26, 252);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe082';
  ctx.beginPath();
  ctx.arc(PLATE.x, 256, 10, 0, Math.PI * 2);
  ctx.fill();

  // Stove with a wok on the left end of the counter.
  ctx.fillStyle = '#37474f';
  ctx.fillRect(330, 356, 150, 44);
  ctx.fillStyle = '#ff7043';
  ctx.beginPath();
  ctx.moveTo(360, 356);
  ctx.lineTo(380, 340);
  ctx.lineTo(400, 356);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#455a64';
  ctx.beginPath();
  ctx.ellipse(405, 348, 62, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e7d32';
  ctx.beginPath();
  ctx.arc(390, 342, 8, 0, Math.PI * 2);
  ctx.arc(415, 344, 7, 0, Math.PI * 2);
  ctx.fill();

  // A stack of clean plates on the right end of the counter.
  ctx.fillStyle = '#eceff1';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse(950, 392 - i * 7, 44, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // The wooden counter.
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(0, 396, FIELD.width, 16);
  ctx.fillStyle = PALETTE.counterFront;
  ctx.fillRect(0, 412, FIELD.width, 96);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  for (let x = 80; x < FIELD.width; x += 160) ctx.fillRect(x, 412, 3, 96);
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = PALETTE.board;
  ctx.fillRect(0, 68, FIELD.width, 108);
  for (let slot = 0; slot < 3; slot += 1) {
    const x = TICKET.x0 + slot * (TICKET.width + TICKET.gap);
    const y = TICKET.y;
    const order = state.orders[slot];
    if (!order) {
      ctx.strokeStyle = 'rgba(255,246,221,0.35)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      roundRect(ctx, x, y, TICKET.width, TICKET.height, 10);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'menunggu pesanan…', x + TICKET.width / 2, y + TICKET.height / 2, 16, 'rgba(255,246,221,0.5)', 'center', '600');
      continue;
    }
    const urgent = order.timeLeft <= 10;
    ctx.fillStyle = urgent ? PALETTE.ticketHot : PALETTE.ticket;
    roundRect(ctx, x, y, TICKET.width, TICKET.height, 10);
    ctx.fill();
    if (urgent) {
      ctx.strokeStyle = PALETTE.heart;
      ctx.lineWidth = 3;
      roundRect(ctx, x, y, TICKET.width, TICKET.height, 10);
      ctx.stroke();
    }
    text(ctx, order.recipe.name, x + 14, y + 20, 20, PALETTE.text);
    text(ctx, `Rp${order.recipe.price}rb`, x + TICKET.width - 14, y + 20, 16, '#8a6d3b', 'right', '800');
    order.recipe.needs.forEach((id, i) => {
      drawIngredientIcon(ctx, id, x + 30 + i * 44, y + 56, 30);
    });
    text(ctx, `${Math.ceil(order.timeLeft)} dtk`, x + TICKET.width - 14, y + 58, 16, urgent ? PALETTE.heart : PALETTE.muted, 'right', '800');
    const ratio = Math.max(0, order.timeLeft / order.timeMax);
    ctx.fillStyle = '#e0d3b8';
    roundRect(ctx, x + 14, y + TICKET.height - 16, TICKET.width - 28, 8, 4);
    ctx.fill();
    ctx.fillStyle = urgent ? PALETTE.heart : '#43a047';
    roundRect(ctx, x + 14, y + TICKET.height - 16, (TICKET.width - 28) * ratio, 8, 4);
    ctx.fill();
  }
}

function drawPlate(ctx, state) {
  // The plate, seen from the front: a wide ellipse with a rim.
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y, PLATE.radius, PLATE.radius * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y - 4, PLATE.radius * 0.78, PLATE.radius * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y - 4, PLATE.radius * 0.62, PLATE.radius * 0.24, 0, 0, Math.PI * 2);
  ctx.stroke();

  // What is on the plate so far, newest ingredient popping in.
  const items = state.plate;
  items.forEach((id, i) => {
    const slotX = PLATE.x + (i - (items.length - 1) / 2) * 46;
    const slotY = PLATE.y - 22 - (i % 2) * 10;
    const pop = state.elapsed - state.lastGrabAt < 0.18 && i === items.length - 1
      ? 1 + (0.18 - (state.elapsed - state.lastGrabAt)) * 2
      : 1;
    drawIngredientIcon(ctx, id, slotX, slotY, 40 * pop);
  });
  if (items.length === 0) {
    text(ctx, 'piring kosong — klik bahan di bawah', PLATE.x, PLATE.y + 62, 14, '#ffe0b2', 'center', '600');
  }
}

function drawTiles(ctx, state) {
  INGREDIENTS.forEach((item, index) => {
    const rect = tileRect(index);
    const fresh = state.lastGrabId === item.id && state.elapsed - state.lastGrabAt < 0.25;
    ctx.fillStyle = fresh ? '#fff3c4' : '#fff6dd';
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12);
    ctx.fill();
    ctx.strokeStyle = '#d7ccc8';
    ctx.lineWidth = 2;
    roundRect(ctx, rect.x, rect.y, rect.width, rect.height, 12);
    ctx.stroke();
    drawIngredientIcon(ctx, item.id, rect.x + rect.width / 2, rect.y + 52, 64);
    text(ctx, item.name, rect.x + rect.width / 2, rect.y + 106, 18, PALETTE.text, 'center');
    ctx.fillStyle = '#2f7d6d';
    roundRect(ctx, rect.x + 8, rect.y + 8, 24, 24, 6);
    ctx.fill();
    text(ctx, item.key, rect.x + 20, rect.y + 21, 14, '#ffffff', 'center', '800');
  });

  const serve = serveRect();
  const canServe = state.plate.length > 0;
  ctx.fillStyle = canServe ? PALETTE.serve : '#9e9e9e';
  roundRect(ctx, serve.x, serve.y, serve.width, serve.height, 12);
  ctx.fill();
  ctx.strokeStyle = canServe ? PALETTE.serveHot : '#757575';
  ctx.lineWidth = 3;
  roundRect(ctx, serve.x, serve.y, serve.width, serve.height, 12);
  ctx.stroke();
  text(ctx, 'SAJIKAN', serve.x + serve.width / 2, serve.y + 52, 26, '#ffffff', 'center', '800');
  text(ctx, 'Enter / klik', serve.x + serve.width / 2, serve.y + 88, 15, 'rgba(255,255,255,0.85)', 'center', '600');
  text(ctx, `di piring: ${state.plate.length}/${4}`, serve.x + serve.width / 2, serve.y + 112, 14, 'rgba(255,255,255,0.85)', 'center', '600');
}

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, FIELD.width, 64);
  ctx.fillStyle = PALETTE.accent;
  roundRect(ctx, 12, 10, 218, 44, 10);
  ctx.fill();
  text(ctx, 'WARUNG RUSH', 121, 33, 24, '#ffffff', 'center', '800');
  text(ctx, `SKOR ${state.score}`, 258, 33, 22, PALETTE.hudText, 'left', '800');
  ctx.fillStyle = PALETTE.coin;
  ctx.beginPath();
  ctx.arc(470, 32, 13, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'Rp', 470, 33, 11, '#5d4037', 'center', '800');
  text(ctx, `${state.coins}rb`, 490, 33, 20, PALETTE.hudText, 'left', '800');
  text(ctx, `LEVEL ${state.level}`, 620, 33, 20, PALETTE.hudText, 'left', '800');
  text(ctx, `SAJI ${state.served}`, 760, 33, 20, PALETTE.hudText, 'left', '800');
  for (let i = 0; i < 3; i += 1) {
    drawHeart(ctx, 1150 + i * 34, 32, 26, i < state.hearts);
  }
  // Toast: the last event, floating over the plate, fading out.
  const age = state.elapsed - state.toastAt;
  if (state.toast && age < 1.8) {
    ctx.globalAlpha = age > 1.2 ? 1 - (age - 1.2) / 0.6 : 1;
    text(ctx, state.toast, PLATE.x, PLATE.y - 108 - age * 14, 22, '#2e7d32', 'center', '800');
    ctx.globalAlpha = 1;
  }
}

function drawHints(ctx) {
  ctx.fillStyle = '#efebe9';
  ctx.fillRect(0, 652, FIELD.width, 68);
  text(
    ctx,
    'Klik bahan (atau tekan 1–6) untuk meracik • Enter = sajikan • Backspace = buang racikan • P = jeda',
    FIELD.width / 2,
    686,
    17,
    PALETTE.muted,
    'center',
    '600',
  );
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(38, 50, 56, 0.72)';
  ctx.fillRect(0, 64, FIELD.width, 588);
  ctx.fillStyle = '#fff6dd';
  roundRect(ctx, 260, 170, 760, 380, 18);
  ctx.fill();
  ctx.fillStyle = accent;
  roundRect(ctx, 260, 170, 760, 84, 18);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillRect(260, 220, 760, 34);
  text(ctx, title, 640, 212, 40, '#ffffff', 'center', '800');
  lines.forEach((line, i) => {
    text(ctx, line.text, 640, 292 + i * 44, line.size, line.color, 'center', line.weight);
  });
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const scale = { x: 1, y: 1 };

  function resize() {
    const width = canvas.clientWidth || FIELD.width;
    const height = canvas.clientHeight || FIELD.height;
    canvas.width = Math.round(width * (window.devicePixelRatio || 1));
    canvas.height = Math.round(height * (window.devicePixelRatio || 1));
    scale.x = canvas.width / FIELD.width;
    scale.y = canvas.height / FIELD.height;
  }

  function draw(state, screen, best) {
    resize();
    ctx.setTransform(scale.x, 0, 0, scale.y, 0, 0);
    // A short shake after a mistake.
    if (state.elapsed - state.lastWrongAt < 0.3) {
      const mag = 6 * (1 - (state.elapsed - state.lastWrongAt) / 0.3);
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }
    drawKitchen(ctx);
    drawOrderBoard(ctx, state);
    drawPlate(ctx, state);
    drawTiles(ctx, state);
    drawHud(ctx, state);
    drawHints(ctx);

    if (screen === SCREEN_TITLE) {
      drawOverlay(ctx, 'WARUNG RUSH', [
        { text: 'Racik pesanan sebelum pelanggan kabur!', size: 19, color: PALETTE.text, weight: '700' },
        { text: 'Baca papan pesanan, klik bahan yang diminta, lalu SAJIKAN.', size: 17, color: PALETTE.muted, weight: '600' },
        { text: 'Pesanan hangus atau racikan salah = pelanggan pergi (3× = tutup).', size: 17, color: PALETTE.muted, weight: '600' },
        { text: 'Combo & sajian cepat = poin lebih. Tiap 5 sajian naik level!', size: 17, color: PALETTE.muted, weight: '600' },
        { text: best > 0 ? `Skor terbaik: ${best}` : 'Tekan SPASI atau klik untuk mulai masak!', size: 20, color: PALETTE.accent, weight: '800' },
      ], PALETTE.accent);
    } else if (screen === SCREEN_PAUSED) {
      drawOverlay(ctx, 'JEDA', [
        { text: 'Warung istirahat sebentar.', size: 19, color: PALETTE.text, weight: '700' },
        { text: 'Tekan P atau klik untuk lanjut masak.', size: 17, color: PALETTE.muted, weight: '600' },
      ], '#2f7d6d');
    } else if (screen === SCREEN_OVER) {
      drawOverlay(ctx, 'SHIFT SELESAI', [
        { text: `Skor akhir: ${state.score}  •  Hidangan tersaji: ${state.served}`, size: 20, color: PALETTE.text, weight: '800' },
        { text: `Combo terbaik: ${state.bestCombo}×  •  Omzet: Rp${state.coins}rb`, size: 18, color: PALETTE.muted, weight: '600' },
        { text: `Skor terbaik: ${best}`, size: 18, color: PALETTE.muted, weight: '600' },
        { text: 'Tekan R atau klik untuk buka warung lagi!', size: 20, color: PALETTE.accent, weight: '800' },
      ], '#37474f');
    }
  }

  return { draw };
}
