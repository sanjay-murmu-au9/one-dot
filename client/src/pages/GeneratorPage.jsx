import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { RESOLUTIONS, DRAW_FUNCTIONS, STYLE_ACCENTS, getDaysLeft, getMementoCurrentWeekPos, getMementoGoalWeekPos } from '../components/WallpaperCanvas'
import { WALLPAPER_STYLES, PhoneUIOverlay, PhoneSideButtons } from '../components/PhoneCard'

// Next Monday (start of next week)
const DEFAULT_DATE = (() => {
  const d = new Date()
  const day = d.getDay()
  const daysUntilMonday = day === 0 ? 1 : 8 - day
  d.setDate(d.getDate() + daysUntilMonday)
  return d.toISOString().split('T')[0]
})()

// Min = next Monday, Max = Dec 31 of current year
const MIN_DATE = DEFAULT_DATE
const MAX_DATE = `${new Date().getFullYear()}-12-31`

const INPUT_CLS =
  'w-full rounded-xl px-4 py-3 border text-sm outline-none transition-all duration-200 bg-white'
const INPUT_STYLE = { borderColor: '#e8e8ed', color: '#1d1d1f' }
const FOCUSED_STYLE = { borderColor: '#ff5f45', boxShadow: '0 0 0 3px rgba(255,95,69,0.1)' }

function useFocus() {
  const [focused, setFocused] = useState(false)
  return { focused, onFocus: () => setFocused(true), onBlur: () => setFocused(false) }
}

