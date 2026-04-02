/**
 * Life Calculation Utilities for "Shock Onboarding"
 *
 * Calculates days lived, days remaining, and percentage of life used
 * based on a user's date of birth and an assumed lifespan.
 */

const ASSUMED_LIFESPAN_YEARS = 90
const DAYS_IN_YEAR = 365.25 // Accounting for leap years

/**
 * Calculate life statistics based on date of birth
 * @param {string|Date} dob - Date of birth (YYYY-MM-DD or Date object)
 * @returns {Object} Life statistics
 */
export function calculateLifeStats(dob) {
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob
  const today = new Date()

  // Calculate days lived
  const timeLived = today - birthDate
  const daysLived = Math.floor(timeLived / (1000 * 60 * 60 * 24))

  // Calculate total expected days
  const totalDays = Math.floor(ASSUMED_LIFESPAN_YEARS * DAYS_IN_YEAR)

  // Calculate days remaining
  const daysLeft = Math.max(0, totalDays - daysLived)

  // Calculate percentage used
  const percentUsed = Math.min(100, (daysLived / totalDays) * 100)

  // Calculate age
  const ageYears = Math.floor(daysLived / DAYS_IN_YEAR)

  // Calculate weeks (for Life Grid)
  const weeksLived = Math.floor(daysLived / 7)
  const totalWeeks = ASSUMED_LIFESPAN_YEARS * 52
  const weeksLeft = Math.max(0, totalWeeks - weeksLived)

  return {
    daysLived,
    daysLeft,
    totalDays,
    percentUsed: percentUsed.toFixed(1),
    ageYears,
    weeksLived,
    weeksLeft,
    totalWeeks,
    birthDate: birthDate.toISOString(),
  }
}

/**
 * Get a philosophical message based on life percentage
 * @param {number} percentUsed - Percentage of life used
 * @returns {string} Philosophical message
 */
export function getPhilosophicalMessage(percentUsed) {
  if (percentUsed < 20) {
    return "You're just beginning. Every day is a gift."
  } else if (percentUsed < 40) {
    return "The foundation is laid. Build something meaningful."
  } else if (percentUsed < 60) {
    return "Half the journey is behind you. Make the rest count."
  } else if (percentUsed < 80) {
    return "Time accelerates. Focus on what truly matters."
  } else {
    return "Every moment is precious. Live fully, now."
  }
}

/**
 * Format large numbers with commas for readability
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toLocaleString('en-US')
}

/**
 * Validate date of birth
 * @param {string} dob - Date of birth (YYYY-MM-DD)
 * @returns {Object} Validation result
 */
export function validateDOB(dob) {
  if (!dob) {
    return { valid: false, error: 'Please enter your date of birth' }
  }

  const birthDate = new Date(dob)
  const today = new Date()

  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: 'Invalid date format' }
  }

  if (birthDate > today) {
    return { valid: false, error: 'Date of birth cannot be in the future' }
  }

  const age = (today - birthDate) / (1000 * 60 * 60 * 24 * 365.25)

  if (age < 5) {
    return { valid: false, error: 'You must be at least 5 years old' }
  }

  if (age > 120) {
    return { valid: false, error: 'Please enter a valid date of birth' }
  }

  return { valid: true }
}
