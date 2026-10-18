import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";
import { parseProductQuery } from "@/lib/product-query";

// Mock REST endpoint over the same service the pages use. Malformed params are normalized, not rejected.
export async function GET(request: NextRequest) {
  try {
    const result = await getProducts(parseProductQuery(request.nextUrl.searchParams));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
