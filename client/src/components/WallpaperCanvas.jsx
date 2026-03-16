import { useEffect, useRef } from 'react'

export const RESOLUTIONS = {
  iphone: { w: 1170, h: 2532, label: 'iPhone', sub: '1170×2532' },
  android: { w: 1080, h: 2400, label: 'Android', sub: '1080×2400' },
  universal: { w: 1080, h: 1920, label: 'Universal', sub: '1080×1920' },
}

export const STYLE_ACCENTS = {
  'dot-grid':       '#a78bfa',
  'large-countdown':'#60a5fa',
  'progress-bar':   '#34d399',
  'minimal-text':   '#e2e8f0',
  'yearly-view':    '#f87171',
  'carpe-diem':     '#fbbf24',
  'memento-mori':   '#94a3b8',
  'weekly-grid':    '#22d3ee',
}

export function getDaysLeft(targetDate) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

// ── Shared helpers ──────────────────────────────────────────────────
function drawBackground(ctx, w, h, stops, bgImage = null) {
  if (bgImage) {
    // Draw background image scaled to cover
    const scale = Math.max(w / bgImage.width, h / bgImage.height)
    const iw = bgImage.width * scale
    const ih = bgImage.height * scale
    const ix = (w - iw) / 2
    const iy = (h - ih) / 2
    ctx.drawImage(bgImage, ix, iy, iw, ih)
    
    // Add a subtle darkening overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, w, h)
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    stops.forEach(([pos, color]) => grad.addColorStop(pos, color))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
  }
}

function setFont(ctx, weight, size, family = 'Inter, system-ui, sans-serif') {
  ctx.font = `${weight} ${size}px ${family}`
}

// ── DOT GRID ────────────────────────────────────────────────────────
function drawDotGrid(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#100d20'], [1, '#1e1538']], bgImage)

  // Subtle noise texture via pixel scatter
  const totalDots = 120
  const pastDots = Math.max(0, Math.min(totalDots, totalDots - Math.round((daysLeft / 365) * totalDots)))
  const cols = 10
  const rows = Math.ceil(totalDots / cols)
  const dotR  = w * 0.022
  const gapX  = (w * 0.76) / (cols - 1)
  const gapY  = gapX * 1.1
  const gridW = gapX * (cols - 1)
  const gridH = gapY * (rows - 1)
  const ox    = (w - gridW) / 2
  const oy    = h * 0.52

  for (let i = 0; i < totalDots; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = ox + col * gapX
    const y = oy + row * gapY + h * 0.2 // Shifted grid down

    if (i < pastDots) {
      ctx.beginPath()
      ctx.arc(x, y, dotR, 0, Math.PI * 2)
      const g = ctx.createRadialGradient(x - dotR * 0.3, y - dotR * 0.3, 0, x, y, dotR)
      g.addColorStop(0, '#fff')
      g.addColorStop(0.3, accent)
      g.addColorStop(1, accent + '88')
      ctx.fillStyle = g
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(x, y, dotR * 0.75, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.09)'
      ctx.fill()
    }
  }

  // Header text - Lowered for clock clearance
  ctx.textAlign = 'center'
  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText('life in weeks', w / 2, h * 0.45)

  setFont(ctx, '800', w * 0.24, 'Inter, sans-serif')
  ctx.fillStyle = '#ffffff'
  ctx.fillText(Math.max(0, daysLeft), w / 2, h * 0.62)

  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = accent + 'cc'
  ctx.fillText('days remaining', w / 2, h * 0.67)
}

// ── LARGE COUNTDOWN ─────────────────────────────────────────────────
function drawLargeCountdown(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#06101e'], [0.5, '#0a1830'], [1, '#0c1525']], bgImage)

  // Glowing circle behind number
  const cx = w / 2, cy = h * 0.45
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.5)
  glow.addColorStop(0, accent + '28')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.textAlign = 'center'
  setFont(ctx, '300', w * 0.042)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText('DAYS REMAINING', w / 2, h * 0.41)

  setFont(ctx, '900', w * 0.35, 'Inter, sans-serif')
  ctx.fillStyle = accent
  ctx.fillText(Math.max(0, daysLeft), w / 2, h * 0.66)

  // Underline stroke
  ctx.strokeStyle = accent
  ctx.lineWidth = w * 0.006
  ctx.lineCap = 'round'
  ctx.globalAlpha = 0.5
  ctx.beginPath()
  ctx.moveTo(w * 0.35, h * 0.705)
  ctx.lineTo(w * 0.65, h * 0.705)
  ctx.stroke()
  ctx.globalAlpha = 1

  setFont(ctx, '300', w * 0.036)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillText('UNTIL YOUR GOAL', w / 2, h * 0.75)
}

