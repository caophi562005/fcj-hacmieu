import {
  ATTRIBUTE_MODULE_SERVICE_NAME,
  AttributeModuleClient,
  AttributeResponse,
  CATALOG_SERVICE_PACKAGE_NAME,
  GetAttributeRequest,
  GetManyAttributesRequest,
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

  async getManyAttributes(data: GetManyAttributesRequest): Promise<any> {
    return firstValueFrom(this.attributeModule.getManyAttributes(data));
  }

  async getAttribute(data: GetAttributeRequest): Promise<AttributeResponse> {
    return firstValueFrom(this.attributeModule.getAttribute(data));
  }
}
