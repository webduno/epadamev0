import Link from "next/link";
import styles from "./page.module.css";
import { UsersCount } from "./components/UsersCount";
import { getAuthUser } from "@/lib/auth";
import { LogoutButton } from "./components/LogoutButton";
import { getLatestProducts } from "@/lib/products";
import { LandingSearch } from "./components/LandingSearch";

export default async function Home() {
  const [user, latestProducts] = await Promise.all([
    getAuthUser(),
    getLatestProducts(5),
  ]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <LandingSearch />
        {user ? (
          <>
            <p>
              Users: <UsersCount />
            </p>
            <div className={styles.ctas}>
              <Link href="/products" className={styles.primary}>
                Manage products
              </Link>
              <LogoutButton />
            </div>
          </>
        ) : (
          <div className={styles.ctas}>
            <Link href="/login" className={styles.primary}>
              Log in
            </Link>
            <Link href="/register" className={styles.secondary}>
              Register
            </Link>
          </div>
        )}

        <section className={styles.productsSection}>
          <h2 className={styles.productsTitle}>Latest products</h2>
          {latestProducts.length === 0 ? (
            <p className={styles.productsEmpty}>No products yet.</p>
          ) : (
            <ul className={styles.productsList}>
              {latestProducts.map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong>
                  {p.description && ` — ${p.description}`}
                  {p.price != null && ` · $${Number(p.price).toFixed(2)}`}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
