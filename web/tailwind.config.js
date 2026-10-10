/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent — verde huerta
        mora: {
          DEFAULT: '#2F7D32',
          light: '#D9F2BD',
          dark: '#205C2D',
        },
        // Neutral warmth palette
        cream: {
          DEFAULT: '#FAF8F3',
          warm: '#EDF4E8',
          border: '#D8E1D4',
        },
        sand: '#F4F1E9',
        muted: '#56615A',
        cocoa: '#34443A',
        charcoal: '#253229',
        canvas: '#FAF8F3',
        surface: '#FFFFFF',
        ink: '#253229',
        border: '#D8E1D4',
        error: '#B42318',
        whatsapp: '#176B35',
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-in forwards',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        premium: 'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [({ addBase, theme }) => {
    addBase({ ':root': {
      '--mora-green': theme('colors.mora.DEFAULT'),
      '--mora-dark': theme('colors.mora.dark'),
      '--mora-forest': theme('colors.charcoal'),
      '--mora-light': theme('colors.mora.light'),
      '--mora-text': theme('colors.sand'),
    } })
  }],
}
