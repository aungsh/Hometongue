import { describe, it, expect } from 'vitest'
import { relativeDay } from './format.js'

const NOW = new Date(2026, 9, 1, 15, 0)

describe('relativeDay', () => {
  it('says Today for any time on the same day', () => {
    expect(relativeDay(new Date(2026, 9, 1, 0, 5), NOW)).toBe('Today')
  })

  it('says Yesterday for late the previous evening', () => {
    expect(relativeDay(new Date(2026, 8, 30, 23, 50), NOW)).toBe('Yesterday')
  })

  it('shows the date for anything older', () => {
    const label = relativeDay(new Date(2026, 8, 28, 9), NOW)
    expect(label).toMatch(/28/)
    expect(label).toMatch(/Sep/)
  })
})
