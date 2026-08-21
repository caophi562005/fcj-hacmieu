import type { UserIdentity } from 'convex/server';
import { ConvexError } from 'convex/values';

type AuthContext = {
  auth: { getUserIdentity(): Promise<UserIdentity | null> };
};

export async function requireIdentity(ctx: AuthContext): Promise<UserIdentity> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  return identity;
}

export async function requireUserId(ctx: AuthContext): Promise<string> {
  return (await requireIdentity(ctx)).subject;
}

export async function requireAdmin(ctx: AuthContext): Promise<UserIdentity> {
  const identity = await requireIdentity(ctx);
  const claims = identity as UserIdentity & Record<string, unknown>;
  const rawGroups = claims['cognito:groups'] ?? claims['groups'];
  const groups = Array.isArray(rawGroups)
    ? rawGroups.map(String)
    : typeof rawGroups === 'string'
      ? rawGroups.split(',').map((group) => group.trim())
      : [];

  if (!groups.includes('ADMIN')) {
    throw new ConvexError({ code: 'FORBIDDEN', message: 'Admin role required' });
  }
  return identity;
}
