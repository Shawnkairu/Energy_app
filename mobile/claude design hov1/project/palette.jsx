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
  canvas:        '#FFFFFF',           // pure white workstation
  canvasGrid:    'rgba(15,17,18,0.05)',

  // screens (light by default)
  screenBg:      '#FFFFFF',           // pure white screen
  screenSurface: '#FFFFFF',           // elevated card
  screenSubtle:  '#F4F4F5',           // hairline panel (cool neutral)
  hairline:      'rgba(15,17,18,0.08)',
  hairlineSoft:  'rgba(15,17,18,0.04)',

  // ink — Tesla-style cool near-black
  ink:           '#0E1011',
  inkSoft:       '#3A3D40',
  inkMute:       '#7A7E84',

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
  resident:  { name: 'Resident',   color: PALETTE.fox_orange,    soft: '#FAFAFA', wire: '#965A35' },
  owner:    { name: 'Owner',       color: PALETTE.deep_wood,     soft: '#FAFAFA', wire: '#764927' },
  provider: { name: 'Provider',    color: PALETTE.studio_cocoa,  soft: '#FAFAFA', wire: '#7D5734' },
  financier:{ name: 'Financier',   color: PALETTE.burnt_chestnut,soft: '#FAFAFA', wire: '#693719' },
  installer:{ name: 'Installer',   color: PALETTE.warm_umbar,    soft: '#FAFAFA', wire: '#856444' },
  supplier: { name: 'Supplier',    color: PALETTE.toasted_clay,  soft: '#FAFAFA', wire: '#997757' },
  admin:    { name: 'Cockpit',     color: PALETTE.near_black_brown, soft: '#FAFAFA', wire: '#471708' },
  shared:   { name: 'Shared',      color: PALETTE.scarf_oat,     soft: '#FAFAFA', wire: '#A98866' },
};

Object.assign(window, { PALETTE, TOKENS, ROLES });
