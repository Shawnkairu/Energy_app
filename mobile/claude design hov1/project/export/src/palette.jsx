// e.mappa warm palette — sampled from official character art.
// Use these tokens everywhere. Keep accents calm; lean cream + warm-dark.

const PALETTE = {
  studio_cocoa:    '#7D5734',
  warm_umbar:      '#856444',
  plush_caramel:   '#D9BB96',
  toasted_clay:    '#997757',
  scarf_oat:       '#BA9A74',
  soft_cinnamon:   '#A98866',
  guitar_maple:    '#CBAB84',
  deep_wood:       '#764927',
  fur_cream:       '#E4C6A4',
  espresso_shadow: '#57361B',
  burnt_chestnut:  '#693719',
  near_black_brown:'#471708',
  rust_brown:      '#67270C',
  fox_orange:      '#965A35',
};

// Semantic tokens used by screens
const TOKENS = {
  // canvas
  canvas:        '#F5EFE6',           // warm cream paper
  canvasGrid:    'rgba(86,54,27,0.08)',

  // screens (light by default)
  screenBg:      '#FBF6EE',           // soft cream "page"
  screenSurface: '#FFFFFF',           // elevated card
  screenSubtle:  '#F1E8D8',           // hairline panel
  hairline:      'rgba(71,23,8,0.10)',
  hairlineSoft:  'rgba(71,23,8,0.06)',

  // ink
  ink:           '#2A1808',           // body ink (warm near-black)
  inkSoft:       '#5C4631',
  inkMute:       '#8B7659',

  // accents
  accent:        PALETTE.fox_orange,  // primary
  accentDeep:    PALETTE.rust_brown,
  accentSoft:    PALETTE.guitar_maple,
  caramel:       PALETTE.plush_caramel,
  cream:         PALETTE.fur_cream,
  oat:           PALETTE.scarf_oat,
  cocoa:         PALETTE.studio_cocoa,
  espresso:      PALETTE.espresso_shadow,

  // status
  ok:            '#5E7A3F',
  warn:          '#B07B2C',
  bad:           PALETTE.rust_brown,
};

// Stakeholder colors — each role gets a unique warm hue from the palette
const ROLES = {
  resident:  { name: 'Resident',   color: PALETTE.fox_orange,    soft: '#FBE8D8', wire: '#965A35' },
  owner:    { name: 'Owner',       color: PALETTE.deep_wood,     soft: '#EFD9C2', wire: '#764927' },
  provider: { name: 'Provider',    color: PALETTE.studio_cocoa,  soft: '#E9D6BA', wire: '#7D5734' },
  financier:{ name: 'Financier',   color: PALETTE.burnt_chestnut,soft: '#EFCFB7', wire: '#693719' },
  installer:{ name: 'Electrician',   color: PALETTE.warm_umbar,    soft: '#E7D4BA', wire: '#856444' },
  supplier: { name: 'Supplier',    color: PALETTE.toasted_clay,  soft: '#EAD8BC', wire: '#997757' },
  admin:    { name: 'Cockpit',     color: PALETTE.near_black_brown, soft: '#E2C9AD', wire: '#471708' },
  shared:   { name: 'Shared',      color: PALETTE.scarf_oat,     soft: '#F1E0C5', wire: '#A98866' },
};

Object.assign(window, { PALETTE, TOKENS, ROLES });
