// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
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
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        card: '0 4px 12px rgba(0,0,0,0.05)',
        floating: '0 8px 24px rgba(0,0,0,0.08)',
        'nav-up': '0 -4px 12px rgba(0,0,0,0.05)',
      },
      maxWidth: {
        container: '1200px',
      },
      fontSize: {
        'price-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'price-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '700' }],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};
