import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getBasicAuthSecret } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const secret = getBasicAuthSecret();

  if (!secret) {
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");

  if (header) {
    const [scheme, encoded] = header.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      if (decoded === secret) {
        return NextResponse.next();
      }
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="My Notes"'
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
