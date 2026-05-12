const dashboardPreset = require('../../../libs/web-theme/src/presets/dashboard');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [dashboardPreset],
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/web-ui/src/**/*.{ts,tsx,js,jsx}',
    '../../../libs/convex/src/**/*.{ts,tsx,js,jsx}',
  ],
  plugins: [],
};
