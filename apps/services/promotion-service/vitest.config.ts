import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@common\/([^/]+)\/(.+)$/,
        replacement: `${workspaceRoot}/libs/$1/src/lib/$2`,
      },
    ],
  },
  test: {
    root: path.join(workspaceRoot, 'apps/services/promotion-service'),
    environment: 'node',
    include: ['src/**/*.e2e-spec.ts'],
    globals: true,
  },
});
