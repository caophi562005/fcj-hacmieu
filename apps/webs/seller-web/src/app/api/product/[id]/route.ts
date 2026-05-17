import { NextRequest, NextResponse } from 'next/server';
import { getSellerProductById } from '../../../../lib/catalog';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const product = await getSellerProductById(id);
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
