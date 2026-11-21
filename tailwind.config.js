/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.tsx', './pages/**/*.tsx', './components/**/*.tsx', './layouts/**/*.tsx'],
  theme: {
    extend: {
      colors: {
        mari: {
          teal: '#4A90A4',
          lightBlue: '#A8D0DB',
          coral: '#FF9E80',
          pink: '#F4C2C2',
          cream: '#FCFBF9',
          gold: '#C5A059',
          dark: '#1A1A1A',
          charcoal: '#262624',
          text: '#2D2D2D',
          ink: '#3E5661',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        display: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
