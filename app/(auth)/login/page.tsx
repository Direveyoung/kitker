import { Mail } from "lucide-react";
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
    <main className="flex flex-1 items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <div className="text-4xl">🌿</div>
          <h1 className="text-2xl font-bold tracking-tight">eveworks</h1>
          <p className="text-sm text-muted-foreground">
            Eve(김영아)의 개인 워크스페이스
          </p>
        </div>

        {checkEmail ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-5 text-center text-sm">
            <Mail className="mx-auto size-7 text-primary" />
            <p className="font-medium">이메일을 확인하세요</p>
            <p className="text-xs text-muted-foreground">
              로그인 링크를 메일로 보냈습니다.
              <br />
              스팸함 / Promotions 탭도 확인해주세요.
            </p>
          </div>
        ) : (
          <form action={loginWithEmail} className="space-y-3">
            <Input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              autoFocus
              className="h-11"
            />
            <Button type="submit" className="h-11 w-full" size="lg">
              매직 링크 받기
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              비밀번호 없이 이메일로 로그인합니다.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
