export const metadata = { title: "오프라인 · eveworks" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-12 text-center">
      <div className="text-5xl">🌿</div>
      <h1 className="text-2xl font-semibold tracking-tight">오프라인</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        지금은 네트워크에 연결되어 있지 않아요. 연결되면 자동으로 다시 불러옵니다.
      </p>
      <a
        href="/today"
        className="mt-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-deep"
      >
        다시 시도
      </a>
    </div>
  );
}
