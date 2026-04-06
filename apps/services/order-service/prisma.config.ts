import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: process.env.ORDER_SERVICE_DATABASE_URL || '',
  },
});
