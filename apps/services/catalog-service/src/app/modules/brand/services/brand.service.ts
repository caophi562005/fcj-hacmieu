import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  BrandResponse,
  CreateBrandRequest,
  DeleteBrandRequest,
  UpdateBrandRequest,
} from '@common/interfaces/models/catalog';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BrandRepository } from '../repositories/brand.repository';

@Injectable()
export class BrandService {
  constructor(private readonly brandRepository: BrandRepository) {}

  async list(data: any) {
    const brands = await this.brandRepository.list(data);
    if (brands.totalItems === 0) {
      throw new NotFoundException('Error.NoBrandsFound');
    }
    return brands;
  }

  async findById(data: any) {
    const brand = await this.brandRepository.findById(data);
    if (!brand) {
      throw new NotFoundException('Error.BrandNotFound');
    }
    return brand;
  }

  async create({
    processId,
    ...data
  }: CreateBrandRequest): Promise<BrandResponse> {
    try {
      const createdBrand = await this.brandRepository.create(data);
      return createdBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.BrandAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateBrandRequest): Promise<BrandResponse> {
    try {
      const updatedBrand = await this.brandRepository.update(data);
      return updatedBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.BrandNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteBrandRequest): Promise<BrandResponse> {
    try {
      const deletedBrand = await this.brandRepository.delete(data, false);
      return deletedBrand;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.BrandNotFound');
      }
      throw error;
    }
  }
}
