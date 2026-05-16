/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('./base')],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#E8F4FD',
          foreground: '#0B6FB8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#FAFAFA',
          muted: '#F5F5F5',
        },
        ink: {
          DEFAULT: '#212121',
          muted: '#616161',
          subtle: '#9E9E9E',
        },
        success: '#2ECC71',
        warning: '#F5A623',
        danger: '#EF4444',
        border: {
          DEFAULT: '#E0E0E0',
          subtle: '#F0F0F0',
        },
      },
      maxWidth: {
        container: '1200px',
      },
      fontSize: {
        'price-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'price-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
      },
      boxShadow: {
        'nav-up': '0 -4px 12px rgba(0,0,0,0.05)',
      },
      spacing: {
        sidebar: '0px',
        topbar: '0px',
      },
    },
  },
};