// ── PROGRESS BAR ────────────────────────────────────────────────────
function drawProgressBar(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#061409'], [0.5, '#0a200e'], [1, '#071409']], bgImage)

  const progress = Math.max(0, Math.min(1, 1 - daysLeft / 365))
  const pct = Math.round(progress * 100)

  ctx.textAlign = 'center'
  setFont(ctx, '300', w * 0.037)
  ctx.fillStyle = accent + 'aa'
  ctx.fillText('YEAR PROGRESS', w / 2, h * 0.43)

  setFont(ctx, '800', w * 0.22)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(`${pct}%`, w / 2, h * 0.58)

  // Bar track
  const bw = w * 0.72, bh = w * 0.022
  const bx = (w - bw) / 2, by = h * 0.63
  const r  = bh / 2

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, r)
  ctx.fill()

  // Filled portion
  if (progress > 0) {
    const filled = bw * progress
    const fg = ctx.createLinearGradient(bx, 0, bx + filled, 0)
    fg.addColorStop(0, accent + 'bb')
    fg.addColorStop(1, accent)
    ctx.fillStyle = fg
    ctx.beginPath()
    ctx.roundRect(bx, by, filled, bh, r)
    ctx.fill()
  }

  setFont(ctx, '300', w * 0.035)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText(`${Math.max(0, daysLeft)} days left in year`, w / 2, h * 0.685)
}

// ── MINIMAL TEXT ────────────────────────────────────────────────────
function drawMinimalText(ctx, w, h, daysLeft, accent, bgImage) {
  if (bgImage) {
    drawBackground(ctx, w, h, [], bgImage)
  } else {
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, w, h)
  }

  // Fine grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  for (let y = 0; y < h; y += h * 0.05) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
  }

  ctx.textAlign = 'center'
  setFont(ctx, '200', w * 0.032)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText('C O U N T D O W N', w / 2, h * 0.45)

  setFont(ctx, '100', w * 0.32)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(Math.max(0, daysLeft), w / 2, h * 0.63)

  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.7
  ctx.fillText('d a y s', w / 2, h * 0.68)
  ctx.globalAlpha = 1
}

// ── YEARLY VIEW ─────────────────────────────────────────────────────
function drawYearlyView(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#1a0808'], [1, '#280d0d']], bgImage)

  const year   = new Date().getFullYear()
  const curMon = new Date().getMonth()
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  const cols = 4, rows = 3

  ctx.textAlign = 'center'
  setFont(ctx, '300', w * 0.042)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText(year.toString(), w / 2, h * 0.41)

  const cw = w * 0.155, ch = w * 0.065
  const gx = (w - cols * cw) / (cols + 1)
  const gy = h * 0.45

  months.forEach((m, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x   = gx + col * (cw + gx)
    const y   = gy + row * (ch + w * 0.022)

    const done = i <= curMon
    if (done) {
      const g = ctx.createLinearGradient(x, y, x + cw, y + ch)
      g.addColorStop(0, accent)
      g.addColorStop(1, accent + 'cc')
      ctx.fillStyle = g
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
    }
    ctx.beginPath()
    ctx.roundRect(x, y, cw, ch, 6)
    ctx.fill()

    ctx.fillStyle = done ? '#fff' : 'rgba(255,255,255,0.25)'
    setFont(ctx, done ? '600' : '400', w * 0.028)
    ctx.fillText(m, x + cw / 2, y + ch * 0.68)
  })

  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillText(`${Math.max(0, daysLeft)} days left`, w / 2, h * 0.77)
}

// ── CARPE DIEM ──────────────────────────────────────────────────────
function drawCarpeDiem(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#1a1005'], [0.5, '#261800'], [1, '#1a1005']], bgImage)

  // Warm glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.7)
  glow.addColorStop(0, accent + '22')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.textAlign = 'center'
  setFont(ctx, '200', w * 0.04)
  ctx.fillStyle = accent + 'aa'
  ctx.fillText('C A R P E  D I E M', w / 2, h * 0.40)

  setFont(ctx, '800', w * 0.28)
  ctx.fillStyle = '#ffffff'
  ctx.fillText(Math.max(0, daysLeft), w / 2, h * 0.61)

  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('days to seize', w / 2, h * 0.66)

  // Italic quote
  ctx.font = `italic ${w * 0.032}px Georgia, serif`
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillText('"Gather ye rosebuds while ye may"', w / 2, h * 0.76)
}

