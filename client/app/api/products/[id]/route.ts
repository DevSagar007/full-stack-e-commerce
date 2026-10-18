import { NextResponse } from "next/server";
import { getProductById } from "@/services/product.service";

export async function GET(_request: Request, { params }: RouteContext<"/api/products/[id]">) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}
