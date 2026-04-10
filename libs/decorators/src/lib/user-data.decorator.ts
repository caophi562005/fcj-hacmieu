import { MetadataKeys } from '@common/constants/common.constant';
import { ValidateTokenResponse } from '@common/interfaces/proto-types/iam';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserData = createParamDecorator(
  (field: keyof ValidateTokenResponse | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const userData: ValidateTokenResponse | undefined =
      request[MetadataKeys.USER_DATA];
    return field ? userData?.[field] : userData;
  },
);
