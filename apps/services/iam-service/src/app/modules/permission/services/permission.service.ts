import {
  CreateManyPermissionsRequest,
  CreatePermissionRequest,
  DeleteManyPermissionsRequest,
  DeletePermissionRequest,
  GetAllPermissionsRequest,
  GetManyPermissionsRequest,
  GetPermissionRequest,
  UpdatePermissionRequest,
} from '@common/interfaces/models/iam';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async list(data: GetManyPermissionsRequest) {
    const permissions = await this.permissionRepository.list(data);
    if (permissions.totalItems === 0) {
      throw new NotFoundException('Error.Permission.NotFound');
    }
    return permissions;
  }

  async listAll(data: GetAllPermissionsRequest) {
    const permissions = await this.permissionRepository.listAll(data);
    if (permissions.permissions.length === 0) {
      return {
        permissions: [],
      };
    }
    return permissions;
  }

  async findById(data: GetPermissionRequest) {
    const permission = await this.permissionRepository.findById(data);
    if (!permission) {
      throw new NotFoundException('Error.Permission.NotFound');
    }
    return permission;
  }

  async create(data: CreatePermissionRequest) {
    return this.permissionRepository.create(data);
  }

  async createMany(data: CreateManyPermissionsRequest) {
    return this.permissionRepository.createMany(data);
  }

  async update(data: UpdatePermissionRequest) {
    const permission = await this.permissionRepository.findById({
      id: data.id,
    });
    if (!permission) {
      throw new NotFoundException('Error.Permission.NotFound');
    }
    return this.permissionRepository.update(data);
  }

  async delete(data: DeletePermissionRequest) {
    const permission = await this.permissionRepository.findById({
      id: data.id,
    });
    if (!permission) {
      throw new NotFoundException('Error.Permission.NotFound');
    }
    return this.permissionRepository.delete(data);
  }

  async deleteMany(data: DeleteManyPermissionsRequest) {
    return this.permissionRepository.deleteMany(data);
  }
}
