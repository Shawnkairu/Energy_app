// e.mappa brand palette - matching the exact color scheme
export const colors = {
  // Primary palette (from the provided image)
  primary: '#4A5C7A',      // slate blue (darker blue from image)
  secondary: '#A2BFD9',    // light blue (lighter blue from image)
  accent: '#E07856',       // coral/salmon (orange from image)
  background: '#F5F5F5',   // very light gray/white
  surface: '#FFFFFF',      // pure white for cards

  // Text
  text: '#2C2C2C',         // dark gray/black text
  textMuted: '#6B6B6B',    // muted gray
  textLight: '#9E9E9E',    // lighter gray

  // Support
  soft: '#E0E0E0',         // subtle borders/dividers
  ink: '#2C2C2C',          // dark for emphasis

  // Status
  success: '#4CAF50',
  warning: '#FDB813',      // gold for warnings/highlights
  error: '#F44336',
  online: '#4CAF50',

  // Chart colors (keep provider-specific colors in charts)
  chartPrimary: '#4A5C7A', // slate blue
  chartSecondary: '#E07856', // coral

  // Light accents
  lightBg: '#FAFAFA',      // very light background
  lightCard: '#FCFCFC',    // slightly off-white card
  lightBorder: '#E8E8E8',  // light border

  // Input backgrounds
  darkCard: '#F0F0F0',     // light gray for input backgrounds

  // Glass effect colors
  glassLight: 'rgba(255, 255, 255, 0.5)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  gradientStart: '#E8F4F8',
  gradientMid: '#F0F8FA',
  gradientEnd: '#FAF9F9',
} as const;

export type ColorName = keyof typeof colors;
