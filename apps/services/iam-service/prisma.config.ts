import { defineConfig } from 'prisma/config';
import { mysqlDatasourceUrl } from '../../../tools/prisma-datasource';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: mysqlDatasourceUrl('IAM_SERVICE_MYSQL_DATABASE_URL'),
  },
});
