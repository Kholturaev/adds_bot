import { useEffect, useState } from "react";
import { approveAd, deleteAd, publishAd, rejectAd, updateAd } from "../../api";
import { useAuth } from "../../contexts/AuthContext";
import type { AdDetail } from "../../types";
import {
  formatDate,
  getErrorMessage,
  stringifyValue,
} from "../../utils/format";

type AdDetailPanelProps = {
  detail: AdDetail | null;
  adId: string;
  onActionComplete: () => void;
  onError: (message: string) => void;
};

export function AdDetailPanel({
  detail,
  adId,
  onActionComplete,
  onError,
}: AdDetailPanelProps) {
  const { credentials } = useAuth();
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Sync local form state whenever a new ad detail loads
  useEffect(() => {
    setImageUrlDraft(detail?.image?.imageUrl ?? "");
    setRejectReason("");
  }, [detail]);

  if (!credentials) return null;

  if (!detail) {
    return (
      <article className="card">
        <p className="text-muted">
          Select an ad from the list to view details.
        </p>
      </article>
    );
  }

  const { ad, values, history, publicationEvents } = detail;
  const { username, password } = credentials;

  async function handleSaveImage() {
    if (!imageUrlDraft.trim()) return;
    try {
      await updateAd(
        adId,
        { imageUrl: imageUrlDraft.trim() },
        username,
        password,
      );
      onActionComplete();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function handleApprove() {
    try {
      await approveAd(adId, username, password);
      onActionComplete();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function handlePublish() {
    try {
      await publishAd(adId, username, password);
      onActionComplete();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function handleReject() {
    if (rejectReason.trim().length < 3) {
      onError("Reject reason must be at least 3 characters.");
      return;
    }
    try {
      await rejectAd(adId, rejectReason.trim(), username, password);
      setRejectReason("");
      onActionComplete();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await deleteAd(adId, username, password);
      onActionComplete();
    } catch (err) {
      onError(getErrorMessage(err));
    }
  }

  return (
    <article className="card detail-panel">
      <h3>Ad Detail</h3>
      <p className="mono">ID: {ad.id}</p>

      <dl className="detail-list">
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`status-badge status-${ad.status.toLowerCase()}`}>
              {ad.status}
            </span>
          </dd>
        </div>
        <div>
          <dt>Plan</dt>
          <dd>{ad.planTitleUz ?? "-"}</dd>
        </div>
        <div>
          <dt>User</dt>
          <dd>{ad.telegramUsername ?? ad.telegramUserId ?? "-"}</dd>
        </div>
        <div>
          <dt>Phone</dt>
          <dd>{ad.phoneNumber ?? "-"}</dd>
        </div>
        <div>
          <dt>Remaining</dt>
          <dd>{ad.remainingPublications}</dd>
        </div>
      </dl>

      <h4>Fields</h4>
      <ul className="field-list">
        {values.map((field) => (
          <li key={field.fieldDefinitionId}>
            <strong>{field.labelUz}</strong>
            <span>
              {field.valueText ??
                field.valueNumber ??
                stringifyValue(field.valueJson)}
            </span>
          </li>
        ))}
      </ul>

      <h4>Image</h4>
      {detail.image?.imageUrl && (
        <img
          src={detail.image.imageUrl}
          alt="Ad preview"
          className="ad-image-preview"
        />
      )}
      <div className="row controls">
        <input
          value={imageUrlDraft}
          onChange={(e) => setImageUrlDraft(e.target.value)}
          placeholder="Image URL"
          style={{ flex: 1 }}
        />
        <button onClick={() => void handleSaveImage()}>Save</button>
      </div>

      <h4>Moderation</h4>
      <div className="action-grid">
        <button onClick={() => void handleApprove()}>Approve</button>

        <button onClick={() => void handlePublish()}>Publish</button>

        <div className="row controls">
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reject reason (min 3 chars)"
            style={{ flex: 1 }}
          />
          <button className="warn" onClick={() => void handleReject()}>
            Reject
          </button>
        </div>

        <button className="danger" onClick={() => void handleDelete()}>
          Delete
        </button>
      </div>

      {publicationEvents.length > 0 && (
        <>
          <h4>Publications ({publicationEvents.length})</h4>
          <ul className="simple-list">
            {publicationEvents.map((ev) => (
              <li key={ev.id}>
                <span>{formatDate(ev.publishedAt)} published</span>
                <span>left: {ev.remainingPublicationsAfter}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h4>Status history</h4>
      <ul className="simple-list">
        {history.map((h) => (
          <li key={h.id}>
            <span>
              {h.fromStatus} → {h.toStatus}
              {h.reason ? ` (${h.reason})` : ""}
            </span>
            <span>{formatDate(h.createdAt)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
