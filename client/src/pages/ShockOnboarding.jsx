import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { calculateLifeStats, validateDOB, formatNumber, getPhilosophicalMessage } from '../utils/lifeCalculations'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import LoginModal from '../components/LoginModal'

/**
 * Shock Onboarding Page
 *
 * Creates an emotional "reality check" moment by showing users
 * their life statistics after they enter their date of birth.
 *
 * Flow:
 * 1. Name + DOB Input → 2. Calculating → 3. Shock Reveal → 4. Continue to Generator
 */
export default function ShockOnboarding() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [step, setStep] = useState('input') // 'input' | 'calculating' | 'reveal'
  const [name, setName] = useState('')
  const [day, setDay] = useState('')
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [error, setError] = useState('')
  const [lifeStats, setLifeStats] = useState(null)
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)

  // Refs for auto-advancing between DOB fields
  const dayRef = useRef(null)
  const monthRef = useRef(null)
  const yearRef = useRef(null)

  // Valid year range: current year minus 90 to current year minus 5 (at least 5 years old)
  const currentYear = new Date().getFullYear()
  const minYear = currentYear - 90
  const maxYear = currentYear - 5

  // Form is complete when name + all DOB fields are filled and year is within valid range
  const yearNum = year.length === 4 ? parseInt(year) : 0
  const isFormValid = name.trim().length >= 1 && day.length === 2 && month.length === 2 && year.length === 4 && yearNum >= minYear && yearNum <= maxYear

  useEffect(() => {
    document.title = 'Begin your journey — one dot'

    async function checkOnboardingStatus() {
      // 1. Check localStorage first (quick check)
      const cachedDOB = localStorage.getItem('one_dot_dob')
      if (cachedDOB) {
        navigate('/generate', { replace: true })
        return
      }

      // 2. If logged in, also check Firestore
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
          if (userDoc.exists()) {
            const data = userDoc.data()
            if (data.onboardingCompleted && data.dob) {
              // User already completed onboarding in Firestore - cache locally and redirect
              localStorage.setItem('one_dot_dob', data.dob)
              if (data.name) localStorage.setItem('one_dot_name', data.name)
              navigate('/generate', { replace: true })
              return
            }
          }
        } catch (err) {
          console.error('Error checking onboarding status:', err)
        }
      }

      // 3. User needs onboarding
      setCheckingOnboarding(false)
    }

    checkOnboardingStatus()
  }, [navigate, currentUser])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    if (!day || !month || !year) {
      setError('Please enter your complete date of birth')
      return
    }

    // Validate year range
    const yearNum = parseInt(year)
    if (yearNum < minYear || yearNum > maxYear) {
      setError(`Year must be between ${minYear} and ${maxYear}`)
      return
    }

    const dob = `${year}-${month}-${day}`

    // Validate DOB
    const validation = validateDOB(dob)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    // Calculate life stats
    const stats = calculateLifeStats(dob)
    setLifeStats(stats)

    // Show calculating animation
    setStep('calculating')

    // After 1.5s, show the reveal
    setTimeout(() => {
      setStep('reveal')
    }, 1500)
  }

  const handleContinue = async () => {
    const dob = `${year}-${month}-${day}`

    // Store locally for quick access
    localStorage.setItem('one_dot_name', name.trim())
    localStorage.setItem('one_dot_dob', dob)
    localStorage.setItem('one_dot_life_stats', JSON.stringify(lifeStats))

    // Also persist to Firestore if user is logged in
    if (currentUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), {
          name: name.trim(),
          dob,
          birthYear: parseInt(year),
          onboardingCompleted: true,
          updatedAt: new Date().toISOString(),
        }, { merge: true })
      } catch (err) {
        console.error('Failed to save onboarding to Firestore:', err)
      }
    }

    // Navigate to generator
    navigate('/generate')
  }


  // Show login modal if user is not authenticated
  if (!currentUser) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0b0b0c' }}
      >
        <LoginModal onClose={() => navigate('/')} />
      </div>
    )
  }

  // Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#0b0b0c' }}
      >
        <span className="w-6 h-6 border-2 border-gray-600 border-t-gray-200 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: '#0b0b0c' }}
    >
      <AnimatePresence mode="wait">

        {/* ──────────────────────────────────────────────────── */}
        {/* STEP 1: DOB INPUT                                    */}
        {/* ──────────────────────────────────────────────────── */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md px-6 text-center"
          >
            {/* Dot icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-3 h-3 rounded-full mx-auto mb-8"
              style={{ background: '#ff5f45' }}
            />

            {/* Headline */}
            <h1
              className="display-serif mb-4"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                color: '#fdfdfc',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              When were you born?
            </h1>

            <p
              className="mb-12 text-base leading-relaxed"
              style={{ color: 'rgba(253,253,252,0.5)' }}
            >
              We'll show you something that might change how you see time.
            </p>

            {/* Name + DOB Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name field */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: 'rgba(253,253,252,0.4)' }}
                >
                  Your Name
                </p>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError('') }}
                  className="w-full px-4 py-5 rounded-2xl text-center text-2xl transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(253,253,252,0.05)',
                    border: '2px solid rgba(253,253,252,0.1)',
                    color: '#fdfdfc',
                    colorScheme: 'dark',
                  }}
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>

              {/* DOB label */}
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: 'rgba(253,253,252,0.4)' }}
              >
                Date of Birth
              </p>

              {/* Three-field date selector with auto-advance */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Day */}
                <div className="relative">
                  <input
                    ref={dayRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="2"
                    value={day}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (val === '' || parseInt(val) <= 31) {
                        setDay(val)
                        setError('')
                        // Auto-advance to month when 2 digits entered
                        if (val.length === 2) monthRef.current?.focus()
                      }
                    }}
                    className="w-full px-4 py-6 rounded-2xl text-center text-3xl font-mono transition-all duration-200 outline-none"
                    style={{
                      background: 'rgba(253,253,252,0.05)',
                      border: '2px solid rgba(253,253,252,0.1)',
                      color: '#fdfdfc',
                      colorScheme: 'dark',
                    }}
                    placeholder="15"
                  />
                  <p
                    className="absolute -bottom-6 left-0 right-0 text-center text-xs"
                    style={{ color: 'rgba(253,253,252,0.3)' }}
                  >
                    DAY
                  </p>
                </div>

                {/* Month */}
                <div className="relative">
                  <input
                    ref={monthRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="2"
                    value={month}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                      if (val === '' || parseInt(val) <= 12) {
                        setMonth(val)
                        setError('')
                        // Auto-advance to year when 2 digits entered
                        if (val.length === 2) yearRef.current?.focus()
                      }
                    }}
                    onKeyDown={(e) => {
                      // Backspace on empty month goes back to day
                      if (e.key === 'Backspace' && month === '') {
                        dayRef.current?.focus()
                      }
                    }}
                    className="w-full px-4 py-6 rounded-2xl text-center text-3xl font-mono transition-all duration-200 outline-none"
                    style={{
                      background: 'rgba(253,253,252,0.05)',
                      border: '2px solid rgba(253,253,252,0.1)',
                      color: '#fdfdfc',
                      colorScheme: 'dark',
                    }}
                    placeholder="04"
                  />
                  <p
                    className="absolute -bottom-6 left-0 right-0 text-center text-xs"
                    style={{ color: 'rgba(253,253,252,0.3)' }}
                  >
                    MONTH
                  </p>
                </div>

                {/* Year */}
                <div className="relative">
                  <input
                    ref={yearRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="4"
                    value={year}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setYear(val)
                      setError('')
                    }}
                    onKeyDown={(e) => {
                      // Backspace on empty year goes back to month
                      if (e.key === 'Backspace' && year === '') {
                        monthRef.current?.focus()
                      }
                    }}
                    className="w-full px-4 py-6 rounded-2xl text-center text-3xl font-mono transition-all duration-200 outline-none"
                    style={{
                      background: 'rgba(253,253,252,0.05)',
                      border: '2px solid rgba(253,253,252,0.1)',
                      color: '#fdfdfc',
                      colorScheme: 'dark',
                    }}
                    placeholder="1990"
                  />
                  <p
                    className="absolute -bottom-6 left-0 right-0 text-center text-xs"
                    style={{ color: 'rgba(253,253,252,0.3)' }}
                  >
                    YEAR ({minYear}–{maxYear})
                  </p>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm"
                  style={{ color: '#ef4444' }}
                >
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                className="w-full py-4 rounded-2xl font-semibold text-base transition-all duration-300 mt-8"
                style={{
                  background: isFormValid ? '#ff5f45' : 'rgba(253,253,252,0.1)',
                  color: isFormValid ? '#fff' : 'rgba(253,253,252,0.3)',
                  boxShadow: isFormValid ? '0 8px 24px rgba(255,95,69,0.3)' : 'none',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
                disabled={!isFormValid}
              >
                Continue
              </button>
            </form>

            {/* Skip option */}
            <button
              onClick={() => navigate('/generate')}
              className="mt-6 text-sm transition-opacity duration-200 hover:opacity-100"
              style={{ color: 'rgba(253,253,252,0.3)', opacity: 0.5 }}
            >
              Skip for now
            </button>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────────────── */}
        {/* STEP 2: CALCULATING                                  */}
        {/* ──────────────────────────────────────────────────── */}
        {step === 'calculating' && (
          <motion.div
            key="calculating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 border-2 rounded-full mx-auto"
              style={{
                borderColor: 'rgba(253,253,252,0.1)',
                borderTopColor: '#ff5f45',
              }}
            />
            <p
              className="mt-6 font-mono text-sm"
              style={{ color: 'rgba(253,253,252,0.4)' }}
            >
              Calculating...
            </p>
          </motion.div>
        )}

        {/* ──────────────────────────────────────────────────── */}
        {/* STEP 3: SHOCK REVEAL                                 */}
        {/* ──────────────────────────────────────────────────── */}
        {step === 'reveal' && lifeStats && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl px-6 text-center"
          >
            {/* Age */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-12"
            >
              <p
                className="text-sm uppercase tracking-widest mb-2"
                style={{ color: 'rgba(253,253,252,0.3)' }}
              >
                {name.trim() ? `${name.trim()}, you are` : 'You are'}
              </p>
              <p
                className="font-mono text-2xl"
                style={{ color: '#fdfdfc' }}
              >
                {lifeStats.ageYears} years old
              </p>
            </motion.div>

            {/* Main Statistics Grid */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="grid md:grid-cols-3 gap-8 md:gap-12 mb-12"
            >
              {/* Days Lived */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(253,253,252,0.4)' }}
                >
                  Days Lived
                </p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring', stiffness: 100 }}
                  className="font-mono mb-2"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    color: '#fdfdfc',
                    fontWeight: 300,
                  }}
                >
                  {formatNumber(lifeStats.daysLived)}
                </motion.p>
                <p
                  className="text-xs"
                  style={{ color: 'rgba(253,253,252,0.3)' }}
                >
                  {formatNumber(lifeStats.weeksLived)} weeks
                </p>
              </div>

              {/* Percentage Used (SHOCKING) */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(253,253,252,0.4)' }}
                >
                  Life Used
                </p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 100 }}
                  className="font-mono mb-2"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                    color: '#ff5f45',
                    fontWeight: 700,
                  }}
                >
                  {lifeStats.percentUsed}%
                </motion.p>
                <p
                  className="text-xs"
                  style={{ color: 'rgba(253,253,252,0.3)' }}
                >
                  Based on 90 years
                </p>
              </div>

              {/* Days Left */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest mb-3"
                  style={{ color: 'rgba(253,253,252,0.4)' }}
                >
                  Days Remaining
                </p>
                <motion.p
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.4, type: 'spring', stiffness: 100 }}
                  className="font-mono mb-2"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    color: '#fdfdfc',
                    fontWeight: 300,
                  }}
                >
                  {formatNumber(lifeStats.daysLeft)}
                </motion.p>
                <p
                  className="text-xs"
                  style={{ color: 'rgba(253,253,252,0.3)' }}
                >
                  {formatNumber(lifeStats.weeksLeft)} weeks
                </p>
              </div>
            </motion.div>

            {/* Philosophical Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mb-12"
            >
              <p
                className="display-serif leading-relaxed"
                style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
                  color: 'rgba(253,253,252,0.7)',
                  fontStyle: 'italic',
                }}
              >
                "{getPhilosophicalMessage(parseFloat(lifeStats.percentUsed))}"
              </p>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              <button
                onClick={handleContinue}
                className="px-10 py-4 rounded-2xl font-semibold text-base transition-all duration-300 hover:scale-105"
                style={{
                  background: '#ff5f45',
                  color: '#fff',
                  boxShadow: '0 8px 32px rgba(255,95,69,0.4)',
                }}
              >
                Create a reminder wallpaper →
              </button>
              <p
                className="mt-4 text-sm"
                style={{ color: 'rgba(253,253,252,0.3)' }}
              >
                Turn this realization into daily motivation
              </p>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
