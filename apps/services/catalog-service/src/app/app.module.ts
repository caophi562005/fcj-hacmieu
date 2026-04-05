import { Module } from '@nestjs/common';
import { AttributeModule } from './modules/attribute/attribute.module';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { SKUModule } from './modules/sku/sku.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CategoryModule,
    BrandModule,
    AttributeModule,
    ProductModule,
    SKUModule,
  ],
})
export class AppModule {}
