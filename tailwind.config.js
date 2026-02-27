/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        billar: {
          green: '#1a5f2a',
          'green-dark': '#0d3d1a',
          gold: '#d4af37',
          'red-casino': '#c41e3a',
          'blue-night': '#1a1a2e',
          pearl: '#f5f5f5',
          black: '#1a1a1a'
        },
        status: {
          available: '#27ae60',
          occupied: '#e74c3c',
          maintenance: '#f39c12',
          reserved: '#3498db'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    },
  },
  plugins: [],
}
