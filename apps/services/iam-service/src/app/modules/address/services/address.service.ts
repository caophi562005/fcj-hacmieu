import { PrismaErrorValues } from '@common/constants/prisma.constant';
import {
  AddressResponse,
  CreateAddressRequest,
  DeleteAddressRequest,
  GetAddressRequest,
  GetManyAddressesRequest,
  GetManyAddressesResponse,
  UpdateAddressRequest,
} from '@common/interfaces/models/user-access';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../repositories/address.repository';

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async list(data: GetManyAddressesRequest): Promise<GetManyAddressesResponse> {
    const addresses = await this.addressRepository.list(data);
    if (addresses.totalItems === 0) {
      throw new NotFoundException('Error.AddressNotFound');
    }
    return addresses;
  }

  async findById(data: GetAddressRequest): Promise<AddressResponse> {
    const address = await this.addressRepository.findById(data);
    if (!address) {
      throw new NotFoundException('Error.AddressNotFound');
    }
    return address;
  }

  async create({
    processId,
    ...data
  }: CreateAddressRequest): Promise<AddressResponse> {
    try {
      const createdAddress = await this.addressRepository.create(data);
      return createdAddress;
    } catch (error) {
      if (error.code === PrismaErrorValues.UNIQUE_CONSTRAINT_VIOLATION) {
        throw new NotFoundException('Error.AddressAlreadyExists');
      }
      throw error;
    }
  }

  async update({
    processId,
    ...data
  }: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const updatedAddress = await this.addressRepository.update(data);
      return updatedAddress;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AddressNotFound');
      }
      throw error;
    }
  }

  async delete(data: DeleteAddressRequest): Promise<AddressResponse> {
    try {
      const deletedAddress = await this.addressRepository.delete(data);
      return deletedAddress;
    } catch (error) {
      if (error.code === PrismaErrorValues.RECORD_NOT_FOUND) {
        throw new NotFoundException('Error.AddressNotFound');
      }
      throw error;
    }
  }
}
