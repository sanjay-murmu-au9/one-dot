import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DRAW_FUNCTIONS, STYLE_ACCENTS } from './WallpaperCanvas'

export const WALLPAPER_STYLES = [
  {
    id: 'dot-grid',
    name: 'Life Grid',
    tag: 'Philosophical',
    animDelay: 0,
  },
  {
    id: 'large-countdown',
    name: 'Large Countdown',
    tag: 'Bold',
    animDelay: 60,
  },
  {
    id: 'progress-bar',
    name: 'Progress View',
    tag: 'Minimal',
    animDelay: 120,
  },
  {
    id: 'minimal-text',
    name: 'Minimal Text',
    tag: 'Clean',
    animDelay: 180,
  },
  {
    id: 'yearly-view',
    name: 'Yearly View',
    tag: 'Calendar',
    animDelay: 0,
  },
  {
    id: 'carpe-diem',
    name: 'Carpe Diem',
    tag: 'Motivational',
    animDelay: 60,
  },
  {
    id: 'memento-mori',
    name: 'Memento Mori',
    tag: 'Stoic',
    animDelay: 120,
  },
  {
    id: 'weekly-grid',
    name: 'Weekly Grid',
    tag: 'Structured',
    animDelay: 180,
  },
]

// Renders the wallpaper preview inline via canvas
function WallpaperThumb({ styleId, width = 200, height = 430, bgImage }) {
  const canvasRef = useRef(null)
  const drawFn = DRAW_FUNCTIONS[styleId]
  const accent = STYLE_ACCENTS[styleId]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !drawFn) return
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    // days left: fixed 128 for demo
    
    if (bgImage) {
      const img = new Image()
      img.src = bgImage
      img.onload = () => {
        drawFn(ctx, width, height, 128, accent, img)
      }
    } else {
      drawFn(ctx, width, height, 128, accent)
    }
  }, [styleId, width, height, drawFn, accent, bgImage])

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        borderRadius: '28px',
      }}
    />
  )
}

export function PhoneUIOverlay({ isSmall = true, isBanner = false, color = "white", randomize = false }) {
  const now = new Date()
  let time, date
  if (randomize) {
    const h = Math.floor(Math.random() * 12) + 1
    const m = Math.floor(Math.random() * 60).toString().padStart(2, '0')
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = Math.floor(Math.random() * 28) + 1
    time = `${h}:${m}`
    date = `${days[Math.floor(Math.random() * 7)]} ${months[Math.floor(Math.random() * 12)]} ${d}`
  } else {
    time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })
    date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  const padding = isBanner ? 'p-6 pb-4' : 'p-[11px] pb-3'
  const timeSize = isBanner ? 'text-[15px]' : 'text-[10px]'
  const actionSize = isBanner ? 'w-11 h-11' : 'w-9.5 h-9.5'
  const footerIconSize = isBanner ? '22' : '19'
  
  // Icon dimensions scaled - balanced for zero overlap
  const sW = isBanner ? 20 : 14
  const sH = isBanner ? 13 : 9

  return (
    <div className={`absolute inset-0 pointer-events-none z-20 flex flex-col justify-between ${padding}`}>
      {/* Top Status Bar - Precise iOS Layout */}
      <div className="flex justify-between items-start mt-[1px]">
        {/* Time - Left side, aligned with island center-ish */}
        {/* Left side: Time & Signal */}
        <div className="flex items-center gap-2 pt-1 pl-1">
          <div className={`${timeSize} font-bold text-white tracking-tight leading-none`}>
            9:41
          </div>
          {/* Signal - High Fidelity */}
          <svg width={sW} height={sH} viewBox="0 0 18 12" fill="white">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="4" y="6" width="3" height="6" rx="1" />
            <rect x="8" y="3" width="3" height="9" rx="1" />
            <rect x="12" y="0" width="3" height="12" rx="1" />
          </svg>
        </div>

        {/* Status Cluster - Right side */}
        <div className="flex items-center gap-1.5 pt-1 pr-1">
          
          {/* WiFi - High Fidelity */}
          <svg width={sW} height={sH} viewBox="0 0 18 12" fill="white">
            <path d="M9 12L0 3.5C2.4 1.3 5.5 0 9 0C12.5 0 15.6 1.3 18 3.5L9 12Z" />
          </svg>
          
          {/* Battery - High Fidelity */}
          <div className={`${isBanner ? 'w-[28px] h-[14px]' : 'w-[22px] h-[11px]'} border-1.5 border-white/40 rounded-[3.5px] relative flex items-center p-[1px]`}>
            <div className="bg-white h-full w-[90%] rounded-[1.5px]" />
            <div className={`absolute ${isBanner ? 'right-[-4.5px] w-[2px] h-[6px]' : 'right-[-3.5px] w-[1.5px] h-[4.5px]'} bg-white/40 rounded-r-full`} />
          </div>
        </div>
      </div>

      <div className={`flex flex-col items-center flex-1 ${isBanner ? 'mt-10' : 'mt-5'}`}>
        <div 
          className={`font-semibold ${isBanner ? 'text-[18px]' : 'text-[10px]'} tracking-[0.05em] mb-[-4px] opacity-80`}
          style={{ color: color === 'white' ? '#fff' : color }}
        >
          {date}
        </div>
        <div 
          className={`font-bold tracking-[-0.01em] ${isBanner ? 'text-[92px]' : 'text-[52px]'} scale-y-110 drop-shadow-md`}
          style={{ 
            color: color === 'white' ? '#fff' : color,
            fontFamily: 'system-ui, -apple-system, sans-serif' 
          }}
        >
          {time}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full justify-between items-center px-4 mb-2">
          {/* Torch Icon - Frosted Glass Circle */}
          <div className={`${actionSize} rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg ring-1 ring-black/10`}>
            <svg width={isBanner ? "24" : "19"} height={isBanner ? "24" : "19"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 14V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8" />
              <path d="M12 14v7" />
              <path d="M9 21h6" />
              <circle cx="12" cy="9" r="1.5" fill="white" stroke="none" />
            </svg>
          </div>
          {/* Camera Icon - Frosted Glass Circle */}
          <div className={`${actionSize} rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-lg ring-1 ring-black/10`}>
            <svg width={isBanner ? "24" : "19"} height={isBanner ? "24" : "19"} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
        {/* Home Indicator */}
        <div className={`${isBanner ? 'w-24 h-[5px]' : 'w-12 h-1'} bg-white/30 rounded-full mb-1`} />
      </div>
    </div>
  )
}

