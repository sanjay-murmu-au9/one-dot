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
  'quarterly-view': '#1a1a1a',
  'yearly-view':    '#6ee7b7',
  'carpe-diem':     '#fbbf24',
  'memento-mori':   '#94a3b8',
  'weekly-grid':    '#22d3ee',
  'life-view':      '#a3e635',
  'special-dates':  '#f472b6',
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

function getHourglassProgress() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()

  // Calculate minutes since midnight (24-hour cycle)
  const minutesSinceMidnight = hours * 60 + minutes

  // Total minutes in 24 hours = 1440
  const totalMinutes = 24 * 60

  // Progress from 0.0 (midnight) to 1.0 (11:59 PM)
  const progress = minutesSinceMidnight / totalMinutes

  // Clamp to 0-1 range (safety)
  return Math.max(0, Math.min(1, progress))
}

function getHourglassImageIndex() {
  const progress = getHourglassProgress()

  // 5 images: divide progress into 5 equal segments
  const imageIndex = Math.floor(progress * 5)

  // Clamp to 0-4 range (safety)
  return Math.max(0, Math.min(4, imageIndex))
}

// Helper function to load hourglass image (exported for use in hooks)
export function loadHourglassImage() {
  return new Promise((resolve, reject) => {
    const imageIndex = getHourglassImageIndex()
    const img = new Image()
    img.crossOrigin = 'anonymous'
    // Use Vite's BASE_URL for robust asset loading in dev and prod
    img.src = `${import.meta.env.BASE_URL}assets/hourglass/hourglass-${imageIndex}.png`
    img.onload = () => resolve(img)
    img.onerror = (err) => {
      console.error('Failed to load hourglass image:', err)
      resolve(null) // Resolve with null instead of rejecting to prevent errors
    }
  })
}

