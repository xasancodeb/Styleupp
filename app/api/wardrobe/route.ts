import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";
import { parseBody } from "@/lib/validation";
import { analyseGarment, isAIConfigured } from "@/lib/ai";
import { toItem } from "@/lib/wardrobe";

export const dynamic = "force-dynamic";

// Photos arrive already resized by the browser; this is a backstop against a
// hand-rolled request, not the normal path.
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

const addItemSchema = z.object({
  // A data URL: "data:image/jpeg;base64,...."
  image: z.string().startsWith("data:image/").max(Math.ceil(MAX_IMAGE_BYTES * 1.4)),
});

function decodeDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const [, mediaType, base64] = match;
  const bytes = Buffer.from(base64, "base64");
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_BYTES) return null;
  return { mediaType: mediaType as "image/jpeg" | "image/png" | "image/webp", base64, bytes };
}

// GET /api/wardrobe — every garment the signed-in person owns.
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("profile_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: (data ?? []).map(toItem) });
}

// POST /api/wardrobe — read a garment photo, store it, catalogue it.
export async function POST(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  if (!isAIConfigured()) {
    return NextResponse.json(
      { error: "The wardrobe is not switched on yet. ANTHROPIC_API_KEY is missing." },
      { status: 503 }
    );
  }

  const parsed = await parseBody(request, addItemSchema);
  if (!parsed.ok) return parsed.response;

  const decoded = decodeDataUrl(parsed.data.image);
  if (!decoded) {
    return NextResponse.json(
      { error: "That image could not be read. Use a JPEG, PNG or WebP under 6MB." },
      { status: 400 }
    );
  }

  // Read the garment first: if Claude cannot make sense of the photo there is
  // no point keeping the upload.
  let analysis;
  try {
    analysis = await analyseGarment(decoded.base64, decoded.mediaType);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read that photo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // Service role for the write: the object key is namespaced by profile id, so
  // it still lands in the owner's folder.
  const ext = decoded.mediaType === "image/png" ? "png" : decoded.mediaType === "image/webp" ? "webp" : "jpg";
  const key = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;
  const admin = supabaseAdmin();

  const { error: uploadError } = await admin.storage
    .from("wardrobe")
    .upload(key, decoded.bytes, { contentType: decoded.mediaType, upsert: false });
  if (uploadError) {
    return NextResponse.json({ error: `Could not save that photo: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrl } = admin.storage.from("wardrobe").getPublicUrl(key);

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("wardrobe_items")
    .insert({
      profile_id: auth.user.id,
      image_url: publicUrl.publicUrl,
      name: analysis.name,
      category: analysis.category,
      color_name: analysis.colorName,
      color_hex: analysis.colorHex,
      pattern: analysis.pattern,
      formality: analysis.formality,
      warmth: analysis.warmth,
      notes: analysis.notes,
    })
    .select("*")
    .single();

  if (error || !data) {
    // Don't leave the orphaned object behind if the row failed.
    await admin.storage.from("wardrobe").remove([key]);
    return NextResponse.json({ error: error?.message ?? "Could not save that item." }, { status: 500 });
  }

  return NextResponse.json({ item: toItem(data) }, { status: 201 });
}

// DELETE /api/wardrobe?id=... — remove a garment and its photo.
export async function DELETE(request: Request) {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  const supabase = await supabaseServer();
  // Scoped by profile_id as well as id so a guessed uuid deletes nothing.
  const { data, error } = await supabase
    .from("wardrobe_items")
    .delete()
    .eq("id", id)
    .eq("profile_id", auth.user.id)
    .select("image_url")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "That item is not in your wardrobe." }, { status: 404 });

  // Derive the object key back out of the public URL.
  const marker = "/wardrobe/";
  const at = data.image_url.indexOf(marker);
  if (at !== -1) {
    const key = data.image_url.slice(at + marker.length).split("?")[0];
    await supabaseAdmin().storage.from("wardrobe").remove([key]);
  }

  return NextResponse.json({ deleted: true });
}
