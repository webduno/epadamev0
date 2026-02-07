import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthUser } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") ?? "50", 10), 1), 100);
  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as "newest" | "price_asc" | "price_desc";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let query = supabase
    .from("product")
    .select("id, name, description, price, created_at, created_by");

  const term = q.trim();
  if (term) {
    query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true, nullsFirst: false });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false, nullsFirst: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = body?.name != null ? String(body.name).trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const description = body?.description != null ? String(body.description).trim() : null;
  const price = body?.price != null ? Number(body.price) : null;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from("product")
    .insert({
      name,
      description: description || null,
      price: Number.isFinite(price) ? price : null,
      created_by: user.sub,
    })
    .select("id, name, description, price, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
