/** @type {import('tailwindcss').Config} */

// Semantic colors backed by CSS variables (see assets/css/main.css), so one class covers
// light and dark mode and keeps opacity modifiers working (`bg-primary/10`).
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdecea',
          100: '#fad0cb',
          200: '#f4a29a',
          300: '#ec746a',
          400: '#e64f3f',
          500: '#e2241a',
          600: '#c11f17',
          700: '#9c1912',
          800: '#75130e',
          900: '#4d0d09',
          950: '#161616',
        },
        canvas: token('canvas'),
        surface: { DEFAULT: token('surface'), muted: token('surface-muted') },
        line: { DEFAULT: token('line'), strong: token('line-strong') },
        ink: { DEFAULT: token('ink'), soft: token('ink-soft') },
        muted: token('muted'),
        subtle: token('subtle'),
        primary: {
          DEFAULT: token('primary'),
          hover: token('primary-hover'),
          soft: token('primary-soft'),
          text: token('primary-text'),
        },
        success: { DEFAULT: token('success'), soft: token('success-soft') },
        warning: { DEFAULT: token('warning'), soft: token('warning-soft') },
        danger: { DEFAULT: token('danger'), soft: token('danger-soft') },
        info: { DEFAULT: token('info'), soft: token('info-soft') },
      },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 40 / 0.04), 0 12px 32px -16px rgb(76 63 170 / 0.16)',
      },
    },
  },
  plugins: [],
}
