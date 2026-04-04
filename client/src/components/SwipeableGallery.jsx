import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { STYLE_ACCENTS } from './WallpaperCanvas'
import { WALLPAPER_STYLES, PhoneUIOverlay, PhoneSideButtons } from './PhoneCard'
import PhoneCard from './PhoneCard'

function SwipeableGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [fullscreen, setFullscreen] = useState(null) // style object or null
  const touchStartX = useRef(0)
  const navigate = useNavigate()
  const total = WALLPAPER_STYLES.length

  // Touch handlers
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
    setIsDragging(true)
  }

  const onTouchMove = (e) => {
    if (!isDragging) return
    setDragX(e.touches[0].clientX - touchStartX.current)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    if (dragX < -60) {
      setActiveIndex((prev) => (prev + 1) % total)
    } else if (dragX > 60) {
      setActiveIndex((prev) => (prev - 1 + total) % total)
    }
    setDragX(0)
  }

  const goTo = (index) => setActiveIndex((index + total) % total)

  return (
    <div className="relative w-full flex flex-col items-center select-none">

      {/* Card Stack */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: '480px', width: '100%' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {WALLPAPER_STYLES.map((style, i) => {
          const offset = i - activeIndex
          // Only render visible cards (-2 to +2)
          if (Math.abs(offset) > 2) return null

          const isActive = offset === 0
          const scale = isActive ? 1 : offset === 1 || offset === -1 ? 0.88 : 0.76
          const translateX = isActive
            ? dragX
            : offset === 1
            ? 110 + dragX * 0.1
            : offset === -1
            ? -110 + dragX * 0.1
            : offset === 2
            ? 200
            : -200
          const zIndex = isActive ? 30 : Math.abs(offset) === 1 ? 20 : 10
          const opacity = Math.abs(offset) > 1 ? 0.5 : 1

          return (
            <div
              key={style.id}
              onClick={() => {
                if (isActive) setFullscreen(style)
                else goTo(i)
              }}
              style={{
                position: 'absolute',
                transform: `translateX(${translateX}px) scale(${scale})`,
                zIndex,
                opacity,
                transition: isDragging && isActive ? 'none' : 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
                cursor: isActive ? 'pointer' : 'pointer',
              }}
            >
              {/* Phone mockup */}
              <div
                className="phone-mockup is-android"
                style={{ width: '180px', height: '370px', position: 'relative' }}
              >
                <div className="absolute inset-0" style={{ borderRadius: '32px', overflow: 'hidden' }}>
                  <PhoneCard style={style} floatClass="" />
                </div>
              </div>

              {/* Label — only under active card */}
              {isActive && (
                <div className="text-center mt-4">
                  <p className="font-semibold text-sm" style={{ color: '#1d1d1f' }}>{style.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#86868b' }}>{style.tag}</p>
                  <p className="text-[10px] mt-2 font-medium" style={{ color: '#ff5f45' }}>Tap to preview</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-2">
        {WALLPAPER_STYLES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === activeIndex ? '20px' : '6px',
              height: '6px',
              borderRadius: '99px',
              background: i === activeIndex ? '#ff5f45' : '#d1d1d6',
              transition: 'all 0.3s ease',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Counter */}
      <p className="text-xs mt-3 font-medium" style={{ color: '#86868b' }}>
        {activeIndex + 1} / {total}
      </p>

      {/* Fullscreen Modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
        >
          {/* Close */}
          <button
            onClick={() => setFullscreen(null)}
            className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Style name */}
          <div className="text-center mb-6">
            <p className="text-white font-semibold text-lg">{fullscreen.name}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{fullscreen.tag}</p>
          </div>

          {/* Large phone preview */}
          <div className="phone-mockup is-android" style={{ width: '220px', height: '450px', position: 'relative' }}>
            <div className="absolute inset-0" style={{ borderRadius: '32px', overflow: 'hidden' }}>
              <PhoneCard style={fullscreen} floatClass="" />
            </div>
            <PhoneSideButtons isBanner={false} isAndroid={true} />
          </div>

          {/* CTA */}
          <button
            onClick={() => {
              setFullscreen(null)
              navigate(`/generate/${fullscreen.id}`)
            }}
            className="mt-8 px-8 py-4 rounded-2xl font-semibold text-base"
            style={{
              background: '#ff5f45',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(255,95,69,0.4)',
            }}
          >
            Customize & Create →
          </button>

          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Free · No sign-up required
          </p>
        </div>
      )}
    </div>
  )
}

export default SwipeableGallery
