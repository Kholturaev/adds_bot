import { useState } from "react";
import { createCategory } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import type { Category } from "../../types";
import { getErrorMessage } from "../../utils/format";

type CategoryCardProps = {
  categories: Category[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
};

export function CategoryCard({
  categories,
  onChanged,
  onError,
}: CategoryCardProps) {
  const { credentials } = useAuth();
  const [name, setName] = useState("");

  async function handleAdd() {
    if (!credentials || name.trim().length < 2) {
      onError("Category name must be at least 2 characters.");
      return;
    }
    try {
      await createCategory(
        { name: name.trim() },
        credentials.username,
        credentials.password,
      );
      setName("");
      await onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <article className="card">
      <h3>Categories</h3>
      <ul className="simple-list">
        {categories.map((item) => (
          <li key={item.id}>
            <span>{item.name}</span>
            <span className={item.isActive ? "tag-active" : "tag-inactive"}>
              {item.isActive ? "active" : "inactive"}
            </span>
          </li>
        ))}
      </ul>
      <div className="row controls" style={{ marginTop: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
        />
        <button onClick={() => void handleAdd()}>Add</button>
      </div>
    </article>
  );
}
