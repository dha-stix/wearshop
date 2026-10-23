"use client";

import Icon from "@/components/ui/Icon";
import { markNotificationsRead } from "@/lib/firebase-actions";
import { formatDate } from "@/lib/config";

export default function NotificationsPanel({ notes, onOpenOrder }) {
  const unread = notes.filter((n) => !n.read);

  return (
    <section id="notifications" className="panel dash-notes" aria-label="Notifications">
      <div className="panel__head">
        <h2 className="title-sm">Notifications</h2>
        {unread.length > 0 && (
          <button type="button" className="link-btn" onClick={() => markNotificationsRead(unread.map((n) => n.id))}>
            Mark all read
          </button>
        )}
      </div>
      {notes.length === 0 ? (
        <p className="panel__body muted">Updates about your orders will appear here.</p>
      ) : (
        <ul className="notes">
          {notes.map((n, i) => (
            <li key={n.id} className={`note ${n.read ? "" : "note--unread"}`} style={{ animationDelay: `${Math.min(i, 8) * 0.05}s` }}>
              <span className="note__icon">
                <Icon name="truck" size={16} strokeWidth={2} />
              </span>
              <div className="note__body">
                <button type="button" className="note__title" onClick={() => onOpenOrder(n.orderId, n.id, n.read)}>
                  {n.title}
                </button>
                {n.body && <p>{n.body}</p>}
                <span className="note__time">{formatDate(n.createdAt, true)}</span>
              </div>
              {!n.read && <span className="note__dot" aria-label="Unread" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
