import { describe, it, expect } from 'vitest'
import { outline, spritePaths } from './pixel.js'

describe('outline', () => {
  it('rings filled pixels on all four sides and leaves the corners empty', () => {
    expect(outline(['x'])).toEqual(['.k.', 'kxk', '.k.'])
  })

  it('grows the sprite by one pixel on every side', () => {
    const result = outline(['ab', 'c.'])
    expect([result.length, result[0].length]).toEqual([4, 4])
  })

  it('fills a one-pixel gap between two filled pixels with outline', () => {
    expect(outline(['x.x'])[1]).toBe('kxkxk')
  })
})

describe('spritePaths', () => {
  it('draws one path per colour with a unit square per pixel', () => {
    expect(spritePaths(['ab', 'a.'], { a: 'red', b: 'blue' })).toEqual([
      { color: 'red', d: 'M0 0h1v1h-1zM0 1h1v1h-1z' },
      { color: 'blue', d: 'M1 0h1v1h-1z' },
    ])
  })

  it('leaves out characters that have no colour', () => {
    expect(spritePaths(['?.'], {})).toEqual([])
  })
})
