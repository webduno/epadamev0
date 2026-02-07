"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import styles from "./Navbar.module.css";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const isSearchPage = pathname === "/search";

  const setSearchParams = useCallback(
    (updates: { q?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.q !== undefined) {
        if (updates.q.trim()) params.set("q", updates.q.trim());
        else params.delete("q");
      }
      if (updates.sort !== undefined) params.set("sort", updates.sort);
      startTransition(() => {
        router.push(`/search?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
    const value = input?.value?.trim() ?? "";
    if (isSearchPage) {
      setSearchParams({ q: value });
      return;
    }
    const params = new URLSearchParams();
    if (value) params.set("q", value);
    params.set("sort", sort);
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (isSearchPage) {
      setSearchParams({ sort: value });
      return;
    }
    startTransition(() => {
      router.push(`/search?sort=${encodeURIComponent(value)}`);
    });
  };

  return (
    <nav className={styles.nav}>
      <div className={styles.navInner}>
        <Link href="/" className={styles.logo}>
          Home
        </Link>
        <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
          <input
            type="search"
            name="q"
            className={styles.searchInput}
            placeholder="Search products…"
            defaultValue={isSearchPage ? q : undefined}
            key={isSearchPage ? `q-${q}` : "q-landing"}
          />
          <button type="submit" className={styles.searchBtn} disabled={isPending}>
            Search
          </button>
        </form>
        <div className={styles.filters}>
          <label htmlFor="sort" className={styles.sortLabel}>
            Sort
          </label>
          <select
            id="sort"
            className={styles.sortSelect}
            value={sort}
            onChange={handleSortChange}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <Link href="/search" className={styles.link}>
          Products
        </Link>
        <Link
          href="/products"
          className={styles.profileLink}
          title="Manage products"
          aria-label="Manage products"
        >
          <svg
            className={styles.profileIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </Link>
      </div>
    </nav>
  );
}
