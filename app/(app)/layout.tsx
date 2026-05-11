import { redirect } from "next/navigation";
import { CheckSquare, FileText, Inbox } from "lucide-react";
import { auth } from "@/auth";
import { NavLink } from "@/components/layout/nav-link";
import { UserMenu } from "@/components/layout/user-menu";

const NAV_ITEMS = [
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/todo", label: "Todo", icon: CheckSquare },
  { href: "/notes", label: "Notes", icon: FileText },
] as const;

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
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} variant="sidebar" />
          ))}
        </nav>
        <UserMenu email={session.user.email} />
      </aside>

      <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t bg-background md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} variant="tabbar" />
        ))}
      </nav>
    </div>
  );
}
