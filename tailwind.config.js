/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'heading-font': '22px',
        'default-font': '14px',
        'modle-title-font': '18px'
      },
      colors: {
        primary: "#252B48",
        secondary: "#EC7505",
        tertiary: "#2862E1",
        cancel: "#acacac",
      }
    },
  },
  plugins: [],
}

