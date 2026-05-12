import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import { auth } from "@/auth";
import { MobileTabbar, SidebarNav } from "@/components/layout/nav-list";
import { UserMenu } from "@/components/layout/user-menu";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  return (
    <div className="flex flex-1 min-h-screen">
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-3 border-r bg-sidebar px-3 py-4">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg">🌿</span>
          <span className="text-base font-semibold tracking-tight">eveworks</span>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          disabled
          title="Cmd+K (곧 추가)"
        >
          <Search className="size-4" />
          <span>검색</span>
          <kbd className="ml-auto text-[10px] text-muted-foreground">⌘K</kbd>
        </button>

        <SidebarNav />

        <div className="border-t pt-2">
          <UserMenu email={session.user.email} />
        </div>
      </aside>

      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>

      <MobileTabbar />
    </div>
  );
}
