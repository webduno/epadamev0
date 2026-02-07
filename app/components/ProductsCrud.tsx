"use client";

import { useState, useEffect } from "react";
import styles from "../register/register.module.css";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  created_at: string;
};

export function ProductsCrud() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function resetForm() {
    setEditingId(null);
    setFormName("");
    setFormDescription("");
    setFormPrice("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editingId) {
        const body: { name: string; description?: string; price?: number | null } = { name: formName.trim() };
        if (formDescription.trim() !== "") body.description = formDescription.trim();
        const p = formPrice.trim() ? parseFloat(formPrice) : null;
        body.price = p !== null && Number.isFinite(p) ? p : null;
        const res = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Update failed");
        setProducts((prev) => prev.map((x) => (x.id === editingId ? { ...x, ...data } : x)));
        resetForm();
      } else {
        const body: { name: string; description?: string; price?: number | null } = { name: formName.trim() };
        if (formDescription.trim() !== "") body.description = formDescription.trim();
        const p = formPrice.trim() ? parseFloat(formPrice) : null;
        body.price = p !== null && Number.isFinite(p) ? p : null;
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Create failed");
        setProducts((prev) => [data, ...prev]);
        resetForm();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setError("");
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Delete failed");
      }
      setProducts((prev) => prev.filter((x) => x.id !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setFormName(p.name);
    setFormDescription(p.description ?? "");
    setFormPrice(p.price != null ? String(p.price) : "");
  }

  if (loading) return <p>Loading products…</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form} style={{ marginBottom: 24 }}>
        <input type="hidden" value={editingId ?? ""} readOnly />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Name
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
            placeholder="Product name"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Description
          <input
            type="text"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Optional description"
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          Price
          <input
            type="number"
            step="0.01"
            min="0"
            value={formPrice}
            onChange={(e) => setFormPrice(e.target.value)}
            placeholder="Optional price"
          />
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={submitting}>
            {editingId ? "Update" : "Add"} product
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>All products</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {products.length === 0 ? (
            <li>No products yet.</li>
          ) : (
            products.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(var(--gray-rgb, 0,0,0), 0.1)",
                }}
              >
                <span>
                  <strong>{p.name}</strong>
                  {p.description && ` — ${p.description}`}
                  {p.price != null && ` · $${Number(p.price).toFixed(2)}`}
                </span>
                <span style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => startEdit(p)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(p.id)}>
                    Delete
                  </button>
                </span>
              </li>
            ))
          )}
        </ul>
      </section>
    </>
  );
}
