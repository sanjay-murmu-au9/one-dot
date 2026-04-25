import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Globe, Telescope, Leaf, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { computeLifeStats } from '../utils/lifeStats'

const TABS = [
  { id: 'past',    label: 'Past',    icon: Clock },
  { id: 'present', label: 'Present', icon: Globe },
  { id: 'future',  label: 'Future',  icon: TrendingUp },
]

export default function LifeSummaryModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('past')

  const dob  = localStorage.getItem('one_dot_dob')
  const name = localStorage.getItem('one_dot_name')
  const stats = useMemo(() => computeLifeStats(dob), [dob])

  // ESC to close
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!stats) return null

  const { meta, past, societal, cosmic, future } = stats

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="life-summary-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          key="life-summary-panel"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          className="relative w-full sm:max-w-2xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: '92vh', borderRadius: '28px 28px 0 0' }}
        >
          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#ff5f45] mb-1">
                Your Life, by the numbers
              </p>
              <h2 className="text-2xl font-bold text-[#1d1d1f] leading-tight">
                {name ? `Hey ${name},` : 'Your Life Story'}
              </h2>
              <p className="text-sm text-[#6e6e73] mt-0.5">
                Age {meta.totalYears} · {meta.totalWeeks} weeks lived · {meta.lifePercent}% of a full life
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 mt-0.5"
            >
              <X size={15} strokeWidth={2.5} className="text-gray-500" />
            </button>
          </div>

          {/* Tab pills */}
          <div className="px-6 pt-4 pb-2 flex gap-2">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: active ? '#1d1d1f' : '#f5f5f7',
                    color: active ? '#fff' : '#86868b',
                  }}
                >
                  <Icon size={12} strokeWidth={2.5} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 px-6 pb-8 pt-2">
            <AnimatePresence mode="wait">
              {activeTab === 'past' && (
                <motion.div
                  key="past"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5 pt-2"
                >
                  <Section icon={Sparkles} title="Life Highlights" accent="#ff5f45">
                    <StatGrid items={[
                      { label: 'Weeks Lived',   value: past.totalWeeks },
                      { label: 'Days of Experience', value: past.totalDays },
                      { label: 'Seasons Observed',   value: past.seasons },
                      { label: 'Sleep Hours',   value: past.sleepHours },
                    ]} />
                    <Prose>
                      You've lived <strong>{past.totalWeeks} weeks</strong>, which is{' '}
                      <strong>{meta.lifePercent}%</strong> of a full life.
                      That's <strong>{past.totalDays} days</strong> of experience and approximately{' '}
                      <strong>{past.seasons} seasons</strong> observed.
                    </Prose>
                  </Section>

                  <Section icon={Clock} title="Your Body's Work" accent="#6366f1">
                    <StatGrid items={[
                      { label: 'Heartbeats',  value: past.heartbeats },
                      { label: 'Breaths',     value: past.breaths },
                      { label: 'Hours Slept', value: past.sleepHours },
                    ]} />
                    <Prose>
                      Your heart has beaten approximately <strong>{past.heartbeats} times</strong>.
                      You've taken around <strong>{past.breaths} breaths</strong> and slept about{' '}
                      <strong>{past.sleepHours} hours</strong>.
                      Your body has also replaced most of its cells several times — you are not made
                      of the same atoms you were born with.
                    </Prose>
                  </Section>

                  <Section icon={Globe} title="Societal Context" accent="#0ea5e9">
                    <StatGrid items={[
                      { label: 'World Pop. at Birth', value: societal.popAtBirth },
                      { label: 'People You\'ve Met',  value: societal.peopleMet },
                      { label: 'Births Since You',    value: societal.birthsSince },
                      { label: 'Deaths Since You',    value: societal.deathsSince },
                    ]} />
                    <Prose>
                      During your lifetime, humanity's population has grown from{' '}
                      <strong>{societal.popAtBirth}</strong> to over 8 billion people.
                      The average person will meet around 80,000 people in their lifetime.
                      You've likely already met approximately <strong>{societal.peopleMet}</strong> individuals.
                      Since your birth, humanity has collectively experienced approximately{' '}
                      <strong>{societal.birthsSince} births</strong> and{' '}
                      <strong>{societal.deathsSince} deaths</strong>.
                    </Prose>
                  </Section>

                  <Section icon={Telescope} title="Cosmic Perspective" accent="#8b5cf6">
                    <StatGrid items={[
                      { label: 'Earth\'s Journey (km)',     value: cosmic.earthTraveled },
                      { label: 'Lunar Cycles Witnessed',   value: cosmic.lunarCycles },
                      { label: 'Trips Around the Sun',     value: cosmic.tripsAroundSun },
                    ]} />
                    <Prose>
                      Since your birth, Earth has traveled approximately{' '}
                      <strong>{cosmic.earthTraveled} km</strong> through space around the Sun.
                      The observable universe is about 93 billion light-years across.
                      Your entire lifespan is just{' '}
                      <strong>{cosmic.lifeAsUniversePct}%</strong> of the universe's age.
                    </Prose>
                  </Section>

                  <Section icon={Leaf} title="Natural World" accent="#10b981">
                    <Prose>
                      You've experienced approximately <strong>{cosmic.lunarCycles} lunar cycles</strong>{' '}
                      and <strong>{cosmic.tripsAroundSun} trips around the Sun</strong>.
                      A giant sequoia tree can live over 3,000 years. Your current age is{' '}
                      <strong>{((meta.totalYears / 3000) * 100).toFixed(2)}%</strong> of its potential lifespan.
                    </Prose>
                  </Section>
                </motion.div>
              )}

              {activeTab === 'present' && (
                <motion.div
                  key="present"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5 pt-2"
                >
                  <Section icon={Sparkles} title="Right Now" accent="#ff5f45">
                    <StatGrid items={[
                      { label: 'Age',          value: `${meta.totalYears} yrs` },
                      { label: 'Weeks Lived',  value: meta.totalWeeks },
                      { label: 'Life Spent',   value: `${meta.lifePercent}%` },
                      { label: 'Days Lived',   value: meta.totalDays },
                    ]} />
                    <Prose>
                      You are <strong>{meta.totalYears} years old</strong> — that's{' '}
                      <strong>{meta.totalWeeks} weeks</strong> or <strong>{meta.totalDays} days</strong>{' '}
                      into your journey. You've used <strong>{meta.lifePercent}%</strong> of a 90-year life.
                    </Prose>
                  </Section>

                  <Section icon={Globe} title="The World Today" accent="#0ea5e9">
                    <Prose>
                      The world you live in has <strong>8.1 billion people</strong>.
                      Technology, culture, and ideas that define your present moment will be studied
                      as history by future generations.
                    </Prose>
                    <div className="mt-3 rounded-2xl p-4" style={{ background: '#f5f5f7' }}>
                      <p className="text-xs text-[#6e6e73] leading-relaxed">
                        Every week that passes is a dot on your Memento Mori wallpaper — a quiet reminder
                        that your time here is finite, and the present moment is the only one you can act on.
                      </p>
                    </div>
                  </Section>
                </motion.div>
              )}

              {activeTab === 'future' && (
                <motion.div
                  key="future"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-5 pt-2"
                >
                  <Section icon={TrendingUp} title="What's Ahead" accent="#ff5f45">
                    <StatGrid items={[
                      { label: 'Years Remaining',   value: future.yearsLeft },
                      { label: 'Weeks Remaining',   value: future.weeksLeft },
                      { label: 'Days Remaining',    value: future.daysLeft },
                      { label: 'Sleep Hours Left',  value: future.sleepHoursLeft },
                    ]} />
                    <Prose>
                      Assuming a 90-year life, you have approximately{' '}
                      <strong>{future.weeksLeft} weeks left</strong>. That's{' '}
                      <strong>{future.daysLeft} days</strong> to read, build, love, and explore.
                      Your heart will beat approximately <strong>{future.heartbeatsRemaining}</strong>{' '}
                      more times.
                    </Prose>
                  </Section>

                  <Section icon={Sparkles} title="A Note on Time" accent="#8b5cf6">
                    <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #2d2d2f 100%)' }}>
                      <p className="text-white text-sm leading-relaxed font-medium">
                        "The impediment to action advances action. What stands in the way becomes the way."
                      </p>
                      <p className="text-xs mt-2" style={{ color: '#86868b' }}>— Marcus Aurelius</p>
                    </div>
                    <Prose>
                      Each unfilled dot on your wallpaper is a week still yours to shape.
                      Use them well.
                    </Prose>
                  </Section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}

function Section({ icon: Icon, title, accent, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: accent + '18' }}
        >
          <Icon size={13} style={{ color: accent }} strokeWidth={2.5} />
        </div>
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="rounded-2xl px-4 py-3"
          style={{ background: '#f5f5f7' }}
        >
          <p className="text-[11px] text-[#86868b] mb-0.5">{label}</p>
          <p className="text-base font-bold text-[#1d1d1f] leading-tight">{value}</p>
        </div>
      ))}
    </div>
  )
}

function Prose({ children }) {
  return (
    <p className="text-sm text-[#3d3d3f] leading-relaxed">
      {children}
    </p>
  )
}
