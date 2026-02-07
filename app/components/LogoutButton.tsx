"use client";

import { useRouter } from "next/navigation";
import styles from "../page.module.css";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleLogout} className={styles.ctas}>
      <button type="submit" className={styles.primaryButton}>
        Log out
      </button>
    </form>
  );
}
