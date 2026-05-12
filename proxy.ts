import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Phase 4까지 인증 비활성. EVE_AUTH_ENABLED=true 가 되면 Auth.js 흐름으로.
 */
export default function proxy(_req: NextRequest) {
  if (process.env.EVE_AUTH_ENABLED !== "true") {
    return NextResponse.next();
  }
  // Phase 4 진입 시 여기에서 Auth.js auth() 호출 + /login redirect 로직 부활
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
