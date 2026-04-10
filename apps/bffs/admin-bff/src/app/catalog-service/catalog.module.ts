import { GrpcClientProvider } from '@common/configurations/grpc.config';
import { GrpcService } from '@common/constants/grpc.constant';
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AttributeController } from './controllers/attribute.controller';
import { BrandController } from './controllers/brand.controller';
import { CategoryController } from './controllers/category.controller';
import { ProductController } from './controllers/product.controller';
import { AttributeService } from './services/attribute.service';
import { BrandService } from './services/brand.service';
import { CategoryService } from './services/category.service';
import { ProductService } from './services/product.service';

@Module({
  imports: [
    ClientsModule.register([GrpcClientProvider(GrpcService.CATALOG_SERVICE)]),
  ],
  controllers: [
    AttributeController,
    BrandController,
    CategoryController,
    ProductController,
  ],
  providers: [AttributeService, BrandService, CategoryService, ProductService],
})
export class CatalogModule {}
