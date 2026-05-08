import { useCallback, useEffect, useState } from "react";
import { BrandCard } from "../components/catalog/BrandCard";
import { CategoryCard } from "../components/catalog/CategoryCard";
import { PlanCard } from "../components/catalog/PlanCard";
import { Topbar } from "../components/Topbar";
import { fetchBrands, fetchCategories, fetchPlans } from "../api";
import { useAuth } from "../contexts/AuthContext";
import type { Brand, Category, Plan } from "../types";
import { getErrorMessage } from "../utils/format";

export function CatalogPage() {
  const { credentials } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCatalog = useCallback(async () => {
    if (!credentials) return;
    setLoading(true);
    try {
      const [cats, brs, pls] = await Promise.all([
        fetchCategories(credentials.username, credentials.password),
        fetchBrands(credentials.username, credentials.password),
        fetchPlans(credentials.username, credentials.password),
      ]);
      setCategories(cats);
      setBrands(brs);
      setPlans(pls);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [credentials]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  return (
    <>
      <Topbar
        title="Catalog"
        subtitle="Manage categories, brands, and advertising plans."
        loading={loading}
        error={error}
        onClearError={() => setError("")}
      />
      <section className="cards-grid">
        <CategoryCard
          categories={categories}
          onChanged={loadCatalog}
          onError={setError}
        />
        <BrandCard
          brands={brands}
          categories={categories}
          onChanged={loadCatalog}
          onError={setError}
        />
        <PlanCard plans={plans} onChanged={loadCatalog} onError={setError} />
      </section>
    </>
  );
}
