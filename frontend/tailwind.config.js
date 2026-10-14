/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B1625',
        paper: '#FFF9F0',
        // Login's left panel gets its own identity, deliberately distinct
        // from `ink` (which is the app's default text/dark-surface color).
        plum: {
          DEFAULT: '#2C1F4A',
          dark: '#20163A',
        },
        send: {
          DEFAULT: '#5B4FE8',
          dark: '#4438C4',
          light: '#EEEBFC',
        },
        amber: {
          DEFAULT: '#F5A623',
          light: '#FFF3DC',
        },
        coral: {
          DEFAULT: '#EF4444',
          light: '#FDE8E8',
        },
        sky: {
          DEFAULT: '#2F80ED',
          light: '#E7F1FE',
        },
        sage: {
          DEFAULT: '#12B76A',
          light: '#E3FBEF',
        },
        orange: {
          DEFAULT: '#FF7A3D',
          light: '#FFEEE3',
        },
        stone: {
          DEFAULT: '#9B5DE5',
          light: '#F3E8FD',
        },
        mist: {
          DEFAULT: '#0EA5A5',
          light: '#E0F7F7',
        },
        lilac: {
          DEFAULT: '#9B5DE5',
          light: '#F3E8FD',
        },
        blush: {
          DEFAULT: '#EC4899',
          light: '#FDE7F3',
        },
        line: '#EDE7F6',
        muted: '#7A7086',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        flashRow: {
          '0%': { backgroundColor: 'rgba(91, 79, 232, 0.14)' },
          '100%': { backgroundColor: 'transparent' },
        },
        inboxDrift: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        pulseDot: 'pulseDot 1.8s ease-in-out infinite',
        slideIn: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        fadeIn: 'fadeIn 0.15s ease-out',
        flashRow: 'flashRow 0.8s ease-out',
        inboxDrift: 'inboxDrift 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
