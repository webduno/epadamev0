import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from("product")
    .select("id, name, description, price, created_at, updated_at, created_by")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await request.json();
  const name = body?.name != null ? String(body.name).trim() : undefined;
  if (name !== undefined && !name) {
    return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
  }

  const description = body?.description != null ? String(body.description).trim() : undefined;
  const price = body?.price != null ? Number(body.price) : undefined;

  const updates: { name?: string; description?: string | null; price?: number | null } = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description || null;
  if (price !== undefined) updates.price = Number.isFinite(price) ? price : null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: product, error: fetchError } = await supabase
    .from("product")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    if (fetchError?.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: fetchError?.message ?? "Not found" }, { status: 500 });
  }

  const ownerId = product.created_by != null ? String(product.created_by) : null;
  if (ownerId !== String(user.sub)) {
    return NextResponse.json({ error: "Forbidden: only the owner can edit this product" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("product")
    .update(updates)
    .eq("id", id)
    .select("id, name, description, price, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: product, error: fetchError } = await supabase
    .from("product")
    .select("created_by")
    .eq("id", id)
    .single();

  if (fetchError || !product) {
    if (fetchError?.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: fetchError?.message ?? "Not found" }, { status: 500 });
  }

  const ownerId = product.created_by != null ? String(product.created_by) : null;
  if (ownerId !== String(user.sub)) {
    return NextResponse.json({ error: "Forbidden: only the owner can delete this product" }, { status: 403 });
  }

  const { error } = await supabase.from("product").delete().eq("id", id);

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
