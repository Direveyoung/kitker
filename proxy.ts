import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Phase 4까지 인증 비활성. EVE_AUTH_ENABLED=true가 되면 Auth.js 흐름으로.
 */
export default function proxy(_req: NextRequest) {
  if (process.env.EVE_AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
