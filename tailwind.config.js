/** @type {import('tailwindcss').Config} */
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
      },
    },
  },
  plugins: [],
}
