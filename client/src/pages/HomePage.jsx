import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneCard, { WALLPAPER_STYLES } from '../components/PhoneCard'
import DraggableAutoScroll from '../components/DraggableAutoScroll'

// Marquee strip items
const MARQUEE_ITEMS = [
  'Life Grid', 'Carpe Diem', 'Memento Mori', 'Progress View',
  'Yearly View', 'Weekly Grid', 'Quarterly View', 'Large Countdown',
  'Life Grid', 'Carpe Diem', 'Memento Mori', 'Progress View',
  'Yearly View', 'Weekly Grid', 'Quarterly View', 'Large Countdown',
]

const HERO_ITEMS = [
  WALLPAPER_STYLES[0], // Life Grid
  WALLPAPER_STYLES[1], // Large Countdown
  WALLPAPER_STYLES[2], // Progress View
  WALLPAPER_STYLES[4], // Yearly View
  WALLPAPER_STYLES[5], // Carpe Diem
]

const TRENDING_WALLPAPERS = [
  { ...WALLPAPER_STYLES[0], name: 'Mountain Grid', bgImage: `${import.meta.env.BASE_URL}trending/mountain.png` },
  { ...WALLPAPER_STYLES[1], name: 'Baby Countdown', bgImage: `${import.meta.env.BASE_URL}trending/baby.png` },
  { ...WALLPAPER_STYLES[3], name: 'Minimal Tokyo', bgImage: `${import.meta.env.BASE_URL}trending/urban.png` },
  { ...WALLPAPER_STYLES[4], name: 'Cat Calendar', bgImage: `${import.meta.env.BASE_URL}trending/cat.png` },
  { ...WALLPAPER_STYLES[5], name: 'Nature Stoic', bgImage: `${import.meta.env.BASE_URL}trending/nature.png` },
]

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HERO_ITEMS.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in-view')
            obs.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    document.title = 'one dot — lock screen calendar wallpaper'
  }, [])

  // Helper to get items for the trio (left, center, right)
  const getVisibleItems = () => {
    const len = HERO_ITEMS.length
    const left   = (activeIndex - 1 + len) % len
    const center = activeIndex % len
    const right  = (activeIndex + 1) % len
    return [
      { style: HERO_ITEMS[left],   pos: 'left' },
      { style: HERO_ITEMS[center], pos: 'center' },
      { style: HERO_ITEMS[right],  pos: 'right' },
    ]
  }

  return (
    <main>
      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="max-w-3xl mx-auto mb-16">

          {/* Eyebrow */}
          <div className="reveal inline-flex items-center gap-2 mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#ff5f45' }}
            />
            <span
              className="text-xs font-medium tracking-widest uppercase"
              style={{ color: '#6e6e73' }}
            >
              Countdown Wallpapers for your lock screen
            </span>
          </div>

          {/* Main headline */}
          <h1
            className="reveal reveal-delay-1 display-serif"
            style={{
              fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
              color: '#1d1d1f',
              marginBottom: '24px',
              lineHeight: 1.1,
              letterSpacing: '-0.02em'
            }}
          >
            Transform your phone into a{' '}
            <span style={{ color: '#ff5f45' }}>focus tool.</span>
          </h1>

          <p
            className="reveal reveal-delay-2 mx-auto text-lg leading-relaxed mb-10"
            style={{ color: '#6e6e73', maxWidth: '600px' }}
          >
            Download a <strong>free, high-resolution wallpaper</strong> perfectly sized for your screen. Instantly track your life in weeks, visualize your year, or count down to your biggest milestone.
          </p>

          {/* CTAs */}
          <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/onboarding"
              id="hero-cta"
              className="btn-coral text-[16px] px-8 py-4 font-semibold shadow-[0_8px_24px_rgba(255,95,69,0.3)] hover:shadow-[0_12px_28px_rgba(255,95,69,0.4)] transition-all"
            >
              Get Your Custom Wallpaper →
            </Link>
            <a href="#gallery" className="btn-ghost text-[16px] px-8 py-4 font-medium">
              See what it looks like
            </a>
          </div>
        </div>

        {/* Hero dynamic carousel */}
        <div 
          className="reveal reveal-delay-2 relative h-[420px] max-w-5xl mx-auto flex items-center justify-center"
          aria-label="Gallery of dynamic countdown wallpaper styles including Life Grid and Memento Mori"
        >
          <AnimatePresence mode="popLayout">
            {getVisibleItems().map((item, i) => {
              const isCenter = item.pos === 'center'
              const isLeft   = item.pos === 'left'
              const isRight  = item.pos === 'right'

              return (
                <motion.div
                  key={item.style.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: isLeft ? -100 : isRight ? 100 : 0 }}
                  animate={{
                    opacity: isCenter ? 1 : 0.4,
                    scale: isCenter ? 1.05 : 0.85,
                    x: isLeft ? -240 : isRight ? 240 : 0,
                    zIndex: isCenter ? 20 : 10,
                    filter: isCenter ? 'blur(0px)' : 'blur(2px)',
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 25,
                  }}
                  className="absolute"
                >
                  <PhoneCard
                    style={item.style}
                    floatClass={isCenter ? 'animate-float' : ''}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* ── MARQUEE STRIP ──────────────────────────────────── */}
      <div
        className="overflow-hidden border-y py-3.5"
        style={{ borderColor: '#e8e8ed', background: '#f5f5f7' }}
      >
        <div className="marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-3 whitespace-nowrap px-6 text-sm font-medium"
              style={{ color: '#86868b' }}
            >
              <span
                className="w-1 h-1 rounded-full inline-block"
                style={{ background: '#ff5f45' }}
              />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── WALLPAPER GALLERY ──────────────────────────────── */}
      <section id="gallery" className="py-24 overflow-hidden">

        {/* Section header */}
        <div className="reveal text-center mb-20 px-6">
          <p className="section-label mb-4">Gallery</p>
          <h2
            className="display-serif"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#1d1d1f' }}
          >
            Every dot tells a story. One dot per day.
          </h2>
          <p className="mt-4 text-base" style={{ color: '#6e6e73' }}>
            Choose from a collection of premium, minimal aesthetics.
          </p>
        </div>

        {/* Dual Marquee Rows */}
        <div className="space-y-4 marquee-mask">
          {/* Row 1: Leftward */}
          <DraggableAutoScroll direction="left" speed={1}>
            {WALLPAPER_STYLES.map((style, i) => (
              <div key={`${style.id}-row1-${i}`} className="flex-shrink-0">
                <PhoneCard style={style} floatClass="" />
              </div>
            ))}
          </DraggableAutoScroll>

          {/* Row 2: Rightward - Trending & Loved */}
          <DraggableAutoScroll direction="right" speed={1}>
            {TRENDING_WALLPAPERS.map((style, i) => (
              <div key={`${style.id}-trending-${i}`} className="flex-shrink-0">
                <PhoneCard style={style} floatClass="" />
              </div>
            ))}
          </DraggableAutoScroll>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ background: '#f5f5f7', borderTop: '1px solid #e8e8ed', borderBottom: '1px solid #e8e8ed' }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="reveal text-center mb-16">
            <p className="section-label mb-4">How it works</p>
            <h2
              className="display-serif"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 3rem)', color: '#1d1d1f' }}
            >
              The Wallpaper Engine. Three steps to focus.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                icon: '✦',
                title: 'Select a design',
                body: 'Browse our collection of minimalist, precision-crafted lock screen layouts designed to keep you grounded.',
              },
              {
                num: '02',
                icon: '⚙️',
                title: 'Customize it',
                body: 'Input your birth year, set a target date, or choose your own colors. Watch your unique timeline generate in real-time.',
              },
              {
                num: '03',
                icon: '📲',
                title: 'Set as wallpaper',
                body: 'Download the high-res PNG and set it as your lock screen. Every time you wake your phone, you get a powerful daily update on your progress.',
              },
            ].map((step, i) => (
              <div
                key={i}
                className="reveal card p-8"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-3xl mb-5">{step.icon}</div>
                <div className="text-xs font-mono mb-3" style={{ color: '#ff5f45' }}>
                  {step.num}
                </div>
                <h3
                  className="font-semibold text-lg mb-2"
                  style={{ color: '#1d1d1f' }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE STATS ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: '8', label: 'Unique styles' },
              { n: '3', label: 'Resolutions' },
              { n: '∞', label: 'Custom dates' },
              { n: '0¢', label: 'Completely free' },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="display-serif"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', color: '#1d1d1f' }}
                >
                  {stat.n}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: '#86868b' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────────── */}
      <section
        className="py-24 px-6 text-center relative overflow-hidden"
        style={{ background: '#1d1d1f' }}
      >
        {/* Subtle coral glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 80%, rgba(255,95,69,0.15) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-xl mx-auto reveal">
          <h2
            className="display-serif"
            style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)', color: '#ffffff' }}
          >
            Begin your journey. Make every day <span style={{ color: '#ff5f45' }}>count.</span>
          </h2>
          <p className="mt-4 mb-10 text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Free. Beautiful. On your lock screen every time you reach for your phone.
          </p>
          <Link to="/onboarding" id="bottom-cta" className="btn-coral text-base px-8 py-4">
            Create your wallpaper — it's free
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
        style={{ background: '#1d1d1f', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2026 OneCountdown — Make every day count.
        </span>
        <div className="flex gap-5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/generate" className="hover:text-white transition-colors">Create</Link>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Privacy</a>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Terms</a>
        </div>
      </footer>
    </main>
  )
}
