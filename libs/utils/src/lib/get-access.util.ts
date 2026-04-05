import { parse } from 'cookie';

const extractJwtFromCookie = (req: any): string | null => {
  const cookie = req.headers.cookie
    ? req.headers.cookie
    : req.body.Event.HTTPRequest.Header.Cookie?.[0];
  if (cookie) {
    const cookies = parse(cookie);
    return cookies['accessToken'] || null;
  }
  return null;
};

export const getAccessToken = (req: any): string | null => {
  if (req.headers.authorization) {
    return req.headers.authorization.split(' ')[1];
  }
  return extractJwtFromCookie(req);
};

export const extractJwtFromCookieTusd = (req: any): string | null => {
  const cookie = req.Event.HTTPRequest.Header.Cookie?.[0];
  if (cookie) {
    const cookies = parse(cookie);
    return cookies['accessToken'] || null;
  }
  return null;
};
