module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#287460',
        'primary-dark': '#1f5a4a',
        'gray-850': '#18181b',
        'gray-950': '#09090b'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
};