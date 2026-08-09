/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          blue: '#1a365d', // Deep Civic Blue
          'blue-dark': '#002045',
          'blue-light': '#86a0cd',
        },
        ai: {
          indigo: '#5a67d8', // AI Accent
          'indigo-dark': '#4552c3',
          'indigo-light': '#7f8cff',
          surface: '#F5F7FF',
        },
        semantic: {
          critical: '#C53030', // Alert Red
          warning: '#D69E2E',  // Amber
          success: '#2F855A',  // Emerald
          info: '#3182CE',     // Info Blue
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          container: '#e5eeff',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
