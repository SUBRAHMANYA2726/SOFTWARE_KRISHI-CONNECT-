/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#EEF3EE',
          100: '#DCE7DD',
          200: '#B9CFBB',
          300: '#8DB093',
          400: '#5F8B67',
          500: '#3F6E4A',
          600: '#2C5738',
          700: '#23452D',
          800: '#1A3623',
          900: '#11281A',
          950: '#0A1A10',
        },
        sage: {
          50: '#F4F6EF',
          100: '#E9EDE2',
          200: '#D6DECB',
          300: '#BAC7AC',
          400: '#9AAB88',
          500: '#7B8E69',
          600: '#617352',
          700: '#4C5A41',
        },
        ivory: '#F7F4EA',
        paper: '#FFFDF6',
        clay: {
          400: '#C98363',
          500: '#B4623F',
          600: '#96502F',
        },
        ochre: '#C08A2E',
        ink: '#1B2A20',
        muted: '#5C6A5D',
      },
      fontFamily: {
        display: ['Fraunces', 'Iowan Old Style', 'Georgia', 'serif'],
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        lift: '0 18px 40px -24px rgba(17, 40, 26, 0.35)',
        panel: '0 1px 0 rgba(17, 40, 26, 0.06), 0 24px 60px -40px rgba(17, 40, 26, 0.4)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        fade: 'fade 0.45s ease-out both',
        drift: 'drift 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
