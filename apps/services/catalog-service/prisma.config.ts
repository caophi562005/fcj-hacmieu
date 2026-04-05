import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.CATALOG_SERVICE_DATABASE_URL || '',
  },
});
