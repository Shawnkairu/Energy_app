// React Theme — extracted from https://stripe.com
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    neutral50: string;
    neutral100: string;
    neutral200: string;
    neutral300: string;
    neutral400: string;
    neutral500: string;
    neutral600: string;
    neutral700: string;
    neutral800: string;
    neutral900: string;
 *   };
 *   fonts: {
    body: string;
    mono: string;
 *   };
 *   fontSizes: {
    '16': string;
    '18': string;
    '20': string;
    '21': string;
    '22': string;
    '23': string;
    '24': string;
    '26': string;
    '32': string;
    '38': string;
    '48': string;
    '56': string;
 *   };
 *   space: {
    '1': string;
    '48': string;
    '52': string;
    '56': string;
    '60': string;
    '64': string;
    '72': string;
    '75': string;
    '80': string;
    '84': string;
    '96': string;
    '100': string;
    '112': string;
    '128': string;
    '191': string;
    '282': string;
 *   };
 *   radii: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
 *   };
 *   shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */

export const theme = {
  "colors": {
    "primary": "#6b59fe",
    "secondary": "#e8e9ff",
    "accent": "#ffe0d1",
    "background": "#ffffff",
    "foreground": "#000000",
    "neutral50": "#000000",
    "neutral100": "#ffffff",
    "neutral200": "#50617a",
    "neutral300": "#64748d",
    "neutral400": "#707f98",
    "neutral500": "#7d8ba4",
    "neutral600": "#171717",
    "neutral700": "#f5f5f5",
    "neutral800": "#d8dee4",
    "neutral900": "#ffe6f5"
  },
  "fonts": {
    "body": "'Arial', sans-serif",
    "mono": "'monospace', monospace"
  },
  "fontSizes": {
    "16": "16px",
    "18": "18px",
    "20": "20px",
    "21": "21px",
    "22": "22px",
    "23": "23px",
    "24": "24px",
    "26": "26px",
    "32": "32px",
    "38": "38px",
    "48": "48px",
    "56": "56px"
  },
  "space": {
    "1": "1px",
    "48": "48px",
    "52": "52px",
    "56": "56px",
    "60": "60px",
    "64": "64px",
    "72": "72px",
    "75": "75px",
    "80": "80px",
    "84": "84px",
    "96": "96px",
    "100": "100px",
    "112": "112px",
    "128": "128px",
    "191": "191px",
    "282": "282px"
  },
  "radii": {
    "xs": "1px",
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "full": "99px"
  },
  "shadows": {
    "sm": "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
    "md": "rgba(0, 0, 0, 0.1) 0px 4px 8px 0px",
    "lg": "rgba(0, 0, 0, 0.2) 0px 0px 32px 8px",
    "xl": "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px"
  },
  "states": {
    "hover": {
      "opacity": 0.08
    },
    "focus": {
      "opacity": 0.12
    },
    "active": {
      "opacity": 0.16
    },
    "disabled": {
      "opacity": 0.38
    }
  }
};

// MUI v5 theme
export const muiTheme = {
  "palette": {
    "primary": {
      "main": "#6b59fe",
      "light": "hsl(247, 99%, 82%)",
      "dark": "hsl(247, 99%, 52%)"
    },
    "secondary": {
      "main": "#e8e9ff",
      "light": "hsl(237, 100%, 95%)",
      "dark": "hsl(237, 100%, 80%)"
    },
    "background": {
      "default": "#ffffff",
      "paper": "#e5edf5"
    },
    "text": {
      "primary": "#000000",
      "secondary": "#533afd"
    }
  },
  "typography": {
    "fontFamily": "'Times New Roman', sans-serif",
    "h1": {
      "fontSize": "32px",
      "fontWeight": "300",
      "lineHeight": "35.2px"
    },
    "h2": {
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "normal"
    }
  },
  "shape": {
    "borderRadius": 8
  },
  "shadows": [
    "rgba(10, 37, 64, 0.22) 0px -1.854px 4.634px 0px inset",
    "rgba(0, 0, 0, 0.1) 0px 2px 5px 0px",
    "rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px",
    "rgba(23, 23, 23, 0.06) 0px 3px 6px 0px",
    "rgba(0, 0, 0, 0.1) 0px 4px 8px 0px"
  ]
};

export default theme;
