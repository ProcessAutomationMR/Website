/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brown: {
          950: '#1a1512',
          900: '#2d2419',
          800: '#3d2f24',
          400: '#a89080',
        },
      },
    },
  },
  plugins: [],
};
