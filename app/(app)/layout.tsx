import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MobileTabbar, SidebarNav } from "@/components/layout/nav-list";
import { UserMenu } from "@/components/layout/user-menu";
import { SearchTrigger } from "@/components/search/search-trigger";

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

        <SearchTrigger />

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
