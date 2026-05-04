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
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
        floating: '0 10px 30px rgba(0,0,0,0.08)',
      },
      spacing: {
        sidebar: '260px',
        topbar: '64px',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
};
