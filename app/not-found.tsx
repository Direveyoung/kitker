import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 items-center justify-center p-12">
      <div className="space-y-3 text-center">
        <div className="text-5xl">🌿</div>
        <h1 className="text-2xl font-semibold tracking-tight">
          페이지를 찾을 수 없어요
        </h1>
        <p className="text-sm text-muted-foreground">
          v2 재출발하면서 일부 경로가 바뀌었어요.
        </p>
        <Link
          href="/today"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Today로 가기
        </Link>
      </div>
    </main>
  );
}
