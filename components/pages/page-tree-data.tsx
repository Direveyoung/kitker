import { requireUserId } from "@/lib/auth/dev-session";
import { getPageTree } from "@/lib/pages/queries";
import { PageTree } from "./page-tree";

export async function PageTreeData() {
  const userId = await requireUserId();
  const nodes = await getPageTree(userId);
  return <PageTree nodes={nodes} />;
}
