/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./base')],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          border: '#1E293B',
        },
        background: '#F8FAFC',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F8FAFC',
          muted: '#F1F5F9',
        },
        ink: {
          DEFAULT: '#0B1C30',
          muted: '#475569',
          subtle: '#94A3B8',
        },
        success: '#2E7D32',
        warning: '#E65100',
        danger: '#BA1A1A',
      },
      spacing: {
        sidebar: '260px',
        topbar: '64px',
      },
    },
  },
};
