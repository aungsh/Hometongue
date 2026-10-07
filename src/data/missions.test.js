import { describe, expect, it } from 'vitest'
import { DIALECTS, PEOPLE } from './catalog.js'
import { allMissions, getMission, missionIds } from './missions.js'

describe('mission library', () => {
  const missions = allMissions()

  it('has three missions for each person, with unique ids', () => {
    for (const person of Object.keys(PEOPLE)) expect(missionIds(person)).toHaveLength(3)
    expect(new Set(missions.map((m) => m.id)).size).toBe(missions.length)
  })

  it('uses ids that are safe as audio file names', () => {
    for (const { id } of missions) expect(id).toMatch(/^[a-z]+(-[a-z]+)*$/)
  })

  describe.each(missions.map((m) => [m.id, m]))('%s', (_id, { person, id }) => {
    it.each(Object.keys(DIALECTS))('is complete in %s', (dialect) => {
      const mission = getMission(person, dialect, id)
      expect(mission.lines.map((l) => l.from)).toEqual(['you', 'them', 'you'])
      for (const line of mission.lines) {
        expect(line.say.trim()).not.toBe('')
        expect(line.zh.trim()).not.toBe('')
        expect(line.en.trim()).not.toBe('')
      }
      expect(mission.tips.length).toBeGreaterThanOrEqual(2)
      expect(mission.title).not.toContain('{')
      expect(mission.challenge).not.toContain('{')
    })
  })

  it('lists the next two missions as upcoming, wrapping round at the end', () => {
    const [first, second, third] = missionIds('hawker').map((id) => getMission('hawker', 'hokkien', id))
    expect(first.upcoming).toEqual([second.title, third.title])
    expect(third.upcoming).toEqual([first.title, second.title])
  })

  it('falls back to the first mission for an unknown or missing id', () => {
    const first = getMission('hawker', 'hokkien', missionIds('hawker')[0])
    expect(getMission('hawker', 'hokkien').title).toBe(first.title)
    expect(getMission('hawker', 'hokkien', 'nope').title).toBe(first.title)
  })
})
