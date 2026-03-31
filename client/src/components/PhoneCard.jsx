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
    id: 'quarterly-view',
    name: 'Quarterly View',
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
  {
    id: 'life-view',
    name: 'Life in Weeks',
    tag: 'Lifetime',
    animDelay: 240,
  },
  {
    id: 'special-dates',
    name: 'Special Dates',
    tag: 'Highlights',
    animDelay: 300,
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

export function PhoneUIOverlay({ isSmall = true, isBanner = false, color = "white", randomize = false, showClock = true, isAndroid = false }) {
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
    time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s?[AP]M/i, '')
    date = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }
  const padding = isBanner ? 'pt-[11px] pb-4 px-10' : 'pt-[8px] pb-3 px-6'
  const statusBarMt = isAndroid 
    ? (isBanner ? 'mt-[2px]' : 'mt-[-4px]') 
    : (isBanner ? 'mt-[6px]' : 'mt-[1px]')
  const timeSize = isBanner ? 'text-[11px]' : 'text-[9px]'
  const actionSize = isBanner ? 'w-11 h-11' : 'w-9.5 h-9.5'
  const footerIconSize = isBanner ? '22' : '19'

  // Icon dimensions — small enough that [time+signal] never reaches the pill
  const sW = isBanner ? 13 : 11
  const sH = isBanner ? 8 : 7

  return (
    <div className={`absolute inset-0 pointer-events-none z-40 flex flex-col justify-between ${padding}`}>
      {/* Top Status Bar - Adaptive Layout */}
      <div className={`flex justify-between items-start ${statusBarMt} ${isBanner ? 'px-3' : 'px-[3px]'}`}>
        {/* Left: Time + Signal */}
        <div className={`flex items-center gap-[3px] pt-1 ${isAndroid ? (isBanner ? 'pl-8' : 'pl-6') : 'pl-0'}`}>
          <div className={`${timeSize} font-bold tracking-tight leading-none min-w-[24px] text-center`} style={{ color }}>
            {time}
          </div>
          {/* Signal bars */}
          <div className="opacity-90 mt-[1px]">
            <svg width={isBanner ? 13 : 10} height={sH} viewBox="0 0 18 12" fill={color}>
              <rect x="0" y={isBanner ? 7 : 8} width="3" height={isBanner ? 5 : 4} rx="1" />
              <rect x="4" y={isBanner ? 5 : 6} width="3" height={isBanner ? 7 : 6} rx="1" />
              <rect x="8" y={isBanner ? 2 : 3} width="3" height={isBanner ? 10 : 9} rx="1" />
              <rect x="12" y="0" width="3" height="12" rx="1" />
            </svg>
          </div>
        </div>

        {/* Right side: WiFi + Battery */}
        <div className={`flex items-center gap-[3px] pt-1 pr-0`}>
          {/* WiFi - High Fidelity */}
          <svg width={isBanner ? 13 : 10} height={sH} viewBox="0 0 18 12" fill={color} className="opacity-95">
            <path d="M9 12L0 3.5C2.4 1.3 5.5 0 9 0C12.5 0 15.6 1.3 18 3.5L9 12Z" />
          </svg>
          
          {/* Battery - High Fidelity */}
          <div className={`${isBanner ? 'w-[32px] h-[16px]' : 'w-[20px] h-[10px]'} border-[1.5px] rounded-[4px] relative flex items-center p-[1px]`} style={{ borderColor: `${color}66` }}>
            <div className="h-full w-[85%] rounded-[1.5px]" style={{ backgroundColor: color }} />
            <div className={`absolute ${isBanner ? 'right-[-5px] w-[2.5px] h-[7px]' : 'right-[-3px] w-[1.5px] h-[4px]'} rounded-r-[2px]`} style={{ backgroundColor: `${color}66` }} />
          </div>
        </div>
      </div>

      {/* Middle: Clock Layer */}
      <div className={`flex flex-col items-center flex-1 ${isBanner ? 'mt-10' : 'mt-5'}`}>
        {showClock && (
          <>
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
          </>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full justify-between items-center px-4 mb-2">
          {/* Torch Icon - Frosted Glass Circle */}
          <div className={`${actionSize} rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg ring-1 ring-black/10`} style={{ backgroundColor: color === 'white' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: `1px solid ${color === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}>
            <svg width={isBanner ? "24" : "19"} height={isBanner ? "24" : "19"} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 14V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v8" />
              <path d="M12 14v7" />
              <path d="M9 21h6" />
              <circle cx="12" cy="9" r="1.5" fill={color} stroke="none" />
            </svg>
          </div>
          {/* Camera Icon - Frosted Glass Circle */}
          <div className={`${actionSize} rounded-full backdrop-blur-xl flex items-center justify-center shadow-lg ring-1 ring-black/10`} style={{ backgroundColor: color === 'white' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: `1px solid ${color === 'white' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}>
            <svg width={isBanner ? "24" : "19"} height={isBanner ? "24" : "19"} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
        {/* Home Indicator */}
        <div className={`${isBanner ? 'w-24 h-[5px]' : 'w-12 h-1'} rounded-full mb-1`} style={{ backgroundColor: color === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} />
      </div>
    </div>
  )
}

export function PhoneSideButtons({ isBanner = false, isAndroid = false }) {
  // Studio-Grade Natural Titanium (Matches reference)
  const btnBg = 'linear-gradient(to bottom, #f2f2f7 0%, #d1d1d6 50%, #8e8e93 100%)' 
  const shadow = '0 0.5px 1px rgba(0,0,0,0.5)'
  
  // High-precision protrusion: enough to be seen, not too wide to look fake
  const w = isBanner ? '3px' : '2.5px'
  const offset = isBanner ? '-3px' : '-2.5px'
  
  if (isAndroid) {
    return (
      <>
        {/* Power Button (Right) */}
        <div className="absolute top-[28%] rounded-l-[1px] z-30"
          style={{ 
            right: offset, 
            width: w, 
            height: isBanner ? '64px' : '36px', 
            background: btnBg, 
            boxShadow: shadow,
            border: '0.3px solid rgba(0,0,0,0.2)',
            borderRight: 'none'
          }} />
        
        {/* Volume Rocker (Right - common on many Androids like OnePlus) */}
        <div className="absolute top-[42%] rounded-l-[1px] z-30"
          style={{ 
            right: offset, 
            width: w, 
            height: isBanner ? '80px' : '44px', 
            background: btnBg, 
            boxShadow: shadow,
            border: '0.3px solid rgba(0,0,0,0.2)',
            borderRight: 'none'
          }} />
      </>
    )
  }

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
            isAndroid={false} // Gallery usually shows iOS defaults unless changed
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
