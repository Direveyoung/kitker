import { put } from "@vercel/blob";
import { requireUserId } from "@/lib/auth/dev-session";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  const userId = await requireUserId();
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "file too large (max 10MB)" }, { status: 413 });
  }

  const name = file.name || "image";
  const ext = (name.split(".").pop() || "png").toLowerCase();
  const filename = `eveworks/${userId}/${Date.now()}.${ext}`;

  try {
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch (err) {
    console.error("[upload]", err);
    const message = err instanceof Error ? err.message : "upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
