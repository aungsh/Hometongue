import Link from 'next/link'
import { useEffect } from 'react'
import { ChevronRight, Flame, Share2, X } from 'lucide-react'
import { useNavigate } from '@/lib/useNavigate.js'
import { useApp } from '../../state/AppState.jsx'
import { OUTCOME_CATEGORY } from '@/data/coach.js'
import { shareOrCopy, shareText } from '@/lib/share.js'
import { useCoachReply } from '@/lib/useCoachApi.js'
import { computeStreak, isRealConversation, questProgress, weekSummary } from '../../lib/logic.js'
import { DIALECTS, PEOPLE, QUESTS } from '../../data/catalog.js'
import { getMission } from '../../data/missions.js'
import CoachSay from '../../components/CoachSay.jsx'
import Meter from '../../components/Meter.jsx'
import Scene from '../../components/Scene.jsx'
import Tile, { Seal } from '../../components/Tile.jsx'

const MESSAGES = {
  natural: {
    seal: '棒',
    title: 'That’s a real conversation!',
    body: (mission, dialect) => `You spoke ${dialect} with ${mission.partnerRef}. That’s exactly how speaking starts.`,
  },
  awkward: {
    seal: '勇',
    title: 'Awkward still counts!',
    body: () => 'Every confident speaker started out awkward. You said it out loud, to a real person.',
  },
  forgot: {
    seal: '忘',
    title: 'Blanking happens to everyone',
    body: () => 'Your pocket card is waiting in the mission. Take a peek right before you try again.',
  },
  'no-chance': {
    seal: '等',
    title: 'No chance yet? No problem.',
    body: () => 'Your mission stays open. When the moment comes, you’ll be ready.',
  },
}

// Falling tiles for a real conversation: winds, dragons and lucky characters.
const FALLING = ['中', '发', '福', '东', '南', '西', '北', '喜', '一', '春', '话', '好'].map((glyph, i) => ({
  glyph,
  left: `${(i * 37 + 5) % 96}%`,
  delay: `${(i * 113) % 900}ms`,
  spin: `${((i * 47) % 70) - 35}deg`,
  tone: ['red', 'jade', 'blue'][i % 3],
}))

export default function Done() {
  const navigate = useNavigate()
  const { state, showToast } = useApp()
  const last = state.history.at(-1)

  useEffect(() => {
    if (!last) navigate('/today', { replace: true })
  }, [last])

  // The AI coach reacts to this check-in (and the note) when the server has her set up;
  // until she answers, or if she can't, the scripted line below is used.
  const coach = useCoachReply(last?.id, (status) => ({
    kind: 'reflect',
    dialect: last.dialect,
    person: last.person,
    missionId: last.missionId,
    outcome: last.outcome,
    note: last.note,
    streak: computeStreak(state.history, new Date()),
    total: state.history.filter((h) => isRealConversation(h.outcome)).length,
    voice: state.coachVoiceOn && status.voice,
  }))
  if (!last) return null

  const now = new Date()
  const mission = getMission(last.person, last.dialect, last.missionId)
  const real = isRealConversation(last.outcome)
  const message = MESSAGES[last.outcome]
  const total = state.history.filter((h) => isRealConversation(h.outcome)).length
  const streak = computeStreak(state.history, now)
  const quests = questProgress(QUESTS, weekSummary(state.history, state.practices, now))
  const quest = quests.find((q) => q.metric === (real ? 'conversations' : 'checkInDays'))
  const motion = real ? 'jump' : 'bob'

  const share = async () => {
    const result = await shareOrCopy({
      text: shareText({
        dialectName: DIALECTS[last.dialect].name,
        partnerRef: mission.partnerRef,
        total,
        streak,
      }),
      url: window.location.origin,
    })
    if (result === 'copied') showToast('Copied. Paste it to a friend!')
    if (result === 'failed') showToast('Couldn’t share from this browser')
  }

  return (
    <div className="screen screen--done" data-dialect={last.dialect}>
      {real && (
        <div className="tile-rain" aria-hidden="true">
          {FALLING.map((tile) => (
            <span key={tile.glyph} style={{ left: tile.left, animationDelay: tile.delay, '--spin': tile.spin }}>
              <Tile glyph={tile.glyph} size="sm" tone={tile.tone} />
            </span>
          ))}
        </div>
      )}
      <header className="done-head">
        <button type="button" className="icon-btn" onClick={() => navigate('/today')} aria-label="Close">
          <X size={22} aria-hidden="true" />
        </button>
      </header>

      <main className="celebrate">
        <Scene
          art="burst"
          height={170}
          className="done-scene"
          cast={[
            { sprite: 'you', motion, at: '30%' },
            { sprite: PEOPLE[last.person].sprite, motion, at: '56%', flip: true, delay: '120ms' },
          ]}
        >
          <Seal glyph={message.seal} className="done-scene__seal" />
        </Scene>
        <h1 className="title">{message.title}</h1>
        <p className="lead">{message.body(mission, DIALECTS[last.dialect].name)}</p>
        <p className="celebrate__badge">{real ? '+1 real conversation' : 'Check-in saved · streak kept'}</p>

        <CoachSay
          category={OUTCOME_CATEGORY[last.outcome]}
          seed={last.id}
          live={coach.reply}
          pending={coach.pending}
          autoPlay
          className="coach--done"
        />

        <div className="tiles">
          <div className="tile tile-card">
            <span className="tile__label">Real conversations</span>
            <span className="tile__value">{total}</span>
          </div>
          <div className="tile tile-card">
            <span className="tile__label">Day streak</span>
            <span className="tile__value">
              <Flame size={22} aria-hidden="true" />
              {streak}
            </span>
          </div>
        </div>

        {quest && (
          <Link href="/quests" className="quest-nudge tile-card">
            <span className="quest-nudge__row">
              <span>
                <span className="eyebrow">Weekly quest</span>
                <span className="quest-nudge__title">{quest.title}</span>
              </span>
              <span className="quest-nudge__count">
                {quest.done ? 'Done!' : `${quest.value}/${quest.target}`}
                <ChevronRight size={16} aria-hidden="true" />
              </span>
            </span>
            <Meter value={quest.value} max={quest.target} label={quest.title} tone={quest.done ? 'success' : undefined} />
          </Link>
        )}
      </main>

      <div className="cta-bar">
        <button type="button" className="btn btn--primary btn--block" onClick={() => navigate('/progress')}>
          See my progress
        </button>
        {real && (
          <button type="button" className="btn btn--secondary btn--block" onClick={share}>
            <Share2 size={18} aria-hidden="true" />
            Share this
          </button>
        )}
        <button type="button" className="btn btn--ghost btn--block" onClick={() => navigate('/mission')}>
          Back to mission
        </button>
      </div>
    </div>
  )
}
