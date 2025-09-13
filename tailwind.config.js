/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontSize: {
        'xs': 'clamp(0.75rem, 2vw, 0.875rem)',
        'sm': 'clamp(0.875rem, 2.5vw, 1rem)',
        'base': 'clamp(1rem, 3vw, 1.125rem)',
        'lg': 'clamp(1rem, 3vw, 1.125rem)',
        'xl': 'clamp(1.125rem, 3.5vw, 1.375rem)',
        '2xl': 'clamp(1.5rem, 5vw, 2rem)',
      },
    },
  },
  plugins: [],
};
