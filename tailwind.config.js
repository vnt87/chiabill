/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Palette from the World Nineball Tour site (extracted with Dembrandt): white and #F7F7F7
      // surfaces, #333 ink, #C6C6C6 hairlines, link blue. `slate` is the neutral ramp,
      // `blue` the link ramp. `wnt` holds the brand red, yellow and the near-blacks.
      colors: {
        white: '#FFFFFF',
        slate: {
          50: '#FAFAFA', 100: '#F7F7F7', 200: '#E6E6E6', 300: '#C6C6C6', 400: '#8A8A8A',
          500: '#666666', 600: '#4D4D4D', 700: '#333333', 800: '#262626', 900: '#1D1D1D', 950: '#101010',
        },
        blue: {
          50: '#E7F1FF', 100: '#CFE2FF', 200: '#B6D4FE', 300: '#9EC5FE', 400: '#6EA8FE',
          500: '#0D6EFD', 600: '#0B5ED7', 700: '#0A58CA', 800: '#084298', 900: '#052C65', 950: '#031633',
        },
        wnt: {
          red: '#EF342A', 'red-dark': '#CB2C24', yellow: '#FCC000',
          ink: '#333333', black: '#101010', charcoal: '#1D1D1D',
        },
      },
      fontFamily: {
        sans: ['Kanit', 'Arial', 'Helvetica', 'sans-serif'],
        heading: ['Kanit', 'Arial', 'Helvetica', 'sans-serif'],
      },
      // Type scale: 15px body keeps Vietnamese diacritics and amounts legible
      // at small sizes without the mono look. Sizes are rem so they respect user zoom.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.25rem' }],
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.1rem', { lineHeight: '1.6rem' }],
        xl: ['1.2rem', { lineHeight: '1.65rem' }],
        '2xl': ['1.5rem', { lineHeight: '1.9rem', letterSpacing: '-0.005em' }],
        '3xl': ['2rem', { lineHeight: '2.4rem', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
}