export function drawTimerOverlay(ctx, w, h, color, hourglassImg = null, styleId = '', density = '') {
  ctx.save()
  ctx.textAlign = 'center'

  // 1. Draw Hourglass Image (only for memento-mori lifetime mode)
  const showHourglass = styleId === 'memento-mori' && density === 'life' && hourglassImg
  if (showHourglass) {
    // Make hourglass much larger and more prominent
    const hourglassHeight = w * 0.50  // 50% of canvas width for dramatic size
    const aspectRatio = hourglassImg.width / hourglassImg.height
    const hourglassWidth = hourglassHeight * aspectRatio

    const centerX = w / 2
    const centerY = h * 0.65  // Off-center composition: 65% from top

    // Draw image centered
    ctx.globalAlpha = 1
    ctx.drawImage(
      hourglassImg,
      centerX - hourglassWidth / 2,
      centerY - hourglassHeight / 2,
      hourglassWidth,
      hourglassHeight
    )
  }

  // 2. Draw Progress Bar at bottom (24-hour cycle progress) - only for memento-mori
  if (styleId === 'memento-mori') {
    const progress = getHourglassProgress()
    const barWidth = w * 0.85  // 85% of screen width
    const barHeight = h * 0.003  // Thin, elegant line
    const barX = (w - barWidth) / 2
    const barY = h * 0.82  // Below hourglass (65%), above icons (82% from top)

    // Draw background track (unfilled portion)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    // Draw filled portion (progress)
    if (progress > 0) {
      const filledWidth = barWidth * progress
      // Gradient from coral/salmon to brighter color
      const gradient = ctx.createLinearGradient(barX, barY, barX + filledWidth, barY)
      gradient.addColorStop(0, '#ff9b8a')  // Coral/salmon
      gradient.addColorStop(1, '#ff6b5a')  // Brighter coral
      ctx.fillStyle = gradient
      ctx.fillRect(barX, barY, filledWidth, barHeight)
    }
  }

  ctx.restore()
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

// ── QUARTERLY VIEW ───────────────────────────────────────────────────
function drawQuarterlyView(ctx, w, h, daysLeft, accent, bgImage) {
  if (bgImage) {
    drawBackground(ctx, w, h, [], bgImage)
  } else {
    // Pure clean white background
    ctx.fillStyle = '#f5f5f7'
    ctx.fillRect(0, 0, w, h)
  }

  const now = new Date()
  const currentYear = now.getFullYear()
  const todayDate = now.getDate()
  const currentMonth = now.getMonth() // 0-11
  
  // Calculate the current quarter start month
  const qStartMonth = Math.floor(currentMonth / 3) * 3
  const qMonths = [qStartMonth, qStartMonth + 1, qStartMonth + 2]
  const monthLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  // Grid layout for 3 months
  const calendarPadding = w * 0.12
  const calendarW = w - (calendarPadding * 2)
  const monthGap = w * 0.08
  const monthW = (calendarW - (monthGap * 2)) / 3
  
  // The layout starts below the huge clock.
  const startY = h * 0.52

  for (let i = 0; i < 3; i++) {
    const m = qMonths[i]
    if (m > 11) break // Safety

    const daysInMonth = new Date(currentYear, m + 1, 0).getDate()
    const firstDay = new Date(currentYear, m, 1).getDay() // 0 = Sun, 1 = Mon, ...
    
    // Convert 0=Sun, 1=Mon ... to 0=Mon, 1=Tue ... 6=Sun
    const startOffset = (firstDay + 6) % 7
    
    const mx = calendarPadding + i * (monthW + monthGap)
    
    // Month Header
    ctx.textAlign = 'center'
    setFont(ctx, '600', w * 0.02, 'system-ui, -apple-system, sans-serif')
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillText(monthLabels[m], mx + (monthW / 2), startY)

    // Numbers Grid
    const numCols = 7
    const colW = monthW / numCols
    const rowH = w * 0.035
    
    // Draw day letters (optional, screenshot doesn't show them, just numbers)
    // Wait, screenshot shows 2 3 4 5 6 7 8 ... just the numbers!
    
    const numsStartY = startY + w * 0.04
    ctx.textAlign = 'center'
    setFont(ctx, '700', w * 0.02, 'system-ui, -apple-system, sans-serif')
    
    for (let d = 1; d <= daysInMonth; d++) {
      const pos = startOffset + (d - 1)
      const col = pos % numCols
      const row = Math.floor(pos / numCols)
      
      const x = mx + (col * colW) + (colW / 2)
      const y = numsStartY + (row * rowH)
      
      // Determine if past or future
      let isPastOrCurrent = false
      if (m < currentMonth) {
        isPastOrCurrent = true
      } else if (m === currentMonth && d <= todayDate) {
        isPastOrCurrent = true
      }
      
      ctx.fillStyle = isPastOrCurrent ? '#1c1c1e' : 'rgba(0,0,0,0.1)'
      ctx.fillText(d.toString(), x, y)
    }
  }

  // Footer: VITA BREVIS
  const footerY = h * 0.85
  ctx.textAlign = 'center'
  setFont(ctx, '800', w * 0.04, 'system-ui, -apple-system, sans-serif')
  ctx.fillStyle = '#4b4b4b' // Dark grey
  ctx.fillText('VITA BREVIS', w / 2, footerY)

  // Sub Footer: ONEDOT.TODAY
  const urlY = footerY + h * 0.025
  setFont(ctx, '600', w * 0.02, 'system-ui, -apple-system, sans-serif')
  
  const urlText = 'ONEDOT.TODAY'
  const urlWidth = ctx.measureText(urlText).width
  const dotX = w / 2 - urlWidth / 2 - w * 0.025
  const dotY = urlY - w * 0.007
  
  ctx.beginPath()
  ctx.arc(dotX, dotY, w * 0.006, 0, Math.PI * 2)
  ctx.fillStyle = '#ef4444' // Red dot
  ctx.fill()
  
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillText(urlText, w / 2 + w * 0.012, urlY)
}

// ── YEARLY VIEW ─────────────────────────────────────────────────────
function drawYearlyView(ctx, w, h, daysLeft, accent, bgImage) {
  // Deep forest green background matching screenshot
  drawBackground(ctx, w, h, [[0, '#041c14'], [1, '#020f0a']], bgImage)

  const now = new Date()
  const year = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDate = now.getDate()
  
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
  
  // Calculate days in each month for the current year
  const daysInMonth = months.map((_, i) => new Date(year, i + 1, 0).getDate())
  
  // Grid layout for 3 columns x 4 rows
  const gridCols = 3
  const gridRows = 4
  
  const calendarPadding = w * 0.16
  const calendarW = w - (calendarPadding * 2)
  const monthGapX = w * 0.10
  const monthGapY = h * 0.04
  
  // Calculate width of a single month block
  const monthW = (calendarW - (monthGapX * (gridCols - 1))) / gridCols
  
  // Dot properties inside a month
  const dotCols = 7
  const dotGap = monthW * 0.11
  const dotSize = (monthW - (dotGap * (dotCols - 1))) / dotCols
  const dotRadius = dotSize / 2
  
  const calendarH = gridRows * (6 * dotSize + 5 * dotGap + w * 0.06) + (gridRows - 1) * monthGapY
  const startY = h * 0.33 // Start below the lock screen clock
  
  // Draw the months
  for (let m = 0; m < 12; m++) {
    const gridX = m % gridCols
    const gridY = Math.floor(m / gridCols)
    
    // Top-left coordinate for this month's block
    const mx = calendarPadding + gridX * (monthW + monthGapX)
    const my = startY + gridY * (6 * dotSize + 5 * dotGap + w * 0.06 + monthGapY)
    
    // Month Label
    ctx.textAlign = 'center'
    setFont(ctx, '600', w * 0.022, 'system-ui, -apple-system, sans-serif')
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
    ctx.fillText(months[m], mx + (monthW / 2), my)
    
    // Draw dots
    const days = daysInMonth[m]
    const dotsStartY = my + w * 0.035
    
    for (let d = 0; d < days; d++) {
      const dotX = mx + (d % dotCols) * (dotSize + dotGap) + dotRadius
      const dotY = dotsStartY + Math.floor(d / dotCols) * (dotSize + dotGap) + dotRadius
      
      const isPastMonth = m < currentMonth
      const isPastDay = m === currentMonth && d < (currentDate - 1)
      const isToday = m === currentMonth && d === (currentDate - 1)
      const isPast = isPastMonth || isPastDay
      
      ctx.beginPath()
      ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2)
      
      if (isPast || isToday) {
        ctx.fillStyle = accent
        if (isToday) {
          ctx.shadowColor = accent
          ctx.shadowBlur = 6
        } else {
          ctx.shadowBlur = 0
        }
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.06)'
        ctx.shadowBlur = 0
      }
      
      ctx.fill()
    }
  }
  
  ctx.shadowBlur = 0
  
  // Bottom Stats & Text
  const jan1 = new Date(year, 0, 1)
  const totalDays = (new Date(year + 1, 0, 1) - jan1) / (1000 * 60 * 60 * 24)
  const daysPassed = Math.floor((now - jan1) / (1000 * 60 * 60 * 24))
  const yrDaysLeft = totalDays - daysPassed
  const pctPassed = Math.round((daysPassed / totalDays) * 100)
  
  const bottomAreaY = startY + calendarH + h * 0.03
  
  // 319d left • 13% (Yellow & Green)
  setFont(ctx, '700', w * 0.024, 'system-ui, -apple-system, sans-serif')
  
  ctx.textAlign = 'right'
  ctx.fillStyle = '#fbbf24' // Yellow for days left
  ctx.fillText(`${yrDaysLeft}d left`, w / 2 - w * 0.01, bottomAreaY)
  
  ctx.textAlign = 'left'
  ctx.fillStyle = accent
  ctx.globalAlpha = 0.7
  ctx.fillText(`· ${pctPassed}%`, w / 2 + w * 0.01, bottomAreaY)
  ctx.globalAlpha = 1
  
  // "MAKE IT COUNT" text
  const makeItCountY = h * 0.84
  ctx.textAlign = 'center'
  setFont(ctx, '800', w * 0.045, 'system-ui, -apple-system, sans-serif')
  ctx.fillStyle = accent
  ctx.fillText('MAKE IT COUNT', w / 2, makeItCountY)
  
  // "ONEDOT.TODAY" with red dot
  const urlY = makeItCountY + h * 0.025
  setFont(ctx, '600', w * 0.02, 'system-ui, -apple-system, sans-serif')
  
  const urlText = 'ONEDOT.TODAY'
  const urlWidth = ctx.measureText(urlText).width
  const dotX = w / 2 - urlWidth / 2 - w * 0.025
  const dotY = urlY - w * 0.007
  
  ctx.beginPath()
  ctx.arc(dotX, dotY, w * 0.006, 0, Math.PI * 2)
  ctx.fillStyle = '#ef4444' // Red dot
  ctx.fill()
  
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillText(urlText, w / 2 + w * 0.012, urlY)
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
    shape = 'square',
    density = 'year',
    birthYear = null,
    achieved = false,
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
    const isCurrent = i === pastWks

    // Calculate goal week index
    const goalDate = new Date()
    goalDate.setDate(goalDate.getDate() + daysLeft)
    const goalYear = goalDate.getFullYear()
    const goalWeekOfYear = Math.floor((goalDate - new Date(goalYear, 0, 1)) / (7 * 24 * 60 * 60 * 1000))
    let goalIndex
    if (isLife) {
      const goalAge = goalYear - parseInt(birthYear)
      goalIndex = goalAge * 52 + goalWeekOfYear
    } else {
      goalIndex = goalWeekOfYear
    }
    const isGoal = i === Math.min(goalIndex, total - 1)

    if (isGoal && !isCurrent) {
      // Goal week — coral filled box with label
      ctx.fillStyle = '#ff5f45'
      ctx.shadowColor = '#ff5f45'
      ctx.shadowBlur = isLife ? 6 : 14
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
      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'
      // "GOAL" label above the box (only in year mode, enough space)
      if (!isLife) {
        setFont(ctx, '600', w * 0.022)
        ctx.fillStyle = '#ff5f45'
        ctx.textAlign = 'center'
        ctx.fillText('GOAL', x + boxW / 2, y - w * 0.01)
      }
      // Strikethrough when achieved
      if (achieved) {
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = isLife ? 1 : 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x + boxW * 0.1, y + boxH / 2)
        ctx.lineTo(x + boxW * 0.9, y + boxH / 2)
        ctx.stroke()
      }
    } else if (isCurrent) {
      // Enhanced static glow ("shine") for current week
      const cx = x + boxW / 2
      const cy = y + boxH / 2
      const r = Math.min(boxW, boxH) / 2

      // 1. Draw large outer halo
      const haloRadius = isLife ? r * 5 : r * 3
      const halo = ctx.createRadialGradient(cx, cy, r, cx, cy, haloRadius)
      halo.addColorStop(0, accent + '66')
      halo.addColorStop(0.4, accent + '22')
      halo.addColorStop(1, 'transparent')
      ctx.fillStyle = halo
      ctx.beginPath()
      ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2)
      ctx.fill()

      // 2. Draw bright inner glow ("bloom")
      const bloom = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 1.5)
      bloom.addColorStop(0, '#ffffff88')
      bloom.addColorStop(1, 'transparent')
      ctx.fillStyle = bloom
      ctx.beginPath()
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // 3. Draw the main shape with a sharp white fill
      ctx.fillStyle = '#ffffff'
      if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.roundRect(x, y, boxW, boxH, isLife ? 1 : 3)
        ctx.fill()
      }

      // 4. Add a sharp white stroke for extra "pop"
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = isLife ? 1 : 2
      ctx.beginPath()
      if (shape === 'circle') {
        ctx.arc(cx, cy, r + (isLife ? 0.5 : 1), 0, Math.PI * 2)
      } else {
        ctx.roundRect(x - 0.5, y - 0.5, boxW + 1, boxH + 1, isLife ? 1 : 3)
      }
      ctx.stroke()
    } else {
      ctx.fillStyle = filled ? accent : 'rgba(255,255,255,0.07)'
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
  const rawTitleY = oy - h * 0.06
  // Ensure title never overlaps the date (at h*0.16) — just below it, not inside the grid
  const titleY = Math.max(rawTitleY, h * 0.19)
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
    const goalDate = new Date()
    goalDate.setDate(goalDate.getDate() + daysLeft)
    const goalWeek = Math.floor((goalDate - new Date(goalDate.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
    setFont(ctx, '400', w * 0.042)
    ctx.fillStyle = accent + 'cc'
    ctx.textAlign = 'center'
    ctx.fillText(`week ${currentWeek} of 52 · ${currentYear}`, w / 2, statsY)
    setFont(ctx, '300', w * 0.03)
    ctx.fillStyle = '#ff5f45cc'
    ctx.fillText(`■ goal → week ${goalWeek} · ${goalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, w / 2, statsY + h * 0.038)
  }
}

// ── LIFE VIEW ───────────────────────────────────────────────────────
// opts: { birthYear, dotShape, accentColor }
function drawLifeView(ctx, w, h, daysLeft, accent, bgImage, opts = {}) {
  const { birthYear = 1995, dotShape = 'square' } = opts

  if (bgImage) {
    drawBackground(ctx, w, h, [], bgImage)
  } else {
    ctx.fillStyle = '#080c08'
    ctx.fillRect(0, 0, w, h)
  }
  // vignette
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.15, w/2, h/2, h*0.9)
  vig.addColorStop(0, 'transparent')
  vig.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  const currentYear = new Date().getFullYear()
  const now = new Date()
  const startOfYear = new Date(currentYear, 0, 1)
  const currentWeekOfYear = Math.floor((now - startOfYear) / (7 * 24 * 60 * 60 * 1000))
  const age = currentYear - parseInt(birthYear)
  const weeksLived = Math.min(age * 52 + currentWeekOfYear, 90 * 52)

  const TOTAL = 90 * 52  // 4680 weeks
  const COLS  = 52
  const ROWS  = 90

  const padding = w * 0.055
  const availW  = w - padding * 2
  const gap     = w * 0.003
  const boxW    = (availW - gap * (COLS - 1)) / COLS
  const boxH    = boxW
  const gapY    = gap
  const gridH   = ROWS * boxH + (ROWS - 1) * gapY

  // Header area
  const headerH = h * 0.13
  const ox = padding
  const oy = headerH + (h - headerH - gridH) / 2

  ctx.textAlign = 'center'
  setFont(ctx, '200', w * 0.034)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText('L I F E  I N  W E E K S', w / 2, h * 0.055)

  setFont(ctx, '600', w * 0.058)
  ctx.fillStyle = accent
  ctx.fillText(`${weeksLived.toLocaleString()}`, w / 2, h * 0.095)

  setFont(ctx, '200', w * 0.026)
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText(`weeks lived of ${TOTAL.toLocaleString()} · age ${age}`, w / 2, h * 0.122)

  for (let i = 0; i < TOTAL; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x   = ox + col * (boxW + gap)
    const y   = oy + row * (boxH + gapY)
    const filled  = i < weeksLived
    const isCurrent = i === weeksLived

    ctx.fillStyle = filled
      ? (isCurrent ? '#ffffff' : accent)
      : 'rgba(255,255,255,0.055)'

    if (isCurrent) {
      // glow for current week
      ctx.shadowColor = accent
      ctx.shadowBlur  = 6
    }

    if (dotShape === 'circle') {
      const r = Math.min(boxW, boxH) / 2
      ctx.beginPath()
      ctx.arc(x + boxW / 2, y + boxH / 2, r, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.roundRect(x, y, boxW, boxH, 1)
      ctx.fill()
    }

    if (isCurrent) { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent' }
  }

  // Footer
  const weeksLeft = TOTAL - weeksLived
  const pct = Math.round((weeksLived / TOTAL) * 100)
  const footerY = oy + gridH + h * 0.025
  ctx.textAlign = 'center'
  setFont(ctx, '300', w * 0.028)
  ctx.fillStyle = accent + 'cc'
  ctx.fillText(`${weeksLeft.toLocaleString()} weeks remain · ${pct}% of 90 years`, w / 2, footerY)
}

// ── SPECIAL DATES ────────────────────────────────────────────────────
// opts: { highlights: [{start:'2026-03-01', end:'2026-03-07', color:'#f472b6', label:'Vacation'}], dotShape }
function drawSpecialDates(ctx, w, h, daysLeft, accent, bgImage, opts = {}) {
  const { highlights = [], dotShape = 'square' } = opts

  if (bgImage) {
    drawBackground(ctx, w, h, [], bgImage)
  } else {
    ctx.fillStyle = '#08080f'
    ctx.fillRect(0, 0, w, h)
  }
  const vig = ctx.createRadialGradient(w/2, h/2, h*0.15, w/2, h/2, h*0.9)
  vig.addColorStop(0, 'transparent')
  vig.addColorStop(1, 'rgba(0,0,0,0.55)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)

  const now      = new Date()
  const year     = now.getFullYear()
  const jan1     = new Date(year, 0, 1)
  const today    = Math.floor((now - jan1) / (1000 * 60 * 60 * 24))
  const isLeap   = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
  const TOTAL    = isLeap ? 366 : 365

  // Convert highlight ranges to a day-index → color map
  const dayColors = {}
  highlights.forEach(({ start, end, color }) => {
    if (!start || !end || !color) return
    const s = new Date(start)
    const e = new Date(end)
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const idx = Math.floor((d - jan1) / (1000 * 60 * 60 * 24))
      if (idx >= 0 && idx < TOTAL) dayColors[idx] = color
    }
  })

  const COLS    = 25
  const ROWS    = Math.ceil(TOTAL / COLS)
  const padding = w * 0.06
  const availW  = w - padding * 2
  const gap     = w * 0.012
  const boxW    = (availW - gap * (COLS - 1)) / COLS
  const boxH    = boxW * 0.82
  const gapY    = w * 0.01
  const gridH   = ROWS * boxH + (ROWS - 1) * gapY
  const headerH = h * 0.14
  const ox      = padding
  const oy      = headerH + (h - headerH - gridH) / 2

  ctx.textAlign = 'center'
  setFont(ctx, '200', w * 0.036)
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText('Y E A R  A H E A D', w / 2, h * 0.058)

  setFont(ctx, '700', w * 0.062)
  ctx.fillStyle = accent
  ctx.fillText(year.toString(), w / 2, h * 0.1)

  setFont(ctx, '200', w * 0.027)
  ctx.fillStyle = 'rgba(255,255,255,0.28)'
  ctx.fillText(`day ${today + 1} of ${TOTAL}`, w / 2, h * 0.126)

  for (let i = 0; i < TOTAL; i++) {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const x   = ox + col * (boxW + gap)
    const y   = oy + row * (boxH + gapY)

    const isToday     = i === today
    const isPast      = i < today
    const hlColor     = dayColors[i]

    if (isToday) {
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = accent
      ctx.shadowBlur  = 8
    } else if (hlColor) {
      ctx.fillStyle = hlColor
      ctx.shadowColor = hlColor
      ctx.shadowBlur  = 4
    } else if (isPast) {
      ctx.fillStyle = accent + '55'
      ctx.shadowBlur = 0
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.07)'
      ctx.shadowBlur = 0
    }

    if (dotShape === 'circle') {
      const r = Math.min(boxW, boxH) / 2
      ctx.beginPath()
      ctx.arc(x + boxW / 2, y + boxH / 2, r, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.roundRect(x, y, boxW, boxH, 1.5)
      ctx.fill()
    }
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
  }

  // Legend for highlights
  if (highlights.length > 0) {
    const legendY = oy + gridH + h * 0.028
    const legendItems = highlights.filter(h => h.label && h.color)
    const itemW = w / Math.max(legendItems.length, 1)
    legendItems.slice(0, 4).forEach((item, idx) => {
      const lx = padding + idx * itemW + itemW / 2
      ctx.fillStyle = item.color
      ctx.beginPath()
      ctx.arc(lx - w * 0.03, legendY - w * 0.005, w * 0.012, 0, Math.PI * 2)
      ctx.fill()
      setFont(ctx, '300', w * 0.024)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.textAlign = 'left'
      ctx.fillText(item.label.slice(0, 12), lx - w * 0.012, legendY)
    })
    ctx.textAlign = 'center'
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
// Returns pixel position of goal week box for tooltip overlay
export function getMementoGoalWeekPos(canvasW, canvasH, density, birthYear, daysLeft) {
  const goalDate = new Date()
  goalDate.setDate(goalDate.getDate() + daysLeft)
  const goalYear = goalDate.getFullYear()
  const goalWeek = Math.floor((goalDate - new Date(goalYear, 0, 1)) / (7 * 24 * 60 * 60 * 1000))

  const isLife = density === 'life' && birthYear
  const total = isLife ? 90 * 52 : 52
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

  let goalIndex = isLife
    ? (goalYear - parseInt(birthYear)) * 52 + goalWeek
    : goalWeek
  goalIndex = Math.min(goalIndex, total - 1)

  const col = goalIndex % cols
  const row = Math.floor(goalIndex / cols)
  return {
    x: ox + col * (boxW + gap),
    y: oy + row * (boxH + gapY),
    w: boxW,
    h: boxH,
    label: goalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

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
  'quarterly-view': drawQuarterlyView,
  'yearly-view':    drawYearlyView,
  'carpe-diem':     drawCarpeDiem,
  'memento-mori':   drawMementoMori,
  'weekly-grid':    drawWeeklyGrid,
  'life-view':      drawLifeView,
  'special-dates':  drawSpecialDates,
}

export default function WallpaperCanvas({ style, targetDate, resolution, backgroundImage, device }) {
  const canvasRef = useRef(null)
  
  // Resolve resolution: use device-provided resolution if 'native'
  const res = resolution === 'native' && device 
    ? device.resolution 
    : (RESOLUTIONS[resolution] || RESOLUTIONS.iphone)

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
