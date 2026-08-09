/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        civic: {
          navy: '#0B132B',
          slate: '#1C2541',
          blue: '#00346F',
          'blue-dark': '#002045',
          'blue-light': '#38BDF8',
        },
        ai: {
          indigo: '#6366F1',
          'indigo-dark': '#4F46E5',
          'indigo-light': '#818CF8',
          surface: '#EEF2FF',
        },
        cyan: {
          accent: '#06B6D4',
          light: '#67E8F9',
        },
        semantic: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#F59E0B',
          low: '#10B981',
          none: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-indigo': 'glowIndigo 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowIndigo: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.4)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}

