/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        primary : "#1f6753",
        secondary : "#53a370"
      }
    },
  },
  plugins: [],
}

