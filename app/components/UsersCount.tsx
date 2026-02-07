"use client";

import { useEffect, useState } from "react";

export function UsersCount() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users/count", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setCount(data.count))
      .catch(() => setError("Could not load user count"));
  }, []);

  if (error) return <span>{error}</span>;
  if (count === null) return <span>…</span>;
  return <span>{count}</span>;
}
