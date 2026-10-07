import { DIALECTS } from './catalog.js'

// One daily mission per person, each a three-line mini conversation in every dialect.
//
// PROTOTYPE CONTENT: these phrases were drafted for demo purposes and must be
// checked by native speakers before real use (the Teochew most of all).
// `say` is a Singapore-style "say it like" spelling, not a formal romanisation;
// `zh` uses simplified characters; `from` is 'you' or 'them'.

const MISSIONS = {
  grandparents: {
    id: 'ask-eaten',
    title: 'Ask Ah Ma if she’s eaten',
    partner: 'Ah Ma',
    partnerRef: 'Ah Ma',
    minutes: 3,
    scenario: 'Next visit or video call, open with the classic family greeting.',
    challenge: 'Ask Ah Ma in {dialect} the next time you visit or call.',
    culture: 'For many elders, “Have you eaten?” isn’t really about food. It’s how families say “I care about you.”',
    upcoming: ['Tell Ah Ma her cooking is delicious', 'Ask Ah Gong about his kampung days'],
    lines: {
      hokkien: [
        { from: 'you', say: 'Ah Ma, jiak ba buay?', zh: '阿嬷，食饱未？', en: 'Ah Ma, have you eaten?' },
        { from: 'them', say: 'Jiak ba liao! Li leh?', zh: '食饱了！你咧？', en: 'I’ve eaten! And you?' },
        { from: 'you', say: 'Wa ma jiak ba liao.', zh: '我嘛食饱了。', en: 'I’ve eaten too.' },
      ],
      teochew: [
        { from: 'you', say: 'Ah Ma, jiak ba bue?', zh: '阿嬷，食饱未？', en: 'Ah Ma, have you eaten?' },
        { from: 'them', say: 'Jiak ba liao, leu jiak bue?', zh: '食饱了，汝食未？', en: 'I’ve eaten. Have you?' },
        { from: 'you', say: 'Wa jiak ba liao!', zh: '我食饱了！', en: 'I’ve eaten!' },
      ],
      cantonese: [
        { from: 'you', say: 'Ah Ma, sik jor fan mei ah?', zh: '阿嫲，食咗饭未呀？', en: 'Ah Ma, have you eaten?' },
        { from: 'them', say: 'Sik jor la! Nei ne?', zh: '食咗喇！你呢？', en: 'I’ve eaten! And you?' },
        { from: 'you', say: 'Ngo dou sik jor la.', zh: '我都食咗喇。', en: 'I’ve eaten too.' },
      ],
    },
    tips: {
      hokkien: [
        'Keep “jiak” short and clipped. It ends with a quick catch in your throat.',
        'No need to rush “ba buay”. A relaxed pace sounds more natural.',
      ],
      teochew: [
        'Keep “jiak” short and clipped.',
        'Teochew is melodic. Let your voice rise and fall instead of saying it flat.',
      ],
      cantonese: [
        '“Sik” ends in a silent k. Close it off without releasing the sound.',
        'Keep “mei” low and level, then let “ah” soften the question.',
      ],
    },
  },

  hawker: {
    id: 'order-kopi',
    title: 'Order your kopi in {dialect}',
    partner: 'Kopi uncle',
    partnerRef: 'the kopi uncle',
    minutes: 3,
    scenario: 'At your usual kopitiam or drinks stall, place your order in dialect.',
    challenge: 'Place your next drinks order in {dialect} at any kopitiam.',
    culture: 'Kopitiam lingo is already a mix: “kopi” is from Malay, while “O” (black) and “peng” (ice) come from Hokkien. You’re halfway there.',
    upcoming: ['Ask the uncle what’s good today', 'Say thank you when you return your tray'],
    lines: {
      hokkien: [
        { from: 'you', say: 'Towkay, kopi-O peng chit pue!', zh: '头家，咖啡乌冰一杯！', en: 'Boss, one iced kopi-O!' },
        { from: 'them', say: 'Chit kor lak.', zh: '一箍六。', en: 'That’s $1.60.' },
        { from: 'you', say: 'Kam siah!', zh: '感谢！', en: 'Thank you!' },
      ],
      teochew: [
        { from: 'you', say: 'Tau keh, kopi-O peng jek bue!', zh: '头家，咖啡乌冰一杯！', en: 'Boss, one iced kopi-O!' },
        { from: 'them', say: 'Ho, ho!', zh: '好，好！', en: 'Sure, sure!' },
        { from: 'you', say: 'Do sia!', zh: '多谢！', en: 'Thank you!' },
      ],
      cantonese: [
        { from: 'you', say: 'Lo ban, kopi-O peng yat bui, m goi!', zh: '老板，咖啡乌冰一杯，唔该！', en: 'Boss, one iced kopi-O, please!' },
        { from: 'them', say: 'Yat man luk.', zh: '一蚊六。', en: 'That’s $1.60.' },
        { from: 'you', say: 'M goi saai!', zh: '唔该晒！', en: 'Thanks a lot!' },
      ],
    },
    tips: {
      hokkien: [
        'Pause for a beat after “Towkay” so they look up first.',
        '“Kam siah” works for any thank-you, and a smile helps it land.',
      ],
      teochew: [
        'Pause for a beat after “Tau keh” so they look up first.',
        '“Do sia” is your all-purpose thank you.',
      ],
      cantonese: [
        'Start “m” low, then lift “goi” high and level.',
        'Keep “yat” short and crisp. It means “one”.',
      ],
    },
  },

  relatives: {
    id: 'ask-how-been',
    title: 'Ask an auntie how she’s been',
    partner: 'Auntie',
    partnerRef: 'your auntie',
    minutes: 3,
    scenario: 'At the next family dinner, swap the English small talk for one line in dialect.',
    challenge: 'Try it on an auntie or uncle at your next family gathering.',
    culture: 'Relatives often switch to English or Mandarin for you. Starting in dialect tells them it’s okay to stay in it.',
    upcoming: ['Tell your relatives what you’ve been busy with', 'Wish everyone good health at the next gathering'],
    lines: {
      hokkien: [
        { from: 'you', say: 'Ah Yee, li ho bo?', zh: '阿姨，你好无？', en: 'Auntie, how are you?' },
        { from: 'them', say: 'Ho ah! Li leh?', zh: '好啊！你咧？', en: 'Good! And you?' },
        { from: 'you', say: 'Wa ma ho, jin bo eng.', zh: '我嘛好，真无闲。', en: 'I’m good too, just really busy.' },
      ],
      teochew: [
        { from: 'you', say: 'Ah Yi, leu ho bo?', zh: '阿姨，汝好无？', en: 'Auntie, how are you?' },
        { from: 'them', say: 'Ho, ho! Leu ho bo?', zh: '好，好！汝好无？', en: 'Good, good! How about you?' },
        { from: 'you', say: 'Wa ho, do sia Ah Yi!', zh: '我好，多谢阿姨！', en: 'I’m good, thanks Auntie!' },
      ],
      cantonese: [
        { from: 'you', say: 'Ah Yi, nei gei ho ma?', zh: '阿姨，你几好嘛？', en: 'Auntie, are you keeping well?' },
        { from: 'them', say: 'Gei ho ah! Nei ne?', zh: '几好呀！你呢？', en: 'Pretty good! And you?' },
        { from: 'you', say: 'Ngo dou gei ho, bat gwo ho mong.', zh: '我都几好，不过好忙。', en: 'I’m good too, just busy.' },
      ],
    },
    tips: {
      hokkien: [
        'Keep “li ho bo” light, like a casual “how are you ah?”',
        '“Bo eng” means busy. Handy for explaining why you haven’t visited!',
      ],
      teochew: ['“Leu” is short and relaxed. Don’t stretch it.', 'Smile on “do sia”. It carries the warmth.'],
      cantonese: [
        'Both “gei” and “ho” rise. That lift makes it sound caring.',
        'Keep “ma” light at the end. It softens the question.',
      ],
    },
  },

  neighbours: {
    id: 'weather-chat',
    title: 'Small talk about the heat',
    partner: 'Uncle next door',
    partnerRef: 'the uncle next door',
    minutes: 3,
    scenario: 'At the void deck, lift lobby or wet market, start with everyone’s favourite topic: the weather.',
    challenge: 'Use it on a neighbour at the void deck, lift lobby or market.',
    culture: 'Small talk with neighbours keeps the kampung spirit alive, and elders are often happy to chat back.',
    upcoming: ['Say good morning at the lift lobby', 'Ask where Uncle is heading today'],
    lines: {
      hokkien: [
        { from: 'you', say: 'Ah Pek, kin na jit jin juah!', zh: '阿伯，今仔日真热！', en: 'Uncle, it’s so hot today!' },
        { from: 'them', say: 'Tioh ah, juah si lang!', zh: '着啊，热死人！', en: 'Yeah, it’s deadly hot!' },
        { from: 'you', say: 'Ai lim ka ze zui oh!', zh: '爱啉较济水哦！', en: 'Remember to drink more water!' },
      ],
      teochew: [
        { from: 'you', say: 'Ah Peh, gim jik ho juah!', zh: '阿伯，今日好热！', en: 'Uncle, it’s so hot today!' },
        { from: 'them', say: 'Ho juah, ho juah!', zh: '好热，好热！', en: 'So hot, so hot!' },
        { from: 'you', say: 'Ai jiak zui oh!', zh: '爱食水哦！', en: 'Remember to drink water!' },
      ],
      cantonese: [
        { from: 'you', say: 'Ah Pak, gam yat ho yit ah!', zh: '阿伯，今日好热呀！', en: 'Uncle, it’s so hot today!' },
        { from: 'them', say: 'Hai ah, yit dou sei!', zh: '系呀，热到死！', en: 'Yeah, it’s deadly hot!' },
        { from: 'you', say: 'Gei dak yam do di seui ah!', zh: '记得饮多啲水呀！', en: 'Remember to drink more water!' },
      ],
    },
    tips: {
      hokkien: [
        '“Juah” is clipped short. Cut it off with a little catch.',
        '“Ka ze” means “more”, useful everywhere from kopi to rice.',
      ],
      teochew: ['Keep “juah” short with a crisp ending.', 'Let “ho juah” sing a little. Teochew loves a melody.'],
      cantonese: [
        '“Yit” ends in a silent t. Stop it with your tongue, don’t release it.',
        '“Do di” means “a bit more”, handy for food, water, everything.',
      ],
    },
  },
}

const fill = (text, dialect) => text.replaceAll('{dialect}', DIALECTS[dialect].name)

/** The mission for a person, resolved for one dialect. */
export function getMission(person, dialect) {
  const mission = MISSIONS[person]
  return {
    ...mission,
    title: fill(mission.title, dialect),
    challenge: fill(mission.challenge, dialect),
    lines: mission.lines[dialect],
    tips: mission.tips[dialect],
  }
}
