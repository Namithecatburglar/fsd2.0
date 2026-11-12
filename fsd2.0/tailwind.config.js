/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wind: {
          bg: '#050505',
          panel: '#0D0D0D',
          surface: '#141414',
          subtle: '#1C1C1C',
          border: '#262626',
          borderLight: '#333333',
          borderHighlight: '#404040',
          primary: '#FFFFFF',
          secondary: '#A3A3A3',
          muted: '#666666',
        },
        status: {
          online: '#FFFFFF',
          warning: '#EAB308',
          critical: '#EF4444',
          offline: '#52525B',
          info: '#38BDF8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
};
