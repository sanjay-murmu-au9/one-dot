/**
 * Computes personalized life statistics from a user's date of birth.
 * @param {string} dob - ISO date string "YYYY-MM-DD"
 * @returns {object} All computed stats grouped by section
 */
export function computeLifeStats(dob) {
  if (!dob) return null

  const birth = new Date(dob)
  const now = new Date()

  const msPerDay    = 1000 * 60 * 60 * 24
  const totalMs     = now - birth
  const totalDays   = Math.floor(totalMs / msPerDay)
  const totalWeeks  = Math.floor(totalDays / 7)
  const totalYears  = now.getFullYear() - birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
  const totalHours  = Math.floor(totalMs / (1000 * 60 * 60))
  const totalMonths = totalYears * 12 + (now.getMonth() - birth.getMonth())
  const seasons     = Math.floor(totalDays / (365.25 / 4))

  // Percentages
  const LIFE_EXPECTANCY_WEEKS = 90 * 52
  const lifePercent = ((totalWeeks / LIFE_EXPECTANCY_WEEKS) * 100).toFixed(1)

  // Biological stats
  const heartbeats  = Math.round(totalHours * 60 * 70)        // ~70 bpm
  const breaths     = Math.round(totalHours * 60 * 15)        // ~15 rpm
  const sleepHours  = Math.round(totalDays * 8)               // ~8 hrs/day

  // Societal
  const WORLD_POP_AT_BIRTH = estimateWorldPop(birth.getFullYear())
  const WORLD_POP_NOW      = 8_100_000_000
  const birthRate          = 140_000_000 // births/year
  const deathRate          = 60_000_000  // deaths/year
  const birthsSince        = Math.round((totalDays / 365.25) * birthRate)
  const deathsSince        = Math.round((totalDays / 365.25) * deathRate)
  const peopleMet          = Math.round((totalDays / 365.25) * (80_000 / totalYears || 1))

  // Cosmic
  const kmPerDay           = 2_578_125   // Earth orbit ~940M km/year
  const earthTraveled      = Math.round(totalDays * kmPerDay)
  const solarSystemSpeed   = 220_000     // km/s * seconds/year... actually per day
  const solarTraveled      = Math.round(totalDays * 220_000 * 86400 / 1_000_000_000) // billion km
  const universeAgeYears   = 13_800_000_000
  const lifeAsUniversePct  = ((totalYears / universeAgeYears) * 100).toFixed(10)

  // Natural world
  const lunarCycles  = Math.floor(totalDays / 29.53)
  const tripsAroundSun = totalYears

  // Future projections (years remaining at 90)
  const yearsLeft    = Math.max(0, 90 - totalYears)
  const weeksLeft    = Math.max(0, LIFE_EXPECTANCY_WEEKS - totalWeeks)
  const daysLeft     = Math.max(0, Math.round(yearsLeft * 365.25))

  return {
    meta: {
      dob,
      totalYears,
      totalMonths,
      totalWeeks,
      totalDays,
      lifePercent,
    },
    past: {
      totalWeeks: fmt(totalWeeks),
      totalDays: fmt(totalDays),
      seasons: fmt(seasons),
      heartbeats: fmt(heartbeats),
      breaths: fmt(breaths),
      sleepHours: fmt(sleepHours),
    },
    societal: {
      popAtBirth: fmt(WORLD_POP_AT_BIRTH),
      popNow: fmt(WORLD_POP_NOW),
      peopleMet: fmt(peopleMet),
      birthsSince: fmt(birthsSince),
      deathsSince: fmt(deathsSince),
    },
    cosmic: {
      earthTraveled: fmt(earthTraveled),
      lifeAsUniversePct: lifeAsUniversePct,
      lunarCycles: fmt(lunarCycles),
      tripsAroundSun: fmt(tripsAroundSun),
    },
    future: {
      yearsLeft: fmt(yearsLeft),
      weeksLeft: fmt(weeksLeft),
      daysLeft: fmt(daysLeft),
      heartbeatsRemaining: fmt(Math.round(yearsLeft * 365.25 * 24 * 60 * 70)),
      sleepHoursLeft: fmt(Math.round(daysLeft * 8)),
    },
  }
}

function fmt(n) {
  return Number(n).toLocaleString()
}

function estimateWorldPop(year) {
  // Rough linear interpolation between known milestones
  if (year <= 1960) return 3_000_000_000
  if (year <= 1975) return 4_000_000_000
  if (year <= 1987) return 5_000_000_000
  if (year <= 1999) return 6_000_000_000
  if (year <= 2011) return 7_000_000_000
  if (year <= 2022) return 8_000_000_000
  return 8_100_000_000
}
