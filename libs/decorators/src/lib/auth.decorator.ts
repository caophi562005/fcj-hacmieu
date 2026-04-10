import {
  AuthType,
  AuthTypeType,
  ConditionGuard,
  ConditionGuardType,
} from '@common/constants/common.constant';
import { SetMetadata } from '@nestjs/common';

export const AUTH_TYPES_KEY = 'authTypes';

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[];
  options: {
    condition: ConditionGuardType;
  };
};

export const Auth = (
  authTypes: AuthTypeType[],
  options: { condition: ConditionGuardType } = { condition: ConditionGuard.And }
) => {
  return SetMetadata(AUTH_TYPES_KEY, {
    authTypes,
    options,
  });
};

export const IsPublic = () => Auth([AuthType.None]);
