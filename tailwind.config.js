export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        slate: {
          50: '#F8FAFC',
          200: '#E2E8F0',
          500: '#64748B',
          800: '#1E293B',
          900: '#0F172A',
        },
        indigo: {
          600: '#4F46E5',
        },
        red: {
          500: '#EF4444',
        },
        medical: '#00d4ff',
        social: '#00ffaa',
        personal: '#bf80ff',
        emergency: '#EF4444',
        base: '#060a14',
        surface: 'rgba(255,255,255,0.04)',
        elevated: 'rgba(255,255,255,0.06)',
        border: 'rgba(255,255,255,0.08)',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.07), 0 12px 40px rgba(0, 0, 0, 0.45)',
        cyan: '0 0 0 1px rgba(0,212,255,0.22), 0 0 30px rgba(0,212,255,0.15)',
        emerald: '0 0 0 1px rgba(0,255,170,0.2), 0 0 26px rgba(0,255,170,0.12)',
        emergency: '0 0 0 1px rgba(239,68,68,0.25), 0 0 30px rgba(239,68,68,0.2)',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }
    },
  },
  plugins: [],
};
