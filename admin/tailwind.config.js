/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mora: {
          DEFAULT: '#2F7D32',
          light: '#D9F2BD',
          dark: '#205C2D',
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
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
