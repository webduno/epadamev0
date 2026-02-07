import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthUser } from "@/lib/auth";
import { ProductsCrud } from "../components/ProductsCrud";
import styles from "../register/register.module.css";

export default async function ProductsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className={styles.page}>
      <main className={styles.main} style={{ maxWidth: "640px" }}>
        <h1>Products</h1>
        <p style={{ margin: 0, fontSize: 14 }}>
          Manage products. Only visible when logged in.
        </p>
        <ProductsCrud />
        <Link href="/" className={styles.link}>
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
