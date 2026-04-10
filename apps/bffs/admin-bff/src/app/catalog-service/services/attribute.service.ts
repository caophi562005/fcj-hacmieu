import {
  ATTRIBUTE_MODULE_SERVICE_NAME,
  AttributeModuleClient,
  AttributeResponse,
  CATALOG_SERVICE_PACKAGE_NAME,
  CreateAttributeRequest,
  DeleteAttributeRequest,
  UpdateAttributeRequest,
} from '@common/interfaces/proto-types/catalog';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AttributeService implements OnModuleInit {
  private attributeModule!: AttributeModuleClient;

  constructor(
    @Inject(CATALOG_SERVICE_PACKAGE_NAME)
    private catalogClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.attributeModule = this.catalogClient.getService<AttributeModuleClient>(
      ATTRIBUTE_MODULE_SERVICE_NAME,
    );
  }

  async createAttribute(
    data: CreateAttributeRequest,
  ): Promise<AttributeResponse> {
    return firstValueFrom(this.attributeModule.createAttribute(data));
  }

  async updateAttribute(
    data: UpdateAttributeRequest,
  ): Promise<AttributeResponse> {
    return firstValueFrom(this.attributeModule.updateAttribute(data));
  }

  async deleteAttribute(
    data: DeleteAttributeRequest,
  ): Promise<AttributeResponse> {
    return firstValueFrom(this.attributeModule.deleteAttribute(data));
  }
}
