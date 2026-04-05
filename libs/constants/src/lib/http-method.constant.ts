import { z } from 'zod';

export const HttpMethodValues = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export const HttpMethodEnums = z.enum([
  HttpMethodValues.GET,
  HttpMethodValues.POST,
  HttpMethodValues.PUT,
  HttpMethodValues.DELETE,
  HttpMethodValues.PATCH,
  HttpMethodValues.OPTIONS,
  HttpMethodValues.HEAD,
]);
