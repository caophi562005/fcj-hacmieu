import { ID_TOKEN_COOKIE } from '@common/web-core/index';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const token = (await cookies()).get(ID_TOKEN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(
    { token },
    { headers: { 'Cache-Control': 'no-store, private' } },
  );
}
