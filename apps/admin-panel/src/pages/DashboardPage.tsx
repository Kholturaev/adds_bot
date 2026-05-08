import { useEffect, useMemo, useState } from "react";
import { Topbar } from "../components/Topbar";
import { fetchAds } from "../api";
import { useAuth } from "../contexts/AuthContext";
import type { AdListItem } from "../types";
import { getErrorMessage } from "../utils/format";

export function DashboardPage() {
  const { credentials } = useAuth();
  const [ads, setAds] = useState<AdListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!credentials) return;
    setLoading(true);
    void fetchAds(credentials.username, credentials.password, { today: true })
      .then(setAds)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [credentials]);

  const stats = useMemo(
    () => ({
      pending: ads.filter((a) => a.status === "PENDING_APPROVAL").length,
      approved: ads.filter((a) => a.status === "APPROVED").length,
      rejected: ads.filter((a) => a.status === "REJECTED").length,
      published: ads.filter(
        (a) =>
          a.status === "PUBLISHED_PARTIAL" || a.status === "PUBLISHED_COMPLETE",
      ).length,
    }),
    [ads],
  );

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Today's moderation snapshot."
        loading={loading}
        error={error}
        onClearError={() => setError("")}
      />
      <section className="cards-grid">
        <article className="card stat">
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </article>
        <article className="card stat">
          <h3>Approved</h3>
          <p>{stats.approved}</p>
        </article>
        <article className="card stat">
          <h3>Rejected</h3>
          <p>{stats.rejected}</p>
        </article>
        <article className="card stat">
          <h3>Published</h3>
          <p>{stats.published}</p>
        </article>
      </section>
    </>
  );
}
