module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Usar como bg-champions-blue, text-champions-gold, border-champions-gold/30, from-champions-blue...
        champions: {
          blue: '#0e1e5b',
          gold: '#fb9f00',
        },
      },
    },
  },
  plugins: [],
}
