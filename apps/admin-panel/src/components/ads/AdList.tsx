import type { AdListItem } from "../../types";
import { formatDate } from "../../utils/format";

type AdListProps = {
  ads: AdListItem[];
  selectedAdId: string;
  statusFilter: string;
  onlyToday: boolean;
  onSelectAd: (id: string) => void;
  onStatusFilterChange: (value: string) => void;
  onOnlyTodayChange: (value: boolean) => void;
  onRefresh: () => void;
};

export function AdList({
  ads,
  selectedAdId,
  statusFilter,
  onlyToday,
  onSelectAd,
  onStatusFilterChange,
  onOnlyTodayChange,
  onRefresh,
}: AdListProps) {
  return (
    <article className="card">
      <div className="row controls">
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">All</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PUBLISHED_PARTIAL">PUBLISHED_PARTIAL</option>
            <option value="PUBLISHED_COMPLETE">PUBLISHED_COMPLETE</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlyToday}
            onChange={(e) => onOnlyTodayChange(e.target.checked)}
          />
          Today only
        </label>
        <button onClick={onRefresh}>Refresh</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Category</th>
              <th>Brand</th>
              <th>User</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {ads.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ textAlign: "center", color: "var(--text-muted)" }}
                >
                  No ads found.
                </td>
              </tr>
            ) : (
              ads.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onSelectAd(item.id)}
                  className={selectedAdId === item.id ? "selected" : ""}
                >
                  <td>
                    <span
                      className={`status-badge status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>{item.categoryName ?? "-"}</td>
                  <td>{item.brandName ?? "-"}</td>
                  <td>{item.telegramUsername ?? item.telegramUserId ?? "-"}</td>
                  <td>{formatDate(item.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
