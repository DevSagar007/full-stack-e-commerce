import { NextResponse } from "next/server";
import { getProductById, getRelatedProducts } from "@/services/product.service";

export async function GET(_request: Request, { params }: RouteContext<"/api/products/[id]/related">) {
  const { id } = await params;
  if (!(await getProductById(id))) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ items: await getRelatedProducts(id) });
}
