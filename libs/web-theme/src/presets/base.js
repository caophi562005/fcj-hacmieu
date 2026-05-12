/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF6B35',
          50: '#FFF4EE',
          100: '#FFE3D2',
          200: '#FFC2A1',
          300: '#FFA070',
          400: '#FF8552',
          500: '#FF6B35',
          600: '#E85420',
          700: '#B83F18',
          800: '#892D11',
          900: '#5C1F0C',
        },
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.05)',
        floating: '0 8px 24px rgba(0,0,0,0.08)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
};
