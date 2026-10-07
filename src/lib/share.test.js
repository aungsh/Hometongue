import { afterEach, describe, expect, it, vi } from 'vitest'
import { shareOrCopy, shareText } from './share.js'

describe('shareText', () => {
  const base = { dialectName: 'Hokkien', partnerRef: 'Ah Ma', total: 4, streak: 1 }

  it('celebrates the conversation', () => {
    expect(shareText(base)).toBe('I just spoke Hokkien with Ah Ma! 🎉 4 real conversations so far on Hometongue.')
  })

  it('marks a first conversation and shows a streak worth mentioning', () => {
    expect(shareText({ ...base, total: 1 })).toContain('My first real conversation')
    expect(shareText({ ...base, streak: 5 })).toContain('5-day streak.')
  })
})

describe('shareOrCopy', () => {
  afterEach(() => vi.unstubAllGlobals())
  const data = { text: 'hello', url: 'https://example.com' }

  it('uses the share sheet when the browser has one', async () => {
    const share = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { share })
    expect(await shareOrCopy(data)).toBe('shared')
    expect(share).toHaveBeenCalledWith(data)
  })

  it('treats closing the share sheet as cancelling, not failing', async () => {
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(Object.assign(new Error(), { name: 'AbortError' })) })
    expect(await shareOrCopy(data)).toBe('cancelled')
  })

  it('copies to the clipboard when sharing is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    expect(await shareOrCopy(data)).toBe('copied')
    expect(writeText).toHaveBeenCalledWith('hello https://example.com')
  })

  it('reports failure when neither works', async () => {
    vi.stubGlobal('navigator', {})
    expect(await shareOrCopy(data)).toBe('failed')
  })
})
