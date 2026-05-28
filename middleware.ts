import { NextResponse, type NextRequest } from "next/server";

const DEV_ONLY_PATHS = new Set(["/debug", "/test", "/test-ai"]);

export function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === "production" &&
    DEV_ONLY_PATHS.has(request.nextUrl.pathname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/debug", "/test", "/test-ai"],
};
