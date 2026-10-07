// The rest of the mission library. Each person has three missions that run in order, one per day
// you complete (see todaysMissionId in lib/logic.js). The first mission for each person lives in
// missions.js; these follow it.
//
// DRAFT CONTENT: like the first missions, these phrases must be checked by native speakers before
// real use (the Teochew most of all). Lines go you → them → you. `say` is a Singapore-style
// "say it like" spelling, not a formal romanisation; `zh` uses simplified characters.

export const MORE_MISSIONS = {
  grandparents: [
    {
      id: 'praise-cooking',
      title: 'Tell Ah Ma her cooking is delicious',
      partner: 'Ah Ma',
      partnerRef: 'Ah Ma',
      minutes: 3,
      scenario: 'After a home-cooked meal, tell Ah Ma how good it was.',
      challenge: 'Tell Ah Ma in {dialect} after her next home-cooked meal.',
      culture:
        'Many grandmothers show love through food, so praising her cooking lands harder than any “thank you”.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Ma, jin ho jiak!', zh: '阿嬷，真好食！', en: 'Ah Ma, so delicious!' },
          { from: 'them', say: 'Ho jiak jiu jiak ka ze!', zh: '好食就食较济！', en: 'If it’s good, eat more!' },
          { from: 'you', say: 'Wa jiak ba liao, kam siah!', zh: '我食饱了，感谢！', en: 'I’m full, thank you!' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Ma, ho jiak ho jiak!', zh: '阿嬷，好食好食！', en: 'Ah Ma, so delicious!' },
          { from: 'them', say: 'Jiak ze di, jiak ze di!', zh: '食济滴，食济滴！', en: 'Eat a bit more, eat a bit more!' },
          { from: 'you', say: 'Wa jiak ba liao, do sia!', zh: '我食饱了，多谢！', en: 'I’m full, thank you!' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Ma, hou sik a!', zh: '阿嫲，好食呀！', en: 'Ah Ma, so delicious!' },
          { from: 'them', say: 'Sik do di la!', zh: '食多啲啦！', en: 'Eat a bit more!' },
          { from: 'you', say: 'Ngo sik baau la, do ze!', zh: '我食饱喇，多谢！', en: 'I’m full, thank you!' },
        ],
      },
      tips: {
        hokkien: [
          'Stretch “jin” a little. The warmth is in that word.',
          'Say “kam siah” softly, with a smile.',
        ],
        teochew: [
          'Say “ho jiak” twice. Repeating it is how elders show enthusiasm.',
          'End on “do sia” with a smile.',
        ],
        cantonese: [
          '“Hou” rises, then “sik” drops short. Keep “sik” crisp.',
          '“Baau” is long and open. Don’t clip it.',
        ],
      },
    },
    {
      id: 'kampung-days',
      title: 'Ask Ah Gong about his kampung days',
      partner: 'Ah Gong',
      partnerRef: 'Ah Gong',
      minutes: 3,
      scenario: 'Sit with Ah Gong and ask what life was like back in the kampung.',
      challenge: 'Ask Ah Gong in {dialect} about the kampung the next time you sit together.',
      culture:
        'Many elders love being asked about the past. One question about the kampung can become a whole afternoon of stories, told in dialect.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Gong, kampung ho bo?', zh: '阿公，甘榜好无？', en: 'Ah Gong, was kampung life good?' },
          { from: 'them', say: 'Ho ah! Gua kong hor li thia!', zh: '好啊！我讲乎你听！', en: 'It was! Let me tell you!' },
          { from: 'you', say: 'Wa beh thia!', zh: '我要听！', en: 'I want to hear!' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Gong, kampung ho bo?', zh: '阿公，甘榜好无？', en: 'Ah Gong, was kampung life good?' },
          { from: 'them', say: 'Ho ho! Gua kong leu thia!', zh: '好好！我讲汝听！', en: 'Good! I’ll tell you!' },
          { from: 'you', say: 'Wa ai thia!', zh: '我爱听！', en: 'I’d love to hear!' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Gung, gam bong gei ho ma?', zh: '阿公，甘榜几好嘛？', en: 'Ah Gong, was kampung life good?' },
          { from: 'them', say: 'Ho a! Ngo gong bei nei teng!', zh: '好呀！我讲俾你听！', en: 'It was! Let me tell you!' },
          { from: 'you', say: 'Ngo seung teng!', zh: '我想听！', en: 'I want to hear!' },
        ],
      },
      tips: {
        hokkien: [
          '“Ho bo” is a light question. Lift the end slightly.',
          '“Thia” means “listen”. Say it eagerly and he’ll keep going.',
        ],
        teochew: ['Keep “ho bo” light and relaxed.', 'Lean in when you say “ai thia”. Body language helps.'],
        cantonese: [
          '“Teng” is low and short. Don’t stretch it.',
          '“Seung” rises. It sounds eager, which is the point.',
        ],
      },
    },
  ],

  hawker: [
    {
      id: 'whats-good',
      title: 'Ask the uncle what’s good today',
      partner: 'Stall uncle',
      partnerRef: 'the stall uncle',
      minutes: 3,
      scenario: 'At the hawker centre, ask the stall uncle what he recommends today.',
      challenge: 'Ask a stall uncle in {dialect} what’s good today.',
      culture:
        'Hawkers are proud of their food, and asking for a recommendation is a compliment. You might get a bigger portion, or at least a smile.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Towkay, kin na jit si mi ho jiak?', zh: '头家，今仔日什么好食？', en: 'Boss, what’s good today?' },
          { from: 'them', say: 'Chit ge ho jiak!', zh: '这个好食！', en: 'This one is good!' },
          { from: 'you', say: 'Ho, wa beh chit ge!', zh: '好，我要这个！', en: 'Okay, I’ll take this one!' },
        ],
        teochew: [
          { from: 'you', say: 'Tau keh, gim jik si mih ho jiak?', zh: '头家，今日什么好食？', en: 'Boss, what’s good today?' },
          { from: 'them', say: 'Ze ge ho jiak!', zh: '这个好食！', en: 'This one is good!' },
          { from: 'you', say: 'Ho, wa ai ze ge!', zh: '好，我爱这个！', en: 'Okay, I’ll have this one!' },
        ],
        cantonese: [
          { from: 'you', say: 'Lo ban, gam yat mat ye hou sik a?', zh: '老板，今日乜嘢好食呀？', en: 'Boss, what’s good today?' },
          { from: 'them', say: 'Ni go hou sik!', zh: '呢个好食！', en: 'This one is good!' },
          { from: 'you', say: 'Hou, ngo yiu ni go, m goi!', zh: '好，我要呢个，唔该！', en: 'Okay, I’ll take this one, please!' },
        ],
      },
      tips: {
        hokkien: [
          '“Si mi” means “what”. Keep it short and curious.',
          'Point as you say “chit ge”. Nobody minds, and it always works.',
        ],
        teochew: ['“Si mih” is “what”. Keep it light.', 'Smile on “ho”. It carries the friendliness.'],
        cantonese: [
          '“Mat ye” runs together quickly, almost “mat-yeh”.',
          'End with “m goi” softly. It’s what makes it polite.',
        ],
      },
    },
    {
      id: 'return-tray',
      title: 'Thank the auntie who clears your tray',
      partner: 'Tray auntie',
      partnerRef: 'the auntie clearing trays',
      minutes: 3,
      scenario: 'When you return your tray, thank the auntie who clears the tables.',
      challenge: 'Thank the tray auntie in {dialect} next time you return your tray.',
      culture:
        'Cleaners at hawker centres hear mostly English and Mandarin. A thank-you in dialect from a young person is a rare and welcome surprise.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Yi, kam siah!', zh: '阿姨，感谢！', en: 'Auntie, thank you!' },
          { from: 'them', say: 'Bo iau kin lah!', zh: '无要紧啦！', en: 'No problem!' },
          { from: 'you', say: 'Ah Yi, jiak ba oh!', zh: '阿姨，食饱哦！', en: 'Auntie, remember to eat!' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Yi, do sia!', zh: '阿姨，多谢！', en: 'Auntie, thank you!' },
          { from: 'them', say: 'Bo iau kin!', zh: '无要紧！', en: 'No problem!' },
          { from: 'you', say: 'Ah Yi, jiak ba bue?', zh: '阿姨，食饱未？', en: 'Auntie, have you eaten?' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Yi, m goi saai!', zh: '阿姨，唔该晒！', en: 'Auntie, thanks a lot!' },
          { from: 'them', say: 'M sai haak hei!', zh: '唔使客气！', en: 'Don’t mention it!' },
          { from: 'you', say: 'Ah Yi, sik jor fan mei a?', zh: '阿姨，食咗饭未呀？', en: 'Auntie, have you eaten?' },
        ],
      },
      tips: {
        hokkien: ['Say “kam siah” warmly, not fast. She hears a lot of rushed thanks.', 'A small nod with it goes a long way.'],
        teochew: ['Let “do sia” fall gently at the end.', 'Smile first, then speak.'],
        cantonese: [
          'Make “saai” long and friendly.',
          '“Mei a” lifts at the end. It’s a real question, not a greeting only.',
        ],
      },
    },
  ],

  relatives: [
    {
      id: 'busy-lately',
      title: 'Tell your uncle what you’ve been busy with',
      partner: 'Uncle',
      partnerRef: 'your uncle',
      minutes: 3,
      scenario: 'When a relative asks what you’ve been up to, answer in dialect.',
      challenge: 'Tell an uncle or auntie in {dialect} what you’ve been busy with.',
      culture:
        'Relatives always ask what you’re busy with. Answering in dialect, even one line, turns an interview into a conversation.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Pek, wa jin bo eng!', zh: '阿伯，我真无闲！', en: 'Uncle, I’m really busy!' },
          { from: 'them', say: 'Bo eng si mi?', zh: '无闲什么？', en: 'Busy with what?' },
          { from: 'you', say: 'Wa teh cho kang lah.', zh: '我咧做工啦。', en: 'I’m working lah.' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Peh, wa ho bo eng!', zh: '阿伯，我好无闲！', en: 'Uncle, I’m so busy!' },
          { from: 'them', say: 'Bo eng si mih?', zh: '无闲什么？', en: 'Busy with what?' },
          { from: 'you', say: 'Wa teh cho kang.', zh: '我咧做工。', en: 'I’m working.' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Suk, ngo hou mong a!', zh: '阿叔，我好忙呀！', en: 'Uncle, I’m so busy!' },
          { from: 'them', say: 'Mong mat ye a?', zh: '忙乜嘢呀？', en: 'Busy with what?' },
          { from: 'you', say: 'Ngo jou gan ye la.', zh: '我做紧嘢啦。', en: 'I’m working lah.' },
        ],
      },
      tips: {
        hokkien: ['Stress “jin” so he hears how busy you really are.', 'Finish with a laugh on “lah”. It keeps it light.'],
        teochew: ['Keep “bo eng” short, with a little sigh in it.', 'Say “cho kang” plainly. It’s just the job.'],
        cantonese: ['“Mong” is a long open sound.', 'Keep “gan” soft, almost swallowed.'],
      },
    },
    {
      id: 'good-health',
      title: 'Wish the whole table good health',
      partner: 'The whole table',
      partnerRef: 'the whole table',
      minutes: 3,
      scenario: 'Raise a glass or a cup at the next family dinner and wish everyone well.',
      challenge: 'Wish the table good health in {dialect} at your next family dinner.',
      culture:
        'A toast is short, everyone repeats it, and nobody expects perfect pronunciation. It’s the gentlest first line to try in front of the whole family.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Sin-che kiang-khang!', zh: '身体健康！', en: 'Good health to everyone!' },
          { from: 'them', say: 'Kiang-khang! Kiang-khang!', zh: '健康！健康！', en: 'Good health! Good health!' },
          { from: 'you', say: 'Yam seng!', zh: '饮胜！', en: 'Cheers!' },
        ],
        teochew: [
          { from: 'you', say: 'Sin-ti kiang-khang!', zh: '身体健康！', en: 'Good health to everyone!' },
          { from: 'them', say: 'Kiang-khang! Kiang-khang!', zh: '健康！健康！', en: 'Good health! Good health!' },
          { from: 'you', say: 'Yam seng!', zh: '饮胜！', en: 'Cheers!' },
        ],
        cantonese: [
          { from: 'you', say: 'San tai gin hong!', zh: '身体健康！', en: 'Good health to everyone!' },
          { from: 'them', say: 'Gin hong! Gin hong!', zh: '健康！健康！', en: 'Good health! Good health!' },
          { from: 'you', say: 'Yam sing!', zh: '饮胜！', en: 'Cheers!' },
        ],
      },
      tips: {
        hokkien: ['Say it slowly and clearly. A toast is meant to be heard across the table.', 'Lift your glass on “yam seng”.'],
        teochew: ['Pause before “kiang-khang” so everyone turns to you.', 'Lift your glass on “yam seng”.'],
        cantonese: ['Each syllable of “san tai gin hong” gets equal weight.', 'Lift your glass on “yam sing”.'],
      },
    },
  ],

  neighbours: [
    {
      id: 'good-morning',
      title: 'Say good morning at the lift lobby',
      partner: 'Neighbour',
      partnerRef: 'your neighbour',
      minutes: 3,
      scenario: 'In the lift lobby or corridor, greet a neighbour you usually just nod at.',
      challenge: 'Greet a neighbour in {dialect} in the lift lobby or corridor.',
      culture:
        'Most neighbours in a block nod and say nothing. A greeting in dialect is often remembered for weeks, and “have you eaten?” is a greeting, not a real question.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Pek, gau cha!', zh: '阿伯，够早！', en: 'Uncle, you’re up early!' },
          { from: 'them', say: 'Gau cha! Li ma gau cha!', zh: '够早！你嘛够早！', en: 'Early! You’re early too!' },
          { from: 'you', say: 'Jiak ba buay?', zh: '食饱未？', en: 'Have you eaten?' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Peh, gau za!', zh: '阿伯，够早！', en: 'Uncle, you’re up early!' },
          { from: 'them', say: 'Gau za, gau za!', zh: '够早，够早！', en: 'Early, early!' },
          { from: 'you', say: 'Jiak ba bue?', zh: '食饱未？', en: 'Have you eaten?' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Pak, jou san!', zh: '阿伯，早晨！', en: 'Uncle, good morning!' },
          { from: 'them', say: 'Jou san! Nei dou hou jou a!', zh: '早晨！你都好早呀！', en: 'Morning! You’re early too!' },
          { from: 'you', say: 'Sik jor fan mei a?', zh: '食咗饭未呀？', en: 'Have you eaten?' },
        ],
      },
      tips: {
        hokkien: ['Make “gau cha” bright and quick, like a wave with your voice.', 'Say it before the lift arrives, not during the awkward silence.'],
        teochew: ['Keep “gau za” short and cheerful.', 'Say it with eye contact if you can.'],
        cantonese: ['“Jou” rises and “san” falls, like a little bow.', 'Say it loud enough to be heard over the lift.'],
      },
    },
    {
      id: 'where-heading',
      title: 'Ask where Uncle is heading',
      partner: 'Uncle next door',
      partnerRef: 'the uncle next door',
      minutes: 3,
      scenario: 'Catch Uncle at the void deck or lift and ask where he’s off to.',
      challenge: 'Ask a neighbour in {dialect} where he’s heading.',
      culture:
        'Asking “where are you going?” isn’t nosy in a block that still feels like a kampung. It’s how neighbours say hello, and elders often answer with a whole story.',
      lines: {
        hokkien: [
          { from: 'you', say: 'Ah Pek, beh khi to ui?', zh: '阿伯，要去倒位？', en: 'Uncle, where are you heading?' },
          { from: 'them', say: 'Khi lim kopi lah!', zh: '去啉咖啡啦！', en: 'Going for kopi!' },
          { from: 'you', say: 'Ho lah, sio sim oh!', zh: '好啦，小心哦！', en: 'Okay, take care!' },
        ],
        teochew: [
          { from: 'you', say: 'Ah Peh, ai khi to ui?', zh: '阿伯，爱去倒位？', en: 'Uncle, where are you heading?' },
          { from: 'them', say: 'Khi lim kopi!', zh: '去啉咖啡！', en: 'Going for kopi!' },
          { from: 'you', say: 'Ho lah, sio sim oh!', zh: '好啦，小心哦！', en: 'Okay, take care!' },
        ],
        cantonese: [
          { from: 'you', say: 'Ah Pak, heoi bin dou a?', zh: '阿伯，去边度呀？', en: 'Uncle, where are you heading?' },
          { from: 'them', say: 'Heoi yam ga fe la!', zh: '去饮咖啡啦！', en: 'Going for kopi!' },
          { from: 'you', say: 'Hou a, siu sam di a!', zh: '好呀，小心啲呀！', en: 'Okay, take care!' },
        ],
      },
      tips: {
        hokkien: ['Say “to ui” lightly, like you’re just curious.', 'Let “sio sim oh” trail off kindly.'],
        teochew: ['Keep the question light. You’re chatting, not interrogating.', 'Smile on “sio sim”.'],
        cantonese: ['“Bin dou” flows together: “bin-dou”.', '“Siu sam” is a caring send-off. Say it gently.'],
      },
    },
  ],
}
