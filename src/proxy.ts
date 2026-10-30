import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!request.cookies.has("sesi")) {
    return NextResponse.redirect(new URL("/masuk", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/katalog/tambah", "/batch/tambah"],
};