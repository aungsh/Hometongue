import { describe, it, expect } from 'vitest'
import { menuChoice, renderMenu } from './menu.mjs'

describe('menuChoice', () => {
  it.each([
    ['1', 'start'],
    ['2', 'stop'],
    ['3', 'open'],
    ['4', 'share'],
    ['5', 'setup'],
    ['q', 'quit'],
    ['Q', 'quit'],
  ])('key %s → %s', (key, action) => {
    expect(menuChoice(key)).toBe(action)
  })

  it.each([['x'], [''], ['\r'], ['9']])('ignores %j', (key) => {
    expect(menuChoice(key)).toBeNull()
  })
})

describe('renderMenu', () => {
  it('shows where the app is running', () => {
    const text = renderMenu({ running: true, url: 'http://localhost:5174/' })
    expect(text).toContain('Running at http://localhost:5174/')
    expect(text).not.toContain('Not running')
  })

  it('says when the app is not running', () => {
    const text = renderMenu({ running: false })
    expect(text).toContain('Not running')
    expect(text).not.toContain('Running at')
  })

  it('lists phone links when the app is shared on Wi-Fi', () => {
    const text = renderMenu({ running: true, url: 'http://localhost:5173/', lanUrls: ['http://192.168.0.6:5173/'] })
    expect(text).toContain('http://192.168.0.6:5173/')
  })
})
