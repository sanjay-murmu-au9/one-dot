import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import Typewriter from '../components/Typewriter'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About the Concept — One Countdown'
  }, [])

  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Hero Quote Section */}
        <div className="text-center mb-20">
          <div className="display-serif leading-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#1d1d1f', minHeight: '4.5em' }}>
            <Typewriter
              text={" Your time is limited, so don't waste it\nliving "}
              speed={32}
              className="whitespace-pre-line"
              style={{ color: '#1d1d1f', fontStyle: 'normal', display: 'inline' }}
            />
            <Typewriter
              text={"someone else's"}
              speed={32}
              className="whitespace-pre-line"
              style={{ color: '#ff5f45', fontStyle: 'italic', display: 'inline' }}
            />
            <Typewriter
              text={"  life."}
              speed={32}
              className="whitespace-pre-line"
              style={{ color: '#1d1d1f', fontStyle: 'normal', display: 'inline' }}
            />
          </div>
          <p className="mt-6 text-base" style={{ color: '#86868b' }}>
            — Steve Jobs
          </p>
        </div>

        {/* Three Pillars */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {/* Awareness */}
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(29,29,31,0.04)' }}
            >
              <div className="w-4 h-4 rounded-full" style={{ background: '#1d1d1f' }} />
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1d1d1f' }}>
              Awareness
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
              From unconscious passing to mindful presence
            </p>
          </div>

          {/* Visualization */}
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(29,29,31,0.04)' }}
            >
              <div className="grid grid-cols-2 gap-1">
                <div className="w-2 h-2 rounded-sm" style={{ background: '#1d1d1f' }} />
                <div className="w-2 h-2 rounded-sm" style={{ background: '#1d1d1f' }} />
                <div className="w-2 h-2 rounded-sm" style={{ background: '#1d1d1f' }} />
                <div className="w-2 h-2 rounded-sm" style={{ background: '#ff5f45' }} />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1d1d1f' }}>
              Visualization
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
              Transform abstract time into tangible art
            </p>
          </div>

          {/* Intention */}
          <div className="text-center">
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,95,69,0.08)' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(255,95,69,0.15)' }}
              >
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f45' }} />
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2" style={{ color: '#1d1d1f' }}>
              Intention
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
              Live each day with purpose and clarity
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-16 h-px mx-auto mb-20" style={{ background: '#e8e8ed' }} />

        {/* What Makes Us Different */}
        <div className="mb-24">
          <p className="section-label text-center mb-4">What makes us different</p>
          <h2
            className="display-serif text-center mb-12"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#1d1d1f' }}
          >
            More than just a wallpaper
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Life Grid */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">⊞</div>
              <h4 className="font-semibold text-base mb-2" style={{ color: '#1d1d1f' }}>
                Life in Weeks Grid
              </h4>
              <p className="text-sm" style={{ color: '#6e6e73' }}>
                See your entire 90-year life as 4,680 weeks. Watch the grid fill as time passes,
                with your current week pulsing to remind you: this is now.
              </p>
            </div>

            {/* Hourglass */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">⏳</div>
              <h4 className="font-semibold text-base mb-2" style={{ color: '#1d1d1f' }}>
                Living Hourglass
              </h4>
              <p className="text-sm" style={{ color: '#6e6e73' }}>
                A beautiful hourglass that drains throughout the day — from full at 6 AM to empty at 6 PM.
                Time made visible, sand grain by sand grain.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="card p-6 text-center">
              <div className="text-3xl mb-4">━━━</div>
              <h4 className="font-semibold text-base mb-2" style={{ color: '#1d1d1f' }}>
                24-Hour Progress
              </h4>
              <p className="text-sm" style={{ color: '#6e6e73' }}>
                A subtle progress bar tracks your day from midnight to midnight.
                Every glance shows exactly where you are in your daily journey.
              </p>
            </div>
          </div>
        </div>

        {/* Stoic Philosophy */}
        <div
          className="rounded-3xl p-10 mb-20 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(29,29,31,0.03) 0%, rgba(29,29,31,0.06) 100%)' }}
        >
          <p className="section-label mb-4">The Stoic philosophy</p>
          <h2
            className="display-serif mb-6"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#1d1d1f' }}
          >
            Memento Mori
          </h2>
          <p
            className="text-base leading-relaxed max-w-xl mx-auto mb-6"
            style={{ color: '#6e6e73' }}
          >
            "Remember that you will die." The ancient Stoics used this meditation not for despair,
            but for <strong style={{ color: '#1d1d1f' }}>freedom</strong>. When you accept that time is finite,
            you stop wasting it on what doesn't matter.
          </p>
          <p
            className="text-sm italic"
            style={{ color: '#86868b' }}
          >
            "Let us prepare our minds as if we'd come to the very end of life.
            Let us postpone nothing."
            <br />
            <span className="not-italic">— Seneca</span>
          </p>
        </div>

        {/* CTA */}
        <div
          className="rounded-3xl p-10 text-center"
          style={{ background: '#1d1d1f' }}
        >
          <h2
            className="display-serif"
            style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#fff' }}
          >
            Ready to see your time?
          </h2>
          <p className="mt-3 mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Create your first wallpaper in under a minute. Free.
          </p>
          <Link to="/onboarding" id="about-cta" className="btn-coral px-8 py-4">
            Start Your Journey →
          </Link>
        </div>
      </div>

      <footer className="mt-20 py-8 border-t border-gray-100/50 flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 text-[11px] font-medium tracking-wide uppercase" style={{ color: '#86868b' }}>
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Privacy Policy</a>
          <span className="opacity-20">•</span>
          <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Terms of Service</a>
        </div>
        <div className="text-[10px] opacity-40 uppercase tracking-[0.2em]" style={{ color: '#86868b' }}>
          © 2026 One Countdown
        </div>
      </footer>
    </main>
  )
}
