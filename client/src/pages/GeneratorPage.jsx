import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { RESOLUTIONS, DRAW_FUNCTIONS, STYLE_ACCENTS, getDaysLeft } from '../components/WallpaperCanvas'
import { WALLPAPER_STYLES, PhoneUIOverlay, PhoneSideButtons } from '../components/PhoneCard'

const DEFAULT_DATE = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().split('T')[0]
})()

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

  // Extract background from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const bg = params.get('bg')
    if (bg) setBackgroundImage(bg)
  }, [location.search])

  const mobilePreviewRef  = useRef(null)
  const desktopPreviewRef = useRef(null)
  const downloadCanvasRef = useRef(null)

  const drawFn   = DRAW_FUNCTIONS[selectedStyle]
  const accent   = STYLE_ACCENTS[selectedStyle]
  const res      = RESOLUTIONS[resolution]
  const daysLeft = getDaysLeft(targetDate)

  const PREVIEW_W = 176
  const PREVIEW_H = 360

  // Render preview canvas
  const renderPreview = useCallback(() => {
    [mobilePreviewRef, desktopPreviewRef].forEach(ref => {
      const canvas = ref.current
      if (!canvas || !drawFn) return
      canvas.width  = PREVIEW_W * 2
      canvas.height = PREVIEW_H * 2
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      if (backgroundImage) {
        const img = new Image()
        img.src = backgroundImage
        img.onload = () => {
          drawFn(ctx, canvas.width, canvas.height, daysLeft, accent, img)
        }
      } else {
        drawFn(ctx, canvas.width, canvas.height, daysLeft, accent)
      }
    })
  }, [drawFn, daysLeft, accent, PREVIEW_W, PREVIEW_H, backgroundImage])

  useEffect(() => { renderPreview() }, [renderPreview])

  // Update document title for SEO
  useEffect(() => {
    const styleInfo = WALLPAPER_STYLES.find(s => s.id === selectedStyle);
    if (styleInfo) {
      document.title = `Customize ${styleInfo.name} — one dot`;
    }
  }, [selectedStyle]);

  const handleDownload = () => {
    setGenerating(true)
    
    const triggerDesktopDownload = (canvas) => {
      const url = canvas.toDataURL('image/png')
      const a   = document.createElement('a')
      a.href     = url
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
      
      if (backgroundImage) {
        const img = new Image()
        img.src = backgroundImage
        img.onload = () => {
          drawFn(ctx, res.w, res.h, daysLeft, accent, img)
          triggerDesktopDownload(canvas)
        }
      } else {
        drawFn(ctx, res.w, res.h, daysLeft, accent)
        triggerDesktopDownload(canvas)
      }
    }, 500)
  }

  const styleInfo = WALLPAPER_STYLES.find(s => s.id === selectedStyle)

  const dateLabel = (() => {
    if (daysLeft > 0) return `${daysLeft} days from today`
    if (daysLeft === 0) return 'Today!'
    return `${Math.abs(daysLeft)} days ago`
  })()

  const dateFocus = useFocus()

  return (
    <main className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm" style={{ color: '#a1a1a6' }}>
          <Link to="/" className="hover:text-[#1d1d1f] transition-colors">Home</Link>
          <span>/</span>
          <span style={{ color: '#1d1d1f' }}>Create Wallpaper</span>
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
                style={{ background: accent, transform: 'scale(1.5)' }}
              />
              <div
                className={`phone-mockup relative z-10 ${
                  resolution === 'android' ? 'is-android' : 'is-iphone'
                }`}
                style={{ width: '130px', height: '266px' }}
              >
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ borderRadius: resolution === 'android' ? '24px' : '28px' }}
                >
                  <canvas
                    ref={mobilePreviewRef}
                    style={{
                      display: 'block',
                      width: '130px',
                      height: '266px',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Real mobile UI elements - Color Synced */}
                  <PhoneUIOverlay isSmall={true} color={accent} />
                </div>
                {/* Physical Hardware Buttons */}
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
                    Target date
                  </label>
                  <input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => { setTargetDate(e.target.value); setDownloaded(false) }}
                    {...dateFocus}
                    className={INPUT_CLS}
                    style={{
                      ...INPUT_STYLE,
                      ...(dateFocus.focused ? FOCUSED_STYLE : {}),
                      colorScheme: 'light',
                    }}
                  />
                  <p className="mt-1.5 text-xs" style={{ color: '#a1a1a6' }}>
                    {dateLabel}
                  </p>
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

            {/* Download button */}
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
                style={{ background: accent, transform: 'scale(1.3)' }}
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
                    style={{
                      display: 'block',
                      width: '280px',
                      height: '572px',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Real mobile UI elements - Color Synced */}
                  <PhoneUIOverlay isSmall={false} isBanner={true} color={accent} />
                </div>
                {/* Physical Hardware Buttons */}
                <PhoneSideButtons isBanner={true} />
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
