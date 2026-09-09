import { CacheProvider } from '@common/configurations/redis.config';
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { MarketingPreferenceModule } from './modules/marketing-preference/marketing-preference.module';
import { PermissionModule } from './modules/permission/permission.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    CacheProvider,
    PrismaModule,
    AuthModule,
    MarketingPreferenceModule,
    PermissionModule,
    UserModule,
  ],
})
export class AppModule {}
