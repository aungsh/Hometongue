// Hand-made pixel characters. One character per pixel, '.' is empty; the renderer adds
// a dark outline. Two frames each: walking, waving or tail-flicking.

const SKIN = '#f0c39b'
const CHEEK = '#ec9a8a'
const EYE = '#1f1814'
const HAIR = '#2b211d'
const GREY = '#c3bbb2'
const WHITE = '#fbf7ee'
const RED = '#c2352a'
const GOLD = '#e0ae3a'
const JADE = '#1e7b5c'
const BLUE = '#2f55b4'
const DENIM = '#3d5a99'
const DARK = '#3a3138'
const BROWN = '#7a5232'
const ORANGE = '#e07b39'
const ORANGE_DARK = '#b65a22'

const walkLegs = (legs, shoes) => [`..${legs.repeat(6)}..`, `..${legs}${legs}..${legs}${legs}..`, `.${legs}${legs}....${legs}${legs}.`, `.${shoes}${shoes}....${shoes}${shoes}.`]

const youTop = [
  '...hhhh...',
  '..hhhhhh..',
  '..hhhhhh..',
  '..hesseh..',
  '..cssssc..',
  '...ssss...',
  '..aaaaaa..',
  '.aaaaaaaa.',
  '.saaaaaas.',
  '..aaaaaa..',
]

const youLongTop = [
  '...hhhh...',
  '..hhhhhh..',
  '.hhhhhhhh.',
  '.hhessehh.',
  '.hcssssch.',
  '.h.ssss.h.',
  '.haaaaaah.',
  '.aaaaaaaa.',
  '.saaaaaas.',
  '..aaaaaa..',
]

const youLegs = ['..dddddd..', '..dd..dd..', '..dd..dd..', '..ww..ww..']

const youPalette = { h: HAIR, s: SKIN, e: EYE, c: CHEEK, a: 'var(--accent)', d: DENIM, w: WHITE }

export const SPRITES = {
  // The learner. The shirt takes the colour of the chosen dialect.
  you: {
    palette: youPalette,
    frames: [
      [...youTop, ...youLegs],
      [...youTop, ...walkLegs('d', 'w')],
    ],
  },
  youLong: {
    palette: youPalette,
    frames: [
      [...youLongTop, ...youLegs],
      [...youLongTop, ...walkLegs('d', 'w')],
    ],
  },

  ahma: {
    palette: { g: GREY, s: SKIN, e: EYE, c: CHEEK, r: RED, y: GOLD, p: DARK, n: BROWN },
    frames: [
      [
        '....gg....',
        '...gggg...',
        '..gggggg..',
        '..gesseg..',
        '..cssssc..',
        '...ssss...',
        '..rrrrrr..',
        '.rryrryrr.',
        '.srrrrrrs.',
        '..ryrryr..',
        '..pppppp..',
        '..pp..pp..',
        '..pp..pp..',
        '..nn..nn..',
      ],
      [
        '....gg....',
        '...gggg...',
        '..gggggg..',
        '..gesseg..',
        '..cssssc.s',
        '...ssss.r.',
        '..rrrrrr..',
        '.rryrryr..',
        '.srrrrrr..',
        '..ryrryr..',
        '..pppppp..',
        '..pp..pp..',
        '..pp..pp..',
        '..nn..nn..',
      ],
    ],
  },

  // Kopi uncle: singlet, towel over the shoulder, moustache.
  uncle: {
    palette: { h: HAIR, s: SKIN, e: EYE, n: BROWN, w: WHITE, b: BLUE, x: DARK },
    frames: [
      [
        '...ssss...',
        '..hssssh..',
        '..hssssh..',
        '..hesseh..',
        '..snnnns..',
        '...ssss...',
        '..wwwwbw..',
        '.swwwwbws.',
        '.swwwwwws.',
        '..wwwwww..',
        '..xxxxxx..',
        '..ss..ss..',
        '..ss..ss..',
        '..nn..nn..',
      ],
      [
        '...ssss...',
        '..hssssh..',
        '..hssssh..',
        '..hesseh..',
        '..snnnns..',
        '...ssss...',
        '..wwwwbw..',
        '.swwwwbws.',
        '.swwwwwws.',
        '..wwwwww..',
        ...walkLegs('x', 'n').slice(0, 1),
        '..ss..ss..',
        '.ss....ss.',
        '.nn....nn.',
      ],
    ],
  },

  // Auntie with a perm and a floral blouse.
  auntie: {
    palette: { h: HAIR, s: SKIN, e: EYE, c: CHEEK, j: JADE, w: WHITE, r: RED, p: DARK },
    frames: [
      [
        '..hhhhhh..',
        '.hhhhhhhh.',
        '.hhhhhhhh.',
        '.hhessehh.',
        '.hcssssch.',
        '..hssssh..',
        '..jjjjjj..',
        '.jjwjjwjj.',
        '.sjjjjjjs.',
        '..jjjjjj..',
        '..rrrrrr..',
        '.rrrrrrrr.',
        '...s..s...',
        '..pp..pp..',
      ],
      [
        '..hhhhhh..',
        '.hhhhhhhh.',
        '.hhhhhhhh.',
        '.hhessehh.',
        '.hcssssch.',
        '..hssssh.s',
        '..jjjjjjj.',
        '.jjwjjwj..',
        '.sjjjjjj..',
        '..jjjjjj..',
        '..rrrrrr..',
        '.rrrrrrrr.',
        '...s..s...',
        '..pp..pp..',
      ],
    ],
  },

  // The uncle next door: cap and polo shirt.
  neighbour: {
    palette: { b: BLUE, g: GREY, s: SKIN, e: EYE, y: GOLD, w: WHITE, n: BROWN, x: DARK },
    frames: [
      [
        '..bbbbb...',
        '..bbbbbbbb',
        '..gssssg..',
        '..gesseg..',
        '..ssssss..',
        '...ssss...',
        '..yyyyyy..',
        '.yyywwyyy.',
        '.syyyyyys.',
        '..yyyyyy..',
        '..nnnnnn..',
        '..nn..nn..',
        '..nn..nn..',
        '..xx..xx..',
      ],
      [
        '..bbbbb...',
        '..bbbbbbbb',
        '..gssssg..',
        '..gesseg..',
        '..ssssss..',
        '...ssss...',
        '..yyyyyy..',
        '.yyywwyyy.',
        '.syyyyyys.',
        '..yyyyyy..',
        ...walkLegs('n', 'x'),
      ],
    ],
  },

  // A kampung cat, side on, walking right.
  cat: {
    palette: { o: ORANGE, d: ORANGE_DARK, e: EYE },
    frames: [
      ['........o.o.', '........ooo.', 'o.......oeoo', '.o..ooooooo.', '..odoooodoo.', '..o.o..o.o..'],
      ['........o.o.', '........ooo.', 'o.......oeoo', '.o..ooooooo.', '..odoooodoo.', '...o.o..o.o.'],
    ],
  },
}
