import { useState } from "react";
import { createBrand } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import type { Brand, Category } from "../../types";
import { getErrorMessage } from "../../utils/format";

type BrandCardProps = {
  brands: Brand[];
  categories: Category[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
};

export function BrandCard({
  brands,
  categories,
  onChanged,
  onError,
}: BrandCardProps) {
  const { credentials } = useAuth();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  async function handleAdd() {
    if (!credentials || !categoryId || name.trim().length < 2) {
      onError("Select a category and enter a valid brand name.");
      return;
    }
    try {
      await createBrand(
        { categoryId, name: name.trim() },
        credentials.username,
        credentials.password,
      );
      setName("");
      await onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return (
    <article className="card">
      <h3>Brands</h3>
      <ul className="simple-list">
        {brands.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span className="text-muted">
              {categoryMap.get(item.categoryId) ?? "-"}
            </span>
          </li>
        ))}
      </ul>
      <div className="column controls" style={{ marginTop: 12 }}>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="row controls">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New brand name"
            style={{ flex: 1 }}
            onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
          />
          <button onClick={() => void handleAdd()}>Add</button>
        </div>
      </div>
    </article>
  );
}
