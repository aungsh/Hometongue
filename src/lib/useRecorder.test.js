import { describe, expect, it } from 'vitest'
import { MIC_MESSAGES, micProblem, pickRecordingType } from './useRecorder.js'

describe('pickRecordingType', () => {
  it('takes the first format the browser can record', () => {
    expect(pickRecordingType((t) => t === 'audio/mp4')).toBe('audio/mp4') // Safari
    expect(pickRecordingType(() => true)).toBe('audio/webm;codecs=opus') // Chrome
  })

  it('returns an empty string to let the browser choose', () => {
    expect(pickRecordingType(() => false)).toBe('')
  })
})

describe('micProblem', () => {
  it.each([
    ['NotAllowedError', 'denied'],
    ['SecurityError', 'denied'],
    ['NotFoundError', 'no-mic'],
    ['NotReadableError', 'busy'],
    ['SomethingElse', 'failed'],
  ])('maps %s to %s', (name, problem) => {
    expect(micProblem({ name })).toBe(problem)
  })

  it('always has a message to show', () => {
    for (const key of ['denied', 'no-mic', 'busy', 'failed', 'insecure', 'unsupported', 'short']) {
      expect(MIC_MESSAGES[key]).toBeTruthy()
    }
    expect(micProblem(undefined)).toBe('failed')
  })
})
