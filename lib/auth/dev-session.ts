/**
 * Phase 4까지 dev user 하드코딩.
 * EVE_AUTH_ENABLED=true가 되면 Auth.js v5 흐름으로 폴백.
 */
export type EveSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export async function getSession(): Promise<EveSession | null> {
  if (process.env.EVE_AUTH_ENABLED === "true") {
    // Phase 4 진입 시 여기서 Auth.js auth() 호출
    throw new Error("Auth.js 미구현 (Phase 4에서 추가)");
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
