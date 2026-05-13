// server.ts — server-only exports (uses cookies(), next/navigation)
export { createApiFactory } from './lib/api-factory';
export { isAuthed } from './lib/auth-helpers';
export {
  ACCESS_TOKEN_COOKIE,
  ID_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from './lib/constants';
export { changePassword, getCurrentUser, logout } from './lib/iam';
export { createOidcClientFactory } from './lib/oidc-factory';

export { fetchDistricts, fetchProvinces, fetchWards } from './lib/location';
export type {
  DistrictResponse,
  ProvinceResponse,
  WardResponse,
} from './lib/location';
export { createPresignedUrl } from './lib/media';
