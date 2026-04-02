import { createCanvas, Canvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import { getQuoteOfDay } from './quotes';

export const RESOLUTIONS = {
  iphone: { w: 1170, h: 2532 },
  android: { w: 1080, h: 2400 },
};

export const STYLE_ACCENTS: Record<string, string> = {
  'dot-grid':       '#a78bfa',
  'large-countdown':'#60a5fa',
  'progress-bar':   '#34d399',
  'quarterly-view': '#1a1a1a',
  'yearly-view':    '#6ee7b7',
  'carpe-diem':     '#fbbf24',
  'memento-mori':   '#94a3b8',
  'weekly-grid':    '#22d3ee',
  'life-view':      '#a3e635',
  'special-dates':  '#f472b6',
};

// ── Shared Helpers ──────────────────────────────────────────────────
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      lines++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return lines;
}

function getDaysLeft(targetDate: string | Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Draws the daily wisdom quote at the BOTTOM of the screen to avoid the lock screen clock.
 */
function drawDailyQuote(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const quote = getQuoteOfDay();
  ctx.save();
  ctx.textAlign = 'center';
  
  // Positioned near the bottom (h * 0.85)
  const fontSize = w * 0.038;
  const startY = h * 0.82;
  
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `300 ${fontSize}px sans-serif`;
  const lineCount = wrapText(ctx, quote.text.toUpperCase(), w / 2, startY, w * 0.85, fontSize * 1.4);
  
  ctx.fillStyle = accent + 'aa';
  ctx.font = `italic 200 ${w * 0.03}px serif`;
  ctx.fillText(`— ${quote.author}`, w / 2, startY + (lineCount + 1) * (fontSize * 1.4));
  
  // Footer Brand
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '600 ' + (w * 0.02) + 'px sans-serif';
  ctx.fillText("ONEDOT.TODAY", w / 2, h * 0.95);
  
  ctx.restore();
}
function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const hour = new Date().getHours();
  
  let stops: [number, string][] = [];
  
  if (hour >= 5 && hour < 11) {
    // Morning: Warm Sunrise
    stops = [[0, '#1a1005'], [0.5, '#261800'], [1, '#1a1005']];
  } else if (hour >= 11 && hour < 18) {
    // Day: Professional Slate
    stops = [[0, '#050505'], [1, '#111111']];
  } else {
    // Night: Deep Midnight
    stops = [[0, '#02040a'], [1, '#000000']];
  }

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([pos, color]) => grad.addColorStop(pos, color));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle vignette
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.85);
  vig.addColorStop(0, 'transparent');
  vig.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function drawUltimateGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, isDim: boolean = false) {
  if (isDim) {
    ctx.fillStyle = color + '44';
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    return;
  }

  // 1. THE OUTER HALO
  const haloRadius = radius * 8;
  const halo = ctx.createRadialGradient(x, y, radius, x, y, haloRadius);
  halo.addColorStop(0, color + '33');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(x, y, haloRadius, 0, Math.PI * 2); ctx.fill();

  // 2. THE BLOOM
  const bloom = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
  bloom.addColorStop(0, color + '88');
  bloom.addColorStop(1, 'transparent');
  ctx.fillStyle = bloom;
  ctx.beginPath(); ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2); ctx.fill();

  // 3. THE CORE
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
}

// ── MEMENTO MORI ENGINE ──────────────────────────────────────────────
export async function generateMementoMoriPNG(uid: string, config: any): Promise<Buffer> {
  const { 
    res = 'iphone', 
    accent = STYLE_ACCENTS['memento-mori'], 
    birthYear = 1995, 
    density = 'life' 
  } = config;

  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w;
  const h = resolution.h;

  // 1. Background
  drawBackground(ctx, w, h, accent);

  // 2. Data Calculation
  const currentYear = new Date().getFullYear();
  const now = new Date();
  const startOfYear = new Date(currentYear, 0, 1);
  const currentWeek = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  const isLife = density === 'life';
  // 2. The Pulse (Ultimate Glow)
  if (Math.random() > 0.5) {
     const cx = w/2, cy = h/2;
     const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.8);
     grd.addColorStop(0, accent + '11');
     grd.addColorStop(1, 'transparent');
     ctx.fillStyle = grd;
     ctx.fillRect(0, 0, w, h);
  }
  // 3. Draw Quote (Daily Wisdom)
  drawDailyQuote(ctx, w, h, accent);

  // 4. Draw Grid
  const padding = w * 0.1;
  const availW = w - padding * 2;
  const gridCols = isLife ? 52 : 13;
  const totalRows = isLife ? 90 : 4;
  const totalDots = totalRows * gridCols;
  
  const age = currentYear - birthYear;
  const pastWks = isLife ? (age * 52 + currentWeek) : currentWeek;

  const gap = isLife ? w * 0.005 : w * 0.02;
  const dotSize = (availW - gap * (gridCols - 1)) / gridCols;
  const dotRadius = dotSize / 2;
  
  const gridH = totalRows * dotSize + (totalRows - 1) * gap;
  const ox = padding + dotRadius;
  const oy = h * 0.5 - gridH / 2;

  // Shuffle Mood Logic: 50% chance of glow vs dim on each fetch
  const isDim = Math.random() > 0.5;

  for (let i = 0; i < totalDots; i++) {
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const x = ox + col * (dotSize + gap);
    const y = oy + row * (dotSize + gap);
    
    if (i === pastWks) {
      drawUltimateGlow(ctx, x, y, dotRadius, accent, isDim);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = i < pastWks ? accent : 'rgba(255,255,255,0.08)';
      ctx.fill();
    }
  }

  return canvas.toBuffer('image/png');
}