export default function GeneratorPage() {
  const { style: routeStyle } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [selectedStyle, setSelectedStyle] = useState(routeStyle || 'dot-grid')
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [targetDate, setTargetDate]       = useState(DEFAULT_DATE)
  const [resolution, setResolution]       = useState('iphone')
  const [generating, setGenerating]       = useState(false)
  const [downloaded, setDownloaded]       = useState(false)
  const [goalAchieved, setGoalAchieved]   = useState(false)

  // Memento Mori specific options
  const [mmQuote, setMmQuote]         = useState('MEMENTO MORI')
  const [mmShape, setMmShape]         = useState('square')
  const [mmDensity, setMmDensity]     = useState('year')
  const [mmBirthYear, setMmBirthYear] = useState(new Date().getFullYear() - 25)
  const [mmColor, setMmColor]         = useState('#94a3b8')
  const [mmNote, setMmNote]           = useState('')

  // Extract background from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const bg = params.get('bg')
    if (bg) setBackgroundImage(bg)
  }, [location.search])

  const mobilePreviewRef  = useRef(null)
  const desktopPreviewRef = useRef(null)
  const downloadCanvasRef = useRef(null)

  const drawFn       = DRAW_FUNCTIONS[selectedStyle]
  const accent       = STYLE_ACCENTS[selectedStyle]
  const res          = RESOLUTIONS[resolution]
  const daysLeft     = getDaysLeft(targetDate)
  const activeAccent = selectedStyle === 'memento-mori' ? mmColor : accent
  const mmOpts = { quote: mmQuote, shape: mmShape, density: mmDensity, birthYear: mmBirthYear, achieved: goalAchieved }

  const PREVIEW_W = 176
  const PREVIEW_H = 360

  const renderPreview = useCallback(() => {
    [mobilePreviewRef, desktopPreviewRef].forEach(ref => {
      const canvas = ref.current
      if (!canvas || !drawFn) return
      canvas.width  = PREVIEW_W * 2
      canvas.height = PREVIEW_H * 2
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const opts = selectedStyle === 'memento-mori' ? { quote: mmQuote, shape: mmShape, density: mmDensity, birthYear: mmBirthYear, achieved: goalAchieved } : undefined
      if (backgroundImage) {
        const img = new Image()
        img.src = backgroundImage
        img.onload = () => drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, img, opts)
      } else {
        drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, null, opts)
      }
    })
  }, [drawFn, daysLeft, activeAccent, backgroundImage, selectedStyle, mmQuote, mmShape, mmDensity, mmBirthYear, goalAchieved])

  useEffect(() => { renderPreview() }, [renderPreview])

  useEffect(() => {
    const styleInfo = WALLPAPER_STYLES.find(s => s.id === selectedStyle)
    if (styleInfo) document.title = `Customize ${styleInfo.name} — one dot`
  }, [selectedStyle])

  const handleDownload = () => {
    setGenerating(true)
    const triggerDownload = (canvas) => {
      const url = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url
      a.download = `one-countdown-${selectedStyle}-${targetDate}.png`
      a.click()
      setGenerating(false)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    }
    setTimeout(() => {
      const canvas = downloadCanvasRef.current
      if (!canvas) return setGenerating(false)
      canvas.width  = res.w
      canvas.height = res.h
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, res.w, res.h)
      const opts = selectedStyle === 'memento-mori' ? { quote: mmQuote, shape: mmShape, density: mmDensity, birthYear: mmBirthYear, achieved: goalAchieved } : undefined
      if (backgroundImage) {
        const img = new Image()
        img.src = backgroundImage
        img.onload = () => drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, img, opts)
      } else {
        drawFn(ctx, res.w, res.h, daysLeft, activeAccent, null, opts)
        triggerDownload(canvas)
      }
    }, 500)
  }

  const styleInfo  = WALLPAPER_STYLES.find(s => s.id === selectedStyle)
  const dateLabel  = daysLeft > 0 ? `${daysLeft} days from today` : daysLeft === 0 ? 'Today!' : `${Math.abs(daysLeft)} days ago`
  const dateFocus  = useFocus()

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Back button */}
        <div className="mb-6 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium rounded-xl px-3 py-2 transition-all hover:bg-black/5"
            style={{ color: '#6e6e73' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
        </div>

        {/* Page title */}
        <div className="mb-6">
          <h1
            className="display-serif"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1d1d1f' }}
          >
            Create your wallpaper.
          </h1>
          <p className="mt-2 text-base" style={{ color: '#6e6e73' }}>
            Customize below, watch the preview update live, then download.
          </p>
        </div>

        {/* Split layout: Preview on top for mobile, right for desktop */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 items-start">

          {/* ── MOBILE PREVIEW (Top) ─────────────────────── */}
          <div className="lg:hidden w-full flex flex-col items-center gap-1 py-4 px-6 sticky top-16 z-30 transition-all duration-300" 
               style={{ 
                 background: 'transparent', 
                 backdropFilter: 'blur(12px) saturate(160%)',
                 WebkitBackdropFilter: 'blur(12px) saturate(160%)'
               }}>
            <div className="relative">
              {/* Subtle shadow glow behind phone */}
              <div 
                className="absolute inset-0 blur-[60px] opacity-20" 
                style={{ background: activeAccent, transform: 'scale(1.5)' }}
              />
              <div
                className={`phone-mockup relative z-10 ${
                  resolution === 'android' ? 'is-android' : 'is-iphone'
                }`}
                style={{ width: '220px', height: '450px' }}
              >
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: resolution === 'android' ? '36px' : '42px' }}
                >
                  <canvas
                    ref={mobilePreviewRef}
                    style={{ display: 'block', width: '220px', height: '450px', objectFit: 'cover' }}
                  />
                  {selectedStyle === 'memento-mori' && (() => {
                    const pos = getMementoCurrentWeekPos(PREVIEW_W * 2, PREVIEW_H * 2, mmDensity, mmBirthYear)
                    const scaleX = 220 / (PREVIEW_W * 2)
                    const scaleY = 450 / (PREVIEW_H * 2)
                    return (
                      <div className="mm-pulse-ring" style={{ left: pos.x * scaleX, top: pos.y * scaleY, width: pos.w * scaleX, height: pos.h * scaleY, background: activeAccent + '99' }} />
                    )
                  })()}
                  {selectedStyle === 'memento-mori' && mmNote && (() => {
                    const goalPos = getMementoGoalWeekPos(PREVIEW_W * 2, PREVIEW_H * 2, mmDensity, mmBirthYear, daysLeft)
                    const scaleX = 220 / (PREVIEW_W * 2)
                    const scaleY = 450 / (PREVIEW_H * 2)
                    return (
                      <div
                        className="absolute group"
                        style={{ left: goalPos.x * scaleX, top: goalPos.y * scaleY, width: goalPos.w * scaleX, height: goalPos.h * scaleY, zIndex: 30, cursor: 'pointer' }}
                      >
                        <div
                          className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 4px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100px',
                            background: 'rgba(14,14,16,0.93)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            borderRadius: '10px',
                            padding: '5px 7px',
                            display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '4px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                          }}
                        >
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ff5f45', flexShrink: 0, marginTop: '2px', display: 'block' }} />
                          <span style={{ color: '#fff', fontSize: '8px', fontWeight: 500, lineHeight: '1.4', wordBreak: 'break-word' }}>{mmNote}</span>
                        </div>
                      </div>
                    )
                  })()}
                  <PhoneUIOverlay isSmall={true} color={activeAccent} />
                </div>
                <PhoneSideButtons isBanner={false} />
              </div>
            </div>
            <div className="text-center relative z-10">
               <p className="font-bold text-[13px]" style={{ color: '#1d1d1f' }}>{styleInfo?.name}</p>
               <p className="text-[10px] font-medium opacity-50" style={{ color: '#1d1d1f' }}>{dateLabel} · {res.label}</p>
            </div>
          </div>

          {/* ── CONTROLS ── */}
          <div className="flex-1 space-y-4 w-full px-6 lg:px-0">

            {/* Style selector */}
            <div className="card-minimal">
              <h2 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: '#86868b' }}>
                Style
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WALLPAPER_STYLES.map((s) => {
                  const active = selectedStyle === s.id
                  return (
                    <button
                      key={s.id}
                      id={`style-${s.id}`}
                      onClick={() => { setSelectedStyle(s.id); setDownloaded(false) }}
                      className={`style-tile text-left ${active ? 'active' : ''}`}
                    >
                      <div
                        className="w-5 h-5 rounded-full mb-3"
                        style={{ background: STYLE_ACCENTS[s.id] }}
                      />
                      <div
                        className="font-medium text-xs leading-snug"
                        style={{ color: '#1d1d1f' }}
                      >
                        {s.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#a1a1a6' }}>
                        {s.tag}
                      </div>
                      {active && (
                        <div
                          className="mt-2 inline-flex items-center justify-center w-4 h-4 rounded-full"
                          style={{ background: '#ff5f45' }}
                        >
                          <svg viewBox="0 0 8 6" className="w-2" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Memento Mori specific controls */}
            {selectedStyle === 'memento-mori' && (
              <div className="card-minimal border-t pt-4" style={{ borderColor: '#e8e8ed' }}>
                <h2 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: '#86868b' }}>
                  Memento Mori Options
                </h2>

                <div className="space-y-5">

                  {/* Grid Density */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Grid Mode</label>
                    <div className="flex gap-2">
                      {[{ v: 'year', label: '52 Weeks', sub: 'This year' }, { v: 'life', label: 'Lifetime', sub: '90yr · 4,680 weeks' }].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setMmDensity(opt.v)}
                          className="flex-1 flex flex-col items-center py-3 px-2 rounded-xl border text-sm transition-all"
                          style={{
                            borderColor: mmDensity === opt.v ? '#ff5f45' : '#e8e8ed',
                            background: mmDensity === opt.v ? 'rgba(255,95,69,0.04)' : '#fff',
                            boxShadow: mmDensity === opt.v ? '0 0 0 3px rgba(255,95,69,0.1)' : 'none',
                          }}
                        >
                          <span className="font-semibold text-[13px]" style={{ color: '#1d1d1f' }}>{opt.label}</span>
                          <span className="text-[11px] mt-0.5" style={{ color: '#a1a1a6' }}>{opt.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Birth Year (only for lifetime mode) */}
                  {mmDensity === 'life' && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Birth Year</label>
                      <input
                        type="number"
                        min="1920"
                        max={new Date().getFullYear() - 1}
                        value={mmBirthYear}
                        onChange={e => setMmBirthYear(e.target.value)}
                        className={INPUT_CLS}
                        style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                        placeholder="e.g. 1995"
                      />
                      <p className="mt-1.5 text-xs" style={{ color: '#a1a1a6' }}>
                        Age {new Date().getFullYear() - mmBirthYear} · {Math.round(((new Date().getFullYear() - mmBirthYear) * 52) / (90 * 52) * 100)}% of life lived
                      </p>
                    </div>
                  )}

                  {/* Dot Shape */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Dot Shape</label>
                    <div className="flex gap-2">
                      {[{ v: 'square', icon: '▪', label: 'Square' }, { v: 'circle', icon: '●', label: 'Circle' }].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setMmShape(opt.v)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all"
                          style={{
                            borderColor: mmShape === opt.v ? '#ff5f45' : '#e8e8ed',
                            background: mmShape === opt.v ? 'rgba(255,95,69,0.04)' : '#fff',
                            boxShadow: mmShape === opt.v ? '0 0 0 3px rgba(255,95,69,0.1)' : 'none',
                            color: '#1d1d1f',
                          }}
                        >
                          <span>{opt.icon}</span> {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Accent Color</label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { color: '#94a3b8', name: 'Slate' },
                        { color: '#f87171', name: 'Red' },
                        { color: '#fbbf24', name: 'Gold' },
                        { color: '#a78bfa', name: 'Purple' },
                        { color: '#34d399', name: 'Emerald' },
                        { color: '#60a5fa', name: 'Blue' },
                        { color: '#f472b6', name: 'Pink' },
                        { color: '#ffffff', name: 'White' },
                      ].map(({ color, name }) => (
                        <button
                          key={color}
                          title={name}
                          onClick={() => setMmColor(color)}
                          className="w-8 h-8 rounded-full transition-all hover:scale-110"
                          style={{
                            background: color,
                            boxShadow: mmColor === color ? `0 0 0 2px #fff, 0 0 0 4px #ff5f45` : '0 0 0 1px rgba(0,0,0,0.1)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Week Note */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Goal Week Note</label>
                    <input
                      type="text"
                      value={mmNote}
                      onChange={e => {
                        const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                        if (words.length <= 20 || e.target.value.length < mmNote.length) setMmNote(e.target.value)
                      }}
                      className={INPUT_CLS}
                      style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                      placeholder="A short note… hover the goal marker to see it"
                    />
                    <p className="mt-1.5 text-xs" style={{ color: mmNote.trim().split(/\s+/).filter(Boolean).length >= 20 ? '#ff5f45' : '#a1a1a6' }}>
                      {mmNote.trim().split(/\s+/).filter(Boolean).length}/20 words · hover goal marker to reveal
                    </p>
                  </div>

                  {/* Custom Quote */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Custom Quote</label>
                    <input
                      type="text"
                      maxLength={40}
                      value={mmQuote}
                      onChange={e => setMmQuote(e.target.value)}
                      className={INPUT_CLS}
                      style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                      placeholder="MEMENTO MORI"
                    />
                    <p className="mt-1.5 text-xs" style={{ color: '#a1a1a6' }}>{mmQuote.length}/40 characters</p>
                  </div>

                </div>
              </div>
            )}

            {/* Date & Resolution */}
            <div className="card-minimal">
              <h2 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: '#86868b' }}>
                Configuration
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Date picker */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#3d3d3f' }}
                  >
                    {selectedStyle === 'memento-mori' ? 'Target Week' : 'Target date'}
                  </label>
                  <input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    min={selectedStyle === 'memento-mori' ? MIN_DATE : new Date().toISOString().split('T')[0]}
                    max={selectedStyle === 'memento-mori' ? MAX_DATE : undefined}
                    onChange={(e) => { setTargetDate(e.target.value); setDownloaded(false) }}
                    {...dateFocus}
                    className={INPUT_CLS}
                    style={{
                      ...INPUT_STYLE,
                      ...(dateFocus.focused ? FOCUSED_STYLE : {}),
                      colorScheme: 'light',
                    }}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: selectedStyle === 'memento-mori' ? '#ff5f45' : '#a1a1a6' }}>
                    {selectedStyle === 'memento-mori'
                      ? (() => {
                          const d = new Date(targetDate)
                          const week = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
                          return `→ marks week ${week} of ${d.getFullYear()}`
                        })()
                      : dateLabel
                    }
                  </p>
                  {selectedStyle === 'memento-mori' && (
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs" style={{ color: '#6e6e73' }}>Mark as achieved — strikes through target week</span>
                      <button
                        onClick={() => setGoalAchieved(v => !v)}
                        className="relative flex-shrink-0 w-9 h-5 rounded-full transition-all duration-200 ml-3"
                        style={{ background: goalAchieved ? '#22c55e' : '#d1d5db' }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                          style={{ left: goalAchieved ? '17px' : '2px' }}
                        />
                      </button>
                    </div>
                  )}
                </div>

                {/* Resolution */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: '#3d3d3f' }}
                  >
                    Phone model
                  </label>
                  <div className="flex flex-col gap-2">
                    {Object.entries(RESOLUTIONS).map(([key, val]) => {
                      const active = resolution === key
                      return (
                        <button
                          key={key}
                          id={`res-${key}`}
                          onClick={() => setResolution(key)}
                          className="flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all duration-200"
                          style={{
                            borderColor: active ? '#ff5f45' : '#e8e8ed',
                            background: active ? 'rgba(255,95,69,0.04)' : '#fff',
                            boxShadow: active ? '0 0 0 3px rgba(255,95,69,0.1)' : 'none',
                          }}
                        >
                          <span className="font-medium" style={{ color: '#1d1d1f' }}>
                            {val.label}
                          </span>
                          <span className="text-xs" style={{ color: '#a1a1a6' }}>
                            {val.sub}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>


            <button
              id="download-btn"
              onClick={handleDownload}
              disabled={generating}
              className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: downloaded ? '#22c55e' : '#ff5f45',
                color: '#fff',
                boxShadow: downloaded
                  ? '0 4px 16px rgba(34,197,94,0.3)'
                  : '0 4px 16px rgba(255,95,69,0.35)',
                opacity: generating ? 0.8 : 1,
                cursor: generating ? 'not-allowed' : 'pointer',
              }}
            >
              {generating ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  />
                  Rendering…
                </>
              ) : downloaded ? (
                '✓ Downloaded successfully!'
              ) : (
                `↓ Download wallpaper — ${res.w}×${res.h}`
              )}
            </button>

            {/* Lock screen steps */}
            <div className="card p-5 border" style={{ borderColor: '#e8e8ed' }}>
              <h3 className="font-medium text-sm mb-3" style={{ color: '#1d1d1f' }}>
                How to set as lock screen
              </h3>
              <ol className="space-y-2 text-sm" style={{ color: '#6e6e73' }}>
                <li className="flex gap-2.5">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: '#ff5f45' }}
                  >1</span>
                  Open <strong className="text-[#1d1d1f]">Settings → Wallpaper</strong>
                </li>
                <li className="flex gap-2.5">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: '#ff5f45' }}
                  >2</span>
                  Tap <strong className="text-[#1d1d1f]">Add New Wallpaper → Photos</strong>
                </li>
                <li className="flex gap-2.5">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: '#ff5f45' }}
                  >3</span>
                  Select the downloaded image and set as <strong className="text-[#1d1d1f]">Lock Screen</strong>
                </li>
              </ol>
            </div>
          </div>

          {/* ── RIGHT: Live phone preview (Desktop only) ───── */}
          <div className="hidden lg:flex flex-col items-center gap-6 sticky top-24 w-[300px] xl:w-[320px]">
            <p className="section-label uppercase tracking-widest text-[10px] opacity-50">Live preview</p>

            <div className="relative">
               {/* Subtle shadow glow behind phone */}
               <div 
                className="absolute inset-0 blur-3xl opacity-15" 
                style={{ background: activeAccent, transform: 'scale(1.3)' }}
              />
              {/* Device frame preview */}
              <div
                className={`phone-mockup animate-float relative z-10 ${
                  resolution === 'android' ? 'is-android' : 'is-iphone'
                }`}
                style={{ width: '280px', height: '572px' }}
              >
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: resolution === 'android' ? '32px' : '36px' }}
                >
                  <canvas
                    ref={desktopPreviewRef}
                    style={{ display: 'block', width: '280px', height: '572px', objectFit: 'cover' }}
                  />
                  {selectedStyle === 'memento-mori' && (() => {
                    const pos = getMementoCurrentWeekPos(PREVIEW_W * 2, PREVIEW_H * 2, mmDensity, mmBirthYear)
                    const scaleX = 280 / (PREVIEW_W * 2)
                    const scaleY = 572 / (PREVIEW_H * 2)
                    return (
                      <div className="mm-pulse-ring" style={{ left: pos.x * scaleX, top: pos.y * scaleY, width: pos.w * scaleX, height: pos.h * scaleY, background: activeAccent + '99' }} />
                    )
                  })()}
                  {selectedStyle === 'memento-mori' && mmNote && (() => {
                    const goalPos = getMementoGoalWeekPos(PREVIEW_W * 2, PREVIEW_H * 2, mmDensity, mmBirthYear, daysLeft)
                    const scaleX = 280 / (PREVIEW_W * 2)
                    const scaleY = 572 / (PREVIEW_H * 2)
                    return (
                      <div
                        className="absolute group"
                        style={{ left: goalPos.x * scaleX, top: goalPos.y * scaleY, width: goalPos.w * scaleX, height: goalPos.h * scaleY, zIndex: 30, cursor: 'pointer' }}
                      >
                        <div
                          className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 6px)',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '200px',
                            background: 'rgba(14,14,16,0.93)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            borderRadius: '14px',
                            padding: '8px 10px',
                            display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: '6px',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                          }}
                        >
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f45', flexShrink: 0, marginTop: '3px', display: 'block' }} />
                          <span style={{ color: '#fff', fontSize: '11px', fontWeight: 500, lineHeight: '1.5', wordBreak: 'break-word' }}>{mmNote}</span>
                        </div>
                      </div>
                    )
                  })()}
                  <PhoneUIOverlay isSmall={false} isBanner={true} color={activeAccent} />
                </div>
              </div>
            </div>

            {/* Info card removed to 'sink' with background */}
            <div className="text-center pt-2">
              <div className="font-bold text-sm" style={{ color: '#1d1d1f' }}>
                {styleInfo?.name}
              </div>
              <div className="text-[11px] mt-1 font-medium" style={{ color: '#86868b' }}>
                {daysLeft > 0
                  ? `${daysLeft} days from today`
                  : 'Date reached!'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-res download canvas */}
      <canvas ref={downloadCanvasRef} className="hidden" aria-hidden="true" />


    </main>
  )
}
