import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/auth/dev-session";
import { getPage } from "@/lib/pages/queries";
import { PageEditor } from "@/components/pages/page-editor";

export const dynamic = "force-dynamic";

export default async function PageDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const page = await getPage(userId, id);
  if (!page) notFound();
  return <PageEditor key={page.id} page={page} />;
}