// ── DOT GRID ENGINE ──────────────────────────────────────────────────
export async function generateDotGridPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['dot-grid'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w;
  const h = resolution.h;

  drawBackground(ctx, w, h, accent);
  drawDailyQuote(ctx, w, h, accent);

  const daysLeft = getDaysLeft(config.targetDate || new Date());

  // Header text - Lowered for clock clearance
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '300 ' + (w * 0.038) + 'px sans-serif';
  ctx.fillText('life in weeks', w / 2, h * 0.40);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 ' + (w * 0.24) + 'px sans-serif';
  ctx.fillText(Math.max(0, daysLeft).toString(), w / 2, h * 0.55);

  ctx.fillStyle = accent + 'cc';
  ctx.font = '300 ' + (w * 0.038) + 'px sans-serif';
  ctx.fillText('days remaining', w / 2, h * 0.60);

  // Grid
  const totalDots = 120;
  const pastDots = Math.max(0, Math.min(totalDots, totalDots - Math.round((daysLeft / 365) * totalDots)));
  const cols = 10;
  const rows = Math.ceil(totalDots / cols);
  const dotR = w * 0.022;
  const gapX = (w * 0.76) / (cols - 1);
  const ox = (w - (gapX * (cols - 1))) / 2;
  const oy = h * 0.65;

  for (let i = 0; i < totalDots; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ox + col * gapX;
    const y = oy + row * gapX;
    if (i < pastDots) {
      ctx.beginPath(); ctx.arc(x, y, dotR, 0, Math.PI * 2); ctx.fillStyle = accent; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x, y, dotR * 0.75, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    }
  }

  return canvas.toBuffer('image/png');
}

// ── LARGE COUNTDOWN ENGINE ──────────────────────────────────────────
export async function generateLargeCountdownPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['large-countdown'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, accent);
  drawDailyQuote(ctx, w, h, accent);

  const daysLeft = getDaysLeft(config.targetDate || new Date());

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = '300 ' + (w * 0.042) + 'px sans-serif';
  ctx.fillText('DAYS REMAINING', w / 2, h * 0.41);

  ctx.fillStyle = accent;
  ctx.font = '900 ' + (w * 0.35) + 'px sans-serif';
  ctx.fillText(Math.max(0, daysLeft).toString(), w / 2, h * 0.62);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.font = '300 ' + (w * 0.036) + 'px sans-serif';
  ctx.fillText('UNTIL YOUR GOAL', w / 2, h * 0.70);

  return canvas.toBuffer('image/png');
}

// ── PROGRESS BAR ENGINE ──────────────────────────────────────────────
export async function generateProgressBarPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['progress-bar'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, accent);
  drawDailyQuote(ctx, w, h, accent);

  const daysLeft = getDaysLeft(config.targetDate || new Date());
  const progress = Math.max(0, Math.min(1, 1 - daysLeft / 365));
  const pct = Math.round(progress * 100);

  ctx.textAlign = 'center';
  ctx.fillStyle = accent + 'aa';
  ctx.font = '300 ' + (w * 0.037) + 'px sans-serif';
  ctx.fillText('YEAR PROGRESS', w / 2, h * 0.43);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 ' + (w * 0.22) + 'px sans-serif';
  ctx.fillText(`${pct}%`, w / 2, h * 0.58);

  const bw = w * 0.72, bh = w * 0.022;
  const bx = (w - bw) / 2, by = h * 0.63;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = accent;
  ctx.fillRect(bx, by, bw * progress, bh);

  return canvas.toBuffer('image/png');
}

