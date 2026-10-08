// Static reference data for the prototype. Change names and copy here.

export const APP_NAME = 'Hometongue'

export const DIALECTS = {
  hokkien: {
    id: 'hokkien',
    name: 'Hokkien',
    zh: '福建话',
    lang: 'nan-Hans',
    blurb: 'Kopitiams, markets and getai',
    sample: 'Jiak ba buay?',
  },
  teochew: {
    id: 'teochew',
    name: 'Teochew',
    zh: '潮州话',
    lang: 'nan-Hans',
    blurb: 'Teochew muay, opera and wet markets',
    sample: 'Jiak ba bue?',
  },
  cantonese: {
    id: 'cantonese',
    name: 'Cantonese',
    zh: '廣東話',
    lang: 'yue-Hant',
    blurb: 'Chinatown, dim sum and TVB dramas',
    sample: 'Sik jor fan mei ah?',
  },
}

export const PEOPLE = {
  grandparents: { id: 'grandparents', name: 'Ah Ma & Ah Gong', detail: 'Grandparents', sprite: 'ahma' },
  hawker: { id: 'hawker', name: 'Hawker uncles & aunties', detail: 'Kopitiam and hawker centre', sprite: 'uncle' },
  relatives: { id: 'relatives', name: 'Relatives', detail: 'Family dinners and gatherings', sprite: 'auntie' },
  neighbours: { id: 'neighbours', name: 'Neighbours', detail: 'Void deck, lift lobby, wet market', sprite: 'neighbour' },
}

// Natural and awkward count as real conversations (see lib/logic.js).
export const OUTCOMES = [
  { id: 'natural', label: 'Natural', glyph: '顺', detail: 'It flowed. We actually talked!' },
  { id: 'awkward', label: 'Awkward', glyph: '尬', detail: 'I said it… it felt a bit weird.' },
  { id: 'forgot', label: 'Forgot phrase', glyph: '忘', detail: 'My mind went blank.' },
  { id: 'no-chance', label: 'No opportunity', glyph: '等', detail: 'Didn’t get the chance yet.' },
]

export const outcomeById = (id) => OUTCOMES.find((o) => o.id === id)

export const WHEN_OPTIONS = [
  { id: 'today', label: 'Later today' },
  { id: 'weekend', label: 'This weekend' },
  { id: 'next-time', label: 'Next time I see them' },
]

// The passive → active journey, by number of real conversations.
export const STAGES = [
  { min: 0, glyph: '听', name: 'Listener', blurb: 'You understand more than you think.' },
  { min: 1, glyph: '说', name: 'First words', blurb: 'You’ve said it out loud to someone real.' },
  { min: 3, glyph: '聊', name: 'Conversation starter', blurb: 'Opening in dialect is starting to feel normal.' },
  { min: 7, glyph: '讲', name: 'Regular speaker', blurb: 'Dialect is part of your week now.' },
  { min: 15, glyph: '传', name: 'Dialect keeper', blurb: 'You’re keeping the language alive at home.' },
]

// `metric` refers to a field of weekSummary() in lib/logic.js.
export const QUESTS = [
  {
    id: 'talk-3',
    metric: 'conversations',
    target: 3,
    title: 'Have 3 real conversations',
    detail: 'Natural or awkward, both count.',
    glyph: '话',
    badgeName: 'Lantern',
  },
  {
    id: 'people-2',
    metric: 'people',
    target: 2,
    title: 'Talk with 2 different people',
    detail: 'Try your line on someone new.',
    glyph: '人',
    badgeName: 'Kampung spirit',
    link: { label: 'Switch who you’re talking to', to: '/setup' },
  },
  {
    id: 'practise-5',
    metric: 'practices',
    target: 5,
    title: 'Practise out loud 5 times',
    detail: 'Private takes in the app count.',
    glyph: '练',
    badgeName: 'Warm voice',
  },
  {
    id: 'checkin-4',
    metric: 'checkInDays',
    target: 4,
    title: 'Check in on 4 days',
    detail: 'Even “no opportunity” counts.',
    glyph: '日',
    badgeName: 'Steady flame',
  },
]

// The mission's four apps, opened in any order from the mission screen.
export const MISSION_APPS = [
  { id: 'learn', glyph: '学', name: 'Learn', sub: 'Phrasebook', blurb: 'Hear and read the conversation' },
  { id: 'practise', glyph: '练', name: 'Practise', sub: 'Mic studio', blurb: 'Say it out loud, privately' },
  { id: 'challenge', glyph: '讲', name: 'Challenge', sub: 'Pocket card', blurb: 'Take it into real life' },
  { id: 'reflect', glyph: '记', name: 'Reflect', sub: 'Diary', blurb: 'Note down how it went' },
]

export const appById = (id) => MISSION_APPS.find((app) => app.id === id)

// Monday to Sunday as written on calendars and mahjong-style tiles.
export const WEEKDAY_GLYPHS = ['一', '二', '三', '四', '五', '六', '日']
