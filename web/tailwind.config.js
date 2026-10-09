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
          DEFAULT: '#F4FAEF',
          warm: '#E7F3DC',
          border: '#CFE2C5',
        },
        sand: '#E4F3DD',
        muted: '#52705B',
        cocoa: '#19452B',
        charcoal: '#0E2C1C',
        surface: '#163D27',
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
