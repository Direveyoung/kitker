import { redirect } from "next/navigation";
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
      <aside className="hidden md:flex w-56 shrink-0 flex-col gap-2 border-r bg-sidebar p-4">
        <div className="mb-2 px-3 py-2 text-lg font-bold">🌿 eveworks</div>
        <SidebarNav />
        <UserMenu email={session.user.email} />
      </aside>

      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>

      <MobileTabbar />
    </div>
  );
}
