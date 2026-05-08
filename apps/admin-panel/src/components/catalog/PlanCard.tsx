import { useState } from "react";
import { createPlan } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import type { Plan } from "../../types";
import { getErrorMessage } from "../../utils/format";

type PlanCardProps = {
  plans: Plan[];
  onChanged: () => Promise<void>;
  onError: (message: string) => void;
};

export function PlanCard({ plans, onChanged, onError }: PlanCardProps) {
  const { credentials } = useAuth();
  const [code, setCode] = useState("");
  const [titleUz, setTitleUz] = useState("");
  const [titleRu, setTitleRu] = useState("");
  const [price, setPrice] = useState(20000);
  const [totalPubs, setTotalPubs] = useState(1);

  async function handleAdd() {
    if (
      !credentials ||
      !code ||
      !titleUz ||
      !titleRu ||
      price <= 0 ||
      totalPubs <= 0
    ) {
      onError("Fill all plan fields with valid values.");
      return;
    }
    try {
      await createPlan(
        {
          code,
          titleUz,
          titleRu,
          priceUzs: price,
          totalPublications: totalPubs,
        },
        credentials.username,
        credentials.password,
      );
      setCode("");
      setTitleUz("");
      setTitleRu("");
      setPrice(20000);
      setTotalPubs(1);
      await onChanged();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <article className="card">
      <h3>Plans</h3>
      <ul className="simple-list">
        {plans.map((item) => (
          <li key={item.id}>
            <span>
              {item.code} — {item.titleUz}
            </span>
            <span className="text-muted">
              {item.priceUzs.toLocaleString()} UZS / {item.totalPublications}×
            </span>
          </li>
        ))}
      </ul>
      <div className="column controls" style={{ marginTop: 12 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code (e.g. one_time)"
        />
        <input
          value={titleUz}
          onChange={(e) => setTitleUz(e.target.value)}
          placeholder="Title UZ"
        />
        <input
          value={titleRu}
          onChange={(e) => setTitleRu(e.target.value)}
          placeholder="Title RU"
        />
        <div className="row controls">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            placeholder="Price (UZS)"
            style={{ flex: 1 }}
          />
          <input
            type="number"
            value={totalPubs}
            onChange={(e) => setTotalPubs(Number(e.target.value) || 1)}
            placeholder="Publications"
            style={{ flex: 1 }}
          />
        </div>
        <button onClick={() => void handleAdd()}>Add Plan</button>
      </div>
    </article>
  );
}
