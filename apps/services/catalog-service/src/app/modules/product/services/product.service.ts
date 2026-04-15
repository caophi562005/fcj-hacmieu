import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateProductRequest,
  DeleteProductRequest,
  ProductResponse,
  UpdateProductRequest,
  ValidateProductsRequest,
  ValidateProductsResponse,
} from '@common/interfaces/models/catalog';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../repositories/product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async list(data: any) {
    const products = await this.productRepository.list(data);
    if (products.totalItems === 0) {
      throw new NotFoundException('Error.NoProductsFound');
    }
    return products;
  }

  async findById(data: any) {
    const product = await this.productRepository.findById(data);
    if (!product) {
      throw new NotFoundException('Error.ProductNotFound');
    }
    return product;
  }

  async create({
    processId,
    ...data
  }: CreateProductRequest): Promise<ProductResponse> {
    const createdProduct = await this.productRepository.create(data);
    return createdProduct;
  }

  async update({
    processId,
    ...data
  }: UpdateProductRequest): Promise<ProductResponse> {
    try {
      const updatedProduct = await this.productRepository.update(data);
      return updatedProduct;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ProductNotFound');
      }
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.ProductAlreadyExists');
      }
      throw error;
    }
  }

  async delete({ processId, ...data }: DeleteProductRequest) {
    try {
      const deletedProduct = await this.productRepository.delete(data, false);
      return deletedProduct;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.ProductNotFound');
      }
      throw error;
    }
  }

  async validateProducts(
    data: ValidateProductsRequest,
  ): Promise<ValidateProductsResponse> {
    return this.productRepository.validateProducts(data);
  }
}
