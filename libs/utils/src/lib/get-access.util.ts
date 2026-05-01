import { parse } from 'cookie';

const extractCookieFromReq = (req: any, name: string): string | null => {
  const cookie = req.headers.cookie
    ? req.headers.cookie
    : req.body?.Event?.HTTPRequest?.Header?.Cookie?.[0];
  if (cookie) {
    const cookies = parse(cookie);
    return cookies[name] || null;
  }
  return null;
};

export const getAccessToken = (req: any): string | null => {
  if (req.headers.authorization) {
    return req.headers.authorization.split(' ')[1];
  }
  return extractCookieFromReq(req, 'access_token');
};

export const getIdToken = (req: any): string | null => {
  // Header dùng cho client gọi BFF; cookie dùng khi web forward.
  const headerToken = req.headers['x-id-token'];
  if (typeof headerToken === 'string' && headerToken) return headerToken;
  return extractCookieFromReq(req, 'id_token');
};

export const extractJwtFromCookieTusd = (req: any): string | null => {
  const cookie = req.Event.HTTPRequest.Header.Cookie?.[0];
  if (cookie) {
    const cookies = parse(cookie);
    return cookies['access_token'] || null;
  }
  return null;
};
