import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithEmail } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ "check-email"?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const checkEmail = params["check-email"] === "1";

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight">🌿 eveworks</h1>
          <p className="text-sm text-muted-foreground">
            Eve(김영아)의 개인 워크스페이스
          </p>
        </div>

        {checkEmail ? (
          <div className="rounded-lg border bg-card p-6 text-center text-sm space-y-2">
            <p className="font-medium">📬 이메일을 확인하세요</p>
            <p className="text-muted-foreground">
              로그인 링크를 보냈습니다. 메일함을 확인해주세요.
            </p>
          </div>
        ) : (
          <form action={loginWithEmail} className="space-y-3">
            <Input
              name="email"
              type="email"
              placeholder="pm.younga@gmail.com"
              required
              autoComplete="email"
              autoFocus
            />
            <Button type="submit" className="w-full">
              매직 링크 받기
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
