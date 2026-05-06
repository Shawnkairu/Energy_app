/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
    colors: {
        primary: {
            '50': 'hsl(247, 99%, 97%)',
            '100': 'hsl(247, 99%, 94%)',
            '200': 'hsl(247, 99%, 86%)',
            '300': 'hsl(247, 99%, 76%)',
            '400': 'hsl(247, 99%, 64%)',
            '500': 'hsl(247, 99%, 50%)',
            '600': 'hsl(247, 99%, 40%)',
            '700': 'hsl(247, 99%, 32%)',
            '800': 'hsl(247, 99%, 24%)',
            '900': 'hsl(247, 99%, 16%)',
            '950': 'hsl(247, 99%, 10%)',
            DEFAULT: '#6b59fe'
        },
        secondary: {
            '50': 'hsl(237, 100%, 97%)',
            '100': 'hsl(237, 100%, 94%)',
            '200': 'hsl(237, 100%, 86%)',
            '300': 'hsl(237, 100%, 76%)',
            '400': 'hsl(237, 100%, 64%)',
            '500': 'hsl(237, 100%, 50%)',
            '600': 'hsl(237, 100%, 40%)',
            '700': 'hsl(237, 100%, 32%)',
            '800': 'hsl(237, 100%, 24%)',
            '900': 'hsl(237, 100%, 16%)',
            '950': 'hsl(237, 100%, 10%)',
            DEFAULT: '#e8e9ff'
        },
        accent: {
            '50': 'hsl(20, 100%, 97%)',
            '100': 'hsl(20, 100%, 94%)',
            '200': 'hsl(20, 100%, 86%)',
            '300': 'hsl(20, 100%, 76%)',
            '400': 'hsl(20, 100%, 64%)',
            '500': 'hsl(20, 100%, 50%)',
            '600': 'hsl(20, 100%, 40%)',
            '700': 'hsl(20, 100%, 32%)',
            '800': 'hsl(20, 100%, 24%)',
            '900': 'hsl(20, 100%, 16%)',
            '950': 'hsl(20, 100%, 10%)',
            DEFAULT: '#ffe0d1'
        },
        'neutral-50': '#000000',
        'neutral-100': '#ffffff',
        'neutral-200': '#50617a',
        'neutral-300': '#64748d',
        'neutral-400': '#707f98',
        'neutral-500': '#7d8ba4',
        'neutral-600': '#171717',
        'neutral-700': '#f5f5f5',
        'neutral-800': '#d8dee4',
        'neutral-900': '#ffe6f5',
        background: '#ffffff',
        foreground: '#000000'
    },
    fontFamily: {
        sans: [
            'sohne-var',
            'sans-serif'
        ],
        body: [
            'monospace',
            'sans-serif'
        ],
        font3: [
            'Arial',
            'sans-serif'
        ]
    },
    fontSize: {
        '14': [
            '14px',
            {
                lineHeight: '14px'
            }
        ],
        '15': [
            '15px',
            {
                lineHeight: '21px'
            }
        ],
        '16': [
            '16px',
            {
                lineHeight: 'normal'
            }
        ],
        '18': [
            '18px',
            {
                lineHeight: '25.2px'
            }
        ],
        '20': [
            '20px',
            {
                lineHeight: '28px',
                letterSpacing: '-0.2px'
            }
        ],
        '21': [
            '21px',
            {
                lineHeight: '27.3px',
                letterSpacing: '0.139px'
            }
        ],
        '22': [
            '22px',
            {
                lineHeight: '24.2px',
                letterSpacing: '-0.22px'
            }
        ],
        '23': [
            '23px',
            {
                lineHeight: '28px'
            }
        ],
        '24': [
            '24px',
            {
                lineHeight: 'normal',
                letterSpacing: '-0.72px'
            }
        ],
        '26': [
            '26px',
            {
                lineHeight: 'normal'
            }
        ],
        '32': [
            '32px',
            {
                lineHeight: '35.2px',
                letterSpacing: '-0.64px'
            }
        ],
        '38': [
            '38px',
            {
                lineHeight: '48px',
                letterSpacing: '-0.2px'
            }
        ],
        '48': [
            '48px',
            {
                lineHeight: '55.2px',
                letterSpacing: '-0.96px'
            }
        ],
        '56': [
            '56px',
            {
                lineHeight: '57.68px',
                letterSpacing: '-1.4px'
            }
        ],
        '13.3333': [
            '13.3333px',
            {
                lineHeight: 'normal'
            }
        ]
    },
    spacing: {
        '24': '48px',
        '26': '52px',
        '28': '56px',
        '30': '60px',
        '32': '64px',
        '36': '72px',
        '40': '80px',
        '42': '84px',
        '48': '96px',
        '50': '100px',
        '56': '112px',
        '64': '128px',
        '141': '282px',
        '170': '340px',
        '183': '366px',
        '1px': '1px',
        '75px': '75px',
        '191px': '191px'
    },
    borderRadius: {
        xs: '1px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '99px'
    },
    boxShadow: {
        sm: 'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px',
        md: 'rgba(0, 0, 0, 0.1) 0px 4px 8px 0px',
        lg: 'rgba(0, 0, 0, 0.2) 0px 0px 32px 8px',
        xl: 'rgba(50, 50, 93, 0.25) 0px 30px 60px -12px, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px'
    },
    screens: {
        '400px': '400px',
        sm: '600px',
        md: '769px',
        '840px': '840px',
        '900px': '900px',
        '901px': '901px',
        '940px': '940px',
        lg: '1020px',
        '1112px': '1112px',
        '1115px': '1115px',
        xl: '1300px'
    },
    transitionDuration: {
        '0': '0s',
        '100': '0.1s',
        '120': '0.12s',
        '150': '0.15s',
        '200': '0.2s',
        '240': '0.24s',
        '250': '0.25s',
        '300': '0.3s',
        '350': '0.35s',
        '400': '0.4s',
        '500': '0.5s',
        '600': '0.6s',
        '800': '0.8s',
        '1000': '1s',
        '1200': '1.2s'
    },
    transitionTimingFunction: {
        custom: 'cubic-bezier(0.7, 0, 0, 1)',
        default: 'ease',
        linear: 'linear'
    },
    container: {
        center: true,
        padding: '16px'
    },
    maxWidth: {
        container: '1266px'
    }
},
  },
};
