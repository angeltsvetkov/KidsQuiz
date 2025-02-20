/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        'slideIn': 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
};