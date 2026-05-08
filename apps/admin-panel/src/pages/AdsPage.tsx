import { useCallback, useEffect, useState } from "react";
import { AdDetailPanel } from "../components/ads/AdDetailPanel";
import { AdList } from "../components/ads/AdList";
import { Topbar } from "../components/Topbar";
import { fetchAdDetail, fetchAds } from "../api";
import { useAuth } from "../contexts/AuthContext";
import type { AdDetail, AdListItem } from "../types";
import { getErrorMessage } from "../utils/format";

export function AdsPage() {
  const { credentials } = useAuth();

  const [ads, setAds] = useState<AdListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [onlyToday, setOnlyToday] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedAdId, setSelectedAdId] = useState("");
  const [adDetail, setAdDetail] = useState<AdDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");

  const loadAds = useCallback(async () => {
    if (!credentials) return;
    setLoading(true);
    try {
      const data = await fetchAds(credentials.username, credentials.password, {
        status: statusFilter || undefined,
        today: onlyToday,
      });
      setAds(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [credentials, statusFilter, onlyToday]);

  const loadDetail = useCallback(
    async (adId: string) => {
      if (!credentials || !adId) return;
      setDetailLoading(true);
      try {
        const data = await fetchAdDetail(
          adId,
          credentials.username,
          credentials.password,
        );
        setAdDetail(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setDetailLoading(false);
      }
    },
    [credentials],
  );

  useEffect(() => {
    void loadAds();
  }, [loadAds]);

  useEffect(() => {
    void loadDetail(selectedAdId);
  }, [loadDetail, selectedAdId]);

  function handleSelectAd(id: string) {
    setSelectedAdId(id);
    setAdDetail(null); // clear stale detail immediately
  }

  async function handleActionComplete() {
    await loadAds();
    if (selectedAdId) await loadDetail(selectedAdId);
  }

  return (
    <>
      <Topbar
        title="Ads Queue"
        subtitle="Review, moderate, and publish ads."
        loading={loading || detailLoading}
        error={error}
        onClearError={() => setError("")}
      />
      <section className="split-layout">
        <AdList
          ads={ads}
          selectedAdId={selectedAdId}
          statusFilter={statusFilter}
          onlyToday={onlyToday}
          onSelectAd={handleSelectAd}
          onStatusFilterChange={setStatusFilter}
          onOnlyTodayChange={setOnlyToday}
          onRefresh={() => void loadAds()}
        />
        <AdDetailPanel
          key={selectedAdId || "none"}
          detail={adDetail}
          adId={selectedAdId}
          onActionComplete={() => void handleActionComplete()}
          onError={setError}
        />
      </section>
    </>
  );
}
