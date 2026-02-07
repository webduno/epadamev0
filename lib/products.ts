import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  created_at: string;
};

export async function getLatestProducts(limit: number = 5): Promise<ProductRow[]> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from("product")
    .select("id, name, description, price, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as ProductRow[];
}

export type SearchSort = "newest" | "price_asc" | "price_desc";

export async function getSearchProducts(
  opts: { q?: string; sort?: SearchSort; limit?: number } = {}
): Promise<ProductRow[]> {
  const { q = "", sort = "newest", limit = 50 } = opts;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  let query = supabase
    .from("product")
    .select("id, name, description, price, created_at");

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

  const { data, error } = await query.limit(Math.min(Math.max(limit, 1), 100));

  if (error) return [];
  return (data ?? []) as ProductRow[];
}
