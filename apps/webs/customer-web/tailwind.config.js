const storefrontPreset = require('../../../libs/web-theme/src/presets/storefront');

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [storefrontPreset],
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    '../../../libs/web-ui/src/**/*.{ts,tsx,js,jsx}',
    '../../../libs/convex/src/**/*.{ts,tsx,js,jsx}',
  ],
  plugins: [],
};
