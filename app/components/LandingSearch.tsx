"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import styles from "./LandingSearch.module.css";

export function LandingSearch() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const value = input?.value?.trim() ?? "";
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Search products</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="search"
          name="q"
          className={styles.input}
          placeholder="Search by name or description…"
          aria-label="Search products"
        />
        <button type="submit" className={styles.button} disabled={isPending}>
          {isPending ? "…" : "Go to search"}
        </button>
      </form>
    </section>
  );
}
