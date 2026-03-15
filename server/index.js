const express = require('express')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * POST /generate-wallpaper
 * Body: { date: "2026-12-31", style: "dot-grid", resolution: "iphone" }
 *
 * NOTE: Full-res generation is done on the client via the HTML Canvas API.
 * This endpoint validates the input and returns metadata. The client handles
 * the actual canvas rendering and PNG export (avoids native canvas build issues).
 */
app.post('/generate-wallpaper', (req, res) => {
  const { date, style, resolution } = req.body

  // Validate
  const validStyles = [
    'dot-grid', 'large-countdown', 'progress-bar', 'minimal-text',
    'yearly-view', 'carpe-diem', 'memento-mori', 'weekly-grid',
  ]
  const validResolutions = { iphone: [1170, 2532], android: [1080, 2400], universal: [1080, 1920] }

  if (!date || isNaN(new Date(date).getTime())) {
    return res.status(400).json({ error: 'Invalid date' })
  }
  if (!validStyles.includes(style)) {
    return res.status(400).json({ error: 'Invalid style', validStyles })
  }
  if (!validResolutions[resolution]) {
    return res.status(400).json({ error: 'Invalid resolution', validResolutions: Object.keys(validResolutions) })
  }

  const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))
  const [w, h] = validResolutions[resolution]

  res.json({
    success: true,
    meta: {
      style,
      date,
      resolution,
      daysLeft,
      width: w,
      height: h,
      filename: `one-countdown-${style}-${date}.png`,
    },
    message: 'Wallpaper parameters validated. Render client-side using the provided meta.',
  })
})

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, () => {
  console.log(`✅ OneCountdown API running at http://localhost:${PORT}`)
})
