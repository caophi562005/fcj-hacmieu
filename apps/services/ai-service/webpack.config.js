const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  externals: [
    nodeExternals({
      modulesDir: join(__dirname, '../../../node_modules'),
      allowlist: [/^@prisma\/client(?:\/.*)?$/],
    }),
  ],
  output: {
    path: join(__dirname, '../../../dist/apps/services/ai-service'),
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
          glob: 'ai.proto',
          input: 'libs/interfaces/src/lib/protos',
          output: './proto',
        },
        {
          glob: 'utility.proto',
          input: 'libs/interfaces/src/lib/protos',
          output: './proto',
        },
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      externalDependencies: 'none',
      mergeExternals: true,
      sourceMap: true,
    }),
  ],
};
