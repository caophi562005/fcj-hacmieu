import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  CreateCategoryRequest,
  DeleteCategoryRequest,
  UpdateCategoryRequest,
} from '@common/interfaces/models/catalog';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async list(data: any) {
    const categories = await this.categoryRepository.list(data);
    if (categories.totalItems === 0) {
      throw new NotFoundException('Error.NoCategoriesFound');
    }
    return categories;
  }

  async findById(data: any) {
    const category = await this.categoryRepository.findById(data);
    if (!category) {
      throw new NotFoundException('Error.CategoryNotFound');
    }
    return category;
  }

  async create({ processId, ...data }: CreateCategoryRequest) {
    try {
      const createdCategory = await this.categoryRepository.create(data);
      return createdCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.CategoryAlreadyExists');
      }
    }
  }

  async update({ processId, ...data }: UpdateCategoryRequest) {
    try {
      const updatedCategory = await this.categoryRepository.update(data);
      return updatedCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CategoryNotFound');
      }
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.CategoryAlreadyExists');
      }
      throw error;
    }
  }

  async delete({ processId, ...data }: DeleteCategoryRequest) {
    try {
      const deletedCategory = await this.categoryRepository.delete(data, false);
      return deletedCategory;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.CategoryNotFound');
      }
      throw error;
    }
  }
}
