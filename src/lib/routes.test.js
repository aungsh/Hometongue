import { describe, expect, it } from 'vitest'
import { redirectFor } from './routes.js'

const none = { dialect: null, person: null }

describe('redirectFor', () => {
  it('sends new visitors to the welcome screen', () => {
    expect(redirectFor('/today', none)).toBe('/onboarding')
    expect(redirectFor('/progress', none)).toBe('/onboarding')
  })

  it('lets new visitors stay inside onboarding', () => {
    expect(redirectFor('/onboarding', none)).toBeNull()
    expect(redirectFor('/onboarding/dialect', none)).toBeNull()
  })

  it('does not let them skip the dialect step', () => {
    expect(redirectFor('/onboarding/person', none)).toBe('/onboarding/dialect')
  })

  it('resumes at the person step once a dialect is chosen', () => {
    const halfway = { dialect: 'hokkien', person: null }
    expect(redirectFor('/today', halfway)).toBe('/onboarding/person')
    expect(redirectFor('/onboarding/person', halfway)).toBeNull()
  })

  it('keeps finished users out of onboarding', () => {
    const done = { dialect: 'hokkien', person: 'hawker' }
    expect(redirectFor('/onboarding/dialect', done)).toBe('/today')
    expect(redirectFor('/mission/learn', done)).toBeNull()
  })
})
