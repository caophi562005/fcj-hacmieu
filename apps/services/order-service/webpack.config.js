const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../../dist/apps/services/order-service'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: [
        {
          glob: 'order.proto',
          input: 'libs/interfaces/src/lib/protos',
          output: './proto',
        },
        {
          glob: 'catalog.proto',
          input: 'libs/interfaces/src/lib/protos',
          output: './proto',
        },
        {
          glob: 'promotion.proto',
          input: 'libs/interfaces/src/lib/protos',
          output: './proto',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
    }),
  ],
};
