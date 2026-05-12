export const officialPalette = {
  studioCocoa: "#7D5734",
  warmUmbar: "#856444",
  plushCaramel: "#D9BB96",
  toastedClay: "#997757",
  scarfOat: "#BA9A74",
  softCinnamon: "#A98866",
  guitarMaple: "#CBAB84",
  deepWood: "#764927",
  furCream: "#E4C6A4",
  espressoShadow: "#57361B",
  burntChestnut: "#693719",
  nearBlackBrown: "#471708",
  rustBrown: "#67270C",
  foxOrange: "#965A35",
} as const;

/**
 * App semantics blend officialPalette + readability (see docs/OFFICIAL_COLOR_PALETTE.md).
 * Primary actions: fox / rust lineage; status green/red unchanged for real state only.
 */
export const colors = {
  /** Solid white canvas for safe areas and chrome fallback. */
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  ink: "#FFFFFF",
  night: "#FFFFFF",
  panel: "#FFFFFF",
  panelSoft: "#FFF8F2",
  cream: "#FFF3DE",
  sky: "#FFF7EA",
  border: "rgba(125, 87, 52, 0.14)",
  borderStrong: "rgba(87, 54, 27, 0.20)",
  /** Warm near-black (espresso / near-black-brown lineage) */
  text: "#2A211C",
  muted: "#5C534A",
  dim: "#8A8178",
  /** Secondary warm accent */
  orange: officialPalette.guitarMaple,
  /** Primary actions — fox orange */
  orangeDeep: officialPalette.foxOrange,
  amber: "#DDAA3A",
  solar: "#F5C65B",
  green: "#2F9F6B",
  cyan: "#E9A86F",
  blue: "#B96F46",
  red: "#C94A3C",
  white: "#FFFFFF",
  graphite: "#27302B",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  hero: 28,
  title: 20,
  heading: 17,
  body: 15,
  small: 13,
  micro: 11,
} as const;

/** Full-screen shell: warm neutral base + low-saturation fur/plush whisper (not flat white). */
export const shellGradientColors = ["#FCFAF7", "#F8F1EA", "rgba(228, 198, 164, 0.26)", "#FAF6F1"] as const;

export const shellGradientLocations = [0, 0.34, 0.62, 1] as const;

/** Vertical soft wash — subtle depth without muddying text contrast. */
export const shellWashColors = ["rgba(203, 171, 132, 0.07)", "transparent", "rgba(150, 90, 53, 0.045)"] as const;

export const shellWashLocations = [0, 0.48, 1] as const;

/** Card face: dual-stop feel, cream knockout, readable under `colors.text`. */
export const cardGradientColors = [
  "#FFFDFB",
  "rgba(255, 249, 242, 0.97)",
  "rgba(228, 198, 164, 0.20)",
  "rgba(217, 187, 150, 0.12)",
  "#FFFBF8",
] as const;

export const cardGradientLocations = [0, 0.22, 0.46, 0.72, 1] as const;

/** Soft top-left highlight mesh over card base */
export const cardHighlightGradientColors = ["rgba(255, 255, 255, 0.5)", "transparent", "rgba(186, 154, 116, 0.065)"] as const;

export const cardHighlightGradientLocations = [0, 0.42, 1] as const;

/** Hairline using deep wood lineage */
export const cardBorderColor = "rgba(118, 73, 39, 0.16)";

export const shadows = {
  card: {
    boxShadow: `0 10px 22px rgba(87, 54, 27, 0.09)`,
    elevation: 4,
  },
  soft: {
    boxShadow: `0 6px 14px rgba(87, 54, 27, 0.06)`,
    elevation: 2,
  },
} as const;
