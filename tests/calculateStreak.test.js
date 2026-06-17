import { describe, it, expect } from 'vitest'
const { calculateStreak } = require('../utils/calculateStreak')

describe('calculateStreak', () => {
  const today = '2026-06-16'
  const yesterday = '2026-06-15'
  const twoDaysAgo = '2026-06-14'
  const threeDaysAgo = '2026-06-13'
  const lastWeek = '2026-06-09'

  it('returns zero stats for empty dates', () => {
    const result = calculateStreak([], 'daily', today)
    expect(result).toEqual({
      currentStreak: 0,
      bestStreak: 0,
      completedToday: false,
      totalCompletions: 0,
    })
  })

  it('returns completedToday true when today is in dates', () => {
    const result = calculateStreak([today], 'daily', today)
    expect(result.completedToday).toBe(true)
    expect(result.currentStreak).toBe(1)
  })

  it('returns completedToday false when today not in dates', () => {
    const result = calculateStreak([yesterday], 'daily', today)
    expect(result.completedToday).toBe(false)
  })

  it('calculates currentStreak for consecutive daily completions', () => {
    const dates = [today, yesterday, twoDaysAgo]
    const result = calculateStreak(dates, 'daily', today)
    expect(result.currentStreak).toBe(3)
  })

  it('stops currentStreak on gap', () => {
    const dates = [today, yesterday, threeDaysAgo]
    const result = calculateStreak(dates, 'daily', today)
    expect(result.currentStreak).toBe(2)
  })

  it('currentStreak is 0 if not completed today or yesterday', () => {
    const dates = [threeDaysAgo]
    const result = calculateStreak(dates, 'daily', today)
    expect(result.currentStreak).toBe(0)
  })

  it('calculates bestStreak correctly', () => {
    const dates = [today, yesterday, twoDaysAgo, lastWeek]
    const result = calculateStreak(dates, 'daily', today)
    expect(result.bestStreak).toBe(3)
  })

  it('uses step=7 for weekly frequency', () => {
    const week1 = '2026-06-09'
    const week2 = '2026-06-16'
    const result = calculateStreak([week2, week1], 'weekly', today)
    expect(result.currentStreak).toBe(2)
    expect(result.bestStreak).toBe(2)
  })
})
