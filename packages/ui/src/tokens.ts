export const colors = {
  ink: "#080A0D",
  night: "#101318",
  panel: "#171B22",
  panelSoft: "#202633",
  border: "#2A3140",
  text: "#F7F2EC",
  muted: "#9BA3AF",
  dim: "#667085",
  orange: "#E07856",
  orangeDeep: "#B84F2D",
  amber: "#F4A261",
  solar: "#FFB454",
  green: "#4ADE80",
  cyan: "#22D3EE",
  blue: "#60A5FA",
  red: "#EF4444",
  white: "#FFFFFF",
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
  pill: 999,
} as const;

export const typography = {
  hero: 42,
  title: 30,
  heading: 22,
  body: 16,
  small: 13,
  micro: 11,
} as const;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
} as const;
