import Link from "next/link";
import styles from "./page.module.css";
import { UsersCount } from "./components/UsersCount";
import { getAuthUser } from "@/lib/auth";
import { LogoutButton } from "./components/LogoutButton";

export default async function Home() {
  const user = await getAuthUser();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {user ? (
          <>
            <p>
              Users: <UsersCount />
            </p>
            <div className={styles.ctas}>
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
      </main>
    </div>
  );
}
