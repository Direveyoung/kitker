import { auth } from "@/auth";

export type EveSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

/**
 * Phase 4까지 dev user 하드코딩.
 * EVE_AUTH_ENABLED=true 가 되면 Auth.js v5로 폴백.
 */
export async function getSession(): Promise<EveSession | null> {
  if (process.env.EVE_AUTH_ENABLED === "true") {
    const real = await auth();
    if (!real?.user?.id || !real.user.email) return null;
    return {
      user: {
        id: real.user.id,
        email: real.user.email,
        name: real.user.name ?? "Eve",
      },
    };
  }

  const id = process.env.EVE_DEV_USER_ID;
  if (!id) {
    throw new Error("EVE_DEV_USER_ID가 .env.local에 없습니다");
  }
  return {
    user: {
      id,
      email: "pm.younga@gmail.com",
      name: "영아",
    },
  };
}

export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}
