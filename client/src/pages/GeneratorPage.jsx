import { useRef, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import LoginModal from '../components/LoginModal'
import LifeSummaryModal from '../components/LifeSummaryModal'
import { RESOLUTIONS, DRAW_FUNCTIONS, STYLE_ACCENTS, getDaysLeft, getMementoCurrentWeekPos, getMementoGoalWeekPos, drawTimerOverlay, loadHourglassImage } from '../components/WallpaperCanvas'
import { WALLPAPER_STYLES, PhoneUIOverlay, PhoneSideButtons } from '../components/PhoneCard'
import { useAuth } from '../contexts/AuthContext'
import { useAutoWallpaperUpdate } from '../hooks/useAutoWallpaperUpdate'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

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

  const [selectedStyle, setSelectedStyle] = useState(routeStyle || 'memento-mori')
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [targetDate, setTargetDate]       = useState(DEFAULT_DATE)
  // Auto-detect: use 'android' when running in Capacitor on Android, else default to 'android'
  const [resolution, setResolution]       = useState(
    window.Capacitor?.getPlatform?.() === 'ios' ? 'iphone' : 'android'
  )
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

  const { currentUser } = useAuth()
  const [showLifeSummary, setShowLifeSummary] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState(null) // 'success' | 'error' | null

  // Auto-update (native WorkManager)
  const autoUpdate = useAutoWallpaperUpdate()
  const [autoUpdateToggling, setAutoUpdateToggling] = useState(false)
  const [testingNow, setTestingNow] = useState(false)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  // Extract background from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const bg = params.get('bg')
    if (bg) setBackgroundImage(bg)
  }, [location.search])

  // Check onboarding status: redirect if not done, sync to Firestore if only in localStorage
  useEffect(() => {
    async function checkOnboarding() {
      const localDOB = localStorage.getItem('one_dot_dob')
      const localName = localStorage.getItem('one_dot_name')

      if (!currentUser) {
        setCheckingOnboarding(false)
        return
      }

      // Check Firestore for onboarding data
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
        const data = userDoc.exists() ? userDoc.data() : {}

        if (data.onboardingCompleted && data.dob) {
          // Onboarding already in Firestore — also cache locally
          if (!localDOB) {
            localStorage.setItem('one_dot_dob', data.dob)
            if (data.name) localStorage.setItem('one_dot_name', data.name)
          }
          // Pre-fill birth year
          const birthYear = parseInt(data.dob.split('-')[0])
          if (birthYear && !isNaN(birthYear) && birthYear >= 1900) {
            setMmBirthYear(birthYear)
            setMmDensity('life')
          }
          setCheckingOnboarding(false)
          return
        }

        // Onboarding not in Firestore — check localStorage
        if (localDOB && localName) {
          // Sync localStorage data to Firestore
          await setDoc(doc(db, 'users', currentUser.uid), {
            name: localName,
            dob: localDOB,
            birthYear: parseInt(localDOB.split('-')[0]),
            onboardingCompleted: true,
            updatedAt: new Date().toISOString(),
          }, { merge: true })
          const birthYear = parseInt(localDOB.split('-')[0])
          if (birthYear && !isNaN(birthYear) && birthYear >= 1900) {
            setMmBirthYear(birthYear)
            setMmDensity('life')
          }
          setCheckingOnboarding(false)
          return
        }

        // No onboarding data anywhere — redirect to onboarding
        setCheckingOnboarding(false)
        navigate('/onboarding', { replace: true })
      } catch (err) {
        console.error('Error checking onboarding:', err)
        setCheckingOnboarding(false)
      }
    }

    checkOnboarding()
  }, [currentUser, navigate])

  // Pre-fill birth year from localStorage (fallback if above didn't run)
  useEffect(() => {
    const cachedDOB = localStorage.getItem('one_dot_dob')
    if (cachedDOB) {
      const birthYear = parseInt(cachedDOB.split('-')[0])
      if (birthYear && !isNaN(birthYear) && birthYear >= 1900) {
        setMmBirthYear(birthYear)
        setMmDensity('life')
      }
    }
  }, [])

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

      // Load hourglass image first
      loadHourglassImage()
        .then(hourglassImg => {
          const drawWithOverlay = (bgImg = null) => {
            drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, bgImg, opts)
            // Draw timer overlay with hourglass and progress bar
            const overlayColor = (selectedStyle === 'memento-mori' || selectedStyle === 'dot-grid') ? activeAccent : '#ffffff'
            drawTimerOverlay(ctx, canvas.width, canvas.height, overlayColor, hourglassImg, selectedStyle, mmDensity)
          }

          if (backgroundImage) {
            const img = new Image()
            img.src = backgroundImage
            img.onload = () => drawWithOverlay(img)
            img.onerror = () => drawWithOverlay(null)
          } else {
            drawWithOverlay(null)
          }
        })
        .catch(err => {
          // Fallback: draw without hourglass if loading fails
          console.error('Hourglass load error:', err)
          const drawWithOverlay = (bgImg = null) => {
            drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, bgImg, opts)
            const overlayColor = (selectedStyle === 'memento-mori' || selectedStyle === 'dot-grid') ? activeAccent : '#ffffff'
            drawTimerOverlay(ctx, canvas.width, canvas.height, overlayColor, null, selectedStyle, mmDensity)
          }
          if (backgroundImage) {
            const img = new Image()
            img.src = backgroundImage
            img.onload = () => drawWithOverlay(img)
            img.onerror = () => drawWithOverlay(null)
          } else {
            drawWithOverlay(null)
          }
        })
    })
  }, [drawFn, daysLeft, activeAccent, backgroundImage, selectedStyle, mmQuote, mmShape, mmDensity, mmBirthYear, goalAchieved])

  useEffect(() => { renderPreview() }, [renderPreview])

  // Force render after onboarding check completes to fix initial blank canvas
  useEffect(() => {
    if (!checkingOnboarding) {
      const timer = setTimeout(() => {
        renderPreview()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [checkingOnboarding, renderPreview])

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

      // Load hourglass image for download
      loadHourglassImage().then(hourglassImg => {
        const drawWithOverlay = (bgImg = null) => {
          drawFn(ctx, canvas.width, canvas.height, daysLeft, activeAccent, bgImg, opts)
          // Draw timer overlay with hourglass and progress bar
          const overlayColor = (selectedStyle === 'memento-mori' || selectedStyle === 'dot-grid') ? activeAccent : '#ffffff'
          drawTimerOverlay(ctx, canvas.width, canvas.height, overlayColor, hourglassImg, selectedStyle, mmDensity)
          triggerDownload(canvas)
        }

        if (backgroundImage) {
          const img = new Image()
          img.src = backgroundImage
          img.onload = () => drawWithOverlay(img)
        } else {
          drawWithOverlay(null)
        }
      })
    }, 500)
  }

  const handleSyncToCloud = async () => {
    if (!currentUser) return alert('Please log in to sync your wallpaper.')
    setSyncing(true)
    setSyncStatus(null)

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        active_wallpaper_config: {
          style: selectedStyle,
          targetDate,
          resolution,
          memento_options: {
            birthYear: mmBirthYear,
            density: mmDensity,
            accent: activeAccent,
            quote: mmQuote,
          },
          backgroundImage: backgroundImage || null,
        },
        updatedAt: new Date().toISOString()
      }, { merge: true })
      
      setSyncStatus('success')
      setTimeout(() => setSyncStatus(null), 4000)
    } catch (err) {
      console.error('Sync error:', err)
      setSyncStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  const styleInfo  = WALLPAPER_STYLES.find(s => s.id === selectedStyle)
  const dateLabel  = daysLeft > 0 ? `${daysLeft} days from today` : daysLeft === 0 ? 'Today!' : `${Math.abs(daysLeft)} days ago`
  const dateFocus  = useFocus()

  // Auth guard — show login modal if not authenticated
  if (!currentUser) {
    return (
      <main className="min-h-screen pt-24 pb-20">
        <LoginModal onClose={() => navigate('/')} />
      </main>
    )
  }

  // Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <span className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
      </main>
    )
  }

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
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <p className="text-base" style={{ color: '#6e6e73' }}>
              Customize below, watch the preview update live, then download.
            </p>
            {localStorage.getItem('one_dot_dob') && (
              <button
                onClick={() => setShowLifeSummary(true)}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-80"
                style={{ color: '#ff5f45' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                See your life story →
              </button>
            )}
          </div>
        </div>

        {/* Life Summary Modal */}
        {showLifeSummary && (
          <LifeSummaryModal onClose={() => setShowLifeSummary(false)} />
        )}

        {/* Split layout: Preview on top for mobile, right for desktop */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 items-start">

          {/* ── MOBILE PREVIEW (Top) ─────────────────────── */}
          <div className="lg:hidden w-full flex flex-col items-center gap-1 py-4 px-6">
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
                  <div key={`density-${mmDensity}`}>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Grid Mode</label>
                    <div className="flex gap-2">
                      {[{ v: 'year', label: '52 Weeks', sub: 'This year' }, { v: 'life', label: 'Lifetime', sub: '90yr · 4,680 weeks' }].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setMmDensity(opt.v)}
                          className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl border text-sm transition-all ${mmDensity === opt.v ? 'selected' : ''}`}
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

                  {/* Legend — lifetime mode only */}
                  {mmDensity === 'life' && (
                    <div className="flex items-center gap-5 px-1 py-1">
                      {[
                        { label: 'Past',    bg: mmColor,   ring: null,                shadow: null },
                        { label: 'Present', bg: '#ffffff', ring: `2px solid ${mmColor}`, shadow: `0 0 0 3px ${mmColor}30` },
                        { label: 'Future',  bg: '#e8e8ed', ring: '1px solid #d1d1d6', shadow: null },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          <div
                            style={{
                              width: 11,
                              height: 11,
                              borderRadius: mmShape === 'circle' ? '50%' : 3,
                              background: item.bg,
                              border: item.ring || 'none',
                              boxShadow: item.shadow || 'none',
                              flexShrink: 0,
                            }}
                          />
                          <span className="text-xs font-medium" style={{ color: '#86868b' }}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

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
                  <div key={`shape-${mmShape}`}>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Dot Shape</label>
                    <div className="flex gap-2">
                      {[{ v: 'square', icon: '▪', label: 'Square' }, { v: 'circle', icon: '●', label: 'Circle' }].map(opt => (
                        <button
                          key={opt.v}
                          onClick={() => setMmShape(opt.v)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${mmShape === opt.v ? 'selected' : ''}`}
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
                    <label className="block text-sm font-medium mb-2" style={{ color: '#3d3d3f' }}>Goal Week Note (Optional)</label>
                    <input
                      type="text"
                      value={mmNote}
                      onChange={e => {
                        const words = e.target.value.trim().split(/\s+/).filter(Boolean)
                        if (words.length <= 20 || e.target.value.length < mmNote.length) setMmNote(e.target.value)
                      }}
                      className={INPUT_CLS}
                      style={{ ...INPUT_STYLE, colorScheme: 'light' }}
                      placeholder="e.g., 'Graduate college' or 'Start business'"
                    />
                    <p className="mt-1.5 text-xs" style={{ color: mmNote.trim().split(/\s+/).filter(Boolean).length >= 20 ? '#ff5f45' : '#a1a1a6' }}>
                      {mmNote.trim()
                        ? `${mmNote.trim().split(/\s+/).filter(Boolean).length}/20 words · hover goal marker to reveal`
                        : 'Add a note to place a goal marker on a future week'}
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

            {/* Resolution */}
            <div className="card-minimal">
              <h2 className="font-bold text-[13px] uppercase tracking-wider mb-4" style={{ color: '#86868b' }}>
                Configuration
              </h2>

              <div className={`grid gap-6 ${selectedStyle === 'memento-mori' && mmNote.trim() ? 'sm:grid-cols-2' : 'sm:grid-cols-1'}`}>
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

                {/* Date picker - only for memento-mori when goal note is entered */}
                {selectedStyle === 'memento-mori' && mmNote.trim() && (
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: '#3d3d3f' }}
                    >
                      Goal Week Date
                    </label>
                    <input
                      id="target-date"
                      type="date"
                      value={targetDate}
                      min={MIN_DATE}
                      max={MAX_DATE}
                      onChange={(e) => { setTargetDate(e.target.value); setDownloaded(false) }}
                      {...dateFocus}
                      className={INPUT_CLS}
                      style={{
                        ...INPUT_STYLE,
                        ...(dateFocus.focused ? FOCUSED_STYLE : {}),
                        colorScheme: 'light',
                      }}
                    />
                    <p className="mt-1.5 text-xs" style={{ color: '#ff5f45' }}>
                      {(() => {
                        const d = new Date(targetDate)
                        const week = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000))
                        return `→ places goal marker on week ${week} of ${d.getFullYear()}`
                      })()}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs" style={{ color: '#6e6e73' }}>Mark as achieved — strikes through goal week</span>
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
                  </div>
                )}
              </div>
            </div>


            {/* ── APP INSTALL PROMOTION ── */}
            {currentUser && (
              <div className="space-y-4">
                {autoUpdate.isNative ? (
                  /* Mobile App: Show Sync Button */
                  <>
                    <button
                      onClick={handleSyncToCloud}
                      disabled={syncing}
                      className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2"
                      style={{
                        background: syncStatus === 'success' ? '#22c55e' : '#1d1d1f',
                        color: '#fff',
                        boxShadow: syncStatus === 'success'
                          ? '0 4px 16px rgba(34,197,94,0.3)'
                          : '0 4px 16px rgba(29,29,31,0.25)',
                        opacity: syncing ? 0.8 : 1,
                      }}
                    >
                      {syncing ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Syncing…
                        </>
                      ) : syncStatus === 'success' ? (
                        '✓ Synced to Device'
                      ) : (
                        '↑ Sync to Device'
                      )}
                    </button>

                    <div className="card p-5 border" style={{ borderColor: '#e8e8ed' }}>
                      <p className="text-sm mb-4" style={{ color: '#6e6e73' }}>
                        Syncing pushes your wallpaper config to the cloud so your phone can auto-update with the latest date, grid progress, and time.
                      </p>
                    </div>
                  </>
                ) : (
                  /* Web: Prominent App Install Promotion */
                  <>
                    <div className="card p-6 border-2" style={{ borderColor: '#ff5f45', background: 'linear-gradient(135deg, rgba(255,95,69,0.08) 0%, rgba(255,95,69,0.03) 100%)' }}>
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold mb-2" style={{ color: '#1d1d1f' }}>
                          ✨ Get Your Live Wallpaper
                        </h3>
                        <p className="text-sm" style={{ color: '#6e6e73' }}>
                          Auto-updates daily with progress tracking, time, and more
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <a
                          href="https://play.google.com/store/apps/details?id=com.onedot.app"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                          style={{
                            background: '#1d1d1f',
                            color: '#fff',
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(29,29,31,0.25)',
                          }}
                        >
                          <span>📱</span> Play Store
                        </a>
                        <a
                          href="https://apps.apple.com/app/onedot/id123456789"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all hover:scale-105"
                          style={{
                            background: '#1d1d1f',
                            color: '#fff',
                            textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(29,29,31,0.25)',
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                          </svg>
                          App Store
                        </a>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center text-xs" style={{ color: '#6e6e73' }}>
                        <div>
                          <div className="font-bold text-base mb-1" style={{ color: '#ff5f45' }}>⏰</div>
                          <div>Live Clock</div>
                        </div>
                        <div>
                          <div className="font-bold text-base mb-1" style={{ color: '#ff5f45' }}>📊</div>
                          <div>Progress Sync</div>
                        </div>
                        <div>
                          <div className="font-bold text-base mb-1" style={{ color: '#ff5f45' }}>🔄</div>
                          <div>Daily Updates</div>
                        </div>
                      </div>
                    </div>

                    <div className="card p-4 border" style={{ borderColor: '#e8e8ed', background: '#fafafa' }}>
                      <p className="text-xs text-center" style={{ color: '#86868b' }}>
                        💡 <strong>Tip:</strong> Download button below is for preview only - wallpaper won't auto-update
                      </p>
                    </div>
                  </>
                )}

                {/* Only show Auto-Update and Shortcut URL for Mobile App */}
                {autoUpdate.isNative && (
                  <div className="card p-5 border" style={{ borderColor: '#e8e8ed' }}>
                    {/* Android Auto-Update */}
                    <div className="py-3" style={{ borderColor: '#e8e8ed' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#1d1d1f' }}>Automatic Updates</p>
                          <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>
                            {autoUpdate.isEnabled
                              ? 'Refreshes every few hours'
                              : 'Keep wallpaper fresh automatically'}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            setAutoUpdateToggling(true)
                            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/wallpaper/u/${currentUser.uid}/daily.png`
                            const result = autoUpdate.isEnabled
                              ? await autoUpdate.disableAutoUpdate()
                              : await autoUpdate.enableAutoUpdate(apiUrl)
                            if (result.success) {
                              alert(result.message)
                            } else {
                              alert('Error: ' + result.error)
                            }
                            setAutoUpdateToggling(false)
                          }}
                          disabled={autoUpdateToggling || autoUpdate.loading}
                          className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200"
                          style={{
                            background: autoUpdate.isEnabled ? '#22c55e' : '#d1d5db',
                            opacity: (autoUpdateToggling || autoUpdate.loading) ? 0.6 : 1
                          }}
                        >
                          <span
                            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                            style={{ left: autoUpdate.isEnabled ? '22px' : '2px' }}
                          />
                        </button>
                      </div>
                      {autoUpdate.isEnabled && (
                        <button
                          onClick={async () => {
                            setTestingNow(true)
                            const result = await autoUpdate.triggerNow()
                            setTestingNow(false)
                            alert(result.message || result.error)
                          }}
                          disabled={testingNow}
                          className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold border transition-all"
                          style={{
                            borderColor: '#e8e8ed',
                            color: testingNow ? '#86868b' : '#1d1d1f',
                            background: testingNow ? '#f5f5f7' : '#fff',
                          }}
                        >
                          {testingNow ? '⏳ Refreshing wallpaper…' : '🔄 Test Refresh Now'}
                        </button>
                      )}
                    </div>

                    {/* Shortcut URL (collapsed) */}
                  <div className="pt-3 border-t" style={{ borderColor: '#e8e8ed' }}>
                    <p className="text-xs font-medium mb-2" style={{ color: '#86868b' }}>Shortcut URL</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={`${import.meta.env.VITE_API_BASE_URL}/api/wallpaper/u/${currentUser.uid}/daily.png`}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[11px] font-mono text-gray-500 outline-none"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${import.meta.env.VITE_API_BASE_URL}/api/wallpaper/u/${currentUser.uid}/daily.png`)
                          alert('URL copied!')
                        }}
                        className="px-3 py-2 bg-black text-white rounded-lg text-[11px] font-bold hover:bg-gray-800 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

            {/* ── DOWNLOAD WALLPAPER (For Everyone) ── */}
            <div className="border-t pt-6 mt-6" style={{ borderColor: '#e8e8ed' }}>
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
              <div className="card p-5 border mt-4" style={{ borderColor: '#e8e8ed' }}>
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
