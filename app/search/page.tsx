import { getSearchProducts, type SearchSort } from "@/lib/products";
import styles from "../page.module.css";

type SearchPageProps = {
  searchParams: { q?: string; sort?: string };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = searchParams.q ?? "";
  const sort = (searchParams.sort ?? "newest") as SearchSort;

  const products = await getSearchProducts({
    q: q.trim() || undefined,
    sort,
    limit: 50,
  });

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.productsTitle}>
          {q.trim() ? `Results for “${q.trim()}”` : "All products"}
        </h1>
        {products.length === 0 ? (
          <p className={styles.productsEmpty}>
            {q.trim() ? "No products match your search." : "No products yet."}
          </p>
        ) : (
          <ul className={styles.productsList}>
            {products.map((p) => (
              <li key={p.id}>
                <strong>{p.name}</strong>
                {p.description && ` — ${p.description}`}
                {p.price != null && ` · $${Number(p.price).toFixed(2)}`}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
