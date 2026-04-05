export const PORT = 3000;

export enum MetadataKeys {
  PROCESS_ID = 'processId',
  START_TIME = 'startTime',
  USER_DATA = 'userData',
}

export const AuthType = {
  Cookie: 'Cookie',
  None: 'None',
  PaymentAPIKey: 'PaymentAPIKey',
} as const;

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export const ConditionGuard = {
  And: 'and',
  Or: 'or',
} as const;

export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];
