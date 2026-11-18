/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        showroom: {
          950: '#0A0B0E', // Deepest Obsidian
          900: '#101217', // Primary dark background
          850: '#151720', // Card surface
          800: '#1B1E29', // Elevated surface
          750: '#232635', // Hover surface
          700: '#2D3142', // Subtle border
          600: '#3F445A', // Divider border
          cream: '#E8D7C3', // Primary Action Cream / Warm Champagne
          creamHover: '#DFCABA',
          creamLight: '#F5ECE2',
          creamDark: '#C7B097',
          gold: '#D4AF7A',
          ivory: '#F7F6F2',
          muted: '#8E92A0',
          subtle: '#606474'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'kiosk-button': '0 4px 24px -2px rgba(232, 215, 195, 0.25)',
        'kiosk-card': '0 12px 40px 0 rgba(0, 0, 0, 0.45)',
        'kiosk-selected': '0 0 0 2px #E8D7C3, 0 8px 24px -4px rgba(232, 215, 195, 0.2)',
        'card-hover': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