// ── MEMENTO MORI ────────────────────────────────────────────────────
function drawMementoMori(ctx, w, h, daysLeft, accent, bgImage, opts = {}) {
  const {
    quote = 'M E M E N T O  M O R I',
    shape = 'square',       // 'square' | 'circle'
    density = 'year',       // 'year' | 'life'
    birthYear = null,
  } = opts

  if (bgImage) {
    drawBackground(ctx, w, h, [], bgImage)
  } else {
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)
  }

  // Subtle vignette
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.2, w/2, h/2, h*0.85)
  vig.addColorStop(0, 'transparent')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  const isLife = density === 'life' && birthYear
  const currentYear = new Date().getFullYear()
  const now = new Date()
  const startOfYear = new Date(currentYear, 0, 1)
  const currentWeek = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000))

  let total, pastWks
  if (isLife) {
    const age = currentYear - parseInt(birthYear)
    const weeksLived = age * 52 + currentWeek
    total = 90 * 52
    pastWks = Math.min(weeksLived, total)
  } else {
    total = 52
    pastWks = Math.min(currentWeek, 52)
  }

  // Grid layout
  const cols = isLife ? 52 : 13
  const rows = Math.ceil(total / cols)
  const padding = w * 0.06
  const availW = w - padding * 2
  const gap = isLife ? w * 0.004 : w * 0.018
  const boxW = (availW - gap * (cols - 1)) / cols
  const boxH = isLife ? boxW : w * 0.046
  const gapY = isLife ? gap : w * 0.022
  const gridH = rows * boxH + (rows - 1) * gapY
  const ox = padding
  const oy = h * 0.56 - gridH / 2

  for (let i = 0; i < total; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = ox + col * (boxW + gap)
    const y = oy + row * (boxH + gapY)
    const filled = i < pastWks
    const isCurrent = i === pastWks // current running week

    if (isCurrent) {
      // Bright pulsing current week — drawn with full accent + glow ring
      ctx.fillStyle = accent
      ctx.globalAlpha = 1
      if (shape === 'circle') {
        const r = Math.min(boxW, boxH) / 2
        // Outer glow ring
        ctx.beginPath()
        ctx.arc(x + boxW / 2, y + boxH / 2, r * 2, 0, Math.PI * 2)
        const glow = ctx.createRadialGradient(x + boxW/2, y + boxH/2, r * 0.5, x + boxW/2, y + boxH/2, r * 2)
        glow.addColorStop(0, accent + '66')
        glow.addColorStop(1, 'transparent')
        ctx.fillStyle = glow
        ctx.fill()
        // Main dot
        ctx.beginPath()
        ctx.arc(x + boxW / 2, y + boxH / 2, r, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      } else {
        // Outer glow
        ctx.shadowColor = accent
        ctx.shadowBlur = isLife ? 4 : 10
        ctx.beginPath()
        ctx.roundRect(x - 1, y - 1, boxW + 2, boxH + 2, isLife ? 2 : 4)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.shadowColor = 'transparent'
      }
    } else {
      ctx.fillStyle = filled ? accent : 'rgba(255,255,255,0.07)'
      ctx.globalAlpha = filled ? 1 : 1
      if (shape === 'circle') {
        const r = Math.min(boxW, boxH) / 2
        ctx.beginPath()
        ctx.arc(x + boxW / 2, y + boxH / 2, r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.roundRect(x, y, boxW, boxH, isLife ? 1 : 3)
        ctx.fill()
      }
    }
  }
  ctx.globalAlpha = 1

  // Title / quote
  ctx.textAlign = 'center'
  const titleY = oy - h * 0.06
  setFont(ctx, '200', w * (isLife ? 0.028 : 0.038))
  ctx.fillStyle = accent + 'cc'
  ctx.fillText(quote.toUpperCase(), w / 2, titleY)

  // Stats below grid
  const statsY = oy + gridH + h * 0.04
  if (isLife) {
    const age = currentYear - parseInt(birthYear)
    const weeksLeft = total - pastWks
    setFont(ctx, '300', w * 0.03)
    ctx.fillStyle = accent + 'cc'
    ctx.fillText(`${pastWks.toLocaleString()} weeks lived · ${weeksLeft.toLocaleString()} remaining`, w / 2, statsY)
    setFont(ctx, '200', w * 0.026)
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillText(`age ${age} · ${Math.round((pastWks / total) * 100)}% of 90 years`, w / 2, statsY + h * 0.035)
  } else {
    setFont(ctx, '300', w * 0.034)
    ctx.fillStyle = 'rgba(255,255,255,0.16)'
    ctx.fillText('weeks of the year', w / 2, statsY)
  }
}

// ── WEEKLY GRID ─────────────────────────────────────────────────────
function drawWeeklyGrid(ctx, w, h, daysLeft, accent, bgImage) {
  drawBackground(ctx, w, h, [[0, '#050d18'], [1, '#0b1628']], bgImage)

  // Soft glow
  const glow = ctx.createRadialGradient(w / 2, h * 0.48, 0, w / 2, h * 0.48, w * 0.6)
  glow.addColorStop(0, accent + '1a')
  glow.addColorStop(1, 'transparent')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  const today = new Date()
  const dow   = (today.getDay() + 6) % 7 // Mon=0
  const days  = ['MON','TUE','WED','THU','FRI','SAT','SUN']
  const dnums = days.map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - dow + i)
    return d.getDate()
  })

  ctx.textAlign = 'center'
  setFont(ctx, '200', w * 0.038)
  ctx.fillStyle = accent + 'aa'
  ctx.fillText('T H I S  W E E K', w / 2, h * 0.41)

  const cw   = w * 0.09, ch = w * 0.115
  const tot  = 7 * cw
  const gapX = (w - tot) / 8
  const oy   = h * 0.46

  days.forEach((d, i) => {
    const x    = gapX + i * (cw + gapX)
    const done = i < dow

    if (done) {
      const g = ctx.createLinearGradient(x, oy, x + cw, oy + ch)
      g.addColorStop(0, accent)
      g.addColorStop(1, accent + 'bb')
      ctx.fillStyle = g
    } else if (i === dow) {
      ctx.fillStyle = 'rgba(255,255,255,0.15)'
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.05)'
    }
    ctx.beginPath()
    ctx.roundRect(x, oy, cw, ch, 8)
    ctx.fill()

    ctx.fillStyle = done ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.35)'
    setFont(ctx, '400', w * 0.024)
    ctx.fillText(d, x + cw / 2, oy + ch * 0.32)

    ctx.fillStyle = done ? '#fff' : (i === dow ? '#fff' : 'rgba(255,255,255,0.5)')
    setFont(ctx, done ? '700' : '400', w * 0.038)
    ctx.fillText(dnums[i], x + cw / 2, oy + ch * 0.73)
  })

  setFont(ctx, '300', w * 0.038)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.fillText(`${Math.max(0, daysLeft)} days remaining`, w / 2, h * 0.63)
}

