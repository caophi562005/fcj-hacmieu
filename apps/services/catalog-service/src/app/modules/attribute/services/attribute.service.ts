import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  AttributeResponse,
  CreateAttributeRequest,
  DeleteAttributeRequest,
  UpdateAttributeRequest,
} from '@common/interfaces/models/catalog';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttributeRepository } from '../repositories/attribute.repository';

@Injectable()
export class AttributeService {
  constructor(private readonly attributeRepository: AttributeRepository) {}

  async create({
    processId,
    ...data
  }: CreateAttributeRequest): Promise<AttributeResponse> {
    try {
      const createdAttribute = await this.attributeRepository.create(data);
      return createdAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictException('Error.AttributeAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateAttributeRequest): Promise<AttributeResponse> {
    try {
      const updatedAttribute = await this.attributeRepository.update(data);
      return updatedAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AttributeNotFound');
      }
      throw error;
    }
  }

  async delete({
    processId,
    ...data
  }: DeleteAttributeRequest): Promise<AttributeResponse> {
    try {
      const deletedAttribute = await this.attributeRepository.delete(
        data,
        false,
      );
      return deletedAttribute;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AttributeNotFound');
      }
      throw error;
    }
  }
}