export function PhoneSideButtons({ isBanner = false }) {
  // Studio-Grade Natural Titanium (Matches reference)
  const btnBg = 'linear-gradient(to bottom, #f2f2f7 0%, #d1d1d6 50%, #8e8e93 100%)' 
  const shadow = '0 0.5px 1px rgba(0,0,0,0.5)'
  
  // High-precision protrusion: enough to be seen, not too wide to look fake
  const w = isBanner ? '3px' : '2.5px'
  const offset = isBanner ? '-3px' : '-2.5px'
  
  return (
    <>
      {/* Power Button (Right) */}
      <div className="absolute top-[22.5%] rounded-l-[1px] z-30"
        style={{ 
          right: offset, 
          width: w, 
          height: isBanner ? '58px' : '32px', 
          background: btnBg, 
          boxShadow: shadow,
          border: '0.3px solid rgba(0,0,0,0.2)',
          borderRight: 'none'
        }} />
      
      {/* Silent / Action Button (Left) */}
      <div className="absolute top-[16.5%] rounded-r-[0.5px] z-30"
        style={{ 
          left: offset, 
          width: w, 
          height: isBanner ? '22px' : '12px', 
          background: btnBg, 
          boxShadow: shadow,
          border: '0.3px solid rgba(0,0,0,0.2)',
          borderLeft: 'none'
        }} />
      
      {/* Volume Up (Left) */}
      <div className="absolute top-[24.2%] rounded-r-[1px] z-30"
        style={{ 
          left: offset, 
          width: w, 
          height: isBanner ? '48px' : '28px', 
          background: btnBg, 
          boxShadow: shadow,
          border: '0.3px solid rgba(0,0,0,0.2)',
          borderLeft: 'none'
        }} />
      
      {/* Volume Down (Left) */}
      <div className="absolute top-[35.2%] rounded-r-[1px] z-30"
        style={{ 
          left: offset, 
          width: w, 
          height: isBanner ? '48px' : '28px', 
          background: btnBg, 
          boxShadow: shadow,
          border: '0.3px solid rgba(0,0,0,0.2)',
          borderLeft: 'none'
        }} />
    </>
  )
}

export default function PhoneCard({ style, floatClass = 'animate-float' }) {
  const navigate = useNavigate()
  const bgImage = style.bgImage

  return (
    <div
      id={`phone-${style.id}`}
      className="phone-group flex flex-col items-center gap-5 cursor-pointer"
      onClick={() => {
        const path = `/generate/${style.id}${bgImage ? `?bg=${encodeURIComponent(bgImage)}` : ''}`
        navigate(path)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          const path = `/generate/${style.id}${bgImage ? `?bg=${encodeURIComponent(bgImage)}` : ''}`
          navigate(path)
        }
      }}
      style={{ transitionDelay: `${style.animDelay}ms` }}
    >
      {/* Phone frame */}
      <div
        className={`phone-mockup is-iphone ${floatClass}`}
        style={{
          width: '180px',
          height: '370px',
        }}
      >
        {/* Wallpaper fill */}
        <div
          className="absolute inset-0"
          style={{ borderRadius: '28px', overflow: 'hidden' }}
        >
          <WallpaperThumb styleId={style.id} width={360} height={740} bgImage={bgImage} />
          {/* Real mobile UI elements - Synced with style colors and unique times */}
          <PhoneUIOverlay 
            isSmall={true} 
            color={STYLE_ACCENTS[style.id] || "white"}
            randomize={true}
          />
        </div>

        {/* Physical Hardware Buttons */}
        <PhoneSideButtons isBanner={false} />

        {/* Hover overlay */}
        <div className="phone-try-overlay">
          <span
            className="px-4 py-2 rounded-full text-xs font-semibold text-[#1d1d1f]"
            style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)' }}
          >
            Customize →
          </span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center">
        <div
          className="font-medium text-sm leading-tight"
          style={{ color: '#1d1d1f' }}
        >
          {style.name}
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: '#a1a1a6' }}
        >
          {style.tag}
        </div>
      </div>
    </div>
  )
}