// ── Export ──────────────────────────────────────────────────────────
// Returns pixel position of current week box for pulse overlay
export function getMementoCurrentWeekPos(canvasW, canvasH, density, birthYear) {
  const currentYear = new Date().getFullYear()
  const now = new Date()
  const startOfYear = new Date(currentYear, 0, 1)
  const currentWeek = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000))

  const isLife = density === 'life' && birthYear
  let pastWks, total
  if (isLife) {
    const age = currentYear - parseInt(birthYear)
    total = 90 * 52
    pastWks = Math.min(age * 52 + currentWeek, total)
  } else {
    total = 52
    pastWks = Math.min(currentWeek, 52)
  }

  const cols = isLife ? 52 : 13
  const rows = Math.ceil(total / cols)
  const padding = canvasW * 0.06
  const availW = canvasW - padding * 2
  const gap = isLife ? canvasW * 0.004 : canvasW * 0.018
  const boxW = (availW - gap * (cols - 1)) / cols
  const boxH = isLife ? boxW : canvasW * 0.046
  const gapY = isLife ? gap : canvasW * 0.022
  const gridH = rows * boxH + (rows - 1) * gapY
  const ox = padding
  const oy = canvasH * 0.56 - gridH / 2

  const col = pastWks % cols
  const row = Math.floor(pastWks / cols)
  return {
    x: ox + col * (boxW + gap),
    y: oy + row * (boxH + gapY),
    w: boxW,
    h: boxH,
  }
}

export const DRAW_FUNCTIONS = {
  'dot-grid':       drawDotGrid,
  'large-countdown':drawLargeCountdown,
  'progress-bar':   drawProgressBar,
  'minimal-text':   drawMinimalText,
  'yearly-view':    drawYearlyView,
  'carpe-diem':     drawCarpeDiem,
  'memento-mori':   drawMementoMori,
  'weekly-grid':    drawWeeklyGrid,
}

export default function WallpaperCanvas({ style, targetDate, resolution, backgroundImage }) {
  const canvasRef = useRef(null)
  const res       = RESOLUTIONS[resolution] || RESOLUTIONS.iphone
  const drawFn    = DRAW_FUNCTIONS[style]
  const accent    = STYLE_ACCENTS[style] || '#a78bfa'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !drawFn) return
    canvas.width  = res.w
    canvas.height = res.h
    const ctx     = canvas.getContext('2d')
    ctx.clearRect(0, 0, res.w, res.h)

    if (style.includes('http') || style.startsWith('/')) {
        // This is a bit of a hack to handle cases where we pass a path
        // Instead let's use the props properly.
    }

    if (backgroundImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = backgroundImage
        img.onload = () => {
            drawFn(ctx, res.w, res.h, getDaysLeft(targetDate), accent, img)
        }
    } else {
        drawFn(ctx, res.w, res.h, getDaysLeft(targetDate), accent)
    }
  }, [style, targetDate, resolution, backgroundImage])

  return <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
}