// ── QUARTERLY VIEW ENGINE ───────────────────────────────────────────
export async function generateQuarterlyViewPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['quarterly-view'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  ctx.fillStyle = '#f5f5f7';
  ctx.fillRect(0, 0, w, h);
  drawDailyQuote(ctx, w, h, '#1c1c1e');

  const now = new Date();
  const currentMonth = now.getMonth();
  const qStartMonth = Math.floor(currentMonth / 3) * 3;
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  const startY = h * 0.45;
  const calendarPadding = w * 0.12;
  const monthW = (w - calendarPadding * 2) / 3;

  for (let i = 0; i < 3; i++) {
    const m = qStartMonth + i;
    const mx = calendarPadding + i * monthW;
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.font = `600 ${w * 0.02}px sans-serif`;
    ctx.fillText(monthLabels[m], mx + monthW / 2, startY);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4b4b4b';
  ctx.font = `800 ${w * 0.04}px sans-serif`;
  ctx.fillText('VITA BREVIS', w / 2, h * 0.75);

  return canvas.toBuffer('image/png');
}

// ── YEARLY VIEW ENGINE ──────────────────────────────────────────────
export async function generateYearlyViewPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['yearly-view'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, '#041c14');
  drawDailyQuote(ctx, w, h, accent);

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `800 ${w * 0.045}px sans-serif`;
  ctx.fillText('MAKE IT COUNT', w / 2, h * 0.75);

  return canvas.toBuffer('image/png');
}

// ── CARPE DIEM ENGINE ───────────────────────────────────────────────
export async function generateCarpeDiemPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['carpe-diem'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, '#1a1005');
  drawDailyQuote(ctx, w, h, accent);

  const daysLeft = getDaysLeft(config.targetDate || new Date());

  ctx.textAlign = 'center';
  ctx.fillStyle = accent + 'aa';
  ctx.font = `200 ${w * 0.04}px sans-serif`;
  ctx.fillText('C A R P E  D I E M', w / 2, h * 0.40);

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${w * 0.28}px sans-serif`;
  ctx.fillText(Math.max(0, daysLeft).toString(), w / 2, h * 0.61);

  return canvas.toBuffer('image/png');
}

// ── LIFE VIEW ENGINE ────────────────────────────────────────────────
export async function generateLifeViewPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['life-view'], birthYear = 1995 } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, '#080c08');
  drawDailyQuote(ctx, w, h, accent);

  const currentYear = new Date().getFullYear();
  const weeksLived = (currentYear - birthYear) * 52;
  const TOTAL = 90 * 52;

  const padding = w * 0.055;
  const availW = w - padding * 2;
  const gap = w * 0.003;
  const boxW = (availW - gap * (52 - 1)) / 52;
  const ox = padding;
  const oy = h * 0.25;

  for (let i = 0; i < TOTAL; i++) {
    const col = i % 52;
    const row = Math.floor(i / 52);
    const x = ox + col * (boxW + gap);
    const y = oy + row * (boxW + gap);
    ctx.fillStyle = i < weeksLived ? accent : 'rgba(255,255,255,0.05)';
    ctx.fillRect(x, y, boxW, boxW);
  }

  return canvas.toBuffer('image/png');
}

// ── WEEKLY GRID ENGINE ──────────────────────────────────────────────
export async function generateWeeklyGridPNG(uid: string, config: any): Promise<Buffer> {
  const { res = 'iphone', accent = STYLE_ACCENTS['weekly-grid'] } = config;
  const resolution = RESOLUTIONS[res as keyof typeof RESOLUTIONS] || RESOLUTIONS.iphone;
  const canvas = createCanvas(resolution.w, resolution.h);
  const ctx = canvas.getContext('2d');
  const w = resolution.w, h = resolution.h;

  drawBackground(ctx, w, h, '#050505');
  drawDailyQuote(ctx, w, h, accent);

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const currentWeek = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

  const padding = w * 0.1;
  const cols = 4, rows = 13;
  const gap = w * 0.04;
  const boxW = (w - padding * 2 - gap * (cols - 1)) / cols;
  const ox = padding, oy = h * 0.35;

  for (let i = 0; i < 52; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = ox + col * (boxW + gap);
    const y = oy + row * (boxW + gap);
    ctx.fillStyle = i < currentWeek ? accent : 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, boxW, boxW);
  }

  return canvas.toBuffer('image/png');
}
