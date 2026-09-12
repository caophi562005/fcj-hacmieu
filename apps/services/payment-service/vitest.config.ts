import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

for (const key of [
  'CATALOG_SERVICE_DATABASE_URL',
  'ORDER_SERVICE_DATABASE_URL',
  'PROMOTION_SERVICE_DATABASE_URL',
  'PAYMENT_SERVICE_DATABASE_URL',
  'UTILITY_SERVICE_DATABASE_URL',
  'IAM_SERVICE_DATABASE_URL',
  'SHOP_SERVICE_DATABASE_URL',
  'WALLET_SERVICE_DATABASE_URL',
  'AI_SERVICE_DATABASE_URL',
]) {
  process.env[key] ??= 'postgresql://test:test@localhost:5432/test';
}

export default defineConfig({
  resolve: {
    alias: [{ find: /^@common\/([^/]+)\/(.+)$/, replacement: `${workspaceRoot}/libs/$1/src/lib/$2` }],
  },
  test: {
    root: path.join(workspaceRoot, 'apps/services/payment-service'),
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    globals: true,
  },
});
