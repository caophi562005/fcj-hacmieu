import { NextRequest, NextResponse } from 'next/server';
import { createServerApi } from '../../../../lib/api';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const api = await createServerApi();
    const res = await api.get(`/catalog/product/${id}`, {
      validateStatus: (s) => (s >= 200 && s < 300) || s === 404,
    });
    if (res.status === 404) return NextResponse.json(null, { status: 404 });
    const product = res.data?.data;
    if (!product) return NextResponse.json(null, { status: 404 });
    return NextResponse.json({
      id: product.id,
      name: product.name,
      virtualPrice: product.virtualPrice,
      images: product.images,
    });
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
