import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Memento Mori & Progress Wallpapers — one dot'
  }, [])
  return (
    <main className="min-h-screen pt-28 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="section-label mb-4">About the concept</p>
          <h1
            className="display-serif"
            style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', color: '#1d1d1f' }}
          >
            Why count down?
          </h1>
          <p
            className="mt-5 text-lg leading-relaxed"
            style={{ color: '#6e6e73', maxWidth: '480px' }}
          >
            Seeing a number shrink every single day makes time feel real.
            It transforms a vague goal into a ticking presence — on your
            lock screen, every time you reach for your phone.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-16">
          {[
            {
              icon: '🎯',
              title: 'Intentional living',
              body: `A countdown wallpaper is a daily reminder of what matters. Every time you unlock
                     your phone, you're confronted with time — and how you're using it.`,
            },
            {
              icon: '🧠',
              title: 'The psychology',
              body: `Research shows that visualizing deadlines improves follow-through. 
                     Seeing "128 days" instead of "about 4 months" creates urgency that motivates real action.`,
            },
            {
              icon: '⏳',
              title: 'Memento Mori',
              body: `The Stoics used death-awareness to focus on what truly matters. A life-in-weeks 
                     grid reminds you that time is finite — and therefore precious.`,
            },
            {
              icon: '🌅',
              title: 'Carpe Diem',
              body: `Whether it's a wedding, a product launch, a fitness goal, or a trip you've been 
                     dreaming of — let the countdown turn your phone into a daily coach.`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="card p-7 flex gap-5 items-start"
            >
              <div className="text-3xl flex-shrink-0 mt-0.5">{item.icon}</div>
              <div>
                <h2 className="font-semibold text-base mb-1.5" style={{ color: '#1d1d1f' }}>
                  {item.title}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
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
            Ready to start?
          </h2>
          <p className="mt-3 mb-8 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Create your first countdown wallpaper in under a minute. Free.
          </p>
          <Link to="/generate" id="about-cta" className="btn-coral px-8 py-4">
            Create wallpaper →
          </Link>
        </div>
      </div>
    </main>
  )
}
